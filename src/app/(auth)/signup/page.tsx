'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupInput } from '@/lib/validations/auth';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

export default function SignupPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<SignupInput>({
        resolver: zodResolver(signupSchema),
    });

    const onSubmit = async (data: SignupInput) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Signup failed');
            if (result.requiresEmailConfirmation) {
                toast.success('Check your email to confirm your account.');
                router.push('/login');
            } else {
                await login();
                router.push('/dashboard');
            }
        } catch (err: any) {
            toast.error(err.message || 'Signup failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignup = () => {
        setIsLoading(true);
        window.location.assign('/api/auth/google');
    };

    return (
        <div className="space-y-7">
            {/* Heading */}
            <div style={{ animation: 'revealUp 0.5s cubic-bezier(0.22,1,0.36,1) 0ms both' }}>
                <h1 className="text-2xl font-bold text-white tracking-tight">Create your account</h1>
                <p className="text-white/40 text-sm mt-1">Start tracking payments for free</p>
            </div>

            {/* Google OAuth Button */}
            <div style={{ animation: 'revealUp 0.5s cubic-bezier(0.22,1,0.36,1) 60ms both' }}>
                <button
                    type="button"
                    onClick={handleGoogleSignup}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors text-sm font-medium"
                >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px bg-white/[0.07]" />
                    <span className="text-[11px] text-white/25 uppercase tracking-widest">or continue with email</span>
                    <div className="flex-1 h-px bg-white/[0.07]" />
                </div>
            </div>

            {/* Form */}
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
                style={{ animation: 'revealUp 0.5s cubic-bezier(0.22,1,0.36,1) 120ms both' }}
            >
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">Name</label>
                        <input type="text" placeholder="Rahul Kumar" className="input-premium" {...register('name')} disabled={isLoading} />
                        {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">Company</label>
                        <input type="text" placeholder="Acme Inc." className="input-premium" {...register('companyName')} disabled={isLoading} />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">Email</label>
                    <input type="email" placeholder="you@company.com" className="input-premium" {...register('email')} disabled={isLoading} />
                    {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">Password</label>
                    <input type="password" placeholder="Min. 8 characters" className="input-premium" {...register('password')} disabled={isLoading} />
                    {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
                </div>

                <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
                    {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                            Creating account...
                        </span>
                    ) : 'Create account →'}
                </button>

                <p className="text-center text-xs text-white/25">
                    By signing up, you agree to our <a href="/terms" className="underline hover:text-white/50 transition-colors">terms of service</a>.
                </p>
            </form>

            {/* Bottom link */}
            <div style={{ animation: 'revealUp 0.5s cubic-bezier(0.22,1,0.36,1) 200ms both' }}>
                <div className="divider-grad"></div>
                <p className="text-center text-sm text-white/30 mt-6">
                    Already have an account?{' '}
                    <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                        Sign in →
                    </Link>
                </p>
            </div>
        </div>
    );
}
