'use client';

import { useState } from 'react';
import { X, Crown, Shield, Sparkles, Check } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/errors';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    token: string | null;
    message?: string;
    onSuccess?: () => void;
}

const PRO_FEATURES = [
    'Unlimited invoices & clients',
    'Fully automated 5-stage follow-ups',
    'AI Excuse Memory™ (unlimited)',
    'Payment Intent Score (unlimited)',
    'Client Trust Scoring (unlimited)',
    'Advanced analytics & reports',
    'CSV export',
    'Priority support (24hr)',
];

export default function UpgradeModal({ isOpen, onClose, token, message, onSuccess }: UpgradeModalProps) {
    const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
    const [loading, setLoading] = useState(false);

    const totalPrice = billing === 'annual' ? 399 * 12 : 499;
    const savings = billing === 'annual' ? (499 - 399) * 12 : 0;

    const loadRazorpay = (): Promise<boolean> => new Promise(resolve => {
        if (window.Razorpay) { resolve(true); return; }
        const s = document.createElement('script');
        s.src = 'https://checkout.razorpay.com/v1/checkout.js';
        s.onload = () => resolve(true);
        s.onerror = () => resolve(false);
        document.body.appendChild(s);
    });

    const handleUpgrade = async () => {
        setLoading(true);
        try {
            const ok = await loadRazorpay();
            if (!ok) throw new Error('Failed to load payment gateway');

            const res = await fetch('/api/billing/upgrade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ plan: 'pro', billing }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            if (!window.Razorpay) throw new Error('Razorpay SDK is unavailable');
            const rzp = new window.Razorpay({
                key: data.keyId,
                amount: data.amount,
                currency: data.currency,
                name: 'Flowcent Pro',
                description: `Pro Plan — ${billing === 'annual' ? 'Annual' : 'Monthly'}`,
                order_id: data.orderId,
                theme: { color: '#a78bfa', backdrop_color: 'rgba(0,0,0,0.85)' },
                modal: { confirm_close: true, ondismiss: () => setLoading(false) },
                handler: async (response: RazorpayCheckoutResponse) => {
                    try {
                        const v = await fetch('/api/billing/upgrade', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                plan: 'pro',
                                billing,
                            }),
                        });
                        const vData = await v.json();
                        if (!v.ok) throw new Error(vData.error);
                        toast.success('🎉 Welcome to Flowcent Pro!');
                        onSuccess?.();
                        onClose();
                    } catch { toast.error('Payment verified but activation failed. Contact support.'); }
                    finally { setLoading(false); }
                },
            });
            rzp.on('payment.failed', (response: RazorpayFailureResponse) => { toast.error(response.error?.description || 'Payment failed'); setLoading(false); });
            rzp.open();
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, 'Unable to start upgrade'));
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-md rounded-2xl border border-purple-500/20 bg-[#0d0d18] shadow-2xl shadow-purple-500/10 overflow-hidden"
                style={{ animation: 'revealUp 0.3s cubic-bezier(0.22,1,0.36,1) both' }}>

                {/* Top Glow */}
                <div className="h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-60" />

                {/* Close */}
                <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center transition-colors">
                    <X size={14} className="text-white/40" />
                </button>

                <div className="p-8 space-y-6">
                    {/* Header */}
                    <div className="text-center">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30">
                            <Crown size={24} className="text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Upgrade to Pro</h2>
                        {message && (
                            <p className="text-sm text-amber-400/80 mt-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                {message}
                            </p>
                        )}
                    </div>

                    {/* Billing Toggle */}
                    <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                        {(['monthly', 'annual'] as const).map(b => (
                            <button key={b} onClick={() => setBilling(b)}
                                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${billing === b
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                    : 'text-white/40 hover:text-white/60'
                                    }`}>
                                {b === 'monthly' ? '₹499/mo' : '₹399/mo'}
                                {b === 'annual' && <span className="ml-1.5 text-green-400 text-[10px]">Save ₹{savings}</span>}
                            </button>
                        ))}
                    </div>

                    {/* Features */}
                    <div className="space-y-2.5">
                        {PRO_FEATURES.map(f => (
                            <div key={f} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-md bg-purple-500/15 border border-purple-500/25 flex items-center justify-center shrink-0">
                                    <Check size={11} className="text-purple-400" />
                                </div>
                                <span className="text-sm text-white/60">{f}</span>
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <button
                        onClick={handleUpgrade}
                        disabled={loading}
                        className="w-full relative group overflow-hidden rounded-xl py-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:from-purple-500 group-hover:to-blue-500 transition-all duration-300" />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            style={{ background: 'radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 70%)' }} />
                        <div className="relative flex items-center justify-center gap-2.5">
                            {loading ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span className="text-sm font-bold text-white">Processing...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5 text-white" />
                                    <span className="text-sm font-bold text-white">
                                        Upgrade for ₹{totalPrice}{billing === 'annual' ? '/year' : '/mo'}
                                    </span>
                                </>
                            )}
                        </div>
                    </button>

                    <p className="text-[10px] text-white/15 text-center flex items-center justify-center gap-1.5">
                        <Shield size={10} /> Secure payment via Razorpay · Cancel anytime
                    </p>
                </div>
            </div>
        </div>
    );
}
