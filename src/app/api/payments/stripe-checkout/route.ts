import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { invoiceId } = body;

        if (!invoiceId) {
            return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
        }

        // Fetch invoice details
        const { data: invoice, error } = await supabaseAdmin
            .from('invoices')
            .select('*, clients(id, name, email, company)')
            .eq('id', invoiceId)
            .single();

        if (error || !invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        if (invoice.status === 'paid') {
            return NextResponse.json({ error: 'Invoice is already paid' }, { status: 400 });
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: (invoice.currency || 'usd').toLowerCase(),
                        product_data: {
                            name: `Invoice ${invoice.invoice_number}`,
                            description: `Payment to ${invoice.clients?.company || invoice.clients?.name || 'Flowcent'}`,
                        },
                        unit_amount: Math.round(invoice.amount * 100), // Stripe uses cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${appUrl}/pay/${invoiceId}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${appUrl}/pay/${invoiceId}?payment=cancelled`,
            customer_email: invoice.clients?.email,
            metadata: {
                invoice_id: invoice.id,
                invoice_number: invoice.invoice_number,
            },
        });

        // Store session ID
        await supabaseAdmin
            .from('invoices')
            .update({
                stripe_session_id: session.id,
                payment_gateway: 'stripe',
                updated_at: new Date().toISOString(),
            })
            .eq('id', invoiceId);

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        console.error('Stripe checkout error:', err);
        return NextResponse.json({ error: err.message || 'Failed to create Stripe session' }, { status: 500 });
    }
}
