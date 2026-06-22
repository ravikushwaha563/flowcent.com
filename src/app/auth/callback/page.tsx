'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';

export default function AuthCallbackPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [status, setStatus] = useState('Verifying authentication...');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Supabase handles the hash automatically, get the session
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                
                if (sessionError) throw sessionError;
                
                if (!session) {
                    throw new Error('No valid session found');
                }

                setStatus('Syncing account details...');

                // Send session token to our backend to generate our custom JWT
                const res = await fetch('/api/auth/oauth-sync', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        access_token: session.access_token,
                        refresh_token: session.refresh_token
                    }),
                });

                const data = await res.json();
                
                if (!res.ok) throw new Error(data.error || 'Failed to sync account');

                setStatus('Success! Redirecting...');
                
                // Login using our custom context (which stores the custom JWT)
                await login(data.token);
                router.push('/dashboard');
                
            } catch (err: any) {
                console.error('OAuth callback error:', err);
                setStatus(`Error: ${err.message}. Redirecting...`);
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
