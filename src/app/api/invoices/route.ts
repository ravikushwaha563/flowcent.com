import { NextRequest, NextResponse } from 'next/server';
import { checkInvoiceLimit, PlanType } from '@/lib/plan-limits';
import { requireUser } from '@/lib/auth/server';
import { createInvoiceSchema, validationError } from '@/lib/validations/domain';
import { ZodError } from 'zod';

// GET /api/invoices - List all invoices for current user
export async function GET(req: NextRequest) {
    try {
        const { supabase, user, response } = await requireUser();
        if (!user) return response!;

        const { data, error } = await supabase
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
            .eq('user_id', user.id)
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
        const { supabase, user, response } = await requireUser();
        if (!user) return response!;
        const { clientId, invoiceNumber, amount, currency, dueDate, autoFollowup } = createInvoiceSchema.parse(await req.json());

        const { data: ownedClient } = await supabase
            .from('clients')
            .select('id')
            .eq('id', clientId)
            .eq('user_id', user.id)
            .single();
        if (!ownedClient) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

        // Fetch user plan and usage
        const { data: profile } = await supabase
            .from('users')
            .select('subscription_plan, plan_expires_at, invoice_count_this_month')
            .eq('id', user.id)
            .single();
            
        if (!profile) return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
        const activePlan = profile.plan_expires_at && new Date(profile.plan_expires_at) < new Date()
            ? 'free'
            : (profile.subscription_plan || 'free');
        
        const limitCheck = checkInvoiceLimit(activePlan as PlanType, profile.invoice_count_this_month || 0);
        
        if (!limitCheck.allowed) {
            return NextResponse.json({ error: 'LIMIT_EXCEEDED', message: limitCheck.message }, { status: 403 });
        }

        // Calculate initial next_followup_date (1 day after due date)
        const due = new Date(dueDate);
        const nextFollowup = new Date(due);
        nextFollowup.setDate(due.getDate() + 1);

        const { data, error } = await supabase
            .from('invoices')
            .insert({
                user_id: user.id,
                client_id: clientId,
                invoice_number: invoiceNumber,
                amount,
                currency,
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
        await supabase
            .from('users')
            .update({ invoice_count_this_month: (profile.invoice_count_this_month || 0) + 1 })
            .eq('id', user.id);

        return NextResponse.json({ invoice: data }, { status: 201 });
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(validationError(error), { status: 400 });
        }
        console.error('Create invoice error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
