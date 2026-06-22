'use client';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { useReveal } from '@/hooks/useReveal';

const SOLUTIONS = [
    {
        slug: 'freelancers',
        icon: '💻',
        title: 'For Freelancers',
        tagline: 'Stop sending awkward payment chase messages',
        desc: 'Built for solo developers, designers, and consultants who do great work but struggle to get paid on time. Flowcent automates the uncomfortable part.',
        color: '#6b96ff',
        stat: { v: '40 days → 12', l: 'avg payment delay cut' },
        image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=600&q=75',
        imageAlt: 'Freelancer working on laptop at a cafe',
    },
    {
        slug: 'agencies',
        icon: '🏢',
        title: 'For Agencies',
        tagline: 'Scale your collections without scaling your team',
        desc: 'Managing 10+ client invoices manually is impossible. Flowcent gives your agency a centralized collection engine — automated, professional, and consistent.',
        color: '#a78bfa',
        stat: { v: '3×', l: 'faster collection time' },
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=75',
        imageAlt: 'Agency team collaborating around a table',
    },
    {
        slug: 'designers',
        icon: '🎨',
        title: 'For Designers & Creatives',
        tagline: 'Focus on creativity. Let AI handle the money.',
        desc: 'Creatives are the worst at chasing payments — not because they don\'t care, but because it feels awkward. Flowcent removes that friction entirely.',
        color: '#fbbf24',
        stat: { v: '85%', l: 'promise detection accuracy' },
        image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=600&q=75',
        imageAlt: 'Designer working on creative project with tablet and stylus',
    },
    {
        slug: 'consultants',
        icon: '👨‍💼',
        title: 'For Consultants',
        tagline: 'Professional follow-ups that protect your relationships',
        desc: 'Consulting relationships are built on trust. Flowcent lets you follow up firmly without being aggressive — staged emails with just the right tone.',
        color: '#34d399',
        stat: { v: '5-stage', l: 'escalation system' },
        image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=75',
        imageAlt: 'Professional consultant in a meeting',
    },
    {
        slug: 'developers',
        icon: '🛠️',
        title: 'For Developers',
        tagline: 'Stop hearing "will transfer this week" — automate it',
        desc: 'Connect Gmail, create an invoice, enable automation — Flowcent handles the rest while you code.',
        color: '#6b96ff',
        stat: { v: '5 min', l: 'setup time' },
        image: 'https://images.unsplash.com/photo-1593104547489-5cfb3839a3b5?auto=format&fit=crop&w=600&q=75',
        imageAlt: 'Developer coding on a dark-themed workstation',
    },
    {
        slug: 'content-creators',
        icon: '🎬',
        title: 'For Content Creators',
        tagline: 'Brand deals, retainers, campaigns — all tracked',
        desc: 'Whether it\'s a one-time brand deal or a recurring retainer, Flowcent tracks all your content revenue and automatically follows up when payment is late.',
        color: '#f87171',
        stat: { v: '₹0', l: 'cost to start' },
        image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=600&q=75',
        imageAlt: 'Content creator filming with professional camera setup',
    },
];

