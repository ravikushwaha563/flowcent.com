import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { signupSchema } from '@/lib/validations/auth';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate input
        const validatedData = signupSchema.parse(body);
        const { email, password, name, companyName } = validatedData;

        // Create user with Supabase Auth
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

        // Generate JWT token
        const token = signToken({
            userId: authData.user.id,
            email: authData.user.email!,
        });

        // Also insert into public.users table (same ID as auth user for FK consistency)
        await supabaseAdmin.from('users').upsert({
            id: authData.user.id,
            email: authData.user.email,
            name: name || null,
            password_hash: 'supabase_auth_managed',
            company_name: companyName || null,
            gmail_connected: false,
        }, { onConflict: 'id' });

        return NextResponse.json(
            {
                user: {
                    id: authData.user.id,
                    email: authData.user.email,
                    name,
                    companyName,
                },
                token,
                message: 'User created successfully',
            },
            { status: 201 }
        );
    } catch (error: any) {
        // Handle validation errors
        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Validation failed', details: error.errors },
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
