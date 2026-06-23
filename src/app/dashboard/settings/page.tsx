'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useSearchParams, useRouter } from 'next/navigation';
import { User, Mail, CheckCircle2, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/errors';

interface UserProfile {
    name: string; email: string; company_name: string;
    gmail_connected: boolean; gmail_email?: string;
}

function ProfileEditForm({ profile, onSaved }: {
    profile: UserProfile | null;
    onSaved: (updated: Partial<UserProfile>) => void;
}) {
    const [name, setName] = useState(profile?.name || '');
    const [company, setCompany] = useState(profile?.company_name || '');
    const [saving, setSaving] = useState(false);

    // Sync when profile loads
    useEffect(() => {
        if (profile) { setName(profile.name || ''); setCompany(profile.company_name || ''); }
    }, [profile]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, company_name: company }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Save failed');
            onSaved({ name, company_name: company });
            toast.success('Profile updated successfully');
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, 'Failed to securely save profile'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-3 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="text-xs font-semibold text-white/30 uppercase tracking-widest">Edit Profile</p>
            <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <label htmlFor="profile-name" className="text-xs font-semibold text-white/35 uppercase tracking-widest">Full Name</label>
                    <input id="profile-name" className="input-premium" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
                </div>
                <div className="space-y-1.5">
                    <label htmlFor="profile-company" className="text-xs font-semibold text-white/35 uppercase tracking-widest">Company / Studio</label>
                    <input id="profile-company" className="input-premium" value={company} onChange={e => setCompany(e.target.value)} placeholder="Optional" />
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button onClick={handleSave} disabled={saving} className="btn-primary text-xs px-5 py-2">
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
}


export default function SettingsPage() {
    const { user, isAuthenticated } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [gmailConnecting, setGmailConnecting] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [deleting, setDeleting] = useState(false);

    // Handle redirect from Gmail OAuth
    useEffect(() => {
        const gmail = searchParams.get('gmail');
        if (gmail) {
            if (gmail === 'connected') toast.success('Gmail connected successfully!');
            else if (gmail === 'denied') toast.error('Gmail connection was denied.');
            else if (gmail === 'error') toast.error('Failed to connect Gmail. Try again.');
            router.replace('/dashboard/settings');
        }
    }, [searchParams, router]);

    useEffect(() => {
        if (!isAuthenticated) return;
        fetch('/api/user/profile')
            .then(r => r.json())
            .then(d => { setProfile(d.user); setLoading(false); })
            .catch(() => setLoading(false));
    }, [isAuthenticated]);

    const connectGmail = async () => {
        setGmailConnecting(true);
        try {
            const res = await fetch('/api/auth/gmail');
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || 'Failed to get Gmail auth URL');
                return;
            }
            window.location.href = data.authUrl;
        } catch {
            toast.error('Network error. Failed to initiate connection.');
        } finally {
            setGmailConnecting(false);
        }
    };

    const disconnectGmail = async () => {
        try {
            const response = await fetch('/api/auth/gmail', { method: 'DELETE' });
            if (!response.ok) throw new Error('Disconnect failed');
            setProfile(p => p ? { ...p, gmail_connected: false, gmail_email: undefined } : p);
            toast.success('Gmail disconnected.');
        } catch {
            toast.error('Failed to disconnect Gmail.');
        }
    };

    const deleteAccount = async () => {
        if (!user?.email || deleteConfirmation.toLowerCase() !== user.email.toLowerCase()) {
            toast.error('Enter your account email exactly to confirm deletion.');
            return;
        }
        setDeleting(true);
        try {
            const response = await fetch('/api/user/account', {
                method: 'DELETE', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ confirmation: deleteConfirmation }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Account deletion failed');
            window.location.assign('/');
        } catch (error) {
            toast.error(getErrorMessage(error, 'Account deletion failed'));
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-8 anim-fade max-w-2xl">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
                <p className="text-sm text-white/35 mt-1">Manage your account and integrations</p>
            </div>

            {/* Header */}
            <div className="glass-card p-6 space-y-5">
                <h2 className="font-semibold text-white text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-blue-500/15 flex items-center justify-center text-blue-400">
                        <User size={12} />
                    </span>
                    Account
                </h2>
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl grad-brand flex items-center justify-center text-white font-bold text-xl">
                        {(user?.name || user?.email || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                        <p className="font-semibold text-white">{loading ? '—' : profile?.name || 'Not set'}</p>
                        <p className="text-sm text-white/40">{user?.email}</p>
                        {profile?.company_name && <p className="text-xs text-white/30 mt-0.5">{profile.company_name}</p>}
                    </div>
                </div>

                {/* Editable fields */}
                <ProfileEditForm profile={profile} onSaved={(updated) => setProfile(p => p ? { ...p, ...updated } : p)} />
            </div>

            {/* Gmail Integration Card */}
            <div className="glass-card p-6 space-y-5">
                <h2 className="font-semibold text-white text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-red-500/15 flex items-center justify-center text-red-400">
                        <Mail size={12} />
                    </span>
                    Gmail Integration
                </h2>

                {loading ? (
                    <div className="skeleton h-16 rounded-xl"></div>
                ) : profile?.gmail_connected ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)' }}>
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-green-400" style={{ background: 'rgba(52,211,153,0.1)' }}>
                                <CheckCircle2 size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-green-400">Gmail Connected</p>
                                <p className="text-xs text-white/40 mt-0.5">{profile.gmail_email || 'Email address not available'}</p>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm text-white/50">
                            <p>✓ Send follow-up emails directly from your Gmail</p>
                            <p>✓ Branded payment reminder templates</p>
                            <p>✓ 5-stage automated follow-up sequences</p>
                        </div>
                        <button onClick={disconnectGmail} className="btn-outline text-xs px-4 py-2 text-red-400" style={{ borderColor: 'rgba(248,113,113,0.2)' }}>
                            Disconnect Gmail
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl space-y-2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <p className="text-sm text-white/60">Connect your Gmail account to:</p>
                            <div className="space-y-1.5">
                                {[
                                    'Send follow-up emails from your own Gmail',
                                    'Use professional branded email templates',
                                    '5-stage automated payment reminders',
                                    'Disconnect access at any time',
                                ].map(f => (
                                    <p key={f} className="text-xs text-white/40 flex items-center gap-2">
                                        <span className="text-blue-400">→</span> {f}
                                    </p>
                                ))}
                            </div>
                        </div>

                        <button onClick={connectGmail} disabled={gmailConnecting} className="btn-primary text-sm px-5 py-2.5 flex items-center gap-2">
                            {gmailConnecting ? (
                                <><span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span> Connecting...</>
                            ) : (
                                <><Mail size={16} /> Connect Gmail</>
                            )}
                        </button>
                    </div>
                )}
            </div>

            <div className="glass-card p-6 space-y-5">
                <h2 className="font-semibold text-white text-sm">Data & Account</h2>
                <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
                    <div>
                        <p className="text-sm text-white/70">Export account data</p>
                        <p className="text-xs text-white/30 mt-1">Download your profile, clients, invoices, promises, follow-ups and billing records.</p>
                    </div>
                    <a href="/api/user/export" className="btn-outline p-2.5" title="Download account data" aria-label="Download account data">
                        <Download size={16} />
                    </a>
                </div>
                <div className="space-y-3">
                    <div>
                        <p className="text-sm text-red-400">Delete account permanently</p>
                        <p className="text-xs text-white/30 mt-1">This removes your authentication record and all Flowcent data. This cannot be undone.</p>
                    </div>
                    <label htmlFor="delete-confirmation" className="sr-only">Confirm account email for deletion</label>
                    <input id="delete-confirmation" type="email" value={deleteConfirmation} onChange={event => setDeleteConfirmation(event.target.value)}
                        className="input-premium" placeholder={user?.email || 'Confirm your email'} />
                    <button onClick={deleteAccount} disabled={deleting || !deleteConfirmation}
                        className="btn-outline text-xs px-4 py-2 text-red-400 flex items-center gap-2 disabled:opacity-40"
                        style={{ borderColor: 'rgba(248,113,113,0.25)' }}>
                        <Trash2 size={14} /> {deleting ? 'Deleting...' : 'Delete Account'}
                    </button>
                </div>
            </div>
        </div>
    );
}
