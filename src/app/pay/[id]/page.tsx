'use client';

import { useState, useEffect, use } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Clock, AlertTriangle, Shield, CreditCard, ArrowRight } from 'lucide-react';

declare global {
    interface Window { Razorpay: any; }
}

interface InvoiceData {
    id: string; invoice_number: string; amount: number; currency: string;
    due_date: string; status: string; created_at: string; paid_at?: string;
}
interface ClientData { id: string; name: string; email: string; company?: string; }
interface FreelancerData { name: string; company: string; email: string; }

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    paid:    { label: 'Paid',    color: '#34d399', bg: 'rgba(52,211,153,0.08)', icon: CheckCircle2 },
    pending: { label: 'Pending', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', icon: Clock },
    overdue: { label: 'Overdue', color: '#f87171', bg: 'rgba(248,113,113,0.08)', icon: AlertTriangle },
};

function getStatus(status: string, dueDate: string) {
    if (status === 'paid') return STATUS_MAP.paid;
    if (new Date(dueDate) < new Date()) return STATUS_MAP.overdue;
    return STATUS_MAP.pending;
}

export default function PublicPaymentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: invoiceId } = use(params);
    const searchParams = useSearchParams();

    const [invoice, setInvoice] = useState<InvoiceData | null>(null);
    const [client, setClient] = useState<ClientData | null>(null);
    const [freelancer, setFreelancer] = useState<FreelancerData | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [payLoading, setPayLoading] = useState(false);
    const [payError, setPayError] = useState('');

    // Check for payment redirect
    useEffect(() => {
        if (searchParams.get('payment') === 'success') {
            setPaymentSuccess(true);
        }
    }, [searchParams]);

    // Fetch invoice data
    useEffect(() => {
        fetch(`/api/invoices/public/${invoiceId}`)
            .then(r => r.json())
            .then(data => {
                if (data.error) { setNotFound(true); }
                else {
                    setInvoice(data.invoice);
                    setClient(data.client);
                    setFreelancer(data.freelancer);
                }
            })
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false));
    }, [invoiceId]);

    const fmt = (amount: number, currency: string) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);

    // ── Razorpay Payment ──
    const loadRazorpay = (): Promise<boolean> => new Promise(resolve => {
        if (window.Razorpay) { resolve(true); return; }
        const s = document.createElement('script');
        s.src = 'https://checkout.razorpay.com/v1/checkout.js';
        s.onload = () => resolve(true);
        s.onerror = () => resolve(false);
        document.body.appendChild(s);
    });

    const handleRazorpay = async () => {
        if (!invoice || !client) return;
        setPayLoading(true); setPayError('');
        try {
            const ok = await loadRazorpay();
            if (!ok) throw new Error('Failed to load payment gateway');
            const res = await fetch('/api/payments/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invoiceId: invoice.id }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            const rzp = new window.Razorpay({
                key: data.keyId,
                amount: data.amount,
                currency: data.currency,
                name: freelancer?.company || freelancer?.name || 'Flowcent',
                description: `Invoice ${invoice.invoice_number}`,
                order_id: data.orderId,
                prefill: { name: client.name, email: client.email },
                theme: { color: '#3b82f6', backdrop_color: 'rgba(0,0,0,0.85)' },
                modal: { confirm_close: true, ondismiss: () => setPayLoading(false) },
                handler: async (response: any) => {
                    try {
                        const v = await fetch('/api/payments/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                invoiceId: invoice.id,
                            }),
                        });
                        if (!v.ok) throw new Error('Verification failed');
                        setPaymentSuccess(true);
                        setInvoice(prev => prev ? { ...prev, status: 'paid', paid_at: new Date().toISOString() } : prev);
                    } catch { setPayError('Payment verified but update failed. Contact support.'); }
                    finally { setPayLoading(false); }
                },
            });
            rzp.on('payment.failed', (r: any) => { setPayError(r.error?.description || 'Payment failed'); setPayLoading(false); });
            rzp.open();
        } catch (e: any) { setPayError(e.message); setPayLoading(false); }
    };

    const handleStripe = async () => {
        if (!invoice) return;
        setPayLoading(true); setPayError('');
        try {
            const res = await fetch('/api/payments/stripe-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invoiceId: invoice.id }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            window.location.href = data.url;
        } catch (e: any) { setPayError(e.message); setPayLoading(false); }
    };

    const handlePay = () => {
        if (!invoice) return;
        if (invoice.currency === 'INR') handleRazorpay();
        else handleStripe();
    };

    // ── Skeleton ──
    if (loading) return (
        <div className="min-h-screen bg-[#09090f] flex items-center justify-center p-4">
            <div className="w-full max-w-lg space-y-6">
                <div className="h-10 w-40 rounded-xl bg-white/[0.04] animate-pulse mx-auto" />
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 space-y-4">
                    {[...Array(5)].map((_, i) => <div key={i} className="h-5 rounded-lg bg-white/[0.04] animate-pulse" style={{ width: `${80 - i * 10}%` }} />)}
                </div>
                <div className="h-14 rounded-2xl bg-white/[0.04] animate-pulse" />
            </div>
        </div>
    );

    // ── 404 ──
    if (notFound) return (
        <div className="min-h-screen bg-[#09090f] flex items-center justify-center p-4">
            <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-10 h-10 text-red-400" />
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Invoice Not Found</h1>
                <p className="text-white/40 text-sm max-w-sm">This invoice link may be invalid or expired. Please check the URL from your email and try again.</p>
            </div>
        </div>
    );

    if (!invoice || !client || !freelancer) return null;

    const statusCfg = getStatus(invoice.status, invoice.due_date);
    const isPaid = invoice.status === 'paid' || paymentSuccess;
    const StatusIcon = statusCfg.icon;

    return (
        <div className="min-h-screen bg-[#09090f] text-white relative overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[30%] w-[600px] h-[600px] rounded-full opacity-[0.04]"
                    style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }} />
                <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] rounded-full opacity-[0.03]"
                    style={{ background: 'radial-gradient(circle, #a78bfa 0%, transparent 70%)' }} />
            </div>
            <div className="fixed inset-0 pointer-events-none noise opacity-40" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 sm:p-6">

                {/* Freelancer Branding */}
                <div className="text-center mb-8" style={{ animation: 'revealUp 0.6s cubic-bezier(0.22,1,0.36,1) 0ms both' }}>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3 shadow-lg shadow-blue-500/20">
                        {(freelancer.company || freelancer.name || 'F')[0].toUpperCase()}
                    </div>
                    <h2 className="text-lg font-bold text-white tracking-tight">{freelancer.company || freelancer.name}</h2>
                    <p className="text-xs text-white/30 mt-0.5">Payment Request</p>
                </div>

                {/* Main Card */}
                <div className="w-full max-w-lg" style={{ animation: 'revealUp 0.6s cubic-bezier(0.22,1,0.36,1) 80ms both' }}>
                    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/30">
                        
                        {/* Top Glow */}
                        <div className="h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-40" />

                        {/* Amount Header */}
                        <div className="px-8 pt-8 pb-6 text-center border-b border-white/[0.05]">
                            {isPaid ? (
                                <div className="space-y-3">
                                    <div className="w-16 h-16 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mx-auto" style={{ animation: 'revealUp 0.5s cubic-bezier(0.22,1,0.36,1) 200ms both' }}>
                                        <CheckCircle2 className="w-8 h-8 text-green-400" />
                                    </div>
                                    <p className="text-green-400 font-bold text-lg">Payment Received</p>
                                    <p className="text-4xl font-bold text-white tracking-tight">{fmt(invoice.amount, invoice.currency)}</p>
                                    <p className="text-xs text-white/30">Paid on {invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'just now'}</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-xs text-white/30 uppercase tracking-widest font-semibold">Amount Due</p>
                                    <p className="text-5xl font-bold text-white tracking-tight">{fmt(invoice.amount, invoice.currency)}</p>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mt-2" style={{ background: statusCfg.bg, border: `1px solid ${statusCfg.color}30` }}>
                                        <StatusIcon className="w-3.5 h-3.5" style={{ color: statusCfg.color }} />
                                        <span className="text-xs font-semibold" style={{ color: statusCfg.color }}>{statusCfg.label}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Invoice Details */}
                        <div className="px-8 py-6 space-y-4">
                            {[
                                { label: 'Invoice', value: invoice.invoice_number },
                                { label: 'Billed To', value: client.company ? `${client.name} · ${client.company}` : client.name },
                                { label: 'From', value: freelancer.company || freelancer.name },
                                { label: 'Due Date', value: new Date(invoice.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
                                { label: 'Issued', value: new Date(invoice.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
                            ].map(row => (
                                <div key={row.label} className="flex items-center justify-between">
                                    <span className="text-xs text-white/35 font-medium">{row.label}</span>
                                    <span className="text-sm text-white/80 font-medium text-right">{row.value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Amount Summary */}
                        <div className="mx-8 mb-6 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-white/50">Total</span>
                                <span className="text-xl font-bold text-white">{fmt(invoice.amount, invoice.currency)}</span>
                            </div>
                        </div>

                        {/* Pay Button */}
                        {!isPaid && (
                            <div className="px-8 pb-8 space-y-3">
                                <button
                                    onClick={handlePay}
                                    disabled={payLoading}
                                    className="w-full relative group overflow-hidden rounded-xl py-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 group-hover:from-blue-500 group-hover:to-blue-400 transition-all duration-300" />
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                        style={{ background: 'radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 70%)' }} />
                                    <div className="relative flex items-center justify-center gap-2.5">
                                        {payLoading ? (
                                            <>
                                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span className="text-sm font-bold text-white">Processing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="w-5 h-5 text-white" />
                                                <span className="text-sm font-bold text-white">Pay {fmt(invoice.amount, invoice.currency)} Now</span>
                                                <ArrowRight className="w-4 h-4 text-white/60 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </div>
                                </button>

                                {payError && (
                                    <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 text-center">
                                        {payError}
                                    </div>
                                )}

                                <div className="flex items-center justify-center gap-2 pt-1">
                                    <Shield className="w-3.5 h-3.5 text-white/20" />
                                    <p className="text-[10px] text-white/20 font-medium">Secured with 256-bit SSL encryption · {invoice.currency === 'INR' ? 'Razorpay' : 'Stripe'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center" style={{ animation: 'revealUp 0.6s cubic-bezier(0.22,1,0.36,1) 160ms both' }}>
                    <p className="text-[11px] text-white/15 font-medium">
                        Powered by <span className="text-white/25 font-semibold">Flowcent</span> · AI-Powered Payment Collection
                    </p>
                </div>
            </div>
        </div>
    );
}
