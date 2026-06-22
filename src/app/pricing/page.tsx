'use client';
import { useState } from 'react';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { useReveal } from '@/hooks/useReveal';

const PLANS = [
    {
        name: 'Free',
        price: { monthly: 0, annual: 0 },
        period: 'forever',
        desc: 'Start collecting payments. No risk.',
        color: '#6b96ff',
        colorRgb: '107,150,255',
        popular: false,
        cta: 'Start for free',
        href: '/signup',
        metric: 'Up to 5 invoices',
        features: [
            { text: '5 active invoices', included: true },
            { text: '3 clients', included: true },
            { text: 'Gmail integration', included: true },
            { text: '5-stage manual follow-ups', included: true },
            { text: 'AI Excuse Memory™ (5×/month)', included: true },
            { text: 'Payment Intent Score (3×/month)', included: true },
            { text: 'Basic analytics', included: true },
            { text: 'INR, USD, EUR, GBP', included: true },
            { text: 'Automated scheduling', included: false },
            { text: 'Unlimited invoices & clients', included: false },
            { text: 'Priority support', included: false },
        ],
    },
    {
        name: 'Pro',
        price: { monthly: 499, annual: 399 },
        period: '/month',
        desc: 'The complete payment collection engine.',
        color: '#a78bfa',
        colorRgb: '167,139,250',
        popular: true,
        cta: 'Start 14-day free trial',
        href: '/signup?plan=pro',
        metric: 'Unlimited everything',
        features: [
            { text: 'Unlimited invoices', included: true },
            { text: 'Unlimited clients', included: true },
            { text: 'Gmail integration + smart scheduling', included: true },
            { text: 'Fully automated 5-stage follow-ups', included: true },
            { text: 'AI Excuse Memory™ (unlimited)', included: true },
            { text: 'Payment Intent Score (unlimited)', included: true },
            { text: 'Advanced analytics & reports', included: true },
            { text: 'All currencies', included: true },
            { text: 'CSV export', included: true },
            { text: 'Priority email support (24hr)', included: true },
            { text: 'Team members', included: false },
        ],
    },
    {
        name: 'Agency',
        price: { monthly: 1499, annual: 1199 },
        period: '/month',
        desc: 'For agencies managing collections at scale.',
        color: '#34d399',
        colorRgb: '52,211,153',
        popular: false,
        cta: 'Contact us',
        href: 'mailto:hello@flowcent.in',
        metric: 'Team + white-label',
        features: [
            { text: 'Everything in Pro', included: true },
            { text: 'Multiple team members', included: true },
            { text: 'White-label email templates', included: true },
            { text: 'Custom sending domain', included: true },
            { text: 'Advanced CSV/PDF export', included: true },
            { text: 'Dedicated account manager', included: true },
            { text: 'SLA-backed support (< 4hr)', included: true },
            { text: 'Custom integrations', included: true },
            { text: 'Audit log & activity tracking', included: true },
            { text: 'Volume pricing', included: true },
            { text: 'Onboarding call included', included: true },
        ],
    },
];

const COMPARISON_ROWS = [
    { label: 'Active invoices', free: '5', pro: 'Unlimited', agency: 'Unlimited', section: 'Invoices' },
    { label: 'Clients', free: '3', pro: 'Unlimited', agency: 'Unlimited', section: null },
    { label: 'Gmail integration', free: true, pro: true, agency: true, section: 'Automation' },
    { label: 'Manual follow-ups', free: true, pro: true, agency: true, section: null },
    { label: 'Automated scheduling', free: false, pro: true, agency: true, section: null },
    { label: 'AI Excuse Memory™', free: '5/mo', pro: 'Unlimited', agency: 'Unlimited', section: 'AI' },
    { label: 'Payment Intent Score', free: '3/mo', pro: 'Unlimited', agency: 'Unlimited', section: null },
    { label: 'Analytics dashboard', free: 'Basic', pro: 'Advanced', agency: 'Advanced + Export', section: 'Analytics' },
    { label: 'CSV export', free: false, pro: true, agency: true, section: null },
    { label: 'Team members', free: false, pro: false, agency: true, section: 'Team' },
    { label: 'White-label emails', free: false, pro: false, agency: true, section: null },
    { label: 'Support level', free: 'Community', pro: 'Priority email', agency: 'Dedicated manager', section: null },
];

