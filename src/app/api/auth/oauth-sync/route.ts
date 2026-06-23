import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    try {
        const { code } = await req.json();

        if (!code || typeof code !== 'string') {
            return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
        }

        const supabase = await createServerSupabaseClient();
        const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        const user = sessionData.user;

        if (exchangeError || !user) {
            return NextResponse.json({ error: 'Invalid Google session' }, { status: 401 });
        }

        const email = user.email!;
        const name = user.user_metadata?.full_name || user.user_metadata?.name || email.split('@')[0];

        const { error: profileError } = await supabase.from('users')
            .update({ name, updated_at: new Date().toISOString() })
            .eq('id', user.id);
        if (profileError) throw profileError;

        return NextResponse.json({
            user: {
                id: user.id,
                email: email,
                name: name,
                companyName: null,
            },
            message: 'OAuth sync successful',
        });
    } catch (error: unknown) {
        console.error('OAuth sync error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
