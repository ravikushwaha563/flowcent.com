import { notFound } from 'next/navigation';
import Link from 'next/link';
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
        tagline: 'Create, track and get paid — without the spreadsheet chaos',
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
                    'View all invoices sorted by newest first or overdue priority',
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
                    'Dashboard totals shown in your primary currency',
                    'Invoice PDF (coming soon) respects currency formatting and locale',
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
                desc: 'Generate a clean, professional PDF for every invoice — branded, itemised, and ready to send. Clients who receive proper invoices pay faster than those who get a WhatsApp message.',
                image: 'https://images.unsplash.com/photo-1568234931994-ba7cc1fcbc97?auto=format&fit=crop&w=800&q=80',
                imageAlt: 'PDF document with professional invoice formatting',
                benefits: [
                    'One-click PDF generation from any invoice',
                    'Includes invoice number, client details, line items and totals',
                    'Branded with your business name and details',
                    'Coming Q2 2026 — sign up to be notified',
                ],
            },
        ],
    },

    'ai-automation': {
        slug: 'ai-automation',
        label: 'AI & Automation',
        color: '#a78bfa',
        icon: '🤖',
        tagline: 'AI that reads client emails, predicts payment, and chases for you',
        heroImage: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=1200&q=80',
        heroImageAlt: 'Abstract AI neural network visualization in deep purple',
        items: [
            {
                icon: '🤖',
                title: 'AI Excuse Memory™',
                tagline: 'Never forget what your client promised',
                desc: 'Paste any client email or message reply into Flowcent. Our AI reads it, extracts payment promises and excuses, categorises them (Date Commitment, Excuse, Dispute, etc.), and logs them permanently. Every client builds a truth record.',
                image: 'https://images.unsplash.com/photo-1655720031554-a929595ffad7?auto=format&fit=crop&w=800&q=80',
                imageAlt: 'AI reading and analyzing email text to extract key information',
                benefits: [
                    'AI extracts: Date Commitments, Partial Payments, Excuses, Disputes, "Will Pay"',
                    'Every promise logged with exact quote, date, and type',
                    'Mark promises as fulfilled when payment actually arrives',
                    'Full timeline view of all excuses per invoice',
                    'Pattern detection: same excuse twice from same client = flagged',
                    'AI recommends which follow-up stage to escalate to next',
                ],
            },
            {
                icon: '✉️',
                title: '5-Stage Automated Follow-ups',
                tagline: 'Perfect tone, perfect timing — sent automatically from your Gmail',
                desc: 'Flowcent sends staged follow-up emails from your own Gmail address. Each stage escalates professionally — from a gentle nudge to a firm final notice — with smart timing between each stage.',
                image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
                imageAlt: 'Email inbox with professional payment follow-up messages visible',
                benefits: [
                    'Stage 1: Friendly Reminder — sent 3 days after due date',
                    'Stage 2: Professional Follow-up — +3 more days',
                    'Stage 3: Second Follow-up — +4 more days',
                    'Stage 4: Urgent Notice — +5 more days',
                    'Stage 5: Final Notice — +7 more days',
                    'All emails sent FROM YOUR real Gmail address, not a system address',
                    'Toggle auto follow-up ON or OFF per individual invoice at creation',
                    'Manual "Run Now" button to trigger the current stage immediately',
                ],
            },
            {
                icon: '📊',
                title: 'Payment Intent Score',
                tagline: 'AI predicts: will this client actually pay?',
                desc: 'Every unpaid invoice gets a dynamic 0–100 payment intent score, calculated in real time from four key signals. Know which overdue invoices need your personal attention — and which the automation will handle.',
                image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
                imageAlt: 'Analytics dashboard showing predictive payment scores with color coding',
                benefits: [
                    'Factor 1: Days overdue — highest impact signal',
                    'Factor 2: Client\'s full payment history across all past invoices',
                    'Factor 3: Current follow-up stage reached (Stage 4/5 = lower score)',
                    'Factor 4: Invoice amount (high invoice = riskier)',
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
                    'Write-only access — Flowcent NEVER reads your inbox',
                    'All staged follow-ups sent from your real Gmail address',
                    'Works with @gmail.com and Google Workspace (G Suite) addresses',
                    'Tokens stored securely encrypted and auto-refreshed',
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
        tagline: 'Know every client\'s payment personality before you chase them',
        heroImage: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=80',
        heroImageAlt: 'Business professionals reviewing client information and data',
        items: [
            {
                icon: '👥',
                title: 'Client Management',
                tagline: 'A full payment profile for every client',
                desc: 'Each client gets a dedicated profile — contact info, company, all linked invoices, complete payment history, and a risk score derived from their behaviour. Know your best payers and your problem clients instantly.',
                image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80',
                imageAlt: 'Team reviewing client profile information on screen',
                benefits: [
                    'Client profile: name, email, phone, company, notes',
                    'All invoices for that client in one linked view',
                    'Total billed, total collected, and current outstanding balance',
                    'Payment risk score shown on client card and profile',
                    'Quick-add client from the invoices page (no separate flow needed)',
                    'Client list sorted by outstanding balance or last activity',
                ],
            },
            {
                icon: '🏆',
                title: 'Client Risk Scoring',
                tagline: 'Identify your problem payers before it\'s too late',
                desc: 'Every client accumulates a payment risk score based on their real history with you — how often late, how many overdue invoices, how many excuses logged. High risk = chase early.',
                image: 'https://images.unsplash.com/photo-1642790551116-18a150d38a18?auto=format&fit=crop&w=800&q=80',
                imageAlt: 'Risk assessment dashboard showing client payment scores',
                benefits: [
                    'Score based on: payment delay history, overdue frequency, excuse count',
                    'Colour-coded risk badge on every client card (🟢 Low · 🟡 Medium · 🔴 High)',
                    'Sort client list by risk score to prioritise your collections effort',
                    'Risk score updates automatically with every invoice interaction',
                    'Helps you decide: accept this client\'s next project or request an advance?',
                ],
            },
            {
                icon: '📝',
                title: 'Promise & Excuse Tracker',
                tagline: 'Every "I\'ll pay Friday" is documented forever',
                desc: 'No more he-said-she-said. Every payment commitment a client makes is timestamped, categorised, and stored as evidence. When they give you the same excuse twice, Flowcent flags it.',
                image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=800&q=80',
                imageAlt: 'Notebook and digital tracker showing client commitments logged',
                benefits: [
                    '6 promise types: Date Commitment, Partial Payment, Excuse, Dispute, Will Pay, Other',
                    'Exact quote from client email stored verbatim',
                    'Date logged + optional promised payment date fields',
                    'Fulfill/unfulfill toggle — mark when the promise was kept (or wasn\'t)',
                    'Full promise timeline on every invoice detail page',
                    'Patterns surfaced: same excuse from same client across multiple invoices',
                ],
            },
            {
                icon: '📈',
                title: 'Collection Analytics Dashboard',
                tagline: 'Your payment health at a glance — every time you log in',
                desc: 'The home dashboard shows your complete financial health snapshot — total invoices, pending amount, overdue amount, average payment delay, and a visual health breakdown bar.',
                image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
                imageAlt: 'Collection analytics dashboard showing payment health metrics',
                benefits: [
                    'Total Invoices card: all-time count with paid/pending split',
                    'Pending Amount: total outstanding with invoice count',
                    '"Overdue" amount shown in red with days overdue breakdown',
                    'Total Clients count with per-client average payment delay',
                    'Payment Health Bar: split % Paid / Pending / Overdue visually',
                    'Collection Rate %: what fraction of billed revenue is collected',
                    'Data refreshes on every page load — always real-time',
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
                desc: 'The most important integration in Flowcent. Connect your Google account once — and every single automated follow-up is sent from your personal Gmail address. Clients respond faster when they see a real person\'s email, not a system address.',
                image: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?auto=format&fit=crop&w=800&q=80',
                imageAlt: 'Gmail open on MacBook displaying follow-up email thread',
                benefits: [
                    'Google OAuth 2.0 — connect in one click from Profile Settings',
                    'Write-only scope — Flowcent cannot read your emails',
                    'Works with gmail.com and Google Workspace domains',
                    'Tokens refreshed automatically — never reconnect manually',
                    'All 5 follow-up stages sent from your address with correct display name',
                    'Recipient sees: "From: Arjun Singh (arjun@gmail.com)" — not Flowcent',
                ],
            },
            {
                icon: '💳',
                title: 'Razorpay Payment Links (Coming Q2 2026)',
                tagline: 'Let clients pay directly inside the follow-up email',
                desc: 'The biggest friction in getting paid is making it hard. Soon Flowcent will auto-generate a Razorpay payment link inside every follow-up email — clients click, pay in 30 seconds, and your invoice auto-marks as paid.',
                image: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=800&q=80',
                imageAlt: 'Payment processing interface on mobile device',
                benefits: [
                    'Auto-generate Razorpay payment link per invoice',
                    'Link embedded in Stage 2+ follow-up emails automatically',
                    'Supports UPI, Net Banking, Cards, Wallets',
                    'Payment confirmation auto-marks invoice as paid in Flowcent',
                    'Supports INR payments with GST-compliant receipts',
                ],
            },
            {
                icon: '💬',
                title: 'WhatsApp Follow-ups (Coming Q2 2026)',
                tagline: 'Chase payments where Indian clients actually respond',
                desc: 'Email go-to-ignored. WhatsApp gets read. Coming soon — Flowcent will send follow-up messages via WhatsApp Business API after email stages fail to generate a response.',
                image: 'https://images.unsplash.com/photo-1614680376408-81e91ffe3db7?auto=format&fit=crop&w=800&q=80',
                imageAlt: 'WhatsApp business messaging interface on smartphone',
                benefits: [
                    'WhatsApp Business API integration',
                    'Triggered automatically after Stage 3 email gets no response',
                    'Professional message templates with invoice details',
                    'Supports payment link inclusion in WhatsApp messages',
                    'Opt-out respected — clients can DND at any time',
                ],
            },
            {
                icon: '📊',
                title: 'Accounting Export (Coming Q2 2026)',
                tagline: 'Push collected invoices to your accounting tool',
                desc: 'Coming soon — export your paid invoices as a clean CSV or push directly to accounting tools like Zoho Books or Tally. No more duplicate data entry.',
                image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80',
                imageAlt: 'Accounting spreadsheet and financial data export interface',
                benefits: [
                    'CSV export of all paid invoices with metadata',
                    'Zoho Books integration (push invoice on mark as paid)',
                    'Tally XML export support',
                    'GST-compliant invoice data formatting for Indian accounting',
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
                        <img src={cat.heroImage} alt={cat.heroImageAlt} className="w-full h-full object-cover" />
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
                                <Link href="/signup">
                                    <button className="btn-primary text-sm px-7 py-3">Try this feature free →</button>
                                </Link>
                            </div>

                            {/* Image + Benefits */}
                            <div className={`space-y-4 ${fi % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''} reveal-${fi % 2 === 0 ? 'right' : 'left'} reveal-delay-2`}>
                                <div className="feature-card rounded-2xl overflow-hidden border border-white/[0.06] aspect-video shadow-xl">
                                    <img src={feature.image} alt={feature.imageAlt} loading="lazy" className="feature-card-img w-full h-full object-cover" />
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
                        <img
                            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80"
                            alt="Team celebrating"
                            className="absolute inset-0 w-full h-full object-cover opacity-15"
                        />
                        <div className="relative glass-card p-12 text-center" style={{ borderColor: `${cat.color}20` }}>
                            <h2 className="text-3xl font-bold mb-4">
                                All {cat.items.length} {cat.label} features — <span className="grad-text">free to start</span>
                            </h2>
                            <p className="text-white/50 mb-8 max-w-md mx-auto">No credit card required. Set up in 5 minutes. Upgrade anytime.</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/signup"><button className="btn-primary px-8 py-3.5">Get started free →</button></Link>
                                <Link href="/features"><button className="btn-outline px-8 py-3.5">Back to all features</button></Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <SiteFooter />
        </div>
    );
}
