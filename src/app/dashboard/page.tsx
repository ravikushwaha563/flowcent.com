'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import {
    Clock, CheckCircle2, AlertTriangle, TrendingUp,
    FileText, UserPlus, Sparkles, Mail,
    MessageCircle, CreditCard, BarChart3, Users, Link as LinkIcon
} from 'lucide-react';
import RevenueChart from '@/components/dashboard/RevenueChart';

interface Stats {
    total_invoices: number; total_amount: number; paid_amount: number;
    overdue_amount: number; overdue_count: number; paid_count: number;
}
interface RecentInvoice {
    id: string; invoice_number: string; amount: number; currency: string;
    due_date: string; status: string; payment_intent_score?: number;
    clients: { name: string; email: string };
}

const SPARKLINE_PAID = [20, 45, 38, 62, 55, 80, 73, 95, 88, 100];
const SPARKLINE_OVERDUE = [15, 22, 18, 35, 28, 40, 32, 50, 44, 58];

function Sparkline({ data, color }: { data: number[]; color: string }) {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const w = 80, h = 28;
    const points = data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / range) * h;
        return `${x},${y}`;
    }).join(' ');
    const areaPoints = `0,${h} ${points} ${w},${h}`;
    return (
        <svg width={w} height={h} className="overflow-visible">
            <defs>
                <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon points={areaPoints} fill={`url(#sg-${color.replace('#', '')})`} />
            <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={(data.length - 1) / (data.length - 1) * w} cy={h - ((data[data.length - 1] - min) / range) * h} r="2.5" fill={color} />
        </svg>
    );
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    paid: { label: 'Paid', color: '#34d399', bg: 'rgba(52,211,153,0.1)', dot: '#34d399' },
    overdue: { label: 'Overdue', color: '#f87171', bg: 'rgba(248,113,113,0.1)', dot: '#f87171' },
    pending: { label: 'Pending', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', dot: '#fbbf24' },
    sent: { label: 'Sent', color: '#6b96ff', bg: 'rgba(107,150,255,0.1)', dot: '#6b96ff' },
    draft: { label: 'Draft', color: '#7474a0', bg: 'rgba(116,116,160,0.1)', dot: '#7474a0' },
};

function ScoreBar({ score }: { score: number }) {
    const color = score >= 70 ? '#34d399' : score >= 40 ? '#fbbf24' : '#f87171';
    return (
        <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 rounded-full bg-white/[0.07]">
                <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
            </div>
            <span className="text-[11px] font-bold" style={{ color }}>{score}</span>
        </div>
    );
}

const COMING_SOON_FEATURES = [
    { icon: <MessageCircle size={20} strokeWidth={1.5} />, title: 'WhatsApp Follow-ups', desc: 'Send automated payment reminders directly on WhatsApp — where clients actually respond.', color: '#25d366', tag: 'Q2 2026' },
    { icon: <CreditCard size={20} strokeWidth={1.5} />, title: 'Razorpay Links', desc: 'Attach a payment link directly to your invoice. Client pays in one tap.', color: '#3395ff', tag: 'Q2 2026' },
    { icon: <BarChart3 size={20} strokeWidth={1.5} />, title: 'Revenue Reports', desc: 'Weekly and monthly income reports with export to Excel and PDF.', color: '#a78bfa', tag: 'Q3 2026' },
    { icon: <Users size={20} strokeWidth={1.5} />, title: 'Team Collaboration', desc: 'Add your accountant or business partner. Role-based access control.', color: '#fbbf24', tag: 'Q3 2026' },
    { icon: <LinkIcon size={20} strokeWidth={1.5} />, title: 'Stripe Integration', desc: 'Accept payments from international clients directly in USD, EUR, GBP.', color: '#635bff', tag: 'Q4 2026' },
    { icon: <FileText size={20} strokeWidth={1.5} />, title: 'PDF Invoice Export', desc: 'Generate a professional, branded PDF invoice with your logo.', color: '#f87171', tag: 'Q4 2026' },
];

