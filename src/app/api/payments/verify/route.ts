import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, invoiceId } = body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !invoiceId) {
            return NextResponse.json({ error: 'Missing payment verification data' }, { status: 400 });
        }

        // Verify the payment signature
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json({ error: 'Invalid payment signature — possible fraud' }, { status: 400 });
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
            .eq('id', invoiceId)
            .select('*, clients(id, name, email)')
            .single();

        if (error) {
            console.error('Failed to update invoice after payment:', error);
            return NextResponse.json({ error: 'Payment verified but failed to update invoice' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Payment verified and invoice marked as paid',
            invoice,
        });
    } catch (err: any) {
        console.error('Payment verification error:', err);
        return NextResponse.json({ error: err.message || 'Payment verification failed' }, { status: 500 });
    }
}
