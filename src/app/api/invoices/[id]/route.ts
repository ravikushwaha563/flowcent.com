import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const token = authHeader.substring(7);
        const userInfo = verifyToken(token);
        if (!userInfo) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        // Next.js 16: params must be awaited in server components/routes
        const { id } = await params;

        const { data: invoice, error } = await supabaseAdmin
            .from('invoices')
            .select('*, clients(id, name, email, company)')
            .eq('id', id)
            .eq('user_id', userInfo.userId)
            .single();

        if (error || !invoice) {
            console.error('Invoice fetch error:', error?.message, '| id:', id, '| userId:', userInfo.userId);
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        return NextResponse.json({ invoice });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const token = authHeader.substring(7);
        const userInfo = verifyToken(token);
        if (!userInfo) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        // Next.js 16: params must be awaited
        const { id } = await params;

        const body = await req.json();
        const allowedFields = ['status', 'payment_intent_score', 'paid_at', 'razorpay_order_id', 'razorpay_payment_id', 'payment_gateway'];
        const updates: Record<string, any> = {};
        for (const key of allowedFields) {
            if (key in body) updates[key] = body[key];
        }
        if (body.status === 'paid' && !updates.paid_at) {
            updates.paid_at = new Date().toISOString();
        }
        updates.updated_at = new Date().toISOString();

        const { data: invoice } = await supabaseAdmin
            .from('invoices')
            .update(updates)
            .eq('id', id)
            .eq('user_id', userInfo.userId)
            .select('*, clients(id, name, email)')
            .single();

        return NextResponse.json({ invoice });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
