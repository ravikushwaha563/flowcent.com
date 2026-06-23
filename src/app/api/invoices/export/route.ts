import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/server';
import { createCsv } from '@/lib/csv';

export async function GET() {
    const { supabase, user, response } = await requireUser();
    if (!user) return response!;

    const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('subscription_plan, plan_expires_at')
        .eq('id', user.id)
        .single();
    if (profileError || !profile) return NextResponse.json({ error: 'User profile not found' }, { status: 404 });

    const planActive = profile.subscription_plan !== 'free'
        && (!profile.plan_expires_at || new Date(profile.plan_expires_at) > new Date());
    if (!planActive) {
        return NextResponse.json({ error: 'LIMIT_EXCEEDED', message: 'CSV export is available on Pro.' }, { status: 403 });
    }

    const { data: invoices, error } = await supabase
        .from('invoices')
        .select('invoice_number, amount, currency, due_date, status, paid_at, created_at, clients(name, email, company)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: 'Failed to export invoices' }, { status: 500 });

    const now = new Date();
    const csv = createCsv(
        ['Invoice Number', 'Client', 'Client Email', 'Company', 'Amount', 'Currency', 'Due Date', 'Status', 'Paid At', 'Created At'],
        (invoices || []).map(invoice => {
            const client = Array.isArray(invoice.clients) ? invoice.clients[0] : invoice.clients;
            const displayStatus = invoice.status === 'pending' && new Date(invoice.due_date) < now ? 'overdue' : invoice.status;
            return [invoice.invoice_number, client?.name, client?.email, client?.company, invoice.amount,
                invoice.currency, invoice.due_date, displayStatus, invoice.paid_at, invoice.created_at];
        }),
    );
    const date = new Date().toISOString().slice(0, 10);
    return new Response(`\uFEFF${csv}`, {
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="flowcent-invoices-${date}.csv"`,
            'Cache-Control': 'private, no-store',
        },
    });
}
