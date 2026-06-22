import Link from 'next/link';
import Image from 'next/image';

export default function SiteFooter() {
    const cols = [
        {
            title: 'Product',
            links: [
                { label: 'Features', href: '/features' },
                { label: 'Solutions', href: '/solutions' },
                { label: 'Pricing', href: '/pricing' },
                { label: 'Changelog', href: '/changelog' },
            ],
        },
        {
            title: 'Solutions',
            links: [
                { label: 'For Freelancers', href: '/solutions/freelancers' },
                { label: 'For Agencies', href: '/solutions/agencies' },
                { label: 'For Designers', href: '/solutions/designers' },
                { label: 'For Developers', href: '/solutions/developers' },
            ],
        },
        {
            title: 'Resources',
            links: [
                { label: 'Blog', href: '/blog' },
                { label: 'About Us', href: '/about' },
                { label: 'Contact', href: '/contact' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms & Conditions', href: '/terms' },
            ],
        },
    ];

    return (
        <footer className="relative z-10 border-t border-white/[0.06] pt-14 pb-8 px-6 bg-[#09090f]">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 mb-12">
                    {/* Brand */}
                    <div className="col-span-2 sm:col-span-1">
                        <Link href="/" className="flex items-center gap-2.5 mb-4">
                            <Image src="/logo.png" alt="Flowcent Logo" width={32} height={32} className="w-8 h-8 rounded-xl object-contain drop-shadow-md" />
                            <span className="font-bold text-lg text-white">Flowcent</span>
                        </Link>
                        <p className="text-sm text-white/30 leading-relaxed mb-5">
                            AI-powered payment collection for Indian freelancers & agencies.
                        </p>
                        <div className="flex gap-2.5">
                            {[
                                { icon: '𝕏', label: 'Twitter / X', href: 'https://twitter.com/flowcentin' },
                                { icon: 'in', label: 'LinkedIn', href: 'https://linkedin.com/company/flowcent' },
                            ].map(s => (
                                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                                    className="w-8 h-8 rounded-lg border border-white/[0.08] flex items-center justify-center text-white/35 hover:text-white hover:border-white/20 transition-all text-xs font-bold">
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Columns */}
                    {cols.map(col => (
                        <div key={col.title}>
                            <h4 className="text-xs font-semibold text-white/50 uppercase tracking-[0.15em] mb-4">{col.title}</h4>
                            <ul className="space-y-2.5">
                                {col.links.map(l => (
                                    <li key={l.label}>
                                        <Link href={l.href} className="text-sm text-white/30 hover:text-white/70 transition-colors">{l.label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="border-t border-white/[0.05] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/20">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <span>© 2026 Flowcent · Built in India</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/privacy" className="hover:text-white/45 transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-white/45 transition-colors">Terms</Link>
                        <Link href="/contact" className="hover:text-white/45 transition-colors">Contact</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
