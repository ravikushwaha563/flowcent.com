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
        title: 'A Practical System for Faster Freelance Payments',
        date: 'Feb 20, 2026', readTime: '8 min read', category: 'Collection Tips', categoryColor: '#6b96ff',
        author: 'Flowcent Team', authorRole: 'Product and Collections',
        image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80',
        excerpt: 'A practical 5-stage follow-up framework for collecting payments without damaging client relationships.',
        content: [
            'Late freelance payments create cash-flow pressure, uncertainty, and repeated follow-up work for services that have already been delivered.',
            'A consistent process cannot guarantee faster payment, but it can prevent missed reminders and make escalation clearer.',
            '## They automate before the overdue date',
            'The biggest difference: high-performing freelancers set up follow-up sequences the moment they send an invoice. They use tools like Flowcent to schedule automated reminders — so by the time an invoice is overdue, a professional email has already gone out.',
            '## They use a structured escalation',
            'The key is not sending one follow-up and giving up. Flowcent supports five progressively firmer stages. Automated sequences start after the due date and continue at configured intervals; review every final notice before relying on it for a dispute.',
            '## They track client payment patterns',
            'Past invoice dates, payment status, and logged commitments provide useful context for repeat clients. They do not guarantee future behavior, so use them to prioritize review rather than make automatic judgments.',
            '## They make payment frictionless',
            'Flowcent invoices can include a secure online payment link. Clear due dates and a direct checkout path reduce unnecessary steps for the client.',
            '## The practical result',
            'A consistent follow-up process can reduce missed reminders without forcing you to become more aggressive. The goal is to be systematic, clear, and professional.',
        ],
    },
    'ai-excuse-memory-explained': {
        title: 'Inside AI Reply Analysis: Reviewing Payment Commitments',
        date: 'Feb 18, 2026', readTime: '6 min read', category: 'AI Features', categoryColor: '#a78bfa',
        author: 'Flowcent Team', authorRole: 'Product and Collections',
        image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=1200&q=80',
        excerpt: 'A technical and practical deep-dive into how Flowcent\'s AI reads client emails, extracts promises, and builds a payment intent profile.',
        content: [
            'Flowcent AI reply analysis uses a configured language model to review pasted client replies, extract payment commitments, and add context to the invoice record. The result is advisory and should be checked against the original message.',
            '## Why we built it',
            'Every experienced freelancer keeps a mental model of each client: "Ravi always pays on the 15th," "TechCorp always asks for a revised invoice," "StartupX makes promises but takes 60 days." This mental model is incredibly valuable — but it exists only in the freelancer\'s head, can\'t be scaled, and disappears when memory fades.',
            'Flowcent makes this review process structured and repeatable.',
            '## How the AI works',
            'Flowcent uses a configured AI provider with a structured prompt for payment-conversation analysis. It can identify dates or commitments, flag vague or disputed language, produce a heuristic signal, and save invoice-linked promises when that workflow is used.',
            '## The compounding benefit',
            'Payment reliability analysis can use invoice history, payment delays, and logged promises as context. Treat its output as decision support rather than a guarantee that a client will pay.',
        ],
    },
    'invoice-templates-for-indian-freelancers': {
        title: '5 Practical Invoice Email Templates for Indian Freelancers',
        date: 'Feb 15, 2026', readTime: '5 min read', category: 'Templates', categoryColor: '#34d399',
        author: 'Flowcent Team', authorRole: 'Product and Collections',
        image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
        excerpt: 'The exact phrasing, tone, and structure of invoice emails and follow-ups that result in the fastest payment turnaround.',
        content: [
            'Clear invoice emails make it easier for a client to understand the amount, due date, project reference, and available payment method. The templates below are starting points, not performance guarantees.',
            '## Template 1: The Standard Project Invoice',
            'Subject: Invoice #[Number] — [Project Name] — ₹[Amount]. Hi [Client Name], Please find attached Invoice #[Number] for [Project Name], totalling ₹[Amount]. Payment is due by [Date]. You can pay via UPI: [your-upi-id] or Bank Transfer: [Account] / IFSC [Code]. Please confirm receipt of this invoice. Thank you for a great project! [Your Name]',
            '## Template 2: The Milestone Invoice',
            'Use this for projects broken into phases. Reference the original agreement and clearly label which milestone you are billing for. Include the completion percentage where it matches the agreement.',
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
        author: 'Flowcent Team', authorRole: 'Product and Collections',
        image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=1200&q=80',
        excerpt: 'From MSME payment act to consumer court — your real options when a client refuses to pay, explained without the legal jargon.',
        content: [
            'Unpaid-invoice options depend on your contract, business status, location, amount, and the facts of the dispute. This article provides general operational information, not legal advice. Verify current rules on official government portals and consult a qualified Indian lawyer before acting.',
            '## Step 1: Send a formal demand notice',
            'Before escalation, organize the signed agreement, scope changes, delivery evidence, invoice, due date, and communication history. Ask a lawyer whether a formal demand notice is appropriate and what deadline and delivery method apply to your situation.',
            '## The MSME Samadhan Portal',
            'Eligible micro and small enterprises may have remedies through official MSME channels. Eligibility, time limits, interest, and procedure can change, so confirm them directly through the current Udyam and MSME Samadhaan resources or legal counsel.',
            '## Consumer Forum / NCDRC',
            'Consumer-forum jurisdiction is fact-specific and may not cover a commercial service-provider claim. Do not assume eligibility; obtain advice based on the parties and purpose of the transaction.',
            '## Civil Court — Money Recovery Suit',
            'A lawyer can advise whether negotiation, arbitration, mediation, a summary procedure, or a civil recovery claim is suitable. Forum, limitation period, fees, and expected cost depend on the contract and current law.',
            '## The most important thing: documentation',
            'Good records can help a professional assess the matter. Flowcent stores operational invoice and follow-up records, but it does not certify evidence, provide legal advice, or guarantee that a record will be admissible or sufficient.',
        ],
    },
    'gmail-automation-for-freelancers': {
        title: 'Gmail Automation for Freelancers: Use Consistent Follow-up Templates',
        date: 'Feb 10, 2026', readTime: '4 min read', category: 'Automation', categoryColor: '#f87171',
        author: 'Flowcent Team', authorRole: 'Product and Collections',
        image: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?auto=format&fit=crop&w=1200&q=80',
        excerpt: 'How to connect Gmail so enabled payment follow-ups can be sent from your own address.',
        content: [
            'The most powerful thing about Flowcent\'s Gmail integration is that follow-up emails go out from your real Gmail address — not from a generic "no-reply" system. Clients think you\'re personally following up. You\'re not.',
            '## Step 1: Connect your Gmail',
            'In Flowcent Settings, click "Connect Gmail." You\'ll be redirected to Google OAuth. Approve access for sending emails. That\'s it — takes under 30 seconds.',
            '## Step 2: Enable auto follow-up on an invoice',
            'When you create or edit an invoice on Pro, toggle "Auto Follow-up" on. Flowcent schedules the first stage after the due date and later stages at three-day intervals, all from your connected Gmail.',
            '## What the client receives',
            'From their perspective, they receive a professional email from your Gmail address. The email uses your name, references the invoice details, and may include a small Flowcent attribution in the footer.',
            '## Why this matters',
            'Sending from your connected Gmail keeps the sender identity familiar to the client. Flowcent does not claim a guaranteed improvement in open or response rates.',
            '## Privacy and security',
            'Flowcent requests Gmail send access and your Google account email. It does not request inbox-read access. You can disconnect from Settings or revoke access directly in your Google account.',
        ],
    },
    'payment-intent-score-guide': {
        title: 'Payment Intent Score: What the Number Means and How to Use It',
        date: 'Feb 8, 2026', readTime: '5 min read', category: 'AI Features', categoryColor: '#a78bfa',
        author: 'Flowcent Team', authorRole: 'Product and Collections',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
        excerpt: 'The Payment Intent Score is a heuristic for prioritizing follow-up using records stored in Flowcent.',
        content: [
            'Every invoice in Flowcent has a 0–100 Payment Intent Score. It is a prioritization heuristic based on available records, not a probability or prediction that the client will pay.',
            '## How the score is calculated',
            'The score is a weighted combination of multiple signals: number of days overdue, follow-up stage reached, number of client responses, types of excuses detected, prior payment history with this client, and whether the client has made specific date commitments.',
            '## Score ranges and what they mean',
            'Higher scores indicate fewer negative signals in the current Flowcent record; lower scores indicate more overdue or escalation signals. Always review the invoice, any dispute, and the original client message before deciding the next step.',
            '## How to improve a low score',
            'A written commitment can make follow-up clearer. If a client says "will pay by Friday", paste the reply into Flowcent and link it to the invoice. The system can extract the date for review and keep the commitment with the payment history.',
            '## The portfolio view',
            'Flowcent shows a Payment Intent Score on each invoice. Use it as one triage signal alongside the due date, client communication, disputes, and your own judgment.',
        ],
    },
    // Legacy slugs (backward compatibility)
    'stop-chasing-payments': {
        title: 'Stop Chasing Payments: The Freelancer\'s Complete Guide',
        date: 'Feb 18, 2026', readTime: '8 min read', category: 'Getting Paid', categoryColor: '#6b96ff',
        author: 'Flowcent Team', authorRole: 'Product and Collections',
        image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
        excerpt: 'A structured system for tracking invoices and following up consistently.',
        content: [
            'If you\'re a freelancer in India, you already know the sinking feeling. The project is done. The client loved it. And then... silence on the payment front.',
            'This guide is the culmination of everything we learned building Flowcent — a payment collection tool for Indian freelancers.',
            '## The real cost of late payments',
            'Late payments consume time as well as cash flow. Track how much time you spend checking due dates, finding old messages, and sending reminders so you can decide what to automate.',
            '## The 5-Stage Follow-up System',
            'Stage 1 (Day 1): Friendly Reminder. Stage 2 (Day 5): Follow-up. Stage 3 (Day 10): Firmer reminder. Stage 4 (Day 20): Urgent notice — ask for specific date. Stage 5 (Day 30): Final notice. Most payments happen between Stage 1 and Stage 3.',
            '## The Payment History Principle',
            'Keeping payment replies and commitments linked to invoices gives you a clearer record for future follow-up. Review patterns as context, not as proof of intent or future behavior.',
        ],
    },
    'ai-excuse-detector': {
        title: 'How AI Detects Client Payment Excuses',
        date: 'Feb 14, 2026', readTime: '6 min read', category: 'AI & Tech', categoryColor: '#a78bfa',
        author: 'Flowcent Team', authorRole: 'Product and Collections',
        image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=1200&q=80',
        excerpt: 'How structured AI output can help review dates, disputes, and payment commitments in client messages.',
        content: [
            'A common collections problem is uncertainty: an overdue invoice may have a clear payment commitment, a genuine dispute, or only a vague reply. Keeping those signals with the invoice makes follow-up more consistent.',
            '## The 6 Types of Payment Responses',
            'Flowcent groups reply details into operational categories such as Date Commitment, Partial Payment, Process Delay, Vague Promise and Dispute. These categories help organize follow-up; they do not determine whether a client is trustworthy or predict payment.',
            '## The Payment Intent Score',
            'The analyzer can return a 0–100 heuristic signal based on specificity. Use it as a prompt for review, not as an automatic escalation rule or proof of intent.',
        ],
    },
    'invoice-tips-india': {
        title: '7 Invoice Best Practices Every Indian Freelancer Must Know',
        date: 'Feb 10, 2026', readTime: '5 min read', category: 'Tips', categoryColor: '#34d399',
        author: 'Flowcent Team', authorRole: 'Product and Collections',
        image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80',
        excerpt: 'Practical invoice details that reduce ambiguity for clients and make follow-up easier.',
        content: [
            'Invoice setup affects how easily a client can verify the work, due date, amount, and payment method.',
            '## 1. Always specify a payment due date',
            '"Net 30" can be misread if the starting date is unclear. Add a specific calendar due date so both parties can verify the deadline.',
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
                            Build a more consistent payment collection workflow with Flowcent.
                        </p>
                        <Link href="/signup" className="btn-primary px-8 py-3 inline-flex">
                            Get started free →
                        </Link>
                        <p className="text-xs text-white/25 mt-3">No credit card required · Free forever plan</p>
                    </div>
                </div>
            </section>

            <SiteFooter />
        </div>
    );
}
