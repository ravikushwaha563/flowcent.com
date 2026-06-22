'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { FileText, Zap, Plus, X, Bot, Mail, Check, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import UpgradeModal from '@/components/dashboard/UpgradeModal';

interface Client { id: string; name: string; email: string; company?: string; }
interface Invoice {
    id: string; invoice_number: string; amount: number; currency: string;
    due_date: string; status: string; created_at: string; clients: Client;
    current_stage?: number; next_followup_date?: string; auto_followup?: boolean;
    payment_intent_score?: number;
}
interface ScoreResult { score: number; label: string; color: string; factors: { label: string; impact: number; detail: string }[]; }

// Follow-up stage config
const STAGES = [
    { num: 1, label: 'Stage 1 — Friendly Reminder', desc: 'Polite, "just in case it slipped"', color: '#6b96ff' },
    { num: 2, label: 'Stage 2 — Follow-up', desc: 'Firm but professional second notice', color: '#a78bfa' },
    { num: 3, label: 'Stage 3 — 2nd Follow-up', desc: 'Asks for expected payment date', color: '#fbbf24' },
    { num: 4, label: 'Stage 4 — Urgent', desc: 'Strong tone, immediate action required', color: '#fb923c' },
    { num: 5, label: 'Stage 5 — Final Notice', desc: 'Last warning before further action', color: '#f87171' },
];

