'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import dynamic from 'next/dynamic';
import { Home, FileText, Users, Bot, Settings, LineChart, MessageCircle, UsersRound } from 'lucide-react';

const FlowcentLogo3D = dynamic(() => import('@/components/FlowcentLogo3D'), { ssr: false });

const NAV = [
    { href: '/dashboard', label: 'Overview', exact: true, icon: <Home size={18} strokeWidth={1.5} /> },
    { href: '/dashboard/invoices', label: 'Invoices', exact: false, icon: <FileText size={18} strokeWidth={1.5} /> },
    { href: '/dashboard/clients', label: 'Clients', exact: false, icon: <Users size={18} strokeWidth={1.5} /> },
    { href: '/dashboard/intelligence', label: 'AI Intelligence', exact: false, icon: <Bot size={18} strokeWidth={1.5} /> },
    { href: '/dashboard/settings', label: 'Settings', exact: false, icon: <Settings size={18} strokeWidth={1.5} /> },
];

const COMING_SOON_NAV = [
    { label: 'Reports', icon: <LineChart size={16} strokeWidth={1.5} /> },
    { label: 'WhatsApp', icon: <MessageCircle size={16} strokeWidth={1.5} /> },
    { label: 'Team', icon: <UsersRound size={16} strokeWidth={1.5} /> },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, token, isLoading, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!isLoading && !token) {
            router.push('/login');
        }
    }, [isLoading, token, router]);

    useEffect(() => { setSidebarOpen(false); }, [pathname]);

    const isActive = (item: typeof NAV[0]) =>
        item.exact ? pathname === item.href : pathname.startsWith(item.href);

    const Sidebar = () => (
        <nav className="flex flex-col h-full overflow-hidden">
            {/* Brand */}
            <div className="px-4 pt-5 pb-4 shrink-0">
                <Link href="/" className="flex items-center gap-2.5 group mb-1">
                    <img src="/logo.png" alt="Flowcent Logo" className="w-8 h-8 rounded-xl object-contain drop-shadow-md" />
                    <div>
                        <span className="font-bold text-[15px] tracking-tight text-white block leading-none">Flowcent</span>
                        <span className="text-[9px] text-white/25 font-medium tracking-wider block mt-0.5">DASHBOARD</span>
                    </div>
                    <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">v1.0</span>
                </Link>
            </div>

            {/* Divider */}
            <div className="mx-4 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)' }} />

            {/* Main nav */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5 scrollbar-hide">
                <p className="text-[10px] font-semibold text-white/20 uppercase tracking-widest px-2 mb-2">Main</p>
                {NAV.map((item) => {
                    const active = isActive(item);
                    return (
                        <Link key={item.href} href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative group
                                ${active
                                    ? 'bg-blue-500/10 text-white border border-blue-500/15'
                                    : 'text-white/40 hover:text-white/80 hover:bg-white/[0.04] border border-transparent'
                                }`}>
                            {active && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #6b96ff, #7c3aed)' }} />
                            )}
                            <span className={`shrink-0 transition-colors ${active ? 'text-blue-400' : 'text-white/30 group-hover:text-white/60'}`}>
                                {item.icon}
                            </span>
                            <span>{item.label}</span>
                            {active && (
                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
                            )}
                        </Link>
                    );
                })}

                {/* Coming soon nav section */}
                <div className="pt-4">
                    <p className="text-[10px] font-semibold text-white/20 uppercase tracking-widest px-2 mb-2">Coming Soon</p>
                    {COMING_SOON_NAV.map(item => (
                        <div key={item.label}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/20 cursor-not-allowed select-none group">
                            <span className="text-sm w-4 shrink-0">{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                            <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-md bg-white/5 text-white/25 border border-white/10 font-semibold">SOON</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Plan badge */}
            <div className="mx-3 mb-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-white/60">Free Plan</span>
                    <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-green-500/15 text-green-400 font-bold">ACTIVE</span>
                </div>
                <div className="w-full h-1 rounded-full bg-white/[0.05] overflow-hidden">
                    <div className="h-full rounded-full grad-brand" style={{ width: '40%' }} />
                </div>
                <p className="text-[10px] text-white/25 mt-1.5">2 / 5 invoices used</p>
                <Link href="/pricing">
                    <button className="mt-2.5 w-full py-1.5 rounded-lg grad-brand text-white text-[11px] font-semibold hover:opacity-90 transition-opacity">
                        Upgrade →
                    </button>
                </Link>
            </div>

            {/* User strip */}
            <div className="border-t border-white/[0.06] px-3 py-3 shrink-0">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg grad-brand flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {(user?.name || user?.email || 'U')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white truncate">{user?.name || 'My Account'}</p>
                        <p className="text-[10px] text-white/30 truncate">{user?.email}</p>
                    </div>
                    <button
                        onClick={() => { logout(); router.push('/login'); }}
                        className="text-white/25 hover:text-white/60 transition-colors p-1"
                        title="Sign out"
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M5 2H2.5A1.5 1.5 0 0 0 1 3.5v7A1.5 1.5 0 0 0 2.5 12H5M9.5 9.5 13 7l-3.5-2.5M5 7h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>
        </nav>
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#09090f] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 rounded-xl grad-brand animate-pulse" />
                    <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#09090f] text-white flex">

            {/* ── Desktop Sidebar ── */}
            <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-white/[0.06] fixed inset-y-0 left-0 z-30" style={{ background: 'linear-gradient(180deg, #09090f 0%, #0a0a13 100%)' }}>
                <Sidebar />
            </aside>

            {/* ── Mobile overlay sidebar ── */}
            {sidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
                    <aside className="relative z-10 w-60 border-r border-white/[0.06] flex flex-col" style={{ background: 'linear-gradient(180deg, #09090f 0%, #0a0a13 100%)' }}>
                        <Sidebar />
                    </aside>
                </div>
            )}

            {/* ── Main content area ── */}
            <main className="flex-1 lg:ml-60 flex flex-col min-h-screen">

                {/* Mobile topbar */}
                <header className="lg:hidden sticky top-0 z-20 flex items-center gap-3 px-4 h-14 border-b border-white/[0.06] bg-[#09090f]/95 backdrop-blur-xl">
                    <button onClick={() => setSidebarOpen(true)} className="text-white/50 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.06] transition-all">
                        <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
                            <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </button>
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Flowcent Logo" className="w-6 h-6 rounded-md object-contain drop-shadow-[0_0_8px_rgba(61,97,255,0.3)]" />
                        <span className="font-bold text-white text-sm">Flowcent</span>
                    </div>
                </header>

                <div className="flex-1 overflow-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
