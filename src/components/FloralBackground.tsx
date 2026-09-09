import React from 'react';

/**
 * FloralBackground Component
 * Renders delicate, subtle floral shadows and silhouette motifs in the background.
 * Uses soft SVG flowers, blooming twigs, and floating petals with gentle opacity.
 */
export const FloralBackground: React.FC = () => {
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

      {/* Top Left: Sakura / Cherry Blossom Branch Silhouette */}
      <div className="absolute -top-10 -left-12 w-80 sm:w-96 h-80 sm:h-96 opacity-60 filter drop-shadow-[0_8px_16px_rgba(244,114,182,0.12)] transform -rotate-12">
        <svg
          viewBox="0 0 300 300"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Stem */}
          <path
            d="M 10 10 Q 90 80 150 140 T 260 210"
            stroke="url(#flower-grad-1)"
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="url(#floral-soft-blur)"
          />
          {/* Sub twigs */}
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

          {/* Blossom 1 (Top) */}
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

          {/* Blossom 2 (Center branch) */}
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

          {/* Blossom 3 (Branch End) */}
          <g transform="translate(250, 205)" filter="url(#floral-soft-blur)">
            {[0, 72, 144, 216, 288].map((angle, i) => (
              <ellipse
                key={i}
                cx="0"
                cy="-12"
                rx="8"
                ry="13"
                fill="url(#flower-grad-1)"
                transform={`rotate(${angle})`}
              />
            ))}
            <circle cx="0" cy="0" r="4" fill="#f472b6" opacity="0.3" />
          </g>

          {/* Small buds */}
          <circle cx="70" cy="50" r="6" fill="url(#flower-grad-2)" />
          <circle cx="215" cy="155" r="5" fill="url(#flower-grad-1)" />
          <circle cx="120" cy="170" r="5" fill="url(#flower-grad-2)" />
        </svg>
      </div>

      {/* Top Right: Graceful Flower Silhouette */}
      <div className="absolute -top-14 -right-14 w-72 sm:w-96 h-72 sm:h-96 opacity-55 filter drop-shadow-[0_8px_20px_rgba(251,113,133,0.14)] transform rotate-45">
        <svg
          viewBox="0 0 300 300"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Stem arch */}
          <path
            d="M 290 10 Q 180 80 120 160 T 40 280"
            stroke="url(#flower-grad-2)"
            strokeWidth="3"
            strokeLinecap="round"
            filter="url(#floral-soft-blur)"
          />

          {/* Large Blooming Rose/Lotus Silhouette */}
          <g transform="translate(130, 150)" filter="url(#floral-soft-blur)">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <path
                key={i}
                d="M 0 0 C -12 -15, -16 -32, 0 -42 C 16 -32, 12 -15, 0 0 Z"
                fill="url(#flower-grad-2)"
                transform={`rotate(${angle})`}
              />
            ))}
            <circle cx="0" cy="0" r="8" fill="#fda4af" opacity="0.4" />
          </g>

          {/* Secondary smaller flower */}
          <g transform="translate(220, 70)" filter="url(#floral-soft-blur)">
            {[0, 60, 120, 180, 240, 300].map((angle, i) => (
              <ellipse
                key={i}
                cx="0"
                cy="-13"
                rx="8"
                ry="14"
                fill="url(#flower-grad-1)"
                transform={`rotate(${angle})`}
              />
            ))}
            <circle cx="0" cy="0" r="4" fill="#fb7185" opacity="0.3" />
          </g>
        </svg>
      </div>

      {/* Bottom Left: Delicate Botanical Branch & Blossom */}
      <div className="absolute -bottom-16 -left-12 w-80 sm:w-[420px] h-80 sm:h-[420px] opacity-50 filter drop-shadow-[0_4px_16px_rgba(244,114,182,0.12)] transform rotate-15">
        <svg
          viewBox="0 0 350 350"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 20 330 Q 120 250 180 180 T 320 80"
            stroke="url(#flower-grad-1)"
            strokeWidth="3"
            strokeLinecap="round"
            filter="url(#floral-soft-blur)"
          />
          {/* Leaves */}
          <path
            d="M 120 250 Q 150 220 180 230 Q 160 260 120 250 Z"
            fill="url(#flower-grad-1)"
            opacity="0.6"
          />
          <path
            d="M 220 150 Q 250 130 270 140 Q 250 170 220 150 Z"
            fill="url(#flower-grad-2)"
            opacity="0.6"
          />

          {/* Main Flower */}
          <g transform="translate(180, 180)" filter="url(#floral-soft-blur)">
            {[0, 60, 120, 180, 240, 300].map((angle, i) => (
              <path
                key={i}
                d="M 0 0 C -10 -15, -14 -28, 0 -36 C 14 -28, 10 -15, 0 0 Z"
                fill="url(#flower-grad-1)"
                transform={`rotate(${angle})`}
              />
            ))}
            <circle cx="0" cy="0" r="7" fill="#f472b6" opacity="0.35" />
          </g>

          {/* Smaller blossom */}
          <g transform="translate(300, 95)" filter="url(#floral-soft-blur)">
            {[0, 72, 144, 216, 288].map((angle, i) => (
              <ellipse
                key={i}
                cx="0"
                cy="-11"
                rx="7"
                ry="12"
                fill="url(#flower-grad-2)"
                transform={`rotate(${angle})`}
              />
            ))}
            <circle cx="0" cy="0" r="4" fill="#fb7185" opacity="0.3" />
          </g>
        </svg>
      </div>

      {/* Bottom Right: Soft Floral Silhouette */}
      <div className="absolute -bottom-12 -right-10 w-72 sm:w-88 h-72 sm:h-88 opacity-50 filter drop-shadow-[0_4px_16px_rgba(251,113,133,0.12)] transform -rotate-15">
        <svg
          viewBox="0 0 300 300"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g transform="translate(200, 200)" filter="url(#floral-soft-blur)">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <ellipse
                key={i}
                cx="0"
                cy="-22"
                rx="12"
                ry="22"
                fill="url(#flower-grad-2)"
                transform={`rotate(${angle})`}
              />
            ))}
            <circle cx="0" cy="0" r="9" fill="#fda4af" opacity="0.4" />
          </g>
        </svg>
      </div>

      {/* Floating Soft Petals in the Background */}
      {/* Petal 1 (Mid Left) */}
      <div className="absolute top-1/4 left-10 sm:left-24 w-8 h-12 opacity-40 transform rotate-45 filter drop-shadow-sm">
        <svg viewBox="0 0 30 45" className="w-full h-full">
          <path
            d="M 15 0 C 0 15, 0 35, 15 45 C 30 35, 30 15, 15 0 Z"
            fill="url(#petal-grad)"
          />
        </svg>
      </div>

      {/* Petal 2 (Mid Right) */}
      <div className="absolute top-1/3 right-12 sm:right-28 w-10 h-14 opacity-40 transform -rotate-30 filter drop-shadow-sm">
        <svg viewBox="0 0 30 45" className="w-full h-full">
          <path
            d="M 15 0 C 0 15, 0 35, 15 45 C 30 35, 30 15, 15 0 Z"
            fill="url(#petal-grad)"
          />
        </svg>
      </div>

      {/* Petal 3 (Lower Center) */}
      <div className="absolute bottom-28 left-1/3 w-7 h-10 opacity-35 transform rotate-75 filter drop-shadow-sm">
        <svg viewBox="0 0 30 45" className="w-full h-full">
          <path
            d="M 15 0 C 0 15, 0 35, 15 45 C 30 35, 30 15, 15 0 Z"
            fill="url(#petal-grad)"
          />
        </svg>
      </div>

      {/* Petal 4 (Upper Center) */}
      <div className="absolute top-16 left-1/2 w-8 h-11 opacity-30 transform -rotate-15 filter drop-shadow-sm">
        <svg viewBox="0 0 30 45" className="w-full h-full">
          <path
            d="M 15 0 C 0 15, 0 35, 15 45 C 30 35, 30 15, 15 0 Z"
            fill="url(#petal-grad)"
          />
        </svg>
      </div>
    </div>
  );
};
