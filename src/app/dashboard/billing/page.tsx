'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Crown, Zap, CreditCard, Brain, Mail, FileText, Users, BarChart3, CheckCircle2, Sparkles, type LucideIcon } from 'lucide-react';
import UpgradeModal from '@/components/dashboard/UpgradeModal';
import { toast } from 'sonner';

interface BillingStatus {
    plan: string;
    planLabel: string;
    price: number;
    startedAt: string | null;
    expiresAt: string | null;
    isExpired: boolean;
    usage: {
        invoices: { used: number; limit: number | null; unlimited: boolean };
        clients: { used: number; limit: number | null; unlimited: boolean };
        aiAnalyses: { used: number; limit: number | null; unlimited: boolean };
    };
    features: {
        autoFollowups: boolean;
        csvExport: boolean;
        advancedAnalytics: boolean;
    };
}

const PLAN_COLORS: Record<string, string> = {
    free: '#6b96ff',
    pro: '#a78bfa',
    agency: '#34d399',
};

function UsageMeter({ label, used, limit, unlimited, icon: Icon, color }: {
    label: string; used: number; limit: number | null; unlimited: boolean; icon: LucideIcon; color: string;
}) {
    const pct = unlimited ? 15 : Math.min((used / Math.max(limit ?? 1, 1)) * 100, 100);
    const isNearLimit = !unlimited && limit !== null && used >= limit * 0.8;
    const barColor = isNearLimit ? '#f87171' : color;

    return (
        <div className="glass-card p-5 space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: `${color}12`, border: `1px solid ${color}20` }}>
                        <Icon size={16} style={{ color }} />
                    </div>
                    <span className="text-sm font-medium text-white/70">{label}</span>
                </div>
                <span className="text-sm font-bold" style={{ color: barColor }}>
                    {used}{unlimited ? '' : `/${limit}`}
                </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${barColor}99, ${barColor})` }} />
            </div>
            {unlimited && (
                <p className="text-[10px] text-white/20 flex items-center gap-1">
                    <Sparkles size={10} /> Unlimited on your plan
                </p>
            )}
        </div>
    );
}

function FeatureRow({ label, enabled, icon: Icon }: { label: string; enabled: boolean; icon: LucideIcon }) {
    return (
        <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
            <div className="flex items-center gap-2.5">
                <Icon size={14} className="text-white/30" />
                <span className="text-sm text-white/50">{label}</span>
            </div>
            {enabled ? (
                <span className="text-xs font-bold text-green-400 flex items-center gap-1"><CheckCircle2 size={12} /> Active</span>
            ) : (
                <span className="text-xs font-bold text-white/20">Pro only</span>
            )}
        </div>
    );
}

export default function BillingPage() {
    const { isAuthenticated } = useAuth();
    const [status, setStatus] = useState<BillingStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [showUpgrade, setShowUpgrade] = useState(false);

    const fetchStatus = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const res = await fetch('/api/billing/status');
            const data = await res.json();
            if (res.ok) setStatus(data);
        } catch { toast.error('Failed to load billing status'); }
        finally { setLoading(false); }
    }, [isAuthenticated]);

    useEffect(() => { if (isAuthenticated) fetchStatus(); }, [isAuthenticated, fetchStatus]);

    const planColor = PLAN_COLORS[status?.plan || 'free'] || '#6b96ff';

    if (loading) return (
        <div className="min-h-screen bg-[#09090f] text-white p-5 sm:p-7 max-w-4xl mx-auto space-y-6">
            <div className="skeleton h-8 w-40 rounded-xl" />
            <div className="grid sm:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => <div key={i} className="glass-card p-5 space-y-3"><div className="skeleton h-8 rounded-lg" /><div className="skeleton h-2 rounded-full" /></div>)}
            </div>
            <div className="glass-card p-6"><div className="skeleton h-32 rounded-xl" /></div>
        </div>
    );

    if (!status) return null;

    const isPro = status.plan === 'pro' || status.plan === 'agency';

    return (
        <div className="min-h-screen bg-[#09090f] text-white">
            {/* Ambient */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-1/4 w-72 h-72 rounded-full opacity-[0.04]"
                    style={{ background: `radial-gradient(circle, ${planColor} 0%, transparent 70%)` }} />
            </div>

            <div className="relative z-10 p-5 sm:p-7 max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                                style={{ background: `${planColor}12`, border: `1px solid ${planColor}20` }}>
                                <CreditCard size={18} style={{ color: planColor }} />
                            </div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Billing</h1>
                        </div>
                        <p className="text-sm text-white/35">Manage your plan term and monitor usage</p>
                    </div>
                    {!isPro && (
                        <button onClick={() => setShowUpgrade(true)}
                            className="btn-primary text-xs px-5 py-2.5 flex items-center gap-2 shadow-[0_0_20px_rgba(167,139,250,0.2)]">
                            <Crown size={14} /> Upgrade to Pro
                        </button>
                    )}
                </div>

                {/* Current Plan Card */}
                <div className="glass-card p-6 relative overflow-hidden" style={{ borderColor: `${planColor}20` }}>
                    <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-[0.06]"
                        style={{ background: `radial-gradient(circle, ${planColor} 0%, transparent 70%)`, transform: 'translate(30%, -30%)' }} />
                    <div className="relative">
                        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                                    style={{ color: planColor, background: `${planColor}12`, border: `1px solid ${planColor}25` }}>
                                    {status.planLabel} Plan
                                </span>
                                <p className="text-3xl font-bold text-white mt-3 tracking-tight">
                                    {status.price === 0 ? 'Free' : `₹${status.price}`}
                                    {status.price > 0 && <span className="text-sm text-white/30 font-normal">/month</span>}
                                </p>
                            </div>
                            {isPro && status.expiresAt && (
                                <div className="text-right">
                                    <p className="text-xs text-white/30">Renews</p>
                                    <p className="text-sm font-medium text-white/60">
                                        {new Date(status.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            )}
                        </div>
                        {status.isExpired && (
                            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                                ⚠ Your plan has expired. Renew to continue using Pro features.
                            </div>
                        )}
                    </div>
                </div>

                {/* Usage Meters */}
                <div>
                    <h2 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4">This Month's Usage</h2>
                    <div className="grid sm:grid-cols-3 gap-4">
                        <UsageMeter label="Invoices" {...status.usage.invoices} icon={FileText} color="#6b96ff" />
                        <UsageMeter label="Clients" {...status.usage.clients} icon={Users} color="#a78bfa" />
                        <UsageMeter label="AI Analyses" {...status.usage.aiAnalyses} icon={Brain} color="#34d399" />
                    </div>
                </div>

                {/* Feature Status */}
                <div className="glass-card p-6">
                    <h2 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4">Feature Access</h2>
                    <FeatureRow label="Automated Follow-ups" enabled={status.features.autoFollowups} icon={Mail} />
                    <FeatureRow label="CSV Export" enabled={status.features.csvExport} icon={FileText} />
                    <FeatureRow label="Dashboard Analytics" enabled={status.features.advancedAnalytics} icon={BarChart3} />
                    <FeatureRow label="Unlimited Invoices" enabled={isPro} icon={Zap} />
                    <FeatureRow label="Unlimited AI" enabled={isPro} icon={Brain} />
                </div>

                {/* Upgrade CTA for Free users */}
                {!isPro && (
                    <div className="glass-card p-8 text-center border-purple-500/20 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.03] to-blue-500/[0.03]" />
                        <div className="relative">
                            <Crown size={40} className="text-purple-400 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-white mb-2">Unlock the full power of Flowcent</h3>
                            <p className="text-sm text-white/40 max-w-md mx-auto mb-6">
                                Unlimited invoices, automated follow-ups, unlimited AI analyses, and CSV export. Starting at ₹399/month on the annual term.
                            </p>
                            <button onClick={() => setShowUpgrade(true)}
                                className="btn-primary text-sm px-8 py-3 mx-auto flex items-center gap-2 shadow-[0_0_25px_rgba(167,139,250,0.3)]">
                                <Sparkles size={16} /> Upgrade Now
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <UpgradeModal
                isOpen={showUpgrade}
                onClose={() => setShowUpgrade(false)}
                onSuccess={fetchStatus}
            />
        </div>
    );
}
