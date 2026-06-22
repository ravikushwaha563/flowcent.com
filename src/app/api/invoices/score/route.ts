import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// POST /api/invoices/score - Calculate payment intent score for an invoice
export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userInfo = verifyToken(authHeader.substring(7));
        if (!userInfo) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const { invoiceId } = await req.json();
        if (!invoiceId) return NextResponse.json({ error: 'invoiceId required' }, { status: 400 });

        // Fetch the invoice with client history
        const { data: invoice, error: invError } = await supabaseAdmin
            .from('invoices')
            .select('*, clients(id, name, email)')
            .eq('id', invoiceId)
            .eq('user_id', userInfo.userId)
            .single();

        if (invError || !invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });

        // Fetch client's payment history (other invoices)
        const { data: clientHistory } = await supabaseAdmin
            .from('invoices')
            .select('status, due_date, paid_at, amount')
            .eq('client_id', invoice.client_id)
            .eq('user_id', userInfo.userId)
            .neq('id', invoiceId);

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
        if (clientHistory && clientHistory.length > 0) {
            const paidOnTime = clientHistory.filter(inv => {
                if (inv.status !== 'paid' || !inv.paid_at) return false;
                return new Date(inv.paid_at) <= new Date(inv.due_date);
            });
            const totalPaid = clientHistory.filter(inv => inv.status === 'paid').length;
            const historyRate = totalPaid / clientHistory.length;

            if (historyRate >= 0.8) {
                score += 20;
                factors.push({ label: 'Good payment history', impact: +20, detail: `Paid ${totalPaid}/${clientHistory.length} invoices` });
            } else if (historyRate >= 0.5) {
                score += 5;
                factors.push({ label: 'Average payment history', impact: +5, detail: `Paid ${totalPaid}/${clientHistory.length} invoices` });
            } else {
                score -= 15;
                factors.push({ label: 'Poor payment history', impact: -15, detail: `Only paid ${totalPaid}/${clientHistory.length} invoices` });
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

        // 4. Invoice amount (higher = slightly riskier)
        if (invoice.amount > 500000) {
            score -= 5;
            factors.push({ label: 'High-value invoice', impact: -5, detail: 'Large amounts take longer to approve' });
        } else if (invoice.amount < 50000) {
            score += 5;
            factors.push({ label: 'Small invoice', impact: +5, detail: 'Small amounts are paid faster' });
        }

        // Clamp score between 0 and 100
        score = Math.max(0, Math.min(100, score));

        // Determine label & color
        let label = 'Low';
        let color = '#f87171'; // red
        if (score >= 70) { label = 'High'; color = '#34d399'; }
        else if (score >= 45) { label = 'Medium'; color = '#fbbf24'; }

        // Update invoice score in DB
        await supabaseAdmin
            .from('invoices')
            .update({ payment_intent_score: score, updated_at: new Date().toISOString() })
            .eq('id', invoiceId);

        return NextResponse.json({
            score, label, color, factors,
            summary: `${label} likelihood of payment (${score}/100)`
        });

    } catch (error) {
        console.error('Score error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
