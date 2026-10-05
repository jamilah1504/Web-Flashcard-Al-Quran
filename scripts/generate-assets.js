import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. App Icon SVG (512x512) with Beautiful Rose-Pink & Gold Palette
const iconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Rose-Pink Velvet Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#be123c" />
      <stop offset="35%" stop-color="#9f1239" />
      <stop offset="70%" stop-color="#881337" />
      <stop offset="100%" stop-color="#4c0519" />
    </linearGradient>

    <!-- Warm Rose-Gold Accent Gradient -->
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff1f2" />
      <stop offset="25%" stop-color="#fef08a" />
      <stop offset="60%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>

    <!-- Soft Rose Glow Gradient -->
    <radialGradient id="glowGrad" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="#fda4af" stop-opacity="0.45" />
      <stop offset="50%" stop-color="#f43f5e" stop-opacity="0.18" />
      <stop offset="100%" stop-color="#881337" stop-opacity="0" />
    </radialGradient>

    <!-- Drop Shadow -->
    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#2a030d" flood-opacity="0.55" />
    </filter>
  </defs>

  <!-- Background Base with Rounded Corners -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />

  <!-- Subtle Islamic Geometric Watermark Stars (in soft blush white) -->
  <g opacity="0.10" stroke="#ffffff" stroke-width="2" fill="none">
    <rect x="156" y="156" width="200" height="200" transform="rotate(45 256 256)" rx="8" />
    <rect x="156" y="156" width="200" height="200" rx="8" />
    <circle cx="256" cy="256" r="160" />
    <circle cx="256" cy="256" r="210" stroke-dasharray="8 8" />
  </g>

  <!-- Ambient Glow Behind Quran -->
  <circle cx="256" cy="245" r="150" fill="url(#glowGrad)" />

  <!-- Outer Decorative Rose-Gold Ring (Safe Zone Border) -->
  <circle cx="256" cy="256" r="195" fill="none" stroke="url(#goldGrad)" stroke-width="3" opacity="0.65" stroke-dasharray="16 8" />
  <circle cx="256" cy="256" r="185" fill="none" stroke="url(#goldGrad)" stroke-width="1.5" opacity="0.4" />

  <!-- Crescent and Star at Top -->
  <g transform="translate(256, 126)" filter="url(#dropShadow)">
    <path d="M -2, -26 A 20 20 0 1 0 16 10 A 15 15 0 1 1 -2 -26 Z" fill="url(#goldGrad)" />
    <polygon points="9,-6 11,-1 16,-1 12,2 14,7 9,4 5,7 6,2 3,-1 8,-1" fill="url(#goldGrad)" />
  </g>

  <!-- The Open Al-Qur'an (Rehal & Mushaf Pages) -->
  <g filter="url(#dropShadow)">
    <!-- Wooden Rehal / Bookstand base in deep rich rosewood mahogany -->
    <path d="M 120 338 L 190 385 L 256 345 L 322 385 L 392 338 L 368 322 L 322 355 L 256 320 L 190 355 L 144 322 Z" fill="#701a2c" opacity="0.95" />
    <path d="M 190 385 L 256 345 L 322 385" stroke="url(#goldGrad)" stroke-width="4" fill="none" stroke-linejoin="round" />

    <!-- Quran Binding Backing Cover (Deep Velvet Rose with Gold Trim) -->
    <path d="M 126 312 C 180 326, 230 310, 256 304 C 282 310, 332 326, 386 312 L 396 206 C 340 218, 288 202, 256 196 C 224 202, 172 218, 116 206 Z" fill="#9f1239" stroke="url(#goldGrad)" stroke-width="3" />

    <!-- Quran Right & Left Under Pages -->
    <path d="M 132 305 C 182 318, 230 304, 256 298 C 282 304, 330 318, 380 305 L 388 202 C 334 213, 286 200, 256 195 C 226 200, 178 213, 124 202 Z" fill="#fdf2f8" opacity="0.8" />

    <!-- Left Main Page (Aesthetic Warm Blush Cream) -->
    <path d="M 128 296 C 180 310, 226 296, 256 288 L 256 182 C 226 190, 178 202, 122 192 Z" fill="#fff5f5" stroke="#fbcfe8" stroke-width="1.5" />
    <!-- Left Page Subtle Text Lines in Warm Rosewood -->
    <g opacity="0.4" stroke="#881337" stroke-width="2.5" stroke-linecap="round">
      <line x1="150" y1="216" x2="236" y2="210" />
      <line x1="146" y1="232" x2="238" y2="226" />
      <line x1="144" y1="248" x2="238" y2="242" />
      <line x1="146" y1="264" x2="236" y2="258" />
      <line x1="156" y1="280" x2="224" y2="274" />
    </g>

    <!-- Right Main Page -->
    <path d="M 384 296 C 332 310, 286 296, 256 288 L 256 182 C 286 190, 334 202, 390 192 Z" fill="#fff5f5" stroke="#fbcfe8" stroke-width="1.5" />
    <!-- Right Page Subtle Text Lines -->
    <g opacity="0.4" stroke="#881337" stroke-width="2.5" stroke-linecap="round">
      <line x1="276" y1="210" x2="362" y2="216" />
      <line x1="274" y1="226" x2="366" y2="232" />
      <line x1="274" y1="242" x2="368" y2="248" />
      <line x1="276" y1="258" x2="366" y2="264" />
      <line x1="288" y1="274" x2="356" y2="280" />
    </g>

    <!-- Quran Center Spine -->
    <path d="M 254 182 L 254 292 L 258 292 L 258 182 Z" fill="#9f1239" opacity="0.6" />

    <!-- Silk Bookmark Ribbon in Vibrant Petal Rose -->
    <path d="M 256 184 Q 262 250 274 320 L 262 314 L 250 322 Q 254 250 256 184 Z" fill="#fb7185" />
    <path d="M 274 320 L 262 314 L 250 322" stroke="#f43f5e" stroke-width="1.5" fill="none" />

    <!-- Golden Header Ornaments -->
    <circle cx="192" cy="204" r="3" fill="#f59e0b" />
    <circle cx="320" cy="204" r="3" fill="#f59e0b" />
  </g>

  <!-- Typography at Bottom: "HafalanKu" -->
  <g transform="translate(256, 428)">
    <rect x="-95" y="-24" width="190" height="38" rx="19" fill="#4c0519" fill-opacity="0.9" stroke="url(#goldGrad)" stroke-width="1.5" />
    <text x="0" y="2" text-anchor="middle" font-family="'Plus Jakarta Sans', 'Poppins', sans-serif" font-weight="700" font-size="20" fill="#fef08a" letter-spacing="1.5">HafalanKu</text>
  </g>
