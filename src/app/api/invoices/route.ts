import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { checkInvoiceLimit, PlanType } from '@/lib/plan-limits';

// GET /api/invoices - List all invoices for current user
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

        const { data, error } = await supabaseAdmin
            .from('invoices')
            .select(`
        *,
        clients (
          id,
          name,
          email,
          company
        )
      `)
            .eq('user_id', userInfo.userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ invoices: data });
    } catch (error) {
        console.error('Get invoices error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/invoices - Create a new invoice
export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userInfo = verifyToken(authHeader.substring(7));
        if (!userInfo) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const body = await req.json();
        const { clientId, invoiceNumber, amount, currency, dueDate, autoFollowup } = body;

        if (!clientId || !invoiceNumber || !amount || !dueDate) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Fetch user plan and usage
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('subscription_plan, invoice_count_this_month')
            .eq('id', userInfo.userId)
            .single();
            
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
        
        const limitCheck = checkInvoiceLimit((user.subscription_plan || 'free') as PlanType, user.invoice_count_this_month || 0);
        
        if (!limitCheck.allowed) {
            return NextResponse.json({ error: 'LIMIT_EXCEEDED', message: limitCheck.message }, { status: 403 });
        }

        // Calculate initial next_followup_date (1 day after due date)
        const due = new Date(dueDate);
        const nextFollowup = new Date(due);
        nextFollowup.setDate(due.getDate() + 1);

        const { data, error } = await supabaseAdmin
            .from('invoices')
            .insert({
                user_id: userInfo.userId,
                client_id: clientId,
                invoice_number: invoiceNumber,
                amount: parseFloat(amount),
                currency: currency || 'INR',
                due_date: dueDate,
                status: 'pending',
                payment_intent_score: 50,
                auto_followup: autoFollowup || false,
                current_stage: 1,
                next_followup_date: nextFollowup.toISOString(),
            })
            .select(`
        *,
        clients (
          id,
          name,
          email,
          company
        )
      `)
            .single();

        if (error) throw error;

        // Update usage
        await supabaseAdmin
            .from('users')
            .update({ invoice_count_this_month: (user.invoice_count_this_month || 0) + 1 })
            .eq('id', userInfo.userId);

        return NextResponse.json({ invoice: data }, { status: 201 });
    } catch (error) {
        console.error('Create invoice error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
