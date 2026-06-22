import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

// GET /api/invoices/public/[id] — Public, unauthenticated endpoint
// Used by the /pay/[id] client payment portal.
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
        }

        const supabaseAdmin = createAdminSupabaseClient();
        const { data: invoice, error } = await supabaseAdmin
            .from('invoices')
            .select(`
                id, invoice_number, amount, currency, due_date, status, created_at, paid_at,
                clients ( id, name, email, company ),
                users ( name, company_name, email )
            `)
            .eq('id', id)
            .single();

        if (error || !invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        // Return only safe, display-relevant data (no tokens, no user_ids, etc.)
        return NextResponse.json({
            invoice: {
                id: invoice.id,
                invoice_number: invoice.invoice_number,
                amount: invoice.amount,
                currency: invoice.currency,
                due_date: invoice.due_date,
                status: invoice.status,
                created_at: invoice.created_at,
                paid_at: invoice.paid_at,
            },
            client: invoice.clients,
            freelancer: {
                name: (invoice as any).users?.name || 'Business',
                company: (invoice as any).users?.company_name || '',
                email: (invoice as any).users?.email || '',
            },
        });
    } catch (err: unknown) {
        console.error('Public invoice fetch error:', err);
        return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
    }
}