</svg>
`;

// 2. Maskable Icon SVG (512x512) with Rose-Pink Full-Bleed Background
const maskableIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="mBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#be123c" />
      <stop offset="35%" stop-color="#9f1239" />
      <stop offset="70%" stop-color="#881337" />
      <stop offset="100%" stop-color="#4c0519" />
    </linearGradient>

    <linearGradient id="mGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff1f2" />
      <stop offset="30%" stop-color="#fef08a" />
      <stop offset="70%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>

    <radialGradient id="mGlowGrad" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="#fda4af" stop-opacity="0.5" />
      <stop offset="60%" stop-color="#881337" stop-opacity="0" />
    </radialGradient>

    <filter id="mDropShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#2a030d" flood-opacity="0.5" />
    </filter>
  </defs>

  <!-- Full-bleed background for maskable cropping -->
  <rect width="512" height="512" fill="url(#mBgGrad)" />

  <!-- Ambient Rose Glow -->
  <circle cx="256" cy="250" r="160" fill="url(#mGlowGrad)" />

  <!-- Inner Scale Container: Scaled to 78% for Android 80% safe zone circle -->
  <g transform="translate(256, 256) scale(0.78) translate(-256, -256)">
    <!-- Decorative Islamic Stars Pattern -->
    <g opacity="0.12" stroke="#ffffff" stroke-width="2" fill="none">
      <rect x="156" y="156" width="200" height="200" transform="rotate(45 256 256)" rx="8" />
      <rect x="156" y="156" width="200" height="200" rx="8" />
      <circle cx="256" cy="256" r="170" />
    </g>

    <!-- Outer Decorative Ring -->
    <circle cx="256" cy="256" r="195" fill="none" stroke="url(#mGoldGrad)" stroke-width="3" opacity="0.7" stroke-dasharray="16 8" />

    <!-- Crescent and Star -->
    <g transform="translate(256, 126)" filter="url(#mDropShadow)">
      <path d="M -2, -26 A 20 20 0 1 0 16 10 A 15 15 0 1 1 -2 -26 Z" fill="url(#mGoldGrad)" />
      <polygon points="9,-6 11,-1 16,-1 12,2 14,7 9,4 5,7 6,2 3,-1 8,-1" fill="url(#mGoldGrad)" />
    </g>

    <!-- Open Quran -->
    <g filter="url(#mDropShadow)">
      <path d="M 120 338 L 190 385 L 256 345 L 322 385 L 392 338 L 368 322 L 322 355 L 256 320 L 190 355 L 144 322 Z" fill="#701a2c" opacity="0.95" />
      <path d="M 190 385 L 256 345 L 322 385" stroke="url(#mGoldGrad)" stroke-width="4" fill="none" stroke-linejoin="round" />

      <path d="M 126 312 C 180 326, 230 310, 256 304 C 282 310, 332 326, 386 312 L 396 206 C 340 218, 288 202, 256 196 C 224 202, 172 218, 116 206 Z" fill="#9f1239" stroke="url(#mGoldGrad)" stroke-width="3" />

      <path d="M 132 305 C 182 318, 230 304, 256 298 C 282 304, 330 318, 380 305 L 388 202 C 334 213, 286 200, 256 195 C 226 200, 178 213, 124 202 Z" fill="#fdf2f8" opacity="0.8" />

      <!-- Left Page -->
      <path d="M 128 296 C 180 310, 226 296, 256 288 L 256 182 C 226 190, 178 202, 122 192 Z" fill="#fff5f5" stroke="#fbcfe8" stroke-width="1.5" />
      <g opacity="0.4" stroke="#881337" stroke-width="2.5" stroke-linecap="round">
        <line x1="150" y1="216" x2="236" y2="210" />
        <line x1="146" y1="232" x2="238" y2="226" />
        <line x1="144" y1="248" x2="238" y2="242" />
        <line x1="146" y1="264" x2="236" y2="258" />
        <line x1="156" y1="280" x2="224" y2="274" />
      </g>

      <!-- Right Page -->
      <path d="M 384 296 C 332 310, 286 296, 256 288 L 256 182 C 286 190, 334 202, 390 192 Z" fill="#fff5f5" stroke="#fbcfe8" stroke-width="1.5" />
      <g opacity="0.4" stroke="#881337" stroke-width="2.5" stroke-linecap="round">
        <line x1="276" y1="210" x2="362" y2="216" />
        <line x1="274" y1="226" x2="366" y2="232" />
        <line x1="274" y1="242" x2="368" y2="248" />
        <line x1="276" y1="258" x2="366" y2="264" />
        <line x1="288" y1="274" x2="356" y2="280" />
      </g>

      <!-- Ribbon in Rose-Pink -->
      <path d="M 256 184 Q 262 250 274 320 L 262 314 L 250 322 Q 254 250 256 184 Z" fill="#fb7185" />
    </g>

    <!-- Typography -->
    <g transform="translate(256, 428)">
      <rect x="-95" y="-24" width="190" height="38" rx="19" fill="#4c0519" fill-opacity="0.9" stroke="url(#mGoldGrad)" stroke-width="1.5" />
      <text x="0" y="2" text-anchor="middle" font-family="'Plus Jakarta Sans', 'Poppins', sans-serif" font-weight="700" font-size="20" fill="#fef08a" letter-spacing="1.5">HafalanKu</text>
    </g>
  </g>
</svg>
`;

