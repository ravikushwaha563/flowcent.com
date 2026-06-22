'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { useReveal } from '@/hooks/useReveal';

const TEAM = [
    {
        name: 'Arjun Singh',
        role: 'Co-founder & CEO',
        bio: 'Former SaaS product manager who got his agency invoices ignored for 90 days. Built Flowcent to fix that.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=75',
        imageAlt: 'CEO profile photo',
        color: '#6b96ff',
    },
    {
        name: 'Priya Mehta',
        role: 'Co-founder & CTO',
        bio: 'Full-stack engineer with 8 years in fintech. Obsessed with automation workflows and developer experience.',
        image: 'https://images.unsplash.com/photo-1573496359142-b89b2c71e24c?auto=format&fit=crop&w=400&q=75',
        imageAlt: 'CTO profile photo',
        color: '#a78bfa',
    },
    {
        name: 'Ravi Kumar',
        role: 'Head of Product',
        bio: 'Ex-freelance developer who spent more time chasing payments than writing code. Now he builds tools to stop that.',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=75',
        imageAlt: 'Head of Product profile photo',
        color: '#34d399',
    },
];

const TIMELINE = [
    { date: 'Jan 2026', title: 'Idea born', desc: 'Arjun gets his third ₹80K invoice ghosted. Decides to build the tool he always needed.', color: '#6b96ff' },
    { date: 'Feb 1, 2026', title: 'Beta launch', desc: 'v0.1.0 ships with core invoicing, auth, and Supabase backend. First 50 beta users.', color: '#a78bfa' },
    { date: 'Feb 8, 2026', title: 'Gmail connected', desc: 'v0.3.0: Gmail OAuth integration. Follow-up emails now sent from users\' real inbox.', color: '#34d399' },
    { date: 'Feb 15, 2026', title: 'AI Excuse Memory™ ships', desc: 'v0.6.0: AI extracts payment promises from client replies. 85% categorization accuracy.', color: '#fbbf24' },
    { date: 'Feb 20, 2026', title: 'Payment Intent Score', desc: 'v0.8.0: 0–100 AI-calculated payment likelihood score launches. Real-time factor breakdown.', color: '#f87171' },
    { date: 'Q2 2026', title: 'Coming next', desc: 'WhatsApp follow-ups, Razorpay payment links, PDF export, and team collaboration.', color: '#6b96ff' },
];

const VALUES = [
    { icon: '🎯', title: 'Relentlessly practical', desc: 'We build features that solve real pain — no vanity metrics, no fluff.', color: '#6b96ff' },
    { icon: '🇮🇳', title: 'Built for India first', desc: 'Indian freelancers have unique payment challenges. We design for that reality.', color: '#a78bfa' },
    { icon: '🔒', title: 'Privacy by design', desc: 'We never read your inbox. Gmail OAuth is write-only. Your data is yours.', color: '#34d399' },
    { icon: '💰', title: 'Free tier forever', desc: 'Every freelancer deserves better cash flow tools — even if they can\'t afford to pay yet.', color: '#fbbf24' },
];

const STATS = [
    { v: '500+', l: 'Freelancers', color: '#6b96ff' },
    { v: '₹1.2Cr', l: 'Collected', color: '#34d399' },
    { v: '3 wks', l: 'To build v1', color: '#a78bfa' },
    { v: '85%', l: 'AI Accuracy', color: '#fbbf24' },
];

