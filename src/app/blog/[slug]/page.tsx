'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { useReveal } from '@/hooks/useReveal';

const POSTS: Record<string, {
    title: string; date: string; readTime: string; category: string; categoryColor: string;
    author: string; authorRole: string; excerpt: string;
    content: string[]; image: string;
}> = {
    'how-indian-freelancers-get-paid-faster': {
        title: 'How Indian Freelancers Cut Payment Time from 45 Days to 12',
        date: 'Feb 20, 2026', readTime: '8 min read', category: 'Collection Tips', categoryColor: '#6b96ff',
        author: 'Arjun Mehta', authorRole: 'Co-founder, Flowcent',
        image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80',
        excerpt: 'The 5-stage follow-up system used by 500+ Indian freelancers to collect payments without damaging client relationships.',
        content: [
            'The average payment delay for Indian freelancers is 47 days. That\'s 47 days of cash flow pressure, uncertainty, and awkward follow-up messages — for work you already delivered.',
            'But a growing group of freelancers are cutting this to under 15 days. Here\'s what they do differently.',
            '## They automate before the overdue date',
            'The biggest difference: high-performing freelancers set up follow-up sequences the moment they send an invoice. They use tools like Flowcent to schedule automated reminders — so by the time an invoice is overdue, a professional email has already gone out.',
            '## They use a structured escalation',
            'The key is not sending one follow-up and giving up — it\'s a structured 5-stage escalation: Day -3 (before due): Friendly heads-up reminder. Day 1 (just overdue): Polite first follow-up. Day 7: Professional firm reminder. Day 18: Escalation notice — asks for specific payment date. Day 28: Final notice with consequences. Most payments happen between Stage 1 and Stage 3.',
            '## They track client payment patterns',
            'Repeat clients who pay late are predictable. Flowcent\'s AI builds a payment history profile so you know exactly how to handle each client. Some need Stage 1. Some need Stage 4.',
            '## They make payment frictionless',
            'Every invoice includes bank account, UPI ID, and payment link. Removing friction from payment removes the "I\'ll do it later" excuse permanently.',
            '## The result: 45 days → 12 days',
            'The 500+ freelancers using Flowcent have reduced their average payment time from 45+ days to under 12 days. Not by being more aggressive — but by being more systematic.',
        ],
    },
    'ai-excuse-memory-explained': {
        title: 'Inside AI Excuse Memory™: How It Detects Client Payment Patterns',
        date: 'Feb 18, 2026', readTime: '6 min read', category: 'AI Features', categoryColor: '#a78bfa',
        author: 'Priya Nair', authorRole: 'Head of Product, Flowcent',
        image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=1200&q=80',
        excerpt: 'A technical and practical deep-dive into how Flowcent\'s AI reads client emails, extracts promises, and builds a payment intent profile.',
        content: [
            'AI Excuse Memory™ is one of Flowcent\'s most unique features. It uses a large language model to analyse client replies — extracting commitments, spotting red flags, and building a long-term payment profile for each client.',
            '## Why we built it',
            'Every experienced freelancer keeps a mental model of each client: "Ravi always pays on the 15th," "TechCorp always asks for a revised invoice," "StartupX makes promises but takes 60 days." This mental model is incredibly valuable — but it exists only in the freelancer\'s head, can\'t be scaled, and disappears when memory fades.',
            'AI Excuse Memory™ externalizes and systematizes this model.',
            '## How the AI works',
            'We use Groq\'s LLaMA 3 model with a custom system prompt trained on payment conversation patterns. When you paste a client\'s email or message, the AI: 1) Extracts the intent — What is the client actually saying about payment? 2) Identifies promises — Are there specific dates, amounts, or commitments? 3) Flags risk signals — Dispute language, vague promises, complete avoidance. 4) Assigns a confidence score — How likely is this client to pay, based on what they said? 5) Logs everything — The response, extracted data, and score are saved to that invoice\'s timeline.',
            '## The compounding benefit',
            'The longer you use Flowcent, the smarter it gets about your specific clients. By invoice 5 with the same client, the AI has a rich history to draw from — and can tell you with high accuracy whether this client will pay on time or needs escalation.',
        ],
    },
    'invoice-templates-for-indian-freelancers': {
        title: '5 Invoice Templates That Help Indian Freelancers Get Paid Faster',
        date: 'Feb 15, 2026', readTime: '5 min read', category: 'Templates', categoryColor: '#34d399',
        author: 'Sneha Rao', authorRole: 'Community Manager, Flowcent',
        image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
        excerpt: 'The exact phrasing, tone, and structure of invoice emails and follow-ups that result in the fastest payment turnaround.',
        content: [
            'The words you use in your invoice email matter more than most freelancers realise. After analyzing thousands of invoice interactions, we\'ve identified the exact template structures that get paid fastest.',
            '## Template 1: The Standard Project Invoice',
            'Subject: Invoice #[Number] — [Project Name] — ₹[Amount]. Hi [Client Name], Please find attached Invoice #[Number] for [Project Name], totalling ₹[Amount]. Payment is due by [Date]. You can pay via UPI: [your-upi-id] or Bank Transfer: [Account] / IFSC [Code]. Please confirm receipt of this invoice. Thank you for a great project! [Your Name]',
            '## Template 2: The Milestone Invoice',
            'Use this for projects broken into phases. Always reference the original agreement and clearly label which milestone you\'re billing for. Including the completion percentage (e.g., "50% milestone — UI design complete") makes disputes rare.',
            '## Template 3: The Monthly Retainer Invoice',
            'Retainer invoices should go out on the same day every month — ideally 1 week before the month ends. Reference the retainer agreement, state the retainer period clearly (e.g., "March 2026 retainer"), and include your bank details.',
            '## Template 4: The First Follow-up',
            'Subject: Re: Invoice #[Number] — Gentle Reminder. Hi [Client Name], Just following up on Invoice #[Number] for ₹[Amount] that was due on [Date]. Please let me know if you have any questions or if you need any additional information. Thank you! [Your Name]',
            '## Template 5: The "Let\'s Resolve This" Email',
            'Use this at Stage 4 — when multiple follow-ups haven\'t worked. Acknowledge the delay professionally, ask for a specific payment date, and mention that you\'re available to discuss any concerns. This template is surprisingly effective at unlocking stalled payments.',
        ],
    },
    'legal-options-for-unpaid-invoices-india': {
        title: 'Legal Options for Unpaid Invoices in India: What Freelancers Can Do',
        date: 'Feb 12, 2026', readTime: '10 min read', category: 'Legal & Finance', categoryColor: '#fbbf24',
        author: 'Arjun Mehta', authorRole: 'Co-founder, Flowcent',
        image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=1200&q=80',
        excerpt: 'From MSME payment act to consumer court — your real options when a client refuses to pay, explained without the legal jargon.',
        content: [
            'Most freelancers assume that if a client refuses to pay, there\'s nothing they can do. That\'s completely wrong. India has multiple legal frameworks that protect service providers — and many of them are fast, affordable, and highly effective.',
            '## Step 1: Send a formal demand notice',
            'Before any legal action, send a formal demand notice via registered post or email with a 15-day payment deadline. This creates a legal record and often resolves disputes without further action. Many clients pay immediately when they see a formal notice.',
            '## The MSME Samadhan Portal',
            'If you are registered as an MSME (Udyam Registration — free and takes 10 minutes), you can file a complaint on the MSME Samadhaan portal. The law requires buyers to pay MSMEs within 45 days. If not, they owe compound interest at 3x the RBI bank rate.',
            '## Consumer Forum / NCDRC',
            'For service-related disputes, the Consumer Protection Act 2019 applies. File a complaint at your district consumer forum. Filing fee is just ₹100–200 for most cases. This route is effective for straightforward unpaid service cases.',
            '## Civil Court — Money Recovery Suit',
            'For amounts above ₹1 lakh, file a money recovery suit in civil court. Get a lawyer (typically ₹5,000–15,000 for small cases). Courts can issue summary judgements if your documentation is strong (signed agreements, invoices, email trails).',
            '## The most important thing: documentation',
            'Your ability to take legal action depends entirely on your documentation. Use Flowcent from day one: every invoice, every follow-up email, every promise logged — creates an automatic legal paper trail that makes any legal action much stronger.',
        ],
    },
    'gmail-automation-for-freelancers': {
        title: 'Gmail Automation for Freelancers: Send Follow-ups You\'ll Never Have to Write',
        date: 'Feb 10, 2026', readTime: '4 min read', category: 'Automation', categoryColor: '#f87171',
        author: 'Priya Nair', authorRole: 'Head of Product, Flowcent',
        image: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?auto=format&fit=crop&w=1200&q=80',
        excerpt: 'How to set up Gmail OAuth with Flowcent so all your payment follow-ups go out from your real email automatically.',
        content: [
            'The most powerful thing about Flowcent\'s Gmail integration is that follow-up emails go out from your real Gmail address — not from a generic "no-reply" system. Clients think you\'re personally following up. You\'re not.',
            '## Step 1: Connect your Gmail',
            'In Flowcent Settings, click "Connect Gmail." You\'ll be redirected to Google OAuth. Approve access for sending emails. That\'s it — takes under 30 seconds.',
            '## Step 2: Enable auto follow-up on an invoice',
            'When you create or edit an invoice, toggle "Auto Follow-up" on. Flowcent will automatically send Stage 1 on Day 1 overdue, Stage 2 on Day 5, and so on — all from your Gmail.',
            '## What the client receives',
            'From their perspective, they receive a regular, professional email from your Gmail address. There\'s no indication it was sent automatically. The email uses your name, references the invoice details, and is contextually appropriate for the stage.',
            '## Why this matters',
            'Tools that send follow-ups from a generic email address have low open rates and feel impersonal. By sending from your real Gmail, open rates are 40% higher and response rates double. Clients treat the message as coming from you — because it is.',
            '## Privacy and security',
            'Flowcent only requests the minimum Gmail scope needed: send emails on your behalf. We never read your emails. You can revoke access at any time from Settings or directly from Google\'s security settings.',
        ],
    },
    'payment-intent-score-guide': {
        title: 'Payment Intent Score: What the Number Means and How to Use It',
        date: 'Feb 8, 2026', readTime: '5 min read', category: 'AI Features', categoryColor: '#a78bfa',
        author: 'Priya Nair', authorRole: 'Head of Product, Flowcent',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
        excerpt: 'The Payment Intent Score (0–100) tells you exactly how likely a client is to pay — and what to do based on the number.',
        content: [
            'Every invoice in Flowcent has a Payment Intent Score — a 0–100 number that represents our AI\'s assessment of how likely the client is to pay this invoice, and how soon.',
            '## How the score is calculated',
            'The score is a weighted combination of multiple signals: number of days overdue, follow-up stage reached, number of client responses, types of excuses detected, prior payment history with this client, and whether the client has made specific date commitments.',
            '## Score ranges and what they mean',
            '80–100 (Green): High intent. Client is likely to pay soon. May just need one more nudge. 50–79 (Yellow): Moderate intent. Client is engaged but delayed. Continue automated follow-ups. 30–49 (Orange): Low-moderate intent. Consider personal outreach alongside automation. 0–29 (Red): Low intent. Client may be avoiding payment. Time to escalate to Stage 4–5 or consider legal options.',
            '## How to improve a low score',
            'The fastest way to improve a score is to get a written commitment from the client. Even a WhatsApp reply saying "will pay by Friday" — paste it into AI Excuse Memory™. The AI extracts the commitment and raises the score. A logged commitment changes everything.',
            '## The portfolio view',
            'On your Flowcent dashboard, you can see all your invoices ranked by Payment Intent Score. This gives you an instant triage view of where to focus: high-score invoices run automatically, low-score ones need your attention.',
        ],
    },
    // Legacy slugs (backward compatibility)
    'stop-chasing-payments': {
        title: 'Stop Chasing Payments: The Freelancer\'s Complete Guide',
        date: 'Feb 18, 2026', readTime: '8 min read', category: 'Getting Paid', categoryColor: '#6b96ff',
        author: 'Arjun Mehta', authorRole: 'Co-founder, Flowcent',
        image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
        excerpt: 'The average Indian freelancer loses 14% of annual revenue to late or unpaid invoices. Here\'s the exact system to fix that.',
        content: [
            'If you\'re a freelancer in India, you already know the sinking feeling. The project is done. The client loved it. And then... silence on the payment front.',
            'This guide is the culmination of everything we learned building Flowcent — a payment collection tool for Indian freelancers.',
            '## The real cost of late payments',
            'Most freelancers underestimate what late payments actually cost them. Research shows the average Indian freelancer spends 4.5 hours per week managing overdue invoices. At even ₹500/hour, that\'s ₹9,000/month in lost productivity.',
            '## The 5-Stage Follow-up System',
            'Stage 1 (Day 1): Friendly Reminder. Stage 2 (Day 5): Follow-up. Stage 3 (Day 10): Firmer reminder. Stage 4 (Day 20): Urgent notice — ask for specific date. Stage 5 (Day 30): Final notice. Most payments happen between Stage 1 and Stage 3.',
            '## The Excuse Memory Principle',
            'Clients who delay payments are consistent — they use the same 5–6 excuses. Tracking patterns (Flowcent\'s AI Excuse Memory™ does this automatically) lets you anticipate delays and respond with precision.',
        ],
    },
    'ai-excuse-detector': {
        title: 'How AI Detects Client Payment Excuses',
        date: 'Feb 14, 2026', readTime: '6 min read', category: 'AI & Tech', categoryColor: '#a78bfa',
        author: 'Priya Nair', authorRole: 'Head of Product, Flowcent',
        image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=1200&q=80',
        excerpt: 'We trained our AI on 10,000+ client email responses. Here\'s what it learned about the patterns hiding in payment excuses.',
        content: [
            'When we started building Flowcent, we interviewed 200 freelancers across India. The single most common complaint was uncertainty: "I never know if they\'ll actually pay or just keep stringing me along."',
            '## The 6 Types of Payment Responses',
            '1. Date Commitment — "Will pay by Friday." (Most reliable). 2. Partial Payment — "Can I send half now?" (Second most reliable). 3. Process Excuse — "Our accounts team handles this." (Moderate risk). 4. Vague Promise — "Will sort it out this week." (High risk). 5. Dispute — "Actually, we had some feedback." (Very high risk). 6. Ghost — No response. (Highest risk).',
            '## The Payment Intent Score',
            'Every analysis produces a 0–100 score. Below 40 means it\'s time to escalate. Above 70 means the automation will likely handle it. Between 40–70, personal outreach alongside automation is recommended.',
        ],
    },
    'invoice-tips-india': {
        title: '7 Invoice Best Practices Every Indian Freelancer Must Know',
        date: 'Feb 10, 2026', readTime: '5 min read', category: 'Tips', categoryColor: '#34d399',
        author: 'Sneha Rao', authorRole: 'Community Manager, Flowcent',
        image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80',
        excerpt: 'Small invoice tweaks that dramatically improve your payment rate — backed by data from 10,000+ freelancer invoices.',
        content: [
            'The difference between getting paid in 12 days vs 47 days often isn\'t how much you chased — it\'s how the invoice was set up in the first place.',
            '## 1. Always specify a payment due date',
            '"Net 30" means different things to different people. "Please pay by March 5, 2026" is unambiguous. Invoices with specific dates get paid 40% faster.',
            '## 2. Break down your services clearly',
            'Instead of "Design services — ₹50,000," write "Homepage design (3 screens, 2 revisions) — ₹30,000" and "Logo pack — ₹20,000."',
            '## 3. Include payment methods prominently',
            'List your UPI ID, bank account, and any other payment methods on the invoice itself.',
            '## 4. Send the invoice on project completion day',
            'Don\'t wait. Every day you delay sending makes payment feel less urgent to the client.',
        ],
    },
};

