'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Users, Search, Plus, X, Building2, AlertTriangle } from 'lucide-react';
import UpgradeModal from '@/components/dashboard/UpgradeModal';

interface Client {
    id: string; name: string; email: string; phone?: string; company?: string;
    payment_history_score: number; avg_payment_delay: number; created_at: string;
    ai_trust_score?: number | null; ai_risk_level?: string | null;
    ai_trust_summary?: string | null; ai_scored_at?: string | null;
}

const ScoreBadge = ({ score, aiRisk }: { score: number; aiRisk?: string | null }) => {
    if (aiRisk === 'high_risk') return <span className="badge-overdue text-xs px-2.5 py-1 rounded-full font-semibold">⚠ High Risk</span>;
    if (aiRisk === 'risky') return <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: 'rgba(251,146,60,0.1)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.2)' }}>◷ Risky</span>;
    if (aiRisk === 'trusted') return <span className="badge-paid text-xs px-2.5 py-1 rounded-full font-semibold">✓ Trusted</span>;
    if (aiRisk === 'moderate') return <span className="badge-pending text-xs px-2.5 py-1 rounded-full font-semibold">◷ Moderate</span>;
    // Fallback to old score-based badges
    if (score >= 70) return <span className="badge-paid text-xs px-2.5 py-1 rounded-full font-semibold">✓ Good Payer</span>;
    if (score >= 40) return <span className="badge-pending text-xs px-2.5 py-1 rounded-full font-semibold">◷ Average</span>;
    return <span className="badge-overdue text-xs px-2.5 py-1 rounded-full font-semibold">⚠ Slow Payer</span>;
};

