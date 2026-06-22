'use client';
import { useState, useEffect } from 'react';

export default function ScrollToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 400);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const scrollUp = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    if (!visible) return null;

    return (
        <button
            onClick={scrollUp}
            aria-label="Back to top"
            className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-xl border border-white/[0.12] bg-[#09090f]/80 backdrop-blur-lg flex items-center justify-center text-white/50 hover:text-white hover:border-white/25 hover:bg-white/[0.08] transition-all duration-200 shadow-lg"
            style={{ animation: 'revealUp 0.25s cubic-bezier(0.22,1,0.36,1) both' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 11V3M3 7l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </button>
    );
}
