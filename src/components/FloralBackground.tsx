import React from 'react';
import { AppTheme } from '../types';

interface FloralBackgroundProps {
  theme?: AppTheme;
}

/**
 * FloralBackground Component
 * Renders delicate, subtle nature shadows and motifs in the background.
 * Theme-aware:
 * - 'blossom': soft cherry blossom twigs and petals
 * - 'ocean': soft azure water ripples, bubbles, and sea breezes
 * - 'sage': olive branch leaves and soothing sage foliage
 */
export const FloralBackground: React.FC<FloralBackgroundProps> = ({ theme = 'blossom' }) => {
  if (theme === 'ocean') {
    return (
      <div
        className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0"
        aria-hidden="true"
      >
        <svg className="absolute w-0 h-0">
          <defs>
            <linearGradient id="ocean-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.10" />
            </linearGradient>
            <linearGradient id="ocean-grad-2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.08" />
            </linearGradient>
          </defs>
        </svg>

        {/* Ambient Top Glow */}
        <div className="absolute -top-24 -left-20 w-96 h-96 rounded-full bg-sky-200/25 blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-[32rem] h-[32rem] rounded-full bg-blue-200/20 blur-3xl" />
        <div className="absolute -bottom-20 left-1/4 w-96 h-96 rounded-full bg-cyan-100/30 blur-3xl" />

        {/* Floating Bubble/Wave Accents */}
        <div className="absolute top-16 left-8 opacity-40">
          <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
            <circle cx="40" cy="40" r="30" stroke="url(#ocean-grad-1)" strokeWidth="1.5" />
            <circle cx="70" cy="25" r="15" stroke="url(#ocean-grad-2)" strokeWidth="1" />
          </svg>
        </div>

        <div className="absolute bottom-24 right-10 opacity-35">
          <svg width="140" height="140" viewBox="0 0 100 100" fill="none">
            <path
              d="M10 50 Q 30 20, 50 50 T 90 50"
              stroke="url(#ocean-grad-1)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M10 70 Q 30 40, 50 70 T 90 70"
              stroke="url(#ocean-grad-2)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    );
  }

  if (theme === 'sage') {
    return (
      <div
        className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0"
        aria-hidden="true"
      >
        <svg className="absolute w-0 h-0">
          <defs>
            <linearGradient id="sage-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.10" />
            </linearGradient>
            <linearGradient id="sage-grad-2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0.08" />
            </linearGradient>
          </defs>
        </svg>

        {/* Ambient Top Glow */}
        <div className="absolute -top-24 -left-20 w-96 h-96 rounded-full bg-emerald-200/25 blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-[32rem] h-[32rem] rounded-full bg-teal-200/20 blur-3xl" />
        <div className="absolute -bottom-20 left-1/4 w-96 h-96 rounded-full bg-emerald-100/30 blur-3xl" />

        {/* Top Left Leaf Foliage */}
        <div className="absolute -top-6 -left-8 w-72 h-72 opacity-50">
          <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
            <path
              d="M20 20 Q 80 80, 140 140"
              stroke="url(#sage-grad-1)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Leaves */}
            <path
              d="M60 50 Q 80 30, 95 55 Q 75 75, 60 50 Z"
              fill="url(#sage-grad-2)"
            />
            <path
              d="M90 85 Q 120 70, 130 95 Q 105 110, 90 85 Z"
              fill="url(#sage-grad-1)"
            />
            <path
              d="M120 120 Q 150 110, 155 135 Q 130 145, 120 120 Z"
              fill="url(#sage-grad-2)"
            />
          </svg>
        </div>

        {/* Bottom Right Olive Twig */}
        <div className="absolute -bottom-10 -right-8 w-80 h-80 opacity-45 transform rotate-180">
          <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
            <path
              d="M20 20 Q 80 80, 140 140"
              stroke="url(#sage-grad-1)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M60 50 Q 80 30, 95 55 Q 75 75, 60 50 Z"
              fill="url(#sage-grad-2)"
            />
            <path
              d="M90 85 Q 120 70, 130 95 Q 105 110, 90 85 Z"
              fill="url(#sage-grad-1)"
            />
          </svg>
        </div>
      </div>
    );
  }

  // Default: Blossom (Cherry Blossom / Rose Soft)
  return (
    <div
      className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0"
      aria-hidden="true"
    >
      <svg className="absolute w-0 h-0">
        <defs>
          <linearGradient id="flower-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f472b6" stopOpacity="0.28" />
            <stop offset="50%" stopColor="#fb7185" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0.10" />
          </linearGradient>

          <linearGradient id="flower-grad-2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fb7185" stopOpacity="0.25" />
            <stop offset="60%" stopColor="#f472b6" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#fda4af" stopOpacity="0.08" />
          </linearGradient>

          <linearGradient id="petal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#f472b6" stopOpacity="0.08" />
          </linearGradient>

          <filter id="floral-soft-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
        </defs>
      </svg>

      {/* Top Left: Sakura Branch Silhouette */}
      <div className="absolute -top-10 -left-12 w-80 sm:w-96 h-80 sm:h-96 opacity-60 filter drop-shadow-[0_8px_16px_rgba(244,114,182,0.12)] transform -rotate-12">
        <svg
          viewBox="0 0 300 300"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 10 10 Q 90 80 150 140 T 260 210"
            stroke="url(#flower-grad-1)"
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="url(#floral-soft-blur)"
          />
          <path
            d="M 90 80 Q 140 60 190 70"
            stroke="url(#flower-grad-1)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M 150 140 Q 180 170 210 160"
            stroke="url(#flower-grad-1)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <g transform="translate(190, 70)" filter="url(#floral-soft-blur)">
            {[0, 72, 144, 216, 288].map((angle, i) => (
              <ellipse
                key={i}
                cx="0"
                cy="-14"
                rx="9"
                ry="15"
                fill="url(#flower-grad-1)"
                transform={`rotate(${angle})`}
              />
            ))}
            <circle cx="0" cy="0" r="5" fill="#f43f5e" opacity="0.3" />
          </g>

          <g transform="translate(140, 130)" filter="url(#floral-soft-blur)">
            {[0, 72, 144, 216, 288].map((angle, i) => (
              <ellipse
                key={i}
                cx="0"
                cy="-18"
                rx="11"
                ry="18"
                fill="url(#flower-grad-2)"
                transform={`rotate(${angle})`}
              />
            ))}
            <circle cx="0" cy="0" r="6" fill="#fb7185" opacity="0.3" />
          </g>
        </svg>
      </div>

      {/* Bottom Right Branch Silhouette */}
      <div className="absolute -bottom-16 -right-16 w-80 sm:w-[28rem] h-80 sm:h-[28rem] opacity-55 filter drop-shadow-[0_8px_16px_rgba(251,113,133,0.12)] transform rotate-180">
        <svg
          viewBox="0 0 300 300"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 20 20 Q 100 90 170 150 T 270 220"
            stroke="url(#flower-grad-2)"
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="url(#floral-soft-blur)"
          />
          <g transform="translate(170, 150)" filter="url(#floral-soft-blur)">
            {[0, 72, 144, 216, 288].map((angle, i) => (
              <ellipse
                key={i}
                cx="0"
                cy="-16"
                rx="10"
                ry="16"
                fill="url(#flower-grad-1)"
                transform={`rotate(${angle})`}
              />
            ))}
            <circle cx="0" cy="0" r="5.5" fill="#f43f5e" opacity="0.25" />
          </g>
        </svg>
      </div>

      {/* Ambient background blur circles */}
      <div className="absolute -top-24 -left-20 w-96 h-96 rounded-full bg-pink-200/25 blur-3xl" />
      <div className="absolute top-1/3 -right-24 w-[32rem] h-[32rem] rounded-full bg-rose-200/20 blur-3xl" />
      <div className="absolute -bottom-20 left-1/4 w-96 h-96 rounded-full bg-pink-100/30 blur-3xl" />
    </div>
  );
};
