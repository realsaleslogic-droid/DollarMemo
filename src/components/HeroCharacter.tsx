'use client';

import { useEffect, useRef } from 'react';

/**
 * DollarMemo hero mascot — a self-contained, crisp "3D-style" SVG illustration
 * styled after the onboarding reference: a smiling, clean-shaven man-bun
 * character in a green tee and blue jeans, arms outstretched with palms up. A 3D pie
 * chart and a 3D gold coin hover above his palms. Heavy use of volumetric
 * gradients, highlights and cast shadows gives it a rendered, dimensional look.
 * The whole figure tilts/parallaxes toward the cursor.
 */
export default function HeroCharacter({ className }: { className?: string }) {
  const tiltRef = useRef<HTMLDivElement>(null);
  const pieRef = useRef<SVGGElement>(null);
  const coinRef = useRef<SVGGElement>(null);
  const frame = useRef(0);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1; // -1..1
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        if (tiltRef.current) {
          // Rotate toward the cursor (no vertical drift, so he reads as standing).
          tiltRef.current.style.transform = `rotateY(${nx * 11}deg) rotateX(${-ny * 7}deg) translateX(${nx * 4}px)`;
        }
        if (pieRef.current) pieRef.current.style.transform = `translate(${nx * 10}px, ${ny * 8}px)`;
        if (coinRef.current) coinRef.current.style.transform = `translate(${nx * -10}px, ${ny * 8}px)`;
      });
    };
    window.addEventListener('pointermove', onMove);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame.current);
    };
  }, []);

  return (
    <div className={className} style={{ perspective: '900px' }}>
      <div className="flex h-full w-full items-center justify-center">
        <div
          ref={tiltRef}
          style={{ transition: 'transform 0.25s cubic-bezier(0.22,1,0.36,1)', transformStyle: 'preserve-3d', willChange: 'transform' }}
        >
          <svg viewBox="0 0 300 360" className="h-[285px] w-[238px] sm:h-[375px] sm:w-[313px]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              {/* volumetric skin (sphere-like) */}
              <radialGradient id="skinGrad" cx="0.38" cy="0.30" r="0.9">
                <stop offset="0" stopColor="#f6c89c" />
                <stop offset="0.55" stopColor="#ebb084" />
                <stop offset="1" stopColor="#cd8c58" />
              </radialGradient>
              <radialGradient id="limbSkin" cx="0.35" cy="0.35" r="0.9">
                <stop offset="0" stopColor="#f1bd92" />
                <stop offset="1" stopColor="#d2925f" />
              </radialGradient>
              {/* torso volume: bright center, dark edges */}
              <radialGradient id="shirtBody" cx="0.42" cy="0.32" r="0.95">
                <stop offset="0" stopColor="#54c894" />
                <stop offset="0.6" stopColor="#2f9e6b" />
                <stop offset="1" stopColor="#176844" />
              </radialGradient>
              <linearGradient id="sleeveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#46bd87" />
                <stop offset="1" stopColor="#207a52" />
              </linearGradient>
              <radialGradient id="legGrad" cx="0.4" cy="0.3" r="1">
                <stop offset="0" stopColor="#5878b0" />
                <stop offset="1" stopColor="#2c466c" />
              </radialGradient>
              <linearGradient id="shoeGrad" x1="0.3" y1="0" x2="0.6" y2="1">
                <stop offset="0" stopColor="#3c3c48" />
                <stop offset="1" stopColor="#17171e" />
              </linearGradient>
              <linearGradient id="hairGrad" x1="0.3" y1="0" x2="0.7" y2="1">
                <stop offset="0" stopColor="#63432b" />
                <stop offset="1" stopColor="#3a2616" />
              </linearGradient>
              <radialGradient id="coinTop" cx="0.38" cy="0.28" r="0.95">
                <stop offset="0" stopColor="#fff0bf" />
                <stop offset="0.6" stopColor="#f6cd62" />
                <stop offset="1" stopColor="#e0ab43" />
              </radialGradient>
              <linearGradient id="coinSide" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#d49b35" />
                <stop offset="1" stopColor="#9c6e1b" />
              </linearGradient>
              <linearGradient id="pieSide" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#0f6b5b" />
                <stop offset="1" stopColor="#083b34" />
              </linearGradient>
              <radialGradient id="halo" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0" stopColor="#bdf3df" stopOpacity="0.55" />
                <stop offset="1" stopColor="#bdf3df" stopOpacity="0" />
              </radialGradient>
              <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
                <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#062a24" floodOpacity="0.28" />
              </filter>
              <filter id="objShadow" x="-70%" y="-70%" width="240%" height="240%">
                <feDropShadow dx="0" dy="8" stdDeviation="5" floodColor="#052520" floodOpacity="0.38" />
              </filter>
              <filter id="blurMe" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" />
              </filter>
            </defs>

            {/* ground shadow (under the feet — he's standing) */}
            <ellipse cx="150" cy="330" rx="52" ry="8" fill="#06302a" opacity="0.3" />

            <g filter="url(#soft)">
              {/* ---------------- Hips + legs ---------------- */}
              <path d="M122 196 q28 14 56 0 l-3 22 q-25 10 -50 0 z" fill="url(#legGrad)" />
              {/* legs: straight, planted stance */}
              <path d="M141 202 C139 240 137 278 137 308" stroke="url(#legGrad)" strokeWidth="26" strokeLinecap="round" fill="none" />
              <path d="M159 202 C161 240 163 278 163 308" stroke="url(#legGrad)" strokeWidth="26" strokeLinecap="round" fill="none" />
              {/* cylindrical highlights */}
              <path d="M136 214 C134 244 133 276 133 304" stroke="#7b99cf" strokeWidth="3.5" fill="none" opacity="0.38" strokeLinecap="round" />
              <path d="M164 214 C166 244 167 276 167 304" stroke="#7b99cf" strokeWidth="3.5" fill="none" opacity="0.32" strokeLinecap="round" />
              {/* jeans hems */}
              <rect x="124" y="302" width="27" height="12" rx="6" fill="#2a4368" />
              <rect x="149" y="302" width="27" height="12" rx="6" fill="#2a4368" />
              {/* sneakers planted on the ground (front view: upper + white sole + laces) */}
              <g transform="translate(137,316) rotate(-5)">
                <path d="M-12 -7 Q0 -11 12 -7 Q15 1 14 8 Q14 13 0 13 Q-14 13 -14 8 Q-15 1 -12 -7 Z" fill="url(#shoeGrad)" />
                <path d="M-14 8 Q0 15 14 8 Q14 13 0 14.5 Q-14 13 -14 8 Z" fill="#eef0f5" />
                <path d="M-4.5 -5 L4.5 -5 M-5.5 -1 L5.5 -1" stroke="#6a6a76" strokeWidth="1.5" strokeLinecap="round" />
              </g>
              <g transform="translate(163,316) rotate(5)">
                <path d="M-12 -7 Q0 -11 12 -7 Q15 1 14 8 Q14 13 0 13 Q-14 13 -14 8 Q-15 1 -12 -7 Z" fill="url(#shoeGrad)" />
                <path d="M-14 8 Q0 15 14 8 Q14 13 0 14.5 Q-14 13 -14 8 Z" fill="#e6e8ee" />
                <path d="M-4.5 -5 L4.5 -5 M-5.5 -1 L5.5 -1" stroke="#6a6a76" strokeWidth="1.5" strokeLinecap="round" />
              </g>

              {/* ---------------- Torso ---------------- */}
              <path d="M115 150 q35 -12 70 0 l8 56 q-43 18 -86 0 z" fill="url(#shirtBody)" />
              {/* highlight + shadow for volume */}
              <path d="M126 152 q10 -4 18 -2 l-4 56 q-12 -2 -20 -7 z" fill="#6ed3a4" opacity="0.45" filter="url(#blurMe)" />
              <path d="M170 152 q9 2 14 0 l7 52 q-20 9 -32 7 z" fill="#125a3a" opacity="0.55" filter="url(#blurMe)" />
              {/* collar + AO under chin */}
              <path d="M136 150 q14 13 28 0 q-14 10 -28 0 z" fill="#13522f" />
              <ellipse cx="150" cy="152" rx="20" ry="7" fill="#0f4a2b" opacity="0.5" filter="url(#blurMe)" />

              {/* ---------------- Arms (outstretched, palms up) ---------------- */}
              <path d="M128 154 Q108 168 92 178" stroke="url(#sleeveGrad)" strokeWidth="22" strokeLinecap="round" fill="none" />
              <path d="M94 177 Q78 172 64 162" stroke="url(#limbSkin)" strokeWidth="14.5" strokeLinecap="round" fill="none" />
              <path d="M94 174 Q80 169 66 160" stroke="#f7cfa6" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.5" />
              <path d="M172 154 Q192 168 208 178" stroke="url(#sleeveGrad)" strokeWidth="22" strokeLinecap="round" fill="none" />
              <path d="M206 177 Q222 172 236 162" stroke="url(#limbSkin)" strokeWidth="14.5" strokeLinecap="round" fill="none" />
              <path d="M206 174 Q220 169 234 160" stroke="#f7cfa6" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.5" />

              {/* open palms */}
              <g transform="translate(60,160) rotate(-18)">
                <ellipse cx="0" cy="0" rx="11" ry="7.5" fill="url(#limbSkin)" />
                <rect x="-10" y="-12" width="4.5" height="11" rx="2.2" fill="url(#limbSkin)" transform="rotate(-12 -10 -6)" />
                <rect x="-4" y="-13" width="4.5" height="12" rx="2.2" fill="url(#limbSkin)" />
                <rect x="2.5" y="-13" width="4.5" height="12" rx="2.2" fill="url(#limbSkin)" transform="rotate(8 4 -6)" />
                <rect x="8" y="-11" width="4.3" height="10" rx="2.1" fill="url(#limbSkin)" transform="rotate(18 10 -6)" />
                <ellipse cx="-12" cy="3" rx="5" ry="3.4" fill="url(#limbSkin)" transform="rotate(-30 -12 3)" />
              </g>
              <g transform="translate(240,160) rotate(18)">
                <ellipse cx="0" cy="0" rx="11" ry="7.5" fill="url(#limbSkin)" />
                <rect x="5.5" y="-12" width="4.5" height="11" rx="2.2" fill="url(#limbSkin)" transform="rotate(12 10 -6)" />
                <rect x="-0.5" y="-13" width="4.5" height="12" rx="2.2" fill="url(#limbSkin)" />
                <rect x="-7" y="-13" width="4.5" height="12" rx="2.2" fill="url(#limbSkin)" transform="rotate(-8 -4 -6)" />
                <rect x="-12.3" y="-11" width="4.3" height="10" rx="2.1" fill="url(#limbSkin)" transform="rotate(-18 -10 -6)" />
                <ellipse cx="12" cy="3" rx="5" ry="3.4" fill="url(#limbSkin)" transform="rotate(30 12 3)" />
              </g>

              {/* ---------------- Head ---------------- */}
              <g>
                <rect x="141" y="126" width="18" height="24" rx="9" fill="#cd8c58" />
                {/* hair back + bun */}
                <circle cx="150" cy="54" r="13" fill="url(#hairGrad)" />
                <path d="M114 92 q-7 -56 36 -58 q43 2 36 58 q-11 -28 -36 -28 q-25 0 -36 28 z" fill="url(#hairGrad)" />
                {/* hair gloss */}
                <path d="M126 70 q10 -20 30 -22" stroke="#80583a" strokeWidth="5" fill="none" opacity="0.55" strokeLinecap="round" filter="url(#blurMe)" />
                {/* face sphere */}
                <circle cx="150" cy="94" r="34" fill="url(#skinGrad)" />
                {/* cheek highlight */}
                <ellipse cx="138" cy="86" rx="9" ry="7" fill="#ffd9b0" opacity="0.4" filter="url(#blurMe)" />
                {/* ears */}
                <circle cx="117" cy="96" r="6" fill="#d2925f" />
                <circle cx="183" cy="96" r="6" fill="#d2925f" />
                {/* eyebrows */}
                <path d="M131 84 q7 -4 15 -1" stroke="#3a2818" strokeWidth="4.5" fill="none" strokeLinecap="round" />
                <path d="M154 83 q8 -3 15 1" stroke="#3a2818" strokeWidth="4.5" fill="none" strokeLinecap="round" />
                {/* eyes */}
                <circle cx="139" cy="93" r="3.2" fill="#2a211b" />
                <circle cx="161" cy="93" r="3.2" fill="#2a211b" />
                <circle cx="140.1" cy="92" r="1" fill="#fff" opacity="0.85" />
                <circle cx="162.1" cy="92" r="1" fill="#fff" opacity="0.85" />
                {/* nose */}
                <path d="M147 98 q3 7 6 1" stroke="#bf8055" strokeWidth="2.6" fill="none" strokeLinecap="round" />

                {/* ---- clean-shaven jaw: soft chin shading for volume ---- */}
                <ellipse cx="150" cy="120" rx="16" ry="7" fill="#c98a55" opacity="0.25" filter="url(#blurMe)" />

                {/* ---- big friendly smile ---- */}
                <path d="M136 105 Q150 122 164 105 Q150 113 136 105 Z" fill="#8a4a33" />
                {/* teeth */}
                <path d="M139.5 106.5 Q150 113.5 160.5 106.5 Q150 110 139.5 106.5 Z" fill="#ffffff" opacity="0.95" />
                {/* smile corner creases */}
                <path d="M133 103.5 q1.5 2.5 4 3.5" stroke="#bf8055" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.6" />
                <path d="M167 103.5 q-1.5 2.5 -4 3.5" stroke="#bf8055" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.6" />
                {/* happy blush */}
                <ellipse cx="130" cy="102" rx="5.5" ry="3.5" fill="#e89a6a" opacity="0.45" filter="url(#blurMe)" />
                <ellipse cx="170" cy="102" rx="5.5" ry="3.5" fill="#e89a6a" opacity="0.45" filter="url(#blurMe)" />
              </g>
            </g>

            {/* ============ Floating 3D PIE (above screen-left hand) ============ */}
            <g transform="translate(62,112)">
              <g className="obj-bob-a">
                <g ref={pieRef} style={{ transition: 'transform 0.3s ease-out' }}>
                  <path d="M-22 0 A22 13 0 0 0 22 0 L22 11 A22 13 0 0 1 -22 11 Z" fill="url(#pieSide)" />
                  <path d="M0 0 L0 -13 A22 13 0 0 1 12.93 10.52 Z" fill="#19b793" />
                  <path d="M0 0 L12.93 10.52 A22 13 0 0 1 -19.92 5.51 Z" fill="#f4715f" />
                  <path d="M0 0 L-19.92 5.51 A22 13 0 0 1 -15.05 -9.48 Z" fill="#f7a93a" />
                  <path d="M0 0 L-15.05 -9.48 A22 13 0 0 1 0 -13 Z" fill="#6e74f0" />
                  {/* gloss + rim */}
                  <ellipse cx="-6" cy="-4" rx="9" ry="4" fill="#ffffff" opacity="0.28" filter="url(#blurMe)" />
                  <ellipse cx="0" cy="0" rx="22" ry="13" fill="none" stroke="#ffffff" strokeWidth="1.3" opacity="0.85" />
                </g>
              </g>
            </g>

            {/* ============ Floating 3D COIN (above screen-right hand) ============ */}
            <g transform="translate(238,112)">
              <g className="obj-bob-b">
                <g ref={coinRef} style={{ transition: 'transform 0.3s ease-out' }}>
                  <path d="M-18 0 A18 11 0 0 0 18 0 L18 10 A18 11 0 0 1 -18 10 Z" fill="url(#coinSide)" />
                  <ellipse cx="0" cy="0" rx="18" ry="11" fill="url(#coinTop)" stroke="#d9a73f" strokeWidth="2" />
                  <ellipse cx="0" cy="0" rx="12" ry="7" fill="none" stroke="#d9a73f" strokeWidth="1.2" opacity="0.7" />
                  <ellipse cx="-5" cy="-3" rx="7" ry="3.4" fill="#ffffff" opacity="0.4" filter="url(#blurMe)" />
                  <text x="0" y="5.5" textAnchor="middle" fontSize="15" fontWeight="800" fill="#9c6e1b" fontFamily="system-ui, sans-serif">$</text>
                </g>
              </g>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
