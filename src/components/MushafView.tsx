import React, { useState } from 'react';
import {
  Volume2,
  Square,
  Loader2,
  Copy,
  Check,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info,
  Layers,
} from 'lucide-react';
import { Ayah, AyahStatusType, AyahStatusMap } from '../types';
import { ThemeConfig } from '../utils/themeHelper';
import { toArabicNumerals } from '../utils/quranHelper';
import { parseTajweed, TajweedRuleType } from '../utils/tajweedHelper';
import { TajweedText } from './TajweedText';
import { StatusButtons } from './StatusButtons';
import { AyahTajweedExplainer } from './AyahTajweedExplainer';

interface MushafViewProps {
  ayahs: Ayah[];
  currentPage: number;
  currentJuz: number;
  themeConfig: ThemeConfig;
  statusMap: AyahStatusMap;
  onToggleStatus: (ayah: Ayah, type: AyahStatusType) => void;
  isPlayingAudio: boolean;
  playingAyahNumber: number | null;
  isAudioLoading: boolean;
  onPlayAyahAudio: (ayah: Ayah) => void;
  onStopAudio: () => void;
  onNextPage: () => void;
  onPrevPage: () => void;
  onOpenSelector: () => void;
  showLatin: boolean;
  onToggleLatin: () => void;
  showTajweed: boolean;
  onToggleTajweed: () => void;
  onOpenTajweedModal: () => void;
  onSwitchToFlashcardWithAyah: (ayahIndex: number) => void;
}

