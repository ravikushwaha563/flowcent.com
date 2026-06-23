'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { InvoicePDF } from '@/components/InvoicePDF';
import RazorpayButton from '@/components/RazorpayButton';
import { CreditCard, CheckCircle2, Link2, XCircle } from 'lucide-react';
import ExcuseAnalyzerModal from '@/components/dashboard/ExcuseAnalyzerModal';
import { toast } from 'sonner';
import Link from 'next/link';
import { getErrorMessage } from '@/lib/errors';

interface Client { id: string; name: string; email: string; company?: string; }
interface Invoice {
    id: string; invoice_number: string; amount: number; currency: string;
    due_date: string; status: string; payment_intent_score: number;
    clients: Client; created_at: string; paid_at?: string; public_token: string;
}
interface ClientPromise {
    id: string; promise_text: string; promise_type: string;
    promised_date: string | null; fulfilled: boolean; created_at: string;
}
interface ScoreResult {
    score: number; label: string; color: string;
    factors: { label: string; impact: number; detail: string }[];
    summary: string;
}

const PROMISE_TYPE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
    date_commitment: { label: 'Date Committed', color: '#34d399', icon: '📅' },
    partial_payment: { label: 'Partial Payment', color: '#6b96ff', icon: '💰' },
    excuse: { label: 'Excuse', color: '#fbbf24', icon: '🚧' },
    dispute: { label: 'Dispute', color: '#f87171', icon: '⚠️' },
    will_pay: { label: 'Will Pay', color: '#a78bfa', icon: '✋' },
    other: { label: 'Other', color: '#94a3b8', icon: '📝' },
};

