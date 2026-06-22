'use client';
import { useEffect } from 'react';

/**
 * Shared scroll-reveal hook.
 * Finds all .reveal-* elements and adds .visible when they enter the viewport.
 * Safe to use in 'use client' components — runs after client mount.
 */
export function useReveal() {
    useEffect(() => {
        const sel = '.reveal-up,.reveal-left,.reveal-right,.reveal-scale,.reveal-fade';
        const els = document.querySelectorAll<Element>(sel);
        if (!els.length) return;

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach(e => {
                    if (e.isIntersecting) {
                        e.target.classList.add('visible');
                        io.unobserve(e.target);
                    }
                });
            },
            { threshold: 0.07, rootMargin: '0px 0px -24px 0px' }
        );

        els.forEach(el => io.observe(el));
        return () => io.disconnect();
    }, []);
}
