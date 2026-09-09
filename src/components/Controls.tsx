import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Shuffle,
  RotateCcw,
  Sparkles,
  Layers,
  HelpCircle,
  Volume2,
  VolumeX,
  Square,
  Loader2,
} from 'lucide-react';

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
      <div className="bg-white/80 backdrop-blur-xs px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl border border-pink-100 shadow-xs flex items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className="text-xs sm:text-sm font-bold text-slate-700 font-display whitespace-nowrap">
            Ayat {currentNumber}{' '}
            <span className="text-stone-400 font-normal">/</span> {totalAyahs}
          </span>
          {isShuffled && (
            <span className="text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 whitespace-nowrap">
              🔀 Acak
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="flex-1 max-w-[110px] sm:max-w-[200px] h-2 bg-pink-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <span className="text-xs font-semibold text-rose-600 shrink-0">
          {Math.round(progressPercent)}%
        </span>
      </div>

      {/* Main Navigation Buttons - Optimized for Mobile & Desktop */}
      <div className="flex items-center justify-between gap-2 sm:gap-3 w-full">
        {/* Previous Button */}
        <button
          onClick={onPrev}
          disabled={!canPrev}
          id="btn-prev-ayah"
          className={`flex-1 min-w-0 flex items-center justify-center gap-1 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-xs ${
            canPrev
              ? 'bg-white hover:bg-pink-50/80 text-slate-700 border border-pink-200/80 hover:border-pink-300 hover:scale-[1.01] active:scale-[0.98]'
              : 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed opacity-60'
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
          className="flex-1 sm:flex-initial min-w-0 flex items-center justify-center gap-1 sm:gap-1.5 py-2.5 sm:py-3 px-3 sm:px-5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-pink-200/60 transition-all hover:scale-[1.02] active:scale-[0.98]"
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
              ? 'bg-white hover:bg-pink-50/80 text-slate-700 border border-pink-200/80 hover:border-pink-300 hover:scale-[1.01] active:scale-[0.98]'
              : 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed opacity-60'
          }`}
          title="Ayat Selanjutnya (Panah Kanan)"
        >
          <span className="truncate hidden sm:inline">Selanjutnya</span>
          <span className="truncate sm:hidden">Lanjut</span>
          <ChevronRight className="w-4 h-4 shrink-0" />
        </button>
      </div>

      {/* Auxiliary Tools: Shuffle, Reset, Keyboard Hint */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 text-xs text-stone-500">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Audio Play/Nonaktifkan Button */}
          {onToggleAudio && (
            <button
              onClick={onToggleAudio}
              id="btn-control-toggle-audio"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-2xs ${
                isPlayingAudio
                  ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-600 ring-2 ring-rose-300 animate-pulse'
                  : isAudioLoading
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : isAudioMuted
                  ? 'bg-stone-100 hover:bg-stone-200 text-stone-500 border-stone-300'
                  : 'bg-white hover:bg-pink-50 text-pink-700 border-pink-200/90'
              }`}
              title={
                isPlayingAudio
                  ? 'Nonaktifkan / Hentikan Audio'
                  : isAudioMuted
                  ? 'Audio Nonaktif (Klik untuk memutar)'
                  : 'Dengarkan Pelafalan Murottal Syaikh Misyari'
              }
            >
              {isPlayingAudio ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Nonaktifkan Audio</span>
                </>
              ) : isAudioLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-700" />
                  <span>Memuat...</span>
                </>
              ) : isAudioMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-stone-400" />
                  <span>Audio Nonaktif</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-pink-600" />
                  <span>Putar Audio</span>
                </>
              )}
            </button>
          )}

          {/* Shuffle Button */}
          <button
            onClick={onToggleShuffle}
            id="btn-shuffle-ayah"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              isShuffled
                ? 'bg-purple-100 text-purple-800 border-purple-300'
                : 'bg-white hover:bg-pink-50 text-stone-600 border-pink-200/80'
            }`}
            title="Acak urutan ayat untuk menguji hafalan"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>{isShuffled ? 'Urutan Acak' : 'Acak Ayat'}</span>
          </button>

          {/* Reset order if shuffled */}
          {isShuffled && (
            <button
              onClick={onResetOrder}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-600 text-xs transition-colors"
              title="Kembalikan urutan mushaf"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Keyboard navigation helper */}
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-stone-400">
          <span>Pintasan:</span>
          <kbd className="px-1.5 py-0.5 rounded bg-stone-100 border border-stone-200 text-stone-600 text-[10px] font-mono">
            ← / →
          </kbd>
          <span>Pindah</span>
          <kbd className="px-1.5 py-0.5 rounded bg-stone-100 border border-stone-200 text-stone-600 text-[10px] font-mono">
            Spasi
          </kbd>
          <span>Buka</span>
        </div>
      </div>
    </div>
  );
};
