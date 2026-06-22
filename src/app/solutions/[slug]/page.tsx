import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';

const SOLUTIONS: Record<string, {
    icon: string; title: string; subtitle: string; color: string;
    heroBadge: string; heroDesc: string;
    heroImage: string; heroImageAlt: string;
    moodImage: string; moodImageAlt: string;
    painPoints: { icon: string; title: string; desc: string }[];
    howHelps: { icon: string; title: string; desc: string }[];
    features: string[];
    testimonial: { name: string; role: string; text: string; avatar: string };
    cta: string;
}> = {
    freelancers: {
        icon: '💻', title: 'Flowcent for Freelancers', subtitle: 'Stop sending awkward payment chase messages', color: '#6b96ff',
        heroBadge: 'Freelancers',
        heroImage: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=900&q=80',
        heroImageAlt: 'Freelancer working on MacBook at a coffee shop',
        moodImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80',
        moodImageAlt: 'Freelancer coding late at night',
        heroDesc: 'You deliver great work. Getting paid for it shouldn\'t require weekly follow-up messages that put a strain on great client relationships. Flowcent automates the entire collection process from day one.',
        painPoints: [
            { icon: '😤', title: 'Ghosted after delivery', desc: 'You send the invoice and silence. You follow up once, twice — then feel like you\'re begging.' },
            { icon: '🔄', title: '"Will pay next week" forever', desc: 'The same excuse, every week, for months. You know it\'s coming but can\'t prove it.' },
            { icon: '💸', title: 'Cash flow chaos', desc: '₹3L outstanding from 4 clients, but rent is due this week. Late payments destroy financial stability.' },
            { icon: '🤝', title: 'Relationship vs. payment', desc: 'You don\'t want to damage a good working relationship by being too aggressive about payment.' },
        ],
        howHelps: [
            { icon: '✉️', title: 'Automated 5-stage follow-ups', desc: 'Friendly → Firm → Urgent → Final. Sent from your Gmail automatically. You never have to type "Just checking in" again.' },
            { icon: '🤖', title: 'AI Excuse Memory™', desc: 'Paste what your client sent. AI extracts the promise or excuse. Builds a permanent record. Now you have receipts.' },
            { icon: '📊', title: 'Payment Intent Score', desc: 'A 0–100 score tells you: will this client actually pay? Know who to chase hard and who to relax on.' },
            { icon: '📈', title: 'Analytics Dashboard', desc: 'See exactly how much is pending, overdue, and collected. Know your average payment delay in real time.' },
        ],
        features: ['Invoice tracking (up to 5 free)', 'Gmail-connected follow-up automation', 'AI Excuse Memory™', 'Payment Intent Score', 'Client management', 'Promise & excuse log with timeline'],
        testimonial: { name: 'Arjun Mehta', role: 'Web Developer, Mumbai', text: 'I used to spend Sunday evenings writing awkward "just following up" emails. Now Flowcent does that for me. My average payment time went from 52 days to 14 days in the first month.', avatar: '👨‍💻' },
        cta: 'Start collecting faster — free →',
    },
    agencies: {
        icon: '🏢', title: 'Flowcent for Agencies', subtitle: 'Scale your collections without scaling your team', color: '#a78bfa',
        heroBadge: 'Agencies',
        heroImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
        heroImageAlt: 'Agency team collaborating in a modern office',
        moodImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80',
        moodImageAlt: 'Modern open-plan agency workspace',
        heroDesc: 'Managing 15+ client invoices manually is a full-time job. Flowcent gives your agency one centralized collection engine — automated, consistent, professional — so your team can focus on delivering work, not chasing payments.',
        painPoints: [
            { icon: '📋', title: 'Too many invoices to track', desc: '15 clients, 30 active invoices, 4 team members — who is following up on what? Nobody knows.' },
            { icon: '🔀', title: 'Inconsistent follow-up quality', desc: 'One account manager sends firm emails, another is too polite. No consistent agency voice.' },
            { icon: '👁️', title: 'No visibility on risk', desc: 'Which accounts are at-risk of not paying? You have no early-warning system.' },
            { icon: '⏱️', title: 'Wasted time on admin', desc: 'Account managers spend hours writing follow-up emails instead of managing client relationships.' },
        ],
        howHelps: [
            { icon: '📊', title: 'Centralized invoice dashboard', desc: 'All invoices across all clients in one view. Status, overdue days, and payment score — at a glance.' },
            { icon: '✉️', title: 'Consistent automated follow-ups', desc: 'One professional tone, five escalation stages, from everyone\'s Gmail. Every client gets the same quality response.' },
            { icon: '🏆', title: 'Client risk scoring', desc: 'See which clients are trending toward late payment before it happens. Take action early.' },
            { icon: '🔄', title: 'Team collaboration (Agency plan)', desc: 'Multiple team members, audit log, and activity tracking — coming in Agency plan.' },
        ],
        features: ['Unlimited invoices & clients', 'Team member access (Agency plan)', 'Centralized collection dashboard', 'Automated 5-stage follow-ups', 'Client risk scoring', 'White-label email templates (Agency plan)', 'CSV export for accounting', 'Dedicated account manager'],
        testimonial: { name: 'Priya Nair', role: 'Agency Director, Delhi', text: 'We manage 40+ client invoices. Before Flowcent, we had a spreadsheet and a prayer. Now everything is automated, consistent, and we\'ve reduced our average payment delay from 38 days to 10 days.', avatar: '👩‍💼' },
        cta: 'Centralize your collections free →',
    },
    designers: {
        icon: '🎨', title: 'Flowcent for Designers', subtitle: 'Focus on the creativity. Let AI handle the money.', color: '#fbbf24',
        heroBadge: 'Designers & Creatives',
        heroImage: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=900&q=80',
        heroImageAlt: 'Designer working on creative project with tablet',
        moodImage: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=900&q=80',
        moodImageAlt: 'Modern creative studio with design work displayed',
        heroDesc: 'You\'re great at design. You\'re probably terrible at chasing payments — not because you don\'t care, but because it feels uncomfortable and off-brand. Flowcent removes that discomfort entirely.',
        painPoints: [
            { icon: '🎯', title: 'Scope creep leads to disputes', desc: 'Client asks for 3 extra revisions. You deliver. Now they dispute the invoice amount. You have no record.' },
            { icon: '⏰', title: 'Late payments kill cash flow', desc: 'You need to buy software, pay contractors, or cover rent — but the client "needs a few more days."' },
            { icon: '😓', title: 'Chasing feels unprofessional', desc: 'You\'ve built a creative partnership. Sending payment reminders feels like it breaks that vibe.' },
            { icon: '🕰️', title: 'Retainer tracking chaos', desc: 'Monthly retainer clients who always pay late? Tracking who\'s up to date is a nightmare.' },
        ],
        howHelps: [
            { icon: '📝', title: 'Promise tracker', desc: 'Every client commitment, logged with date and exact quote. "Will pay after brand approval" — timestamped forever.' },
            { icon: '✉️', title: 'Professional, tone-matched emails', desc: 'Flowcent\'s follow-ups sound like a polished professional — not desperate. Your brand stays intact.' },
            { icon: '🤖', title: 'AI Excuse Memory™', desc: 'When a client says they already paid or there\'s a dispute, AI cross-references logged promises and excuses instantly.' },
            { icon: '📊', title: 'Retainer tracking', desc: 'Create recurring monthly invoices for retainer clients. Flowcent auto-follows-up the moment they\'re overdue.' },
        ],
        features: ['Invoice creation & tracking', 'Promise & commitment logging', 'AI Excuse Memory™', '5-stage automated follow-ups', 'Client payment history timeline', 'Professional email templates', 'Retainer invoice support', 'Multi-currency (INR, USD, EUR)'],
        testimonial: { name: 'Riya Sharma', role: 'UI/UX Designer, Bangalore', text: 'I\'m not a confrontational person. Flowcent\'s automated follow-ups are professional and firm in a way I could never be. I recovered a ₹85,000 payment last month that I\'d basically given up on.', avatar: '👩‍🎨' },
        cta: 'Stop chasing — start creating →',
    },
    consultants: {
        icon: '👨‍💼', title: 'Flowcent for Consultants', subtitle: 'Professional follow-ups that protect your relationships', color: '#34d399',
        heroBadge: 'Consultants',
        heroImage: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=900&q=80',
        heroImageAlt: 'Professional consultant presenting strategy',
        moodImage: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=900&q=80',
        moodImageAlt: 'Business meeting with charts and analysis',
        heroDesc: 'Consulting relationships are built on trust, expertise, and professionalism. Flowcent\'s follow-up system upholds all three — sending the right message at the right time, with exactly the right tone.',
        painPoints: [
            { icon: '🤝', title: 'Relationship feels too important to risk', desc: 'Your best clients are also sometimes your worst payers. You can\'t afford to alienate them over payment.' },
            { icon: '🔄', title: 'Retainer renewals always delayed', desc: 'Clients who pay slowly for recurring retainers put your monthly revenue at risk.' },
            { icon: '📉', title: 'No visibility into payment intent', desc: 'Will client X pay this month? You have no way to predict or prepare.' },
            { icon: '📋', title: 'Project billing complexity', desc: 'Milestone invoices, partial payments, retainers — tracking it all manually is error-prone.' },
        ],
        howHelps: [
            { icon: '🎩', title: 'Tone-calibrated follow-ups', desc: 'Stage 1 is a warm reminder. Stage 5 is firm. Flowcent escalates gradually, professionally, preserving your reputation.' },
            { icon: '📊', title: 'Payment Intent Score', desc: 'Know which client invoices need your personal attention vs. those the automation will handle.' },
            { icon: '📝', title: 'Promise tracker for milestone payments', desc: 'Client said "will pay after board approval"? Log it. Get notified when the promised date passes without payment.' },
            { icon: '📧', title: 'Gmail-connected emails', desc: 'All follow-ups from your personal email address — ensuring clients never feel like they\'re dealing with a system.' },
        ],
        features: ['Professional 5-stage follow-up sequences', 'Milestone & partial payment tracking', 'Payment Intent Score', 'Client relationship notes', 'Gmail integration (your email, your brand)', 'Promise & commitment log', 'Multi-currency billing', 'Analytics dashboard'],
        testimonial: { name: 'Vikram Kapoor', role: 'Strategy Consultant, Pune', text: 'I was hesitant — I didn\'t want a bot emailing my clients. But Flowcent\'s emails sound like me, from my Gmail, with perfect timing. I haven\'t had an awkward payment conversation in 3 months.', avatar: '👨‍💼' },
        cta: 'Protect relationships & get paid →',
    },
    developers: {
        icon: '🛠️', title: 'Flowcent for Developers', subtitle: 'Stop hearing "will transfer this week" — automate it', color: '#06b6d4',
        heroBadge: 'Developers',
        heroImage: 'https://images.unsplash.com/photo-1593104547489-5cfb3839a3b5?auto=format&fit=crop&w=900&q=80',
        heroImageAlt: 'Developer working on dark-themed coding setup',
        moodImage: 'https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&w=900&q=80',
        moodImageAlt: 'Multiple monitors showing code in dark mode',
        heroDesc: 'You ship clean code. Your client should ship clean payments. Flowcent\'s developer-friendly setup — connect Gmail → create invoice → enable auto-follow-up — takes 5 minutes and runs forever.',
        painPoints: [
            { icon: '🚀', title: 'Payment delayed after deployment', desc: 'You deploy. Client approves. "Will transfer by Monday." Monday comes. Tuesday. Wednesday.' },
            { icon: '📋', title: 'Scope creep increases invoice disputes', desc: 'Extra features requested mid-project lead to billing disputes. No documentation of what was agreed.' },
            { icon: '💻', title: 'No time to chase while coding', desc: 'You\'re deep in a new project. Following up on the old one\'s invoice falls to the bottom of the list.' },
            { icon: '📊', title: 'No payment intelligence', desc: 'You never know if a new client will pay reliably until it\'s too late to refuse the project.' },
        ],
        howHelps: [
            { icon: '🤖', title: 'Set it and forget it automation', desc: 'Enable auto-follow-up when creating an invoice. Flowcent handles every stage from reminder to final notice.' },
            { icon: '📝', title: 'Document every commitment', desc: 'Client says "payment after QA sign-off"? Log it. If QA is signed and payment doesn\'t come, Flowcent escalates.' },
            { icon: '📊', title: 'Risk-score new clients', desc: 'After a client\'s first invoice, Flowcent starts building their payment profile. By invoice 3, you know exactly who they are.' },
            { icon: '✉️', title: 'Follow-up without breaking flow', desc: 'Emails fire automatically at scheduled intervals. You stay in flow state. Clients stay accountable.' },
        ],
        features: ['5-minute setup with Gmail OAuth', 'Fully automated 5-stage follow-ups', 'Invoice & client dashboard', 'AI analysis of client replies', 'Payment Intent Score', 'Client payment history & risk profile', 'Multi-currency support', 'API-first architecture (coming soon)'],
        testimonial: { name: 'Karan Dev', role: 'Full-stack Developer, Ahmedabad', text: 'I had a client who owed me ₹1.4L for 3 months. I enabled Flowcent, forgot about it, and got paid within the first 10 days. The Stage 4 Urgent email is apparently very effective.', avatar: '🧑‍💻' },
        cta: 'Automate your collections →',
    },
    'content-creators': {
        icon: '🎬', title: 'Flowcent for Content Creators', subtitle: 'Brand deals, retainers & campaigns — all tracked', color: '#f87171',
        heroBadge: 'Content Creators',
        heroImage: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=900&q=80',
        heroImageAlt: 'Content creator filming with professional camera setup',
        moodImage: 'https://images.unsplash.com/photo-1570837193646-b5f3d6dd5d22?auto=format&fit=crop&w=900&q=80',
        moodImageAlt: 'Creator editing video content on laptop',
        heroDesc: 'Brand deals pay late. Retainers get "forgotten." Campaign invoices sit open for weeks. Flowcent gives content creators a professional invoicing and collection system that works as hard as they do.',
        painPoints: [
            { icon: '📱', title: 'Brand deal payments always late', desc: 'Brands have lengthy payment cycles. You delivered the content 30 days ago. Finance says NET-60. You say no.' },
            { icon: '🔄', title: 'Retainer invoices forgotten', desc: 'Monthly retainer brands sometimes "forget" to process the invoice. A polite reminder — every month — is exhausting.' },
            { icon: '📋', title: 'Multiple brand contracts everywhere', desc: 'Five active brand partnerships, different payment terms for each. Tracking who\'s late is a full-time job.' },
            { icon: '💬', title: 'DM-based agreements hard to document', desc: '"We agreed via DM" — no invoice, no paper trail, no leverage when they don\'t pay.' },
        ],
        howHelps: [
            { icon: '📄', title: 'Professional invoice for every deal', desc: 'Create branded invoices for each brand deal or campaign. No more DM-based agreements.' },
            { icon: '✉️', title: 'Auto follow-ups for retainers', desc: 'Monthly retainer? Enable follow-up automation. Every month, if it\'s overdue, the emails go out automatically.' },
            { icon: '📊', title: 'Brand payment tracking', desc: 'See exactly which brands have paid, which are pending, and which are overdue — one dashboard.' },
            { icon: '🤖', title: 'AI Excuse Memory™', desc: '"Finance team is overwhelmed with Q1 close" — AI recognizes this, logs it, and escalates accordingly.' },
        ],
        features: ['Invoice creation for brand deals & campaigns', 'Recurring invoice for monthly retainers', 'Gmail follow-up automation', 'Multi-currency (USD for international brands)', 'AI Excuse Memory™', 'Brand payment history & risk score', 'Promise & commitment tracker', 'Analytics: on-time vs. late by brand'],
        testimonial: { name: 'Sneha Rao', role: 'Lifestyle Creator, Hyderabad', text: 'I work with 8 brands at a time. Flowcent gives me a dashboard where I can see exactly which brand is late and by how many days. The automated follow-ups have literally recovered ₹6L for me this quarter.', avatar: '🧑‍🎤' },
        cta: 'Get paid for your content →',
    },
};