const FAQS = [
    { q: 'Can I upgrade or downgrade anytime?', a: 'Yes. Upgrade or downgrade at any time. If you downgrade, your Pro features stay active until the end of your billing period — nothing is lost mid-cycle.' },
    { q: 'Is the 14-day Pro trial really free?', a: 'Completely free — no credit card required to start. After 14 days, you\'ll be prompted to enter payment details or drop to the Free plan automatically.' },
    { q: 'What happens to my invoices if I downgrade?', a: 'Your data is always safe. Existing invoices become read-only if you exceed the free plan limits — you can\'t create new ones until you\'re under the limit or upgrade again.' },
    { q: 'Do you issue GST invoices for subscriptions?', a: 'Yes. All paid plans include a GST-compliant invoice for every billing cycle, downloadable from your account settings.' },
    { q: 'Do you offer startup or NGO discounts?', a: 'Yes — email us at hello@flowcent.in with your details. We\'ve worked with bootstrapped founders and nonprofits before and we\'ll work something out.' },
    { q: 'Can I use Flowcent in languages other than English?', a: 'The AI Excuse Memory™ engine understands replies in Hindi, Hinglish, Tamil, Telugu, and English. The interface is in English only for now — regional language UI is on our roadmap.' },
];

function CheckIcon({ color }: { color: string }) {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color }}>
            <circle cx="7" cy="7" r="6.5" fill="currentColor" opacity="0.12" />
            <path d="M4 7l2.5 2.5L10 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function XIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-white/15">
            <circle cx="7" cy="7" r="6.5" stroke="currentColor" strokeOpacity="0.2" />
            <path d="M5 5l4 4M9 5l-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
    );
}

function CellValue({ val, color }: { val: string | boolean; color: string }) {
    if (val === true) return <CheckIcon color={color} />;
    if (val === false) return <XIcon />;
    return <span className="text-[12px] font-medium text-white/60">{val}</span>;
}

function FAQ({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <button onClick={() => setOpen(o => !o)}
            className="w-full text-left p-5 rounded-2xl border border-white/[0.07] hover:border-white/15 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200 group">
            <div className="flex items-start justify-between gap-4">
                <span className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors leading-snug">{q}</span>
                <span className={`text-white/30 shrink-0 mt-0.5 transition-transform duration-200 text-lg ${open ? 'rotate-45' : ''}`}>+</span>
            </div>
            {open && (
                <p className="text-sm text-white/45 mt-3 leading-relaxed" style={{ animation: 'revealUp 0.25s ease both' }}>{a}</p>
            )}
        </button>
    );
}

