'use client';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { useReveal } from '@/hooks/useReveal';
import Link from 'next/link';

const SECTIONS = [
    {
        id: 'information-we-collect',
        title: '1. Information We Collect',
        color: '#6b96ff',
        content: [
            {
                subtitle: 'Account Information',
                text: 'When you create a Flowcent account, we collect your name, email address, company name, and a hashed password. We never store your plain-text password.',
            },
            {
                subtitle: 'Invoice & Client Data',
                text: 'We store invoice details (client names, amounts, due dates, payment status) and client contact information (email addresses, phone numbers, company names) that you enter into the platform.',
            },
            {
                subtitle: 'Gmail Integration Data',
                text: 'When you connect Gmail via OAuth, we store your Gmail access and refresh tokens securely. We use these only to send follow-up emails on your behalf. We do not read your inbox or store email content.',
            },
            {
                subtitle: 'Usage & Analytics',
                text: 'We collect anonymised product usage data (feature interactions, page views) to improve the platform. This data is not sold to third parties.',
            },
        ],
    },
    {
        id: 'how-we-use-your-data',
        title: '2. How We Use Your Data',
        color: '#a78bfa',
        content: [
            {
                subtitle: 'Core Product Functionality',
                text: 'Your data is used exclusively to operate the Flowcent platform — tracking invoices, sending follow-up emails, calculating payment scores, and providing analytics.',
            },
            {
                subtitle: 'AI Features',
                text: 'Invoice and client reply data may be processed by Groq (LLaMA 3) AI to power the AI Excuse Memory™ and Payment Intent Score features. This processing happens in-flight; we do not permanently share your data with AI providers.',
            },
            {
                subtitle: 'Service Emails',
                text: 'We may send transactional emails (account verification, billing receipts, product updates). You can opt out of marketing emails at any time.',
            },
        ],
    },
    {
        id: 'data-storage-security',
        title: '3. Data Storage & Security',
        color: '#34d399',
        content: [
            {
                subtitle: 'Infrastructure',
                text: 'All data is stored on Supabase (PostgreSQL) with encryption at rest and in transit (TLS 1.2+). Servers are located in the EU West region.',
            },
            {
                subtitle: 'Authentication',
                text: 'Passwords are hashed using bcrypt with a salt factor of 12. JWT tokens are signed with RS256 and expire after 7 days.',
            },
            {
                subtitle: 'Access Controls',
                text: 'Your data is isolated at the database level using Row Level Security (RLS). Only your account can access your invoices and clients.',
            },
        ],
    },
    {
        id: 'data-sharing',
        title: '4. Data Sharing & Third Parties',
        color: '#fbbf24',
        content: [
            {
                subtitle: 'We Never Sell Your Data',
                text: 'We do not sell, rent, or trade your personal information to any third party, ever.',
            },
            {
                subtitle: 'Service Providers',
                text: 'We share data with our infrastructure providers (Supabase, Groq, Google Gmail API) only to the extent necessary to provide the service. Each provider is bound by a data processing agreement.',
            },
            {
                subtitle: 'Legal Requirements',
                text: 'We may disclose data when required by Indian law, a court order, or to protect the rights and safety of our users and the public.',
            },
        ],
    },
    {
        id: 'your-rights',
        title: '5. Your Rights',
        color: '#f87171',
        content: [
            {
                subtitle: 'Data Access & Export',
                text: 'You may request a full export of your data at any time by emailing theravission@gmail.com. We will provide a machine-readable export within 7 working days.',
            },
            {
                subtitle: 'Account Deletion',
                text: 'You may permanently delete your account and all associated data from your account settings. Data is purged from our systems within 30 days of deletion.',
            },
            {
                subtitle: 'Data Correction',
                text: 'If any personal data we hold is inaccurate, you may update it directly in your account settings or contact us.',
            },
        ],
    },
    {
        id: 'cookies',
        title: '6. Cookies',
        color: '#06b6d4',
        content: [
            {
                subtitle: 'Essential Cookies',
                text: 'We use only essential cookies for session authentication (JWT token storage in httpOnly cookies). We do not use tracking or advertising cookies.',
            },
        ],
    },
    {
        id: 'changes',
        title: '7. Changes to This Policy',
        color: '#a78bfa',
        content: [
            {
                subtitle: '',
                text: 'We may update this Privacy Policy periodically. Material changes will be notified to you via email at least 14 days before they take effect. Continued use of Flowcent after changes constitutes acceptance.',
            },
        ],
    },
];

