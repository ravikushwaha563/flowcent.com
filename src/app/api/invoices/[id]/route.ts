import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/server';
import { updateInvoiceSchema, validationError } from '@/lib/validations/domain';
import { ZodError } from 'zod';
import { checkAutoFollowup, PlanType } from '@/lib/plan-limits';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { supabase, user, response } = await requireUser();
        if (!user) return response!;

        // Next.js 16: params must be awaited in server components/routes
        const { id } = await params;

        const { data: invoice, error } = await supabase
            .from('invoices')
            .select('*, clients(id, name, email, company)')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (error || !invoice) {
            console.error('Invoice fetch error:', error?.message, '| id:', id, '| userId:', user.id);
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        return NextResponse.json({ invoice });
    } catch (err: unknown) {
        console.error('Invoice fetch failed:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { supabase, user, response } = await requireUser();
        if (!user) return response!;

        // Next.js 16: params must be awaited
        const { id } = await params;

        const body = updateInvoiceSchema.parse(await req.json());
        const { data: currentInvoice, error: currentError } = await supabase
            .from('invoices')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .maybeSingle();
        if (currentError) throw currentError;
        if (!currentInvoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });

        const contentFields = ['clientId', 'invoiceNumber', 'amount', 'currency', 'dueDate', 'autoFollowup'] as const;
        const hasContentUpdate = contentFields.some(field => body[field] !== undefined);
        if (currentInvoice.status === 'paid' && (hasContentUpdate || (body.status && body.status !== 'paid'))) {
            return NextResponse.json({ error: 'Paid invoices cannot be changed' }, { status: 409 });
        }
        if (currentInvoice.status === 'cancelled' && body.status === 'paid') {
            return NextResponse.json({ error: 'Reopen the invoice before marking it paid' }, { status: 409 });
        }

        const financialFieldsChanged = (body.clientId && body.clientId !== currentInvoice.client_id)
            || (body.amount !== undefined && body.amount !== Number(currentInvoice.amount))
            || (body.currency && body.currency !== currentInvoice.currency);
        if (financialFieldsChanged && (currentInvoice.razorpay_order_id || currentInvoice.stripe_session_id)) {
            return NextResponse.json({ error: 'Amount, currency, and client are locked after checkout starts' }, { status: 409 });
        }

        if (body.clientId && body.clientId !== currentInvoice.client_id) {
            const { data: ownedClient } = await supabase.from('clients').select('id')
                .eq('id', body.clientId).eq('user_id', user.id).maybeSingle();
            if (!ownedClient) return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        if (body.autoFollowup === true) {
            const { data: profile, error: profileError } = await supabase.from('users')
                .select('subscription_plan, plan_expires_at').eq('id', user.id).single();
            if (profileError || !profile) throw profileError || new Error('User profile not found');
            const activePlan = profile.plan_expires_at && new Date(profile.plan_expires_at) < new Date()
                ? 'free'
                : profile.subscription_plan || 'free';
            const automationCheck = checkAutoFollowup(activePlan as PlanType);
            if (!automationCheck.allowed) {
                return NextResponse.json({ error: 'LIMIT_EXCEEDED', message: automationCheck.message }, { status: 403 });
            }
        }

        if (body.invoiceNumber && body.invoiceNumber.toLowerCase() !== currentInvoice.invoice_number.toLowerCase()) {
            const { data: duplicateInvoice } = await supabase.from('invoices').select('id')
                .eq('user_id', user.id).ilike('invoice_number', body.invoiceNumber).neq('id', id).maybeSingle();
            if (duplicateInvoice) return NextResponse.json({ error: 'Invoice number already exists' }, { status: 409 });
        }

        const updates: Record<string, string | number | boolean | null> = {
            updated_at: new Date().toISOString(),
        };
        if (body.clientId !== undefined) updates.client_id = body.clientId;
        if (body.invoiceNumber !== undefined) updates.invoice_number = body.invoiceNumber;
        if (body.amount !== undefined) updates.amount = body.amount;
        if (body.currency !== undefined) updates.currency = body.currency;
        if (body.dueDate !== undefined) updates.due_date = body.dueDate;
        if (body.autoFollowup !== undefined) updates.auto_followup = body.autoFollowup;

        const targetStatus = body.status || currentInvoice.status;
        if (body.status !== undefined) updates.status = body.status;
        if (targetStatus === 'paid') {
            updates.paid_at = currentInvoice.paid_at || new Date().toISOString();
            updates.auto_followup = false;
            updates.next_followup_date = null;
        } else if (targetStatus === 'cancelled') {
            updates.paid_at = null;
            updates.auto_followup = false;
            updates.next_followup_date = null;
        } else if (body.dueDate !== undefined || currentInvoice.status === 'cancelled') {
            const nextFollowup = new Date(body.dueDate || currentInvoice.due_date);
            nextFollowup.setDate(nextFollowup.getDate() + 1);
            updates.paid_at = null;
            updates.next_followup_date = nextFollowup.toISOString();
        }

        const { data: invoice, error } = await createAdminSupabaseClient()
            .from('invoices')
            .update(updates)
            .eq('id', id)
            .eq('user_id', user.id)
            .select('*, clients(id, name, email)')
            .maybeSingle();

        if (error?.code === '23505') return NextResponse.json({ error: 'Invoice number already exists' }, { status: 409 });
        if (error) throw error;
        if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        return NextResponse.json({ invoice });
    } catch (err: unknown) {
        if (err instanceof ZodError) return NextResponse.json(validationError(err), { status: 400 });
        console.error('Invoice update failed:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
