import { requireUser } from '@/lib/auth/server';

export async function GET() {
    const { supabase, user, response } = await requireUser();
    if (!user) return response!;

    const [profileResult, clientsResult, invoicesResult, promisesResult, followupsResult, billingResult] = await Promise.all([
        supabase.from('users').select('id, email, name, company_name, gmail_connected, gmail_email, subscription_plan, plan_started_at, plan_expires_at, invoice_count_this_month, ai_usage_this_month, usage_reset_at, created_at, updated_at').eq('id', user.id).single(),
        supabase.from('clients').select('*').eq('user_id', user.id).order('created_at'),
        supabase.from('invoices').select('*').eq('user_id', user.id).order('created_at'),
        supabase.from('promises').select('*').order('created_at'),
        supabase.from('followups').select('*').eq('user_id', user.id).order('sent_at'),
        supabase.from('billing_orders').select('id, plan, billing_cycle, amount, currency, status, created_at, paid_at').eq('user_id', user.id).order('created_at'),
    ]);

    const error = [profileResult, clientsResult, invoicesResult, promisesResult, followupsResult, billingResult]
        .find(result => result.error)?.error;
    if (error) return Response.json({ error: 'Failed to export account data' }, { status: 500 });

    const exportedAt = new Date().toISOString();
    const body = JSON.stringify({
        exported_at: exportedAt,
        profile: profileResult.data,
        clients: clientsResult.data,
        invoices: invoicesResult.data,
        promises: promisesResult.data,
        followups: followupsResult.data,
        billing_orders: billingResult.data,
    }, null, 2);

    return new Response(body, {
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Disposition': `attachment; filename="flowcent-export-${exportedAt.slice(0, 10)}.json"`,
            'Cache-Control': 'no-store',
        },
    });
}
