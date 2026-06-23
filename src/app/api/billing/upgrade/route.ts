import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/server';
import { getRazorpay } from '@/lib/razorpay';
import { requireServerEnv } from '@/lib/env/server';
import { z } from 'zod';
import { verifyRazorpaySignature } from '@/lib/payments/razorpay-signature';
import { activateBillingOrder } from '@/lib/billing/activate';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

const upgradeSchema = z.object({
    plan: z.literal('pro').default('pro'),
    billing: z.enum(['monthly', 'annual']).default('monthly'),
});

const verificationSchema = z.object({
    razorpay_order_id: z.string().min(1),
    razorpay_payment_id: z.string().min(1),
    razorpay_signature: z.string().regex(/^[a-f0-9]{64}$/i),
});

// POST /api/billing/upgrade — Create Razorpay order for Pro plan subscription
export async function POST(req: NextRequest) {
    try {
        const { user, response } = await requireUser();
        if (!user) return response!;

        const parsed = upgradeSchema.safeParse(await req.json());
        if (!parsed.success) return NextResponse.json({ error: 'Invalid plan or billing cycle' }, { status: 400 });
        const { plan, billing } = parsed.data;

        // Pricing
        const prices: Record<string, Record<string, number>> = {
            pro: { monthly: 499, annual: 399 },
        };

        const price = prices[plan]?.[billing];
        if (!price) {
            return NextResponse.json({ error: 'Invalid plan or billing cycle' }, { status: 400 });
        }

        const months = billing === 'annual' ? 12 : 1;
        const totalAmount = price * months;

        // Create Razorpay order
        const order = await getRazorpay().orders.create({
            amount: totalAmount * 100, // paise
            currency: 'INR',
            receipt: `flowcent_${plan}_${user.id.slice(0, 8)}`,
            notes: {
                user_id: user.id,
                plan,
                billing,
                months: String(months),
            },
        });

        const { error: orderError } = await createAdminSupabaseClient().from('billing_orders').insert({
            user_id: user.id,
            razorpay_order_id: order.id,
            plan,
            billing_cycle: billing,
            amount: totalAmount * 100,
            currency: 'INR',
            status: 'created',
        });
        if (orderError) throw new Error('Failed to persist billing order');

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: requireServerEnv('RAZORPAY_KEY_ID'),
            plan,
            billing,
            displayPrice: `₹${totalAmount}`,
        });
    } catch (err: unknown) {
        console.error('Upgrade order error:', err);
        return NextResponse.json({ error: 'Failed to create upgrade order' }, { status: 500 });
    }
}

// PATCH /api/billing/upgrade — Verify payment and activate plan
export async function PATCH(req: NextRequest) {
    try {
        const { supabase, user, response } = await requireUser();
        if (!user) return response!;

        const parsed = verificationSchema.safeParse(await req.json());
        if (!parsed.success) return NextResponse.json({ error: 'Invalid payment data' }, { status: 400 });
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

        if (!verifyRazorpaySignature({
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
            secret: requireServerEnv('RAZORPAY_KEY_SECRET'),
        })) {
            return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
        }

        const { data: billingOrder } = await supabase
            .from('billing_orders')
            .select('*')
            .eq('user_id', user.id)
            .eq('razorpay_order_id', razorpay_order_id)
            .single();
        if (!billingOrder) return NextResponse.json({ error: 'Billing order not found' }, { status: 404 });
        if (billingOrder.status === 'paid') return NextResponse.json({ success: true, alreadyProcessed: true, plan: billingOrder.plan });

        const remoteOrder = await getRazorpay().orders.fetch(razorpay_order_id);
        if (remoteOrder.status !== 'paid'
            || Number(remoteOrder.amount_paid) !== Number(billingOrder.amount)
            || remoteOrder.currency !== billingOrder.currency) {
            return NextResponse.json({ error: 'Payment amount or status does not match the billing order' }, { status: 400 });
        }

        const activation = await activateBillingOrder(createAdminSupabaseClient(), razorpay_order_id, razorpay_payment_id);

        return NextResponse.json({
            success: true,
            plan: activation.plan,
            expiresAt: activation.expiresAt,
            message: 'Welcome to Flowcent Pro!',
        });
    } catch (err: unknown) {
        console.error('Upgrade verification error:', err);
        return NextResponse.json({ error: 'Failed to activate plan' }, { status: 500 });
    }
}
