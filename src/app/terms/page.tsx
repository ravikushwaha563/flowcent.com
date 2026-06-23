'use client';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { useReveal } from '@/hooks/useReveal';

const SECTIONS = [
    {
        id: 'acceptance',
        title: '1. Acceptance of Terms',
        color: '#6b96ff',
        content: [
            {
                subtitle: '',
                text: 'By creating an account or using Flowcent (the "Service"), you agree to be bound by these Terms & Conditions ("Terms"). If you do not agree, do not use the Service. These Terms apply to all Free and Pro users.',
            },
        ],
    },
    {
        id: 'service-description',
        title: '2. Description of Service',
        color: '#a78bfa',
        content: [
            {
                subtitle: '',
                text: 'Flowcent is a SaaS platform that provides invoice tracking, AI-assisted payment reply analysis, automated follow-up email scheduling via Gmail, and collection reporting. We provide tools to help you manage receivables; we do not act as a payment processor, financial institution, credit bureau, or legal adviser.',
            },
        ],
    },
    {
        id: 'account-responsibilities',
        title: '3. Account & User Responsibilities',
        color: '#34d399',
        content: [
            {
                subtitle: 'Account Security',
                text: 'You are responsible for maintaining the confidentiality of your login credentials. You must notify us immediately at theravission@gmail.com if you suspect unauthorised access to your account.',
            },
            {
                subtitle: 'Accurate Information',
                text: 'You agree to provide accurate, current, and complete information when creating your account. False or misleading information may result in account suspension.',
            },
            {
                subtitle: 'Appropriate Use',
                text: 'You agree not to use Flowcent to send harassing, threatening, or illegal communications to your clients. Follow-up emails must be professional and used only for legitimate payment collection purposes.',
            },
        ],
    },
    {
        id: 'gmail-integration',
        title: '4. Gmail Integration & Email Sending',
        color: '#fbbf24',
        content: [
            {
                subtitle: 'Your Authorisation',
                text: 'By connecting your Gmail account, you authorise Flowcent to send emails on your behalf using the Gmail API. You can revoke this authorisation at any time from your account settings or from your Google account\'s security settings.',
            },
            {
                subtitle: 'Email Content',
                text: 'You are solely responsible for the content and appropriateness of follow-up emails sent through Flowcent. Flowcent provides templates; you may customise them. Do not use the Service to send spam or unsolicited commercial email.',
            },
        ],
    },
    {
        id: 'payment-plans',
        title: '5. Billing & Payment Plans',
        color: '#f87171',
        content: [
            {
                subtitle: 'Free Plan',
                text: 'The Free plan is provided at no charge and may be subject to feature limits as described on the Pricing page.',
            },
            {
                subtitle: 'Paid Plans',
                text: 'The Pro plan is billed monthly or annually as selected. Prices and any applicable taxes are shown before checkout. Payments are processed by the displayed payment provider; Flowcent does not store full card or bank credentials on its servers.',
            },
            {
                subtitle: 'Cancellation & Refunds',
                text: 'You may cancel your subscription at any time. Your subscription remains active until the end of the current billing period. We do not offer pro-rata refunds for mid-period cancellations, except where required by Indian consumer law.',
            },
            {
                subtitle: 'Plan Changes',
                text: 'Upgrades take effect immediately. Downgrades take effect at the end of the current billing period.',
            },
        ],
    },
    {
        id: 'intellectual-property',
        title: '6. Intellectual Property',
        color: '#06b6d4',
        content: [
            {
                subtitle: 'Our Property',
                text: 'All elements of the Flowcent platform — including software, AI-assisted workflows, design, text, and branding — are owned by or licensed to Flowcent and are protected by applicable intellectual property laws.',
            },
            {
                subtitle: 'Your Data',
                text: 'You retain all ownership of your data (invoices, client information, emails). You grant Flowcent a limited, revocable licence to process your data solely to provide the Service.',
            },
        ],
    },
    {
        id: 'limitation-of-liability',
        title: '7. Limitation of Liability',
        color: '#a78bfa',
        content: [
            {
                subtitle: '',
                text: 'Flowcent is a tool to assist with payment collection — we do not guarantee that using our platform will result in payment from your clients. To the maximum extent permitted by law, Flowcent\'s total liability for any claim arising out of or related to these Terms shall not exceed the amount you paid us in the 3 months preceding the claim. We are not liable for indirect, consequential, or incidental damages.',
            },
        ],
    },
    {
        id: 'termination',
        title: '8. Termination',
        color: '#f87171',
        content: [
            {
                subtitle: '',
                text: 'We reserve the right to suspend or terminate your account if you violate these Terms, engage in fraudulent activity, or misuse the Service. You may delete your account at any time, which will terminate these Terms except for provisions that survive by their nature (IP, limitation of liability).',
            },
        ],
    },
    {
        id: 'governing-law',
        title: '9. Governing Law & Disputes',
        color: '#34d399',
        content: [
            {
                subtitle: '',
                text: 'These Terms are governed by the laws of India. Any disputes arising from these Terms shall first be attempted to be resolved through good-faith negotiation. If unresolved, disputes shall be subject to the exclusive jurisdiction of the courts of Mumbai, Maharashtra, India.',
            },
        ],
    },
    {
        id: 'changes-to-terms',
        title: '10. Changes to These Terms',
        color: '#6b96ff',
        content: [
            {
                subtitle: '',
                text: 'We may update these Terms from time to time. The effective date and revised text will be published on this page, and material changes may also be communicated through the Service or email. Continued use after changes take effect constitutes acceptance of the revised Terms.',
            },
        ],
    },
];

