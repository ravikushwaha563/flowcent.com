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
        desc: 'Start with the core invoice workflow.',
        color: '#6b96ff',
        colorRgb: '107,150,255',
        popular: false,
        cta: 'Start for free',
        href: '/signup',
        metric: 'Up to 5 invoices/month',
        features: [
            { text: '5 invoices per month', included: true },
            { text: '3 clients', included: true },
            { text: 'Gmail integration', included: true },
            { text: '5-stage manual follow-ups', included: true },
            { text: '5 shared AI analyses per month', included: true },
            { text: 'Payment intent scoring', included: true },
            { text: 'Basic analytics', included: true },
            { text: 'INR, USD, EUR, GBP', included: true },
            { text: 'Automated scheduling', included: false },
            { text: 'Unlimited invoices & clients', included: false },
            { text: 'Email support', included: false },
        ],
    },
    {
        name: 'Pro',
        price: { monthly: 499, annual: 399 },
        period: '/month',
        desc: 'Higher limits and scheduled follow-ups.',
        color: '#a78bfa',
        colorRgb: '167,139,250',
        popular: true,
        cta: 'Create account',
        href: '/signup?plan=pro',
        metric: 'Unlimited core usage',
        features: [
            { text: 'Unlimited invoices', included: true },
            { text: 'Unlimited clients', included: true },
            { text: 'Gmail integration + smart scheduling', included: true },
            { text: 'Fully automated 5-stage follow-ups', included: true },
            { text: 'AI reply analysis (unlimited)', included: true },
            { text: 'Payment Intent Score (unlimited)', included: true },
            { text: 'Dashboard analytics', included: true },
            { text: 'INR, USD, EUR, GBP', included: true },
            { text: 'Secure Razorpay and Stripe links', included: true },
            { text: 'CSV invoice export', included: true },
            { text: 'Team members', included: false },
        ],
    },
];

const COMPARISON_ROWS = [
    { label: 'Invoices per month', free: '5', pro: 'Unlimited', section: 'Invoices' },
    { label: 'Clients', free: '3', pro: 'Unlimited', section: null },
    { label: 'Gmail integration', free: true, pro: true, section: 'Automation' },
    { label: 'Manual follow-ups', free: true, pro: true, section: null },
    { label: 'Automated scheduling', free: false, pro: true, section: null },
    { label: 'AI usage', free: '5/mo shared', pro: 'Unlimited', section: 'AI' },
    { label: 'Payment intent score', free: true, pro: true, section: null },
    { label: 'Payment links', free: true, pro: true, section: 'Payments' },
    { label: 'PDF invoice export', free: true, pro: true, section: null },
    { label: 'CSV invoice export', free: false, pro: true, section: null },
    { label: 'Team members', free: false, pro: false, section: 'Roadmap' },
];

const FAQS = [
    { q: 'What does the Free plan include?', a: 'The Free plan includes 5 invoices per month, 3 clients and 5 shared AI analyses. Manual follow-ups and payment links remain available.' },
    { q: 'When does Pro activate?', a: 'Pro activates after the Razorpay payment is verified. Monthly and annual billing are supported from the Billing page.' },
    { q: 'What happens when Pro expires?', a: 'Your account falls back to Free limits. Existing records remain in your account, while new usage must stay within the Free plan limits.' },
    { q: 'Can I use international currencies?', a: 'Yes. Invoice display supports INR, USD, EUR and GBP. INR checkout uses Razorpay; the other supported currencies use Stripe Checkout.' },
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

    const fmt = (monthly: number, annualPrice: number) => monthly === 0 ? '₹0' : `₹${(annual ? annualPrice : monthly).toLocaleString('en-IN')}`;

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
                        Start with the essentials,
                        <br />
                        <span className="grad-text tracking-tighter">upgrade as you grow.</span>
                    </h1>
                    <p className="text-lg text-white/45 max-w-xl mx-auto mb-10 leading-relaxed">
                        The Free plan covers a focused workflow. Pro adds unlimited core usage and scheduled Gmail follow-ups.
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
                    <div className="grid md:grid-cols-2 gap-5 items-start max-w-3xl mx-auto">
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
                                            <span className="text-4xl font-black text-white">{fmt(plan.price.monthly, plan.price.annual)}</span>
                                            <span className="text-white/35 text-sm">{plan.period}</span>
                                        </div>
                                        {annual && plan.price.monthly > 0 && (
                                            <p className="text-[11px] text-white/30">
                                                Billed ₹{(plan.price.annual * 12).toLocaleString('en-IN')}/yr · Save ₹{((plan.price.monthly - plan.price.annual) * 12).toLocaleString('en-IN')}
                                            </p>
                                        )}
                                        <p className="text-xs text-white/40 mt-2">{plan.desc}</p>
                                    </div>

                                    {/* CTA */}
                                    <Link href={plan.href} className={`block w-full py-3 rounded-xl text-sm text-center font-bold transition-all duration-200 ${plan.popular
                                            ? 'btn-primary text-white'
                                            : 'border border-white/[0.1] bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white hover:border-white/20'
                                            }`}>
                                        {plan.cta}
                                    </Link>
                                    {plan.name === 'Free' && <p className="text-center text-[11px] text-white/25">No credit card required</p>}
                                    {plan.name === 'Pro' && <p className="text-center text-[11px] text-white/25">Secure checkout via Razorpay</p>}

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
                            { icon: '🔒', title: 'Secure Checkout', desc: 'Pro activation is tied to a verified Razorpay order and amount.' },
                            { icon: '🇮🇳', title: 'Made for India', desc: 'INR pricing and Razorpay checkout, with multi-currency client invoices.' },
                            { icon: '⚡', title: 'Free to Start', desc: 'Create clients and invoices without entering payment details.' },
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
                        <div className="grid grid-cols-3 divide-x divide-white/[0.06] border-b border-white/[0.07] bg-white/[0.02]">
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
                                <div className={`grid grid-cols-3 divide-x divide-white/[0.04] border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? '' : ''}`}>
                                    <div className="p-4">
                                        <span className="text-[12.5px] text-white/55">{row.label}</span>
                                    </div>
                                    <div className="p-4 flex items-center justify-center"><CellValue val={row.free} color={PLANS[0].color} /></div>
                                    <div className="p-4 flex items-center justify-center"><CellValue val={row.pro} color={PLANS[1].color} /></div>
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
                                Build a more consistent
                                <br />
                                <span className="grad-text tracking-tighter">collection workflow.</span>
                            </h2>
                            <p className="text-white/40 text-sm mb-8 max-w-md mx-auto">
                                Start with the free plan and upgrade only when your collection workflow grows.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                <Link href="/signup" className="btn-primary px-8 py-3.5 text-sm font-semibold">
                                    Start free →
                                </Link>
                                <Link href="/dashboard" className="btn-outline px-8 py-3.5 text-sm font-semibold">
                                    Open dashboard
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
