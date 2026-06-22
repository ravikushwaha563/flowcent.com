import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { loginSchema } from '@/lib/validations/auth';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate input
        const validatedData = loginSchema.parse(body);
        const { email, password } = validatedData;

        // Sign in with Supabase Auth
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

        // Generate JWT token
        const token = signToken({
            userId: authData.user.id,
            email: authData.user.email!,
        });

        return NextResponse.json({
            user: {
                id: authData.user.id,
                email: authData.user.email,
                name: authData.user.user_metadata?.name || null,
                companyName: authData.user.user_metadata?.company_name || null,
            },
            token,
            message: 'Login successful',
        });
    } catch (error: any) {
        // Handle validation errors
        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Validation failed', details: error.errors },
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
