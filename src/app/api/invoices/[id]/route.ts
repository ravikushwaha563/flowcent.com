import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/server';
import { updateInvoiceSchema, validationError } from '@/lib/validations/domain';
import { ZodError } from 'zod';

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
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 });
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
        const updates: Record<string, string | number> = { ...body };
        if (body.status === 'paid') {
            updates.paid_at = new Date().toISOString();
        }
        updates.updated_at = new Date().toISOString();

        const { data: invoice, error } = await supabase
            .from('invoices')
            .update(updates)
            .eq('id', id)
            .eq('user_id', user.id)
            .select('*, clients(id, name, email)')
            .single();

        if (error || !invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        return NextResponse.json({ invoice });
    } catch (err: unknown) {
        if (err instanceof ZodError) return NextResponse.json(validationError(err), { status: 400 });
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 });
    }
}
