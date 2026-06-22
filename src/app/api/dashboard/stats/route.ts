import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userInfo = verifyToken(authHeader.substring(7));
        if (!userInfo) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const userId = userInfo.userId;

        // Get all invoices
        const { data: invoices, error: invoicesError } = await supabaseAdmin
            .from('invoices')
            .select('id, amount, status, due_date, paid_at')
            .eq('user_id', userId);

        if (invoicesError) throw invoicesError;

        // Get all clients
        const { data: clients, error: clientsError } = await supabaseAdmin
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
                totalInvoices,
                totalClients,
                pendingAmount: pendingAmount.toFixed(2),
                pendingCount: pendingInvoices.length,
                overdueAmount: overdueAmount.toFixed(2),
                overdueCount: overdueInvoices.length,
                paidCount: paidInvoices.length,
                avgPaymentDelay,
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
