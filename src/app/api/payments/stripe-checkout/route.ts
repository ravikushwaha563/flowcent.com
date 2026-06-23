import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { publicEnv } from '@/lib/env/public';
import { createPaymentSchema } from '@/lib/validations/domain';
import { claimInvoiceCheckout, completeInvoiceCheckout, releaseInvoiceCheckout } from '@/lib/payments/checkout-claim';
import { consumeRateLimit, rateLimitResponse } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
    let claimedInvoiceId: string | null = null;
    let claimToken: string | null = null;
    try {
        const parsed = createPaymentSchema.safeParse(await req.json());
        if (!parsed.success) return NextResponse.json({ error: 'Invalid payment link' }, { status: 400 });
        const { publicToken } = parsed.data;

        const supabaseAdmin = createAdminSupabaseClient();
        if (!await consumeRateLimit(supabaseAdmin, 'stripe-checkout', publicToken, 10, 300)) {
            return rateLimitResponse(300);
        }
        const stripe = getStripe();
        const { data: invoice, error } = await supabaseAdmin
            .from('invoices')
            .select('*, clients(name, email, company)')
            .eq('public_token', publicToken)
            .single();

        if (error || !invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        if (invoice.status !== 'pending') {
            return NextResponse.json({ error: invoice.status === 'paid' ? 'Invoice is already paid' : 'Invoice is cancelled' }, { status: 409 });
        }
        if (invoice.currency === 'INR') {
            return NextResponse.json({ error: 'Stripe checkout is available only for non-INR invoices' }, { status: 400 });
        }

        const appUrl = publicEnv.appUrl;

        if (invoice.stripe_session_id) {
            const existingSession = await stripe.checkout.sessions.retrieve(invoice.stripe_session_id);
            if (existingSession.payment_status === 'paid') {
                return NextResponse.json({ error: 'Payment is already processing. Refresh this invoice shortly.' }, { status: 409 });
            }
            const expectedAmount = Math.round(Number(invoice.amount) * 100);
            if (existingSession.status === 'open'
                && existingSession.amount_total === expectedAmount
                && existingSession.currency?.toUpperCase() === invoice.currency
                && existingSession.url) {
                return NextResponse.json({ url: existingSession.url });
            }
            if (existingSession.status === 'open') await stripe.checkout.sessions.expire(existingSession.id);
        }

        claimToken = await claimInvoiceCheckout(supabaseAdmin, invoice.id);
        if (!claimToken) {
            return NextResponse.json({ error: 'Checkout is already being prepared. Please retry shortly.' }, { status: 409 });
        }
        claimedInvoiceId = invoice.id;

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
        if (!session.url) throw new Error('Stripe did not return a checkout URL');

        // Store session ID
        const linkedInvoice = await completeInvoiceCheckout(supabaseAdmin, invoice.id, claimToken, {
            stripe_session_id: session.id,
            payment_gateway: 'stripe',
        });
        if (!linkedInvoice) {
            await stripe.checkout.sessions.expire(session.id);
            await releaseInvoiceCheckout(supabaseAdmin, invoice.id, claimToken);
            claimToken = null;
            return NextResponse.json({ error: 'Invoice is no longer payable' }, { status: 409 });
        }
        claimToken = null;

        return NextResponse.json({ url: session.url });
    } catch (err: unknown) {
        console.error('Stripe checkout error:', err);
        if (claimedInvoiceId && claimToken) {
            await releaseInvoiceCheckout(createAdminSupabaseClient(), claimedInvoiceId, claimToken);
        }
        return NextResponse.json({ error: 'Failed to create Stripe session' }, { status: 500 });
    }
}
