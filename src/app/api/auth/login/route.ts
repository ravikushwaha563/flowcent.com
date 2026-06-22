import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validations/auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate input
        const validatedData = loginSchema.parse(body);
        const { email, password } = validatedData;

        const supabase = await createServerSupabaseClient();
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError || !authData.user) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        return NextResponse.json({
            user: {
                id: authData.user.id,
                email: authData.user.email,
                name: authData.user.user_metadata?.name || null,
                companyName: authData.user.user_metadata?.company_name || null,
            },
            message: 'Login successful',
        });
    } catch (error: unknown) {
        // Handle validation errors
        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Validation failed' },
                { status: 400 }
            );
        }

        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
