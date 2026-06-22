import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { publicEnv } from '@/lib/env/public';
import { createPaymentSchema } from '@/lib/validations/domain';

export async function POST(req: NextRequest) {
    try {
        const parsed = createPaymentSchema.safeParse(await req.json());
        if (!parsed.success) return NextResponse.json({ error: 'Invalid payment link' }, { status: 400 });
        const { publicToken } = parsed.data;

        const supabaseAdmin = createAdminSupabaseClient();
        const stripe = getStripe();
        const { data: invoice, error } = await supabaseAdmin
            .from('invoices')
            .select('*, clients(id, name, email, company)')
            .eq('public_token', publicToken)
            .single();

        if (error || !invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        if (invoice.status === 'paid') {
            return NextResponse.json({ error: 'Invoice is already paid' }, { status: 400 });
        }

        const appUrl = publicEnv.appUrl;

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
            success_url: `${appUrl}/pay/${publicToken}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${appUrl}/pay/${publicToken}?payment=cancelled`,
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
            .eq('id', invoice.id);

        return NextResponse.json({ url: session.url });
    } catch (err: unknown) {
        console.error('Stripe checkout error:', err);
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to create Stripe session' }, { status: 500 });
    }
}
