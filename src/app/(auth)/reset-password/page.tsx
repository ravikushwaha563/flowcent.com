'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/errors';

export default function ResetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (password !== confirmation) return toast.error('Passwords do not match');
        setLoading(true);
        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Unable to update password');
            toast.success(data.message);
            router.replace('/login');
        } catch (error) {
            toast.error(getErrorMessage(error, 'Unable to update password'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-7">
            <div>
                <h1 className="text-2xl font-bold text-white">Choose a new password</h1>
                <p className="text-white/40 text-sm mt-1">Use at least 8 characters.</p>
            </div>
            <form onSubmit={submit} className="space-y-4">
                <input type="password" required minLength={8} maxLength={72} value={password}
                    onChange={event => setPassword(event.target.value)} className="input-premium" placeholder="New password" autoComplete="new-password" />
                <input type="password" required minLength={8} maxLength={72} value={confirmation}
                    onChange={event => setConfirmation(event.target.value)} className="input-premium" placeholder="Confirm password" autoComplete="new-password" />
                <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-50">
                    {loading ? 'Updating...' : 'Update password'}
                </button>
            </form>
        </div>
    );
}
