import React, { useState, useMemo } from 'react';
import {
  Volume2,
  Square,
  Loader2,
  Layers,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Ayah, AyahStatusType, AyahStatusMap } from '../types';
import { ThemeConfig } from '../utils/themeHelper';
import { toArabicNumerals } from '../utils/quranHelper';
import { TajweedText } from './TajweedText';
import { AyahEndSymbol } from './AyahEndSymbol';
import { StatusButtons } from './StatusButtons';

interface MushafPageViewProps {
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
  showLatin: boolean;
  showTajweed: boolean;
  arabicFontSize: 'md' | 'lg' | 'xl';
  onSwitchToFlashcardWithAyah: (ayahIndex: number) => void;
  onOpenTajweedModal: () => void;
}

export const MushafPageView: React.FC<MushafPageViewProps> = ({
  ayahs = [],
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
  showLatin,
  showTajweed,
  arabicFontSize,
  onSwitchToFlashcardWithAyah,
  onOpenTajweedModal,
}) => {
  const [selectedAyahNumber, setSelectedAyahNumber] = useState<number | null>(() => {
    return ayahs.length > 0 ? ayahs[0].number : null;
  });
  const [copiedAyahNumber, setCopiedAyahNumber] = useState<number | null>(null);
  const [showAllTranslations, setShowAllTranslations] = useState<boolean>(false);

  // Group ayahs by surah to render Surah title banners if a surah starts on this page
  const firstAyah = ayahs && ayahs.length > 0 ? ayahs[0] : null;
  const surahInfo = firstAyah?.surah;

  const activeAyah = useMemo(() => {
    if (!ayahs || ayahs.length === 0) return null;
    if (selectedAyahNumber) {
      const found = ayahs.find((a) => a.number === selectedAyahNumber);
      if (found) return found;
    }
    return ayahs[0];
  }, [ayahs, selectedAyahNumber]);

  const activeUserStatus = activeAyah ? statusMap[activeAyah.number] : undefined;

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
        return 'text-[22px] sm:text-[26px] leading-[2.5] sm:leading-[2.8]';
      case 'xl':
        return 'text-[30px] sm:text-[38px] leading-[2.8] sm:leading-[3.2]';
      case 'lg':
      default:
        return 'text-[25px] sm:text-[31px] leading-[2.6] sm:leading-[3.0]';
    }
  };

  // Group ayahs into sections divided by Surah headers if new surahs start on this page
  const surahSections = useMemo(() => {
    if (!ayahs || ayahs.length === 0) return [];
    const sections: { surahNumber: number; surah: any; ayahs: Ayah[] }[] = [];
    let currentSection: { surahNumber: number; surah: any; ayahs: Ayah[] } | null = null;

    for (const a of ayahs) {
      if (!currentSection || currentSection.surahNumber !== a.surah.number) {
        currentSection = {
          surahNumber: a.surah.number,
          surah: a.surah,
          ayahs: [a],
        };
        sections.push(currentSection);
      } else {
        currentSection.ayahs.push(a);
      }
    }
    return sections;
  }, [ayahs]);

  if (!ayahs || ayahs.length === 0) {
    return (
      <div className="p-12 text-center rounded-3xl bg-white/80 border border-slate-200 text-slate-400">
        <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
        <p className="text-sm font-semibold text-slate-600">Tidak ada ayat pada halaman ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* AUTHENTIC PRINTED MUSHAF PAGE (LEMBARAN AL-QUR'AN MADINAH)                */}
      {/* ========================================================================= */}
      <div className="relative rounded-3xl bg-[#fefcf8] border-2 border-amber-300/80 shadow-xl overflow-hidden p-3.5 sm:p-6 md:p-8">
        {/* Decorative Inner Gold Frame (Ornate Mushaf Margins) */}
        <div className="absolute inset-2 sm:inset-3 border border-amber-400/40 rounded-2xl pointer-events-none" />
        <div className="absolute inset-3 sm:inset-4 border border-dashed border-amber-300/30 rounded-xl pointer-events-none" />

        {/* Top Page Header Strip (Authentic Madinah Mushaf Header) */}
        <div className="relative z-10 flex items-center justify-between border-b-2 border-amber-300/60 pb-3 mb-4 sm:mb-6 text-xs sm:text-sm font-semibold text-amber-950">
          {/* Left: Surah Name in Arabic badge */}
          <div className="flex items-center gap-2">
            <span className="font-arabic text-base sm:text-lg font-bold text-amber-900">
              {surahInfo ? surahInfo.name : 'سُورَةُ'}
            </span>
            <span className="text-slate-400 font-sans hidden sm:inline text-xs">
              (Surah {surahInfo?.englishName})
            </span>
          </div>

          {/* Center: Juz & Page Badge in Gold Calligraphic Style */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300/80 text-amber-950 text-xs font-bold shadow-2xs">
            <span className="font-arabic text-sm">جُزْءُ {toArabicNumerals(currentJuz)}</span>
            <span>·</span>
            <span>Halaman {currentPage}</span>
          </div>

          {/* Right: Total Ayahs & Revelation Type */}
          <div className="flex items-center gap-1.5 text-xs text-amber-900 font-medium">
            <span>{ayahs.length} Ayat di Halaman</span>
          </div>
        </div>

        {/* Content: Sections of Surahs with continuous paragraph layout */}
        <div className="relative z-10 space-y-6">
          {surahSections.map((sec, secIdx) => {
            const startsWithAyahOne = sec.ayahs[0]?.numberInSurah === 1;

            return (
              <div key={sec.surahNumber} className="space-y-4">
                {/* Surah Calligraphic Header Frame (If Surah starts on this page) */}
                {startsWithAyahOne && (
                  <div className="my-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-100 via-rose-50 to-amber-100 border-2 border-amber-400/70 shadow-sm text-center relative overflow-hidden">
                    {/* Decorative Corner Stars */}
                    <div className="absolute top-1 left-2 text-amber-600 text-xs font-arabic select-none">۞</div>
                    <div className="absolute top-1 right-2 text-amber-600 text-xs font-arabic select-none">۞</div>
                    <div className="absolute bottom-1 left-2 text-amber-600 text-xs font-arabic select-none">۞</div>
                    <div className="absolute bottom-1 right-2 text-amber-600 text-xs font-arabic select-none">۞</div>

                    <p className="text-[11px] uppercase tracking-widest font-bold text-amber-800 mb-0.5">
                      {sec.surah.revelationType === 'Meccan' ? 'Makkiyyah' : 'Madaniyyah'} · {sec.surah.numberOfAyahs} Ayat
                    </p>
                    <h3 className="font-arabic text-2xl sm:text-3xl md:text-4xl font-bold text-amber-950 mb-1">
                      {sec.surah.name}
                    </h3>
                    <h4 className="font-display text-sm sm:text-base font-bold text-slate-800">
                      Surah {sec.surah.englishName} ({sec.surah.englishNameTranslation})
                    </h4>

                    {/* Bismillah Header (except Surah 9 / At-Taubah) */}
                    {sec.surah.number !== 9 && (
                      <div className="mt-3 pt-3 border-t border-amber-300/60">
                        <p className="font-arabic text-xl sm:text-2xl md:text-3xl text-amber-950 leading-loose">
                          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Continuous Flow of Ayahs across the page (Like real Printed Quran) */}
                <div
                  dir="rtl"
                  lang="ar"
                  className={`font-arabic text-slate-900 text-justify text-right transition-all select-text ${getFontSizeClass()}`}
                  style={{
                    textAlignLast: 'right',
                    textJustify: 'auto',
                  }}
                >
                  {sec.ayahs.map((ayah) => {
                    const isSelected = selectedAyahNumber === ayah.number;
                    const isPlaying = isPlayingAudio && playingAyahNumber === ayah.number;
                    const isMemorized = !!statusMap[ayah.number]?.isMemorized;

                    return (
                      <span
                        key={ayah.number}
                        id={`mushaf-page-ayah-${ayah.number}`}
                        onClick={() => setSelectedAyahNumber(ayah.number)}
                        className={`inline transition-all duration-200 cursor-pointer rounded-lg px-0.5 ${
                          isPlaying
                            ? 'bg-rose-100 text-rose-950 ring-2 ring-rose-400 font-bold'
                            : isSelected
                            ? 'bg-pink-100/90 text-pink-950 ring-1 ring-pink-300'
                            : isMemorized
                            ? 'hover:bg-emerald-50/80'
                            : 'hover:bg-amber-100/60'
                        }`}
                        title={`Ketuk untuk memilih Ayat ${ayah.numberInSurah}`}
                      >
                        {/* The Verse Text */}
                        <TajweedText
                          text={ayah.text}
                          tajweedText={ayah.tajweedText}
                          showTajweed={showTajweed}
                        />

                        {/* Ornate End-of-Ayah Medallion ﴿...﴾ */}
                        <AyahEndSymbol
                          number={ayah.numberInSurah}
                          size={arabicFontSize === 'xl' ? 'lg' : 'md'}
                        />
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Page Footer: Page Number Medallion & Pagination */}
        <div className="relative z-10 flex items-center justify-between border-t-2 border-amber-300/60 pt-3 mt-6 sm:mt-8">
          {/* Previous Page Button (in Arabic Quran, next page number is to the left) */}
          <button
            type="button"
            onClick={onPrevPage}
            disabled={currentPage <= 1}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
              currentPage <= 1
                ? 'opacity-40 cursor-not-allowed text-slate-400'
                : 'bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Halaman Sebelumnya</span>
          </button>

          {/* Centered Page Number Medallion */}
          <div className="flex flex-col items-center">
            <span className="font-arabic text-lg sm:text-xl font-bold text-pink-700">
              ۝ {toArabicNumerals(currentPage)} ۝
            </span>
            <span className="text-[11px] text-amber-900 font-semibold">
              Halaman {currentPage} dari 604
            </span>
          </div>

          {/* Next Page Button */}
          <button
            type="button"
            onClick={onNextPage}
            disabled={currentPage >= 604}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
              currentPage >= 604
                ? 'opacity-40 cursor-not-allowed text-slate-400'
                : 'bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs'
            }`}
          >
            <span className="hidden sm:inline">Halaman Berikutnya</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ACTIVE SELECTED AYAH BAR (ALAT KONTROL & TERJEMAHAN AYAT TERPILIH)         */}
      {/* ========================================================================= */}
      {activeAyah && (
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-md space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Bar Header: Surah, Ayah Number & Quick Tools */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-pink-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                {activeAyah.numberInSurah}
              </span>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-800">
                  Surah {activeAyah.surah.englishName} : Ayat {activeAyah.numberInSurah}
                </h4>
                <p className="text-[10px] text-slate-400">
                  Ketuk ayat mana saja di lembaran untuk berpindah
                </p>
              </div>
            </div>

            {/* Actions for this Ayah */}
            <div className="flex items-center gap-1.5">
              {/* Status Buttons */}
              <StatusButtons
                ayah={activeAyah}
                status={activeUserStatus}
                onToggleStatus={onToggleStatus}
                size="sm"
                showLabels={false}
              />

              {/* Audio Play Button */}
              <button
                type="button"
                onClick={() => {
                  if (isPlayingAudio && playingAyahNumber === activeAyah.number) {
                    onStopAudio();
                  } else {
                    onPlayAyahAudio(activeAyah);
                  }
                }}
                disabled={isAudioLoading && playingAyahNumber === activeAyah.number}
                className={`p-2 rounded-xl border text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isPlayingAudio && playingAyahNumber === activeAyah.number
                    ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
                title="Dengarkan Murottal Ayat Ini"
              >
                {isAudioLoading && playingAyahNumber === activeAyah.number ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : isPlayingAudio && playingAyahNumber === activeAyah.number ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span className="hidden sm:inline font-bold">Stop</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Audio</span>
                  </>
                )}
              </button>

              {/* Switch to Flashcard */}
              <button
                type="button"
                onClick={() => {
                  const idx = ayahs.findIndex((a) => a.number === activeAyah.number);
                  onSwitchToFlashcardWithAyah(idx !== -1 ? idx : 0);
                }}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                title="Hafalkan ayat ini di Flashcard"
              >
                <Layers className="w-3.5 h-3.5 text-pink-600" />
                <span className="hidden sm:inline">Hafalkan</span>
              </button>

              {/* Copy */}
              <button
                type="button"
                onClick={() => handleCopyAyah(activeAyah)}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 transition-colors cursor-pointer"
                title="Salin ayat & terjemahan"
              >
                {copiedAyahNumber === activeAyah.number ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Latin Transliteration if enabled */}
          {showLatin && activeAyah.latin && (
            <div className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-indigo-950 text-xs font-medium">
              <span className="text-[10px] uppercase font-bold text-indigo-500 block mb-0.5">
                Latin:
              </span>
              "{activeAyah.latin}"
            </div>
          )}

          {/* Indonesian Translation */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <span className="font-semibold text-slate-900 mr-1.5">Artinya:</span>
            "{activeAyah.translation}"
          </div>
        </div>
      )}

      {/* Accordion: Tampilkan Terjemahan Seluruh Halaman */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <button
          type="button"
          onClick={() => setShowAllTranslations(!showAllTranslations)}
          className="w-full px-4 py-3 flex items-center justify-between text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-pink-600" />
            <span>Terjemahan Lengkap Seluruh Ayat Halaman {currentPage} ({ayahs.length} Ayat)</span>
          </span>
          {showAllTranslations ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showAllTranslations && (
          <div className="p-4 pt-1 space-y-2.5 divide-y divide-slate-100 border-t border-slate-100 max-h-[360px] overflow-y-auto">
            {ayahs.map((a) => (
              <div key={a.number} className="pt-2.5 first:pt-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-5 h-5 rounded-md bg-pink-100 text-pink-800 text-[10px] font-bold flex items-center justify-center">
                    {a.numberInSurah}
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    Ayat {a.numberInSurah}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{a.translation}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
