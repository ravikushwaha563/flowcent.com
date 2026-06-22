import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { sessionId, invoiceId } = body;

        if (!sessionId || !invoiceId) {
            return NextResponse.json({ error: 'Session ID and Invoice ID are required' }, { status: 400 });
        }

        // Retrieve the session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== 'paid') {
            return NextResponse.json({ error: 'Payment not completed', status: session.payment_status }, { status: 400 });
        }

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
            .eq('id', invoiceId)
            .select('*, clients(id, name, email)')
            .single();

        if (error) {
            console.error('Failed to update invoice after Stripe payment:', error);
            return NextResponse.json({ error: 'Payment verified but failed to update invoice' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Payment verified and invoice marked as paid',
            invoice,
        });
    } catch (err: any) {
        console.error('Stripe verify error:', err);
        return NextResponse.json({ error: err.message || 'Stripe verification failed' }, { status: 500 });
    }
}