export default function PricingPage() {
    useReveal();
    const [annual, setAnnual] = useState(false);

    const fmt = (n: number) => n === 0 ? '₹0' : `₹${annual ? Math.round(n * 0.8).toLocaleString('en-IN') : n.toLocaleString('en-IN')}`;

    return (
        <div className="min-h-screen bg-[#09090f] text-white overflow-x-hidden">

            {/* Ambient blobs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(107,150,255,0.06) 0%, transparent 70%)' }} />
                <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 70%)' }} />
                <div className="absolute inset-0 grid-bg opacity-[0.08]" />
            </div>

            <SiteNav activePage="pricing" />

            {/* ─── Hero ─── */}
            <section className="relative z-10 pt-44 pb-20 px-6 text-center">
                <div style={{ animation: 'revealUp 0.6s cubic-bezier(0.22,1,0.36,1) both' }}>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.04] text-xs font-semibold text-white/50 mb-8">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        Simple, transparent pricing · No hidden fees
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter leading-[1.08] mb-6">
                        Pay for results,
                        <br />
                        <span className="grad-text tracking-tighter">not for software.</span>
                    </h1>
                    <p className="text-lg text-white/45 max-w-xl mx-auto mb-10 leading-relaxed">
                        Start free. Upgrade only when Flowcent pays for itself — which usually happens in the first week.
                    </p>

                    {/* Annual toggle */}
                    <div className="inline-flex items-center gap-3 p-1 rounded-xl bg-white/[0.05] border border-white/[0.07]">
                        <button onClick={() => setAnnual(false)}
                            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${!annual ? 'bg-white/[0.08] text-white shadow-sm' : 'text-white/40 hover:text-white/60'}`}>
                            Monthly
                        </button>
                        <button onClick={() => setAnnual(true)}
                            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${annual ? 'bg-white/[0.08] text-white shadow-sm' : 'text-white/40 hover:text-white/60'}`}>
                            Annual
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-green-500/15 text-green-400 border border-green-500/20">-20%</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* ─── Plans ─── */}
            <section className="relative z-10 px-6 pb-20">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-5 items-start">
                        {PLANS.map((plan, i) => (
                            <div key={plan.name}
                                className={`relative rounded-2xl overflow-hidden transition-all duration-300 reveal-up ${plan.popular ? 'md:-mt-4' : ''}`}
                                style={{
                                    animationDelay: `${i * 0.08}s`,
                                    background: plan.popular
                                        ? `linear-gradient(145deg, rgba(${plan.colorRgb},0.08) 0%, rgba(13,13,24,0.98) 50%)`
                                        : 'rgba(13,13,24,0.9)',
                                    border: plan.popular ? `1px solid rgba(${plan.colorRgb},0.3)` : '1px solid rgba(255,255,255,0.07)',
                                    boxShadow: plan.popular ? `0 0 60px rgba(${plan.colorRgb},0.1)` : 'none',
                                }}>

                                {/* Popular badge */}
                                {plan.popular && (
                                    <div className="px-5 py-2.5 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest"
                                        style={{ background: `linear-gradient(90deg, rgba(${plan.colorRgb},0.15) 0%, rgba(${plan.colorRgb},0.08) 100%)`, borderBottom: `1px solid rgba(${plan.colorRgb},0.15)`, color: plan.color }}>
                                        <span className="w-1 h-1 rounded-full" style={{ background: plan.color }} />
                                        Most Popular
                                    </div>
                                )}

                                <div className="p-6 space-y-6">
                                    {/* Plan name & price */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                                                style={{ color: plan.color, background: `rgba(${plan.colorRgb},0.1)`, border: `1px solid rgba(${plan.colorRgb},0.2)` }}>
                                                {plan.name}
                                            </span>
                                            <span className="text-[11px] text-white/30 font-medium">{plan.metric}</span>
                                        </div>
                                        <div className="flex items-baseline gap-1 mb-1">
                                            <span className="text-4xl font-black text-white">{fmt(plan.price.monthly)}</span>
                                            <span className="text-white/35 text-sm">{plan.period}</span>
                                        </div>
                                        {annual && plan.price.monthly > 0 && (
                                            <p className="text-[11px] text-white/30">
                                                Billed ₹{Math.round(plan.price.monthly * 0.8 * 12).toLocaleString('en-IN')}/yr · Save ₹{Math.round(plan.price.monthly * 0.2 * 12).toLocaleString('en-IN')}
                                            </p>
                                        )}
                                        <p className="text-xs text-white/40 mt-2">{plan.desc}</p>
                                    </div>

                                    {/* CTA */}
                                    <Link href={plan.href}>
                                        <button className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 ${plan.popular
                                            ? 'btn-primary text-white'
                                            : 'border border-white/[0.1] bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white hover:border-white/20'
                                            }`}>
                                            {plan.cta}
                                        </button>
                                    </Link>
                                    {plan.name === 'Free' && <p className="text-center text-[11px] text-white/25">No credit card required</p>}
                                    {plan.name === 'Pro' && <p className="text-center text-[11px] text-white/25">No credit card for trial · Cancel anytime</p>}

                                    {/* Features */}
                                    <div className="space-y-2.5 pt-2 border-t border-white/[0.06]">
                                        {plan.features.map((f) => (
                                            <div key={f.text} className={`flex items-start gap-2.5 ${f.included ? '' : 'opacity-30'}`}>
                                                {f.included ? <CheckIcon color={plan.color} /> : <XIcon />}
                                                <span className="text-[12.5px] text-white/65 leading-snug">{f.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Trust Signals ─── */}
            <section className="relative z-10 px-6 pb-20">
                <div className="max-w-4xl mx-auto">
                    <div className="grid sm:grid-cols-3 gap-4">
                        {[
                            { icon: '🔒', title: 'No Lock-in', desc: 'Cancel or downgrade at any time. Your data exports as CSV on request.' },
                            { icon: '🇮🇳', title: 'Made for India', desc: 'INR pricing, GST invoices, UPI-friendly. Built by Indian freelancers, for Indian freelancers.' },
                            { icon: '⚡', title: 'ROI in Week 1', desc: 'Most users collect their first overdue payment within 7 days of signing up.' },
                        ].map(t => (
                            <div key={t.title} className="flex flex-col gap-3 p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                                <span className="text-2xl">{t.icon}</span>
                                <div>
                                    <p className="text-sm font-semibold text-white mb-1">{t.title}</p>
                                    <p className="text-xs text-white/40 leading-relaxed">{t.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Comparison Table ─── */}
            <section className="relative z-10 px-6 pb-24 reveal-up">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-bold tracking-tighter text-white mb-2">Compare plans</h2>
                        <p className="text-sm text-white/35">Full feature breakdown</p>
                    </div>
                    <div className="rounded-2xl border border-white/[0.07] overflow-hidden bg-[#0d0d18]/80">
                        {/* Header */}
                        <div className="grid grid-cols-4 divide-x divide-white/[0.06] border-b border-white/[0.07] bg-white/[0.02]">
                            <div className="p-4" />
                            {PLANS.map(p => (
                                <div key={p.name} className="p-4 text-center">
                                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: p.color }}>{p.name}</span>
                                </div>
                            ))}
                        </div>
                        {/* Rows */}
                        {COMPARISON_ROWS.map((row, i) => (
                            <div key={row.label}>
                                {row.section && (
                                    <div className="px-4 py-2 bg-white/[0.02] border-t border-white/[0.05]">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/25">{row.section}</span>
                                    </div>
                                )}
                                <div className={`grid grid-cols-4 divide-x divide-white/[0.04] border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? '' : ''}`}>
                                    <div className="p-4">
                                        <span className="text-[12.5px] text-white/55">{row.label}</span>
                                    </div>
                                    <div className="p-4 flex items-center justify-center"><CellValue val={row.free} color={PLANS[0].color} /></div>
                                    <div className="p-4 flex items-center justify-center"><CellValue val={row.pro} color={PLANS[1].color} /></div>
                                    <div className="p-4 flex items-center justify-center"><CellValue val={row.agency} color={PLANS[2].color} /></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── FAQ ─── */}
            <section className="relative z-10 px-6 pb-24 reveal-up">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-bold tracking-tighter text-white mb-2">Frequently asked</h2>
                        <p className="text-sm text-white/35">Everything you need to make a decision</p>
                    </div>
                    <div className="space-y-3">
                        {FAQS.map(faq => <FAQ key={faq.q} {...faq} />)}
                    </div>
                    <div className="mt-8 text-center">
                        <p className="text-sm text-white/35">Still have questions?</p>
                        <Link href="/contact" className="text-sm text-blue-400 hover:text-blue-300 font-semibold transition-colors">Contact us →</Link>
                    </div>
                </div>
            </section>

            {/* ─── Bottom CTA ─── */}
            <section className="relative z-10 px-6 pb-24 reveal-up">
                <div className="max-w-3xl mx-auto">
                    <div className="relative rounded-3xl overflow-hidden text-center px-8 py-14">
                        <div className="absolute inset-0 grad-brand opacity-[0.07]" />
                        <div className="absolute inset-0 border border-blue-500/[0.12] rounded-3xl" />
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px"
                            style={{ background: 'linear-gradient(90deg, transparent, rgba(107,150,255,0.6), transparent)' }} />
                        <div className="relative">
                            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">Start collecting today</p>
                            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter text-white mb-4 leading-tight">
                                Your next overdue invoice
                                <br />
                                <span className="grad-text tracking-tighter">pays for a year of Pro.</span>
                            </h2>
                            <p className="text-white/40 text-sm mb-8 max-w-md mx-auto">
                                Join 500+ Indian freelancers who stopped chasing and started collecting.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                <Link href="/signup">
                                    <button className="btn-primary px-8 py-3.5 text-sm font-semibold">Start free →</button>
                                </Link>
                                <Link href="/dashboard">
                                    <button className="btn-outline px-8 py-3.5 text-sm font-semibold">View demo dashboard</button>
                                </Link>
                            </div>
                            <p className="text-xs text-white/20 mt-4">Free plan available forever · No credit card required</p>
                        </div>
                    </div>
                </div>
            </section>

            <SiteFooter />
        </div>
    );
}
