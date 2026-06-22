'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import {
    CalendarClock, Coins, Building2, CircleDashed, Scale, Ghost,
    Puzzle, Mail, AlertTriangle, Phone, Search, BookOpen, Rocket,
    Bot, Brain, BarChart3, FileText, Users, ShieldCheck, TrendingUp, TrendingDown, Minus, Sparkles, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import UpgradeModal from '@/components/dashboard/UpgradeModal';

interface AnalysisResult {
    score: number;
    label: string;
    summary: string;
    excuses: string[];
    commitment?: string;
    recommendedStage?: number;
}

interface TrustClient {
    id: string; name: string; email: string; company?: string;
    payment_history_score: number; avg_payment_delay: number;
    ai_trust_score: number | null; ai_risk_level: string | null;
    ai_trust_summary: string | null; ai_scored_at: string | null;
}

interface TrustAnalysis {
    trust_score: number; risk_level: string; summary: string;
    factors: { label: string; impact: string; detail: string }[];
    recommendation: string; trend: string;
}

const EXCUSE_TYPES = [
    { icon: <CalendarClock size={24} strokeWidth={1.5} />, title: 'Date Commitment', desc: '"Will pay by Friday" — tracked & scored high', risk: 'low', example: '"I will transfer by end of this week."' },
    { icon: <Coins size={24} strokeWidth={1.5} />, title: 'Partial Payment', desc: '"Can I send half now?" — partial intent', risk: 'medium', example: '"Can I do ₹25,000 now and the rest next month?"' },
    { icon: <Building2 size={24} strokeWidth={1.5} />, title: 'Process Excuse', desc: '"Our accounts team handles this" — delay tactic', risk: 'medium', example: '"Please send to our finance department."' },
    { icon: <CircleDashed size={24} strokeWidth={1.5} />, title: 'Vague Promise', desc: '"Will sort it out soon" — high risk', risk: 'high', example: '"We\'ll take care of it this week."' },
    { icon: <Scale size={24} strokeWidth={1.5} />, title: 'Dispute', desc: '"Had feedback on the work" — very high risk', risk: 'critical', example: '"Actually, we had some issues with delivery."' },
    { icon: <Ghost size={24} strokeWidth={1.5} />, title: 'No Response', desc: 'Ghost — highest risk, time to escalate', risk: 'critical', example: '(No reply after 7+ days)' },
];

const COMING_SOON_AI = [
    { icon: <Puzzle size={24} strokeWidth={1.5} />, title: 'Pattern Memory', desc: 'AI learns your specific clients over time. After 3+ invoices, it predicts who will pay late before they even reply.', tag: 'Q2 2026', color: '#a78bfa' },
    { icon: <Mail size={24} strokeWidth={1.5} />, title: 'AI-Written Follow-ups', desc: 'Auto-generate personalised follow-up emails based on the client\'s history, excuses logged, and payment stage.', tag: 'Q2 2026', color: '#6b96ff' },
    { icon: <AlertTriangle size={24} strokeWidth={1.5} />, title: 'Risk Alerts', desc: 'Get notified before an invoice goes overdue — AI predicts 7 days in advance based on client payment history.', tag: 'Q3 2026', color: '#fbbf24' },
    { icon: <Phone size={24} strokeWidth={1.5} />, title: 'WhatsApp AI Bot', desc: 'AI reads WhatsApp replies and logs excuse patterns, just like email — even without Copy-Paste.', tag: 'Q3 2026', color: '#25d366' },
];

const RISK_COLOR: Record<string, string> = {
    low: '#34d399', medium: '#fbbf24', high: '#f87171', critical: '#ef4444',
};