// 3. OpenGraph / Twitter Card Social Cover (1200 x 630 px) with Aesthetic Rose-Pink Theme
const ogCoverSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <!-- Background Gradient: Velvet Rose to Deep Ruby & Soft Petal Glow -->
    <linearGradient id="ogBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4c0519" />
      <stop offset="35%" stop-color="#881337" />
      <stop offset="70%" stop-color="#be123c" />
      <stop offset="100%" stop-color="#4c0519" />
    </linearGradient>

    <!-- Golden Rose Gradient for Main Title -->
    <linearGradient id="ogGold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#fff1f2" />
      <stop offset="30%" stop-color="#fef08a" />
      <stop offset="70%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>

    <!-- Card Background Gradient -->
    <linearGradient id="cardBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#fff5f7" />
    </linearGradient>

    <!-- Soft Rose Ambient Glows -->
    <radialGradient id="ogGlow" cx="20%" cy="30%" r="55%">
      <stop offset="0%" stop-color="#fb7185" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#881337" stop-opacity="0" />
    </radialGradient>

    <radialGradient id="ogRightGlow" cx="75%" cy="50%" r="65%">
      <stop offset="0%" stop-color="#fda4af" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#9f1239" stop-opacity="0" />
    </radialGradient>

    <filter id="ogShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#2a030d" flood-opacity="0.65" />
    </filter>

    <filter id="badgeShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.25" />
    </filter>
  </defs>

  <!-- Base Canvas -->
  <rect width="1200" height="630" fill="url(#ogBg)" />

  <!-- Ambient Glows -->
  <rect width="1200" height="630" fill="url(#ogGlow)" />
  <rect width="1200" height="630" fill="url(#ogRightGlow)" />

  <!-- Subtle Islamic Geometric Watermark Stars -->
  <g opacity="0.08" stroke="#ffffff" stroke-width="2.5" fill="none">
    <rect x="700" y="50" width="300" height="300" transform="rotate(45 850 200)" />
    <rect x="700" y="50" width="300" height="300" />
    <circle cx="850" cy="200" r="240" />
    <circle cx="850" cy="200" r="300" stroke-dasharray="12 12" />

    <rect x="950" y="320" width="220" height="220" transform="rotate(45 1060 430)" />
    <circle cx="1060" cy="430" r="180" />
  </g>

  <!-- Floating Sparkles in Background -->
  <g fill="#fef08a" opacity="0.6">
    <circle cx="120" cy="180" r="3" />
    <circle cx="560" cy="90" r="4" />
    <circle cx="610" cy="560" r="3" />
    <circle cx="280" cy="540" r="3.5" />
  </g>

  <!-- Left Side: App Branding & Information -->
  <g transform="translate(80, 80)">
    <!-- Small Category Pill in Soft Rose -->
    <g filter="url(#badgeShadow)">
      <rect x="0" y="0" width="280" height="36" rx="18" fill="#9f1239" fill-opacity="0.85" stroke="url(#ogGold)" stroke-width="1.5" />
      <circle cx="18" cy="18" r="5" fill="#fb7185" />
      <text x="32" y="23" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="13" fill="#fef08a" letter-spacing="1">🌸 APLIKASI QUR'AN ESTETIK</text>
    </g>

    <!-- Main Title with Glowing Typography -->
    <g transform="translate(0, 75)">
      <!-- App Name -->
      <text x="0" y="50" font-family="'Plus Jakarta Sans', 'Poppins', sans-serif" font-weight="900" font-size="64" fill="url(#ogGold)" letter-spacing="-1">HafalanKu</text>
      
      <!-- Subtitle -->
      <text x="0" y="98" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="28" fill="#ffffff" letter-spacing="-0.5">Al-Qur'an Hafalan &amp; Belajar</text>

      <!-- Description / Tagline in Soft Blush -->
      <text x="0" y="142" font-family="'Plus Jakarta Sans', sans-serif" font-weight="400" font-size="18" fill="#fce7f3">
        Aplikasi estetik &amp; ramah pemula: Muroja'ah flashcard tebak ayat,
      </text>
      <text x="0" y="168" font-family="'Plus Jakarta Sans', sans-serif" font-weight="400" font-size="18" fill="#fce7f3">
        panduan tajwid berwarna, audio murottal, &amp; sinkronisasi Google Sheets.
      </text>
    </g>

    <!-- Feature Badges Grid with Rose Palette -->
    <g transform="translate(0, 310)" filter="url(#badgeShadow)">
      <!-- Badge 1: Flashcard & Mushaf -->
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="220" height="44" rx="12" fill="#881337" stroke="#fb7185" stroke-width="1.2" />
        <text x="16" y="27" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="14" fill="#fff1f2">🎴 Flashcard &amp; Mushaf</text>
      </g>

      <!-- Badge 2: Tajwid Berwarna -->
      <g transform="translate(236, 0)">
        <rect x="0" y="0" width="220" height="44" rx="12" fill="#881337" stroke="#fb7185" stroke-width="1.2" />
        <text x="16" y="27" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="14" fill="#fff1f2">🎨 Tajwid Berwarna</text>
      </g>

      <!-- Badge 3: Audio Murottal -->
      <g transform="translate(0, 56)">
        <rect x="0" y="0" width="220" height="44" rx="12" fill="#881337" stroke="#fb7185" stroke-width="1.2" />
        <text x="16" y="27" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="14" fill="#fff1f2">🎙️ Audio Per Ayat</text>
      </g>

      <!-- Badge 4: Google Sheets Cloud -->
      <g transform="translate(236, 56)">
        <rect x="0" y="0" width="220" height="44" rx="12" fill="#881337" stroke="#fb7185" stroke-width="1.2" />
        <text x="16" y="27" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="14" fill="#fff1f2">☁️ Google Sheets Sync</text>
      </g>
    </g>

    <!-- Bottom URL / Brand Footer -->
    <g transform="translate(0, 448)">
      <circle cx="8" cy="8" r="8" fill="#fb7185" />
      <text x="26" y="13" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="16" fill="#fbcfe8">Ramah Pemula • PWA Siap Pasang di Layar Utama HP</text>
    </g>
  </g>

  <!-- Right Side: Beautiful App Preview Card Mockup -->
  <g transform="translate(640, 70)" filter="url(#ogShadow)">
    <!-- Behind Back Card Tilt -->
    <g transform="rotate(4 250 250)">
      <rect x="0" y="0" width="460" height="490" rx="28" fill="#9f1239" opacity="0.6" stroke="#fb7185" stroke-width="1.5" />
    </g>

    <!-- Main Front Card (Flashcard Preview) -->
    <g transform="rotate(-1 250 250)">
      <rect x="0" y="0" width="470" height="490" rx="28" fill="url(#cardBg)" stroke="#fbcfe8" stroke-width="2" />

      <!-- Card Top Bar: Surah Header in Soft Pink -->
      <g transform="translate(24, 22)">
        <rect x="0" y="0" width="422" height="48" rx="14" fill="#fdf2f8" stroke="#fbcfe8" stroke-width="1" />
        <text x="18" y="30" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="15" fill="#9f1239">SURAH AL-FATIHAH : AYAT 1</text>
        
        <!-- Status Pill: Lancar in Rose-Pink -->
        <rect x="316" y="10" width="92" height="28" rx="14" fill="#f43f5e" />
        <text x="362" y="28" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="12" fill="#ffffff">✓ Lancar</text>
      </g>

      <!-- Arabic Quran Verse with Tajwid colors -->
      <g transform="translate(235, 175)">
        <text x="0" y="0" text-anchor="middle" font-family="'Amiri', 'Scheherazade New', serif" font-weight="700" font-size="38" fill="#1e293b" letter-spacing="1">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </text>
      </g>

      <!-- Transliteration Latin -->
      <g transform="translate(24, 226)">
        <text x="211" y="0" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-style="italic" font-size="15" fill="#64748b">
          "Bismillāhir-raḥmānir-raḥīm"
        </text>
      </g>

      <!-- Indonesian Translation -->
      <g transform="translate(40, 260)">
        <rect x="0" y="0" width="390" height="54" rx="12" fill="#ffffff" stroke="#fce7f3" stroke-width="1" />
        <text x="195" y="33" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" fill="#334155">
          "Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang."
        </text>
      </g>

      <!-- Tajwid Guide Pill Indicator in Pink -->
      <g transform="translate(40, 332)">
        <rect x="0" y="0" width="390" height="42" rx="10" fill="#fff1f2" stroke="#fecdd3" stroke-width="1" />
        <circle cx="20" cy="21" r="6" fill="#f43f5e" />
        <text x="36" y="26" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="13" fill="#9f1239">Panduan Tajwid: Ghunnah &amp; Idgham Otomatis</text>
      </g>

      <!-- Action Buttons Mockup at Bottom of Card in Rose-Pink -->
      <g transform="translate(40, 396)">
        <!-- Play Audio Button -->
        <rect x="0" y="0" width="180" height="44" rx="12" fill="#be123c" />
        <text x="90" y="27" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="14" fill="#ffffff">▶ Putar Audio</text>

        <!-- Flip Flashcard Button -->
        <rect x="200" y="0" width="190" height="44" rx="12" fill="#f43f5e" />
        <text x="295" y="27" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="14" fill="#ffffff">🔄 Balik Kartu</text>
      </g>

      <!-- Small floating decorative icon -->
      <g transform="translate(390, 420)">
        <circle cx="25" cy="25" r="22" fill="#f43f5e" stroke="#ffffff" stroke-width="2" />
        <text x="25" y="31" text-anchor="middle" font-family="sans-serif" font-size="16">🌸</text>
      </g>
    </g>
  </g>
