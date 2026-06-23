import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { requireUser } from '@/lib/auth/server';
import { updateClientSchema, validationError } from '@/lib/validations/domain';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { user, response } = await requireUser();
        if (!user) return response!;
        const { id } = await params;
        const validated = updateClientSchema.parse(await req.json());
        const { whatsappOptIn, ...clientFields } = validated;
        const updates = {
            ...clientFields,
            ...(validated.phone !== undefined ? { phone: validated.phone || null } : {}),
            ...(validated.company !== undefined ? { company: validated.company || null } : {}),
            ...(whatsappOptIn !== undefined ? { whatsapp_opt_in: whatsappOptIn } : {}),
            updated_at: new Date().toISOString(),
        };

        const { data: client, error } = await createAdminSupabaseClient().from('clients').update(updates)
            .eq('id', id).eq('user_id', user.id).select().maybeSingle();
        if (error) throw error;
        if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        return NextResponse.json({ client });
    } catch (error) {
        if (error instanceof ZodError) return NextResponse.json(validationError(error), { status: 400 });
        return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { supabase, user, response } = await requireUser();
    if (!user) return response!;
    const { id } = await params;

    const { data: client, error: clientError } = await supabase.from('clients').select('id')
        .eq('id', id).eq('user_id', user.id).maybeSingle();
    if (clientError) return NextResponse.json({ error: 'Failed to verify client' }, { status: 500 });
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    const { count, error: invoiceError } = await supabase.from('invoices').select('id', { count: 'exact', head: true })
        .eq('user_id', user.id).eq('client_id', id);
    if (invoiceError) return NextResponse.json({ error: 'Failed to verify invoice history' }, { status: 500 });
    if ((count || 0) > 0) {
        return NextResponse.json({ error: 'Clients with invoice history cannot be deleted' }, { status: 409 });
    }

    const { error } = await createAdminSupabaseClient().from('clients').delete().eq('id', id).eq('user_id', user.id);
    if (error?.code === '23503') {
        return NextResponse.json({ error: 'Clients with invoice history cannot be deleted' }, { status: 409 });
    }
    if (error) return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
    return NextResponse.json({ success: true });
}
