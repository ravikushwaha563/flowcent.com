import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/server';

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET() {
    try {
        const { supabase, user, response } = await requireUser();
        if (!user) return response!;
        const userId = user.id;

        // Get all invoices
        const { data: invoices, error: invoicesError } = await supabase
            .from('invoices')
            .select('id, amount, currency, status, due_date, paid_at, current_stage')
            .eq('user_id', userId);

        if (invoicesError) throw invoicesError;

        // Get all clients
        const { data: clients, error: clientsError } = await supabase
            .from('clients')
            .select('id')
            .eq('user_id', userId);

        if (clientsError) throw clientsError;

        // Calculate stats
        const totalInvoices = invoices?.length || 0;
        const totalClients = clients?.length || 0;
        const now = new Date();

        const pendingInvoices = invoices?.filter(inv => inv.status === 'pending') || [];
        const overdueInvoices = invoices?.filter(inv => {
            return inv.status === 'pending' && new Date(inv.due_date) < new Date();
        }) || [];
        const paidInvoices = invoices?.filter(inv => inv.status === 'paid') || [];

        const currencyTotals = new Map<string, { currency: string; total: number; paid: number; pending: number; overdue: number }>();
        for (const invoice of invoices || []) {
            const currency = invoice.currency || 'INR';
            const amount = Number(invoice.amount);
            const totals = currencyTotals.get(currency) || { currency, total: 0, paid: 0, pending: 0, overdue: 0 };
            totals.total += amount;
            if (invoice.status === 'paid') totals.paid += amount;
            if (invoice.status === 'pending') totals.pending += amount;
            if (invoice.status === 'pending' && new Date(invoice.due_date) < new Date()) totals.overdue += amount;
            currencyTotals.set(currency, totals);
        }

        const monthStarts = Array.from({ length: 6 }, (_, index) => {
            const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
            return date;
        });
        const monthlyCollections = monthStarts.map(date => ({
            key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
            label: date.toLocaleDateString('en-IN', { month: 'short' }),
            amounts: {} as Record<string, number>,
        }));
        for (const invoice of paidInvoices) {
            if (!invoice.paid_at) continue;
            const paidAt = new Date(invoice.paid_at);
            const key = `${paidAt.getFullYear()}-${String(paidAt.getMonth() + 1).padStart(2, '0')}`;
            const month = monthlyCollections.find(item => item.key === key);
            if (!month) continue;
            const currency = invoice.currency || 'INR';
            month.amounts[currency] = (month.amounts[currency] || 0) + Number(invoice.amount);
        }

        const stageCounts = Object.fromEntries(Array.from({ length: 5 }, (_, index) => [String(index + 1), 0]));
        for (const invoice of pendingInvoices) {
            const stage = String(Math.min(Math.max(invoice.current_stage || 1, 1), 5));
            stageCounts[stage] += 1;
        }

        // Calculate average payment delay for paid invoices
        let avgPaymentDelay = 0;
        if (paidInvoices.length > 0) {
            const delays = paidInvoices
                .filter(inv => inv.paid_at)
                .map(inv => {
                    const dueDate = new Date(inv.due_date);
                    const paidDate = new Date(inv.paid_at!);
                    return Math.max(0, Math.floor((paidDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
                });
            if (delays.length > 0) {
                avgPaymentDelay = Math.floor(delays.reduce((a, b) => a + b, 0) / delays.length);
            }
        }

        return NextResponse.json({
            stats: {
                total_invoices: totalInvoices,
                total_clients: totalClients,
                pending_count: pendingInvoices.length,
                overdue_count: overdueInvoices.length,
                paid_count: paidInvoices.length,
                avg_payment_delay: avgPaymentDelay,
                currency_totals: Array.from(currencyTotals.values()).sort((a, b) => a.currency.localeCompare(b.currency)),
                monthly_collections: monthlyCollections,
                stage_counts: stageCounts,
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
