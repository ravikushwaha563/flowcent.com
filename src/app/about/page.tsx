'use client';
import Link from 'next/link';
import Image from 'next/image';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { useReveal } from '@/hooks/useReveal';

const TIMELINE = [
    { date: 'Foundation', title: 'Invoices and clients', desc: 'Secure account, client, invoice and dashboard workflows backed by Supabase.', color: '#6b96ff' },
    { date: 'Automation', title: 'Gmail follow-ups', desc: 'Five staged reminders can be sent from a connected Gmail account.', color: '#34d399' },
    { date: 'Intelligence', title: 'Payment analysis', desc: 'AI-assisted reply analysis, payment intent scoring and client trust context.', color: '#fbbf24' },
    { date: 'Payments', title: 'Secure checkout', desc: 'Public-token payment links support Razorpay for INR and Stripe for other supported currencies.', color: '#f87171' },
    { date: 'Roadmap', title: 'Operational depth', desc: 'Webhooks, team workflows, accounting exports and broader automation are the next focus.', color: '#a78bfa' },
];

const VALUES = [
    { icon: '🎯', title: 'Relentlessly practical', desc: 'We build features that solve real pain — no vanity metrics, no fluff.', color: '#6b96ff' },
    { icon: '🇮🇳', title: 'Built for India first', desc: 'Indian freelancers have unique payment challenges. We design for that reality.', color: '#a78bfa' },
    { icon: '🔒', title: 'Privacy by design', desc: 'Gmail access is limited to sending email and identifying the connected account. Inbox-read access is not requested.', color: '#34d399' },
    { icon: '💰', title: 'Useful free tier', desc: 'Core invoice and client workflows remain available before a Pro upgrade.', color: '#fbbf24' },
];

const STATS = [
    { v: '5', l: 'Follow-up stages', color: '#6b96ff' },
    { v: '4', l: 'Currencies', color: '#34d399' },
    { v: '2', l: 'Payment gateways', color: '#a78bfa' },
    { v: '₹0', l: 'Free plan price', color: '#fbbf24' },
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
                                Flowcent is built around a common problem: good work is delivered, an invoice is sent, and payment follow-up becomes a separate administrative job.
                            </p>
                            <p className="text-white/35 text-lg leading-relaxed">
                                We built the collection system we always wished existed — AI-powered, Gmail-connected, and engineered for the realities of Indian freelance payment culture.
                            </p>
                        </div>

                        <div className="relative reveal-right reveal-delay-2">
                            <div className="beam-container rounded-3xl">
                                <Image
                                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=75"
                                    alt="Team collaborating in a modern office"
                                    width={900}
                                    height={675}
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    priority
                                    className="rounded-3xl border border-white/[0.07] shadow-2xl object-cover w-full aspect-[4/3]"
                                />
                            </div>
                            <div className="absolute inset-0 rounded-3xl pointer-events-none bg-gradient-to-tl from-[#09090f]/30 via-transparent to-transparent" />
                            <div className="absolute -bottom-5 -right-4 glass-card px-5 py-3 anim-bounce-in">
                                <div className="text-lg font-bold grad-text">5 stages</div>
                                <div className="text-xs text-white/35">controlled follow-up sequence</div>
                            </div>
                            <div className="absolute -top-4 -left-4 glass-card px-4 py-3 anim-bounce-in" style={{ animationDelay: '0.3s' }}>
                                <div className="text-xs font-bold text-blue-400 mb-1">BETA</div>
                                <div className="text-xs text-white/50">Built for Indian professionals</div>
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
                        <Image src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1400&q=75"
                            alt="Team strategy session"
                            width={1400} height={560} sizes="100vw"
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

            {/* ── Timeline ── */}
            <section className="relative z-10 py-16 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12 reveal-up">
                        <h2 className="text-3xl font-bold mb-3">Our journey</h2>
                        <p className="text-white/40">The product capabilities, presented without invented adoption numbers.</p>
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
                                Build a calmer collection process<br />
                                <span className="grad-text">from the first invoice.</span>
                            </h2>
                            <p className="text-white/40 text-sm mb-8 max-w-sm mx-auto">
                                Start on the Free plan. Upgrade to Pro when you need automation and higher limits.
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
