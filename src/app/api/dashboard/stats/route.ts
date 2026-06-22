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
            .select('id, amount, status, due_date, paid_at')
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

        const pendingInvoices = invoices?.filter(inv => inv.status === 'pending') || [];
        const overdueInvoices = invoices?.filter(inv => {
            return inv.status === 'pending' && new Date(inv.due_date) < new Date();
        }) || [];
        const paidInvoices = invoices?.filter(inv => inv.status === 'paid') || [];

        const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
        const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
        const paidAmount = paidInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
        const totalAmount = invoices?.reduce((sum, inv) => sum + parseFloat(inv.amount), 0) || 0;

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
                total_amount: totalAmount,
                paid_amount: paidAmount,
                pending_amount: pendingAmount,
                pending_count: pendingInvoices.length,
                overdue_amount: overdueAmount,
                overdue_count: overdueInvoices.length,
                paid_count: paidInvoices.length,
                avg_payment_delay: avgPaymentDelay,
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
