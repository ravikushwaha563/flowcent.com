'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Announcement bar items (rotate)
const ANNOUNCEMENTS = [
    { text: '🎉 Flowcent v1.0 is live — Built for Indian freelancers', cta: 'Read more', href: '/blog/how-indian-freelancers-get-paid-faster' },
    { text: 'New: AI-assisted payment reply analysis', cta: 'Try it', href: '/dashboard/intelligence' },
    { text: '💳 Secure Razorpay and Stripe payment links are available', cta: 'Explore', href: '/features/integrations' },
];

const NAV_FEATURES = [
    {
        group: 'Invoice Management',
        items: [
            {
                label: 'Smart Invoice Tracking', desc: 'Create, send & track with real-time status', href: '/features', icon: (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 1.5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-11z" stroke="currentColor" strokeWidth="1.2" /><path d="M4.5 4.5h5M4.5 6.5h5M4.5 8.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                )
            },
            {
                label: 'Multi-Currency', desc: 'INR, USD, EUR, GBP and 20+ more', href: '/features', icon: (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" /><path d="M5 7h4M7 5v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                )
            },
            {
                label: 'Auto Follow-ups', desc: '5-stage email sequences, automated', href: '/features', icon: (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 3.5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-7z" stroke="currentColor" strokeWidth="1.2" /><path d="M1 3.5l6 4.5 6-4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                )
            },
        ],
    },
    {
        group: 'AI & Intelligence',
        items: [
            {
                label: 'AI Reply Analysis', desc: 'Extracts payment commitments for review', href: '/dashboard/intelligence', icon: (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.2" /><path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.9 2.9l1 1M10.1 10.1l1 1M2.9 11.1l1-1M10.1 3.9l1-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                )
            },
            {
                label: 'Payment Intent Score', desc: '0–100 follow-up priority signal', href: '/features', icon: (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 10.5l3-3 2.5 2 4-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                )
            },
            {
                label: 'Gmail Integration', desc: 'Send from your real Gmail address', href: '/features', icon: (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 3.5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-7z" stroke="currentColor" strokeWidth="1.2" /><path d="M1 3.5l6 4 6-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                )
            },
        ],
    },
    {
        group: 'Client Intelligence',
        items: [
            {
                label: 'Client Profiles', desc: 'Full payment history & risk score', href: '/dashboard/clients', icon: (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.2" /><path d="M1.5 12c0-2 2-3.5 4.5-3.5s4.5 1.5 4.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                )
            },
            {
                label: 'Analytics Dashboard', desc: 'Collection rates, pipeline & trends', href: '/dashboard', icon: (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" /><rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" /><rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" /><rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" /></svg>
                )
            },
            {
                label: 'Promise Tracker', desc: 'Log every client payment commitment', href: '/features', icon: (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5 6.5-6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                )
            },
        ],
    },
];

const NAV_SOLUTIONS = [
    { label: 'Freelancers', desc: 'Track invoices, chase payments without awkwardness', href: '/solutions/freelancers', color: '#5f87ff' },
    { label: 'Agencies', desc: 'Collections across multiple clients at scale', href: '/solutions/agencies', color: '#a78bfa' },
    { label: 'Designers', desc: 'Focus on creativity — let AI handle the money', href: '/solutions/designers', color: '#fbbf24' },
    { label: 'Consultants', desc: 'Professional follow-ups, no client awkwardness', href: '/solutions/consultants', color: '#34d399' },
    { label: 'Developers', desc: 'Stop hearing "will pay this week", automate it', href: '/solutions/developers', color: '#22d3ee' },
    { label: 'Content Creators', desc: 'Brand deals, retainers & sponsorships', href: '/solutions/content-creators', color: '#f87171' },
];

function MegaDropdown({ label, children }: { label: string; children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener('mousedown', fn);
        return () => document.removeEventListener('mousedown', fn);
    }, []);
    return (
        <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
            <button onClick={() => setOpen(o => !o)}
                className={`flex items-center gap-1 text-[13.5px] font-medium transition-colors px-1 py-2 ${open ? 'text-white' : 'text-white/55 hover:text-white/90'}`}>
                {label}
                <svg className={`w-3 h-3 mt-px transition-transform duration-200 ${open ? 'rotate-180' : ''}`} viewBox="0 0 10 10" fill="none">
                    <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
            <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 transition-all duration-200 ${open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
                style={{ filter: 'drop-shadow(0 32px 64px rgba(0,0,0,0.7))' }}>
                {children}
            </div>
        </div>
    );
}

export default function SiteNav({ activePage = '' }: { activePage?: string }) {
    const [scrolled, setScrolled] = useState(false);
    const [scrollPct, setScrollPct] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const [annoIdx, setAnnoIdx] = useState(0);

    useEffect(() => {
        const fn = () => {
            setScrolled(window.scrollY > 20);
            const el = document.documentElement;
            setScrollPct((window.scrollY / (el.scrollHeight - el.clientHeight)) * 100);
        };
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, []);

    useEffect(() => {
        const t = setInterval(() => setAnnoIdx(i => (i + 1) % ANNOUNCEMENTS.length), 5000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, []);

    const anno = ANNOUNCEMENTS[annoIdx];

    return (
        <>
            {/* Announcement bar */}
            <div className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-white/60 transition-opacity"
                style={{ background: 'linear-gradient(90deg, rgba(61,97,255,0.08) 0%, rgba(124,58,237,0.08) 50%, rgba(6,182,212,0.08) 100%)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="transition-all duration-500">{anno.text}</span>
                <Link href={anno.href} className="text-blue-400 hover:text-blue-300 font-semibold transition-colors shrink-0">{anno.cta} →</Link>
            </div>

            {/* Main nav — offset 32px for announcement bar */}
            <header className={`fixed top-8 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'border-b border-white/[0.06] backdrop-blur-xl bg-[#09090f]/92' : ''}`}>

                {/* Scroll progress line */}
                <div className="absolute bottom-0 left-0 h-px bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 transition-all duration-100"
                    style={{ width: `${scrollPct}%`, opacity: scrolled ? 0.7 : 0 }} />

                <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-8">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group shrink-0">
                        <Image src="/logo.png" alt="Flowcent Logo" width={32} height={32} className="w-8 h-8 rounded-xl object-contain drop-shadow-md" />
                        <span className="font-bold text-[15px] tracking-tight text-white group-hover:text-white/80 transition-colors">Flowcent</span>
                        <span className="hidden sm:inline text-[9px] px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold uppercase tracking-widest">BETA</span>
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden lg:flex items-center">

                        {/* Features mega menu */}
                        <MegaDropdown label="Features">
                            <div className="w-[600px] rounded-2xl border border-white/[0.07] bg-[#0d0d18]/98 backdrop-blur-2xl overflow-hidden">
                                <div className="grid grid-cols-3 gap-0 divide-x divide-white/[0.05]">
                                    {NAV_FEATURES.map(group => (
                                        <div key={group.group} className="p-5">
                                            <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-3">{group.group}</p>
                                            <div className="space-y-0.5">
                                                {group.items.map(item => (
                                                    <Link key={item.label} href={item.href}
                                                        className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-white/[0.05] transition-colors group">
                                                        <span className="mt-0.5 text-white/30 group-hover:text-blue-400 transition-colors shrink-0">{item.icon}</span>
                                                        <div>
                                                            <p className="text-[12.5px] font-semibold text-white/75 group-hover:text-white transition-colors leading-tight">{item.label}</p>
                                                            <p className="text-[11px] text-white/30 mt-0.5 leading-snug">{item.desc}</p>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="px-5 py-3 border-t border-white/[0.05] flex items-center justify-between"
                                    style={{ background: 'rgba(255,255,255,0.015)' }}>
                                    <span className="text-xs text-white/25">Core collection workflows in one place</span>
                                    <Link href="/features" className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                                        See all features →
                                    </Link>
                                </div>
                            </div>
                        </MegaDropdown>

                        {/* Solutions */}
                        <MegaDropdown label="Solutions">
                            <div className="w-[400px] rounded-2xl border border-white/[0.07] bg-[#0d0d18]/98 backdrop-blur-2xl overflow-hidden">
                                <div className="p-2">
                                    {NAV_SOLUTIONS.map(item => (
                                        <Link key={item.label} href={item.href}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.05] transition-colors group">
                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs"
                                                style={{ background: `${item.color}18`, color: item.color, border: `1px solid ${item.color}25` }}>
                                                {item.label[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[12.5px] font-semibold text-white/75 group-hover:text-white transition-colors">{item.label}</p>
                                                <p className="text-[10.5px] text-white/30 truncate">{item.desc}</p>
                                            </div>
                                            <span className="ml-auto text-white/20 group-hover:text-white/50 text-sm transition-colors">→</span>
                                        </Link>
                                    ))}
                                </div>
                                <div className="px-5 py-3 border-t border-white/[0.05]" style={{ background: 'rgba(255,255,255,0.015)' }}>
                                    <Link href="/solutions" className="text-xs text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                                        See all solutions →
                                    </Link>
                                </div>
                            </div>
                        </MegaDropdown>

                        <Link href="/pricing" className={`text-[13.5px] font-medium px-3 py-2 transition-colors ${activePage === 'pricing' ? 'text-white' : 'text-white/55 hover:text-white/90'}`}>
                            Pricing
                        </Link>
                        <Link href="/blog" className={`text-[13.5px] font-medium px-3 py-2 transition-colors ${activePage === 'blog' ? 'text-white' : 'text-white/55 hover:text-white/90'}`}>
                            Blog
                        </Link>
                        <Link href="/about" className={`text-[13.5px] font-medium px-3 py-2 transition-colors ${activePage === 'about' ? 'text-white' : 'text-white/55 hover:text-white/90'}`}>
                            About
                        </Link>
                    </nav>

                    {/* CTAs */}
                    <div className="hidden lg:flex items-center gap-2 shrink-0">
                        <Link href="/login">
                            <button className="text-[13.5px] font-medium text-white/55 hover:text-white px-4 py-2 rounded-lg hover:bg-white/[0.05] transition-all">
                                Sign in
                            </button>
                        </Link>
                        <Link href="/signup">
                            <button className="btn-primary text-[13px] px-4 py-2 flex items-center gap-1.5">
                                Get started
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </button>
                        </Link>
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        className="lg:hidden text-white/60 hover:text-white p-2 rounded-lg hover:bg-white/[0.06] transition-all"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            {menuOpen
                                ? <><path d="M3 3l12 12M15 3 3 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></>
                                : <><path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></>}
                        </svg>
                    </button>
                </div>
            </header>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="lg:hidden fixed inset-0 z-40 pt-[88px] bg-[#09090f]/98 backdrop-blur-2xl overflow-y-auto">
                    <div className="px-5 py-4 space-y-1">
                        {[
                            { label: 'Features', href: '/features' },
                            { label: 'Solutions', href: '/solutions' },
                            { label: 'Pricing', href: '/pricing' },
                            { label: 'Blog', href: '/blog' },
                            { label: 'About', href: '/about' },
                            { label: 'Changelog', href: '/changelog' },
                        ].map(l => (
                            <Link key={l.label} href={l.href}
                                className="flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/[0.05] transition-all"
                                onClick={() => setMenuOpen(false)}>
                                {l.label}
                                <span className="text-white/20">→</span>
                            </Link>
                        ))}
                    </div>
                    <div className="px-5 pb-8 flex flex-col gap-3 pt-4 border-t border-white/[0.06] mt-2">
                        <Link href="/login" onClick={() => setMenuOpen(false)}>
                            <button className="btn-outline text-sm w-full py-3">Sign in</button>
                        </Link>
                        <Link href="/signup" onClick={() => setMenuOpen(false)}>
                            <button className="btn-primary text-sm w-full py-3">Get started free →</button>
                        </Link>
                    </div>
                </div>
            )}
        </>
    );
}
