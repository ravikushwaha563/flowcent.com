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
        heroDesc: 'You deliver great work. Flowcent keeps invoices, payment links, reminders, and client replies in one workflow so follow-up stays consistent.',
        painPoints: [
            { icon: '😤', title: 'Ghosted after delivery', desc: 'You send the invoice and silence. You follow up once, twice — then feel like you\'re begging.' },
            { icon: '🔄', title: '"Will pay next week" forever', desc: 'The same excuse, every week, for months. You know it\'s coming but can\'t prove it.' },
            { icon: '💸', title: 'Cash flow chaos', desc: '₹3L outstanding from 4 clients, but rent is due this week. Late payments destroy financial stability.' },
            { icon: '🤝', title: 'Relationship vs. payment', desc: 'You don\'t want to damage a good working relationship by being too aggressive about payment.' },
        ],
        howHelps: [
            { icon: '✉️', title: 'Automated 5-stage follow-ups', desc: 'Friendly → Firm → Urgent → Final. Sent from your Gmail automatically. You never have to type "Just checking in" again.' },
            { icon: '🤖', title: 'AI Reply Analysis', desc: 'Paste a client reply. AI extracts payment commitments and can log them with the related invoice for later review.' },
            { icon: '📊', title: 'Payment Intent Score', desc: 'A 0–100 heuristic helps prioritize follow-up using invoice age, payment history, and recorded commitments.' },
            { icon: '📈', title: 'Collection Dashboard', desc: 'Review pending and paid totals by currency, overdue status, invoice stages, and recent activity.' },
        ],
        features: ['Invoice tracking (up to 5 free)', 'Gmail-connected follow-up automation', 'AI reply analysis', 'Payment Intent Score', 'Client management', 'Promise and commitment log'],
        testimonial: { name: 'Freelancer workflow', role: 'Illustrative scenario', text: 'An overdue invoice moves through a controlled reminder sequence while the freelancer can review its status and stop automation at any time.', avatar: '👨‍💻' },
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
            { icon: '✉️', title: 'Consistent automated follow-ups', desc: 'Five escalation stages sent from the Gmail account connected to each Flowcent account.' },
            { icon: '🏆', title: 'Payment reliability review', desc: 'Use stored invoice history and commitments to prioritize a manual client review.' },
            { icon: '💳', title: 'Direct payment links', desc: 'Give clients a secure Razorpay or Stripe checkout path from each invoice.' },
        ],
        features: ['Unlimited invoices & clients on Pro', 'Centralized collection dashboard', 'Automated 5-stage follow-ups', 'Client risk scoring', 'Secure payment links', 'PDF invoice export', 'Gmail integration', 'Multi-currency invoices'],
        testimonial: { name: 'Agency workflow', role: 'Illustrative scenario', text: 'The agency sees pending and overdue invoices in one dashboard and applies the same follow-up policy across clients.', avatar: '👩‍💼' },
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
            { icon: '📝', title: 'Promise tracker', desc: 'Store extracted client commitments, dates, and fulfillment status with the related invoice.' },
            { icon: '✉️', title: 'Professional, tone-matched emails', desc: 'Flowcent\'s follow-ups sound like a polished professional — not desperate. Your brand stays intact.' },
            { icon: '🤖', title: 'AI Reply Analysis', desc: 'Review a pasted payment reply and keep extracted commitments with the related invoice.' },
            { icon: '📊', title: 'Retainer invoice tracking', desc: 'Create each retainer invoice with its due date and enable staged follow-ups when needed.' },
        ],
        features: ['Invoice creation and tracking', 'Promise and commitment logging', 'AI reply analysis', '5-stage automated follow-ups', 'Client payment history', 'Professional email templates', 'PDF invoice export', 'Multi-currency (INR, USD, EUR, GBP)'],
        testimonial: { name: 'Designer workflow', role: 'Illustrative scenario', text: 'Professional reminders are sent from the connected Gmail account so the designer can stay consistent without drafting every message.', avatar: '👩‍🎨' },
        cta: 'Stop chasing — start creating →',
    },
    consultants: {
        icon: '👨‍💼', title: 'Flowcent for Consultants', subtitle: 'Professional follow-ups that protect your relationships', color: '#34d399',
        heroBadge: 'Consultants',
        heroImage: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=900&q=80',
        heroImageAlt: 'Professional consultant presenting strategy',
        moodImage: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=900&q=80',
        moodImageAlt: 'Business meeting with charts and analysis',
        heroDesc: 'Consulting relationships depend on clear communication. Flowcent provides a consistent staged follow-up workflow that you can enable per invoice.',
        painPoints: [
            { icon: '🤝', title: 'Relationship feels too important to risk', desc: 'Your best clients are also sometimes your worst payers. You can\'t afford to alienate them over payment.' },
            { icon: '🔄', title: 'Retainer renewals always delayed', desc: 'Clients who pay slowly for recurring retainers put your monthly revenue at risk.' },
            { icon: '📉', title: 'No collection priority view', desc: 'It is difficult to decide which overdue invoice needs personal follow-up first.' },
            { icon: '📋', title: 'Project billing complexity', desc: 'Milestones and retainers can produce multiple invoices with different due dates.' },
        ],
        howHelps: [
            { icon: '🎩', title: 'Tone-calibrated follow-ups', desc: 'Stage 1 is a warm reminder. Stage 5 is firm. Flowcent escalates gradually, professionally, preserving your reputation.' },
            { icon: '📊', title: 'Payment Intent Score', desc: 'Know which client invoices need your personal attention vs. those the automation will handle.' },
            { icon: '📝', title: 'Promise tracker for milestone payments', desc: 'Log a client commitment such as "will pay after board approval" and review its fulfillment status later.' },
            { icon: '📧', title: 'Gmail-connected emails', desc: 'All follow-ups from your personal email address — ensuring clients never feel like they\'re dealing with a system.' },
        ],
        features: ['Professional 5-stage follow-up sequences', 'Invoice due-date tracking', 'Payment Intent Score', 'Client management', 'Gmail integration', 'Promise and commitment log', 'Multi-currency billing', 'Collection dashboard'],
        testimonial: { name: 'Consultant workflow', role: 'Illustrative scenario', text: 'A consultant keeps invoice history, client promises and follow-up records together for a clearer commercial conversation.', avatar: '👨‍💼' },
        cta: 'Protect relationships & get paid →',
    },
    developers: {
        icon: '🛠️', title: 'Flowcent for Developers', subtitle: 'Stop hearing "will transfer this week" — automate it', color: '#06b6d4',
        heroBadge: 'Developers',
        heroImage: 'https://images.unsplash.com/photo-1593104547489-5cfb3839a3b5?auto=format&fit=crop&w=900&q=80',
        heroImageAlt: 'Developer working on dark-themed coding setup',
        moodImage: 'https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&w=900&q=80',
        moodImageAlt: 'Multiple monitors showing code in dark mode',
        heroDesc: 'Connect Gmail, create an invoice, and optionally enable a five-stage follow-up sequence. Flowcent keeps the collection workflow separate from project delivery work.',
        painPoints: [
            { icon: '🚀', title: 'Payment delayed after deployment', desc: 'You deploy. Client approves. "Will transfer by Monday." Monday comes. Tuesday. Wednesday.' },
            { icon: '📋', title: 'Scope creep increases invoice disputes', desc: 'Extra features requested mid-project lead to billing disputes. No documentation of what was agreed.' },
            { icon: '💻', title: 'No time to chase while coding', desc: 'You\'re deep in a new project. Following up on the old one\'s invoice falls to the bottom of the list.' },
            { icon: '📊', title: 'No payment intelligence', desc: 'You never know if a new client will pay reliably until it\'s too late to refuse the project.' },
        ],
        howHelps: [
            { icon: '🤖', title: 'Set it and forget it automation', desc: 'Enable auto-follow-up when creating an invoice. Flowcent handles every stage from reminder to final notice.' },
            { icon: '📝', title: 'Document payment commitments', desc: 'Link a stated commitment such as "payment after QA sign-off" to the invoice and mark it fulfilled when appropriate.' },
            { icon: '📊', title: 'Review client history', desc: 'Use invoices stored in Flowcent as context for an optional payment reliability analysis.' },
            { icon: '✉️', title: 'Follow-up without breaking flow', desc: 'Emails fire automatically at scheduled intervals. You stay in flow state. Clients stay accountable.' },
        ],
        features: ['Gmail OAuth connection', 'Fully automated 5-stage follow-ups', 'Invoice & client dashboard', 'AI analysis of client replies', 'Payment Intent Score', 'Client payment history & risk profile', 'Multi-currency support', 'Secure payment links'],
        testimonial: { name: 'Developer workflow', role: 'Illustrative scenario', text: 'A secure public payment link gives the client a direct Razorpay or Stripe checkout path without exposing internal invoice IDs.', avatar: '🧑‍💻' },
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
            { icon: '✉️', title: 'Follow-ups for retainer invoices', desc: 'Create the monthly invoice, set its due date, and enable a staged sequence for that invoice.' },
            { icon: '📊', title: 'Brand payment tracking', desc: 'See exactly which brands have paid, which are pending, and which are overdue — one dashboard.' },
            { icon: '🤖', title: 'AI Reply Analysis', desc: 'Review a finance-team delay message, extract any stated commitment, and draft a response.' },
        ],
        features: ['Invoice creation for brand deals and campaigns', 'Gmail follow-up automation', 'Multi-currency invoices', 'AI reply analysis', 'Client payment history score', 'Promise and commitment tracker', 'PDF invoice export', 'Secure payment links'],
        testimonial: { name: 'Creator workflow', role: 'Illustrative scenario', text: 'Brand invoices across multiple currencies remain visible in one place with due dates, status and payment context.', avatar: '🧑‍🎤' },
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
                                <Link href="/signup" className="btn-primary px-8 py-3.5 text-center">{solution.cta}</Link>
                                <Link href="/features" className="btn-outline px-8 py-3.5 text-center">See all features →</Link>
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
                                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: solution.color }}>Example</p>
                                <p className="text-xs text-white/60 leading-relaxed mb-3">{solution.testimonial.text}</p>
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
                                    <Link href="/signup" className="btn-primary block w-full py-3 text-center">{solution.cta}</Link>
                                    <Link href="/pricing" className="btn-outline block w-full py-3 text-center">View pricing →</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Other solutions ── */}
            <section className="relative z-10 py-4 px-6 pb-16 text-center">
                <p className="text-sm text-white/35 mb-4">Not quite what you're looking for?</p>
                <Link href="/solutions" className="btn-outline text-sm px-6 py-2.5 inline-flex">See all solution types →</Link>
            </section>

            <SiteFooter />
        </div>
    );
}
