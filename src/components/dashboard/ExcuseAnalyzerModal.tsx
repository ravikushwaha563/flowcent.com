'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Sparkles, Copy, CheckCircle2, AlertTriangle, ShieldAlert, ShieldCheck, Thermometer } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/errors';

interface InvoiceContext {
    id?: string;
    amount: number;
    currency: string;
    due_date: string;
    status: string;
}

interface ExcuseAnalyzerModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoiceContext?: InvoiceContext;
    onAnalyzed?: () => void;
}

interface AnalysisResult {
    credibility_signal: number;
    intent_category: string;
    analysis: string;
    suggested_response: string;
}

export default function ExcuseAnalyzerModal({ isOpen, onClose, invoiceContext, onAnalyzed }: ExcuseAnalyzerModalProps) {
    const [excuse, setExcuse] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleAnalyze = async () => {
        if (!excuse.trim()) {
            toast.error('Please paste the client excuse first.');
            return;
        }

        setIsAnalyzing(true);
        setResult(null);

        try {
            const res = await fetch('/api/ai/analyze-excuse', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ excuse, invoiceId: invoiceContext?.id })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to analyze excuse');

            setResult(data);
            onAnalyzed?.();
            toast.success(data.savedPromise ? 'Analysis complete and added to promise history' : 'Analysis complete');
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, 'Failed to analyze excuse'));
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleCopy = () => {
        if (result?.suggested_response) {
            navigator.clipboard.writeText(result.suggested_response);
            setCopied(true);
            toast.success('Response copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Determine color based on probability
    const getProbabilityColor = (prob: number) => {
        if (prob >= 75) return 'text-green-400 bg-green-400/10 border-green-400/20';
        if (prob >= 40) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
        return 'text-red-400 bg-red-400/10 border-red-400/20';
    };

    const getProbabilityIcon = (prob: number) => {
        if (prob >= 75) return <ShieldCheck className="w-5 h-5 text-green-400" />;
        if (prob >= 40) return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
        return <ShieldAlert className="w-5 h-5 text-red-400" />;
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-[#0a0f1c]/80 backdrop-blur-sm"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-2xl bg-[#0a0f1c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="excuse-analyzer-title"
                >
                    {/* Glowing Accent Top */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />

                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <h2 id="excuse-analyzer-title" className="text-lg font-bold text-white tracking-tight">AI Reply Analyzer</h2>
                                <p className="text-sm text-white/40">Specificity-based payment reply review</p>
                            </div>
                        </div>
                        <button type="button" onClick={onClose} aria-label="Close AI reply analyzer" className="p-2 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content Scrollable Area */}
                    <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
                        
                        {!result && (
                            <div className="space-y-3">
                                <label htmlFor="excuse-analyzer-message" className="text-xs font-semibold text-white/40 uppercase tracking-widest flex items-center justify-between">
                                    <span>Paste Client Response</span>
                                    {invoiceContext && <span className="text-blue-400/60 lowercase">Context loaded</span>}
                                </label>
                                <textarea
                                    id="excuse-analyzer-message"
                                    value={excuse}
                                    onChange={(e) => setExcuse(e.target.value)}
                                    placeholder="e.g., 'We are waiting on our own clients to pay us before we can clear this invoice...'"
                                    className="w-full h-32 bg-white/[0.02] border border-white/10 rounded-xl p-4 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 resize-none transition-all"
                                />
                                
                                <button
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing || !excuse.trim()}
                                    className="w-full relative group overflow-hidden rounded-xl border border-white/10 p-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="absolute inset-0 bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors" />
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.3)_0%,transparent_70%)] transition-opacity duration-500" />
                                    
                                    <div className="relative flex items-center justify-center gap-2">
                                        {isAnalyzing ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                                <span className="text-sm font-semibold text-blue-400">Reviewing commitment details...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-4 h-4 text-blue-400" />
                                                <span className="text-sm font-semibold text-white tracking-wide">Analyze Excuse</span>
                                            </>
                                        )}
                                    </div>
                                </button>
                                
                                <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 flex items-start gap-3 mt-4">
                                    <ShieldCheck className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                                    <p className="text-xs text-orange-400/80 leading-relaxed">
                                        This AI signal evaluates specificity, not truth. Verify dates, amounts, and disputes directly with the client before acting.
                                    </p>
                                </div>
                            </div>
                        )}

                        {result && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {/* Metrics Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className={`p-4 rounded-xl border flex flex-col gap-2 ${getProbabilityColor(result.credibility_signal)}`}>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold uppercase tracking-widest opacity-80">Credibility Signal</span>
                                            {getProbabilityIcon(result.credibility_signal)}
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-bold">{result.credibility_signal}</span>
                                            <span className="text-sm font-medium opacity-70">%</span>
                                        </div>
                                    </div>
                                    
                                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">Intent Category</span>
                                            <Thermometer className="w-5 h-5 text-white/40" />
                                        </div>
                                        <span className="text-sm font-medium text-white/80">{result.intent_category}</span>
                                    </div>
                                </div>

                                {/* Analysis */}
                                <div className="space-y-2">
                                    <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest flex items-center gap-2">
                                        <Bot className="w-3.5 h-3.5" /> Message Analysis
                                    </h3>
                                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-sm text-white/70 leading-relaxed">
                                        {result.analysis}
                                    </div>
                                </div>

                                {/* Suggested Response */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest flex items-center gap-2">
                                            <Sparkles className="w-3.5 h-3.5" /> Suggested Response
                                        </h3>
                                        <button 
                                            onClick={handleCopy}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-medium transition-colors"
                                        >
                                            {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                            {copied ? 'Copied!' : 'Copy to Clipboard'}
                                        </button>
                                    </div>
                                    <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 text-sm text-blue-100/80 leading-relaxed whitespace-pre-wrap font-mono relative">
                                        {result.suggested_response}
                                    </div>
                                </div>

                                <button 
                                    onClick={() => { setResult(null); setExcuse(''); }}
                                    className="w-full py-3 text-sm font-medium text-white/40 hover:text-white transition-colors"
                                >
                                    Analyze Another Excuse
                                </button>
                            </motion.div>
                        )}

                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
