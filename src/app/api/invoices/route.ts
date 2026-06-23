import { NextRequest, NextResponse } from 'next/server';
import { checkAutoFollowup, checkInvoiceLimit, PlanType } from '@/lib/plan-limits';
import { requireUser } from '@/lib/auth/server';
import { createInvoiceSchema, validationError } from '@/lib/validations/domain';
import { ZodError } from 'zod';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

// GET /api/invoices - List all invoices for current user
export async function GET() {
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

        const { data: duplicateInvoice } = await supabase
            .from('invoices')
            .select('id')
            .eq('user_id', user.id)
            .ilike('invoice_number', invoiceNumber)
            .maybeSingle();
        if (duplicateInvoice) {
            return NextResponse.json({ error: 'Invoice number already exists' }, { status: 409 });
        }

        // Fetch user plan and usage
        const { data: profile } = await supabase
            .from('users')
            .select('subscription_plan, plan_expires_at')
            .eq('id', user.id)
            .single();
            
        if (!profile) return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
        const activePlan = profile.plan_expires_at && new Date(profile.plan_expires_at) < new Date()
            ? 'free'
            : (profile.subscription_plan || 'free');
        
        if (autoFollowup) {
            const automationCheck = checkAutoFollowup(activePlan as PlanType);
            if (!automationCheck.allowed) {
                return NextResponse.json({ error: 'LIMIT_EXCEEDED', message: automationCheck.message }, { status: 403 });
            }
        }

        const now = new Date();
        const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
        const { count: monthlyInvoiceCount, error: countError } = await supabase
            .from('invoices')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', monthStart.toISOString());
        if (countError) throw countError;

        const limitCheck = checkInvoiceLimit(activePlan as PlanType, monthlyInvoiceCount || 0);
        
        if (!limitCheck.allowed) {
            return NextResponse.json({ error: 'LIMIT_EXCEEDED', message: limitCheck.message }, { status: 403 });
        }

        // Calculate initial next_followup_date (1 day after due date)
        const due = new Date(dueDate);
        const nextFollowup = new Date(due);
        nextFollowup.setDate(due.getDate() + 1);

        const admin = createAdminSupabaseClient();
        const { data: invoiceId, error: createError } = await admin.rpc('create_invoice_record', {
            p_user_id: user.id,
            p_client_id: clientId,
            p_invoice_number: invoiceNumber,
            p_amount: amount,
            p_currency: currency,
            p_due_date: dueDate,
            p_auto_followup: autoFollowup || false,
            p_next_followup_date: nextFollowup.toISOString(),
        });
        if (createError?.message.includes('INVOICE_LIMIT_EXCEEDED')) {
            return NextResponse.json({ error: 'LIMIT_EXCEEDED', message: limitCheck.message }, { status: 403 });
        }
        if (createError?.message.includes('AUTOMATION_REQUIRES_PRO')) {
            return NextResponse.json({ error: 'LIMIT_EXCEEDED', message: checkAutoFollowup('free').message }, { status: 403 });
        }
        if (createError?.code === '23505') {
            return NextResponse.json({ error: 'Invoice number already exists' }, { status: 409 });
        }
        if (createError) throw createError;

        const { data, error } = await admin.from('invoices')
            .select(`
        *,
        clients (
          id,
          name,
          email,
          company
        )
      `)
            .eq('id', invoiceId)
            .single();

        if (error) throw error;

        return NextResponse.json({ invoice: data }, { status: 201 });
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(validationError(error), { status: 400 });
        }
        console.error('Create invoice error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
