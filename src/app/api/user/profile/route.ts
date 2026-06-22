import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const token = authHeader.substring(7);
        const userInfo = verifyToken(token);
        if (!userInfo) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const { data: user } = await supabaseAdmin
            .from('users')
            .select('id, name, email, company_name, gmail_connected, gmail_email')
            .eq('id', userInfo.userId)
            .single();

        return NextResponse.json({ user });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const token = authHeader.substring(7);
        const userInfo = verifyToken(token);
        if (!userInfo) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const body = await req.json();
        const allowed = ['name', 'company_name', 'gmail_connected', 'gmail_access_token', 'gmail_refresh_token', 'gmail_email'];
        const updates: Record<string, any> = {};
        for (const key of allowed) {
            if (key in body) updates[key] = body[key];
        }
        updates.updated_at = new Date().toISOString();

        const { data: user } = await supabaseAdmin
            .from('users')
            .update(updates)
            .eq('id', userInfo.userId)
            .select('id, name, email, company_name, gmail_connected, gmail_email')
            .single();

        return NextResponse.json({ user });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
