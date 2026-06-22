import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/server';
import { getRazorpay } from '@/lib/razorpay';
import { serverEnv, requireServerEnv } from '@/lib/env/server';
import crypto from 'crypto';

// POST /api/billing/upgrade — Create Razorpay order for Pro plan subscription
export async function POST(req: NextRequest) {
    try {
        const { supabase, user, response } = await requireUser();
        if (!user) return response!;

        const body = await req.json();
        const { plan = 'pro', billing = 'monthly' } = body;

        // Pricing
        const prices: Record<string, Record<string, number>> = {
            pro: { monthly: 499, annual: 399 },
            agency: { monthly: 1499, annual: 1199 },
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

        const { error: orderError } = await supabase.from('billing_orders').insert({
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
            keyId: serverEnv.RAZORPAY_KEY_ID,
            plan,
            billing,
            displayPrice: `₹${totalAmount}`,
        });
    } catch (err: unknown) {
        console.error('Upgrade order error:', err);
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to create upgrade order' }, { status: 500 });
    }
}

// PATCH /api/billing/upgrade — Verify payment and activate plan
export async function PATCH(req: NextRequest) {
    try {
        const { supabase, user, response } = await requireUser();
        if (!user) return response!;

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json({ error: 'Missing payment data' }, { status: 400 });
        }

        const expected = crypto
            .createHmac('sha256', requireServerEnv('RAZORPAY_KEY_SECRET'))
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (expected !== razorpay_signature) {
            return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
        }

        const { data: billingOrder } = await supabase
            .from('billing_orders')
            .select('*')
            .eq('user_id', user.id)
            .eq('razorpay_order_id', razorpay_order_id)
            .single();
        if (!billingOrder) return NextResponse.json({ error: 'Billing order not found' }, { status: 404 });
        if (billingOrder.status === 'paid') {
            return NextResponse.json({ success: true, alreadyProcessed: true, plan: billingOrder.plan });
        }

        const remoteOrder = await getRazorpay().orders.fetch(razorpay_order_id);
        if (remoteOrder.status !== 'paid'
            || Number(remoteOrder.amount_paid) !== Number(billingOrder.amount)
            || remoteOrder.currency !== billingOrder.currency) {
            return NextResponse.json({ error: 'Payment amount or status does not match the billing order' }, { status: 400 });
        }

        const plan = billingOrder.plan;
        const billing = billingOrder.billing_cycle;

        // Activate plan
        const now = new Date();
        const months = billing === 'annual' ? 12 : 1;
        const expiresAt = new Date(now);
        expiresAt.setMonth(expiresAt.getMonth() + months);

        const { error: activateError } = await supabase
            .from('users')
            .update({
                subscription_plan: plan || 'pro',
                plan_started_at: now.toISOString(),
                plan_expires_at: expiresAt.toISOString(),
                updated_at: now.toISOString(),
            })
            .eq('id', user.id);
        if (activateError) throw activateError;

        await supabase.from('billing_orders').update({
            status: 'paid',
            razorpay_payment_id,
            paid_at: now.toISOString(),
        }).eq('id', billingOrder.id).eq('status', 'created');

        return NextResponse.json({
            success: true,
            plan: plan || 'pro',
            expiresAt: expiresAt.toISOString(),
            message: `Welcome to Flowcent ${(plan || 'pro').charAt(0).toUpperCase() + (plan || 'pro').slice(1)}!`,
        });
    } catch (err: unknown) {
        console.error('Upgrade verification error:', err);
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to activate plan' }, { status: 500 });
    }
}