export default function SolutionsPage() {
    useReveal();

    return (
        <div className="min-h-screen bg-[#09090f] text-white overflow-x-hidden">

            {/* ── Background ── */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="aurora-blob aurora-blob-purple w-[700px] h-[700px]"
                    style={{ top: '-60px', right: '-5%', opacity: 0.28 }} />
                <div className="aurora-blob aurora-blob-blue w-[500px] h-[500px]"
                    style={{ bottom: '15%', left: '-8%', opacity: 0.2 }} />
                <div className="absolute inset-0 grid-bg opacity-20" />
            </div>

            <SiteNav activePage="solutions" />

            {/* ── Hero ── */}
            <section className="relative z-10 pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="reveal-left">
                            <span className="text-xs font-semibold tracking-[0.2em] text-purple-400 uppercase mb-5 block">Solutions</span>
                            <h1 className="text-5xl sm:text-6xl font-bold mb-6 tracking-tighter leading-[1.05]">
                                Built for your<br /><span className="grad-text tracking-tighter">profession</span>
                            </h1>
                            <p className="text-white/50 text-xl leading-relaxed mb-8">
                                Same powerful tool — tailored insights and workflows for every type of creative professional. Choose your role below to see how Flowcent helps you specifically.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {SOLUTIONS.map((s, i) => (
                                    <Link key={s.slug} href={`/solutions/${s.slug}`}>
                                        <span
                                            className={`text-xs px-3 py-1.5 rounded-full border border-white/10 text-white/40 hover:text-white hover:border-white/25 transition-all cursor-pointer reveal-fade reveal-delay-${Math.min(i + 1, 6)}`}>
                                            {s.icon} {s.title.replace('For ', '')}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="relative reveal-right reveal-delay-2">
                            <div className="beam-container rounded-3xl">
                                <img
                                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=75"
                                    alt="Diverse creative professionals collaborating"
                                    loading="eager"
                                    fetchPriority="high"
                                    className="rounded-3xl border border-white/[0.08] shadow-2xl object-cover w-full aspect-[4/3]"
                                />
                            </div>
                            <div className="absolute -bottom-4 -left-4 glass-card px-5 py-3 anim-bounce-in">
                                <p className="text-xs text-white/50">Trusted by</p>
                                <p className="text-sm font-bold text-white">500+ Indian freelancers</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Solutions Grid ── */}
            <section className="relative z-10 py-8 px-6 pb-24">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12 reveal-up">
                        <h2 className="text-3xl font-bold tracking-tighter mb-3">Choose your profession</h2>
                        <p className="text-white/40">Click any card to see detailed pain points, solutions, and features specific to your role.</p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {SOLUTIONS.map((s, i) => (
                            <Link key={s.slug} href={`/solutions/${s.slug}`}>
                                <div
                                    className={`feature-card glass-card overflow-hidden cursor-pointer group h-full reveal-up reveal-delay-${Math.min(i + 1, 6)}`}
                                    style={{ borderColor: `${s.color}20` }}>

                                    {/* Image */}
                                    <div className="relative h-44 overflow-hidden">
                                        <img src={s.image} alt={s.imageAlt}
                                            loading="lazy"
                                            className="feature-card-img w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#09090f] via-[#09090f]/40 to-transparent" />
                                        <div className="absolute top-3 left-3">
                                            <span className="text-2xl">{s.icon}</span>
                                        </div>
                                        <div className="absolute bottom-3 right-3 glass-card px-3 py-1.5 text-center">
                                            <div className="text-sm font-bold" style={{ color: s.color }}>{s.stat.v}</div>
                                            <div className="text-[9px] text-white/40">{s.stat.l}</div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        <h2 className="text-lg font-bold text-white mb-1 group-hover:text-blue-300 transition-colors duration-200">{s.title}</h2>
                                        <p className="text-xs font-medium mb-3" style={{ color: s.color }}>{s.tagline}</p>
                                        <p className="text-sm text-white/45 leading-relaxed mb-4">{s.desc}</p>
                                        <span className="text-xs font-semibold flex items-center gap-1" style={{ color: s.color }}>Learn how Flowcent helps →</span>
                                    </div>
                                </div>
                            </Link>
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
                            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">One platform. Every profession.</p>
                            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter text-white mb-4 leading-tight">
                                Whatever you do,<br />
                                <span className="grad-text tracking-tighter">Flowcent has you covered.</span>
                            </h2>
                            <p className="text-white/40 text-sm mb-8 max-w-sm mx-auto">
                                Join 500+ professionals making sure their creative work gets paid. Start free in 5 minutes.
                            </p>
                            <Link href="/signup">
                                <button className="btn-primary px-8 py-3.5 text-sm font-semibold">Get started free →</button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <SiteFooter />
        </div>
    );
}
