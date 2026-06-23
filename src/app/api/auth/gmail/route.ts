import { NextResponse } from 'next/server';
import { getGmailAuthUrl, getOAuthClient } from '@/lib/gmail';
import { requireUser } from '@/lib/auth/server';
import { randomBytes } from 'crypto';
import { decryptSecret } from '@/lib/crypto/secrets';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export async function GET() {
    try {
        const { user, response } = await requireUser();
        if (!user) return response!;

        // Check env vars are set
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
            return NextResponse.json(
                { error: 'Gmail integration is not available on this deployment' },
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
        console.error('Failed to start Gmail connection:', err);
        return NextResponse.json({ error: 'Failed to start Gmail connection' }, { status: 500 });
    }
}

export async function DELETE() {
    const { user, response } = await requireUser();
    if (!user) return response!;

    const admin = createAdminSupabaseClient();
    const { data: profile } = await admin.from('users').select('gmail_access_token').eq('id', user.id).single();
    if (profile?.gmail_access_token) {
        try {
            await getOAuthClient().revokeToken(decryptSecret(profile.gmail_access_token));
        } catch (error) {
            console.error('Failed to revoke Gmail token:', error);
        }
    }

    const { error } = await admin.from('users').update({
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
