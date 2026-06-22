'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { useReveal } from '@/hooks/useReveal';

const POSTS = [
    {
        id: 1,
        slug: 'how-indian-freelancers-get-paid-faster',
        category: 'Collection Tips',
        categoryColor: '#6b96ff',
        title: 'How Indian Freelancers Cut Payment Time from 45 Days to 12',
        excerpt: 'The 5-stage follow-up system used by 500+ Indian freelancers to collect payments without damaging client relationships.',
        date: 'Feb 20, 2026',
        readTime: '8 min read',
        image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=700&q=75',
        imageAlt: 'Indian freelancer working on laptop tracking payments',
        featured: true,
    },
    {
        id: 2,
        slug: 'ai-excuse-memory-explained',
        category: 'AI Features',
        categoryColor: '#a78bfa',
        title: 'Inside AI Excuse Memory™: How It Detects Client Payment Patterns',
        excerpt: 'A technical and practical deep-dive into how Flowcent\'s AI reads client emails, extracts promises, and builds a payment intent profile.',
        date: 'Feb 18, 2026',
        readTime: '6 min read',
        image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=700&q=75',
        imageAlt: 'Abstract AI neural network visualization in purple',
        featured: false,
    },
    {
        id: 3,
        slug: 'invoice-templates-for-indian-freelancers',
        category: 'Templates',
        categoryColor: '#34d399',
        title: '5 Invoice Templates That Help Indian Freelancers Get Paid Faster',
        excerpt: 'The exact phrasing, tone, and structure of invoice emails and follow-ups that result in the fastest payment turnaround.',
        date: 'Feb 15, 2026',
        readTime: '5 min read',
        image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=700&q=75',
        imageAlt: 'Professional invoice documents spread on a desk',
        featured: false,
    },
    {
        id: 4,
        slug: 'legal-options-for-unpaid-invoices-india',
        category: 'Legal & Finance',
        categoryColor: '#fbbf24',
        title: 'Legal Options for Unpaid Invoices in India: What Freelancers Can Do',
        excerpt: 'From MSME payment act to consumer court — your real options when a client refuses to pay, explained without the legal jargon.',
        date: 'Feb 12, 2026',
        readTime: '10 min read',
        image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=700&q=75',
        imageAlt: 'Legal documents and gavel representing invoice dispute options',
        featured: false,
    },
    {
        id: 5,
        slug: 'gmail-automation-for-freelancers',
        category: 'Automation',
        categoryColor: '#f87171',
        title: 'Gmail Automation for Freelancers: Send Follow-ups You\'ll Never Have to Write',
        excerpt: 'How to set up Gmail OAuth with Flowcent so all your payment follow-ups go out from your real email automatically.',
        date: 'Feb 10, 2026',
        readTime: '4 min read',
        image: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?auto=format&fit=crop&w=700&q=75',
        imageAlt: 'Gmail open on laptop with email compose window visible',
        featured: false,
    },
    {
        id: 6,
        slug: 'payment-intent-score-guide',
        category: 'AI Features',
        categoryColor: '#a78bfa',
        title: 'Payment Intent Score: What the Number Means and How to Use It',
        excerpt: 'Understanding Flowcent\'s 0–100 payment likelihood score — the four signals it uses, the color coding, and when to escalate manually.',
        date: 'Feb 8, 2026',
        readTime: '5 min read',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=700&q=75',
        imageAlt: 'Analytics dashboard with charts and prediction scores',
        featured: false,
    },
];

const CATEGORIES = ['All', 'AI Features', 'Collection Tips', 'Templates', 'Legal & Finance', 'Automation'];

