import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { requireUser } from '@/lib/auth/server';
import { checkAiLimit, PlanType } from '@/lib/plan-limits';
import { requireServerEnv } from '@/lib/env/server';
import { z } from 'zod';

const requestSchema = z.object({
    excuse: z.string().trim().min(3).max(10_000),
    invoiceId: z.string().uuid().optional(),
});

const analysisSchema = z.object({
    truth_probability: z.number().min(0).max(100),
    intent_category: z.string().min(1).max(100),
    analysis: z.string().min(1).max(2_000),
    suggested_response: z.string().min(1).max(5_000),
});

export async function POST(req: NextRequest) {
    try {
        const { supabase, user, response } = await requireUser();
        if (!user) return response!;

        const parsedRequest = requestSchema.safeParse(await req.json());
        if (!parsedRequest.success) return NextResponse.json({ error: 'Please provide a valid client message.' }, { status: 400 });
        const { excuse, invoiceId } = parsedRequest.data;

        const { data: profile } = await supabase
            .from('users')
            .select('subscription_plan, plan_expires_at, ai_usage_this_month')
            .eq('id', user.id)
            .single();
        if (!profile) return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
        const plan = profile.plan_expires_at && new Date(profile.plan_expires_at) < new Date()
            ? 'free'
            : (profile.subscription_plan || 'free');
        const limit = checkAiLimit(plan as PlanType, profile.ai_usage_this_month || 0);
        if (!limit.allowed) return NextResponse.json({ error: 'LIMIT_EXCEEDED', message: limit.message }, { status: 403 });

        let context = 'No invoice context provided';
        if (invoiceId) {
            const { data: invoice } = await supabase
                .from('invoices')
                .select('invoice_number, amount, currency, due_date, status, clients(name)')
                .eq('id', invoiceId)
                .eq('user_id', user.id)
                .single();
            if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
            const client = Array.isArray(invoice.clients) ? invoice.clients[0] : invoice.clients;
            context = `Invoice ${invoice.invoice_number}, amount ${invoice.amount} ${invoice.currency}, due ${invoice.due_date}, status ${invoice.status}, client ${client?.name || 'unknown'}.`;
        }

        const genAI = new GoogleGenerativeAI(requireServerEnv('GEMINI_API_KEY'));
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const prompt = `
            You are an elite, highly professional B2B credit controller and psychologist acting as an AI assistant for a SaaS application called Flowcent. Your job is to analyze excuses given by clients for delayed invoice payments.

            Analyze the following excuse from a client. Consider standard business practices, psychological delay tactics, and typical financial workflows.
            
            Context about the invoice/client (optional): ${context}
            The Client's Excuse: "${excuse}"

            Return a strict JSON response with the following structure:
            {
                "truth_probability": number (0 to 100, representing how likely this excuse is genuine vs a delay tactic),
                "intent_category": string (e.g., "Cashflow Issue", "Bureaucratic Delay", "Dispute", "Evasion", "Genuine Oversight"),
                "analysis": string (A concise, objective, 2-3 sentence professional analysis of what the client is likely doing or thinking),
                "suggested_response": string (A highly professional, firm, yet polite email response that the freelancer can copy and send back to the client to safely force action without ruining the relationship)
            }
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        // Ensure the response is parsed as JSON
        const parsedAnalysis = analysisSchema.parse(JSON.parse(responseText));

        await supabase.from('users').update({
            ai_usage_this_month: (profile.ai_usage_this_month || 0) + 1,
        }).eq('id', user.id);

        return NextResponse.json(parsedAnalysis);

    } catch (error: unknown) {
        console.error('AI Analysis error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze the excuse. Ensure the AI service is configured properly.' },
            { status: 500 }
        );
    }
}