export default function ClientsPage() {
    const { token } = useAuth();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', company: '' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showUpgrade, setShowUpgrade] = useState(false);
    const [upgradeMessage, setUpgradeMessage] = useState('');

    const fetchClients = async () => {
        try {
            const res = await fetch('/api/clients', { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            setClients(data.clients || []);
        } finally { setLoading(false); }
    };

    useEffect(() => { if (token) fetchClients(); }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSubmitting(true); setError('');
        try {
            const res = await fetch('/api/clients', {
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
                throw new Error(data.error);
            }
            setClients(prev => [data.client, ...prev]);
            setShowForm(false);
            setFormData({ name: '', email: '', phone: '', company: '' });
        } catch (err: any) { setError(err.message); } finally { setSubmitting(false); }
    };

    const [search, setSearch] = useState('');

    const colors = ['#5f87ff', '#a78bfa', '#22d3ee', '#34d399', '#fb923c', '#f472b6'];
    const getColor = (name: string) => colors[name.charCodeAt(0) % colors.length];

    const good = clients.filter(c => c.payment_history_score >= 70).length;
    const slow = clients.filter(c => c.payment_history_score < 40).length;

    const filtered = clients.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        (c.company || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#09090f] text-white">
            {/* Ambient */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/3 w-72 h-72 rounded-full opacity-[0.04]"
                    style={{ background: 'radial-gradient(circle, #a78bfa 0%, transparent 70%)' }} />
            </div>

            <UpgradeModal
                isOpen={showUpgrade}
                onClose={() => setShowUpgrade(false)}
                token={token}
                message={upgradeMessage}
            />

            <div className="relative z-10 p-5 sm:p-7 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Clients</h1>
                        <p className="text-sm text-white/35 mt-1">{clients.length} client{clients.length !== 1 ? 's' : ''} · {good} good payers · {slow} slow payers</p>
                    </div>
                    <button onClick={() => setShowForm(!showForm)} className={showForm ? 'btn-outline text-xs px-4 py-2 flex items-center gap-2' : 'btn-primary text-xs px-4 py-2 flex items-center gap-2'}>
                        {showForm ? <><X size={14} /> Cancel</> : <><Plus size={14} /> Add Client</>}
                    </button>
                </div>

                {/* Search bar */}
                {clients.length > 0 && (
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                        <input
                            className="input-premium pl-8 w-full sm:max-w-xs"
                            placeholder="Search clients…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                )}

                {/* Form */}
                {showForm && (
                    <div className="glass-card p-6 anim-up" style={{ borderColor: 'rgba(95,135,255,0.2)' }}>
                        <p className="text-xs font-semibold text-white/35 uppercase tracking-widest mb-5">New Client</p>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                {[
                                    { key: 'name', label: 'Full Name *', placeholder: 'Ravi Kumar', type: 'text', required: true },
                                    { key: 'email', label: 'Email *', placeholder: 'ravi@company.com', type: 'email', required: true },
                                    { key: 'phone', label: 'Phone', placeholder: '+91 98765 43210', type: 'text', required: false },
                                    { key: 'company', label: 'Company', placeholder: 'Acme Corp', type: 'text', required: false },
                                ].map(f => (
                                    <div key={f.key} className="space-y-1.5">
                                        <label className="text-xs font-semibold text-white/35 uppercase tracking-widest">{f.label}</label>
                                        <input type={f.type} placeholder={f.placeholder} className="input-premium"
                                            value={formData[f.key as keyof typeof formData]}
                                            onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))}
                                            required={f.required} />
                                    </div>
                                ))}
                            </div>
                            {error && <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2"><AlertTriangle size={14} /> {error}</div>}
                            <button type="submit" disabled={submitting} className="btn-primary text-xs px-5 py-2.5">
                                {submitting ? 'Adding...' : 'Add Client →'}
                            </button>
                        </form>
                    </div>
                )}

                {/* List */}
                {loading ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array(6).fill(0).map((_, i) => (
                            <div key={i} className="stat-card-premium p-5 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="skeleton w-10 h-10 rounded-xl"></div>
                                    <div className="space-y-2"><div className="skeleton h-3 w-24 rounded"></div><div className="skeleton h-3 w-32 rounded"></div></div>
                                </div>
                                <div className="skeleton h-1.5 rounded-full"></div>
                            </div>
                        ))}
                    </div>
                ) : clients.length === 0 ? (
                    <div className="glass-card p-16 text-center anim-up border border-dashed border-white/[0.08] hover:border-blue-500/30 transition-all duration-300">
                        <div className="relative inline-flex mb-6 group">
                            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full group-hover:bg-blue-500/30 transition-colors"></div>
                            <div className="w-20 h-20 rounded-3xl bg-[#0d0d18] border border-white/[0.08] flex items-center justify-center relative shadow-2xl">
                                <Users size={32} strokeWidth={1.5} className="text-blue-400 drop-shadow-[0_0_15px_rgba(95,135,255,0.5)]" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">No clients yet</h3>
                        <p className="text-sm text-white/40 max-w-sm mx-auto mb-8 leading-relaxed">
                            Add your first client to start tracking their payment history and generating invoices.
                        </p>
                        <button onClick={() => setShowForm(true)} className="btn-primary text-sm px-6 py-3 flex items-center gap-2 mx-auto shadow-[0_0_20px_rgba(95,135,255,0.25)] hover:shadow-[0_0_30px_rgba(95,135,255,0.4)]">
                            <Plus size={16} /> Add First Client
                        </button>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((client, i) => {
                            const col = getColor(client.name);
                            const scorePct = client.payment_history_score;
                            return (
                                <div key={client.id} className="stat-card-premium p-5 space-y-4 anim-up" style={{ animationDelay: `${i * 0.05}s` }}>
                                    {/* Top */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                                                style={{ background: `linear-gradient(135deg, ${col}30, ${col}10)`, border: `1px solid ${col}25`, color: col }}>
                                                {client.name[0].toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-white truncate">{client.name}</p>
                                                <p className="text-xs text-white/35 truncate">{client.email}</p>
                                            </div>
                                        </div>
                                        <ScoreBadge score={client.payment_history_score} aiRisk={client.ai_risk_level} />
                                    </div>

                                    {client.company && (
                                        <p className="text-xs text-white/35 flex items-center gap-1.5 mt-2">
                                            <Building2 size={12} className="text-white/20" /> {client.company}
                                        </p>
                                    )}
                                    {client.phone && (
                                        <p className="text-xs text-white/35 flex items-center gap-1.5 mt-1 font-mono">
                                            📱 {client.phone}
                                        </p>
                                    )}

                                    {/* Score bar */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-white/30">Payment Score</span>
                                            <span className="font-semibold" style={{ color: col }}>{scorePct}/100</span>
                                        </div>
                                        <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                            <div className="h-1 rounded-full transition-all duration-700" style={{ width: `${scorePct}%`, background: col }}></div>
                                        </div>
                                    </div>

                                    {/* AI Trust Summary */}
                                    {client.ai_trust_summary && (
                                        <p className="text-[11px] text-white/30 leading-relaxed italic">
                                            🧠 {client.ai_trust_summary}
                                        </p>
                                    )}

                                    {/* Bottom stats */}
                                    <div className="pt-3 flex justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div>
                                            <p className="text-xs text-white/25">Avg Delay</p>
                                            <p className="text-sm font-bold text-white">{client.avg_payment_delay}<span className="text-white/30 text-xs"> days</span></p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-white/25">Since</p>
                                            <p className="text-sm font-medium text-white/60">{new Date(client.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
