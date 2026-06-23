'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/errors';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Unable to request reset link');
            setSent(true);
        } catch (error) {
            toast.error(getErrorMessage(error, 'Unable to request reset link'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-7">
            <div>
                <h1 className="text-2xl font-bold text-white">Reset your password</h1>
                <p className="text-white/40 text-sm mt-1">We will email a secure recovery link.</p>
            </div>
            {sent ? (
                <div className="glass-card p-5 text-sm text-white/60">
                    If an account exists for <span className="text-white">{email}</span>, the reset link is on its way.
                </div>
            ) : (
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label htmlFor="forgot-email" className="text-xs font-semibold text-white/40 uppercase tracking-widest">Email</label>
                        <input id="forgot-email" type="email" required value={email} onChange={event => setEmail(event.target.value)}
                            className="input-premium" placeholder="you@company.com" autoComplete="email" />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-50">
                        {loading ? 'Sending...' : 'Send reset link'}
                    </button>
                </form>
            )}
            <Link href="/login" className="block text-center text-sm text-blue-400 hover:text-blue-300">Back to sign in</Link>
        </div>
    );
}
