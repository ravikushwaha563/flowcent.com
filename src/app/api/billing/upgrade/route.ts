import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import razorpay from '@/lib/razorpay';

// POST /api/billing/upgrade — Create Razorpay order for Pro plan subscription
export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userInfo = verifyToken(authHeader.substring(7));
        if (!userInfo) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

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
        const order = await razorpay.orders.create({
            amount: totalAmount * 100, // paise
            currency: 'INR',
            receipt: `flowcent_${plan}_${userInfo.userId.slice(0, 8)}`,
            notes: {
                user_id: userInfo.userId,
                plan,
                billing,
                months: String(months),
            },
        });

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
            plan,
            billing,
            displayPrice: `₹${totalAmount}`,
        });
    } catch (err: any) {
        console.error('Upgrade order error:', err);
        return NextResponse.json({ error: err.message || 'Failed to create upgrade order' }, { status: 500 });
    }
}

// PATCH /api/billing/upgrade — Verify payment and activate plan
export async function PATCH(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userInfo = verifyToken(authHeader.substring(7));
        if (!userInfo) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, billing } = await req.json();

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json({ error: 'Missing payment data' }, { status: 400 });
        }

        // Verify signature
        const crypto = require('crypto');
        const expected = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (expected !== razorpay_signature) {
            return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
        }

        // Activate plan
        const now = new Date();
        const months = billing === 'annual' ? 12 : 1;
        const expiresAt = new Date(now);
        expiresAt.setMonth(expiresAt.getMonth() + months);

        await supabaseAdmin
            .from('users')
            .update({
                subscription_plan: plan || 'pro',
                plan_started_at: now.toISOString(),
                plan_expires_at: expiresAt.toISOString(),
                updated_at: now.toISOString(),
            })
            .eq('id', userInfo.userId);

        return NextResponse.json({
            success: true,
            plan: plan || 'pro',
            expiresAt: expiresAt.toISOString(),
            message: `Welcome to Flowcent ${(plan || 'pro').charAt(0).toUpperCase() + (plan || 'pro').slice(1)}!`,
        });
    } catch (err: any) {
        console.error('Upgrade verification error:', err);
        return NextResponse.json({ error: err.message || 'Failed to activate plan' }, { status: 500 });
    }
}
