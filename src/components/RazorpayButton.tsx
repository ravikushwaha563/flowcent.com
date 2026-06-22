'use client';

import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { getErrorMessage } from '@/lib/errors';

interface RazorpayButtonProps {
    publicToken: string;
    invoiceNumber: string;
    amount: number;
    currency: string;
    clientName: string;
    clientEmail: string;
    onSuccess: () => void;
}

export default function RazorpayButton({
    publicToken, invoiceNumber, amount, currency, clientName, clientEmail, onSuccess,
}: RazorpayButtonProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const loadRazorpayScript = (): Promise<boolean> => {
        return new Promise((resolve) => {
            if (window.Razorpay) { resolve(true); return; }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        setLoading(true);
        setError('');

        try {
            // 1. Load Razorpay script
            const loaded = await loadRazorpayScript();
            if (!loaded) throw new Error('Failed to load Razorpay SDK');

            // 2. Create order via our API
            const res = await fetch('/api/payments/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ publicToken }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create payment order');

            // 3. Open Razorpay Checkout
            const options = {
                key: data.keyId,
                amount: data.amount,
                currency: data.currency,
                name: 'Flowcent',
                description: `Payment for Invoice ${invoiceNumber}`,
                order_id: data.orderId,
                prefill: {
                    name: clientName,
                    email: clientEmail,
                },
                theme: {
                    color: '#6366f1',
                    backdrop_color: 'rgba(0,0,0,0.7)',
                },
                modal: {
                    confirm_close: true,
                    ondismiss: () => setLoading(false),
                },
                handler: async (response: RazorpayCheckoutResponse) => {
                    // 4. Verify payment on server
                    try {
                        const verifyRes = await fetch('/api/payments/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                publicToken,
                            }),
                        });
                        const verifyData = await verifyRes.json();
                        if (!verifyRes.ok) throw new Error(verifyData.error);

                        onSuccess();
                    } catch (error: unknown) {
                        setError(getErrorMessage(error, 'Payment verification failed'));
                    } finally {
                        setLoading(false);
                    }
                },
            };

            if (!window.Razorpay) throw new Error('Razorpay SDK is unavailable');
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (response: RazorpayFailureResponse) => {
                setError(response.error?.description || 'Payment failed');
                setLoading(false);
            });
            rzp.open();
        } catch (error: unknown) {
            setError(getErrorMessage(error, 'Unable to start payment'));
            setLoading(false);
        }
    };

    return (
        <div className="space-y-2">
            <button
                onClick={handlePayment}
                disabled={loading}
                className="btn-primary text-sm px-5 py-2.5 flex items-center gap-2 disabled:opacity-50 w-full justify-center"
            >
                {loading ? (
                    <><span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Processing...</>
                ) : (
                    <><CreditCard size={16} /> Pay {new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)} Now</>
                )}
            </button>
            {error && (
                <p className="text-xs text-red-400 text-center">{error}</p>
            )}
        </div>
    );
}
