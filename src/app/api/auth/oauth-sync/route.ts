import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const { access_token, refresh_token } = await req.json();

        if (!access_token) {
            return NextResponse.json({ error: 'Missing access token' }, { status: 400 });
        }

        // Verify the user via Supabase using the access token
        const { data: { user }, error: userError } = await supabase.auth.getUser(access_token);

        if (userError || !user) {
            return NextResponse.json({ error: 'Invalid Google session' }, { status: 401 });
        }

        const email = user.email!;
        const name = user.user_metadata?.full_name || user.user_metadata?.name || email.split('@')[0];

        // Ensure user exists in our local `users` table
        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('id', user.id)
            .single();

        if (!existingUser) {
            // Create user in our custom table
            const { error: insertError } = await supabaseAdmin
                .from('users')
                .insert({
                    id: user.id,
                    email: email,
                    name: name,
                    company_name: null,
                });
                
            if (insertError) {
                console.error('Error syncing user to public table:', insertError);
                return NextResponse.json({ error: 'Failed to create user record' }, { status: 500 });
            }
        }

        // Issue our custom JWT
        const token = signToken({
            userId: user.id,
            email: email,
        });

        return NextResponse.json({
            user: {
                id: user.id,
                email: email,
                name: name,
                companyName: null,
            },
            token,
            message: 'OAuth sync successful',
        });
        
    } catch (error: any) {
        console.error('OAuth sync error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