export default function AboutPage() {
    useReveal();

    return (
        <div className="min-h-screen bg-[#09090f] text-white overflow-x-hidden">

            {/* ── Animated Background ── */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="aurora-blob aurora-blob-green w-[700px] h-[700px]"
                    style={{ top: '-100px', left: '-10%', opacity: 0.3 }} />
                <div className="aurora-blob aurora-blob-blue w-[500px] h-[500px]"
                    style={{ bottom: '10%', right: '-5%', opacity: 0.2 }} />
                <div className="absolute inset-0 grid-bg opacity-20" />
            </div>

            <SiteNav activePage="about" />

            {/* ── Hero ── */}
            <section className="relative z-10 pt-32 pb-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="reveal-left">
                            <span className="text-xs font-semibold tracking-[0.2em] text-green-400 uppercase mb-5 block">About Flowcent</span>
                            <h1 className="text-5xl sm:text-6xl font-bold mb-6 tracking-tight leading-[1.05]">
                                We're fixing how<br />India's freelancers<br /><span className="grad-text">get paid</span>
                            </h1>
                            <p className="text-white/50 text-lg leading-relaxed mb-6">
                                Flowcent was built by a team that got tired of the same story: you do great work, you send an invoice, and then spend the next 45 days chasing it.
                            </p>
                            <p className="text-white/35 text-lg leading-relaxed">
                                We built the collection system we always wished existed — AI-powered, Gmail-connected, and engineered for the realities of Indian freelance payment culture.
                            </p>
                        </div>

                        <div className="relative reveal-right reveal-delay-2">
                            <div className="beam-container rounded-3xl">
                                <img
                                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=75"
                                    alt="Team collaborating in a modern office"
                                    loading="eager"
                                    fetchPriority="high"
                                    className="rounded-3xl border border-white/[0.07] shadow-2xl object-cover w-full aspect-[4/3]"
                                />
                            </div>
                            <div className="absolute inset-0 rounded-3xl pointer-events-none bg-gradient-to-tl from-[#09090f]/30 via-transparent to-transparent" />
                            <div className="absolute -bottom-5 -right-4 glass-card px-5 py-3 anim-bounce-in">
                                <div className="text-lg font-bold grad-text">₹1.2Cr</div>
                                <div className="text-xs text-white/35">collected by beta users</div>
                            </div>
                            <div className="absolute -top-4 -left-4 glass-card px-4 py-3 anim-bounce-in" style={{ animationDelay: '0.3s' }}>
                                <div className="flex gap-0.5 mb-1">{Array(5).fill(0).map((_, i) => <span key={i} className="text-yellow-400 text-xs">★</span>)}</div>
                                <div className="text-xs text-white/50">500+ freelancers trust us</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Stats ── */}
            <section className="relative z-10 px-6 py-12">
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {STATS.map((s, i) => (
                            <div key={s.l} className={`glass-card p-6 text-center reveal-scale reveal-delay-${i + 1}`}>
                                <div className="text-3xl font-bold mb-1" style={{ color: s.color }}>{s.v}</div>
                                <div className="text-xs text-white/40">{s.l}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Mission banner ── */}
            <section className="relative z-10 py-12 px-6">
                <div className="max-w-7xl mx-auto reveal-up">
                    <div className="relative rounded-3xl overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1400&q=75"
                            alt="Team strategy session"
                            loading="lazy"
                            className="w-full h-64 object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#09090f]/90 via-[#09090f]/70 to-transparent flex items-center px-12">
                            <div className="max-w-2xl">
                                <h2 className="text-3xl font-bold mb-3">Our mission</h2>
                                <p className="text-white/55 text-lg leading-relaxed">
                                    To make payment collection completely stress-free for every Indian freelancer and agency — so you can spend your energy creating, not chasing.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Team ── */}
            <section className="relative z-10 py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12 reveal-up">
                        <h2 className="text-3xl font-bold mb-3">Meet the team</h2>
                        <p className="text-white/40">A small team obsessed with one problem: helping creators get paid.</p>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-6">
                        {TEAM.map((m, i) => (
                            <div key={m.name}
                                className={`feature-card glass-card overflow-hidden reveal-up reveal-delay-${i + 1}`}
                                style={{ borderColor: `${m.color}20` }}>
                                <div className="h-56 overflow-hidden">
                                    <img src={m.image} alt={m.imageAlt}
                                        loading="lazy"
                                        className="feature-card-img w-full h-full object-cover object-top" />
                                </div>
                                <div className="p-6">
                                    <h3 className="font-bold text-white">{m.name}</h3>
                                    <p className="text-xs mb-3 mt-0.5" style={{ color: m.color }}>{m.role}</p>
                                    <p className="text-sm text-white/45 leading-relaxed">{m.bio}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Timeline ── */}
            <section className="relative z-10 py-16 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12 reveal-up">
                        <h2 className="text-3xl font-bold mb-3">Our journey</h2>
                        <p className="text-white/40">From a frustrated freelancer's idea to a full product in 3 weeks.</p>
                    </div>
                    <div className="relative">
                        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/50 via-purple-500/30 to-transparent" />
                        <div className="space-y-8">
                            {TIMELINE.map((t, i) => (
                                <div key={t.date} className={`flex gap-6 reveal-left reveal-delay-${Math.min(i + 1, 6)}`}>
                                    <div className="relative shrink-0">
                                        <div
                                            className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-sm font-bold relative z-10"
                                            style={{ color: t.color, borderColor: `${t.color}40` }}>
                                            {i + 1}
                                        </div>
                                    </div>
                                    <div className="glass-card p-5 flex-1 hover:border-white/15 transition-colors duration-200"
                                        style={{ borderColor: `${t.color}12` }}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-[10px] text-white/30 font-mono">{t.date}</span>
                                            <h3 className="text-sm font-bold text-white">{t.title}</h3>
                                        </div>
                                        <p className="text-sm text-white/45 leading-relaxed">{t.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Values ── */}
            <section className="relative z-10 py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12 reveal-up">
                        <h2 className="text-3xl font-bold mb-3">What we believe</h2>
                        <p className="text-white/40">The principles that guide every product decision we make.</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {VALUES.map((v, i) => (
                            <div key={v.title}
                                className={`feature-card glass-card p-6 space-y-3 text-center reveal-scale reveal-delay-${i + 1}`}
                                style={{ borderColor: `${v.color}15` }}>
                                <div className="text-3xl mb-2">{v.icon}</div>
                                <h3 className="font-bold text-white">{v.title}</h3>
                                <p className="text-sm text-white/40 leading-relaxed">{v.desc}</p>
                            </div>
                        ))}
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
                            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">You do the work, we do the chasing</p>
                            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
                                Join 500+ professionals<br />
                                <span className="grad-text">getting paid faster.</span>
                            </h2>
                            <p className="text-white/40 text-sm mb-8 max-w-sm mx-auto">
                                Free plan forever. Pro when you need it. Start collecting in 5 minutes.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                                <Link href="/signup">
                                    <button className="btn-primary px-8 py-3.5 text-sm font-semibold">Get started for free →</button>
                                </Link>
                                <Link href="/features">
                                    <button className="btn-outline px-8 py-3.5 text-sm font-semibold">See all features →</button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <SiteFooter />
        </div>
    );
}
