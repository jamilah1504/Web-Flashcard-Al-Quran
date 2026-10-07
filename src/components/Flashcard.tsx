import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  RotateCw,
  Square,
  Loader2,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Ayah, AyahStatusType, AyahUserStatus } from '../types';
import { ThemeConfig } from '../utils/themeHelper';
import { toArabicNumerals } from '../utils/quranHelper';
import { parseTajweed, TajweedRuleType } from '../utils/tajweedHelper';
import { TajweedText } from './TajweedText';
import { StatusButtons } from './StatusButtons';
import { AyahTajweedExplainer } from './AyahTajweedExplainer';
import { AyahEndSymbol } from './AyahEndSymbol';

interface FlashcardProps {
  ayah: Ayah;
  index: number;
  total: number;
  isFlipped: boolean;
  onToggleFlip: () => void;
  status?: AyahUserStatus;
  onToggleStatus: (ayah: Ayah, type: AyahStatusType) => void;
  themeConfig: ThemeConfig;
  showLatin: boolean;
  showTajweed: boolean;
  onOpenTajweedModal: () => void;
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
  status,
  onToggleStatus,
  themeConfig,
  showLatin,
  showTajweed,
  onOpenTajweedModal,
  isAudioMuted,
  isPlayingAudio,
  isAudioLoading,
  onToggleAudio,
}) => {
  const isMemorized = !!status?.isMemorized;
  const [selectedTajweedRule, setSelectedTajweedRule] = useState<TajweedRuleType | null>(null);

  // Reset selected tajweed rule on ayah change or flip
  useEffect(() => {
    setSelectedTajweedRule(null);
  }, [ayah.number, isFlipped]);

  const handleStatusChange = (ayahItem: Ayah, type: AyahStatusType) => {
    if (type === 'memorized' && !status?.isMemorized) {
      try {
        confetti({
          particleCount: 35,
          spread: 55,
          origin: { y: 0.65 },
          colors: ['#10b981', '#34d399', '#f59e0b', '#ec4899', '#38bdf8'],
        });
      } catch (err) {
        // Safe fallback
      }
    }
    onToggleStatus(ayahItem, type);
  };

  const parsedTokens = React.useMemo(() => {
    return parseTajweed(ayah.tajweedText || ayah.text);
  }, [ayah.tajweedText, ayah.text]);

  return (
    <div className="w-full max-w-2xl mx-auto perspective-1000 py-2 select-none">
      {/* 3D Flip Card Container with Motion */}
      <motion.div
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
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
        style={{
          transformStyle: 'preserve-3d',
          WebkitTransformStyle: 'preserve-3d',
        }}
        className="relative w-full min-h-[440px] sm:min-h-[480px] cursor-pointer group outline-hidden"
      >
        {/* ========================================================= */}
        {/* FRONT SIDE: INITIAL VIEW / PANCINGAN AWAL AYAT            */}
        {/* ========================================================= */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(0deg) translate3d(0, 0, 1px)',
            WebkitTransform: 'rotateY(0deg) translate3d(0, 0, 1px)',
            pointerEvents: isFlipped ? 'none' : 'auto',
          }}
          className={`absolute inset-0 w-full h-full rounded-3xl p-4 sm:p-6 flex flex-col justify-between transition-opacity duration-300 bg-white ${
            isFlipped ? 'opacity-0 invisible pointer-events-none' : 'opacity-100 visible z-10'
          } ${
            isMemorized
              ? 'bg-gradient-to-br from-white via-emerald-50/60 to-emerald-100/40 border-2 border-emerald-300 shadow-xl shadow-emerald-100/40'
              : `${themeConfig.cardFrontBg} border ${themeConfig.cardBorder} ${themeConfig.cardShadow}`
          }`}
        >
          {/* Top Bar on Front */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5 sm:pb-3">
            {/* Surah & Ayah Info */}
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold border truncate ${themeConfig.badgeBg}`}
              >
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="truncate">
                  {ayah.surah.englishName} : {ayah.numberInSurah}
                </span>
              </span>
              <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
                ({index + 1}/{total})
              </span>
            </div>

            {/* Right: Status Buttons + Audio Trigger */}
            <div className="flex items-center gap-1.5">
              <StatusButtons
                ayah={ayah}
                status={status}
                onToggleStatus={handleStatusChange}
                size="sm"
                showLabels={false}
              />

              {/* Audio Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleAudio();
                }}
                disabled={isAudioMuted}
                title={
                  isAudioMuted
                    ? 'Audio dinonaktifkan di header'
                    : isPlayingAudio
                    ? 'Hentikan Audio'
                    : 'Putar audio pancingan ayat'
                }
                className={`p-2 rounded-2xl border transition-all ${
                  isAudioMuted
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                    : isPlayingAudio
                    ? 'bg-rose-500 text-white border-rose-600 animate-pulse shadow-md shadow-rose-200'
                    : 'bg-white/90 text-slate-700 border-slate-200 hover:bg-slate-50 hover:scale-105 active:scale-95 shadow-xs'
                }`}
              >
                {isPlayingAudio ? (
                  <Square className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                ) : isAudioLoading ? (
                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-amber-500" />
                ) : isAudioMuted ? (
                  <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Center: First Phrase (Pancingan Awal Ayat) */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center my-auto py-5 text-center">
            <div className="inline-block px-3 py-1 rounded-full bg-white/80 border border-slate-200/80 text-[11px] font-semibold text-slate-600 mb-3 shadow-2xs">
              Pancingan Awal Ayat
            </div>

            {/* Arabic Opener Phrase with Tajweed support */}
            <div className="w-full px-2" dir="rtl">
              <TajweedText
                text={ayah.firstPhrase}
                showTajweed={showTajweed}
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 leading-[2.6]"
                onRuleClick={(rule) => setSelectedTajweedRule(rule)}
              />
            </div>

            {/* Latin Opener Hint (if enabled) */}
            {showLatin && ayah.firstPhraseLatin && (
              <div className="mt-3 px-3 py-1.5 rounded-xl bg-white/70 border border-slate-200/60 text-xs sm:text-sm text-slate-600 italic font-medium">
                "{ayah.firstPhraseLatin}"
              </div>
            )}

            <p className="text-xs sm:text-sm text-slate-500 mt-4 max-w-sm font-medium">
              Ingat kelanjutan ayat ini di dalam hati, lalu ketuk kartu untuk memeriksa kebenarannya.
            </p>
          </div>

          {/* Bottom Flip Hint */}
          <div className="relative z-10 pt-3 border-t border-slate-100/80 flex items-center justify-between text-slate-500 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>Halaman {ayah.page} · Juz {ayah.juz}</span>
            </div>

            <div className="flex items-center gap-1.5 font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">
              <span>Ketuk untuk Membuka</span>
              <RotateCw className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform duration-500" />
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BACK SIDE: FLIPPED / AYAT LENGKAP & TERJEMAHAN             */}
        {/* ========================================================= */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg) translate3d(0, 0, 1px)',
            WebkitTransform: 'rotateY(180deg) translate3d(0, 0, 1px)',
            pointerEvents: isFlipped ? 'auto' : 'none',
          }}
          className={`absolute inset-0 w-full h-full rounded-3xl p-4 sm:p-6 flex flex-col justify-between transition-opacity duration-300 bg-white ${
            isFlipped ? 'opacity-100 visible z-10' : 'opacity-0 invisible pointer-events-none'
          } ${
            isMemorized
              ? 'bg-gradient-to-br from-white via-emerald-50/60 to-pink-50/70 border-2 border-emerald-300 shadow-xl'
              : `${themeConfig.cardBackBg} border ${themeConfig.cardBorder} shadow-xl`
          }`}
        >
          {/* Top Bar on Back */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5 sm:pb-3">
            {/* Surah & Revelation info */}
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold border truncate ${themeConfig.badgeBg}`}
              >
                {ayah.surah.englishName} · Ayat {ayah.numberInSurah}
              </span>
              <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
                {ayah.surah.revelationType === 'Meccan' ? 'Makkiyyah' : 'Madaniyyah'}
              </span>
            </div>

            {/* Right: Status Buttons + Audio */}
            <div className="flex items-center gap-1.5">
              <StatusButtons
                ayah={ayah}
                status={status}
                onToggleStatus={handleStatusChange}
                size="sm"
                showLabels={false}
              />

              {/* Audio Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleAudio();
                }}
                disabled={isAudioMuted}
                title={
                  isAudioMuted
                    ? 'Audio dinonaktifkan di header'
                    : isPlayingAudio
                    ? 'Hentikan Audio'
                    : 'Dengarkan murottal ayat lengkap'
                }
                className={`p-2 rounded-2xl border transition-all ${
                  isAudioMuted
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                    : isPlayingAudio
                    ? 'bg-rose-500 text-white border-rose-600 animate-pulse shadow-md shadow-rose-200'
                    : 'bg-white/90 text-slate-700 border-slate-200 hover:bg-slate-50 hover:scale-105 active:scale-95 shadow-xs'
                }`}
              >
                {isPlayingAudio ? (
                  <Square className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                ) : isAudioLoading ? (
                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-amber-500" />
                ) : isAudioMuted ? (
                  <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Center: Full Ayah Text + Latin + Translation + Tajweed Explanation */}
          <div className="relative z-10 flex-1 overflow-y-auto my-auto py-2.5 space-y-3 scrollbar-thin">
            {/* Arabic Text with Tajweed Coloring & Ayah Number at the end (left) */}
            <div className="w-full text-right py-2 px-1" dir="rtl">
              <div
                dir="rtl"
                className="font-arabic text-slate-900 text-2xl sm:text-3xl md:text-[34px] leading-[2.6] select-text"
              >
                <TajweedText
                  text={ayah.text}
                  tajweedText={ayah.tajweedText}
                  showTajweed={showTajweed}
                  onRuleClick={(rule) => setSelectedTajweedRule(rule)}
                />
                <AyahEndSymbol number={ayah.numberInSurah} size="lg" />
              </div>
            </div>

            {/* Dedicated Ayah Number Bar: Clearly shows the Ayah number at the end and on the left */}
            <div className="flex items-center justify-between border-y border-slate-100/90 py-1.5 px-2.5 text-xs bg-slate-50/70 rounded-2xl">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-pink-600 text-white font-bold flex items-center justify-center text-[11px] shadow-2xs">
                  {ayah.numberInSurah}
                </span>
                <span className="font-bold text-slate-800">Akhir Ayat {ayah.numberInSurah}</span>
                <AyahEndSymbol number={ayah.numberInSurah} size="sm" />
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Surah {ayah.surah.englishName} ({ayah.surah.name})
              </span>
            </div>

            {/* Latin Transliteration (if enabled) */}
            {showLatin && ayah.latin && (
              <div className="text-xs sm:text-sm text-slate-600 italic font-medium leading-relaxed bg-white/70 p-2.5 rounded-xl border border-slate-200/50">
                <span className="text-[10px] uppercase font-bold text-slate-400 not-italic mr-1.5">
                  Latin:
                </span>
                {ayah.latin}
              </div>
            )}

            {/* Indonesian Translation */}
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans bg-white/80 p-3 rounded-2xl border border-slate-200/60 shadow-2xs">
              <span className="font-semibold text-slate-900 mr-1.5">Artinya:</span>
              "{ayah.translation}"
            </div>

            {/* Interactive Tajweed Rules & How-to-Read Explainer (when Tajweed mode is ON) */}
            {showTajweed && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="pt-1"
              >
                <AyahTajweedExplainer
                  tokens={parsedTokens}
                  selectedRuleType={selectedTajweedRule}
                  onSelectRule={(rule) => setSelectedTajweedRule(rule)}
                  onOpenFullModal={onOpenTajweedModal}
                />
              </div>
            )}
          </div>

          {/* Bottom Back Bar */}
          <div className="relative z-10 pt-2.5 border-t border-slate-100/80 flex items-center justify-between text-slate-500 text-xs">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenTajweedModal();
              }}
              className="flex items-center gap-1 text-[11px] text-amber-700 hover:text-amber-800 font-medium"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Semua Hukum Tajwid</span>
            </button>

            <div className="flex items-center gap-1.5 font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">
              <span>Kembali ke Pancingan</span>
              <RotateCw className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
