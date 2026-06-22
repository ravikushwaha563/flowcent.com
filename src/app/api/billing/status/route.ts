import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { getPlanLimits, PlanType } from '@/lib/plan-limits';

// GET /api/billing/status — Returns current plan, usage, and limits
export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userInfo = verifyToken(authHeader.substring(7));
        if (!userInfo) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        // Fetch user
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('subscription_plan, plan_started_at, plan_expires_at, invoice_count_this_month, ai_usage_this_month, usage_reset_at')
            .eq('id', userInfo.userId)
            .single();

        if (error || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if usage needs monthly reset
        const resetAt = user.usage_reset_at ? new Date(user.usage_reset_at) : new Date(0);
        const now = new Date();
        const needsReset = now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear();

        if (needsReset) {
            await supabaseAdmin
                .from('users')
                .update({
                    invoice_count_this_month: 0,
                    ai_usage_this_month: 0,
                    usage_reset_at: now.toISOString(),
                })
                .eq('id', userInfo.userId);
            user.invoice_count_this_month = 0;
            user.ai_usage_this_month = 0;
        }

        const plan = (user.subscription_plan || 'free') as PlanType;
        const limits = getPlanLimits(plan);

        // Count actual clients
        const { count: clientCount } = await supabaseAdmin
            .from('clients')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userInfo.userId);

        // Check if plan is expired
        const isExpired = user.plan_expires_at && new Date(user.plan_expires_at) < now;
        const activePlan = isExpired ? 'free' : plan;
        const activeLimits = isExpired ? getPlanLimits('free') : limits;

        return NextResponse.json({
            plan: activePlan,
            planLabel: activeLimits.label,
            price: activeLimits.price,
            startedAt: user.plan_started_at,
            expiresAt: user.plan_expires_at,
            isExpired: !!isExpired,
            usage: {
                invoices: { used: user.invoice_count_this_month, limit: activeLimits.maxInvoices },
                clients: { used: clientCount || 0, limit: activeLimits.maxClients },
                aiAnalyses: { used: user.ai_usage_this_month, limit: activeLimits.maxAiAnalyses },
            },
            features: {
                autoFollowups: activeLimits.autoFollowups,
                csvExport: activeLimits.csvExport,
                advancedAnalytics: activeLimits.advancedAnalytics,
            },
        });
    } catch (err: any) {
        console.error('Billing status error:', err);
        return NextResponse.json({ error: 'Failed to get billing status' }, { status: 500 });
    }
}
