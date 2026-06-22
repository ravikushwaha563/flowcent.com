import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/server';
import { resetPasswordSchema } from '@/lib/validations/auth';

export async function POST(req: NextRequest) {
    const { supabase, user, response } = await requireUser();
    if (!user) return response!;

    const parsed = resetPasswordSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'Password must be 8-72 characters' }, { status: 400 });

    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    await supabase.auth.signOut();
    return NextResponse.json({ message: 'Password updated. Sign in with your new password.' });
}