export default function BlogPage() {
    useReveal();
    const [activeCategory, setActiveCategory] = useState('All');
    const filtered = activeCategory === 'All' ? POSTS : POSTS.filter(p => p.category === activeCategory);
    const featured = filtered.find(p => p.featured) || filtered[0];
    const rest = filtered.filter(p => p.id !== featured?.id);

    return (
        <div className="min-h-screen bg-[#09090f] text-white overflow-x-hidden">

            {/* ── Background ── */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="aurora-blob aurora-blob-purple w-[600px] h-[600px]"
                    style={{ top: '-60px', right: '10%', opacity: 0.25 }} />
                <div className="aurora-blob aurora-blob-blue w-[400px] h-[400px]"
                    style={{ bottom: '20%', left: '-5%', opacity: 0.18 }} />
                <div className="absolute inset-0 grid-bg opacity-20" />
            </div>

            <SiteNav activePage="blog" />

            {/* ── Hero ── */}
            <section className="relative z-10 pt-32 pb-14 px-6">
                <div className="max-w-7xl mx-auto text-center reveal-up">
                    <span className="text-xs font-semibold tracking-[0.2em] text-purple-400 uppercase mb-5 block">Flowcent Blog</span>
                    <h1 className="text-5xl sm:text-6xl font-bold mb-5 tracking-tight">
                        Tips, guides &amp; <span className="grad-text">insights</span>
                    </h1>
                    <p className="text-white/50 text-xl max-w-2xl mx-auto mb-10">
                        Everything we know about getting paid faster as a freelancer in India.
                    </p>

                    {/* Category filter */}
                    <div className="flex flex-wrap justify-center gap-2 reveal-fade reveal-delay-2">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`text-xs px-4 py-2 rounded-full border transition-all font-medium ${activeCategory === cat
                                    ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                                    : 'border-white/[0.08] text-white/40 hover:text-white hover:border-white/20'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Featured Post ── */}
            {featured && (
                <section className="relative z-10 px-6 pb-12">
                    <div className="max-w-7xl mx-auto reveal-up">
                        <Link href={`/blog/${featured.slug}`}>
                            <div className="feature-card glass-card overflow-hidden cursor-pointer group"
                                style={{ borderColor: `${featured.categoryColor}20` }}>
                                <div className="grid lg:grid-cols-2">
                                    <div className="relative h-64 lg:h-auto overflow-hidden">
                                        <Image src={featured.image} alt={featured.imageAlt}
                                            fill
                                            priority
                                            sizes="(max-width: 1024px) 100vw, 50vw"
                                            className="feature-card-img object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#09090f]/30" />
                                        <div className="absolute top-4 left-4">
                                            <span className="text-xs px-3 py-1 rounded-full font-semibold"
                                                style={{ color: featured.categoryColor, background: `${featured.categoryColor}15`, border: `1px solid ${featured.categoryColor}30` }}>
                                                ⭐ Featured · {featured.category}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-10 flex flex-col justify-center">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors duration-200 leading-snug">
                                            {featured.title}
                                        </h2>
                                        <p className="text-white/50 leading-relaxed mb-6">{featured.excerpt}</p>
                                        <div className="flex items-center gap-4 text-xs text-white/30">
                                            <span>📅 {featured.date}</span>
                                            <span>⏱️ {featured.readTime}</span>
                                        </div>
                                        <div className="mt-6">
                                            <span className="text-sm font-semibold text-blue-400">Read article →</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                </section>
            )}

            {/* ── Post Grid ── */}
            {rest.length > 0 && (
                <section className="relative z-10 px-6 pb-16">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {rest.map((post, i) => (
                                <Link key={post.id} href={`/blog/${post.slug}`}>
                                    <div
                                        className={`feature-card glass-card overflow-hidden cursor-pointer group h-full reveal-up reveal-delay-${Math.min(i + 1, 6)}`}
                                        style={{ borderColor: `${post.categoryColor}15` }}>
                                        {/* Image */}
                                        <div className="relative h-44 overflow-hidden">
                                            <Image src={post.image} alt={post.imageAlt}
                                                fill
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                className="feature-card-img object-cover" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#09090f] via-[#09090f]/20 to-transparent" />
                                            <div className="absolute top-3 left-3">
                                                <span className="text-[10px] px-2.5 py-1 rounded-full font-semibold"
                                                    style={{ color: post.categoryColor, background: `${post.categoryColor}15`, border: `1px solid ${post.categoryColor}25` }}>
                                                    {post.category}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-6">
                                            <h3 className="font-bold text-white leading-snug mb-3 group-hover:text-blue-300 transition-colors duration-200">
                                                {post.title}
                                            </h3>
                                            <p className="text-sm text-white/40 leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
                                            <div className="flex items-center justify-between text-[10px] text-white/25">
                                                <span>{post.date}</span>
                                                <span>{post.readTime}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── Newsletter ── */}
            <section className="relative z-10 py-12 px-6 pb-24">
                <div className="max-w-3xl mx-auto reveal-up">
                    <div className="relative rounded-3xl overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=70"
                            alt="Developer working"
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover opacity-15" />
                        <div className="relative border-glow-card glass-card p-12 text-center" style={{ borderColor: 'rgba(167,139,250,0.2)' }}>
                            <h2 className="text-2xl font-bold mb-3">Get articles in your inbox</h2>
                            <p className="text-white/45 mb-7 max-w-sm mx-auto">New articles on freelance payments, AI, and collections. No spam — 1 email per week max.</p>
                            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                                <input type="email" placeholder="your@email.com"
                                    className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-purple-500/40 focus:bg-white/[0.07] transition-colors duration-200" />
                                <button className="btn-primary px-6 py-3 whitespace-nowrap">Subscribe →</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <SiteFooter />
        </div>
    );
}
