import { NextRequest, NextResponse } from 'next/server';
import { signupSchema } from '@/lib/validations/auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate input
        const validatedData = signupSchema.parse(body);
        const { email, password, name, companyName } = validatedData;

        const supabase = await createServerSupabaseClient();
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    company_name: companyName,
                },
            },
        });

        if (authError) {
            return NextResponse.json(
                { error: authError.message },
                { status: 400 }
            );
        }

        if (!authData.user) {
            return NextResponse.json(
                { error: 'Failed to create user' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                user: {
                    id: authData.user.id,
                    email: authData.user.email,
                    name,
                    companyName,
                },
                requiresEmailConfirmation: !authData.session,
                message: authData.session ? 'User created successfully' : 'Check your email to confirm your account',
            },
            { status: 201 }
        );
    } catch (error: unknown) {
        // Handle validation errors
        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Validation failed' },
                { status: 400 }
            );
        }

        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
