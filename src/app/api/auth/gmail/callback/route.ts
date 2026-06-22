import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens, getGmailAddress } from '@/lib/gmail';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const userId = searchParams.get('state'); // userId passed in state param
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.redirect(new URL('/dashboard/settings?gmail=denied', req.url));
    }

    if (!code || !userId) {
        return NextResponse.redirect(new URL('/dashboard/settings?gmail=error', req.url));
    }

    try {
        // Exchange code for tokens
        const tokens = await exchangeCodeForTokens(code);

        if (!tokens.access_token) {
            return NextResponse.redirect(new URL('/dashboard/settings?gmail=error', req.url));
        }

        // Get Gmail address
        const gmailAddress = await getGmailAddress(tokens.access_token, tokens.refresh_token || undefined);

        // Save tokens to users table
        await supabaseAdmin
            .from('users')
            .update({
                gmail_connected: true,
                gmail_access_token: tokens.access_token,
                gmail_refresh_token: tokens.refresh_token || null,
                gmail_token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
                gmail_email: gmailAddress,
                updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

        return NextResponse.redirect(new URL('/dashboard/settings?gmail=connected', req.url));
    } catch (err: any) {
        console.error('Gmail callback error:', err);
        return NextResponse.redirect(new URL('/dashboard/settings?gmail=error', req.url));
    }
}
