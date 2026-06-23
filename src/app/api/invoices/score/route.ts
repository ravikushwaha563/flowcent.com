import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/server';
import { z } from 'zod';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

const requestSchema = z.object({ invoiceId: z.string().uuid() });

// POST /api/invoices/score - Calculate payment intent score for an invoice
export async function POST(req: NextRequest) {
    try {
        const { supabase, user, response } = await requireUser();
        if (!user) return response!;

        const parsedRequest = requestSchema.safeParse(await req.json());
        if (!parsedRequest.success) return NextResponse.json({ error: 'A valid invoice ID is required' }, { status: 400 });
        const { invoiceId } = parsedRequest.data;

        // Fetch the invoice with client history
        const { data: invoice, error: invError } = await supabase
            .from('invoices')
            .select('*, clients(id, name, email)')
            .eq('id', invoiceId)
            .eq('user_id', user.id)
            .single();

        if (invError || !invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        if (invoice.status !== 'pending') return NextResponse.json({ error: 'Only pending invoices can be scored' }, { status: 409 });

        // Fetch client's payment history (other invoices)
        const { data: clientHistory, error: historyError } = await supabase
            .from('invoices')
            .select('status, due_date, paid_at, amount')
            .eq('client_id', invoice.client_id)
            .eq('user_id', user.id)
            .neq('id', invoiceId);
        if (historyError) throw historyError;

        // ────── Scoring Algorithm ──────
        let score = 50; // Start at neutral
        const factors: { label: string; impact: number; detail: string }[] = [];

        const now = new Date();
        const dueDate = new Date(invoice.due_date);
        const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

        // 1. Days overdue (most impactful)
        if (daysOverdue <= 0) {
            score += 20;
            factors.push({ label: 'Not yet due', impact: +20, detail: `Due in ${Math.abs(daysOverdue)} days` });
        } else if (daysOverdue <= 7) {
            score -= 10;
            factors.push({ label: 'Slightly overdue', impact: -10, detail: `${daysOverdue} days past due` });
        } else if (daysOverdue <= 30) {
            score -= 25;
            factors.push({ label: 'Overdue', impact: -25, detail: `${daysOverdue} days past due` });
        } else {
            score -= 40;
            factors.push({ label: 'Severely overdue', impact: -40, detail: `${daysOverdue} days past due` });
        }

        // 2. Client payment history
        const relevantHistory = (clientHistory || []).filter(historyInvoice =>
            historyInvoice.status === 'paid'
            || (historyInvoice.status === 'pending' && new Date(historyInvoice.due_date) < now)
        );
        if (relevantHistory.length > 0) {
            const paidOnTime = relevantHistory.filter(inv => {
                if (inv.status !== 'paid' || !inv.paid_at) return false;
                return new Date(inv.paid_at) <= new Date(inv.due_date);
            });
            const totalPaid = relevantHistory.filter(inv => inv.status === 'paid').length;
            const historyRate = totalPaid / relevantHistory.length;

            if (historyRate >= 0.8) {
                score += 20;
                factors.push({ label: 'Good payment history', impact: +20, detail: `Paid ${totalPaid}/${relevantHistory.length} due invoices` });
            } else if (historyRate >= 0.5) {
                score += 5;
                factors.push({ label: 'Mixed payment history', impact: +5, detail: `Paid ${totalPaid}/${relevantHistory.length} due invoices` });
            } else {
                score -= 15;
                factors.push({ label: 'Limited payment history', impact: -15, detail: `Paid ${totalPaid}/${relevantHistory.length} due invoices` });
            }

            // On-time rate bonus
            if (paidOnTime.length > 0 && totalPaid > 0) {
                const onTimeRate = paidOnTime.length / totalPaid;
                if (onTimeRate >= 0.7) {
                    score += 10;
                    factors.push({ label: 'Pays on time', impact: +10, detail: `${Math.round(onTimeRate * 100)}% on-time rate` });
                }
            }
        } else {
            factors.push({ label: 'New client', impact: 0, detail: 'No payment history available' });
        }

        // 3. Follow-up stage
        const stage = invoice.current_stage || 1;
        if (stage >= 4) {
            score -= 20;
            factors.push({ label: 'High follow-up stage', impact: -20, detail: `Reached stage ${stage} of 5` });
        } else if (stage >= 2) {
            score -= 8;
            factors.push({ label: 'Multiple follow-ups sent', impact: -8, detail: `Currently at stage ${stage}` });
        }

        // Clamp score between 0 and 100
        score = Math.max(0, Math.min(100, score));

        // Determine label & color
        let label = 'Low';
        let color = '#f87171'; // red
        if (score >= 70) { label = 'High'; color = '#34d399'; }
        else if (score >= 45) { label = 'Medium'; color = '#fbbf24'; }

        // Update invoice score in DB
        const { error: updateError } = await createAdminSupabaseClient()
            .from('invoices')
            .update({ payment_intent_score: score, updated_at: new Date().toISOString() })
            .eq('id', invoiceId);
        if (updateError) throw updateError;

        return NextResponse.json({
            score, label, color, factors,
            summary: `${label} follow-up priority signal (${score}/100)`
        });

    } catch (error) {
        console.error('Score error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