export default function IntelligencePage() {
    const { token } = useAuth();
    const [input, setInput] = useState('');
    const [invoiceId, setInvoiceId] = useState('');
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'analyser' | 'insights' | 'guide' | 'coming'>('analyser');

    // Client Insights state
    const [trustClients, setTrustClients] = useState<TrustClient[]>([]);
    const [trustLoading, setTrustLoading] = useState(false);
    const [scoringId, setScoringId] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [expandedAnalysis, setExpandedAnalysis] = useState<TrustAnalysis | null>(null);
    const [showUpgrade, setShowUpgrade] = useState(false);
    const [upgradeMessage, setUpgradeMessage] = useState('');

    // Fetch clients when Insights tab is selected
    useEffect(() => {
        if (activeTab === 'insights' && token && trustClients.length === 0) {
            setTrustLoading(true);
            fetch('/api/clients', { headers: { Authorization: `Bearer ${token}` } })
                .then(r => r.json())
                .then(d => setTrustClients(d.clients || []))
                .catch(() => toast.error('Failed to load clients'))
                .finally(() => setTrustLoading(false));
        }
    }, [activeTab, token]);

    const scoreClient = async (clientId: string) => {
        setScoringId(clientId);
        try {
            const res = await fetch('/api/ai/client-trust-score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ clientId }),
            });
            const data = await res.json();
            if (!res.ok) {
                if (data.error === 'LIMIT_EXCEEDED') {
                    setUpgradeMessage(data.message || 'Limit exceeded');
                    setShowUpgrade(true);
                    return;
                }
                throw new Error(data.error);
            }
            // Update local state
            setTrustClients(prev => prev.map(c => c.id === clientId ? {
                ...c,
                ai_trust_score: data.analysis.trust_score,
                ai_risk_level: data.analysis.risk_level,
                ai_trust_summary: data.analysis.summary,
                ai_scored_at: new Date().toISOString(),
            } : c));
            setExpandedId(clientId);
            setExpandedAnalysis(data.analysis);
            toast.success(`Trust score generated for ${trustClients.find(c => c.id === clientId)?.name}`);
        } catch (e: any) {
            toast.error(e.message || 'Failed to generate trust score');
        } finally {
            setScoringId(null);
        }
    };

    const analyse = async () => {
        if (!input.trim()) return;
        setLoading(true); setError(''); setResult(null);
        try {
            const res = await fetch('/api/invoices/analyze-excuse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ clientReply: input, invoiceId: invoiceId || undefined }),
            });
            const data = await res.json();
            if (!res.ok) {
                if (data.error === 'LIMIT_EXCEEDED') {
                    setUpgradeMessage(data.message || 'Limit exceeded');
                    setShowUpgrade(true);
                    return;
                }
                throw new Error(data.error || 'Analysis failed');
            }
            setResult(data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const scoreColor = result ? result.score >= 70 ? '#34d399' : result.score >= 40 ? '#fbbf24' : '#f87171' : '#6b96ff';

    return (
        <div className="min-h-screen bg-[#09090f] text-white">
            {/* Ambient */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full opacity-[0.04]"
                    style={{ background: 'radial-gradient(circle, #a78bfa 0%, transparent 70%)' }} />
            </div>

            <UpgradeModal
                isOpen={showUpgrade}
                onClose={() => setShowUpgrade(false)}
                token={token}
                message={upgradeMessage}
            />

            <div className="relative z-10 p-5 sm:p-7 max-w-5xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-purple-400" style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.2)' }}>
                                <Bot size={18} />
                            </div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">AI Intelligence</h1>
                        </div>
                        <p className="text-sm text-white/35">Powered by LLaMA 3 · Excuse Memory™ Engine</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                            AI Online
                        </span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] w-fit">
                    {([
                        { key: 'analyser', label: 'Excuse Analyser', icon: <Search size={16} /> },
                        { key: 'insights', label: 'Client Insights', icon: <Users size={16} /> },
                        { key: 'guide', label: 'Excuse Guide', icon: <BookOpen size={16} /> },
                        { key: 'coming', label: 'Coming Soon', icon: <Rocket size={16} /> },
                    ] as const).map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${activeTab === tab.key
                                ? 'bg-white/[0.08] text-white border border-white/[0.07]'
                                : 'text-white/40 hover:text-white/70'
                                }`}>
                            <span>{tab.icon}</span>
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* ── Tab: Analyser ── */}
                {activeTab === 'analyser' && (
                    <div className="space-y-5">
                        {/* 3 Feature pills */}
                        <div className="flex flex-wrap gap-2">
                            {[
                                { icon: <Brain size={14} />, label: 'Excuse Detection' },
                                { icon: <BarChart3 size={14} />, label: 'Intent Scoring 0–100' },
                                { icon: <FileText size={14} />, label: 'Commitment Extraction' },
                            ].map(f => (
                                <span key={f.label} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/50">
                                    {f.icon} {f.label}
                                </span>
                            ))}
                        </div>

                        {/* Input card */}
                        <div className="glass-card p-6 space-y-4" style={{ borderColor: 'rgba(167,139,250,0.15)' }}>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                                <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Excuse Memory™ Analyser</p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-white/35 uppercase tracking-widest">Client Reply or Message</label>
                                <textarea
                                    rows={5}
                                    className="input-premium w-full resize-none text-sm"
                                    placeholder={`Paste the client's email or WhatsApp message here…\n\nExample: "Hi, I'll transfer the payment by Friday, the accounts team is processing it."`}
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                />
                                <p className="text-[11px] text-white/25">{input.length} characters · AI reads any language, any tone</p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-white/35 uppercase tracking-widest">Invoice ID (optional)</label>
                                <input
                                    className="input-premium"
                                    placeholder="Link to a specific invoice to log this to its timeline"
                                    value={invoiceId}
                                    onChange={e => setInvoiceId(e.target.value)}
                                />
                            </div>

                            {error && (
                                <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
                                    <AlertTriangle size={14} /> {error}
                                </div>
                            )}

                            <button onClick={analyse} disabled={loading || !input.trim()}
                                className="btn-primary text-sm px-8 py-3 flex items-center gap-2">
                                {loading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Analysing with AI…
                                    </>
                                ) : (
                                    <><Search size={16} /> Analyse Reply</>
                                )}
                            </button>
                        </div>

                        {/* Result */}
                        {result && (
                            <div className="glass-card p-6 space-y-5" style={{ borderColor: `${scoreColor}20`, animation: 'revealUp 0.4s cubic-bezier(0.22,1,0.36,1) both' }}>
                                <div className="flex items-center justify-between flex-wrap gap-3">
                                    <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Analysis Complete</p>
                                    <span className="text-xs font-bold px-3 py-1 rounded-full"
                                        style={{ color: scoreColor, background: `${scoreColor}15`, border: `1px solid ${scoreColor}25` }}>
                                        {result.label}
                                    </span>
                                </div>

                                {/* Score gauge */}
                                <div className="p-5 rounded-xl border" style={{ borderColor: `${scoreColor}15`, background: `${scoreColor}06` }}>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-semibold text-white">Payment Intent Score</span>
                                        <span className="text-3xl font-black" style={{ color: scoreColor }}>{result.score}</span>
                                    </div>
                                    <div className="h-2.5 rounded-full bg-white/[0.07] overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-700"
                                            style={{ width: `${result.score}%`, background: `linear-gradient(90deg, ${scoreColor}80, ${scoreColor})` }} />
                                    </div>
                                    <div className="flex justify-between mt-2">
                                        <span className="text-[10px] text-white/25">Low risk</span>
                                        <span className="text-xs font-medium" style={{ color: scoreColor }}>
                                            {result.score >= 70 ? '✓ High intent — likely to pay soon' : result.score >= 40 ? '⚡ Moderate — continue follow-ups' : '⚠ Low intent — escalate now'}
                                        </span>
                                        <span className="text-[10px] text-white/25">High risk</span>
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                    <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-2">AI Summary</p>
                                    <p className="text-sm text-white/70 leading-relaxed">{result.summary}</p>
                                </div>

                                {/* Commitment extracted */}
                                {result.commitment && (
                                    <div className="p-4 rounded-xl bg-green-500/[0.06] border border-green-500/20">
                                        <p className="text-[11px] font-bold text-green-400/60 uppercase tracking-widest mb-1.5">Commitment Extracted</p>
                                        <p className="text-sm text-green-400 font-medium">"{result.commitment}"</p>
                                    </div>
                                )}

                                {/* Detected excuses */}
                                {result.excuses?.length > 0 && (
                                    <div>
                                        <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-3">Detected Patterns</p>
                                        <div className="space-y-2">
                                            {result.excuses.map((e, i) => (
                                                <div key={i} className="flex items-start gap-2.5 text-sm text-white/60 p-3 rounded-xl bg-yellow-500/[0.05] border border-yellow-500/15">
                                                    <AlertTriangle size={14} className="text-yellow-400 shrink-0 mt-0.5" />
                                                    <span>{e}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Recommended action */}
                                {result.recommendedStage && (
                                    <div className="p-4 rounded-xl bg-blue-500/[0.06] border border-blue-500/20">
                                        <p className="text-[11px] font-bold text-blue-400/60 uppercase tracking-widest mb-1">Recommended</p>
                                        <p className="text-sm text-blue-400 font-medium">Move to Stage {result.recommendedStage} follow-up</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Tab: Client Insights ── */}
                {activeTab === 'insights' && (
                    <div className="space-y-5">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-white/40">AI-powered trust analysis of your clients based on their complete payment history.</p>
                        </div>

                        {trustLoading ? (
                            <div className="grid sm:grid-cols-2 gap-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="glass-card p-5 space-y-3">
                                        <div className="flex items-center gap-3"><div className="skeleton w-10 h-10 rounded-xl" /><div className="space-y-2 flex-1"><div className="skeleton h-3 w-28 rounded" /><div className="skeleton h-3 w-40 rounded" /></div></div>
                                        <div className="skeleton h-2 rounded-full" />
                                    </div>
                                ))}
                            </div>
                        ) : trustClients.length === 0 ? (
                            <div className="glass-card p-12 text-center">
                                <Users size={40} className="text-white/15 mx-auto mb-4" />
                                <p className="text-white/40 text-sm">No clients found. Add clients first to generate trust insights.</p>
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 gap-4">
                                {trustClients
                                    .sort((a, b) => (b.ai_trust_score ?? -1) - (a.ai_trust_score ?? -1))
                                    .map((client, i) => {
                                        const score = client.ai_trust_score;
                                        const riskLevel = client.ai_risk_level;
                                        const hasScore = score !== null && score !== undefined;
                                        const scoreColor = hasScore ? (score >= 70 ? '#34d399' : score >= 40 ? '#fbbf24' : '#f87171') : '#6b96ff';
                                        const riskLabel = riskLevel === 'trusted' ? 'Trusted' : riskLevel === 'moderate' ? 'Moderate' : riskLevel === 'risky' ? 'Risky' : riskLevel === 'high_risk' ? 'High Risk' : 'Unscored';
                                        const riskColor = riskLevel === 'trusted' ? '#34d399' : riskLevel === 'moderate' ? '#fbbf24' : riskLevel === 'risky' ? '#fb923c' : riskLevel === 'high_risk' ? '#f87171' : '#6b96ff';
                                        const isExpanded = expandedId === client.id;
                                        const isScoring = scoringId === client.id;
                                        const colors = ['#5f87ff', '#a78bfa', '#22d3ee', '#34d399', '#fb923c', '#f472b6'];
                                        const avatarCol = colors[client.name.charCodeAt(0) % colors.length];

                                        return (
                                            <div key={client.id} className="glass-card p-5 space-y-3 anim-up transition-all" style={{ animationDelay: `${i * 0.04}s` }}>
                                                {/* Header */}
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                                                            style={{ background: `${avatarCol}18`, border: `1px solid ${avatarCol}25`, color: avatarCol }}>
                                                            {client.name[0].toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-white truncate">{client.name}</p>
                                                            <p className="text-xs text-white/30 truncate">{client.company || client.email}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 uppercase tracking-wider"
                                                        style={{ color: riskColor, background: `${riskColor}12`, border: `1px solid ${riskColor}25` }}>
                                                        {riskLabel}
                                                    </span>
                                                </div>

                                                {/* Score Bar */}
                                                {hasScore ? (
                                                    <div className="space-y-1.5">
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-white/30">Trust Score</span>
                                                            <span className="font-bold" style={{ color: scoreColor }}>{score}/100</span>
                                                        </div>
                                                        <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, background: `linear-gradient(90deg, ${scoreColor}99, ${scoreColor})` }} />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                                                        <p className="text-xs text-white/25">Not yet analyzed by AI</p>
                                                    </div>
                                                )}

                                                {/* AI Summary */}
                                                {client.ai_trust_summary && (
                                                    <p className="text-xs text-white/45 leading-relaxed">{client.ai_trust_summary}</p>
                                                )}

                                                {/* Actions */}
                                                <div className="flex items-center gap-2 pt-1">
                                                    <button
                                                        onClick={() => scoreClient(client.id)}
                                                        disabled={isScoring}
                                                        className="btn-primary text-xs px-4 py-1.5 flex items-center gap-1.5 flex-1 justify-center disabled:opacity-50"
                                                    >
                                                        {isScoring ? (
                                                            <><span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Analyzing...</>
                                                        ) : hasScore ? (
                                                            <><RefreshCw size={12} /> Re-analyze</>
                                                        ) : (
                                                            <><Sparkles size={12} /> Analyze with AI</>
                                                        )}
                                                    </button>
                                                </div>

                                                {/* Expanded Analysis */}
                                                {isExpanded && expandedAnalysis && (
                                                    <div className="space-y-3 pt-3 border-t border-white/[0.06]" style={{ animation: 'revealUp 0.3s ease both' }}>
                                                        {/* Recommendation */}
                                                        <div className="p-3 rounded-xl bg-blue-500/[0.06] border border-blue-500/20">
                                                            <p className="text-[10px] font-bold text-blue-400/60 uppercase tracking-widest mb-1">AI Recommendation</p>
                                                            <p className="text-xs text-blue-400 font-medium">{expandedAnalysis.recommendation}</p>
                                                        </div>

                                                        {/* Trend */}
                                                        <div className="flex items-center gap-2">
                                                            {expandedAnalysis.trend === 'improving' && <TrendingUp size={14} className="text-green-400" />}
                                                            {expandedAnalysis.trend === 'declining' && <TrendingDown size={14} className="text-red-400" />}
                                                            {expandedAnalysis.trend === 'stable' && <Minus size={14} className="text-yellow-400" />}
                                                            <span className="text-xs text-white/40 capitalize">Trend: {expandedAnalysis.trend}</span>
                                                        </div>

                                                        {/* Factors */}
                                                        {expandedAnalysis.factors?.length > 0 && (
                                                            <div className="space-y-1.5">
                                                                <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest">Factors</p>
                                                                {expandedAnalysis.factors.map((f, fi) => (
                                                                    <div key={fi} className="flex items-start gap-2 text-xs px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                                                                        <span className={f.impact === 'positive' ? 'text-green-400' : f.impact === 'negative' ? 'text-red-400' : 'text-white/30'}>
                                                                            {f.impact === 'positive' ? '+' : f.impact === 'negative' ? '−' : '•'}
                                                                        </span>
                                                                        <div>
                                                                            <span className="font-semibold text-white/60">{f.label}</span>
                                                                            <span className="text-white/30"> — {f.detail}</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Tab: Excuse Guide ── */}
                {activeTab === 'guide' && (
                    <div className="space-y-4">
                        <p className="text-sm text-white/40">94% of payment excuses fall into 6 categories. Knowing which one you're dealing with determines your next move.</p>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {EXCUSE_TYPES.map(et => (
                                <div key={et.title} className="glass-card p-5 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center justify-center w-8 h-8 opacity-80">{et.icon}</span>
                                            <div>
                                                <p className="text-sm font-semibold text-white">{et.title}</p>
                                                <p className="text-xs text-white/35 mt-0.5">{et.desc}</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 uppercase"
                                            style={{ color: RISK_COLOR[et.risk], background: `${RISK_COLOR[et.risk]}12`, border: `1px solid ${RISK_COLOR[et.risk]}25` }}>
                                            {et.risk}
                                        </span>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                                        <p className="text-[11px] text-white/30 mb-1">Example</p>
                                        <p className="text-xs text-white/55 italic">{et.example}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Tab: Coming Soon ── */}
                {activeTab === 'coming' && (
                    <div className="space-y-5">
                        <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/[0.05] flex items-center gap-3">
                            <Rocket size={24} className="text-purple-400" />
                            <div>
                                <p className="text-sm font-semibold text-white">Next-gen AI features in development</p>
                                <p className="text-xs text-white/40 mt-0.5">Vote on our roadmap by contacting us — your feedback shapes what ships first.</p>
                            </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {COMING_SOON_AI.map(f => (
                                <div key={f.title} className="glass-card p-5 space-y-3 relative overflow-hidden group">
                                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                        style={{ background: `radial-gradient(ellipse at 0% 0%, ${f.color}07 0%, transparent 70%)` }} />
                                    <div className="relative">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl"
                                                style={{ background: `${f.color}12`, border: `1px solid ${f.color}20` }}>
                                                {f.icon}
                                            </div>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border"
                                                style={{ color: f.color, background: `${f.color}10`, borderColor: `${f.color}25` }}>
                                                {f.tag}
                                            </span>
                                        </div>
                                        <h3 className="font-semibold text-white text-sm mb-1.5">{f.title}</h3>
                                        <p className="text-xs text-white/35 leading-relaxed">{f.desc}</p>
                                        <div className="mt-4 flex items-center gap-2">
                                            <div className="flex-1 h-0.5 rounded-full bg-white/[0.06]">
                                                <div className="h-full rounded-full" style={{ width: f.tag === 'Q2 2026' ? '35%' : '15%', background: f.color }} />
                                            </div>
                                            <span className="text-[10px] font-semibold" style={{ color: f.color }}>In dev</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
