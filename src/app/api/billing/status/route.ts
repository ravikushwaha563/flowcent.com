import { NextResponse } from 'next/server';
import { getPlanLimits, PlanType } from '@/lib/plan-limits';
import { requireUser } from '@/lib/auth/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

// GET /api/billing/status — Returns current plan, usage, and limits
export async function GET() {
    try {
        const { supabase, user: authUser, response } = await requireUser();
        if (!authUser) return response!;

        // Fetch user
        const { data: user, error } = await supabase
            .from('users')
            .select('subscription_plan, plan_started_at, plan_expires_at, invoice_count_this_month, ai_usage_this_month, usage_reset_at')
            .eq('id', authUser.id)
            .single();

        if (error || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if usage needs monthly reset
        const now = new Date();
        const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
        const resetAt = user.usage_reset_at ? new Date(user.usage_reset_at) : new Date(0);
        const needsReset = resetAt < monthStart;

        if (needsReset) {
            await createAdminSupabaseClient()
                .from('users')
                .update({
                    invoice_count_this_month: 0,
                    ai_usage_this_month: 0,
                    usage_reset_at: now.toISOString(),
                })
                .eq('id', authUser.id)
                .lt('usage_reset_at', monthStart.toISOString());
            user.invoice_count_this_month = 0;
            user.ai_usage_this_month = 0;
        }

        const plan = (user.subscription_plan || 'free') as PlanType;
        const limits = getPlanLimits(plan);

        // Count actual clients
        const { count: clientCount } = await supabase
            .from('clients')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', authUser.id);

        const { count: invoiceCount, error: invoiceCountError } = await supabase
            .from('invoices')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', authUser.id)
            .gte('created_at', monthStart.toISOString());
        if (invoiceCountError) throw invoiceCountError;

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
                invoices: { used: invoiceCount || 0, limit: activeLimits.maxInvoices, unlimited: activeLimits.maxInvoices === null },
                clients: { used: clientCount || 0, limit: activeLimits.maxClients, unlimited: activeLimits.maxClients === null },
                aiAnalyses: { used: user.ai_usage_this_month, limit: activeLimits.maxAiAnalyses, unlimited: activeLimits.maxAiAnalyses === null },
            },
            features: {
                autoFollowups: activeLimits.autoFollowups,
                csvExport: activeLimits.csvExport,
                advancedAnalytics: activeLimits.advancedAnalytics,
            },
        });
    } catch (err: unknown) {
        console.error('Billing status error:', err);
        return NextResponse.json({ error: 'Failed to get billing status' }, { status: 500 });
    }
}
