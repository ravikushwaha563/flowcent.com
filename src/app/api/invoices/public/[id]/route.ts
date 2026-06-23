import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { publicPaymentTokenSchema } from '@/lib/validations/domain';

export const dynamic = 'force-dynamic';

const privateResponse = { headers: { 'Cache-Control': 'private, no-store' } };

// GET /api/invoices/public/[id] — Public, unauthenticated endpoint
// Used by the /pay/[id] client payment portal.
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const parsedToken = publicPaymentTokenSchema.safeParse(id);
        if (!parsedToken.success) return NextResponse.json({ error: 'Invalid payment link' }, { status: 400, ...privateResponse });

        const supabaseAdmin = createAdminSupabaseClient();
        const { data: invoice, error } = await supabaseAdmin
            .from('invoices')
            .select(`
                id, invoice_number, amount, currency, due_date, status, created_at, paid_at,
                clients ( id, name, email, company ),
                users ( name, company_name, email )
            `)
            .eq('public_token', parsedToken.data)
            .single();

        if (error || !invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404, ...privateResponse });
        }

        const freelancer = Array.isArray(invoice.users) ? invoice.users[0] : invoice.users;

        // Return only safe, display-relevant data (no tokens, no user_ids, etc.)
        return NextResponse.json({
            invoice: {
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
                name: freelancer?.name || 'Business',
                company: freelancer?.company_name || '',
            },
        }, privateResponse);
    } catch (err: unknown) {
        console.error('Public invoice fetch error:', err);
        return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500, ...privateResponse });
    }
}
