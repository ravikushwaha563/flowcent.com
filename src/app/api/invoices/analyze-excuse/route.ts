import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/server';
import { analyzeEmailForExcuses } from '@/lib/gemini';
import { checkAiLimit, PlanType } from '@/lib/plan-limits';
import { serverEnv } from '@/lib/env/server';

export async function POST(req: NextRequest) {
    try {
        const { supabase, user: authUser, response } = await requireUser();
        if (!authUser) return response!;

        const body = await req.json();
        const { invoiceId, emailContent, clientReplyDate } = body;

        if (!invoiceId || !emailContent) {
            return NextResponse.json({ error: 'invoiceId and emailContent required' }, { status: 400 });
        }

        // Fetch user plan and ai usage
        const { data: user } = await supabase
            .from('users')
            .select('subscription_plan, plan_expires_at, ai_usage_this_month')
            .eq('id', authUser.id)
            .single();

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const activePlan = user.plan_expires_at && new Date(user.plan_expires_at) < new Date()
            ? 'free'
            : (user.subscription_plan || 'free');
        const limitCheck = checkAiLimit(activePlan as PlanType, user.ai_usage_this_month || 0);

        if (!limitCheck.allowed) {
            return NextResponse.json({ error: 'LIMIT_EXCEEDED', message: limitCheck.message }, { status: 403 });
        }

        if (!serverEnv.GROQ_API_KEY) {
            return NextResponse.json({ error: 'AI provider is not configured' }, { status: 503 });
        }

        // Get invoice + client
        const { data: invoice } = await supabase
            .from('invoices')
            .select('*, clients(name, email)')
            .eq('id', invoiceId)
            .eq('user_id', authUser.id)
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
            const { data: promise } = await supabase
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
        await supabase
            .from('invoices')
            .update({ payment_intent_score: analysis.intent_score })
            .eq('id', invoiceId);

        // Update ai usage
        await supabase
            .from('users')
            .update({ ai_usage_this_month: (user.ai_usage_this_month || 0) + 1 })
            .eq('id', authUser.id);

        return NextResponse.json({
            success: true,
            analysis,
            savedPromises,
            message: `Analyzed ${analysis.promises.length} promise(s) detected`,
        });
    } catch (err: unknown) {
        console.error('Excuse analysis error:', err);
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Analysis failed' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const { supabase, user, response } = await requireUser();
        if (!user) return response!;

        const { searchParams } = new URL(req.url);
        const invoiceId = searchParams.get('invoiceId');

        let query = supabase
            .from('promises')
            .select('*, invoices!inner(user_id, invoice_number, amount, currency, clients(name))')
            .eq('invoices.user_id', user.id)
            .order('created_at', { ascending: false });

        if (invoiceId) query = query.eq('invoice_id', invoiceId);

        const { data: promises } = await query;
        return NextResponse.json({ promises: promises || [] });
    } catch (err: unknown) {
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to load promises' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const { supabase, user, response } = await requireUser();
        if (!user) return response!;

        const body = await req.json();
        const { promiseId, fulfilled } = body;

        const { data: ownedPromise } = await supabase
            .from('promises')
            .select('id, invoices!inner(user_id)')
            .eq('id', promiseId)
            .eq('invoices.user_id', user.id)
            .single();
        if (!ownedPromise) return NextResponse.json({ error: 'Promise not found' }, { status: 404 });

        const { data: promise, error } = await supabase
            .from('promises')
            .update({ fulfilled })
            .eq('id', promiseId)
            .select()
            .single();

        if (error) return NextResponse.json({ error: 'Failed to update promise' }, { status: 500 });
        return NextResponse.json({ promise });
    } catch (err: unknown) {
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to update promise' }, { status: 500 });
    }
}
