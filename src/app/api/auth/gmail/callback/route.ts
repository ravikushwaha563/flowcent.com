import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens, getGmailAddress } from '@/lib/gmail';
import { requireUser } from '@/lib/auth/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.redirect(new URL('/dashboard/settings?gmail=denied', req.url));
    }

    const storedState = req.cookies.get('flowcent_gmail_oauth_state')?.value;
    if (!code || !state || !storedState || state !== storedState) {
        return NextResponse.redirect(new URL('/dashboard/settings?gmail=error', req.url));
    }

    try {
        const { supabase, user, response } = await requireUser();
        if (response || !user) return NextResponse.redirect(new URL('/login?next=/dashboard/settings', req.url));

        const tokens = await exchangeCodeForTokens(code);

        if (!tokens.access_token) {
            return NextResponse.redirect(new URL('/dashboard/settings?gmail=error', req.url));
        }

        // Get Gmail address
        const gmailAddress = await getGmailAddress(tokens.access_token, tokens.refresh_token || undefined);

        const { error: updateError } = await supabase
            .from('users')
            .update({
                gmail_connected: true,
                gmail_access_token: tokens.access_token,
                gmail_refresh_token: tokens.refresh_token || null,
                gmail_token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
                gmail_email: gmailAddress,
                updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

        if (updateError) throw updateError;

        const redirect = NextResponse.redirect(new URL('/dashboard/settings?gmail=connected', req.url));
        redirect.cookies.delete('flowcent_gmail_oauth_state');
        return redirect;
    } catch (err: unknown) {
        console.error('Gmail callback error:', err);
        return NextResponse.redirect(new URL('/dashboard/settings?gmail=error', req.url));
    }
}