</svg>
`;

async function generateAll() {
  console.log('Generating pink & gold vector and PNG assets for PWA and Social Share...');

  // Write base SVG
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), iconSvg.trim());
  console.log('✓ Wrote public/icon.svg (pink & gold)');

  const iconBuffer = Buffer.from(iconSvg);
  const maskableBuffer = Buffer.from(maskableIconSvg);
  const ogCoverBuffer = Buffer.from(ogCoverSvg);

  // 1. Apple Touch Icon (180x180 png for iOS Safari)
  await sharp(iconBuffer)
    .resize(180, 180)
    .png({ quality: 95 })
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ Generated public/apple-touch-icon.png (180x180)');

  // 2. PWA Standard 192x192
  await sharp(iconBuffer)
    .resize(192, 192)
    .png({ quality: 95 })
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('✓ Generated public/pwa-192x192.png (192x192)');

  // 3. PWA Standard 512x512
  await sharp(iconBuffer)
    .resize(512, 512)
    .png({ quality: 95 })
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('✓ Generated public/pwa-512x512.png (512x512)');

  // 4. PWA Maskable 512x512 (with safe-zone margins)
  await sharp(maskableBuffer)
    .resize(512, 512)
    .png({ quality: 95 })
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('✓ Generated public/pwa-maskable-512x512.png (512x512 maskable)');

  // 5. Favicon 32x32 and 16x16
  await sharp(iconBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'));
  await sharp(iconBuffer)
    .resize(16, 16)
    .png()
    .toFile(path.join(publicDir, 'favicon-16x16.png'));
  console.log('✓ Generated favicons (16x16, 32x32)');

  // 6. Social Share Cover (OpenGraph & Twitter Card) 1200x630
  await sharp(ogCoverBuffer)
    .resize(1200, 630)
    .png({ quality: 95 })
    .toFile(path.join(publicDir, 'og-cover.png'));
  console.log('✓ Generated public/og-cover.png (1200x630 pink & gold)');

  console.log('All pink & gold branding assets generated successfully!');
}

generateAll().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
