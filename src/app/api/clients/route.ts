import { NextRequest, NextResponse } from 'next/server';
import { checkClientLimit, PlanType } from '@/lib/plan-limits';
import { requireUser } from '@/lib/auth/server';
import { createClientSchema, validationError } from '@/lib/validations/domain';
import { ZodError } from 'zod';

// GET /api/clients - List all clients for current user
export async function GET(req: NextRequest) {
    try {
        const { supabase, user, response } = await requireUser();
        if (!user) return response!;

        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ clients: data });
    } catch (error) {
        console.error('Get clients error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/clients - Create a new client
export async function POST(req: NextRequest) {
    try {
        const { supabase, user, response } = await requireUser();
        if (!user) return response!;
        const { name, email, phone, company } = createClientSchema.parse(await req.json());

        // Fetch user plan and current client count
        const { data: profile } = await supabase
            .from('users')
            .select('subscription_plan')
            .eq('id', user.id)
            .single();

        if (!profile) return NextResponse.json({ error: 'User profile not found' }, { status: 404 });

        const { count: clientCount } = await supabase
            .from('clients')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id);

        const limitCheck = checkClientLimit((profile.subscription_plan || 'free') as PlanType, clientCount || 0);

        if (!limitCheck.allowed) {
            return NextResponse.json({ error: 'LIMIT_EXCEEDED', message: limitCheck.message }, { status: 403 });
        }

        const { data, error } = await supabase
            .from('clients')
            .insert({
                user_id: user.id,
                name,
                email,
                phone: phone || null,
                company: company || null,
                payment_history_score: 50,
                avg_payment_delay: 0,
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ client: data }, { status: 201 });
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(validationError(error), { status: 400 });
        }
        console.error('Create client error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
