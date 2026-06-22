'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';

const CATEGORIES = [
    {
        slug: 'invoice-management',
        icon: '📄',
        label: 'Invoice Management',
        color: '#6b96ff',
        tagline: 'Create, track, and get paid without the spreadsheet chaos',
        desc: 'Smart invoice creation, auto overdue detection, multi-currency support, and PDF export. Every invoice has a real-time status your whole workflow depends on.',
        count: 4,
        features: ['Smart Invoice Tracking', 'Multi-Currency (INR/USD/EUR/GBP)', 'Auto Overdue Detection', 'PDF Invoice Export'],
        image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=700&q=75',
        imageAlt: 'Financial invoices and calculator on a professional desk',
    },
    {
        slug: 'ai-automation',
        icon: '🤖',
        label: 'AI & Automation',
        color: '#a78bfa',
        tagline: 'AI that reads excuses, predicts payment, and follows up automatically',
        desc: 'Our flagship AI capabilities — Excuse Memory™, staged follow-ups from your Gmail, and a Payment Intent Score that predicts whether a client will actually pay.',
        count: 4,
        features: ['AI Excuse Memory™', '5-Stage Auto Follow-ups from Gmail', 'Payment Intent Score (0–100)', 'Gmail OAuth Integration'],
        image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=700&q=75',
        imageAlt: 'Abstract AI neural network visualization in purple',
    },
    {
        slug: 'client-intelligence',
        icon: '👥',
        label: 'Client Intelligence',
        color: '#34d399',
        tagline: 'Know every client\'s payment personality before you chase them',
        desc: 'Full client profiles, payment risk scoring, promise & excuse logging with timelines, and an analytics dashboard that shows your payment health at a glance.',
        count: 4,
        features: ['Client Profiles with Risk Score', 'Promise & Excuse Tracker', 'Collection Analytics Dashboard', 'Client Payment History'],
        image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=700&q=75',
        imageAlt: 'Business professionals reviewing client intelligence data',
    },
    {
        slug: 'integrations',
        icon: '🔗',
        label: 'Integrations',
        color: '#fbbf24',
        tagline: 'Connect the tools you already use — no new habits needed',
        desc: 'Gmail is live. Razorpay payment links, WhatsApp follow-ups, and accounting exports (Zoho, Tally) are coming in Q2 2026.',
        count: 4,
        features: ['Gmail Integration (Live)', 'Razorpay Payment Links (Q2)', 'WhatsApp Follow-ups (Q2)', 'Accounting Export — Zoho/Tally (Q2)'],
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=700&q=75',
        imageAlt: 'Digital integrations and connectivity concept with glowing nodes',
    },
];

const STATS = [
    { v: '12', l: 'Total Features', color: '#6b96ff' },
    { v: '4', l: 'Categories', color: '#a78bfa' },
    { v: '₹0', l: 'To Start', color: '#34d399' },
    { v: '5 min', l: 'Setup Time', color: '#fbbf24' },
];

/* ── Lightweight client-side reveal hook ─────────────────────────────────── */
function useReveal() {
    const ref = useRef<HTMLElement | null>(null);
    useEffect(() => {
        const sel = '.reveal-up,.reveal-left,.reveal-right,.reveal-scale,.reveal-fade';
        const els = document.querySelectorAll<Element>(sel);
        if (!els.length) return;
        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
        els.forEach(el => io.observe(el));
        return () => io.disconnect();
    }, []);
    return ref;
}

