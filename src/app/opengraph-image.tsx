import { ImageResponse } from 'next/og';

export const alt = 'Flowcent – AI-assisted invoice follow-up for Indian freelancers';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
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

                {/* Grid pattern overlay */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }} />

                {/* Logo row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
                    <div style={{
                        width: 64,
                        height: 64,
                        borderRadius: 16,
                        background: 'linear-gradient(135deg, #3d61ff, #7c3aed)',
                        boxShadow: '0 0 40px rgba(61,97,255,0.4)',
                        color: 'white',
                        fontSize: 32,
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>F</div>
                    <span style={{ color: 'white', fontWeight: 800, fontSize: 28, letterSpacing: 0 }}>Flowcent</span>
                    <div style={{
                        fontSize: 11, padding: '3px 10px', borderRadius: 20,
                        background: 'rgba(59,130,246,0.15)',
                        border: '1px solid rgba(59,130,246,0.3)',
                        color: '#93c5fd', fontWeight: 700, letterSpacing: 0,
                        textTransform: 'uppercase',
                    }}>AI-Assisted</div>
                </div>

                {/* Headline */}
                <div style={{
                    fontSize: 62, fontWeight: 800, lineHeight: 1.05,
                    letterSpacing: 0, marginBottom: 20,
                    color: 'white', maxWidth: 700,
                    display: 'flex', flexDirection: 'column',
                }}>
                    <span>Track every invoice.</span>
                    <span style={{ color: '#8fa6ff' }}>
                        Follow up consistently.
                    </span>
                </div>

                {/* Sub */}
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 22, lineHeight: 1.5, marginBottom: 40, maxWidth: 620 }}>
                    Track invoices, send enabled Gmail follow-ups, and accept online payments in one focused workspace.
                </p>

                {/* Stats row */}
                <div style={{ display: 'flex', gap: 16 }}>
                    {[
                        { value: '4 currencies', label: 'Invoice support' },
                        { value: '5 stages', label: 'Follow-up workflow' },
                        { value: 'Free plan', label: 'Available to start' },
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
                    color: 'rgba(255,255,255,0.2)', fontSize: 14, fontWeight: 600, letterSpacing: 0,
                }}>flowcent.in</div>
            </div>
        ),
        { ...size }
    );
}
