import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';

// ─── All category data ────────────────────────────────────────────────────────
const CATEGORIES: Record<string, {
    slug: string;
    label: string;
    color: string;
    icon: string;
    tagline: string;
    heroImage: string;
    heroImageAlt: string;
    items: {
        icon: string;
        title: string;
        tagline: string;
        desc: string;
        image: string;
        imageAlt: string;
        benefits: string[];
    }[];
}> = {
    'invoice-management': {
        slug: 'invoice-management',
        label: 'Invoice Management',
        color: '#6b96ff',
        icon: '📄',
        tagline: 'Create and track invoices without spreadsheet chaos',
        heroImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
        heroImageAlt: 'Financial invoices and calculator organised on a desk',
        items: [
            {
                icon: '📄',
                title: 'Smart Invoice Tracking',
                tagline: 'See every invoice status at a glance',
                desc: 'Create invoices in seconds, assign them to clients, and watch real-time status updates — pending, overdue, and paid — all in one dashboard. Never lose track of who owes you what.',
                image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=800&q=80',
                imageAlt: 'Professional reviewing invoice tracking dashboard on laptop',
                benefits: [
                    'Create invoices with client, amount, currency, and due date',
                    'Real-time status: Pending → Overdue → Paid with colour coding',
                    'View invoices sorted by newest first with clear overdue status',
                    'Click any invoice to see full AI analysis and promise history',
                    'One-click "mark as paid" with confirmation modal',
                ],
            },
            {
                icon: '💱',
                title: 'Multi-Currency Support',
                tagline: 'Bill clients in their local currency',
                desc: 'Whether you work with Indian startups (INR), US companies (USD), or UK agencies (GBP), Flowcent handles cross-currency billing. Set the currency per invoice — Flowcent formats everything correctly.',
                image: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=800&q=80',
                imageAlt: 'Multiple currency notes from different countries on a table',
                benefits: [
                    'Supports INR ₹, USD $, EUR €, and GBP £',
                    'Currency selection per invoice — works globally',
                    'Dashboard totals kept separate by invoice currency',
                    'Download a professional PDF with invoice and client details',
                ],
            },
            {
                icon: '⏰',
                title: 'Automatic Overdue Detection',
                tagline: 'The moment a payment is late, Flowcent knows',
                desc: 'The day after a due date passes, Flowcent automatically marks the invoice overdue and optionally begins the automated follow-up sequence. No manual checking required — ever.',
                image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&w=800&q=80',
                imageAlt: 'Calendar and clock representing overdue payment monitoring',
                benefits: [
                    'Automatic status change at midnight on due date + 1',
                    'Red "Overdue" badge visible everywhere in the dashboard',
                    'Dashboard summary shows total overdue amount prominently',
                    'Triggers automated follow-up emails if auto mode is enabled',
                    'Tracks total days overdue for Payment Intent Score calculation',
                ],
            },
            {
                icon: '📤',
                title: 'PDF Invoice Export',
                tagline: 'Professional invoices your clients respect',
                desc: 'Generate a clean PDF summary with invoice number, client details, amount, issue date, due date, and payment status.',
                image: 'https://images.unsplash.com/photo-1568234931994-ba7cc1fcbc97?auto=format&fit=crop&w=800&q=80',
                imageAlt: 'PDF document with professional invoice formatting',
                benefits: [
                    'One-click PDF generation from any invoice',
                    'Includes invoice number, client details, service summary and total',
                    'Branded with your business name and details',
                    'Roadmap feature — availability is not yet guaranteed',
                ],
            },
        ],
    },

    'ai-automation': {
        slug: 'ai-automation',
        label: 'AI & Automation',
        color: '#a78bfa',
        icon: '🤖',
        tagline: 'Review payment replies and automate staged reminders',
        heroImage: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=1200&q=80',
        heroImageAlt: 'Abstract AI neural network visualization in deep purple',
        items: [
            {
                icon: '🤖',
                title: 'AI Reply Analysis',
                tagline: 'Never forget what your client promised',
                desc: 'Paste a client email or message reply into Flowcent. AI extracts payment commitments, categorises the reply, and can log the result against the invoice. The output is advisory and remains reviewable by you.',
                image: 'https://images.unsplash.com/photo-1655720031554-a929595ffad7?auto=format&fit=crop&w=800&q=80',
                imageAlt: 'AI reading and analyzing email text to extract key information',
                benefits: [
                    'AI extracts: Date Commitments, Partial Payments, Excuses, Disputes, "Will Pay"',
                    'Every promise logged with exact quote, date, and type',
                    'Mark promises as fulfilled when payment actually arrives',
                    'Full timeline view of all excuses per invoice',
                    'Structured categories keep commitments easier to review',
                    'Suggested responses remain editable before use',
                ],
            },
            {
                icon: '✉️',
                title: '5-Stage Automated Follow-ups',
                tagline: 'Staged timing and editable templates from your Gmail',
                desc: 'Flowcent sends staged follow-up emails from your own Gmail address. Each stage escalates professionally — from a gentle nudge to a firm final notice — with smart timing between each stage.',
                image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
                imageAlt: 'Email inbox with professional payment follow-up messages visible',
                benefits: [
                    'Stage 1: Friendly Reminder — scheduled after the due date',
                    'Stages 2–5: progressively firmer follow-ups at 3-day intervals',
                    'All emails sent FROM YOUR real Gmail address, not a system address',
                    'Toggle auto follow-up ON or OFF per individual invoice at creation',
                    'Automation can be disabled per invoice whenever follow-up should pause',
                ],
            },
            {
                icon: '📊',
                title: 'Payment Intent Score',
                tagline: 'Prioritize follow-up using payment history signals',
                desc: 'Recalculate a 0–100 follow-up priority signal for a pending invoice using due-date status, relevant client payment history, and follow-up stage.',
                image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
                imageAlt: 'Analytics dashboard showing invoice priority scores with color coding',
                benefits: [
                    'Factor 1: Days overdue — highest impact signal',
                    'Factor 2: Client\'s full payment history across all past invoices',
                    'Factor 3: Current follow-up stage reached (Stage 4/5 = lower score)',
                    '🟢 High (70+) · 🟡 Medium (45–69) · 🔴 Low (<45) colour coding',
                    'One-click recalculate from invoice list or detail page',
                    'Score breakdown card showing contribution of each factor',
                ],
            },
            {
                icon: '📧',
                title: 'Gmail Integration',
                tagline: 'Follow-ups from your email. Your credibility.',
                desc: 'Connect your Google account once via OAuth. All follow-up emails — every single one — are sent from your personal Gmail address. Clients see your name, not a random system email.',
                image: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?auto=format&fit=crop&w=800&q=80',
                imageAlt: 'Gmail open on a laptop showing the compose new email window',
                benefits: [
                    'One-time Google OAuth connection from profile settings',
                    'Gmail send access only — inbox-read access is not requested',
                    'All staged follow-ups sent from your real Gmail address',
                    'Works with @gmail.com and Google Workspace (G Suite) addresses',
                    'Tokens are stored server-side and refreshed when required',
                    'Disconnect instantly from profile settings at any time',
                ],
            },
        ],
    },

    'client-intelligence': {
        slug: 'client-intelligence',
        label: 'Client Intelligence',
        color: '#34d399',
        icon: '👥',
        tagline: 'Review client payment records before following up',
        heroImage: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=80',
        heroImageAlt: 'Business professionals reviewing client information and data',
        items: [
            {
                icon: '👥',
                title: 'Client Management',
                tagline: 'A full payment profile for every client',
                desc: 'Store client contact details, company, and payment-history signals in one client list. Edit records, review reliability badges, and use clients when creating invoices.',
                image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80',
                imageAlt: 'Team reviewing client profile information on screen',
                benefits: [
                    'Client record: name, email, phone, company, and WhatsApp consent',
                    'Clients are linked to every invoice created for them',
                    'Payment reliability signal shown on each client card',
                    'Create, edit, search, and safely delete eligible client records',
                    'Clients with invoice history are protected from deletion',
                ],
            },
            {
                icon: '🏆',
                title: 'Client Risk Scoring',
                tagline: 'Review payment reliability signals from your own records',
                desc: 'Generate an AI-assisted payment reliability analysis using invoice history and logged commitments. Treat it as decision support, not a credit score or guarantee.',
                image: 'https://images.unsplash.com/photo-1642790551116-18a150d38a18?auto=format&fit=crop&w=800&q=80',
                imageAlt: 'Risk assessment dashboard showing client payment scores',
                benefits: [
                    'Score based on: payment delay history, overdue frequency, excuse count',
                    'Colour-coded risk badge on every client card (🟢 Low · 🟡 Medium · 🔴 High)',
                    'Review the reliability badge while planning follow-up priority',
                    'Analysis can be refreshed when you need an updated review',
                    'Use the output alongside contracts, disputes, and direct communication',
                ],
            },
            {
                icon: '📝',
                title: 'Promise & Excuse Tracker',
                tagline: 'Keep payment commitments with the related invoice',
                desc: 'Extracted payment commitments can be timestamped, categorised, and stored with an invoice for operational review. Flowcent does not certify them as legal evidence.',
                image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=800&q=80',
                imageAlt: 'Notebook and digital tracker showing client commitments logged',
                benefits: [
                    '6 promise types: Date Commitment, Partial Payment, Excuse, Dispute, Will Pay, Other',
                    'Concise quote or close paraphrase stored for operational review',
                    'Date logged + optional promised payment date fields',
                    'Fulfill/unfulfill toggle — mark when the promise was kept (or wasn\'t)',
                    'Full promise timeline on every invoice detail page',
                    'Original source messages should be retained and verified separately',
                ],
            },
            {
                icon: '📈',
                title: 'Collection Analytics Dashboard',
                tagline: 'Your payment health at a glance — every time you log in',
                desc: 'The home dashboard shows invoice counts, currency-separated pending and overdue amounts, average payment delay, and collection activity.',
                image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
                imageAlt: 'Collection analytics dashboard showing payment health metrics',
                benefits: [
                    'Total Invoices card: all-time count with paid/pending split',
                    'Pending Amount: total outstanding with invoice count',
                    '"Overdue" amount shown in red with days overdue breakdown',
                    'Total client count and average delay across paid invoices',
                    'Payment Health Bar: split % Paid / Pending / Overdue visually',
                    'Collection Rate %: what fraction of billed revenue is collected',
                    'Data refreshes from current invoice records on each page load',
                ],
            },
        ],
    },

    integrations: {
        slug: 'integrations',
        label: 'Integrations',
        color: '#fbbf24',
        icon: '🔗',
        tagline: 'Connect the tools you already use — no new habits needed',
        heroImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
        heroImageAlt: 'Digital integration and connectivity concept with glowing nodes',
        items: [
            {
                icon: '📧',
                title: 'Gmail Integration (Live)',
                tagline: 'Send follow-ups from your own Google inbox',
                desc: 'Connect Google through OAuth so manual and automated follow-ups can be sent from the connected Gmail address instead of a generic system mailbox.',
                image: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?auto=format&fit=crop&w=800&q=80',
                imageAlt: 'Gmail open on MacBook displaying follow-up email thread',
                benefits: [
                    'Google OAuth 2.0 — connect in one click from Profile Settings',
                    'Gmail send scope — Flowcent does not request inbox-read access',
                    'Works with gmail.com and Google Workspace domains',
                    'Tokens refreshed automatically — never reconnect manually',
                    'All 5 follow-up stages sent from your address with correct display name',
                    'Recipient sees your connected Gmail sender identity, not a generic Flowcent mailbox',
                ],
            },
            {
                icon: '💳',
                title: 'Razorpay Payment Links',
                tagline: 'Let clients pay directly inside the follow-up email',
                desc: 'Create an unguessable payment link for each INR invoice. Clients can check out through Razorpay and Flowcent verifies the provider response before marking the invoice paid.',
                image: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=800&q=80',
                imageAlt: 'Payment processing interface on mobile device',
                benefits: [
                    'Auto-generate Razorpay payment link per invoice',
                    'Link embedded in automated follow-up emails',
                    'Supports UPI, Net Banking, Cards, Wallets',
                    'Payment confirmation auto-marks invoice as paid in Flowcent',
                    'Supports INR checkout through the methods enabled in Razorpay',
                ],
            },
            {
                icon: '💬',
                title: 'WhatsApp Follow-ups (Beta)',
                tagline: 'Chase payments where Indian clients actually respond',
                desc: 'Optional WhatsApp Cloud API support can send approved reminder templates when credentials, recipient consent and templates are configured.',
                image: 'https://images.unsplash.com/photo-1614680376408-81e91ffe3db7?auto=format&fit=crop&w=800&q=80',
                imageAlt: 'WhatsApp business messaging interface on smartphone',
                benefits: [
                    'WhatsApp Business API integration',
                    'Triggered alongside configured automated follow-ups',
                    'Professional message templates with invoice details',
                    'Supports payment link inclusion in WhatsApp messages',
                    'Messages are attempted only when WhatsApp consent is recorded for the client',
                ],
            },
            {
                icon: '📊',
                title: 'Accounting Export (Planned)',
                tagline: 'Push collected invoices to your accounting tool',
                desc: 'Planned export workflows will make it easier to move paid invoice data into accounting systems without duplicate entry.',
                image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80',
                imageAlt: 'Accounting spreadsheet and financial data export interface',
                benefits: [
                    'CSV export of all paid invoices with metadata',
                    'Zoho Books integration (push invoice on mark as paid)',
                    'Tally XML export support',
                    'Structured invoice data suitable for future accounting export',
                    'Filter by date range, client, or currency before export',
                ],
            },
        ],
    },
};

