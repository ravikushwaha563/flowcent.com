import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { publicEnv } from '@/lib/env/public';
import { forgotPasswordSchema } from '@/lib/validations/auth';

export async function POST(req: NextRequest) {
    const parsed = forgotPasswordSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 });

    const supabase = await createServerSupabaseClient();
    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
        redirectTo: `${publicEnv.appUrl}/auth/callback?next=/reset-password`,
    });

    return NextResponse.json({ message: 'If an account exists, a reset link has been sent.' });
}