export default async function SolutionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const solution = SOLUTIONS[slug];
    if (!solution) return notFound();

    return (
        <div className="min-h-screen bg-[#09090f] text-white overflow-x-hidden">
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="aurora-blob aurora-blob-blue w-[700px] h-[700px]" style={{ top: '-100px', left: '10%', opacity: 0.4 }} />
                <div className="aurora-blob aurora-blob-purple w-[500px] h-[500px]" style={{ top: '30%', right: '-5%', opacity: 0.3 }} />
                <div className="aurora-blob aurora-blob-cyan w-[400px] h-[400px]" style={{ bottom: '10%', left: '20%', opacity: 0.2 }} />
                <div className="absolute inset-0 grid-bg opacity-20" />
            </div>

            <SiteNav />

            {/* ── Hero ── */}
            <section className="relative z-10 pt-32 pb-0 px-6">
                <div className="max-w-7xl mx-auto">
                    <Link href="/solutions" className="inline-flex items-center gap-2 text-sm text-white/35 hover:text-white mb-8 transition-colors">← All Solutions</Link>
                    <div className="grid lg:grid-cols-2 gap-14 items-center">
                        <div className="reveal-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-6 text-sm font-medium anim-breathe"
                                style={{ color: solution.color, borderColor: `${solution.color}30`, background: `${solution.color}08` }}>
                                <span>{solution.icon}</span> {solution.heroBadge}
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">{solution.title}</h1>
                            <p className="text-xl mb-4 font-medium" style={{ color: solution.color }}>{solution.subtitle}</p>
                            <p className="text-white/50 text-lg leading-relaxed mb-8">{solution.heroDesc}</p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href="/signup"><button className="btn-primary px-8 py-3.5">{solution.cta}</button></Link>
                                <Link href="/features"><button className="btn-outline px-8 py-3.5">See all features →</button></Link>
                            </div>
                        </div>

                        {/* Hero image */}
                        <div className="relative reveal-right reveal-delay-2">
                            <div className="beam-container rounded-3xl">
                                <Image
                                    src={solution.heroImage}
                                    alt={solution.heroImageAlt}
                                    width={900}
                                    height={675}
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    priority
                                    className="rounded-3xl border border-white/[0.07] shadow-2xl object-cover w-full aspect-[4/3]"
                                />
                            </div>
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tl from-[#09090f]/50 via-transparent to-transparent pointer-events-none" />
                            {/* Testimonial card floated on image */}
                            <div className="absolute -bottom-6 -left-4 glass-card p-5 max-w-[280px] anim-bounce-in" style={{ borderColor: `${solution.color}25` }}>
                                <div className="flex gap-0.5 mb-2">{Array(5).fill(0).map((_, j) => <span key={j} className="text-yellow-400 text-xs">★</span>)}</div>
                                <p className="text-xs text-white/60 italic leading-relaxed mb-3">"{solution.testimonial.text.slice(0, 90)}..."</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                                        style={{ background: `linear-gradient(135deg, ${solution.color}, ${solution.color}88)` }}>
                                        {solution.testimonial.name[0]}
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-white">{solution.testimonial.name}</p>
                                        <p className="text-[10px] text-white/30">{solution.testimonial.role}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Pain Points ── */}
            <section className="relative z-10 py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12 reveal-up">
                        <h2 className="text-3xl font-bold mb-3">Sound familiar?</h2>
                        <p className="text-white/40 max-w-xl mx-auto">These are the exact pain points Flowcent was built to solve for {solution.heroBadge.toLowerCase()}.</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {solution.painPoints.map((p, i) => (
                            <div key={p.title} className={`glass-card p-6 space-y-3 reveal-up reveal-delay-${Math.min(i + 1, 6)}`} style={{ borderColor: 'rgba(248,113,113,0.12)' }}>
                                <div className="text-2xl">{p.icon}</div>
                                <h3 className="text-sm font-bold text-white">{p.title}</h3>
                                <p className="text-xs text-white/40 leading-relaxed">{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Mood image divider ── */}
            <section className="relative z-10 px-6 mb-4">
                <div className="max-w-7xl mx-auto">
                    <div className="relative rounded-3xl overflow-hidden h-60">
                        <Image src={solution.moodImage} alt={solution.moodImageAlt} width={1400} height={500} sizes="100vw" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#09090f]/80 via-[#09090f]/40 to-transparent flex items-center px-10">
                            <div>
                                <p className="text-2xl font-bold text-white mb-2">Here's how Flowcent fixes it</p>
                                <p className="text-white/50">Specific features built for {solution.heroBadge.toLowerCase()}.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── How Flowcent Helps ── */}
            <section className="relative z-10 py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid sm:grid-cols-2 gap-5">
                        {solution.howHelps.map((h, i) => (
                            <div key={h.title} className={`glass-card p-7 flex gap-5 card-3d-subtle reveal-scale reveal-delay-${Math.min(i + 1, 6)}`} style={{ borderColor: `${solution.color}15` }}>
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ background: `${solution.color}12` }}>{h.icon}</div>
                                <div>
                                    <h3 className="font-bold text-white mb-2">{h.title}</h3>
                                    <p className="text-sm text-white/50 leading-relaxed">{h.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Features + CTA ── */}
            <section className="relative z-10 py-12 px-6 pb-24">
                <div className="max-w-4xl mx-auto reveal-up">
                    <div className="border-glow-card glass-card p-8" style={{ borderColor: `${solution.color}20` }}>
                        <div className="grid sm:grid-cols-2 gap-8 items-start">
                            <div>
                                <h2 className="text-xl font-bold mb-5">Everything included</h2>
                                <div className="space-y-2.5">
                                    {solution.features.map(f => (
                                        <div key={f} className="flex items-start gap-2.5 text-sm">
                                            <span className="mt-0.5 shrink-0" style={{ color: solution.color }}>✓</span>
                                            <span className="text-white/65">{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="rounded-2xl overflow-hidden aspect-square beam-container">
                                    <Image src={solution.heroImage} alt={solution.heroImageAlt} width={600} height={600} sizes="(max-width: 640px) 100vw, 50vw" className="w-full h-full object-cover" />
                                </div>
                                <div className="space-y-3">
                                    <Link href="/signup" className="block"><button className="btn-primary w-full py-3">{solution.cta}</button></Link>
                                    <Link href="/pricing" className="block"><button className="btn-outline w-full py-3">View pricing →</button></Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Other solutions ── */}
            <section className="relative z-10 py-4 px-6 pb-16 text-center">
                <p className="text-sm text-white/35 mb-4">Not quite what you're looking for?</p>
                <Link href="/solutions"><button className="btn-outline text-sm px-6 py-2.5">See all solution types →</button></Link>
            </section>

            <SiteFooter />
        </div>
    );
}
