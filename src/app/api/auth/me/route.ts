import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/server';

export async function GET() {
    try {
        const { supabase, user, response } = await requireUser();
        if (!user) return response!;

        const { data: profile } = await supabase
            .from('users')
            .select('name, company_name, industry, gmail_connected, created_at, updated_at')
            .eq('id', user.id)
            .single();

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: profile?.name ?? user.user_metadata?.name ?? null,
                companyName: profile?.company_name ?? null,
                industry: profile?.industry ?? null,
                gmailConnected: profile?.gmail_connected ?? false,
                createdAt: profile?.created_at ?? user.created_at,
                updatedAt: profile?.updated_at ?? user.updated_at ?? user.created_at,
            },
        });
    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
