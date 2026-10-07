import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Shuffle,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Square,
  Loader2,
} from 'lucide-react';
import { ThemeConfig } from '../utils/themeHelper';

interface ControlsProps {
  currentIndex: number;
  totalAyahs: number;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  isShuffled: boolean;
  onToggleShuffle: () => void;
  onResetOrder: () => void;
  onToggleFlip: () => void;
  isFlipped: boolean;
  themeConfig: ThemeConfig;
  showLatin: boolean;
  onToggleLatin: () => void;
  showTajweed: boolean;
  onToggleTajweed: () => void;
  isPlayingAudio?: boolean;
  isAudioLoading?: boolean;
  isAudioMuted?: boolean;
  onToggleAudio?: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  currentIndex,
  totalAyahs,
  onPrev,
  onNext,
  canPrev,
  canNext,
  isShuffled,
  onToggleShuffle,
  onResetOrder,
  onToggleFlip,
  isFlipped,
  themeConfig,
  showLatin,
  onToggleLatin,
  showTajweed,
  onToggleTajweed,
  isPlayingAudio = false,
  isAudioLoading = false,
  isAudioMuted = false,
  onToggleAudio,
}) => {
  const currentNumber = totalAyahs > 0 ? currentIndex + 1 : 0;
  const progressPercent = totalAyahs > 0 ? (currentNumber / totalAyahs) * 100 : 0;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-3 sm:space-y-4">
      {/* Progress & Indicator Bar */}
      <div className="bg-white/90 backdrop-blur-xs px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className="text-xs sm:text-sm font-bold text-slate-700 font-display whitespace-nowrap">
            Ayat {currentNumber}{' '}
            <span className="text-slate-400 font-normal">/</span> {totalAyahs}
          </span>
          {isShuffled && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 whitespace-nowrap">
              🔀 Acak
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="flex-1 max-w-[120px] sm:max-w-[220px] h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${themeConfig.progressGradient} transition-all duration-300 rounded-full`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <span className={`text-xs font-bold shrink-0 ${themeConfig.badgeText}`}>
          {Math.round(progressPercent)}%
        </span>
      </div>

      {/* Main Navigation Buttons */}
      <div className="flex items-center justify-between gap-2 sm:gap-3 w-full">
        {/* Previous Button */}
        <button
          onClick={onPrev}
          disabled={!canPrev}
          id="btn-prev-ayah"
          className={`flex-1 min-w-0 flex items-center justify-center gap-1 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-xs ${
            canPrev
              ? `bg-white hover:bg-slate-50 text-slate-700 border ${themeConfig.cardBorder} hover:scale-[1.01] active:scale-[0.98]`
              : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
          }`}
          title="Ayat Sebelumnya (Panah Kiri)"
        >
          <ChevronLeft className="w-4 h-4 shrink-0" />
          <span className="truncate hidden sm:inline">Sebelumnya</span>
          <span className="truncate sm:hidden">Sebelum</span>
        </button>

        {/* Center Flip Toggle Button */}
        <button
          onClick={onToggleFlip}
          id="btn-toggle-flip"
          className={`flex-1 sm:flex-initial min-w-0 flex items-center justify-center gap-1.5 py-2.5 sm:py-3 px-3 sm:px-6 rounded-2xl ${themeConfig.primaryButton} font-bold text-xs sm:text-sm transition-all hover:scale-[1.02] active:scale-[0.98]`}
          title="Buka / Balik Kartu (Spasi)"
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0 fill-white/80" />
          <span className="truncate">{isFlipped ? 'Tutup Ayat' : 'Buka Ayat'}</span>
        </button>

        {/* Next Button */}
        <button
          onClick={onNext}
          disabled={!canNext}
          id="btn-next-ayah"
          className={`flex-1 min-w-0 flex items-center justify-center gap-1 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-xs ${
            canNext
              ? `bg-white hover:bg-slate-50 text-slate-700 border ${themeConfig.cardBorder} hover:scale-[1.01] active:scale-[0.98]`
              : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
          }`}
          title="Ayat Selanjutnya (Panah Kanan)"
        >
          <span className="truncate hidden sm:inline">Selanjutnya</span>
          <span className="truncate sm:hidden">Lanjut</span>
          <ChevronRight className="w-4 h-4 shrink-0" />
        </button>
      </div>

      {/* Auxiliary Tools Bar: 1 Neat Card with 1 Single Row of Buttons */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-2xs p-2 sm:p-2.5 w-full">
        <div className="flex items-center justify-between gap-1.5 sm:gap-2 w-full">
          {/* 1. Audio Play/Stop Button */}
          {onToggleAudio && (
            <button
              onClick={onToggleAudio}
              id="btn-control-toggle-audio"
              className={`flex-1 min-w-0 py-2 px-1.5 sm:px-2.5 rounded-xl border text-[11px] sm:text-xs font-semibold transition-all shadow-2xs flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer truncate ${
                isPlayingAudio
                  ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-600 ring-1 ring-rose-300 animate-pulse'
                  : isAudioLoading
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : isAudioMuted
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-500 border-slate-300'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
              title={
                isPlayingAudio
                  ? 'Nonaktifkan / Hentikan Audio'
                  : isAudioMuted
                  ? 'Audio dinonaktifkan (Klik untuk mengaktifkan)'
                  : 'Dengarkan Pelafalan Murottal Syaikh Misyari'
              }
            >
              {isPlayingAudio ? (
                <>
                  <Square className="w-3 h-3 fill-current shrink-0" />
                  <span className="truncate">Hentikan</span>
                </>
              ) : isAudioLoading ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-amber-700 shrink-0" />
                  <span className="truncate">Memuat</span>
                </>
              ) : isAudioMuted ? (
                <>
                  <VolumeX className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">Mute</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Putar Audio</span>
                </>
              )}
            </button>
          )}

          {/* 2. Latin Transliteration Toggle */}
          <button
            onClick={onToggleLatin}
            className={`flex-1 min-w-0 py-2 px-1.5 sm:px-2.5 rounded-xl border text-[11px] sm:text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer truncate ${
              showLatin
                ? 'bg-indigo-50 text-indigo-700 border-indigo-300 ring-1 ring-indigo-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="Tampilkan atau sembunyikan ejaan Latin"
          >
            <span className="truncate">Latin {showLatin ? 'ON' : 'OFF'}</span>
          </button>

          {/* 3. Tajweed Color Toggle */}
          <button
            onClick={onToggleTajweed}
            className={`flex-1 min-w-0 py-2 px-1.5 sm:px-2.5 rounded-xl border text-[11px] sm:text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer truncate ${
              showTajweed
                ? 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="Aktifkan atau nonaktifkan warna tajwid"
          >
            <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
            <span className="truncate">Tajwid {showTajweed ? 'ON' : 'OFF'}</span>
          </button>

          {/* 4. Shuffle Button */}
          <div className="flex-1 min-w-0 flex items-center gap-1">
            <button
              onClick={onToggleShuffle}
              id="btn-shuffle-ayah"
              className={`w-full py-2 px-1.5 sm:px-2.5 rounded-xl border text-[11px] sm:text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer truncate ${
                isShuffled
                  ? 'bg-purple-100 text-purple-900 border-purple-300 ring-1 ring-purple-200'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
              }`}
              title="Acak urutan ayat untuk menguji hafalan"
            >
              <Shuffle className="w-3 h-3 shrink-0" />
              <span className="truncate">{isShuffled ? 'Acak ON' : 'Acak Ayat'}</span>
            </button>

            {/* Reset Order Icon if Shuffled */}
            {isShuffled && (
              <button
                onClick={onResetOrder}
                className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 transition-colors shrink-0 cursor-pointer"
                title="Kembalikan urutan normal mushaf"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
