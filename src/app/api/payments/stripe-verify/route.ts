import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { verifyStripePaymentSchema } from '@/lib/validations/domain';

export async function POST(req: NextRequest) {
    try {
        const parsed = verifyStripePaymentSchema.safeParse(await req.json());
        if (!parsed.success) return NextResponse.json({ error: 'Invalid payment verification data' }, { status: 400 });
        const { sessionId, publicToken } = parsed.data;

        const stripe = getStripe();
        const supabaseAdmin = createAdminSupabaseClient();
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== 'paid') {
            return NextResponse.json({ error: 'Payment not completed', status: session.payment_status }, { status: 400 });
        }

        const { data: targetInvoice } = await supabaseAdmin
            .from('invoices')
            .select('id, status, stripe_session_id')
            .eq('public_token', publicToken)
            .eq('stripe_session_id', sessionId)
            .single();
        if (!targetInvoice) return NextResponse.json({ error: 'Stripe session does not match the invoice' }, { status: 400 });
        if (session.metadata?.invoice_id !== targetInvoice.id) {
            return NextResponse.json({ error: 'Stripe session does not belong to this invoice' }, { status: 400 });
        }
        if (targetInvoice.status === 'paid') return NextResponse.json({ success: true, alreadyProcessed: true });

        // Mark invoice as paid
        const now = new Date().toISOString();
        const { data: invoice, error } = await supabaseAdmin
            .from('invoices')
            .update({
                status: 'paid',
                paid_at: now,
                stripe_payment_id: session.payment_intent as string,
                payment_intent_score: 100,
                payment_gateway: 'stripe',
                updated_at: now,
            })
            .eq('id', targetInvoice.id)
            .eq('stripe_session_id', sessionId)
            .neq('status', 'paid')
            .select('*, clients(id, name, email)')
            .single();

        if (error) {
            console.error('Failed to update invoice after Stripe payment:', error);
            return NextResponse.json({ error: 'Payment verified but failed to update invoice' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Payment verified and invoice marked as paid',
            status: invoice.status,
        });
    } catch (err: unknown) {
        console.error('Stripe verify error:', err);
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Stripe verification failed' }, { status: 500 });
    }
}
