'use client';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { useReveal } from '@/hooks/useReveal';

const ENTRIES = [
    {
        version: 'v0.8.0', date: 'Feb 20, 2026', tag: 'New Feature', tagColor: '#6b96ff', isLatest: true,
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=75',
        imageAlt: 'Analytics dashboard showing payment intent score',
        changes: [
            { type: 'new', text: 'Payment Intent Score — AI-calculated 0–100 score per invoice' },
            { type: 'new', text: 'Score breakdown card on invoice detail page with factor analysis' },
            { type: 'new', text: 'Recalculate score button on invoice list and detail pages' },
            { type: 'improve', text: 'Invoice list now shows color-coded intent badge with score number' },
        ],
    },
    {
        version: 'v0.7.0', date: 'Feb 18, 2026', tag: 'Automation', tagColor: '#a78bfa',
        image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=75',
        imageAlt: 'Email automation interface on laptop screen',
        changes: [
            { type: 'new', text: '5-Stage Automated Follow-up system with Gmail API integration' },
            { type: 'new', text: 'Auto Follow-up toggle per invoice on creation form' },
            { type: 'new', text: '⚡ Run Automation button on the invoices page for manual trigger' },
            { type: 'new', text: 'Automation column on invoice list showing stage and next follow-up date' },
            { type: 'new', text: 'Cron job endpoint /api/cron/process-followups (batch 50)' },
            { type: 'improve', text: 'Invoice API now sets current_stage and next_followup_date on creation' },
        ],
    },
    {
        version: 'v0.6.0', date: 'Feb 15, 2026', tag: 'AI', tagColor: '#34d399',
        image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=600&q=75',
        imageAlt: 'AI visualization with purple neural network',
        changes: [
            { type: 'new', text: 'AI Excuse Memory™ — paste client replies, AI extracts promises/excuses' },
            { type: 'new', text: 'Promise types: Date Commitment, Partial Payment, Excuse, Dispute, Will Pay' },
            { type: 'new', text: 'Promise timeline on invoice detail page' },
            { type: 'new', text: 'Mark promise as fulfilled/unfulfilled with toggle' },
            { type: 'new', text: 'AI recommended follow-up stage based on analysis' },
        ],
    },
    {
        version: 'v0.5.0', date: 'Feb 12, 2026', tag: 'Dashboard', tagColor: '#fbbf24',
        image: 'https://images.unsplash.com/photo-1642790551116-18a150d38a18?auto=format&fit=crop&w=600&q=75',
        imageAlt: 'Financial analytics dashboard with charts',
        changes: [
            { type: 'new', text: 'Dashboard analytics: Total Invoices, Pending Amount, Overdue Amount, Client Count' },
            { type: 'new', text: 'Payment Health bar: visual % Paid / Pending / Overdue breakdown' },
            { type: 'new', text: 'Average payment delay metric on dashboard' },
            { type: 'new', text: 'Collection rate percentage calculation' },
            { type: 'improve', text: 'Real-time stat cards with loading skeleton states' },
        ],
    },
    {
        version: 'v0.4.0', date: 'Feb 10, 2026', tag: 'Invoices', tagColor: '#6b96ff',
        image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=75',
        imageAlt: 'Invoice documents and calculator on desk',
        changes: [
            { type: 'new', text: 'Invoice detail page with full AI analysis and promise history' },
            { type: 'new', text: 'Manual follow-up email send with stage selection' },
            { type: 'new', text: 'Invoice status: Pending / Overdue / Paid with visual coloring' },
            { type: 'new', text: 'Multi-currency support: INR, USD, EUR, GBP' },
            { type: 'fix', text: 'Fixed TypeScript error on input value type casting' },
        ],
    },
    {
        version: 'v0.3.0', date: 'Feb 8, 2026', tag: 'Gmail', tagColor: '#f87171',
        image: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?auto=format&fit=crop&w=600&q=75',
        imageAlt: 'Gmail open on laptop screen',
        changes: [
            { type: 'new', text: 'Gmail OAuth integration for follow-up email sending' },
            { type: 'new', text: 'Connect/disconnect Gmail from profile settings' },
            { type: 'new', text: 'Follow-up emails sent from user\'s real Gmail address' },
            { type: 'new', text: 'Gmail token stored securely and refreshed automatically' },
        ],
    },
    {
        version: 'v0.2.0', date: 'Feb 6, 2026', tag: 'Clients', tagColor: '#34d399',
        image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=600&q=75',
        imageAlt: 'Client management and business meeting',
        changes: [
            { type: 'new', text: 'Full client management: name, email, phone, company, notes' },
            { type: 'new', text: 'Client profile with invoice history and payment stats' },
            { type: 'new', text: 'Client risk score calculated from payment history' },
            { type: 'new', text: 'Quick-add client from invoices page' },
        ],
    },
    {
        version: 'v0.1.0', date: 'Feb 1, 2026', tag: 'Launch 🎉', tagColor: '#a78bfa',
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=75',
        imageAlt: 'Team celebrating product launch',
        changes: [
            { type: 'new', text: 'Initial beta launch 🎉' },
            { type: 'new', text: 'User authentication with JWT (sign up / sign in)' },
            { type: 'new', text: 'Invoice creation and tracking (CRUD)' },
            { type: 'new', text: 'Supabase PostgreSQL database integration' },
            { type: 'new', text: 'Basic responsive dashboard layout' },
        ],
    },
];

