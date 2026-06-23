import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/server';
import { analyzeEmailForExcuses } from '@/lib/gemini';
import { serverEnv } from '@/lib/env/server';
import { z } from 'zod';
import { consumeAiAnalysis } from '@/lib/usage';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { consumeRateLimit, rateLimitResponse } from '@/lib/rate-limit';

const analyzeRequestSchema = z.object({
    invoiceId: z.string().uuid(),
    emailContent: z.string().trim().min(3).max(20_000),
    clientReplyDate: z.string().max(100).optional(),
});

const updatePromiseSchema = z.object({
    promiseId: z.string().uuid(),
    fulfilled: z.boolean(),
});

export async function POST(req: NextRequest) {
    try {
        const { supabase, user: authUser, response } = await requireUser();
        if (!authUser) return response!;
        if (!await consumeRateLimit(createAdminSupabaseClient(), 'ai-invoice-analysis', authUser.id, 20, 300)) {
            return rateLimitResponse(300);
        }

        const parsedRequest = analyzeRequestSchema.safeParse(await req.json());
        if (!parsedRequest.success) return NextResponse.json({ error: 'Valid invoice and email content are required' }, { status: 400 });
        const { invoiceId, emailContent, clientReplyDate } = parsedRequest.data;

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

        if (!await consumeAiAnalysis(supabase)) {
            return NextResponse.json({ error: 'LIMIT_EXCEEDED', message: 'Your plan allows 5 AI analyses/month. Upgrade for unlimited AI.' }, { status: 403 });
        }

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
        let savedPromises: unknown[] = [];
        if (analysis.promises.length > 0) {
            const { data, error: promisesError } = await createAdminSupabaseClient()
                .from('promises')
                .insert(analysis.promises.map(p => ({
                    invoice_id: invoiceId,
                    promise_text: p.promise_text,
                    promise_type: p.promise_type,
                    promised_date: p.promised_date || null,
                    fulfilled: false,
                    email_id: clientReplyDate || new Date().toISOString(),
                })))
                .select();
            if (promisesError) throw promisesError;
            savedPromises = data || [];
        }

        // Update invoice payment_intent_score
        const { error: invoiceUpdateError } = await createAdminSupabaseClient()
            .from('invoices')
            .update({ payment_intent_score: analysis.intent_score })
            .eq('id', invoiceId);
        if (invoiceUpdateError) throw invoiceUpdateError;

        return NextResponse.json({
            success: true,
            analysis,
            savedPromises,
            message: `Analyzed ${analysis.promises.length} promise(s) detected`,
        });
    } catch (err: unknown) {
        console.error('Excuse analysis error:', err);
        return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
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
        console.error('Promise history load failed:', err);
        return NextResponse.json({ error: 'Failed to load promises' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const { supabase, user, response } = await requireUser();
        if (!user) return response!;

        const parsedRequest = updatePromiseSchema.safeParse(await req.json());
        if (!parsedRequest.success) return NextResponse.json({ error: 'Valid promise update required' }, { status: 400 });
        const { promiseId, fulfilled } = parsedRequest.data;

        const { data: ownedPromise } = await supabase
            .from('promises')
            .select('id, invoices!inner(user_id)')
            .eq('id', promiseId)
            .eq('invoices.user_id', user.id)
            .single();
        if (!ownedPromise) return NextResponse.json({ error: 'Promise not found' }, { status: 404 });

        const { data: promise, error } = await createAdminSupabaseClient()
            .from('promises')
            .update({ fulfilled })
            .eq('id', promiseId)
            .select()
            .single();

        if (error) return NextResponse.json({ error: 'Failed to update promise' }, { status: 500 });
        return NextResponse.json({ promise });
    } catch (err: unknown) {
        console.error('Promise update failed:', err);
        return NextResponse.json({ error: 'Failed to update promise' }, { status: 500 });
    }
}