function IntentBar({ score }: { score: number }) {
    const color = score >= 70 ? '#34d399' : score >= 40 ? '#fbbf24' : '#f87171';
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center">
                <span className="text-xs text-white/35">Payment Intent Score</span>
                <span className="text-sm font-bold" style={{ color }}>{score}/100</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${score}%`, background: `linear-gradient(90deg, ${color}aa, ${color})` }} />
            </div>
        </div>
    );
}

function StripeCheckoutButton({ publicToken, amount, currency }: {
    publicToken: string; amount: number; currency: string;
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleStripeCheckout = async () => {
        setLoading(true); setError('');
        try {
            const res = await fetch('/api/payments/stripe-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ publicToken }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create Stripe session');
            window.location.href = data.url;
        } catch (error: unknown) {
            setError(getErrorMessage(error, 'Failed to create Stripe session'));
            setLoading(false);
        }
    };

    const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

    return (
        <div className="space-y-2">
            <button
                onClick={handleStripeCheckout}
                disabled={loading}
                className="btn-primary text-sm px-5 py-2.5 flex items-center gap-2 disabled:opacity-50 w-full justify-center"
            >
                {loading ? (
                    <><span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Redirecting to Stripe...</>
                ) : (
                    <><CreditCard size={16} /> Pay {formatted} via Stripe</>
                )}
            </button>
            {error && <p className="text-xs text-red-400 text-center">{error}</p>}
        </div>
    );
}

type PageParams = globalThis.Promise<{ id: string }>;

export default function InvoiceDetailPage({ params }: { params: PageParams }) {
    // Next.js 16: params is a Promise — must use React.use() to unwrap
    const { id } = use(params);
    const { isAuthenticated } = useAuth();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [promises, setPromises] = useState<ClientPromise[]>([]);
    const [loading, setLoading] = useState(true);
    const [successMsg, setSuccessMsg] = useState('');
    const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
    const [scoringLoading, setScoringLoading] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [isExcuseModalOpen, setIsExcuseModalOpen] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const fetchData = useCallback(async (invoiceId: string) => {
        try {
            const [invoiceResponse, promisesResponse] = await globalThis.Promise.all([
                fetch(`/api/invoices/${invoiceId}`),
                fetch(`/api/invoices/analyze-excuse?invoiceId=${invoiceId}`),
            ]);
            const [invoiceData, promisesData] = await globalThis.Promise.all([invoiceResponse.json(), promisesResponse.json()]);
            setInvoice(invoiceData.invoice);
            setPromises(promisesData.promises || []);
        } finally {
            setLoading(false);
        }
    }, []);

    const calculateScore = async () => {
        if (!id) return;
        setScoringLoading(true);
        try {
            const res = await fetch('/api/invoices/score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invoiceId: id }),
            });
            const data = await res.json();
            if (res.ok) {
                setScoreResult(data);
                if (invoice) setInvoice({ ...invoice, payment_intent_score: data.score });
            }
        } catch (e) { console.error(e); }
        finally { setScoringLoading(false); }
    };

    const showSuccess = (msg: string) => {
        setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 4000);
    };

    useEffect(() => { if (isAuthenticated && id) fetchData(id); }, [isAuthenticated, id, fetchData]);

    const toggleFulfilled = async (promiseId: string, current: boolean) => {
        await fetch('/api/invoices/analyze-excuse', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ promiseId, fulfilled: !current }),
        });
        setPromises(prev => prev.map(p => p.id === promiseId ? { ...p, fulfilled: !current } : p));
    };

    const fmt = (amount: number, currency: string) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);

    if (loading) return (
        <div className="space-y-6 anim-fade max-w-3xl">
            <div className="skeleton h-8 rounded-xl w-48" />
            <div className="glass-card p-6"><div className="skeleton h-32 rounded-xl" /></div>
        </div>
    );

    if (!invoice) return (
        <div className="glass-card p-16 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-white/60">Invoice not found</p>
            <Link href="/dashboard/invoices" className="btn-primary mt-4 inline-block text-xs px-4 py-2">← Back</Link>
        </div>
    );

    const status = invoice.status === 'paid' ? 'paid' : invoice.status === 'cancelled' ? 'cancelled' :
        new Date(invoice.due_date) < new Date() ? 'overdue' : 'pending';

    return (
        <div className="space-y-6 anim-fade max-w-3xl">
            {/* Back + Header */}
            <div>
                <Link href="/dashboard/invoices" className="text-xs text-white/30 hover:text-white/60 transition-colors flex items-center gap-1 mb-4">
                    ← Back to Invoices
                </Link>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight font-mono">{invoice.invoice_number}</h1>
                        <p className="text-sm text-white/35 mt-1">{invoice.clients.name} · {invoice.clients.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {invoice.status === 'pending' && (
                            <button
                                onClick={() => {
                                    const url = `${window.location.origin}/pay/${invoice.public_token}`;
                                    navigator.clipboard.writeText(url);
                                    toast.success('Payment link copied to clipboard!');
                                }}
                                className="btn-outline text-xs px-4 py-1.5 flex items-center gap-2 hover:bg-white/[0.04]"
                            >
                                <Link2 size={13} /> Share Pay Link
                            </button>
                        )}
                        {isClient && (
                            <PDFDownloadLink
                                document={<InvoicePDF invoice={invoice} />}
                                fileName={`${invoice.invoice_number}-flowcent.pdf`}
                                className="btn-outline text-xs px-4 py-1.5 flex items-center gap-2 hover:bg-white/[0.04]"
                            >
                                {({ loading }) =>
                                    loading ? (
                                        <><span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></span> Generating...</>
                                    ) : (
                                        <><span>⬇</span> Download PDF</>
                                    )
                                }
                            </PDFDownloadLink>
                        )}
                        <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${status === 'paid' ? 'badge-paid' : status === 'cancelled' ? 'bg-white/[0.06] text-white/45 border border-white/10' : status === 'overdue' ? 'badge-overdue' : 'badge-pending'
                            }`}>
                            {status === 'paid' ? '✓ Paid' : status === 'cancelled' ? 'Cancelled' : status === 'overdue' ? '⚠ Overdue' : '◷ Pending'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Success */}
            {successMsg && (
                <div className="px-4 py-3 rounded-xl text-sm bg-green-500/10 border border-green-500/20 text-green-400 anim-up">
                    {successMsg}
                </div>
            )}

            {/* Invoice Details Card */}
            <div className="glass-card p-6 space-y-5">
                <h2 className="text-xs font-semibold text-white/35 uppercase tracking-widest">Invoice Details</h2>
                <div className="grid sm:grid-cols-3 gap-5">
                    {[
                        { label: 'Amount', val: fmt(invoice.amount, invoice.currency), bold: true, color: '#fff' },
                        { label: 'Due Date', val: new Date(invoice.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), bold: false, color: '#9090a0' },
                        { label: 'Created', val: new Date(invoice.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }), bold: false, color: '#9090a0' },
                    ].map(f => (
                        <div key={f.label}>
                            <p className="text-xs text-white/30 mb-1">{f.label}</p>
                            <p className={`${f.bold ? 'text-xl font-bold' : 'text-sm'}`} style={{ color: f.color }}>{f.val}</p>
                        </div>
                    ))}
                </div>
                <div className="pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <IntentBar score={invoice.payment_intent_score || 50} />
                </div>
            </div>

            {/* Payment Action Card */}
            {invoice.status === 'pending' ? (
                <div className="glass-card p-6 space-y-4" style={{ borderColor: 'rgba(99,102,241,0.2)' }}>
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-400">
                            <CreditCard size={14} />
                        </span>
                        <div>
                            <h2 className="text-sm font-semibold text-white">Collect Payment</h2>
                            <p className="text-xs text-white/35">
                                {invoice.currency === 'INR'
                                    ? 'Accept payment via UPI, Card, NetBanking, or Wallet'
                                    : 'Accept payment via Card (Stripe Checkout)'}
                            </p>
                        </div>
                    </div>

                    {invoice.currency === 'INR' ? (
                        <RazorpayButton
                            publicToken={invoice.public_token}
                            invoiceNumber={invoice.invoice_number}
                            amount={invoice.amount}
                            currency={invoice.currency}
                            clientName={invoice.clients.name}
                            clientEmail={invoice.clients.email}
                            onSuccess={() => {
                                showSuccess('✅ Payment received! Invoice marked as paid.');
                                fetchData(id);
                            }}
                        />
                    ) : (
                        <StripeCheckoutButton
                            publicToken={invoice.public_token}
                            amount={invoice.amount}
                            currency={invoice.currency}
                        />
                    )}

                    <p className="text-[10px] text-white/20 text-center">
                        Secure checkout via {invoice.currency === 'INR' ? 'Razorpay' : 'Stripe'}
                    </p>
                </div>
            ) : invoice.status === 'paid' ? (
                <div className="glass-card p-6 flex items-center gap-3" style={{ borderColor: 'rgba(52,211,153,0.2)' }}>
                    <CheckCircle2 size={20} className="text-green-400" />
                    <div>
                        <p className="text-sm font-semibold text-green-400">Payment Received</p>
                        <p className="text-xs text-white/35">This invoice has been fully paid{invoice.paid_at ? ` on ${new Date(invoice.paid_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}.</p>
                    </div>
                </div>
            ) : (
                <div className="glass-card p-6 flex items-center gap-3">
                    <XCircle size={20} className="text-white/45" />
                    <div>
                        <p className="text-sm font-semibold text-white/65">Invoice Cancelled</p>
                        <p className="text-xs text-white/35">Reopen it from the invoice list before collecting payment.</p>
                    </div>
                </div>
            )}

            {/* Payment Intent Score Breakdown */}
            {invoice.status === 'pending' && (
                <div className="glass-card p-6 space-y-4" style={{ borderColor: 'rgba(52,211,153,0.15)' }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-green-500/15 flex items-center justify-center text-xs">📊</span>
                            <h2 className="text-sm font-semibold text-white">Payment Intent Score</h2>
                        </div>
                        <button onClick={calculateScore} disabled={scoringLoading}
                            className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1.5 disabled:opacity-50">
                            {scoringLoading ? (
                                <><span className="w-3 h-3 border border-white/30 border-t-green-400 rounded-full animate-spin"></span>Calculating...</>
                            ) : (
                                <><span>↻</span> Recalculate</>
                            )}
                        </button>
                    </div>

                    {scoreResult ? (
                        <div className="space-y-4 anim-up">
                            {/* Big score display */}
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-bold"
                                    style={{ background: `${scoreResult.color}15`, border: `1px solid ${scoreResult.color}30`, color: scoreResult.color }}>
                                    <span className="text-2xl">{scoreResult.score}</span>
                                    <span className="text-[9px] opacity-70">/ 100</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold" style={{ color: scoreResult.color }}>{scoreResult.label} Priority Signal</p>
                                    <p className="text-xs text-white/35 mt-0.5">{scoreResult.summary}</p>
                                </div>
                            </div>
                            {/* Factor breakdown */}
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-white/30 uppercase tracking-widest">Score Factors</p>
                                {scoreResult.factors.map((f, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl"
                                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div>
                                            <p className="text-xs font-medium text-white/75">{f.label}</p>
                                            <p className="text-xs text-white/30">{f.detail}</p>
                                        </div>
                                        <span className="text-xs font-bold ml-4"
                                            style={{ color: f.impact > 0 ? '#34d399' : f.impact < 0 ? '#f87171' : '#6b7280' }}>
                                            {f.impact > 0 ? `+${f.impact}` : f.impact === 0 ? '±0' : f.impact}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="py-4 text-center">
                            <p className="text-xs text-white/30">Click <strong className="text-white/50">Recalculate</strong> to generate a fresh payment intent score based on client history, overdue days, and follow-up stages.</p>
                        </div>
                    )}
                </div>
            )}

            {/* AI Excuse Analyzer Trigger */}
            <div className="glass-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6" style={{ borderColor: 'rgba(59,130,246,0.2)', background: 'linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(10,15,28,0) 100%)' }}>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex flex-col items-center justify-center shrink-0">
                        <span className="text-xl">🤖</span>
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                            AI Reply Analyzer <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-[10px] text-blue-400 font-bold tracking-widest uppercase border border-blue-500/20">AI Assisted</span>
                        </h2>
                        <p className="text-xs text-white/50 mt-1 leading-relaxed">
                            Review commitment details in a client's reply and draft a professional response.<br className="hidden sm:block" /> AI output is advisory and should be verified before sending.
                        </p>
                    </div>
                </div>
                <button 
                    onClick={() => setIsExcuseModalOpen(true)}
                    className="relative group overflow-hidden rounded-xl border border-blue-500/30 bg-blue-500/10 px-6 py-3 shrink-0"
                >
                    <div className="absolute inset-0 bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.4)_0%,transparent_70%)] transition-opacity duration-500" />
                    <div className="relative flex items-center gap-2">
                        <span className="w-4 h-4 text-blue-400">✨</span>
                        <span className="text-sm font-semibold text-white tracking-wide">Analyze Excuse</span>
                    </div>
                </button>
            </div>
            <ExcuseAnalyzerModal 
                isOpen={isExcuseModalOpen} 
                onClose={() => setIsExcuseModalOpen(false)} 
                invoiceContext={invoice} 
            />
            {/* Promise History */}
            <div className="glass-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xs font-semibold text-white/35 uppercase tracking-widest">Promise History</h2>
                    <span className="text-xs text-white/25">{promises.length} recorded</span>
                </div>

                {promises.length === 0 ? (
                    <div className="py-10 text-center">
                        <div className="text-3xl mb-3 opacity-40">🤝</div>
                        <p className="text-sm text-white/30">No promises analyzed yet</p>
                        <p className="text-xs text-white/20 mt-1">Paste a client email above to extract promises</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {promises.map((p, i) => {
                            const cfg = PROMISE_TYPE_CONFIG[p.promise_type] || PROMISE_TYPE_CONFIG.other;
                            return (
                                <div key={p.id} className="flex items-start gap-3 p-4 rounded-xl anim-up"
                                    style={{ animationDelay: `${i * 0.05}s`, background: p.fulfilled ? 'rgba(52,211,153,0.04)' : 'rgba(255,255,255,0.02)', border: `1px solid ${p.fulfilled ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.06)'}` }}>
                                    <span className="text-lg shrink-0 mt-0.5">{cfg.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                                                style={{ background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}25` }}>
                                                {cfg.label}
                                            </span>
                                            {p.promised_date && (
                                                <span className="text-xs text-white/30">
                                                    📅 {new Date(p.promised_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                </span>
                                            )}
                                            {p.fulfilled && <span className="text-xs text-green-400">✓ Fulfilled</span>}
                                        </div>
                                        <p className="text-sm text-white/70 leading-relaxed">"{p.promise_text}"</p>
                                        <p className="text-xs text-white/25 mt-1">
                                            {new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                                        </p>
                                    </div>
                                    <button onClick={() => toggleFulfilled(p.id, p.fulfilled)}
                                        className="shrink-0 text-xs px-2.5 py-1.5 rounded-lg transition-all"
                                        style={{
                                            border: `1px solid ${p.fulfilled ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.08)'}`,
                                            color: p.fulfilled ? '#34d399' : '#4a4a6a',
                                        }}>
                                        {p.fulfilled ? '✓' : 'Mark Done'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
