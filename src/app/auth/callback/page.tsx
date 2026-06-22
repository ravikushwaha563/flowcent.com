'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export default function AuthCallbackPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [status, setStatus] = useState('Verifying authentication...');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const code = new URLSearchParams(window.location.search).get('code');
                const requestedNext = new URLSearchParams(window.location.search).get('next');
                const nextPath = requestedNext === '/reset-password' ? requestedNext : '/dashboard';
                if (!code) throw new Error('No authorization code received');

                setStatus('Syncing account details...');

                const res = await fetch('/api/auth/oauth-sync', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ code }),
                });

                const data = await res.json();
                
                if (!res.ok) throw new Error(data.error || 'Failed to sync account');

                setStatus('Success! Redirecting...');
                
                await login();
                router.replace(nextPath);
                
            } catch (err: unknown) {
                console.error('OAuth callback error:', err);
                const message = err instanceof Error ? err.message : 'Authentication failed';
                setStatus(`Error: ${message}. Redirecting...`);
                setTimeout(() => router.push('/login'), 3000);
            }
        };

        handleCallback();
    }, [router, login]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-white/60 text-sm font-medium animate-pulse">{status}</p>
            </div>
        </div>
    );
}
