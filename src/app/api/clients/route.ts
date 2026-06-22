import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { checkClientLimit, PlanType } from '@/lib/plan-limits';

// GET /api/clients - List all clients for current user
export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userInfo = verifyToken(authHeader.substring(7));
        if (!userInfo) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const { data, error } = await supabaseAdmin
            .from('clients')
            .select('*')
            .eq('user_id', userInfo.userId)
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
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userInfo = verifyToken(authHeader.substring(7));
        if (!userInfo) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const body = await req.json();
        const { name, email, phone, company } = body;

        if (!name || !email) {
            return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
        }

        // Fetch user plan and current client count
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('subscription_plan')
            .eq('id', userInfo.userId)
            .single();

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const { count: clientCount } = await supabaseAdmin
            .from('clients')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userInfo.userId);

        const limitCheck = checkClientLimit((user.subscription_plan || 'free') as PlanType, clientCount || 0);

        if (!limitCheck.allowed) {
            return NextResponse.json({ error: 'LIMIT_EXCEEDED', message: limitCheck.message }, { status: 403 });
        }

        const { data, error } = await supabaseAdmin
            .from('clients')
            .insert({
                user_id: userInfo.userId,
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
        console.error('Create client error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