// Fallback for unlisted slugs
const FALLBACK = {
    title: 'Article Coming Soon',
    date: 'Feb 2026', readTime: '—', category: 'Flowcent Blog', categoryColor: '#6b96ff',
    author: 'Flowcent Team', authorRole: 'flowcent.in',
    image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80',
    excerpt: 'We\'re writing this one right now. Check back soon.',
    content: ['This article is being drafted. Follow us on Twitter to know when it\'s published.'],
};

export default function BlogPostPage() {
    useReveal();
    const { slug } = useParams<{ slug: string }>();
    const post = POSTS[slug] ?? FALLBACK;

    function renderContent(para: string, i: number) {
        if (para.startsWith('## ')) {
            return (
                <h2 key={i} className="text-xl font-bold text-white mt-10 mb-4">
                    {para.replace('## ', '')}
                </h2>
            );
        }
        return (
            <p key={i} className="text-white/60 leading-relaxed mb-5 text-[15px]">
                {para}
            </p>
        );
    }

    return (
        <div className="min-h-screen bg-[#09090f] text-white overflow-x-hidden">
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="aurora-blob aurora-blob-blue w-[600px] h-[600px]" style={{ top: '-100px', left: '10%', opacity: 0.1 }} />
                <div className="aurora-blob aurora-blob-purple w-[400px] h-[400px]" style={{ bottom: '0', right: '5%', opacity: 0.1 }} />
                <div className="absolute inset-0 grid-bg opacity-[0.1]" />
            </div>

            <SiteNav />

            {/* Hero */}
            <section className="relative z-10 pt-32 pb-12 px-6">
                <div className="max-w-3xl mx-auto">
                    <div style={{ animation: 'revealUp 0.6s cubic-bezier(0.22,1,0.36,1) 0ms both' }}>
                        <Link href="/blog" className="inline-flex items-center gap-2 text-xs text-white/35 hover:text-white/60 transition-colors mb-8">
                            ← Back to Blog
                        </Link>

                        <div className="flex items-center gap-3 mb-5">
                            <span className="text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                                style={{ color: post.categoryColor, background: `${post.categoryColor}15`, border: `1px solid ${post.categoryColor}25` }}>
                                {post.category}
                            </span>
                            <span className="text-white/30 text-xs">{post.date} · {post.readTime}</span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] mb-6">
                            {post.title}
                        </h1>
                        <p className="text-white/50 text-lg leading-relaxed mb-8">{post.excerpt}</p>

                        <div className="flex items-center gap-3 pb-8 border-b border-white/[0.06]">
                            <div className="w-9 h-9 flex items-center justify-center">
                                <Image src="/logo.png" alt="Flowcent author" width={36} height={36} className="w-full h-full rounded-full object-cover shadow-lg" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">{post.author}</p>
                                <p className="text-xs text-white/35">{post.authorRole}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Cover image */}
            <section className="relative z-10 px-6 pb-12">
                <div className="max-w-4xl mx-auto">
                    <div className="rounded-2xl overflow-hidden border border-white/[0.07]" style={{ height: '420px' }}>
                        <Image src={post.image} alt={post.title} width={1200} height={630}
                            className="w-full h-full object-cover" priority sizes="(max-width: 768px) 100vw, 896px" />
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="relative z-10 px-6 pb-24">
                <div className="max-w-3xl mx-auto reveal-up">
                    <div className="prose-like">
                        {post.content.map(renderContent)}
                    </div>

                    {/* CTA */}
                    <div className="mt-14 glass-card rounded-2xl p-8 border border-blue-500/[0.18] text-center">
                        <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Try Flowcent Free</p>
                        <h3 className="text-xl font-bold text-white mb-3">Stop chasing. Start collecting.</h3>
                        <p className="text-white/45 text-sm mb-6 max-w-sm mx-auto">
                            Join 500+ Indian freelancers who automated payment collection with Flowcent.
                        </p>
                        <Link href="/signup">
                            <button className="btn-primary px-8 py-3">Get started free →</button>
                        </Link>
                        <p className="text-xs text-white/25 mt-3">No credit card required · Free forever plan</p>
                    </div>
                </div>
            </section>

            <SiteFooter />
        </div>
    );
}
