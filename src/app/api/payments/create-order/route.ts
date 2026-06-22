import { NextRequest, NextResponse } from 'next/server';
import razorpay from '@/lib/razorpay';
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

        // Create Razorpay order
        const amountInPaise = Math.round(invoice.amount * 100);
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
        await supabaseAdmin
            .from('invoices')
            .update({ razorpay_order_id: order.id, updated_at: new Date().toISOString() })
            .eq('id', invoiceId);

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
            invoice: {
                id: invoice.id,
                invoice_number: invoice.invoice_number,
                client_name: invoice.clients?.name,
                client_email: invoice.clients?.email,
            },
        });
    } catch (err: any) {
        console.error('Razorpay create-order error:', err);
        return NextResponse.json({ error: err.message || 'Failed to create payment order' }, { status: 500 });
    }
}