const ALL_CATEGORIES = [
    { slug: 'invoice-management', label: 'Invoice Management', icon: '📄', color: '#6b96ff' },
    { slug: 'ai-automation', label: 'AI & Automation', icon: '🤖', color: '#a78bfa' },
    { slug: 'client-intelligence', label: 'Client Intelligence', icon: '👥', color: '#34d399' },
    { slug: 'integrations', label: 'Integrations', icon: '🔗', color: '#fbbf24' },
];

export default async function FeatureCategoryPage({ params }: { params: Promise<{ category: string }> }) {
    const { category } = await params;
    const cat = CATEGORIES[category];
    if (!cat) return notFound();

    const otherCats = ALL_CATEGORIES.filter(c => c.slug !== category);

    return (
        <div className="min-h-screen bg-[#09090f] text-white">
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/3 w-[700px] h-[700px] rounded-full opacity-20"
                    style={{ background: `radial-gradient(circle, ${cat.color}12 0%, transparent 65%)` }} />
                <div className="absolute inset-0 grid-bg opacity-25" />
            </div>

            <SiteNav activePage="features" />

            {/* ── Hero ── */}
            <section className="relative z-10 pt-32 pb-0 px-6">
                <div className="max-w-7xl mx-auto">
                    <Link href="/features" className="inline-flex items-center gap-2 text-sm text-white/35 hover:text-white mb-8 transition-colors">
                        ← All Features
                    </Link>

                    {/* Category banner */}
                    <div className="relative rounded-3xl overflow-hidden mb-8 h-64">
                        <Image src={cat.heroImage} alt={cat.heroImageAlt} width={1400} height={560} sizes="100vw" className="w-full h-full object-cover" priority />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#09090f]/90 via-[#09090f]/60 to-transparent flex items-center px-10">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-4 text-sm font-medium"
                                    style={{ color: cat.color, borderColor: `${cat.color}35`, background: `${cat.color}10` }}>
                                    <span className="text-lg">{cat.icon}</span> {cat.label}
                                </div>
                                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 leading-tight max-w-xl">{cat.tagline}</h1>
                                <p className="text-white/40">{cat.items.length} feature{cat.items.length > 1 ? 's' : ''} in this category</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick nav to other categories */}
                    <div className="flex flex-wrap gap-2 mb-16">
                        {otherCats.map(c => (
                            <Link key={c.slug} href={`/features/${c.slug}`}>
                                <span className="text-xs px-3.5 py-1.5 rounded-full border border-white/[0.08] text-white/35 hover:text-white hover:border-white/20 transition-all cursor-pointer">
                                    {c.icon} {c.label}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Features ── */}
            <section className="relative z-10 pb-20 px-6">
                <div className="max-w-7xl mx-auto space-y-24">
                    {cat.items.map((feature, fi) => (
                        <div key={feature.title} className={`grid lg:grid-cols-2 gap-14 items-center ${fi % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}>

                            {/* Text */}
                            <div className={`${fi % 2 === 1 ? 'lg:col-start-2' : ''} reveal-${fi % 2 === 0 ? 'left' : 'right'}`}>
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                                        style={{ background: `${cat.color}12` }}>{feature.icon}</div>
                                    <span className="text-xs px-3 py-1 rounded-full font-semibold"
                                        style={{ color: cat.color, background: `${cat.color}12`, border: `1px solid ${cat.color}25` }}>
                                        {cat.label}
                                    </span>
                                </div>
                                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-snug">{feature.title}</h2>
                                <p className="text-lg font-medium mb-4" style={{ color: cat.color }}>{feature.tagline}</p>
                                <p className="text-white/50 leading-relaxed mb-7">{feature.desc}</p>
                                <Link href="/signup" className="btn-primary text-sm px-7 py-3 inline-flex">
                                    Explore the Free plan →
                                </Link>
                            </div>

                            {/* Image + Benefits */}
                            <div className={`space-y-4 ${fi % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''} reveal-${fi % 2 === 0 ? 'right' : 'left'} reveal-delay-2`}>
                                <div className="feature-card rounded-2xl overflow-hidden border border-white/[0.06] aspect-video shadow-xl">
                                    <Image src={feature.image} alt={feature.imageAlt} width={800} height={450} sizes="(max-width: 1024px) 100vw, 50vw" className="feature-card-img w-full h-full object-cover" />
                                </div>
                                <div className="glass-card p-6 feature-card" style={{ borderColor: `${cat.color}18` }}>
                                    <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-4" style={{ color: cat.color }}>
                                        What you get
                                    </p>
                                    <ul className="space-y-2.5">
                                        {feature.benefits.map(b => (
                                            <li key={b} className="flex items-start gap-2.5 text-sm">
                                                <span className="mt-0.5 shrink-0" style={{ color: cat.color }}>✓</span>
                                                <span className="text-white/65 leading-relaxed">{b}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Other categories ── */}
            <section className="relative z-10 py-12 px-6 pb-24">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-2xl font-bold mb-8">Explore other feature categories</h2>
                    <div className="grid sm:grid-cols-3 gap-4">
                        {otherCats.map((c, i) => (
                            <Link key={c.slug} href={`/features/${c.slug}`}>
                                <div className={`feature-card glass-card p-6 cursor-pointer group reveal-up reveal-delay-${Math.min(i + 1, 6)}`}
                                    style={{ borderColor: `${c.color}18` }}>
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4"
                                        style={{ background: `${c.color}12` }}>{c.icon}</div>
                                    <h3 className="font-bold text-white group-hover:text-blue-300 transition-colors duration-200 mb-1">{c.label}</h3>
                                    <span className="text-xs font-medium" style={{ color: c.color }}>Explore →</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="relative z-10 py-4 px-6 pb-20">
                <div className="max-w-4xl mx-auto">
                    <div className="relative rounded-3xl overflow-hidden">
                        <Image
                            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80"
                            alt="Team celebrating"
                            width={1200}
                            height={500}
                            sizes="100vw"
                            className="absolute inset-0 w-full h-full object-cover opacity-15"
                        />
                        <div className="relative glass-card p-12 text-center" style={{ borderColor: `${cat.color}20` }}>
                            <h2 className="text-3xl font-bold mb-4">
                                All {cat.items.length} {cat.label} features — <span className="grad-text">free to start</span>
                            </h2>
                            <p className="text-white/50 mb-8 max-w-md mx-auto">No credit card required for the Free plan. Upgrade anytime.</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/signup" className="btn-primary px-8 py-3.5 text-center">Get started free →</Link>
                                <Link href="/features" className="btn-outline px-8 py-3.5 text-center">Back to all features</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <SiteFooter />
        </div>
    );
}
