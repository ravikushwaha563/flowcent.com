import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { requireServerEnv } from '@/lib/env/server';
import { getRazorpay } from '@/lib/razorpay';
import { verifyRazorpayPaymentSchema } from '@/lib/validations/domain';
import { verifyRazorpaySignature } from '@/lib/payments/razorpay-signature';

export async function POST(req: NextRequest) {
    try {
        const parsed = verifyRazorpayPaymentSchema.safeParse(await req.json());
        if (!parsed.success) return NextResponse.json({ error: 'Invalid payment verification data' }, { status: 400 });
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, publicToken } = parsed.data;

        const supabaseAdmin = createAdminSupabaseClient();
        if (!verifyRazorpaySignature({
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
            secret: requireServerEnv('RAZORPAY_KEY_SECRET'),
        })) {
            return NextResponse.json({ error: 'Invalid payment signature — possible fraud' }, { status: 400 });
        }

        const { data: targetInvoice } = await supabaseAdmin
            .from('invoices')
            .select('id, amount, currency, status, razorpay_order_id')
            .eq('public_token', publicToken)
            .eq('razorpay_order_id', razorpay_order_id)
            .single();
        if (!targetInvoice) return NextResponse.json({ error: 'Payment does not belong to this invoice' }, { status: 400 });
        if (targetInvoice.status === 'paid') return NextResponse.json({ success: true, alreadyProcessed: true });

        const payment = await getRazorpay().payments.fetch(razorpay_payment_id);
        const expectedAmount = Math.round(Number(targetInvoice.amount) * 100);
        if (payment.order_id !== razorpay_order_id
            || Number(payment.amount) !== expectedAmount
            || payment.currency !== targetInvoice.currency
            || !['authorized', 'captured'].includes(payment.status)) {
            return NextResponse.json({ error: 'Payment details do not match the invoice' }, { status: 400 });
        }

        // Payment is verified — mark invoice as paid
        const now = new Date().toISOString();
        const { data: invoice, error } = await supabaseAdmin
            .from('invoices')
            .update({
                status: 'paid',
                paid_at: now,
                razorpay_payment_id,
                payment_intent_score: 100,
                updated_at: now,
            })
            .eq('id', targetInvoice.id)
            .eq('razorpay_order_id', razorpay_order_id)
            .neq('status', 'paid')
            .select('*, clients(id, name, email)')
            .single();

        if (error) {
            console.error('Failed to update invoice after payment:', error);
            return NextResponse.json({ error: 'Payment verified but failed to update invoice' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Payment verified and invoice marked as paid',
            status: invoice.status,
        });
    } catch (err: unknown) {
        console.error('Payment verification error:', err);
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Payment verification failed' }, { status: 500 });
    }
}
