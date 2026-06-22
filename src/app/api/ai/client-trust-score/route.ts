import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { checkAiLimit, PlanType } from '@/lib/plan-limits';
import { requireServerEnv } from '@/lib/env/server';

const genAI = new GoogleGenerativeAI(requireServerEnv('GEMINI_API_KEY'));

export async function POST(req: NextRequest) {
    try {
        const { supabase, user: authUser, response } = await requireUser();
        if (!authUser) return response!;

        const { clientId } = await req.json();
        if (!clientId) {
            return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
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
        } // 1. Fetch client info
        const { data: client, error: clientErr } = await supabase
            .from('clients')
            .select('*')
            .eq('id', clientId)
            .eq('user_id', authUser.id)
            .single();

        if (clientErr || !client) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        // 2. Fetch all invoices for this client
        const { data: invoices } = await supabase
            .from('invoices')
            .select('id, invoice_number, amount, currency, due_date, status, created_at, paid_at, payment_intent_score, current_stage')
            .eq('client_id', clientId)
            .eq('user_id', authUser.id)
            .order('created_at', { ascending: false });

        // 3. Fetch all logged promises/excuses
        const { data: promises } = await supabase
            .from('promises')
            .select('*, invoices!inner(client_id, user_id)')
            .eq('invoices.client_id', clientId)
            .eq('invoices.user_id', authUser.id)
            .order('created_at', { ascending: false })
            .limit(20);

        // 4. Build detailed context for AI
        const invoiceSummary = (invoices || []).map(inv => {
            const dueDate = new Date(inv.due_date);
            const paidDate = inv.paid_at ? new Date(inv.paid_at) : null;
            const delay = paidDate ? Math.ceil((paidDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : null;
            return `Invoice ${inv.invoice_number}: ${inv.amount} ${inv.currency}, Due: ${inv.due_date}, Status: ${inv.status}${paidDate ? `, Paid: ${inv.paid_at} (${delay! > 0 ? delay + ' days late' : 'on time'})` : ''}, Intent Score: ${inv.payment_intent_score || 'N/A'}`;
        }).join('\n');

        const promiseSummary = (promises || []).map(p =>
            `${p.promise_type}: "${p.promise_text}" (${p.fulfilled ? 'FULFILLED' : 'BROKEN'}) on ${p.created_at}`
        ).join('\n');

        const totalInvoices = (invoices || []).length;
        const paidInvoices = (invoices || []).filter(i => i.status === 'paid').length;
        const overdueInvoices = (invoices || []).filter(i => i.status !== 'paid' && new Date(i.due_date) < new Date()).length;

        // 5. Call Gemini AI
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are Flowcent AI — an expert payment behavior analyst for freelancers. Analyze this client's complete payment history and generate a trust assessment.

## Client Profile
- Name: ${client.name}
- Email: ${client.email}
- Company: ${client.company || 'N/A'}
- Total Invoices: ${totalInvoices}
- Paid: ${paidInvoices}, Outstanding: ${totalInvoices - paidInvoices}, Overdue: ${overdueInvoices}
- Current Payment Score: ${client.payment_history_score}/100
- Avg Payment Delay: ${client.avg_payment_delay} days

## Invoice History
${invoiceSummary || 'No invoices yet.'}

## Logged Promises & Excuses
${promiseSummary || 'No promises or excuses logged.'}

## Your Task
Analyze ALL available data and produce a JSON response with:

{
  "trust_score": <0-100 integer>,
  "risk_level": "<trusted|moderate|risky|high_risk>",
  "summary": "<1 sentence summary of this client's payment behavior>",
  "factors": [
    { "label": "<factor name>", "impact": "<positive|negative|neutral>", "detail": "<brief explanation>" }
  ],
  "recommendation": "<actionable advice for the freelancer, e.g. 'Safe to extend net-30 terms' or 'Demand 50% upfront for future projects'>",
  "trend": "<improving|stable|declining>"
}

Rules:
- trust_score: 80-100 = trusted, 50-79 = moderate, 25-49 = risky, 0-24 = high_risk
- If no invoices exist, give a neutral score of 50 with "New client — no payment data yet"
- Be specific and data-driven, reference actual invoice numbers and delays
- The recommendation must be actionable and practical
- Return ONLY the JSON object, no markdown or extra text`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();

        // Parse JSON from AI response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return NextResponse.json({ error: 'AI returned invalid format' }, { status: 500 });
        }

        const aiData = JSON.parse(jsonMatch[0]);

        // Save to database
        await supabase
            .from('clients')
            .update({
                ai_trust_score: aiData.trust_score,
                ai_risk_level: aiData.risk_level,
                ai_trust_summary: aiData.summary,
                ai_scored_at: new Date().toISOString(),
            })
            .eq('id', clientId);

        // Update ai usage
        await supabase
            .from('users')
            .update({ ai_usage_this_month: (user.ai_usage_this_month || 0) + 1 })
            .eq('id', authUser.id);

        return NextResponse.json({
            success: true,
            analysis: aiData,
        });
    } catch (err: unknown) {
        console.error('Client trust score error:', err);
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to generate trust score' }, { status: 500 });
    }
}
