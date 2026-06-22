import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#09090f] text-white flex items-center justify-center px-6">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full opacity-10"
                    style={{ background: 'radial-gradient(circle, #3d61ff 0%, transparent 70%)' }} />
                <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full opacity-10"
                    style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
            </div>

            <div className="relative z-10 text-center max-w-lg">
                {/* 404 number */}
                <div className="text-[120px] font-black leading-none tracking-tighter mb-0"
                    style={{ background: 'linear-gradient(135deg, #3d61ff, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    404
                </div>

                <h1 className="text-2xl font-bold text-white mt-2 mb-3">Page not found</h1>
                <p className="text-white/40 text-base mb-8 leading-relaxed">
                    The page you're looking for doesn't exist or has been moved.
                    Let's get you back on track.
                </p>

                <div className="flex items-center justify-center gap-3 flex-wrap">
                    <Link href="/">
                        <button className="btn-primary px-6 py-3 text-sm">← Back to home</button>
                    </Link>
                    <Link href="/dashboard">
                        <button className="btn-outline px-6 py-3 text-sm">Go to Dashboard</button>
                    </Link>
                </div>

                <p className="text-xs text-white/20 mt-8">
                    Need help? <Link href="/contact" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">Contact support</Link>
                </p>
            </div>
        </div>
    );
}