// Follow-up modal
function FollowUpModal({
    invoice, onClose, onSent, token
}: {
    invoice: Invoice; onClose: () => void;
    onSent: (msg: string) => void; token: string | null;
}) {
    // Default to current_stage if available, else 1
    const [stage, setStage] = useState(invoice.current_stage ? Math.min(invoice.current_stage, 5) : 1);
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
        setSending(true);
        try {
            const res = await fetch('/api/invoices/send-followup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ invoiceId: invoice.id, stage }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            onSent(`✉️ Stage ${stage} follow-up sent to ${invoice.clients.email}!`);
            onClose();
        } catch (err: any) {
            toast.error(err.message || 'Failed to send follow-up');
        } finally {
            setSending(false);
        }
    };

    const selectedStage = STAGES[stage - 1] || STAGES[0];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
            <div className="w-full max-w-md glass-card p-6 space-y-5 anim-up" style={{ borderColor: 'rgba(95,135,255,0.25)' }}>
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-white">Send Follow-up Email</h3>
                        <p className="text-xs text-white/40 mt-0.5">Invoice <span className="text-blue-400 font-mono">{invoice.invoice_number}</span> → {invoice.clients.name}</p>
                    </div>
                    <button onClick={onClose} className="text-white/30 hover:text-white/60 text-xl transition-colors">✕</button>
                </div>

                <div className="divider-grad"></div>

                {/* Stage selector */}
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-white/35 uppercase tracking-widest">Select Stage</p>
                    <div className="space-y-2">
                        {STAGES.map(s => (
                            <button key={s.num} onClick={() => setStage(s.num)}
                                className="w-full text-left p-3 rounded-xl transition-all"
                                style={{
                                    background: stage === s.num ? `${s.color}12` : 'rgba(255,255,255,0.02)',
                                    border: stage === s.num ? `1px solid ${s.color}35` : '1px solid rgba(255,255,255,0.06)',
                                }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                        style={{ background: stage === s.num ? `${s.color}25` : 'rgba(255,255,255,0.05)', color: stage === s.num ? s.color : '#4a4a6a' }}>
                                        {s.num}
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold" style={{ color: stage === s.num ? s.color : '#c4c4d4' }}>{s.label}</p>
                                        <p className="text-xs text-white/30">{s.desc}</p>
                                    </div>
                                    {stage === s.num && <span className="ml-auto text-xs" style={{ color: s.color }}>●</span>}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Preview note */}
                <div className="p-3 rounded-xl text-xs text-white/40 flex items-start gap-2"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Mail size={14} className="mt-0.5 shrink-0" />
                    <span>
                        <span style={{ color: selectedStage.color }}>{selectedStage.label}</span> email will be sent from your Gmail to <strong className="text-white/60">{invoice.clients.email}</strong>
                    </span>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button onClick={onClose} className="btn-outline px-4 py-2 text-xs flex-1">Cancel</button>
                    <button onClick={handleSend} disabled={sending} className="btn-primary px-4 py-2 text-xs flex-1">
                        {sending ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                                Sending...
                            </span>
                        ) : `Send Stage ${stage} →`}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function InvoicesPage() {
    const { token } = useAuth();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ clientId: '', invoiceNumber: '', amount: '', currency: 'INR', dueDate: '', autoFollowup: false });
    const [submitting, setSubmitting] = useState(false);
    const [paidLoading, setPaidLoading] = useState<string | null>(null);
    const [followUpInvoice, setFollowUpInvoice] = useState<Invoice | null>(null);
    const [scores, setScores] = useState<Record<string, ScoreResult>>({});
    const [scoreLoading, setScoreLoading] = useState<string | null>(null);
    const [showUpgrade, setShowUpgrade] = useState(false);
    const [upgradeMessage, setUpgradeMessage] = useState('');

    const calculateScore = async (invoiceId: string) => {
        setScoreLoading(invoiceId);
        try {
            const res = await fetch('/api/invoices/score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ invoiceId }),
            });
            const data = await res.json();
            if (!res.ok) {
                if (data.error === 'LIMIT_EXCEEDED') {
                    setUpgradeMessage(data.message);
                    setShowUpgrade(true);
                    return;
                }
                throw new Error(data.error);
            }
            setScores(prev => ({ ...prev, [invoiceId]: data }));
        } catch (e: any) { toast.error(e.message || 'Failed to score'); }
        finally { setScoreLoading(null); }
    };

    const runAutomation = async () => {
        toast.info('checking for due follow-ups...', { id: 'cron' });
        try {
            const res = await fetch('/api/cron/process-followups');
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Automation can only run from the secure scheduler');
            if (data.processed > 0) {
                toast.success(`Sent ${data.processed} follow-ups!`, { id: 'cron' });
                fetchData();
            } else {
                toast.success('No follow-ups due right now.', { id: 'cron' });
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to run automation', { id: 'cron' });
        }
    };

    const fetchData = async () => {
        try {
            const [ir, cr] = await Promise.all([
                fetch('/api/invoices', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/clients', { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            const [id, cd] = await Promise.all([ir.json(), cr.json()]);
            setInvoices(id.invoices || []);
            setClients(cd.clients || []);
        } finally { setLoading(false); }
    };

    useEffect(() => { if (token) fetchData(); }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSubmitting(true);
        try {
            const res = await fetch('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) {
                if (data.error === 'LIMIT_EXCEEDED') {
                    setSubmitting(false);
                    setUpgradeMessage(data.message || 'Limit exceeded');
                    setShowUpgrade(true);
                    return;
                }
                throw new Error(data.error || 'Failed to create invoice');
            }
            setInvoices(prev => [data.invoice, ...prev]);
            setShowForm(false);
            setFormData({ clientId: '', invoiceNumber: '', amount: '', currency: 'INR', dueDate: '', autoFollowup: false });
            toast.success('Invoice created!');
        } catch (err: any) { 
            toast.error(err.message || 'Failed to create invoice'); 
        } finally { setSubmitting(false); }
    };

    const markAsPaid = async (id: string) => {
        setPaidLoading(id);
        try {
            const res = await fetch(`/api/invoices/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status: 'paid' }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setInvoices(prev => prev.map(inv => inv.id === id ? data.invoice : inv));
            toast.success('Invoice marked as paid!');
        } finally { setPaidLoading(null); }
    };

    const getStatus = (status: string, dueDate: string) => {
        if (status === 'paid') return { label: '✓ Paid', cls: 'badge-paid' };
        if (new Date(dueDate) < new Date()) return { label: '⚠ Overdue', cls: 'badge-overdue' };
        return { label: '◷ Pending', cls: 'badge-pending' };
    };

    const fmt = (amount: number, currency: string) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);

    const totalPending = invoices.filter(i => i.status !== 'paid').reduce((a, i) => a + i.amount, 0);
    const totalPaid = invoices.filter(i => i.status === 'paid').reduce((a, i) => a + i.amount, 0);

    return (
        <div className="min-h-screen bg-[#09090f] text-white">
            {/* Ambient */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-[0.035]"
                    style={{ background: 'radial-gradient(circle, #6b96ff 0%, transparent 70%)' }} />
                <div className="absolute bottom-1/4 left-0 w-64 h-64 rounded-full opacity-[0.025]"
                    style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 70%)' }} />
            </div>

            <UpgradeModal
                isOpen={showUpgrade}
                onClose={() => setShowUpgrade(false)}
                token={token}
                message={upgradeMessage}
            />

            <div className="relative z-10 p-5 sm:p-7 max-w-7xl mx-auto space-y-6">
                {/* Follow-up modal */}
                {followUpInvoice && (
                    <FollowUpModal
                        invoice={followUpInvoice}
                        token={token}
                        onClose={() => setFollowUpInvoice(null)}
                        onSent={(msg) => toast.success(msg)}
                    />
                )}

                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Invoices</h1>
                        <p className="text-sm text-white/35 mt-1">{invoices.length} total · {fmt(totalPending, 'INR')} pending</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={runAutomation} className="btn-outline text-xs px-4 py-2 hover:bg-white/5 disabled:opacity-50 flex items-center gap-2">
                            <Zap size={14} className="text-yellow-400" /> Run Automation
                        </button>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            disabled={clients.length === 0}
                            className={showForm ? 'btn-outline text-xs px-4 py-2 flex items-center gap-2' : 'btn-primary text-xs px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2'}
                        >
                            {showForm ? <><X size={14} /> Cancel</> : <><Plus size={14} /> New Invoice</>}
                        </button>
                    </div>
                </div>

                {/* Mini stat row */}
                {invoices.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: 'Collected', val: fmt(totalPaid, 'INR'), col: '#34d399' },
                            { label: 'Outstanding', val: fmt(totalPending, 'INR'), col: '#fbbf24' },
                            { label: 'Total Invoices', val: invoices.length, col: '#6b96ff' },
                        ].map(s => (
                            <div key={s.label} className="glass-card px-4 py-3 flex flex-col gap-1">
                                <span className="text-xs text-white/30">{s.label}</span>
                                <span className="text-lg font-bold" style={{ color: s.col }}>{s.val}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* No client warning */}
                {clients.length === 0 && !loading && (
                    <div className="px-4 py-3 rounded-xl text-sm text-yellow-400 flex items-center gap-3"
                        style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)' }}>
                        <AlertTriangle size={16} />
                        <span>Add a <a href="/dashboard/clients" className="underline font-semibold">client</a> first before creating invoices.</span>
                    </div>
                )}

                {/* Form */}
                {showForm && clients.length > 0 && (
                    <div className="glass-card p-6 anim-up" style={{ borderColor: 'rgba(95,135,255,0.2)' }}>
                        <p className="text-xs font-semibold text-white/35 uppercase tracking-widest mb-5">New Invoice</p>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-white/35 uppercase tracking-widest">Client *</label>
                                <select className="input-premium" value={formData.clientId} onChange={e => setFormData(p => ({ ...p, clientId: e.target.value }))} required>
                                    <option value="">Select a client...</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ''}</option>)}
                                </select>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {[
                                    { key: 'invoiceNumber', label: 'Invoice # *', placeholder: 'INV-2026-001', type: 'text', required: true },
                                    { key: 'dueDate', label: 'Due Date *', placeholder: '', type: 'date', required: true },
                                    { key: 'amount', label: 'Amount *', placeholder: '50000', type: 'number', required: true },
                                ].map(f => (
                                    <div key={f.key} className="space-y-1.5">
                                        <label className="text-xs font-semibold text-white/35 uppercase tracking-widest">{f.label}</label>
                                        <input type={f.type} placeholder={f.placeholder} className="input-premium"
                                            value={formData[f.key as keyof typeof formData] as string}
                                            onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))}
                                            required={f.required} min={f.type === 'number' ? 1 : undefined} />
                                    </div>
                                ))}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-white/35 uppercase tracking-widest">Currency</label>
                                    <select className="input-premium" value={formData.currency} onChange={e => setFormData(p => ({ ...p, currency: e.target.value }))}>
                                        {['INR', 'USD', 'EUR', 'GBP'].map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Auto-followup toggle */}
                            <div className="p-4 rounded-xl flex items-center justify-between" style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.15)' }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center">
                                        <Bot size={16} strokeWidth={2} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-white">Enable Automated Follow-ups</h4>
                                        <p className="text-xs text-white/40">Automatically send stage 1-5 emails when overdue</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={formData.autoFollowup} onChange={e => setFormData(p => ({ ...p, autoFollowup: e.target.checked }))} />
                                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                </label>
                            </div>
                            <button type="submit" disabled={submitting} className="btn-primary w-full py-2.5 text-sm mt-3">
                                {submitting ? 'Creating...' : 'Create Invoice'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Table */}
                {loading ? (
                    <div className="premium-table">
                        <div className="premium-table-header px-5 py-3.5 grid grid-cols-5 gap-4">
                            {Array(5).fill(0).map((_, i) => <div key={i} className="skeleton h-3 rounded w-16"></div>)}
                        </div>
                        {Array(4).fill(0).map((_, i) => (
                            <div key={i} className="premium-table-row px-5 py-4 grid grid-cols-5 gap-4 items-center">
                                {[12, 20, 14, 16, 10].map((w, j) => <div key={j} className={`skeleton h-3 rounded w-${w}`}></div>)}
                            </div>
                        ))}
                    </div>
                ) : invoices.length === 0 ? (
                    <div className="glass-card p-16 text-center anim-up border border-dashed border-white/[0.08] hover:border-blue-500/30 transition-all duration-300">
                        <div className="relative inline-flex mb-6 group">
                            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full group-hover:bg-blue-500/30 transition-colors"></div>
                            <div className="w-20 h-20 rounded-3xl bg-[#0d0d18] border border-white/[0.08] flex items-center justify-center relative shadow-2xl">
                                <FileText size={32} strokeWidth={1.5} className="text-blue-400 drop-shadow-[0_0_15px_rgba(95,135,255,0.5)]" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">No invoices yet</h3>
                        <p className="text-sm text-white/40 max-w-sm mx-auto mb-8 leading-relaxed">
                            Create your first professional invoice. Flowcent will track it and ensure you get paid on time.
                        </p>
                        {clients.length > 0 && (
                            <button onClick={() => setShowForm(true)} className="btn-primary text-sm px-6 py-3 flex items-center gap-2 mx-auto shadow-[0_0_20px_rgba(95,135,255,0.25)] hover:shadow-[0_0_30px_rgba(95,135,255,0.4)]">
                                <Plus size={16} /> Create First Invoice
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="premium-table anim-up">
                        <div className="premium-table-header">
                            <div className="grid gap-4 px-5 py-3.5" style={{ gridTemplateColumns: '1.2fr 1.5fr 1fr 1fr 1fr auto 1fr auto auto' }}>
                                {['Invoice #', 'Client', 'Amount', 'Due Date', 'Status', 'Intent Score', 'Automation', '', ''].map((h, i) => (
                                    <span key={i} className="text-xs font-semibold text-white/30 uppercase tracking-widest">{h}</span>
                                ))}
                            </div>
                        </div>
                        <div>
                            {invoices.map((invoice, i) => {
                                const status = getStatus(invoice.status, invoice.due_date);
                                const isUnpaid = invoice.status !== 'paid';
                                return (
                                    <div key={invoice.id} className="premium-table-row grid gap-4 items-center px-5 py-4 anim-up"
                                        style={{ gridTemplateColumns: '1.2fr 1.5fr 1fr 1fr 1fr auto 1fr auto auto', animationDelay: `${i * 0.04}s` }}>
                                        <a href={`/dashboard/invoices/${invoice.id}`}
                                            className="text-sm font-mono text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                                            title="View AI analysis →">
                                            {invoice.invoice_number}
                                        </a>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{invoice.clients?.name}</p>
                                            <p className="text-xs text-white/30 truncate">{invoice.clients?.email}</p>
                                        </div>
                                        <span className="text-sm font-bold text-white">{fmt(invoice.amount, invoice.currency)}</span>
                                        <span className="text-sm text-white/45">
                                            {new Date(invoice.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold whitespace-nowrap ${status.cls}`}>{status.label}</span>
                                        </div>

                                        {/* Intent Score Column */}
                                        {invoice.status !== 'paid' ? (() => {
                                            const s = scores[invoice.id];
                                            const isCalc = scoreLoading === invoice.id;
                                            return (
                                                <div className="flex items-center gap-1.5">
                                                    {s ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                                                                style={{ background: `${s.color}20`, color: s.color, border: `1px solid ${s.color}40` }}>
                                                                {s.score}
                                                            </div>
                                                            <span className="text-xs font-medium" style={{ color: s.color }}>{s.label}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-white/20">—</span>
                                                    )}
                                                    <button
                                                        onClick={() => calculateScore(invoice.id)}
                                                        disabled={isCalc}
                                                        className="w-5 h-5 rounded-md flex items-center justify-center text-white/20 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                                                        title="Recalculate score">
                                                        {isCalc ? (
                                                            <span className="w-3 h-3 border border-white/20 border-t-blue-400 rounded-full animate-spin block"></span>
                                                        ) : '↻'}
                                                    </button>
                                                </div>
                                            );
                                        })() : <span className="text-white/20 text-xs">—</span>}

                                        {/* Automation Column */}
                                        <div className="text-xs">
                                            {invoice.status === 'paid' ? (
                                                <span className="text-white/20">Inactive</span>
                                            ) : invoice.auto_followup ? (
                                                <div>
                                                    <div className="flex items-center gap-1.5 text-green-400 font-medium mb-0.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                                        <span>Active</span>
                                                    </div>
                                                    <p className="text-[10px] text-white/30">
                                                        Stage {invoice.current_stage || 1} · {invoice.next_followup_date ? new Date(invoice.next_followup_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'No date'}
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-white/30">Off</span>
                                            )}
                                        </div>

                                        {/* Mark Paid */}
                                        {isUnpaid ? (
                                            <button onClick={() => markAsPaid(invoice.id)} disabled={paidLoading === invoice.id}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-green-500/10 disabled:opacity-50"
                                                style={{ border: '1px solid rgba(52,211,153,0.2)', color: '#34d399' }}
                                                title="Mark as Paid">
                                                {paidLoading === invoice.id ? <span className="w-3.5 h-3.5 border-2 border-green-500/20 border-t-green-500 rounded-full animate-spin block"></span> : <Check size={14} strokeWidth={2.5} />}
                                            </button>
                                        ) : <span />}

                                        {/* Follow-up button */}
                                        {isUnpaid ? (
                                            <button onClick={() => setFollowUpInvoice(invoice)}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-blue-500/10"
                                                style={{ border: '1px solid rgba(95,135,255,0.2)', color: '#6b96ff' }}
                                                title="Send follow-up email">
                                                <Mail size={14} strokeWidth={2} />
                                            </button>
                                        ) : <span />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
