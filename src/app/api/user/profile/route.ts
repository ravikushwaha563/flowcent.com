import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/server';
import { updateProfileSchema, validationError } from '@/lib/validations/domain';
import { ZodError } from 'zod';
import { getErrorMessage } from '@/lib/errors';

export async function GET() {
    try {
        const { supabase, user: authUser, response } = await requireUser();
        if (!authUser) return response!;

        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, company_name, gmail_connected, gmail_email')
            .eq('id', authUser.id)
            .single();
        if (error) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

        return NextResponse.json({ user });
    } catch (error: unknown) {
        return NextResponse.json({ error: getErrorMessage(error, 'Internal server error') }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const { supabase, user: authUser, response } = await requireUser();
        if (!authUser) return response!;
        const validated = updateProfileSchema.parse(await req.json());
        const updates = { ...validated, updated_at: new Date().toISOString() };

        const { data: user, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', authUser.id)
            .select('id, name, email, company_name, gmail_connected, gmail_email')
            .single();

        if (error) return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
        return NextResponse.json({ user });
    } catch (err: unknown) {
        if (err instanceof ZodError) return NextResponse.json(validationError(err), { status: 400 });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
