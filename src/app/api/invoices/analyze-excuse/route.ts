import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { analyzeEmailForExcuses } from '@/lib/gemini';
import { checkAiLimit, PlanType } from '@/lib/plan-limits';

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const token = authHeader.substring(7);
        const userInfo = verifyToken(token);
        if (!userInfo) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const body = await req.json();
        const { invoiceId, emailContent, clientReplyDate } = body;

        if (!invoiceId || !emailContent) {
            return NextResponse.json({ error: 'invoiceId and emailContent required' }, { status: 400 });
        }

        // Fetch user plan and ai usage
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('subscription_plan, ai_usage_this_month')
            .eq('id', userInfo.userId)
            .single();

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const limitCheck = checkAiLimit((user.subscription_plan || 'free') as PlanType, user.ai_usage_this_month || 0);

        if (!limitCheck.allowed) {
            return NextResponse.json({ error: 'LIMIT_EXCEEDED', message: limitCheck.message }, { status: 403 });
        }

        // Check Gemini API key
        if (!process.env.GOOGLE_GEMINI_API_KEY) {
            return NextResponse.json({ error: 'GOOGLE_GEMINI_API_KEY not configured' }, { status: 503 });
        }

        // Get invoice + client
        const { data: invoice } = await supabaseAdmin
            .from('invoices')
            .select('*, clients(name, email)')
            .eq('id', invoiceId)
            .eq('user_id', userInfo.userId)
            .single();

        if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });

        const fmtAmount = new Intl.NumberFormat('en-IN', {
            style: 'currency', currency: invoice.currency || 'INR', maximumFractionDigits: 0,
        }).format(invoice.amount);

        // Run Gemini analysis
        const analysis = await analyzeEmailForExcuses(
            emailContent,
            invoice.clients.name,
            fmtAmount,
            invoice.due_date
        );

        // Save each extracted promise to DB
        const savedPromises = [];
        for (const p of analysis.promises) {
            const { data: promise } = await supabaseAdmin
                .from('promises')
                .insert({
                    invoice_id: invoiceId,
                    promise_text: p.promise_text,
                    promise_type: p.promise_type,
                    promised_date: p.promised_date || null,
                    fulfilled: false,
                    email_id: clientReplyDate || new Date().toISOString(),
                })
                .select()
                .single();
            savedPromises.push(promise);
        }

        // Update invoice payment_intent_score
        await supabaseAdmin
            .from('invoices')
            .update({ payment_intent_score: analysis.intent_score })
            .eq('id', invoiceId);

        // Update ai usage
        await supabaseAdmin
            .from('users')
            .update({ ai_usage_this_month: (user.ai_usage_this_month || 0) + 1 })
            .eq('id', userInfo.userId);

        return NextResponse.json({
            success: true,
            analysis,
            savedPromises,
            message: `Analyzed ${analysis.promises.length} promise(s) detected`,
        });
    } catch (err: any) {
        console.error('Excuse analysis error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const token = authHeader.substring(7);
        const userInfo = verifyToken(token);
        if (!userInfo) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const invoiceId = searchParams.get('invoiceId');

        let query = supabaseAdmin
            .from('promises')
            .select('*, invoices!inner(user_id, invoice_number, amount, currency, clients(name))')
            .eq('invoices.user_id', userInfo.userId)
            .order('created_at', { ascending: false });

        if (invoiceId) query = query.eq('invoice_id', invoiceId);

        const { data: promises } = await query;
        return NextResponse.json({ promises: promises || [] });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const token = authHeader.substring(7);
        const userInfo = verifyToken(token);
        if (!userInfo) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const body = await req.json();
        const { promiseId, fulfilled } = body;

        const { data: promise } = await supabaseAdmin
            .from('promises')
            .update({ fulfilled })
            .eq('id', promiseId)
            .select()
            .single();

        return NextResponse.json({ promise });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