export default function PrivacyPage() {
    useReveal();

    return (
        <div className="min-h-screen bg-[#09090f] text-white overflow-x-hidden">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="aurora-blob aurora-blob-blue w-[600px] h-[600px]"
                    style={{ top: '-100px', left: '20%', opacity: 0.15 }} />
                <div className="aurora-blob aurora-blob-purple w-[400px] h-[400px]"
                    style={{ bottom: '20%', right: '-5%', opacity: 0.12 }} />
                <div className="absolute inset-0 grid-bg opacity-15" />
            </div>

            <SiteNav />

            {/* Hero */}
            <section className="relative z-10 pt-32 pb-16 px-6 text-center">
                <div className="max-w-3xl mx-auto reveal-up">
                    <span className="text-xs font-semibold tracking-[0.2em] text-blue-400 uppercase mb-4 block">Legal</span>
                    <h1 className="text-4xl sm:text-5xl font-bold mb-5 tracking-tight">
                        Privacy <span className="grad-text">Policy</span>
                    </h1>
                    <p className="text-white/50 text-lg max-w-xl mx-auto">
                        We believe your data belongs to you. Here's exactly how we handle it.
                    </p>
                    <div className="flex items-center justify-center gap-3 mt-6 text-xs text-white/30">
                        <span>📅 Last updated: February 21, 2026</span>
                        <span>·</span>
                        <span>Effective from February 21, 2026</span>
                    </div>
                </div>
            </section>

            {/* Table of Contents */}
            <section className="relative z-10 px-6 pb-10 reveal-up reveal-delay-2">
                <div className="max-w-3xl mx-auto glass-card p-6 rounded-2xl">
                    <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4">Table of Contents</p>
                    <ol className="space-y-2">
                        {SECTIONS.map((s) => (
                            <li key={s.id}>
                                <a href={`#${s.id}`}
                                    className="text-sm text-white/50 hover:text-white transition-colors flex items-center gap-2">
                                    <span style={{ color: s.color }} className="text-xs">●</span>
                                    {s.title}
                                </a>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* Sections */}
            <section className="relative z-10 px-6 pb-20">
                <div className="max-w-3xl mx-auto space-y-8">
                    {SECTIONS.map((section, si) => (
                        <div key={section.id} id={section.id}
                            className={`reveal-up reveal-delay-${Math.min(si + 1, 6)}`}>
                            <div className="glass-card rounded-2xl p-8 border"
                                style={{ borderColor: `${section.color}20` }}>
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                                    <span className="w-2 h-6 rounded-full inline-block shrink-0"
                                        style={{ background: section.color }} />
                                    {section.title}
                                </h2>
                                <div className="space-y-5">
                                    {section.content.map((item, ci) => (
                                        <div key={ci}>
                                            {item.subtitle && (
                                                <h3 className="text-sm font-semibold text-white/80 mb-1.5"
                                                    style={{ color: `${section.color}cc` }}>
                                                    {item.subtitle}
                                                </h3>
                                            )}
                                            <p className="text-sm text-white/50 leading-relaxed">{item.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Contact */}
                    <div className="reveal-up glass-card rounded-2xl p-8 border border-blue-500/20 text-center">
                        <p className="text-white/50 text-sm mb-3">Questions about this policy?</p>
                        <a href="mailto:theravission@gmail.com"
                            className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                            theravission@gmail.com
                        </a>
                        <p className="text-xs text-white/25 mt-4">
                            Flowcent Technologies · India
                        </p>
                    </div>
                </div>
            </section>

            <SiteFooter />
        </div>
    );
}