export default function TermsPage() {
    useReveal();

    return (
        <div className="min-h-screen bg-[#09090f] text-white overflow-x-hidden">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="aurora-blob aurora-blob-purple w-[600px] h-[600px]"
                    style={{ top: '-80px', right: '20%', opacity: 0.15 }} />
                <div className="aurora-blob aurora-blob-blue w-[400px] h-[400px]"
                    style={{ bottom: '20%', left: '-5%', opacity: 0.12 }} />
                <div className="absolute inset-0 grid-bg opacity-15" />
            </div>

            <SiteNav />

            {/* Hero */}
            <section className="relative z-10 pt-32 pb-16 px-6 text-center">
                <div className="max-w-3xl mx-auto reveal-up">
                    <span className="text-xs font-semibold tracking-[0.2em] text-purple-400 uppercase mb-4 block">Legal</span>
                    <h1 className="text-4xl sm:text-5xl font-bold mb-5 tracking-tight">
                        Terms & <span className="grad-text">Conditions</span>
                    </h1>
                    <p className="text-white/50 text-lg max-w-xl mx-auto">
                        Please read these terms carefully before using Flowcent.
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
                    <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4">Quick Navigation</p>
                    <ol className="grid sm:grid-cols-2 gap-2">
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
                <div className="max-w-3xl mx-auto space-y-6">
                    {SECTIONS.map((section, si) => (
                        <div key={section.id} id={section.id}
                            className={`reveal-up reveal-delay-${Math.min(si + 1, 6)}`}>
                            <div className="glass-card rounded-2xl p-8 border"
                                style={{ borderColor: `${section.color}20` }}>
                                <h2 className="text-xl font-bold mb-5 flex items-center gap-3">
                                    <span className="w-2 h-6 rounded-full inline-block shrink-0"
                                        style={{ background: section.color }} />
                                    {section.title}
                                </h2>
                                <div className="space-y-5">
                                    {section.content.map((item, ci) => (
                                        <div key={ci}>
                                            {item.subtitle && (
                                                <h3 className="text-sm font-semibold mb-1.5"
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
                    <div className="reveal-up glass-card rounded-2xl p-8 border border-purple-500/20 text-center">
                        <p className="text-white/50 text-sm mb-3">Questions about these Terms?</p>
                        <a href="mailto:theravission@gmail.com"
                            className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
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
