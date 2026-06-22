import { NextResponse } from 'next/server';
import { getGmailAuthUrl } from '@/lib/gmail';
import { requireUser } from '@/lib/auth/server';
import { randomBytes } from 'crypto';

export async function GET() {
    try {
        const { user, response } = await requireUser();
        if (!user) return response!;

        // Check env vars are set
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
            return NextResponse.json(
                { error: 'Gmail integration not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env' },
                { status: 503 }
            );
        }

        const state = randomBytes(32).toString('hex');
        const authUrl = getGmailAuthUrl(state);
        const result = NextResponse.json({ authUrl });
        result.cookies.set('flowcent_gmail_oauth_state', state, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 10 * 60,
            path: '/api/auth/gmail/callback',
        });
        return result;
    } catch (err: unknown) {
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to start Gmail connection' }, { status: 500 });
    }
}

export async function DELETE() {
    const { supabase, user, response } = await requireUser();
    if (!user) return response!;

    const { error } = await supabase.from('users').update({
        gmail_connected: false,
        gmail_access_token: null,
        gmail_refresh_token: null,
        gmail_token_expiry: null,
        gmail_email: null,
        updated_at: new Date().toISOString(),
    }).eq('id', user.id);

    if (error) return NextResponse.json({ error: 'Failed to disconnect Gmail' }, { status: 500 });
    return NextResponse.json({ success: true });
}
