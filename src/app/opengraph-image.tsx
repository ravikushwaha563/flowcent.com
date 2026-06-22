import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Flowcent – AI-Powered Payment Collection for Indian Freelancers';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, #09090f 0%, #0d0d1a 50%, #0a0a15 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    padding: '72px 80px',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    position: 'relative',
                    overflow: 'hidden',
                }}>

                {/* Background glow blobs */}
                <div style={{
                    position: 'absolute', top: -120, left: -60,
                    width: 500, height: 500,
                    background: 'radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)',
                    borderRadius: '50%',
                }} />
                <div style={{
                    position: 'absolute', bottom: -100, right: -40,
                    width: 400, height: 400,
                    background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
                    borderRadius: '50%',
                }} />

                {/* Grid pattern overlay */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }} />

                {/* Logo row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
                    {/* ImageResponse renders this JSX outside the browser DOM. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="http://localhost:3000/logo.png"
                        alt="Logo"
                        style={{
                            width: 64,
                            height: 64,
                            objectFit: 'contain',
                            borderRadius: 16,
                            boxShadow: '0 0 40px rgba(61,97,255,0.4)',
                        }}
                    />
                    <span style={{ color: 'white', fontWeight: 800, fontSize: 28, letterSpacing: '-0.5px' }}>Flowcent</span>
                    <div style={{
                        fontSize: 11, padding: '3px 10px', borderRadius: 20,
                        background: 'rgba(59,130,246,0.15)',
                        border: '1px solid rgba(59,130,246,0.3)',
                        color: '#93c5fd', fontWeight: 700, letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                    }}>AI-Powered</div>
                </div>

                {/* Headline */}
                <div style={{
                    fontSize: 62, fontWeight: 800, lineHeight: 1.05,
                    letterSpacing: '-1.5px', marginBottom: 20,
                    color: 'white', maxWidth: 700,
                }}>
                    Stop chasing payments.{' '}
                    <span style={{ background: 'linear-gradient(90deg, #6b96ff, #a78bfa)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                        Get paid automatically.
                    </span>
                </div>

                {/* Sub */}
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 22, lineHeight: 1.5, marginBottom: 40, maxWidth: 620 }}>
                    AI invoice tracking, 5-stage follow-ups from Gmail, and Excuse Memory™ — built for Indian freelancers.
                </p>

                {/* Stats row */}
                <div style={{ display: 'flex', gap: 16 }}>
                    {[
                        { value: '45 → 12 days', label: 'Avg payment time' },
                        { value: '3× faster', label: 'Collections' },
                        { value: '₹0 to start', label: 'Free plan forever' },
                    ].map((s) => (
                        <div key={s.label} style={{
                            padding: '12px 20px', borderRadius: 12,
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            display: 'flex', flexDirection: 'column', gap: 2,
                        }}>
                            <span style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>{s.value}</span>
                            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{s.label}</span>
                        </div>
                    ))}
                </div>

                {/* Domain watermark */}
                <div style={{
                    position: 'absolute', bottom: 36, right: 60,
                    color: 'rgba(255,255,255,0.2)', fontSize: 14, fontWeight: 600, letterSpacing: '0.05em',
                }}>flowcent.in</div>
            </div>
        ),
        { ...size }
    );
}
