import { NextRequest, NextResponse } from 'next/server';
import { getRazorpay } from '@/lib/razorpay';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { serverEnv } from '@/lib/env/server';
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
        if (!await consumeRateLimit(supabaseAdmin, 'razorpay-checkout', publicToken, 10, 300)) {
            return rateLimitResponse(300);
        }
        const razorpay = getRazorpay();
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
        if (invoice.currency !== 'INR') {
            return NextResponse.json({ error: 'Razorpay checkout is available only for INR invoices' }, { status: 400 });
        }

        const amountInPaise = Math.round(invoice.amount * 100);
        if (invoice.razorpay_order_id) {
            const existingOrder = await razorpay.orders.fetch(invoice.razorpay_order_id);
            if (existingOrder.status === 'paid') {
                return NextResponse.json({ error: 'Payment is already processing. Refresh this invoice shortly.' }, { status: 409 });
            }
            if (Number(existingOrder.amount) === amountInPaise
                && existingOrder.currency === (invoice.currency || 'INR')) {
                return NextResponse.json({
                    orderId: existingOrder.id,
                    amount: existingOrder.amount,
                    currency: existingOrder.currency,
                    keyId: serverEnv.RAZORPAY_KEY_ID,
                    invoice: {
                        invoice_number: invoice.invoice_number,
                        client_name: invoice.clients?.name,
                        client_email: invoice.clients?.email,
                    },
                });
            }
        }

        claimToken = await claimInvoiceCheckout(supabaseAdmin, invoice.id);
        if (!claimToken) {
            return NextResponse.json({ error: 'Checkout is already being prepared. Please retry shortly.' }, { status: 409 });
        }
        claimedInvoiceId = invoice.id;

        const order = await razorpay.orders.create({
            amount: amountInPaise,
            currency: invoice.currency || 'INR',
            receipt: invoice.invoice_number,
            notes: {
                invoice_id: invoice.id,
                invoice_number: invoice.invoice_number,
                client_name: invoice.clients?.name || '',
                client_email: invoice.clients?.email || '',
            },
        });

        // Store the order ID on the invoice for verification later
        const linkedInvoice = await completeInvoiceCheckout(supabaseAdmin, invoice.id, claimToken, {
            razorpay_order_id: order.id,
            payment_gateway: 'razorpay',
        });
        if (!linkedInvoice) {
            await releaseInvoiceCheckout(supabaseAdmin, invoice.id, claimToken);
            claimToken = null;
            return NextResponse.json({ error: 'Invoice is no longer payable' }, { status: 409 });
        }
        claimToken = null;

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: serverEnv.RAZORPAY_KEY_ID,
            invoice: {
                invoice_number: invoice.invoice_number,
                client_name: invoice.clients?.name,
                client_email: invoice.clients?.email,
            },
        });
    } catch (err: unknown) {
        console.error('Razorpay create-order error:', err);
        if (claimedInvoiceId && claimToken) {
            await releaseInvoiceCheckout(createAdminSupabaseClient(), claimedInvoiceId, claimToken);
        }
        return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
    }
}
