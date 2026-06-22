'use client';
import Link from 'next/link';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        console.error('App error:', error);
    }, [error]);

    return (
        <html lang="en">
            <body style={{ background: '#09090f', color: 'white', fontFamily: 'system-ui, sans-serif', margin: 0 }}>
                <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                    <div style={{ textAlign: 'center', maxWidth: '480px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Something went wrong</h1>
                        <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '32px', lineHeight: 1.6 }}>
                            An unexpected error occurred. This has been logged and we'll look into it.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button
                                onClick={reset}
                                style={{ background: 'linear-gradient(135deg, #3d61ff, #7c3aed)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
                                Try again
                            </button>
                            <a href="/"
                                style={{ background: 'rgba(255,255,255,0.06)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
                                Go home
                            </a>
                        </div>
                        {error.digest && (
                            <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: '11px', marginTop: '24px', fontFamily: 'monospace' }}>
                                Error ID: {error.digest}
                            </p>
                        )}
                    </div>
                </div>
            </body>
        </html>
    );
}