const typeConfig: Record<string, { label: string; color: string }> = {
    new: { label: 'New', color: '#34d399' },
    improve: { label: 'Improved', color: '#6b96ff' },
    fix: { label: 'Fixed', color: '#fbbf24' },
};

export default function ChangelogPage() {
    useReveal();

    return (
        <div className="min-h-screen bg-[#09090f] text-white overflow-x-hidden">

            {/* ── Background ── */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="aurora-blob aurora-blob-blue w-[600px] h-[600px]"
                    style={{ top: '-80px', left: '5%', opacity: 0.28 }} />
                <div className="aurora-blob aurora-blob-purple w-[400px] h-[400px]"
                    style={{ bottom: '20%', right: '-5%', opacity: 0.2 }} />
                <div className="absolute inset-0 grid-bg opacity-20" />
            </div>

            <SiteNav activePage="changelog" />

            {/* ── Hero ── */}
            <section className="relative z-10 pt-32 pb-16 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="reveal-left">
                            <span className="text-xs font-semibold tracking-[0.2em] text-blue-400 uppercase mb-5 block">Changelog</span>
                            <h1 className="text-5xl sm:text-6xl font-bold mb-5 tracking-tight leading-[1.05]">
                                What's <span className="grad-text">new</span> in<br />Flowcent
                            </h1>
                            <p className="text-white/50 text-lg mb-6">Every feature, improvement, and fix — documented from day one.</p>
                            <div className="flex gap-4">
                                {[
                                    { v: '8', l: 'versions', color: '#6b96ff' },
                                    { v: '35+', l: 'changes', color: '#a78bfa' },
                                    { v: '3 wks', l: 'since launch', color: '#34d399' },
                                ].map((s, i) => (
                                    <div key={s.l} className={`glass-card px-4 py-3 text-center reveal-scale reveal-delay-${i + 1}`}>
                                        <div className="text-lg font-bold" style={{ color: s.color }}>{s.v}</div>
                                        <div className="text-[10px] text-white/30">{s.l}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative reveal-right reveal-delay-2">
                            <div className="beam-container rounded-3xl">
                                <img
                                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=700&q=75"
                                    alt="Analytics and product metrics on a dashboard"
                                    loading="eager"
                                    fetchPriority="high"
                                    className="rounded-3xl border border-white/[0.07] shadow-2xl object-cover w-full aspect-video"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Entries ── */}
            <section className="relative z-10 px-6 pb-24">
                <div className="max-w-4xl mx-auto space-y-10">
                    {ENTRIES.map((entry, i) => (
                        <div key={entry.version} className={`reveal-up reveal-delay-${Math.min(i % 3 + 1, 6)}`}>
                            {/* Version header */}
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-xl font-bold text-white">{entry.version}</span>
                                {entry.isLatest && (
                                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/25">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                        NEW
                                    </span>
                                )}
                                <span className="text-xs px-2.5 py-1 rounded-full font-semibold border"
                                    style={{ color: entry.tagColor, background: `${entry.tagColor}10`, borderColor: `${entry.tagColor}25` }}>
                                    {entry.tag}
                                </span>
                                <span className="text-xs text-white/25 ml-auto font-mono">{entry.date}</span>
                            </div>

                            {/* Card with image */}
                            <div className="feature-card glass-card overflow-hidden" style={{ borderColor: `${entry.tagColor}12` }}>
                                <div className="grid sm:grid-cols-3">
                                    {/* Image */}
                                    <div className="sm:col-span-1 h-40 sm:h-auto overflow-hidden">
                                        <img src={entry.image} alt={entry.imageAlt}
                                            loading="lazy"
                                            className="feature-card-img w-full h-full object-cover" />
                                    </div>
                                    {/* Changes */}
                                    <div className="sm:col-span-2 p-6 space-y-3">
                                        {entry.changes.map((c, j) => {
                                            const tc = typeConfig[c.type];
                                            return (
                                                <div key={j} className="flex items-start gap-3">
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 mt-0.5"
                                                        style={{ color: tc.color, background: `${tc.color}15`, border: `1px solid ${tc.color}25` }}>
                                                        {tc.label}
                                                    </span>
                                                    <span className="text-sm text-white/65">{c.text}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── Bottom CTA ─── */}
            <section className="relative z-10 px-6 pb-24 reveal-up">
                <div className="max-w-3xl mx-auto">
                    <div className="relative border-glow-card rounded-3xl overflow-hidden text-center px-8 py-14 bg-white/[0.02]">
                        <div className="absolute inset-0 grad-brand opacity-[0.05]" />
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px"
                            style={{ background: 'linear-gradient(90deg, transparent, rgba(107,150,255,0.6), transparent)' }} />
                        <div className="relative">
                            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">Want to be part of what comes next?</p>
                            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
                                We ship early,<br />
                                <span className="grad-text">we ship fast.</span>
                            </h2>
                            <p className="text-white/40 text-sm mb-8 max-w-sm mx-auto">
                                Join the beta and get every new feature as it launches. Focus on work, let Flowcent collect.
                            </p>
                            <Link href="/signup">
                                <button className="btn-primary px-8 py-3.5 text-sm font-semibold">Get early access →</button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <SiteFooter />
        </div>
    );
}
