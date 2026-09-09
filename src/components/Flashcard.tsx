import React from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  RotateCw,
  Heart,
  Eye,
  EyeOff,
  Square,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Ayah } from '../types';
import { toArabicNumerals } from '../utils/quranHelper';

interface FlashcardProps {
  ayah: Ayah;
  index: number;
  total: number;
  isFlipped: boolean;
  onToggleFlip: () => void;
  isMemorized: boolean;
  onToggleMemorized: () => void;
  isAudioMuted: boolean;
  isPlayingAudio: boolean;
  isAudioLoading: boolean;
  onToggleAudio: () => void;
}

export const Flashcard: React.FC<FlashcardProps> = ({
  ayah,
  index,
  total,
  isFlipped,
  onToggleFlip,
  isMemorized,
  onToggleMemorized,
  isAudioMuted,
  isPlayingAudio,
  isAudioLoading,
  onToggleAudio,
}) => {
  const handleMemorizeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isMemorized) {
      // Fire soft celebration confetti
      try {
        confetti({
          particleCount: 40,
          spread: 55,
          origin: { y: 0.65 },
          colors: ['#f472b6', '#ec4899', '#fbcfe8', '#f59e0b', '#c084fc'],
        });
      } catch (err) {
        // Safe fallback
      }
    }
    onToggleMemorized();
  };

  return (
    <div className="w-full max-w-2xl mx-auto perspective-1000 py-2 select-none">
      {/* 3D Flip Card Container */}
      <div
        id="quran-flashcard"
        onClick={onToggleFlip}
        role="button"
        tabIndex={0}
        aria-label={`Flashcard ayat ${ayah.numberInSurah} dari surah ${ayah.surah.englishName}. Klik untuk membalik.`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleFlip();
          }
        }}
        className={`relative w-full min-h-[380px] sm:min-h-[420px] transition-transform duration-700 transform-style-3d cursor-pointer group outline-hidden ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* ========================================================= */}
        {/* FRONT SIDE: INITIAL VIEW / PANCINGAN AWAL AYAT            */}
        {/* ========================================================= */}
        <div
          className={`absolute inset-0 w-full h-full backface-hidden rounded-3xl p-4 sm:p-7 flex flex-col justify-between transition-all duration-300 ${
            isMemorized
              ? 'bg-gradient-to-br from-white/95 via-rose-50/70 to-emerald-50/60 border-2 border-emerald-300 shadow-xl shadow-emerald-100/40'
              : 'bg-gradient-to-br from-white/95 via-rose-50/60 to-pink-50/70 border border-pink-200/80 shadow-xl shadow-pink-200/30 hover:shadow-2xl hover:shadow-pink-200/40'
          }`}
        >
          {/* Subtle decorative background Islamic pattern elements */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-pink-200/20 via-rose-100/10 to-transparent rounded-bl-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-purple-200/20 via-pink-100/10 to-transparent rounded-tr-full pointer-events-none" />

          {/* Top Bar on Front */}
          <div className="relative z-10 flex items-center justify-between gap-2 border-b border-pink-100/70 pb-2.5 sm:pb-3">
            {/* Surah & Ayah Badge */}
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-pink-100/80 text-pink-700 text-[11px] sm:text-xs font-semibold border border-pink-200 truncate">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-pink-500 fill-pink-300 shrink-0" />
                <span className="truncate">
                  {ayah.surah.englishName} : Ayat {ayah.numberInSurah}
                </span>
              </span>
              <span className="text-[11px] text-stone-500 hidden sm:inline truncate">
                ({ayah.surah.englishNameTranslation})
              </span>
            </div>

            {/* Action buttons on Front: Audio & Memorized */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Play/Nonaktifkan Audio Button on Front */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleAudio();
                }}
                id="front-audio-btn"
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold transition-all shrink-0 ${
                  isPlayingAudio
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-xs ring-2 ring-rose-300 animate-pulse'
                    : isAudioLoading
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : isAudioMuted
                    ? 'bg-stone-100 hover:bg-stone-200 text-stone-500 border border-stone-200'
                    : 'bg-white/90 hover:bg-pink-50 text-pink-700 hover:text-pink-800 border border-pink-200/90'
                }`}
                title={
                  isPlayingAudio
                    ? 'Nonaktifkan / Hentikan Audio'
                    : isAudioMuted
                    ? 'Audio Dinonaktifkan (Klik untuk memutar)'
                    : 'Dengarkan Pelafalan Murottal Syaikh Misyari'
                }
              >
                {isPlayingAudio ? (
                  <>
                    <Square className="w-3 h-3 fill-current shrink-0" />
                    <span>Nonaktifkan Audio</span>
                  </>
                ) : isAudioLoading ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-amber-700 shrink-0" />
                    <span>Memuat...</span>
                  </>
                ) : isAudioMuted ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="hidden xs:inline">Audio Nonaktif</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                    <span>Putar Audio</span>
                  </>
                )}
              </button>

              {/* Memorized status toggle button */}
              <button
                onClick={handleMemorizeClick}
                id="front-memorize-btn"
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold transition-all shrink-0 ${
                  isMemorized
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-white/80 hover:bg-pink-50 text-stone-600 hover:text-pink-600 border border-stone-200'
                }`}
                title={isMemorized ? 'Sudah Dihafal' : 'Tandai Sudah Hafal'}
              >
                <Heart
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isMemorized ? 'fill-emerald-600 text-emerald-600' : 'text-stone-400'
                  }`}
                />
                <span>{isMemorized ? 'Hafal' : 'Tandai'}</span>
              </button>
            </div>
          </div>

          {/* Center: The Opener Phrase (Pancingan Ayat) */}
          <div className="relative z-10 my-auto py-4 sm:py-6 text-center space-y-3 sm:space-y-4">
            {/* Optional Bismillah indicator on Surah opening verses */}
            {ayah.hasBismillahHeader && (
              <div className="inline-block px-3 py-1 rounded-full bg-pink-100/70 border border-pink-200 text-pink-700 font-arabic text-xs sm:text-sm font-semibold">
                بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
              </div>
            )}

            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-100/70 text-rose-700 text-[11px] sm:text-xs font-medium">
              <span>🌸 Pancingan Awal Ayat</span>
            </div>

            {/* Big Arabic Opener */}
            <div className="px-2 sm:px-6">
              <p
                dir="rtl"
                className="font-arabic text-2xl sm:text-4xl lg:text-5xl text-slate-800 font-bold leading-loose sm:leading-loose tracking-wide py-1 drop-shadow-xs break-words"
              >
                {ayah.firstPhrase}
              </p>
            </div>

            <p className="text-[11px] sm:text-xs text-stone-500 font-medium">
              Bisakah kamu melanjutkan sisa ayat ini di ingatanmu?
            </p>
          </div>

          {/* Bottom Bar on Front: Tap hint */}
          <div className="relative z-10 border-t border-pink-100/70 pt-2.5 sm:pt-3 flex items-center justify-between text-xs text-stone-500 gap-2">
            <div className="flex items-center gap-1.5 text-pink-600 font-medium min-w-0">
              <Eye className="w-3.5 h-3.5 shrink-0 animate-pulse" />
              <span className="text-[11px] sm:text-xs truncate">
                Ketuk kartu untuk membuka teks lengkap & terjemahan ✨
              </span>
            </div>
            <div className="p-1.5 rounded-full bg-pink-100/60 text-pink-600 group-hover:bg-pink-200/80 transition-colors shrink-0">
              <RotateCw className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BACK SIDE: FLIPPED / AYAT LENGKAP & TERJEMAHAN             */}
        {/* ========================================================= */}
        <div
          className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl p-4 sm:p-7 flex flex-col justify-between transition-all duration-300 ${
            isMemorized
              ? 'bg-gradient-to-br from-white/98 via-emerald-50/50 to-pink-50/70 border-2 border-emerald-300 shadow-xl'
              : 'bg-gradient-to-br from-white/98 via-pink-50/60 to-purple-50/50 border border-pink-200/90 shadow-xl'
          }`}
        >
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-amber-200/15 to-transparent rounded-br-full pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-36 h-36 bg-gradient-to-tl from-pink-200/20 to-transparent rounded-tl-full pointer-events-none" />

          {/* Top Bar on Back */}
          <div className="relative z-10 flex items-center justify-between border-b border-pink-100/70 pb-2 sm:pb-2.5 gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="font-arabic text-sm sm:text-base font-bold text-pink-800 truncate">
                {ayah.surah.name}
              </span>
              <span className="text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                Ayat {ayah.numberInSurah}
              </span>
            </div>

            {/* Audio Button & Mark Button */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleAudio();
                }}
                id="audio-play-verse-btn"
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold shadow-xs transition-all ${
                  isPlayingAudio
                    ? 'bg-rose-500 hover:bg-rose-600 text-white ring-2 ring-rose-300 animate-pulse'
                    : isAudioLoading
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : isAudioMuted
                    ? 'bg-stone-100 hover:bg-stone-200 text-stone-500 border border-stone-200'
                    : 'bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-200/80'
                }`}
                title={
                  isPlayingAudio
                    ? 'Nonaktifkan / Hentikan Audio'
                    : isAudioMuted
                    ? 'Audio Dinonaktifkan (Klik untuk memutar)'
                    : 'Dengarkan pelafalan Murottal Syaikh Misyari Rasyid Al-Afasy'
                }
              >
                {isPlayingAudio ? (
                  <>
                    <Square className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current shrink-0" />
                    <span>Nonaktifkan Audio</span>
                  </>
                ) : isAudioLoading ? (
                  <>
                    <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin text-amber-700 shrink-0" />
                    <span>Memuat...</span>
                  </>
                ) : isAudioMuted ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-400 shrink-0" />
                    <span className="hidden xs:inline">Audio Nonaktif</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                    <span>Putar Audio</span>
                  </>
                )}
              </button>

              <button
                onClick={handleMemorizeClick}
                id="back-memorize-btn"
                className={`p-1 sm:p-1.5 rounded-full border transition-all ${
                  isMemorized
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                    : 'bg-white text-stone-400 hover:text-pink-600 border-stone-200'
                }`}
                title={isMemorized ? 'Sudah Dihafal' : 'Tandai Sudah Hafal'}
              >
                <Heart
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                    isMemorized ? 'fill-emerald-600 text-emerald-600' : ''
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Center: Full Arabic Verse & Indonesian Translation */}
          <div className="relative z-10 my-auto py-2.5 sm:py-3 space-y-3 sm:space-y-4 overflow-y-auto max-h-[250px] sm:max-h-[300px] pr-1">
            {/* Optional Bismillah Header on Verse 1 of Surah */}
            {ayah.hasBismillahHeader && (
              <div className="text-center py-1.5 px-3 rounded-2xl bg-gradient-to-r from-pink-50 via-rose-50 to-purple-50 border border-pink-100 mb-2 shadow-2xs">
                <p
                  dir="rtl"
                  className="font-arabic text-base sm:text-xl text-pink-900 font-bold drop-shadow-xs"
                >
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                </p>
                <p className="text-[10px] text-pink-500 font-medium tracking-wide">
                  Pembuka {ayah.surah.name} ({ayah.surah.englishName})
                </p>
              </div>
            )}

            {/* Full Arabic Ayah with End Ayah Ornament ۝ */}
            <div className="text-right px-1">
              <p
                dir="rtl"
                className="font-arabic text-xl sm:text-2xl lg:text-[32px] text-slate-900 font-bold leading-relaxed sm:leading-[2.4] tracking-wide break-words"
              >
                {ayah.text}{' '}
                <span className="inline-flex items-center justify-center font-arabic text-lg sm:text-2xl text-amber-600 mx-1 align-middle whitespace-nowrap">
                  ۝{toArabicNumerals(ayah.numberInSurah)}
                </span>
              </p>
            </div>

            {/* Translation in Indonesian */}
            <div className="text-left bg-white/80 p-3 sm:p-3.5 rounded-2xl border border-pink-100/80 shadow-2xs">
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-rose-500 mb-1 flex items-center gap-1">
                <span>Artinya:</span>
              </p>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                "{ayah.translation}"
              </p>
            </div>
          </div>

          {/* Bottom Bar on Back: Close hint */}
          <div className="relative z-10 border-t border-pink-100/70 pt-2 sm:pt-2.5 flex items-center justify-between text-xs text-stone-500 gap-2">
            <div className="flex items-center gap-1.5 text-pink-600 font-medium min-w-0">
              <EyeOff className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[11px] sm:text-xs truncate">
                Ketuk lagi untuk kembali ke pancingan
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-stone-400 shrink-0">
              <span>Mushaf Madinah</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