const QUICK_ACTIONS = [
    { href: '/dashboard/invoices', icon: <FileText size={18} strokeWidth={1.5} />, label: 'New Invoice', desc: 'Create & send' },
    { href: '/dashboard/clients', icon: <UserPlus size={18} strokeWidth={1.5} />, label: 'Add Client', desc: 'Manage clients' },
    { href: '/dashboard/intelligence', icon: <Sparkles size={18} strokeWidth={1.5} />, label: 'AI Analysis', desc: 'Paste client reply' },
    { href: '/dashboard/settings', icon: <Mail size={18} strokeWidth={1.5} />, label: 'Connect Gmail', desc: 'Auto follow-ups' },
];

export default function DashboardPage() {
    const { token, user, isLoading } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);
    const [recent, setRecent] = useState<RecentInvoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const t = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        if (!token || isLoading) return;
        Promise.all([
            fetch('/api/dashboard/stats', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
            fetch('/api/invoices?limit=5', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        ]).then(([s, inv]) => {
            setStats(s.stats || null);
            setRecent((inv.invoices || []).slice(0, 5));
        }).finally(() => setLoading(false));
    }, [token, isLoading]);

    const fmt = (n: number) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
    const greeting = () => {
        const h = currentTime.getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const collectRate = stats && stats.total_amount > 0
        ? Math.round((stats.paid_amount / stats.total_amount) * 100) : 0;

    const STAT_CARDS = [
        {
            label: 'Outstanding',
            value: loading ? '—' : fmt(stats ? stats.total_amount - stats.paid_amount : 0),
            sub: loading ? '' : `${(stats?.total_invoices || 0) - (stats?.paid_count || 0)} unpaid invoices`,
            color: '#6b96ff',
            icon: <Clock size={18} strokeWidth={2} />,
            sparkline: SPARKLINE_PAID,
            trend: '+12%',
            trendUp: true,
        },
        {
            label: 'Collected',
            value: loading ? '—' : fmt(stats?.paid_amount || 0),
            sub: loading ? '' : `${stats?.paid_count || 0} invoices collected`,
            color: '#34d399',
            icon: <CheckCircle2 size={18} strokeWidth={2} />,
            sparkline: SPARKLINE_PAID,
            trend: '+24%',
            trendUp: true,
        },
        {
            label: 'Overdue',
            value: loading ? '—' : fmt(stats?.overdue_amount || 0),
            sub: loading ? '' : `${stats?.overdue_count || 0} invoices past due`,
            color: '#f87171',
            icon: <AlertTriangle size={18} strokeWidth={2} />,
            sparkline: SPARKLINE_OVERDUE,
            trend: '-8%',
            trendUp: false,
        },
        {
            label: 'Collection Rate',
            value: loading ? '—' : `${collectRate}%`,
            sub: 'Percentage of invoices paid',
            color: '#a78bfa',
            icon: <TrendingUp size={18} strokeWidth={2} />,
            sparkline: SPARKLINE_PAID.map(v => Math.round(v * 0.8)),
            trend: '+5%',
            trendUp: true,
        },
    ];

    return (
        <div className="min-h-screen bg-[#09090f] text-white">
            {/* Ambient background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-[0.04]"
                    style={{ background: 'radial-gradient(circle, #3d61ff 0%, transparent 70%)' }} />
                <div className="absolute top-1/3 right-0 w-72 h-72 rounded-full opacity-[0.03]"
                    style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
            </div>

            <div className="relative z-10 p-5 sm:p-7 max-w-7xl mx-auto space-y-6">

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-white/35 text-sm mb-0.5">{greeting()},</p>
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            {user?.name ? user.name.split(' ')[0] : 'Welcome back'} 👋
                        </h1>
                        <p className="text-white/35 text-sm mt-1">
                            {currentTime.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                    <Link href="/dashboard/invoices">
                        <button className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm whitespace-nowrap">
                            <span>＋</span> New Invoice
                        </button>
                    </Link>
                </div>

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {STAT_CARDS.map((card) => (
                        <div key={card.label} className="stat-card-premium p-5 group">
                            {/* Glow on hover */}
                            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                style={{ background: `radial-gradient(ellipse at 0% 0%, ${card.color}08 0%, transparent 60%)` }} />
                            <div className="relative">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <p className="text-xs font-semibold text-white/35 uppercase tracking-widest mb-1">{card.label}</p>
                                        <p className="text-xl sm:text-2xl font-bold text-white tracking-tight">{card.value}</p>
                                    </div>
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                                        style={{ background: `${card.color}12`, border: `1px solid ${card.color}20` }}>
                                        {card.icon}
                                    </div>
                                </div>
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-[11px] text-white/30">{card.sub}</p>
                                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold mt-1 ${card.trendUp ? 'text-green-400' : 'text-red-400'}`}>
                                            {card.trendUp ? '↑' : '↓'} {card.trend} this month
                                        </span>
                                    </div>
                                    <Sparkline data={card.sparkline} color={card.color} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Revenue Chart & Pipeline ── */}
                <div className="grid lg:grid-cols-3 gap-5">
                    {/* Revenue Chart */}
                    <div className="lg:col-span-2">
                        <RevenueChart />
                    </div>

                    {/* Pipeline Metrics */}
                    <div className="glass-card p-5 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="font-semibold text-white text-sm">Invoice Pipeline</h2>
                                <p className="text-xs text-white/30 mt-0.5">Collection funnel overview</p>
                            </div>
                            <span className="text-[11px] px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">Live</span>
                        </div>
                        <div className="flex flex-col gap-4 flex-1 justify-between">
                            {[
                                { label: 'Stage 1 – Reminder', count: 0, color: '#6b96ff', pct: 0 },
                                { label: 'Stage 2 – Follow-up', count: 0, color: '#a78bfa', pct: 0 },
                                { label: 'Stage 3 – Urgent', count: 0, color: '#fbbf24', pct: 0 },
                                { label: 'Stage 4–5 – Final', count: 0, color: '#f87171', pct: 0 },
                            ].map((s) => (
                                <div key={s.label} className="p-4 rounded-xl border border-white/[0.05] bg-white/[0.02]">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-xl font-bold text-white leading-none">{loading ? '—' : s.count}</p>
                                        <p className="text-[11px] text-white/35 font-medium">{s.label}</p>
                                    </div>
                                    <div className="mt-2 w-full h-1.5 rounded-full bg-white/[0.05]">
                                        <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: s.color }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Main grid: Recent Invoices + Quick Actions ── */}
                <div className="grid lg:grid-cols-3 gap-5">
                    {/* Recent Invoices */}
                    <div className="lg:col-span-2 glass-card p-5">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="font-semibold text-white text-sm">Recent Invoices</h2>
                                <p className="text-xs text-white/30 mt-0.5">Latest 5 invoices</p>
                            </div>
                            <Link href="/dashboard/invoices" className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium">
                                View all →
                            </Link>
                        </div>

                        {loading ? (
                            <div className="space-y-3">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-14 rounded-xl bg-white/[0.03] animate-pulse" />
                                ))}
                            </div>
                        ) : recent.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-12 h-12 rounded-2xl grad-brand/10 border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                                    <FileText size={24} strokeWidth={1.5} className="text-white/40" />
                                </div>
                                <p className="text-white/40 text-sm font-medium">No invoices yet</p>
                                <p className="text-white/20 text-xs mt-1 mb-4">Create your first invoice to get started</p>
                                <Link href="/dashboard/invoices">
                                    <button className="btn-primary text-xs px-5 py-2">Create first invoice →</button>
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/[0.04]">
                                {recent.map((inv) => {
                                    const cfg = STATUS_CONFIG[inv.status] || STATUS_CONFIG['draft'];
                                    const overdue = inv.status === 'overdue' || (inv.status !== 'paid' && new Date(inv.due_date) < new Date());
                                    return (
                                        <div key={inv.id} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0 group">
                                            {/* Client avatar */}
                                            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                                                style={{ background: `${cfg.color}15`, color: cfg.color }}>
                                                {inv.clients.name[0].toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-semibold text-white truncate">{inv.clients.name}</p>
                                                    <span className="text-[10px] text-white/25 shrink-0">{inv.invoice_number}</span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md font-semibold"
                                                        style={{ color: cfg.color, background: cfg.bg }}>
                                                        <span className="w-1 h-1 rounded-full" style={{ background: cfg.dot }} />
                                                        {cfg.label}
                                                    </span>
                                                    <span className={`text-[10px] font-medium ${overdue ? 'text-red-400' : 'text-white/25'}`}>
                                                        Due {new Date(inv.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-sm font-bold text-white">
                                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: inv.currency || 'INR', maximumFractionDigits: 0 }).format(inv.amount)}
                                                </p>
                                                {inv.payment_intent_score !== undefined && (
                                                    <ScoreBar score={inv.payment_intent_score} />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-4">
                        <div className="glass-card p-5">
                            <h2 className="font-semibold text-white text-sm mb-1">Quick Actions</h2>
                            <p className="text-xs text-white/30 mb-4">Common tasks</p>
                            <div className="space-y-2">
                                {QUICK_ACTIONS.map((qa) => (
                                    <Link key={qa.href} href={qa.href}>
                                        <div className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] hover:border-blue-500/25 hover:bg-white/[0.03] transition-all duration-150 cursor-pointer group">
                                            <span className="text-lg w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">{qa.icon}</span>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{qa.label}</p>
                                                <p className="text-[11px] text-white/30">{qa.desc}</p>
                                            </div>
                                            <span className="ml-auto text-white/20 group-hover:text-white/50 text-sm transition-colors">→</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Gmail status card */}
                        <div className="glass-card p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                                    <Mail size={16} strokeWidth={2} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">Gmail</p>
                                    <span className="inline-flex items-center gap-1 text-[10px] text-orange-400">
                                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                                        Not connected
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs text-white/35 mb-3">Connect Gmail to enable automated follow-ups sent from your address.</p>
                            <Link href="/dashboard/settings">
                                <button className="w-full py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] text-xs font-semibold text-white/60 hover:text-white transition-all">
                                    Connect Gmail →
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>



                {/* ── Coming Soon Features ── */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="font-semibold text-white text-sm">Roadmap</h2>
                            <p className="text-xs text-white/30 mt-0.5">Features launching soon</p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-semibold uppercase tracking-widest">In Development</span>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {COMING_SOON_FEATURES.map((f) => (
                            <div key={f.title} className="glass-card p-5 relative overflow-hidden group opacity-80 hover:opacity-100 transition-opacity">
                                {/* Shimmer */}
                                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                    style={{ background: `radial-gradient(ellipse at 0% 100%, ${f.color}06 0%, transparent 70%)` }} />
                                <div className="relative">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
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
                                            <div className="h-full rounded-full"
                                                style={{ width: f.tag === 'Q2 2026' ? '40%' : f.tag === 'Q3 2026' ? '20%' : '5%', background: f.color }} />
                                        </div>
                                        <span className="text-[10px] font-semibold" style={{ color: f.color }}>Coming Soon</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Bottom CTA Strip ── */}
                <div className="relative rounded-2xl overflow-hidden">
                    <div className="absolute inset-0 grad-brand opacity-[0.08]" />
                    <div className="absolute inset-0 border border-blue-500/15 rounded-2xl" />
                    <div className="relative px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold text-white">Get 3× faster payments with Gmail automation</p>
                            <p className="text-xs text-white/40 mt-0.5">Connect your Gmail now and let Flowcent follow up while you focus on work.</p>
                        </div>
                        <Link href="/dashboard/settings" className="shrink-0">
                            <button className="btn-primary px-6 py-2.5 text-sm whitespace-nowrap">Connect Gmail →</button>
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
