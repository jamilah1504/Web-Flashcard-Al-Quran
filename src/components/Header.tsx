import React from 'react';
import { BookOpen, Sparkles, Volume2, VolumeX, Layers, ChevronDown, Award } from 'lucide-react';
import { JuzInfo, HintLength } from '../types';

interface HeaderProps {
  currentPage: number;
  currentJuz: JuzInfo;
  currentSurahName?: string;
  totalAyahs: number;
  memorizedCount: number;
  onOpenSelector: () => void;
  onOpenGrid: () => void;
  hintMode: HintLength;
  onChangeHintMode: (mode: HintLength) => void;
  isAudioMuted: boolean;
  onToggleAudioMute: () => void;
  isPlayingAudio?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  currentJuz,
  currentSurahName,
  totalAyahs,
  memorizedCount,
  onOpenSelector,
  onOpenGrid,
  hintMode,
  onChangeHintMode,
  isAudioMuted,
  onToggleAudioMute,
  isPlayingAudio = false,
}) => {
  const percentMemorized = totalAyahs > 0 ? Math.round((memorizedCount / totalAyahs) * 100) : 0;

  return (
    <header className="sticky top-0 z-30 w-full bg-white/85 backdrop-blur-md border-b border-pink-100 shadow-xs transition-all">
      <div className="max-w-4xl mx-auto px-4 py-3 sm:py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Logo & App Title */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-400 via-rose-300 to-amber-200 flex items-center justify-center text-white shadow-md shadow-pink-200/50">
              <Sparkles className="w-5 h-5 fill-white/80" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-display font-bold text-slate-800 text-base sm:text-lg tracking-tight">
                  Tahfidz Flashcard
                </h1>
              </div>
            </div>
          </div>

          {/* Mobile Selector Trigger (Right Aligned on Mobile) */}
          <button
            onClick={onOpenSelector}
            id="mobile-page-selector-btn"
            className="sm:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-800 text-xs font-semibold border border-pink-200/70 transition-colors shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5 text-pink-600 shrink-0" />
            <span className="truncate max-w-[90px]">{currentSurahName || `Hal ${currentPage}`}</span>
            <ChevronDown className="w-3 h-3 text-pink-500 shrink-0" />
          </button>
        </div>

        {/* Center/Right: Juz & Page Badge + Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 w-full sm:w-auto">
          {/* Desktop Juz & Page Selector button */}
          <button
            onClick={onOpenSelector}
            id="desktop-page-selector-btn"
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-pink-50 via-rose-50 to-purple-50 hover:from-pink-100 hover:to-rose-100 border border-pink-200/80 text-pink-900 text-xs font-semibold shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="Klik untuk memilih Surat, Ayat, Juz atau Halaman"
          >
            <BookOpen className="w-4 h-4 text-pink-600 shrink-0" />
            <span className="font-bold text-pink-900">{currentSurahName || currentJuz.name}</span>
            <span className="w-1 h-1 rounded-full bg-pink-400"></span>
            <span>Hal. {currentPage}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-pink-200/70 text-pink-800 font-bold ml-0.5">
              Pilih Surat & Ayat
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-pink-500 ml-0.5 shrink-0" />
          </button>

          {/* Verse List / Grid quick button */}
          <button
            onClick={onOpenGrid}
            id="open-grid-modal-btn"
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-semibold border border-purple-200/60 transition-colors shrink-0"
            title="Lihat daftar semua ayat di halaman ini"
          >
            <Layers className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span className="hidden xs:inline">Ayat</span>
            <span className="px-1.5 py-0.5 bg-purple-200/80 text-purple-900 rounded-md text-[10px] sm:text-[11px] font-bold">
              {memorizedCount}/{totalAyahs}
            </span>
          </button>

          {/* Hint Mode Switcher */}
          <div className="flex items-center rounded-xl bg-stone-100/90 p-0.5 border border-stone-200/60 text-[10px] sm:text-[11px] font-semibold text-stone-600 shrink-0">
            <button
              onClick={() => onChangeHintMode('short')}
              className={`px-2 py-1 rounded-lg transition-all ${
                hintMode === 'short'
                  ? 'bg-white text-pink-700 shadow-xs font-bold'
                  : 'hover:text-stone-900'
              }`}
              title="Pancingan singkat: 2 kata pertama"
            >
              2 Kata
            </button>
            <button
              onClick={() => onChangeHintMode('medium')}
              className={`px-2 py-1 rounded-lg transition-all ${
                hintMode === 'medium'
                  ? 'bg-white text-pink-700 shadow-xs font-bold'
                  : 'hover:text-stone-900'
              }`}
              title="Pancingan sedang: 3-4 kata pertama"
            >
              3-4 Kata
            </button>
          </div>

          {/* Mute/Unmute Audio Toggle (Nonaktifkan / Aktifkan) */}
          <button
            onClick={onToggleAudioMute}
            id="audio-mute-toggle-btn"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-colors shrink-0 text-xs font-semibold ${
              isAudioMuted
                ? 'bg-stone-100 text-stone-500 border-stone-300 hover:bg-stone-200'
                : isPlayingAudio
                ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}
            title={
              isAudioMuted
                ? 'Audio sedang dinonaktifkan (Klik untuk mengaktifkan)'
                : isPlayingAudio
                ? 'Audio sedang memutar (Klik untuk menonaktifkan)'
                : 'Audio aktif (Klik untuk menonaktifkan)'
            }
          >
            {isAudioMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span className="hidden md:inline text-[11px]">Audio Nonaktif</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="hidden md:inline text-[11px]">
                  {isPlayingAudio ? 'Sedang Putar' : 'Audio Aktif'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mini Progress Strip */}
      <div className="w-full bg-pink-100/50 h-1 relative overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-pink-400 via-rose-400 to-amber-300 transition-all duration-500 ease-out"
          style={{ width: `${percentMemorized}%` }}
        />
      </div>
    </header>
  );
};