export const MushafView: React.FC<MushafViewProps> = ({
  ayahs,
  currentPage,
  currentJuz,
  themeConfig,
  statusMap,
  onToggleStatus,
  isPlayingAudio,
  playingAyahNumber,
  isAudioLoading,
  onPlayAyahAudio,
  onStopAudio,
  onNextPage,
  onPrevPage,
  onOpenSelector,
  showLatin,
  onToggleLatin,
  showTajweed,
  onToggleTajweed,
  onOpenTajweedModal,
  onSwitchToFlashcardWithAyah,
}) => {
  const [copiedAyahNumber, setCopiedAyahNumber] = useState<number | null>(null);
  const [arabicFontSize, setArabicFontSize] = useState<'md' | 'lg' | 'xl'>('lg');
  const [activeTajweedRules, setActiveTajweedRules] = useState<Record<number, TajweedRuleType | null>>({});

  const firstAyah = ayahs[0];
  const surahInfo = firstAyah?.surah;

  const handleCopyAyah = (ayah: Ayah) => {
    const textToCopy = `${ayah.text}\n\n"${ayah.latin || ''}"\n\nArtinya: "${ayah.translation}" (QS. ${ayah.surah.englishName}: ${ayah.numberInSurah})`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedAyahNumber(ayah.number);
    setTimeout(() => {
      setCopiedAyahNumber(null);
    }, 2000);
  };

  const getFontSizeClass = () => {
    switch (arabicFontSize) {
      case 'md':
        return 'text-2xl sm:text-3xl leading-[2.3]';
      case 'xl':
        return 'text-3xl sm:text-4xl sm:leading-[2.6] leading-[2.4]';
      case 'lg':
      default:
        return 'text-[26px] sm:text-[34px] leading-[2.4]';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 select-none animate-fadeIn pb-12">
      {/* Top Mushaf Controls Bar */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-3 sm:p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 sticky top-16 z-20">
        {/* Page & Juz Info Tag */}
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-800">
          <span className={`px-2.5 py-1 rounded-xl ${themeConfig.badgeBg} ${themeConfig.badgeText}`}>
            Juz {currentJuz}
          </span>
          <span className="text-slate-300">·</span>
          <span>Halaman {currentPage}</span>
          <span className="text-slate-300">·</span>
          <span>{ayahs.length} Ayat</span>
        </div>

        {/* View Options & Font Size */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Tajweed Toggle */}
          <button
            onClick={onToggleTajweed}
            className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              showTajweed
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="Aktifkan atau nonaktifkan warna tajwid"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tajwid {showTajweed ? 'ON' : 'OFF'}</span>
          </button>

          {/* Guide info button */}
          <button
            onClick={onOpenTajweedModal}
            className="p-1.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            title="Lihat Panduan Warna Tajwid"
          >
            <Info className="w-4 h-4 text-slate-500" />
          </button>

          {/* Latin Toggle */}
          <button
            onClick={onToggleLatin}
            className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              showLatin
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="Tampilkan atau sembunyikan transliterasi Latin"
          >
            <span>Latin {showLatin ? 'ON' : 'OFF'}</span>
          </button>

          {/* Font Size Adjuster */}
          <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-xl border border-slate-200/70">
            <button
              onClick={() => setArabicFontSize('md')}
              className={`px-2 py-0.5 text-xs rounded-lg transition-colors ${
                arabicFontSize === 'md'
                  ? 'bg-white text-slate-800 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Ukuran font sedang"
            >
              A-
            </button>
            <button
              onClick={() => setArabicFontSize('lg')}
              className={`px-2 py-0.5 text-xs rounded-lg transition-colors ${
                arabicFontSize === 'lg'
                  ? 'bg-white text-slate-800 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Ukuran font normal"
            >
              A
            </button>
            <button
              onClick={() => setArabicFontSize('xl')}
              className={`px-2 py-0.5 text-xs rounded-lg transition-colors ${
                arabicFontSize === 'xl'
                  ? 'bg-white text-slate-800 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Ukuran font besar"
            >
              A+
            </button>
          </div>
        </div>
      </div>

      {/* Surah Header Card if beginning of surah is on this page */}
      {surahInfo && firstAyah.numberInSurah === 1 && (
        <div
          className={`p-6 sm:p-8 rounded-3xl text-center bg-gradient-to-r ${themeConfig.accentGradient} text-white shadow-xl relative overflow-hidden`}
        >
          <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <p className="text-xs uppercase tracking-widest font-semibold opacity-80 mb-1">
            {surahInfo.revelationType === 'Meccan' ? 'Makkiyyah' : 'Madaniyyah'} · {surahInfo.numberOfAyahs} Ayat
          </p>
          <h2 className="font-arabic text-3xl sm:text-4xl font-bold mb-2">
            {surahInfo.name}
          </h2>
          <h3 className="font-display text-lg sm:text-xl font-bold">
            Surah {surahInfo.englishName}
          </h3>
          <p className="text-xs sm:text-sm text-white/80">
            "{surahInfo.englishNameTranslation}"
          </p>

          {/* Bismillah Header (except At-Taubah) */}
          {surahInfo.number !== 9 && (
            <div className="mt-5 pt-5 border-t border-white/20">
              <p className="font-arabic text-2xl sm:text-3xl text-white/95 leading-loose">
                بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
              </p>
            </div>
          )}
        </div>
      )}

      {/* Verses Container */}
      <div className="space-y-4">
        {ayahs.map((ayah, index) => {
          const userStatus = statusMap[ayah.number];
          const isThisPlaying = isPlayingAudio && playingAyahNumber === ayah.number;
          const isMemorized = !!userStatus?.isMemorized;
          const parsedTokens = parseTajweed(ayah.tajweedText || ayah.text);

          return (
            <div
              key={ayah.number}
              id={`mushaf-ayah-${ayah.number}`}
              className={`p-4 sm:p-6 rounded-3xl border transition-all duration-200 bg-white ${
                isMemorized
                  ? 'border-emerald-300 bg-gradient-to-r from-emerald-50/30 to-white shadow-md'
                  : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
              }`}
            >
              {/* Ayah Header Strip */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5 mb-3">
                {/* Ayah Number Badge */}
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center font-bold text-xs text-slate-700">
                    {ayah.numberInSurah}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">
                    {ayah.surah.englishName} : Ayat {ayah.numberInSurah}
                  </span>
                </div>

                {/* Actions & Status Controls */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <StatusButtons
                    ayah={ayah}
                    status={userStatus}
                    onToggleStatus={onToggleStatus}
                    size="sm"
                    showLabels={false}
                  />

                  {/* Audio Play Button */}
                  <button
                    onClick={() => {
                      if (isThisPlaying) {
                        onStopAudio();
                      } else {
                        onPlayAyahAudio(ayah);
                      }
                    }}
                    title={isThisPlaying ? 'Hentikan Audio' : 'Dengarkan Audio Murottal'}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                      isThisPlaying
                        ? 'bg-rose-500 text-white animate-pulse shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isThisPlaying ? (
                      <>
                        <Square className="w-3 h-3 fill-current" />
                        <span className="hidden xs:inline">Berhenti</span>
                      </>
                    ) : isAudioLoading && playingAyahNumber === ayah.number ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
                        <span>Memuat</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3 h-3" />
                        <span className="hidden xs:inline">Audio</span>
                      </>
                    )}
                  </button>

                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopyAyah(ayah)}
                    title="Salin Teks Ayat & Terjemahan"
                    className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80 transition-colors"
                  >
                    {copiedAyahNumber === ayah.number ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Flashcard Quiz Shortcut */}
                  <button
                    onClick={() => onSwitchToFlashcardWithAyah(index)}
                    title="Latih Hafalan Ayat Ini di Mode Flashcard"
                    className="flex items-center gap-1 px-2 py-1 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 text-[11px] font-medium transition-colors"
                  >
                    <Layers className="w-3 h-3" />
                    <span className="hidden sm:inline">Uji Flashcard</span>
                  </button>
                </div>
              </div>

              {/* Arabic Text Display */}
              <div className="py-2 sm:py-3 text-right">
                <TajweedText
                  text={ayah.text}
                  tajweedText={ayah.tajweedText}
                  showTajweed={showTajweed}
                  className={`text-slate-900 ${getFontSizeClass()}`}
                  onRuleClick={(rule) =>
                    setActiveTajweedRules((prev) => ({
                      ...prev,
                      [ayah.number]: prev[ayah.number] === rule ? null : rule,
                    }))
                  }
                />
                {/* Ornamental End Ayah Marker */}
                <span className="inline-flex items-center justify-center font-arabic text-lg sm:text-xl text-slate-400 mr-2 select-none">
                  {toArabicNumerals(ayah.numberInSurah)} ۝
                </span>
              </div>

              {/* Latin Transliteration (Togglable) */}
              {showLatin && ayah.latin && (
                <div className="mt-2.5 pt-2 border-t border-slate-100 text-xs sm:text-sm text-slate-600 italic font-medium leading-relaxed bg-slate-50/50 p-2.5 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 not-italic mr-1.5">
                    Latin:
                  </span>
                  {ayah.latin}
                </div>
              )}

              {/* Indonesian Translation */}
              <div className="mt-2 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans select-text">
                <span className="font-semibold text-slate-900 mr-1.5">
                  Artinya:
                </span>
                "{ayah.translation}"
              </div>

              {/* Interactive Tajweed Explainer (when Tajweed mode is ON) */}
              {showTajweed && (
                <div className="mt-3 pt-2 border-t border-slate-100">
                  <AyahTajweedExplainer
                    tokens={parsedTokens}
                    selectedRuleType={activeTajweedRules[ayah.number] || null}
                    onSelectRule={(rule) =>
                      setActiveTajweedRules((prev) => ({
                        ...prev,
                        [ayah.number]: rule,
                      }))
                    }
                    onOpenFullModal={onOpenTajweedModal}
                    compact
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Page Navigation Controls */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onPrevPage}
          disabled={currentPage <= 1}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Halaman Sebelumnya</span>
        </button>

        <button
          onClick={onOpenSelector}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs sm:text-sm font-semibold border border-slate-200 transition-colors"
        >
          <BookOpen className="w-4 h-4 text-slate-600" />
          <span>Halaman {currentPage} (Juz {currentJuz})</span>
        </button>

        <button
          onClick={onNextPage}
          disabled={currentPage >= 604}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <span>Halaman Berikutnya</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
