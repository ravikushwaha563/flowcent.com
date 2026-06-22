import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    const supabase = await createServerSupabaseClient();
    const callbackUrl = new URL('/auth/callback', request.url);
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: callbackUrl.toString() },
    });

    if (error || !data.url) {
        return NextResponse.redirect(new URL('/login?error=oauth_start_failed', request.url));
    }

    return NextResponse.redirect(data.url);
}
