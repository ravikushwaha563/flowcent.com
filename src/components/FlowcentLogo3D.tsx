'use client';

/* ─── Flowcent 3D Logo ────────────────────────────────────────────────────────
   Pure CSS @keyframes – NO JavaScript rAF loop.
   Runs entirely on the GPU compositor thread → zero jank.
   ─────────────────────────────────────────────────────────────────────────── */

const CSS = `
@keyframes fc-spin {
  0%   { transform: rotateX(18deg) rotateY(0deg); }
  100% { transform: rotateX(18deg) rotateY(360deg); }
}
@keyframes fc-glow {
  0%,100% { filter: drop-shadow(0 0 6px rgba(61,97,255,0.7)); }
  50%      { filter: drop-shadow(0 0 14px rgba(124,58,237,0.9)); }
}
.fc-cube-wrap {
  display: inline-block;
  perspective: 140px;
  perspective-origin: 50% 50%;
  vertical-align: middle;
  flex-shrink: 0;
}
.fc-cube {
  position: relative;
  transform-style: preserve-3d;
  animation: fc-spin 6s linear infinite, fc-glow 3s ease-in-out infinite;
  will-change: transform;
}
.fc-face {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Inter, sans-serif;
  font-weight: 800;
  color: rgba(255,255,255,0.95);
  border: 1px solid rgba(255,255,255,0.13);
  backface-visibility: hidden;
  text-shadow: 0 1px 4px rgba(0,0,0,0.5);
}
`;

export default function FlowcentLogo3D({ size = 36 }: { size?: number }) {
    const h = size;
    const half = h / 2;
    const fs = Math.round(h * 0.42);
    const br = Math.round(h * 0.18);

    const faceStyle = (grad: string, transform: string, opacity = 1): React.CSSProperties => ({
        width: h,
        height: h,
        background: grad,
        transform,
        opacity,
        fontSize: fs,
        borderRadius: br,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.2)',
    });

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: CSS }} />
            <div className="fc-cube-wrap" style={{ width: h, height: h }}>
                <div className="fc-cube" style={{ width: h, height: h }}>
                    {/* Front */}
                    <div className="fc-face"
                        style={faceStyle('linear-gradient(135deg,#3d61ff,#7c3aed)', `translateZ(${half}px)`)}>
                        <img src="/logo.png" alt="Logo" className="w-[60%] h-[60%] object-contain drop-shadow-md" />
                    </div>
                    {/* Back */}
                    <div className="fc-face"
                        style={faceStyle('linear-gradient(135deg,#7c3aed,#06b6d4)', `rotateY(180deg) translateZ(${half}px)`, 0.65)} />
                    {/* Left */}
                    <div className="fc-face"
                        style={faceStyle('linear-gradient(135deg,#1a1aff,#3d61ff)', `rotateY(-90deg) translateZ(${half}px)`, 0.55)} />
                    {/* Right */}
                    <div className="fc-face"
                        style={faceStyle('linear-gradient(135deg,#5f0be3,#a78bfa)', `rotateY(90deg) translateZ(${half}px)`, 0.55)} />
                    {/* Top */}
                    <div className="fc-face"
                        style={faceStyle('linear-gradient(135deg,#22d3ee,#3d61ff)', `rotateX(90deg) translateZ(${half}px)`, 0.8)} />
                    {/* Bottom */}
                    <div className="fc-face"
                        style={faceStyle('linear-gradient(135deg,#0f0f2e,#1a0a4f)', `rotateX(-90deg) translateZ(${half}px)`, 0.35)} />
                </div>
            </div>
        </>
    );
}
