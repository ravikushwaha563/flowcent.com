import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { requireServerEnv } from '@/lib/env/server';
import { verifyRazorpayWebhookSignature } from '@/lib/payments/razorpay-signature';
import { activateBillingOrder } from '@/lib/billing/activate';

const webhookSchema = z.object({
    event: z.string(),
    payload: z.object({
        payment: z.object({
            entity: z.object({
                id: z.string(),
                order_id: z.string(),
                amount: z.number(),
                currency: z.string(),
                status: z.string(),
                notes: z.record(z.string(), z.unknown()).optional(),
            }),
        }),
    }),
});

export async function POST(req: NextRequest) {
    const payload = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    if (!signature || !verifyRazorpayWebhookSignature(payload, signature, requireServerEnv('RAZORPAY_WEBHOOK_SECRET'))) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    let decoded: unknown;
    try {
        decoded = JSON.parse(payload);
    } catch {
        return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }
    const parsed = webhookSchema.safeParse(decoded);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
    const event = parsed.data;
    const eventId = req.headers.get('x-razorpay-event-id') || crypto.createHash('sha256').update(payload).digest('hex');
    const supabaseAdmin = createAdminSupabaseClient();

    const { data: existing } = await supabaseAdmin.from('webhook_events').select('processed_at')
        .eq('provider', 'razorpay').eq('provider_event_id', eventId).maybeSingle();
    if (existing?.processed_at) return NextResponse.json({ received: true, duplicate: true });
    if (!existing) {
        await supabaseAdmin.from('webhook_events').insert({
            provider: 'razorpay', provider_event_id: eventId, event_type: event.event, payload: event,
        });
    }

    try {
        if (event.event === 'payment.captured' || event.event === 'order.paid') {
            const payment = event.payload.payment.entity;
            if (payment.status !== 'captured') throw new Error('Razorpay payment is not captured');
            const invoiceId = typeof payment.notes?.invoice_id === 'string' ? payment.notes.invoice_id : null;
            const userId = typeof payment.notes?.user_id === 'string' ? payment.notes.user_id : null;

            if (invoiceId) {
                const { data: invoice } = await supabaseAdmin.from('invoices')
                    .select('id, amount, currency, razorpay_order_id, status')
                    .eq('id', invoiceId).eq('razorpay_order_id', payment.order_id).single();
                if (!invoice) throw new Error('Razorpay order is not linked to an invoice');
                if (Math.round(Number(invoice.amount) * 100) !== payment.amount || invoice.currency !== payment.currency) {
                    throw new Error('Razorpay amount or currency does not match the invoice');
                }

                if (invoice.status !== 'paid') {
                    const now = new Date().toISOString();
                    const { error } = await supabaseAdmin.from('invoices').update({
                        status: 'paid', paid_at: now, razorpay_payment_id: payment.id,
                        payment_intent_score: 100, payment_gateway: 'razorpay', updated_at: now,
                    }).eq('id', invoice.id).eq('razorpay_order_id', payment.order_id).neq('status', 'paid');
                    if (error) throw error;
                }
            } else if (userId) {
                const { data: billingOrder } = await supabaseAdmin.from('billing_orders')
                    .select('amount, currency, user_id')
                    .eq('razorpay_order_id', payment.order_id).eq('user_id', userId).single();
                if (!billingOrder || Number(billingOrder.amount) !== payment.amount || billingOrder.currency !== payment.currency) {
                    throw new Error('Razorpay amount or currency does not match the billing order');
                }
                await activateBillingOrder(supabaseAdmin, payment.order_id, payment.id);
            } else {
                throw new Error('Razorpay payment has no recognized owner');
            }
        }

        await supabaseAdmin.from('webhook_events').update({ processed_at: new Date().toISOString() })
            .eq('provider', 'razorpay').eq('provider_event_id', eventId);
        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Razorpay webhook processing failed:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
