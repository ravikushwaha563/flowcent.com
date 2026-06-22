'use client';

import { useState } from 'react';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  const TICKER_ITEMS = [
    '⚡ Fully automated follow-ups',
    '🤖 AI Excuse Memory™',
    '📊 Payment Intent Score 0–100',
    '📧 Gmail Integration',
    '🔒 No client awkwardness',
    '🇮🇳 Built for Indian freelancers',
  ];
  return (
    <section className="relative z-10 pt-44 pb-24 px-6 text-center max-w-7xl mx-auto">
      <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/10 bg-[#111118]/80 backdrop-blur-xl text-sm mb-8 shadow-[0_0_15px_rgba(95,135,255,0.15)] hover:shadow-[0_0_25px_rgba(95,135,255,0.25)] hover:border-white/20 transition-all cursor-pointer"
        style={{ animation: 'bounce-in 0.8s cubic-bezier(0.22,1,0.36,1) 0ms both' }}>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
        <span className="text-white/80 font-medium">AI Excuse Memory™ is officially live</span>
        <Link href="/dashboard/intelligence" className="text-blue-400 font-semibold hover:text-blue-300">Explore →</Link>
      </div>
      <h1 className="text-[2.8rem] sm:text-6xl lg:text-[5rem] font-bold tracking-tighter leading-[1.04] mb-6"
        style={{ animation: 'revealUp 0.6s cubic-bezier(0.22,1,0.36,1) 80ms both' }}>
        Stop chasing payments.<br />
        <span className="grad-text shimmer-text tracking-tighter">Get paid automatically.</span>
      </h1>
      <p className="text-white/45 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        style={{ animation: 'revealUp 0.6s cubic-bezier(0.22,1,0.36,1) 160ms both' }}>
        Flowcent tracks every invoice, reads client excuses with AI, and sends the perfect follow-up email
        — so you focus on your work, not chasing money.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
        style={{ animation: 'revealUp 0.6s cubic-bezier(0.22,1,0.36,1) 240ms both' }}>
        <Link href="/signup">
          <button className="btn-primary px-8 py-3.5 text-base flex items-center gap-2">
            Start for free
            <span className="text-white/50 text-sm font-normal">· no credit card</span>
          </button>
        </Link>
        <a href="#how">
          <button className="btn-outline px-8 py-3.5 text-base flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            See how it works
          </button>
        </a>
      </div>

      {/* Scrolling benefit ticker */}
      <div className="relative overflow-hidden py-3 mb-10 before:absolute before:inset-y-0 before:left-0 before:w-16 before:z-10 before:bg-gradient-to-r before:from-[#09090f] before:to-transparent after:absolute after:inset-y-0 after:right-0 after:w-16 after:z-10 after:bg-gradient-to-l after:from-[#09090f] after:to-transparent"
        style={{ animation: 'revealUp 0.6s cubic-bezier(0.22,1,0.36,1) 320ms both' }}>
        <div className="flex gap-8 w-max" style={{ animation: 'slide-left 18s linear infinite' }}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="text-sm font-medium text-white/35 whitespace-nowrap flex items-center gap-2">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Social proof + metrics */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6"
        style={{ animation: 'revealUp 0.6s cubic-bezier(0.22,1,0.36,1) 400ms both' }}>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {['RS', 'AM', 'PN', 'KP', 'SR'].map((initials, i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-[#09090f] flex items-center justify-center text-[10px] font-bold text-white"
                style={{ background: `linear-gradient(135deg, hsl(${i * 50 + 200}, 80%, 50%), hsl(${i * 50 + 250}, 80%, 40%))` }}>
                {initials}
              </div>
            ))}
          </div>
          <span className="text-sm text-white/40">Trusted by <span className="text-white/70 font-semibold">500+</span> Indian freelancers</span>
        </div>
        <div className="w-px h-6 bg-white/10 hidden sm:block" />
        <div className="flex items-center gap-6">
          {[
            { val: '3×', label: 'faster payments' },
            { val: '45→14', label: 'days avg collection' },
            { val: '₹0', label: 'to start' },
          ].map(({ val, label }) => (
            <div key={label} className="text-center">
              <p className="text-base font-bold grad-text">{val}</p>
              <p className="text-[10px] text-white/30">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Logo Cloud ────────────────────────────────────────────────────────────────
function LogoCloud() {
  const companies = [
    { name: 'Zoho', color: '#e14d2a' },
    { name: 'Razorpay', color: '#3395ff' },
    { name: 'Notion', color: '#ffffff' },
    { name: 'Figma', color: '#a259ff' },
    { name: 'Slack', color: '#4a154b' },
    { name: 'Webflow', color: '#4353ff' },
    { name: 'Canva', color: '#00c4cc' },
    { name: 'Framer', color: '#0055ff' },
  ];

  return (
    <section className="relative z-10 py-12 px-6 border-y border-white/[0.04]">
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-xs font-semibold text-white/25 uppercase tracking-[0.2em] mb-8"
          style={{ animation: 'revealUp 0.6s cubic-bezier(0.22,1,0.36,1) 0ms both' }}>
          Trusted by freelancers & agencies working with
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4"
          style={{ animation: 'revealUp 0.6s cubic-bezier(0.22,1,0.36,1) 120ms both' }}>
          {companies.map((co) => (
            <div key={co.name}
              className="px-4 py-2 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-200 cursor-default">
              <span className="text-sm font-semibold tracking-tight" style={{ color: `${co.color}cc` }}>
                {co.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Features (Full Grid) ───────────────────────────────────────────────────────
function Features() {
  const allFeatures = [
    // Invoice Management
    { icon: '📄', title: 'Smart Invoice Tracking', desc: 'Create invoices, assign to clients, and track real-time payment status — pending, overdue, paid.', color: 'rgba(95,135,255,0.12)', border: 'rgba(95,135,255,0.2)', tag: 'Invoicing' },
    { icon: '💱', title: 'Multi-Currency Support', desc: 'Bill in INR, USD, EUR, or GBP. Flowcent auto-formats currency for each invoice.', color: 'rgba(95,135,255,0.08)', border: 'rgba(95,135,255,0.15)', tag: 'Invoicing' },
    { icon: '⏰', title: 'Automatic Overdue Detection', desc: 'The moment a due date passes, Flowcent flags the invoice and begins the follow-up sequence.', color: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.18)', tag: 'Invoicing' },
    // AI & Automation
    { icon: '🤖', title: 'AI Excuse Memory™', desc: '"Kal kar dunga" — our AI reads client replies, extracts promises/excuses, and logs them forever.', color: 'rgba(124,58,237,0.12)', border: 'rgba(124,58,237,0.22)', tag: 'AI' },
    { icon: '✉️', title: '5-Stage Auto Follow-ups', desc: 'Friendly Reminder → Follow-up → 2nd Follow-up → Urgent → Final Notice. Sent from your Gmail.', color: 'rgba(6,182,212,0.12)', border: 'rgba(6,182,212,0.2)', tag: 'Automation' },
    { icon: '📊', title: 'Payment Intent Score', desc: 'AI-powered 0–100 score per invoice: based on overdue days, client history, and follow-up stage.', color: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.2)', tag: 'AI' },
    { icon: '⚡', title: 'One-Click Automation Run', desc: 'Manually trigger the automation engine to process all overdue invoices in one click.', color: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)', tag: 'Automation' },
    { icon: '📧', title: 'Gmail Integration', desc: 'OAuth-connected Gmail sends all follow-up emails from your personal account — not a generic address.', color: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.18)', tag: 'Integration' },
    // Client Intelligence
    { icon: '👥', title: 'Client Management', desc: 'Full client profiles — name, email, company, payment history, risk score, and all associated invoices.', color: 'rgba(95,135,255,0.1)', border: 'rgba(95,135,255,0.18)', tag: 'Clients' },
    { icon: '📝', title: 'Promise & Excuse Tracker', desc: 'Every commitment a client makes is logged with date, type (promise/excuse/dispute), and fulfillment status.', color: 'rgba(124,58,237,0.1)', border: 'rgba(124,58,237,0.18)', tag: 'Clients' },
    { icon: '🏆', title: 'Client Risk Scoring', desc: 'Clients get payment reliability scores based on historical invoices — so you know who to trust.', color: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)', tag: 'AI' },
    // Analytics
    { icon: '📈', title: 'Collection Analytics Dashboard', desc: 'Visual breakdown of total invoices, pending, overdue, paid, avg payment delay, and collection rate.', color: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.18)', tag: 'Analytics' },
  ];

  const tagColors: Record<string, string> = {
    Invoicing: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    AI: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    Automation: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    Integration: 'text-red-400 bg-red-500/10 border-red-500/20',
    Clients: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    Analytics: 'text-green-400 bg-green-500/10 border-green-500/20',
  };

  return (
    <section id="features" className="relative z-10 py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-[0.2em] text-blue-400 uppercase mb-4 block">All Features</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter mb-4">
            Everything you need to<br /><span className="grad-text tracking-tighter">get paid on time</span>
          </h2>
          <p className="text-white/40 max-w-lg mx-auto text-lg">Built for Indian freelancers and agencies tired of chasing payments. Every feature ships in the free plan.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allFeatures.map((f, i) => (
            <div key={f.title}
              className={`glass-card feature-card p-6 group reveal-up reveal-delay-${Math.min((i % 6) + 1, 6)}`}
              style={{ borderColor: f.border }}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ background: f.color }}>{f.icon}</div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border whitespace-nowrap ${tagColors[f.tag]}`}>{f.tag}</span>
              </div>
              <h3 className="font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">{f.title}</h3>
              <p className="text-sm text-white/45 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Coming Soon banner */}
        <div className="mt-8 p-5 rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.01] text-center">
          <p className="text-sm text-white/30">
            🚀 <span className="text-white/50 font-medium">Coming soon:</span> PDF Invoice Export · WhatsApp Follow-ups · Razorpay Payment Links · Team Collaboration · Stripe Integration
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Solutions ─────────────────────────────────────────────────────────────────
function Solutions() {
  const solutions = [
    {
      icon: '💻', title: 'For Freelancers', color: '#6b96ff',
      problems: ['Clients never pay on time', '"Will pay next week" for 3 months', 'Awkward to send multiple reminders'],
      fixes: ['Auto follow-ups so you don\'t have to ask', 'AI tracks every excuse chronologically', 'Professional tone that protects relationships'],
    },
    {
      icon: '🏢', title: 'For Agencies', color: '#a78bfa',
      problems: ['10+ clients, impossible to track manually', 'Team doesn\'t always follow up consistently', 'No visibility into which accounts are at risk'],
      fixes: ['Centralized dashboard for all invoices', 'Automated sequences — set once, runs forever', 'Payment risk scores per client at a glance'],
    },
    {
      icon: '🎨', title: 'For Creatives & Designers', color: '#fbbf24',
      problems: ['Clients dispute scope after delivery', 'Late payments kill cash flow', 'No record of what was promised when'],
      fixes: ['Promise tracker logs every client commitment', 'Score identifies late-payer patterns early', 'Gmail integration for professional follow-up'],
    },
  ];

  return (
    <section id="solutions" className="relative z-10 py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-[0.2em] text-purple-400 uppercase mb-4 block">Solutions</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter mb-4">
            Built for <span className="grad-text tracking-tighter">your profession</span>
          </h2>
          <p className="text-white/40 text-lg max-w-md mx-auto">Same tool, tailored insights for every creative professional.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {solutions.map((s, i) => (
            <div key={s.title} className={`glass-card feature-card p-7 space-y-5 reveal-up reveal-delay-${i + 1}`} style={{ borderColor: `${s.color}25` }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: `${s.color}15` }}>{s.icon}</div>
              <h3 className="text-lg font-bold" style={{ color: s.color }}>{s.title}</h3>

              <div>
                <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">Common problems</p>
                <div className="space-y-2">
                  {s.problems.map(p => (
                    <div key={p} className="flex items-start gap-2 text-xs text-white/50">
                      <span className="text-red-400 mt-0.5 shrink-0">✗</span>{p}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.06]">
                <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">Flowcent fixes</p>
                <div className="space-y-2">
                  {s.fixes.map(f => (
                    <div key={f} className="flex items-start gap-2 text-xs text-white/70">
                      <span className="text-green-400 mt-0.5 shrink-0">✓</span>{f}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── How It Works ───────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { num: '01', icon: '👤', title: 'Add your clients', desc: 'Import or manually add clients. Flowcent builds a payment profile for each one automatically.' },
    { num: '02', icon: '📄', title: 'Create an invoice', desc: 'Create an invoice in seconds. Enable auto-follow-ups and Flowcent does the rest from day one.' },
    { num: '03', icon: '🤖', title: 'AI watches for excuses', desc: 'Paste client replies — AI detects promises, excuses, and updates the intent score instantly.' },
    { num: '04', icon: '💰', title: 'Get paid, automatically', desc: 'Staged emails remind clients at the right time, with the right tone. You get paid.' },
  ];
  return (
    <section id="how" className="relative z-10 py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-[0.2em] text-cyan-400 uppercase mb-4 block">How it works</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter mb-4">Set up in <span className="grad-text tracking-tighter">5 minutes</span></h2>
          <p className="text-white/40 text-lg max-w-md mx-auto">No complex setup. Start tracking and collecting immediately.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(95,135,255,0.3), rgba(124,58,237,0.3), transparent)' }} />
          {steps.map((s, i) => (
            <div key={s.num} className={`relative glass-card feature-card p-6 reveal-up reveal-delay-${i + 1}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl grad-brand flex items-center justify-center text-xl">{s.icon}</div>
                <span className="text-xs font-bold text-white/20 tracking-widest">{s.num}</span>
              </div>
              <h3 className="font-semibold text-white mb-2">{s.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────────────
function Testimonials() {
  const testimonials = [
    { name: 'Riya Sharma', role: 'Freelance UI/UX Designer, Bangalore', text: 'I used to spend 2 hours every week chasing invoices. Now Flowcent sends automated follow-ups and I literally just got paid ₹85,000 last week without a single WhatsApp message.', initials: 'RS', grad: 'from-blue-500 to-indigo-600', stars: 5 },
    { name: 'Arjun Mehta', role: 'Web Developer & Agency Owner, Mumbai', text: 'The AI Excuse Memory is genius. One client used the same "bank is processing" excuse 4 times. Flowcent caught it, flagged him as high-risk, and I stopped taking new projects from him.', initials: 'AM', grad: 'from-purple-500 to-pink-600', stars: 5 },
    { name: 'Priya Nair', role: 'Content Strategist, Delhi', text: 'Getting paid from clients was a nightmare. Flowcent\'s 5-stage follow-up system is professional and firm. My average payment time went from 52 days to just 14 days!', initials: 'PN', grad: 'from-emerald-500 to-teal-600', stars: 5 },
    { name: 'Karan Patel', role: 'Video Editor, Ahmedabad', text: "Easiest tool I've added to my workflow. Connect Gmail, create an invoice, and automation handles everything. Even my dad's CA firm started using it for their small business clients.", initials: 'KP', grad: 'from-amber-500 to-orange-600', stars: 5 },
    { name: 'Sneha Rao', role: 'Social Media Manager, Hyderabad', text: 'The payment intent score is surprisingly accurate. It correctly predicted 3 out of my last 4 late payers. Now I ask for 50% advance from red-flag clients.', initials: 'SR', grad: 'from-cyan-500 to-blue-600', stars: 5 },
    { name: 'Vikram Singh', role: 'Graphic Designer, Pune', text: 'I had given up on getting paid for a ₹1.2L project. Flowcent\'s Stage 5 final notice email recovered it in 48 hours. This tool paid for itself 300× on day one.', initials: 'VS', grad: 'from-rose-500 to-red-600', stars: 5 },
  ];
  return (
    <section id="testimonials" className="relative z-10 py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-[0.2em] text-green-400 uppercase mb-4 block">Testimonials</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter mb-4">Freelancers <span className="grad-text tracking-tighter">love Flowcent</span></h2>
          <p className="text-white/40 text-lg max-w-md mx-auto">Real stories from Indian freelancers who stopped chasing and started collecting.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <div key={t.name} className={`glass-card feature-card p-6 space-y-4 reveal-up reveal-delay-${Math.min((i % 6) + 1, 6)}`}>
              <div className="flex gap-0.5">{Array(t.stars).fill(0).map((_, j) => <span key={j} className="text-yellow-400 text-sm">★</span>)}</div>
              <p className="text-sm text-white/70 leading-relaxed">"{t.text}"</p>
              <div className="flex items-center gap-3 pt-2 border-t border-white/[0.06]">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.grad} flex items-center justify-center text-xs font-bold text-white shrink-0`}>{t.initials}</div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-white/35">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    { q: 'Is Flowcent really free to start?', a: 'Yes! The Free plan is completely free — no credit card required. You get 5 invoices, manual follow-ups, Gmail integration, and 5 AI analyses per month. Upgrade anytime when you grow.' },
    { q: 'How does the AI Excuse Memory™ work?', a: 'When a client replies, paste their email into Flowcent. Our AI (powered by Groq\'s LLaMA model) reads it and extracts promises, excuses, and payment intent. It builds a timeline log so you spot patterns over time.' },
    { q: 'Will my clients know I\'m using Flowcent?', a: 'No. All emails are sent from your own Gmail account via OAuth. Your clients see your name and address — not Flowcent\'s.' },
    { q: 'Will Flowcent spam my clients with emails?', a: 'Absolutely not. The system is careful — it sends staged emails (Friendly → Firm → Urgent → Final) with deliberate multi-day gaps. You can disable automation per invoice anytime.' },
    { q: 'Is my data secure?', a: 'Yes. All data is stored in an encrypted Supabase (PostgreSQL) database. Gmail tokens are encrypted at rest and only used to send emails on your behalf. We never read your inbox.' },
    { q: 'Can I use Flowcent for USD or EUR invoices?', a: 'Yes! Flowcent supports INR, USD, EUR, and GBP. Multi-currency display is automatic — the format follows each invoice\'s currency setting.' },
  ];
  return (
    <section className="relative z-10 py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold tracking-[0.2em] text-blue-400 uppercase mb-4 block">FAQ</span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter mb-4">Frequently asked <span className="grad-text tracking-tighter">questions</span></h2>
        </div>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className={`glass-card overflow-hidden reveal-up reveal-delay-${Math.min(i + 1, 6)}`}>
              <button
                className="w-full text-left px-6 py-4 flex items-center justify-between gap-4"
                onClick={() => setOpen(open === i ? null : i)}>
                <span className="text-sm font-medium text-white">{f.q}</span>
                <span
                  className="shrink-0 text-white/40 text-lg"
                  style={{
                    transform: open === i ? 'rotate(45deg)' : 'none',
                    transition: 'transform 0.2s cubic-bezier(0.22,1,0.36,1)',
                  }}>+</span>
              </button>
              <div
                style={{
                  maxHeight: open === i ? '200px' : '0',
                  overflow: 'hidden',
                  transition: 'max-height 0.3s cubic-bezier(0.22,1,0.36,1)',
                }}>
                <div className="px-6 pb-5 text-sm text-white/50 leading-relaxed border-t border-white/[0.05] pt-4">{f.a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Final CTA ──────────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="relative z-10 py-20 px-6">
      <div className="max-w-4xl mx-auto reveal-up">
        <div className="border-glow-card">
          <div className="relative overflow-hidden rounded-3xl grad-brand p-12 sm:p-16 text-center beam-container">
            <div className="aurora-blob aurora-blob-blue absolute -top-20 -right-20 w-72 h-72 pointer-events-none" />
            <div className="aurora-blob aurora-blob-purple absolute -bottom-16 -left-16 w-56 h-56 pointer-events-none" />
            <div className="relative">
              <div className="text-4xl mb-4">💰</div>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tighter text-white mb-4">Ready to get paid faster?</h2>
              <p className="text-white/70 mb-10 text-lg max-w-md mx-auto">Join 500+ freelancers who cut their payment collection time by 3× with Flowcent.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup">
                  <button className="bg-white text-[#3d61ff] font-bold px-8 py-3.5 rounded-xl text-sm hover:bg-white/90 transition-colors shadow-2xl hover:-translate-y-0.5" style={{ transition: 'transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease' }}>Start for free — no credit card →</button>
                </Link>
                <Link href="/login">
                  <button className="text-white/70 hover:text-white transition-colors text-sm underline underline-offset-4">Already have an account? Sign in</button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#09090f] text-white overflow-x-hidden">
      {/* Aurora animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="aurora-blob aurora-blob-blue absolute top-0 left-1/4 w-[800px] h-[800px]" />
        <div className="aurora-blob aurora-blob-purple absolute top-1/3 right-1/4 w-[600px] h-[600px]" />
        <div className="aurora-blob aurora-blob-cyan absolute bottom-1/4 left-1/3 w-[500px] h-[500px]" />
        <div className="aurora-blob aurora-blob-green absolute bottom-0 right-1/3 w-[400px] h-[400px]" />
        <div className="absolute inset-0 dot-grid opacity-20" />
      </div>

      <SiteNav />
      <Hero />
      <LogoCloud />
      <Features />
      <Solutions />
      <HowItWorks />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <SiteFooter />
    </div>
  );
}
