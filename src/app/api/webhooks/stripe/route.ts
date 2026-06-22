import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { getStripe } from '@/lib/stripe';
import { requireServerEnv } from '@/lib/env/server';

export async function POST(req: NextRequest) {
    const payload = await req.text();
    const signature = req.headers.get('stripe-signature');
    if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

    let event: Stripe.Event;
    try {
        event = getStripe().webhooks.constructEvent(payload, signature, requireServerEnv('STRIPE_WEBHOOK_SECRET'));
    } catch {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const supabaseAdmin = createAdminSupabaseClient();
    const { data: existing } = await supabaseAdmin
        .from('webhook_events')
        .select('processed_at')
        .eq('provider', 'stripe')
        .eq('provider_event_id', event.id)
        .maybeSingle();
    if (existing?.processed_at) return NextResponse.json({ received: true, duplicate: true });

    if (!existing) {
        await supabaseAdmin.from('webhook_events').insert({
            provider: 'stripe', provider_event_id: event.id, event_type: event.type, payload: event,
        });
    }

    try {
        if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
            const session = event.data.object as Stripe.Checkout.Session;
            const invoiceId = session.metadata?.invoice_id;
            if (session.payment_status !== 'paid' || !invoiceId || session.amount_total === null || !session.currency) {
                throw new Error('Stripe checkout session is missing verified payment data');
            }

            const { data: invoice } = await supabaseAdmin
                .from('invoices')
                .select('id, amount, currency, stripe_session_id, status')
                .eq('id', invoiceId)
                .eq('stripe_session_id', session.id)
                .single();
            if (!invoice) throw new Error('Stripe session is not linked to an invoice');
            if (Math.round(Number(invoice.amount) * 100) !== session.amount_total
                || invoice.currency.toLowerCase() !== session.currency.toLowerCase()) {
                throw new Error('Stripe amount or currency does not match the invoice');
            }

            if (invoice.status !== 'paid') {
                const now = new Date().toISOString();
                const { error } = await supabaseAdmin.from('invoices').update({
                    status: 'paid',
                    paid_at: now,
                    stripe_payment_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
                    payment_intent_score: 100,
                    payment_gateway: 'stripe',
                    updated_at: now,
                }).eq('id', invoice.id).eq('stripe_session_id', session.id).neq('status', 'paid');
                if (error) throw error;
            }
        }

        await supabaseAdmin.from('webhook_events').update({ processed_at: new Date().toISOString() })
            .eq('provider', 'stripe').eq('provider_event_id', event.id);
        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Stripe webhook processing failed:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
