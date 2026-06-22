'use client';
import { useState } from 'react';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { useReveal } from '@/hooks/useReveal';

const TOPICS = [
    { id: 'support', icon: '⚙️', label: 'Product Support', desc: 'Something isn\'t working the way it should.' },
    { id: 'billing', icon: '💳', label: 'Billing & Plans', desc: 'Questions about charges, invoices, or upgrades.' },
    { id: 'partnership', icon: '🤝', label: 'Partnerships', desc: 'Integrations, resellers, press, or investors.' },
    { id: 'feedback', icon: '💡', label: 'Feedback & Ideas', desc: 'Help us build the product you actually need.' },
    { id: 'other', icon: '💬', label: 'Something Else', desc: 'General enquiries and anything else.' },
];

const STATS = [
    { value: 'Email', label: 'Primary channel' },
    { value: 'WhatsApp', label: 'Direct channel' },
    { value: 'Mon–Sat', label: 'Support hours' },
    { value: 'IST', label: 'Time zone' },
];

export default function ContactPage() {
    useReveal();

    const [activeTopic, setActiveTopic] = useState('support');
    const [form, setForm] = useState({ name: '', email: '', company: '', message: '' });

    const topic = TOPICS.find(t => t.id === activeTopic)!;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const subject = encodeURIComponent(`[Flowcent ${topic.label}] ${form.name}`);
        const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\nCompany: ${form.company || 'Not provided'}\n\n${form.message}`);
        window.location.href = `mailto:theravission@gmail.com?subject=${subject}&body=${body}`;
    };

    return (
        <div className="min-h-screen bg-[#09090f] text-white overflow-x-hidden">

            {/* ── Ambient background ── */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="aurora-blob aurora-blob-blue  w-[760px] h-[760px]"
                    style={{ top: '-160px', left: '5%', opacity: 0.13 }} />
                <div className="aurora-blob aurora-blob-purple w-[520px] h-[520px]"
                    style={{ bottom: '0%', right: '-8%', opacity: 0.11 }} />
                <div className="absolute inset-0 grid-bg opacity-[0.12]" />
            </div>

            <SiteNav />

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                HERO
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <section className="relative z-10 pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left — copy */}
                    <div style={{ animation: 'revealUp 0.6s cubic-bezier(0.22,1,0.36,1) 0ms both' }}>
                        <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-blue-400 uppercase mb-7">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                            Contact
                        </span>

                        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.07] mb-7">
                            We&apos;re real people.<br />
                            <span className="grad-text">Let&apos;s talk.</span>
                        </h1>

                        <p className="text-white/45 text-lg leading-relaxed max-w-lg mb-10">
                            Whether you hit a bug, need help with billing, have a partnership idea,
                            or just want to share feedback — we read every single message personally.
                        </p>

                        {/* Stats row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {STATS.map(s => (
                                <div key={s.label} className="glass-card rounded-xl p-4 border border-white/[0.06] text-center">
                                    <p className="text-xl font-bold text-white mb-0.5">{s.value}</p>
                                    <p className="text-[11px] text-white/35">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right — direct channels */}
                    <div className="flex flex-col gap-4"
                        style={{ animation: 'revealUp 0.6s cubic-bezier(0.22,1,0.36,1) 120ms both' }}>

                        <a href="mailto:theravission@gmail.com"
                            className="feature-card glass-card rounded-2xl p-6 border border-blue-500/[0.18] group flex items-center gap-5">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-xl"
                                style={{ background: 'rgba(107,150,255,0.10)', border: '1px solid rgba(107,150,255,0.20)' }}>
                                ✉️
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-bold text-blue-400 uppercase tracking-widest mb-1">Email</p>
                                <p className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors truncate">
                                    theravission@gmail.com
                                </p>
                                <p className="text-xs text-white/35 mt-0.5">Replies within 24 hours · Mon–Sat</p>
                            </div>
                            <span className="text-white/20 group-hover:text-white/50 transition-colors text-lg shrink-0">›</span>
                        </a>

                        <a href="https://wa.me/919830152769?text=Hi%20Flowcent%2C%20I%20have%20a%20question%20about"
                            target="_blank" rel="noopener noreferrer"
                            className="feature-card glass-card rounded-2xl p-6 border border-green-500/[0.18] group flex items-center gap-5">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-xl"
                                style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.18)' }}>
                                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#25D366">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-bold text-green-400 uppercase tracking-widest mb-1">WhatsApp</p>
                                <p className="text-sm font-semibold text-white group-hover:text-green-300 transition-colors">
                                    +91 98301 52769
                                </p>
                                <p className="text-xs text-white/35 mt-0.5">Fastest response · 10 am – 7 pm IST</p>
                            </div>
                            <span className="text-white/20 group-hover:text-white/50 transition-colors text-lg shrink-0">›</span>
                        </a>

                        <div className="glass-card rounded-2xl p-6 border border-white/[0.06]">
                            <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-4">Follow us</p>
                            <div className="flex gap-3">
                                {[
                                    { icon: '𝕏', name: 'Twitter / X', href: '#', hoverClr: 'hover:border-white/25' },
                                    { icon: 'in', name: 'LinkedIn', href: '#', hoverClr: 'hover:border-blue-500/40' },
                                ].map(s => (
                                    <a key={s.name} href={s.href}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/[0.08] ${s.hoverClr} hover:bg-white/[0.04] transition-all text-white/40 hover:text-white/70`}>
                                        <span className="text-sm font-bold">{s.icon}</span>
                                        <span className="text-xs">{s.name}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                CONTACT FORM
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <section className="relative z-10 px-6 pb-28">
                <div className="max-w-7xl mx-auto">

                    {/* Section label */}
                    <div className="flex items-center gap-4 mb-10 reveal-up">
                        <div className="h-px flex-1 bg-white/[0.06]" />
                        <span className="text-[11px] font-bold text-white/25 uppercase tracking-widest">Send a Message</span>
                        <div className="h-px flex-1 bg-white/[0.06]" />
                    </div>

                    <div className="grid lg:grid-cols-[340px_1fr] gap-8 reveal-up reveal-delay-1">

                        {/* Topic picker */}
                        <div>
                            <p className="text-xs font-semibold text-white/35 uppercase tracking-widest mb-4">What can we help with?</p>
                            <div className="flex flex-col gap-2">
                                {TOPICS.map(t => (
                                    <button key={t.id} onClick={() => setActiveTopic(t.id)}
                                        className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-150 flex items-center gap-3.5 ${activeTopic === t.id
                                            ? 'bg-white/[0.07] border-blue-500/30 text-white'
                                            : 'border-white/[0.06] text-white/45 hover:bg-white/[0.03] hover:text-white/70'}`}>
                                        <span className="text-base">{t.icon}</span>
                                        <div className="min-w-0">
                                            <p className={`text-sm font-semibold leading-tight ${activeTopic === t.id ? 'text-white' : ''}`}>{t.label}</p>
                                            <p className="text-[11px] text-white/30 leading-tight mt-0.5 truncate">{t.desc}</p>
                                        </div>
                                        {activeTopic === t.id && (
                                            <span className="ml-auto text-blue-400 shrink-0 text-xs">✓</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Form card */}
                        <div className="glass-card rounded-2xl border border-white/[0.07] overflow-hidden">

                            <div className="p-8 sm:p-10">
                                    {/* Topic breadcrumb */}
                                    <div className="flex items-center gap-2 mb-7">
                                        <span className="text-lg">{topic.icon}</span>
                                        <div>
                                            <p className="text-[11px] text-blue-400 font-bold uppercase tracking-widest">{topic.label}</p>
                                            <p className="text-xs text-white/30">{topic.desc}</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="grid sm:grid-cols-2 gap-5">
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-semibold text-white/35 uppercase tracking-widest">Full Name</label>
                                                <input type="text" required
                                                    placeholder="Your full name"
                                                    className="input-premium"
                                                    value={form.name}
                                                    onChange={e => setForm({ ...form, name: e.target.value })} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-semibold text-white/35 uppercase tracking-widest">Work Email</label>
                                                <input type="email" required
                                                    placeholder="you@company.com"
                                                    className="input-premium"
                                                    value={form.email}
                                                    onChange={e => setForm({ ...form, email: e.target.value })} />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-white/35 uppercase tracking-widest">Company / Freelance Name <span className="text-white/20 normal-case">(optional)</span></label>
                                            <input type="text"
                                                placeholder="Acme Studio"
                                                className="input-premium"
                                                value={form.company}
                                                onChange={e => setForm({ ...form, company: e.target.value })} />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-white/35 uppercase tracking-widest">Your Message</label>
                                            <textarea required rows={6}
                                                placeholder={
                                                    activeTopic === 'support' ? 'Describe what happened and the steps to reproduce it...' :
                                                        activeTopic === 'billing' ? 'Tell us about your billing issue or subscription question...' :
                                                            activeTopic === 'partnership' ? 'Tell us about your company and what kind of collaboration you have in mind...' :
                                                                activeTopic === 'feedback' ? 'Describe the feature or improvement you\'d like to see...' :
                                                                    'Write your message here...'
                                                }
                                                className="input-premium resize-none leading-relaxed"
                                                value={form.message}
                                                onChange={e => setForm({ ...form, message: e.target.value })} />
                                        </div>

                                        <div className="flex items-center justify-between pt-1">
                                            <p className="text-xs text-white/25">
                                                Opens a draft in your email app
                                            </p>
                                            <button type="submit"
                                                className="btn-primary px-8 py-3 flex items-center gap-2.5">
                                                Open Email Draft →
                                            </button>
                                        </div>
                                    </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            <SiteFooter />
        </div>
    );
}