export default function FeaturesIndexPage() {
    useReveal(); // Runs AFTER client mount — no hydration conflict

    return (
        <div className="min-h-screen bg-[#09090f] text-white overflow-x-hidden">

            {/* ── Background ── */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="aurora-blob aurora-blob-blue w-[600px] h-[600px]"
                    style={{ top: '-80px', left: '5%', opacity: 0.35 }} />
                <div className="aurora-blob aurora-blob-purple w-[450px] h-[450px]"
                    style={{ top: '50%', right: '-5%', opacity: 0.25 }} />
                <div className="absolute inset-0 grid-bg opacity-20" />
            </div>

            <SiteNav activePage="features" />

            {/* ── Hero ── */}
            <section className="relative z-10 pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">

                        {/* Left */}
                        <div className="reveal-left">
                            <span className="text-xs font-semibold tracking-[0.2em] text-blue-400 uppercase mb-5 block">
                                All Features
                            </span>
                            <h1 className="text-5xl sm:text-6xl font-bold mb-6 tracking-tighter leading-[1.05]">
                                12 features,<br />
                                <span className="grad-text tracking-tighter">4 categories</span>
                            </h1>
                            <p className="text-white/50 text-xl leading-relaxed mb-8">
                                Every feature in Flowcent is built around one goal: reducing the time between sending an invoice and getting paid.
                            </p>

                            {/* Stat pills */}
                            <div className="flex flex-wrap gap-3 mb-8">
                                {STATS.map((s, i) => (
                                    <div key={s.l}
                                        className={`glass-card px-5 py-3 flex items-center gap-3 reveal-scale reveal-delay-${i + 1}`}>
                                        <span className="text-xl font-bold" style={{ color: s.color }}>{s.v}</span>
                                        <span className="text-xs text-white/35">{s.l}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link href="/signup">
                                    <button className="btn-primary px-8 py-3.5">Get all features free →</button>
                                </Link>
                                <Link href="/pricing">
                                    <button className="btn-outline px-8 py-3.5">View pricing</button>
                                </Link>
                            </div>
                        </div>

                        {/* Hero image */}
                        <div className="relative reveal-right reveal-delay-2">
                            <div className="beam-container rounded-3xl">
                                <Image
                                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=75"
                                    alt="Analytics dashboard showing payment collection metrics"
                                    width={900} height={675} sizes="(max-width: 1024px) 100vw, 50vw" priority
                                    className="rounded-3xl border border-white/[0.07] shadow-2xl object-cover w-full aspect-[4/3]"
                                />
                            </div>
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tl from-[#09090f]/50 via-transparent to-transparent pointer-events-none" />
                            <div className="absolute -bottom-4 -right-4 glass-card px-5 py-3 flex items-center gap-2.5 anim-bounce-in">
                                <span className="text-lg">💸</span>
                                <div>
                                    <p className="text-xs font-bold text-white">Overdue collected</p>
                                    <p className="text-sm font-bold text-green-400">₹2,40,000</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Category Cards ── */}
            <section className="relative z-10 py-8 px-6 pb-24">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12 reveal-up">
                        <h2 className="text-3xl font-bold tracking-tighter mb-3">Choose a category to explore</h2>
                        <p className="text-white/40">Each category has its own dedicated page with full feature details, images, and benefit breakdowns.</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                        {CATEGORIES.map((cat, i) => (
                            <Link key={cat.slug} href={`/features/${cat.slug}`}>
                                <div
                                    className={`feature-card glass-card overflow-hidden cursor-pointer group h-full reveal-up reveal-delay-${i + 1}`}
                                    style={{ borderColor: `${cat.color}20` }}
                                >
                                    {/* Image */}
                                    <div className="relative h-48 overflow-hidden">
                                        <Image
                                            src={cat.image}
                                            alt={cat.imageAlt}
                                            width={700} height={400} sizes="(max-width: 640px) 100vw, 50vw"
                                            className="feature-card-img w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#09090f] via-[#09090f]/25 to-transparent" />

                                        {/* Icon badge */}
                                        <div className="absolute top-4 left-4">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                                                style={{ background: `${cat.color}20`, backdropFilter: 'blur(8px)', border: `1px solid ${cat.color}25` }}>
                                                {cat.icon}
                                            </div>
                                        </div>

                                        {/* Feature count */}
                                        <div className="absolute top-4 right-4">
                                            <span className="text-[10px] px-2.5 py-1 rounded-full font-bold"
                                                style={{ color: cat.color, background: `${cat.color}15`, border: `1px solid ${cat.color}25` }}>
                                                {cat.count} features
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-7">
                                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-300 transition-colors duration-200">
                                            {cat.label}
                                        </h3>
                                        <p className="text-sm font-medium mb-3" style={{ color: cat.color }}>{cat.tagline}</p>
                                        <p className="text-sm text-white/40 leading-relaxed mb-5">{cat.desc}</p>

                                        {/* Feature list preview */}
                                        <div className="space-y-1.5 mb-5">
                                            {cat.features.map(f => (
                                                <div key={f} className="flex items-center gap-2 text-xs">
                                                    <span style={{ color: cat.color }}>✓</span>
                                                    <span className="text-white/50">{f}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <span className="text-sm font-semibold flex items-center gap-1.5" style={{ color: cat.color }}>
                                            Explore {cat.label} →
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Coming Soon ── */}
            <section className="relative z-10 px-6 pb-16">
                <div className="max-w-7xl mx-auto reveal-up">
                    <div className="p-5 rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.01] text-center">
                        <p className="text-sm text-white/30">
                            🚀 <span className="text-white/50 font-medium">Coming soon:</span> PDF Invoice Export · WhatsApp Follow-ups · Razorpay Payment Links · Stripe Integration · Team Collaboration
                        </p>
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="relative z-10 px-6 pb-24 reveal-up">
                <div className="max-w-3xl mx-auto">
                    <div className="relative border-glow-card rounded-3xl overflow-hidden text-center px-8 py-14 bg-white/[0.02]">
                        <div className="absolute inset-0 grad-brand opacity-[0.05]" />
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px"
                            style={{ background: 'linear-gradient(90deg, transparent, rgba(107,150,255,0.6), transparent)' }} />
                        <div className="relative">
                            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">Start collecting today</p>
                            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter text-white mb-4 leading-tight">
                                All 12 features ·<br />
                                <span className="grad-text tracking-tighter">free to start.</span>
                            </h2>
                            <p className="text-white/40 text-sm mb-8 max-w-sm mx-auto">
                                No credit card. No catch. 5-invoice free plan forever — upgrade only when you need to.
                            </p>
                            <Link href="/signup">
                                <button className="btn-primary px-8 py-3.5 text-sm font-semibold">Start free →</button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <SiteFooter />
        </div>
    );
}
