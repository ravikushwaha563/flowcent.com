import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

export interface ExtractedPromise {
    promise_text: string;
    promise_type: 'date_commitment' | 'partial_payment' | 'excuse' | 'dispute' | 'will_pay' | 'other';
    promised_date: string | null;
    confidence: number;
    sentiment: 'positive' | 'neutral' | 'negative';
    summary: string;
}

export interface AnalysisResult {
    promises: ExtractedPromise[];
    overall_intent: 'high' | 'medium' | 'low';
    intent_score: number;
    key_excuse: string | null;
    recommended_stage: number;
    analysis_notes: string;
}

const SYSTEM_PROMPT = `You are an AI assistant for Flowcent, a payment intelligence platform for Indian freelancers.
Analyze client email replies about unpaid invoices and extract structured data about payment promises and excuses.

Always respond with ONLY valid JSON — no markdown, no extra text, just the JSON object.

Promise types:
- date_commitment: client gives specific date they'll pay
- partial_payment: client offers partial payment
- excuse: reason for not paying (cash flow, busy, etc.)
- dispute: disputes the invoice amount or work
- will_pay: general promise without specific date
- other: anything else relevant

Intent scoring guide:
90-100: Committed with specific date → High
70-89: Willing to pay, needs nudge → High  
40-69: Uncertain/vague → Medium
20-39: Multiple excuses, risky → Low
0-19: Disputes or avoids → Low

Recommended stage: next follow-up stage (1=gentle reminder, 5=final legal notice)`;

const USER_PROMPT_TEMPLATE = (
    emailContent: string,
    clientName: string,
    invoiceAmount: string,
    dueDate: string
) => `Analyze this client email reply about an unpaid invoice.

Client: ${clientName}
Invoice Amount: ${invoiceAmount}
Due Date: ${dueDate}

Client's Email:
---
${emailContent}
---

Return this exact JSON structure:
{
  "promises": [
    {
      "promise_text": "exact quote or close paraphrase",
      "promise_type": "date_commitment|partial_payment|excuse|dispute|will_pay|other",
      "promised_date": "YYYY-MM-DD or null",
      "confidence": 85,
      "sentiment": "positive|neutral|negative",
      "summary": "one sentence summary"
    }
  ],
  "overall_intent": "high|medium|low",
  "intent_score": 75,
  "key_excuse": "main excuse in one line or null",
  "recommended_stage": 2,
  "analysis_notes": "brief analyst note"
}`;

export async function analyzeEmailForExcuses(
    emailContent: string,
    clientName: string,
    invoiceAmount: string,
    dueDate: string
): Promise<AnalysisResult> {
    const chatCompletion = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: USER_PROMPT_TEMPLATE(emailContent, clientName, invoiceAmount, dueDate) },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1,
        response_format: { type: 'json_object' },
    });

    const text = chatCompletion.choices[0]?.message?.content || '{}';
    const parsed: AnalysisResult = JSON.parse(text);
    return parsed;
}

export async function generateSmartReply(
    clientName: string,
    invoiceNumber: string,
    amount: string,
    dueDate: string,
    excuseText: string,
    senderName: string
): Promise<string> {
    const chatCompletion = await groq.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: 'You write short, professional, firm but empathetic email responses for payment follow-ups. Keep replies under 100 words. No subject line needed.',
            },
            {
                role: 'user',
                content: `${senderName} needs to respond to ${clientName}'s payment excuse.
Invoice: ${invoiceNumber} for ${amount}, due ${dueDate}
Client's excuse: "${excuseText}"

Write a professional 3-4 sentence response that acknowledges their situation, reiterates payment expectation, and asks for a specific payment date.`,
            },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
    });

    return chatCompletion.choices[0]?.message?.content?.trim() || '';
}
