import Link from 'next/link';
import Image from 'next/image';
import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-[#09090f] flex relative overflow-hidden text-white">
            {/* Left Panel - Branding & Testimonial */}
            <div className="hidden lg:flex lg:w-[45%] relative flex-col overflow-hidden border-r border-white/[0.06]">
                {/* Background effects */}
                <div className="absolute inset-0 bg-[#0c0c14] z-0" />
                <div className="absolute inset-0 dot-grid opacity-30 z-0" />
                <div className="aurora-blob aurora-blob-blue absolute -top-[20%] -left-[10%] w-[600px] h-[600px] opacity-40 mix-blend-screen z-0" />
                <div className="aurora-blob aurora-blob-purple absolute -bottom-[10%] -right-[10%] w-[500px] h-[500px] opacity-30 mix-blend-screen z-0" />

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full p-12 justify-between">
                    {/* Logo Area */}
                    <Link href="/" className="flex items-center gap-2.5 group w-fit">
                        <Image src="/logo.png" alt="Flowcent Logo" width={36} height={36} className="w-9 h-9 rounded-xl object-contain drop-shadow-[0_0_12px_rgba(61,97,255,0.4)]" />
                        <span className="font-bold text-xl tracking-tight text-white group-hover:text-white/80 transition-colors">Flowcent</span>
                    </Link>

                    {/* Headline */}
                    <div className="space-y-10 my-auto">
                        <div style={{ animation: 'revealUp 0.6s cubic-bezier(0.22,1,0.36,1) 0ms both' }}>
                            <h2 className="text-[2.75rem] font-bold text-white leading-[1.1] tracking-tight">
                                Automate your<br />
                                <span className="text-white/40">payment pipeline.</span>
                            </h2>
                            <p className="text-white/50 border-l-2 border-white/10 pl-4 mt-6 text-base leading-relaxed max-w-sm">
                                Track invoices, analyze client replies, and run a consistent follow-up process from one workspace.
                            </p>
                            <div className="flex items-center gap-3 mt-6">
                                <div className="flex -space-x-2">
                                    <div className="w-8 h-8 rounded-full border-2 border-[#09090f] bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[10px] font-bold">PT</div>
                                    <div className="w-8 h-8 rounded-full border-2 border-[#09090f] bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-[10px] font-bold">AK</div>
                                    <div className="w-8 h-8 rounded-full border-2 border-[#09090f] bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-[10px] font-bold">SR</div>
                                </div>
                                <span className="text-xs text-white/30 font-medium">Free to start · no credit card</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer text */}
                    <div className="text-xs text-white/20 font-medium">
                        © 2026 Flowcent Technologies. Made in India.
                    </div>
                </div>
            </div>

            {/* Right Panel - Auth Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
                {/* Subtle bg glow for right panel */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

                {/* Mobile Header Logo */}
                <div className="absolute top-8 left-6 sm:left-10 flex items-center gap-2.5 lg:hidden z-20">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/logo.png" alt="Flowcent Logo" width={32} height={32} className="w-8 h-8 rounded-xl object-contain drop-shadow-md" />
                        <span className="font-bold text-white tracking-tight">Flowcent</span>
                    </Link>
                </div>

                <div className="w-full max-w-[400px] relative z-10" style={{ animation: 'revealUp 0.6s cubic-bezier(0.22,1,0.36,1) 100ms both' }}>
                    {children}
                </div>
            </div>
        </div>
    );
}
