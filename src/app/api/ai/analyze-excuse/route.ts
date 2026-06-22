import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { requireUser } from '@/lib/auth/server';
import { checkAiLimit, PlanType } from '@/lib/plan-limits';
import { requireServerEnv } from '@/lib/env/server';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(requireServerEnv('GEMINI_API_KEY'));

export async function POST(req: NextRequest) {
    try {
        const { supabase, user, response } = await requireUser();
        if (!user) return response!;

        const { excuse, context } = await req.json();

        if (!excuse) {
            return NextResponse.json({ error: 'Please provide a client excuse to analyze.' }, { status: 400 });
        }

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

        // Initialize the model (using 1.5-flash for speed and cost-effectiveness in analysis tasks)
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const prompt = `
            You are an elite, highly professional B2B credit controller and psychologist acting as an AI assistant for a SaaS application called Flowcent. Your job is to analyze excuses given by clients for delayed invoice payments.

            Analyze the following excuse from a client. Consider standard business practices, psychological delay tactics, and typical financial workflows.
            
            Context about the invoice/client (optional): ${context || 'None provided'}
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
        const parsedAnalysis = JSON.parse(responseText);

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
