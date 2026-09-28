import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  Search,
  X,
  ArrowRight,
  Filter,
  CheckCircle2,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { Ayah, AyahStatusType, AyahStatusMap } from '../types';
import { ThemeConfig } from '../utils/themeHelper';
import { toArabicNumerals } from '../utils/quranHelper';
import { parseTajweed, TajweedRuleType } from '../utils/tajweedHelper';
import { ALL_SURAHS, SurahMeta, getPageForSurahAndAyah } from '../data/quranMeta';
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
  onSelectSurahAndAyah?: (surahNumber: number, ayahNumber: number) => void;
  onSelectPage?: (page: number) => void;
}

const POPULAR_SEARCH_CHIPS = [
  { label: 'Al-Baqarah', surah: 2, ayah: 1 },
  { label: 'Ayat Kursi (2:255)', surah: 2, ayah: 255 },
  { label: 'Ali ’Imran', surah: 3, ayah: 1 },
  { label: 'Al-Kahf', surah: 18, ayah: 1 },
  { label: 'Yasin', surah: 36, ayah: 1 },
  { label: 'Ar-Rahman', surah: 55, ayah: 1 },
  { label: 'Al-Waqi’ah', surah: 56, ayah: 1 },
  { label: 'Al-Mulk', surah: 67, ayah: 1 },
  { label: 'An-Naba’', surah: 78, ayah: 1 },
];

export const MushafView: React.FC<MushafViewProps> = ({
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
  onOpenSelector,
  showLatin,
  onToggleLatin,
  showTajweed,
  onToggleTajweed,
  onOpenTajweedModal,
  onSwitchToFlashcardWithAyah,
  onSelectSurahAndAyah,
  onSelectPage,
}) => {
  const [copiedAyahNumber, setCopiedAyahNumber] = useState<number | null>(null);
  const [arabicFontSize, setArabicFontSize] = useState<'md' | 'lg' | 'xl'>('lg');
  const [activeTajweedRules, setActiveTajweedRules] = useState<Record<number, TajweedRuleType | null>>({});

  // Global Tajweed display mode: 'collapsed' | 'compact' | 'expanded'
  const [tajweedGlobalMode, setTajweedGlobalMode] = useState<'collapsed' | 'compact' | 'expanded'>('compact');

  // Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [filterMode, setFilterMode] = useState<'all' | 'currentPage'>('all');
  const [highlightedAyahNumber, setHighlightedAyahNumber] = useState<number | null>(null);

  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  const firstAyah = ayahs && ayahs.length > 0 ? ayahs[0] : null;
  const surahInfo = firstAyah?.surah;

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Scroll to and highlight a specific Ayah on the current page
  const scrollToAyahOnCurrentPage = (ayahGlobalNumber: number) => {
    const el = document.getElementById(`mushaf-ayah-${ayahGlobalNumber}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedAyahNumber(ayahGlobalNumber);
      setTimeout(() => {
        setHighlightedAyahNumber(null);
      }, 2500);
    }
    setIsSearchFocused(false);
  };

  // Quick jump to Surah and Ayah
  const handleJumpToSurahAndAyah = (surahNumber: number, ayahNumber: number) => {
    if (onSelectSurahAndAyah) {
      onSelectSurahAndAyah(surahNumber, ayahNumber);
    } else {
      const page = getPageForSurahAndAyah(surahNumber, ayahNumber);
      if (onSelectPage) onSelectPage(page);
    }
    setIsSearchFocused(false);
    setSearchQuery('');
  };

  // Quick jump to a Page Number
  const handleJumpToPage = (targetPage: number) => {
    if (targetPage >= 1 && targetPage <= 604 && onSelectPage) {
      onSelectPage(targetPage);
    }
    setIsSearchFocused(false);
    setSearchQuery('');
  };

  // Executes the search when user presses Enter or clicks 'Cari'
  const handleExecuteSearch = () => {
    const q = searchQuery.trim();
    if (!q) return;

    if (searchResults.specificVerseMatch) {
      handleJumpToSurahAndAyah(
        searchResults.specificVerseMatch.surah.number,
        searchResults.specificVerseMatch.ayahNumber
      );
      return;
    }

    if (searchResults.pageMatch) {
      handleJumpToPage(searchResults.pageMatch);
      return;
    }

    if (searchResults.matchedSurahs.length > 0) {
      handleJumpToSurahAndAyah(searchResults.matchedSurahs[0].number, 1);
      return;
    }

    if (searchResults.currentPageMatches.length > 0) {
      scrollToAyahOnCurrentPage(searchResults.currentPageMatches[0].ayah.number);
      return;
    }
  };

  // =========================================================================
  // SEARCH PARSER & RESULT COMPUTATION
  // =========================================================================
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return {
        matchedSurahs: [],
        specificVerseMatch: null,
        pageMatch: null,
        currentPageMatches: [],
      };
    }

    // 1. Detect Direct Page Query (e.g. "hal 150", "halaman 200", "p 582", "582")
    let pageMatch: number | null = null;
    const pageNumRegex = /^(?:hal|halaman|page|p)?\s*(\d{1,3})$/i;
    const pageExec = pageNumRegex.exec(q);
    if (pageExec) {
      const p = parseInt(pageExec[1], 10);
      if (p >= 1 && p <= 604) {
        pageMatch = p;
      }
    }

    // 2. Detect Specific Surah:Verse Query (e.g. "2:255", "18:10", "Al-Baqarah 255", "Yasin 58")
    let specificVerseMatch: {
      surah: SurahMeta;
      ayahNumber: number;
      page: number;
    } | null = null;

    // Pattern A: "18:10" or "2 : 255"
    const colonPattern = /^(\d{1,3})\s*[:\.]\s*(\d{1,3})$/;
    const colonMatch = colonPattern.exec(q);
    if (colonMatch) {
      const sNum = parseInt(colonMatch[1], 10);
      const aNum = parseInt(colonMatch[2], 10);
      const targetSurah = ALL_SURAHS.find((s) => s.number === sNum);
      if (targetSurah && aNum >= 1 && aNum <= targetSurah.numberOfAyahs) {
        specificVerseMatch = {
          surah: targetSurah,
          ayahNumber: aNum,
          page: getPageForSurahAndAyah(sNum, aNum),
        };
      }
    }

    // Pattern B: "Al-Baqarah 255" or "Kahf 10" or "Yasin 1"
    if (!specificVerseMatch) {
      const nameAndNumPattern = /^(.+?)\s+(\d{1,3})$/;
      const nameMatch = nameAndNumPattern.exec(q);
      if (nameMatch) {
        const potentialName = nameMatch[1].trim().toLowerCase().replace(/^(surah|surat)\s+/i, '');
        const aNum = parseInt(nameMatch[2], 10);

        const targetSurah = ALL_SURAHS.find(
          (s) =>
            s.englishName.toLowerCase().includes(potentialName) ||
            s.englishName.toLowerCase().replace(/[^a-z0-9]/g, '').includes(potentialName.replace(/[^a-z0-9]/g, '')) ||
            s.name.includes(potentialName) ||
            String(s.number) === potentialName
        );

        if (targetSurah && aNum >= 1 && aNum <= targetSurah.numberOfAyahs) {
          specificVerseMatch = {
            surah: targetSurah,
            ayahNumber: aNum,
            page: getPageForSurahAndAyah(targetSurah.number, aNum),
          };
        }
      }
    }

    // 3. Search All 114 Surahs by Name, Number, Arabic, or Meaning
    const cleanQ = q.replace(/^(surah|surat)\s+/i, '').replace(/[^a-z0-9\u0600-\u06FF]/g, '');
    const matchedSurahs = ALL_SURAHS.filter((surah) => {
      const cleanName = surah.englishName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanMeaning = surah.englishNameTranslation.toLowerCase();
      const numStr = String(surah.number);

      return (
        cleanName.includes(cleanQ) ||
        surah.englishName.toLowerCase().includes(q) ||
        surah.name.includes(q) ||
        cleanMeaning.includes(q) ||
        numStr === q
      );
    }).slice(0, 6);

    // 4. Search in Current Page Ayahs (Translation, Latin, Arabic)
    const currentPageMatches = ayahs
      .filter((ayah) => {
        const inTrans = ayah.translation?.toLowerCase().includes(q);
        const inLatin = ayah.latin?.toLowerCase().includes(q);
        const inArabic = ayah.text?.includes(q);
        const isAyahNum = String(ayah.numberInSurah) === q;
        return inTrans || inLatin || inArabic || isAyahNum;
      })
      .map((ayah) => {
        return {
          ayah,
          numberInSurah: ayah.numberInSurah,
          surahName: ayah.surah.englishName,
          snippet: ayah.translation,
        };
      });

    return {
      matchedSurahs,
      specificVerseMatch,
      pageMatch,
      currentPageMatches,
    };
  }, [searchQuery, ayahs]);

  // Filtered verses to display on the page if user chose filterMode === 'currentPage'
  const displayAyahs = useMemo(() => {
    if (!ayahs || ayahs.length === 0) return [];
    if (filterMode === 'currentPage' && searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      return ayahs.filter((ayah) => {
        const inTrans = ayah.translation?.toLowerCase().includes(q);
        const inLatin = ayah.latin?.toLowerCase().includes(q);
        const inArabic = ayah.text?.includes(q);
        const isAyahNum = String(ayah.numberInSurah) === q;
        return inTrans || inLatin || inArabic || isAyahNum;
      });
    }
    return ayahs;
  }, [ayahs, filterMode, searchQuery]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 select-none animate-fadeIn pb-12">
      {/* ========================================================================= */}
      {/* 1. QUICK SEARCH BAR (PENCARIAN CEPAT SURAH / AYAT / KATA)                 */}
      {/* ========================================================================= */}
      <div
        ref={searchContainerRef}
        className="relative bg-white/95 backdrop-blur-md rounded-3xl p-3 sm:p-4 border border-slate-200/90 shadow-sm transition-all z-30"
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleExecuteSearch();
                }
              }}
              placeholder="Cari surat (misal: Al-Kahf, Yasin) atau nomor ayat (misal: 2:255, 18:10), atau kata..."
              className="w-full pl-10 pr-24 py-2.5 rounded-2xl bg-slate-50/90 hover:bg-slate-100/80 focus:bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="w-6 h-6 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                  title="Hapus pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={handleExecuteSearch}
                className="px-2.5 py-1 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                title="Cari atau buka surat/ayat yang diketik"
              >
                <span>Cari</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Filter Scope Button: Semua Surat vs Halaman Ini */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/80 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterMode === 'all'
                  ? `${themeConfig.activeTabClass} shadow-xs font-bold`
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Surat
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('currentPage')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterMode === 'currentPage'
                  ? `${themeConfig.badgeBg} font-bold shadow-xs`
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Saring ayat yang cocok pada halaman ini saja"
            >
              Di Halaman Ini
              {searchQuery && searchResults.currentPageMatches.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-bold">
                  {searchResults.currentPageMatches.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Quick Recommendation Chips (When not searching or empty query) */}
        {!searchQuery && (
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            <span className="text-[11px] text-slate-400 font-medium shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Cepat:
            </span>
            {POPULAR_SEARCH_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleJumpToSurahAndAyah(chip.surah, chip.ayah)}
                className="px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-pink-50 hover:text-pink-700 text-slate-600 border border-slate-200/80 text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0"
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}

        {/* ========================================================================= */}
        {/* INSTANT SEARCH RESULTS DROPDOWN                                           */}
        {/* ========================================================================= */}
        {isSearchFocused && searchQuery.trim().length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-40 max-h-[75vh] overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
            {/* Direct Ayah Match Card (e.g. "2:255" or "Al-Baqarah 255") */}
            {searchResults.specificVerseMatch && (
              <div className="p-3 sm:p-4 bg-gradient-to-r from-pink-50 via-rose-50 to-white">
                <div className="text-[11px] font-bold uppercase tracking-wider text-pink-700 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Ayat Spesifik Ditemukan
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleJumpToSurahAndAyah(
                      searchResults.specificVerseMatch!.surah.number,
                      searchResults.specificVerseMatch!.ayahNumber
                    )
                  }
                  className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-white hover:bg-pink-100/70 border border-pink-200 transition-all text-left group shadow-xs cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 font-bold text-xs flex items-center justify-center">
                      {searchResults.specificVerseMatch.surah.number}:{searchResults.specificVerseMatch.ayahNumber}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 group-hover:text-pink-800">
                        Surat {searchResults.specificVerseMatch.surah.englishName} : Ayat {searchResults.specificVerseMatch.ayahNumber}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Halaman {searchResults.specificVerseMatch.page} · {searchResults.specificVerseMatch.surah.revelationType === 'Meccan' ? 'Makkiyyah' : 'Madaniyyah'}
                      </p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-bold text-pink-600 group-hover:translate-x-1 transition-transform">
                    <span>Buka Ayat</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </button>
              </div>
            )}

            {/* Direct Page Match (e.g. "582" or "hal 200") */}
            {searchResults.pageMatch && (
              <div className="p-3 sm:p-4 bg-slate-50/70">
                <button
                  type="button"
                  onClick={() => handleJumpToPage(searchResults.pageMatch!)}
                  className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      {searchResults.pageMatch}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">
                        Lompat ke Mushaf Halaman {searchResults.pageMatch}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Total 604 Halaman Mushaf Madinah
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                    <span>Buka</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              </div>
            )}

            {/* Surah Matches Section */}
            {searchResults.matchedSurahs.length > 0 && (
              <div className="p-3 sm:p-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                  <span>Daftar Surat ({searchResults.matchedSurahs.length})</span>
                  <span className="text-[10px] lowercase text-slate-400">klik untuk membuka</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {searchResults.matchedSurahs.map((surah) => (
                    <button
                      key={surah.number}
                      type="button"
                      onClick={() => handleJumpToSurahAndAyah(surah.number, 1)}
                      className="p-2.5 rounded-2xl border border-slate-200 hover:border-pink-300 hover:bg-pink-50/50 transition-all text-left flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                          {surah.number}
                        </span>
                        <div className="min-w-0">
                          <h5 className="font-bold text-xs text-slate-800 truncate group-hover:text-pink-700">
                            {surah.englishName}
                          </h5>
                          <p className="text-[10px] text-slate-400 truncate">
                            {surah.englishNameTranslation} · Hal {surah.startPage}
                          </p>
                        </div>
                      </div>
                      <span className="font-arabic text-sm text-slate-600 font-bold shrink-0 ml-2">
                        {surah.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Matches on Current Page Section */}
            {searchResults.currentPageMatches.length > 0 && (
              <div className="p-3 sm:p-4 bg-emerald-50/20">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Cocok di Halaman Ini ({searchResults.currentPageMatches.length} Ayat)
                  </span>
                  <span className="text-[10px] lowercase text-slate-400">klik untuk lompat ke ayat</span>
                </div>
                <div className="space-y-1.5">
                  {searchResults.currentPageMatches.map((match) => (
                    <button
                      key={match.ayah.number}
                      type="button"
                      onClick={() => scrollToAyahOnCurrentPage(match.ayah.number)}
                      className="w-full p-2.5 rounded-2xl border border-emerald-200/80 bg-white hover:bg-emerald-50/80 transition-all text-left flex items-start gap-2.5 group cursor-pointer"
                    >
                      <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {match.numberInSurah}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-800">
                            {match.surahName} : Ayat {match.numberInSurah}
                          </span>
                          <span className="text-[10px] text-emerald-600 font-medium">Lompat</span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 italic leading-relaxed">
                          "{match.snippet}"
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {searchResults.matchedSurahs.length === 0 &&
              !searchResults.specificVerseMatch &&
              !searchResults.pageMatch &&
              searchResults.currentPageMatches.length === 0 && (
                <div className="p-6 text-center text-slate-400 text-xs">
                  <p className="font-semibold text-slate-700">Tidak ada hasil yang sesuai</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Coba ketik nama surat seperti "Al-Kahf" atau nomor ayat seperti "18:10", atau nomor halaman (1-604).
                  </p>
                </div>
              )}
          </div>
        )}
      </div>

      {/* Notice Bar when Filter Mode is set to 'Di Halaman Ini' */}
      {filterMode === 'currentPage' && searchQuery.trim() && (
        <div className="p-3 rounded-2xl bg-pink-50 border border-pink-200 text-pink-900 text-xs flex items-center justify-between gap-2 shadow-xs">
          <span>
            Menampilkan <strong>{displayAyahs.length}</strong> ayat pada Halaman {currentPage} yang cocok dengan pencarian "<strong>{searchQuery}</strong>".
          </span>
          <button
            type="button"
            onClick={() => {
              setFilterMode('all');
              setSearchQuery('');
            }}
            className="px-2.5 py-1 rounded-xl bg-white text-pink-700 font-bold border border-pink-200 hover:bg-pink-100 transition-colors shrink-0 cursor-pointer"
          >
            Tampilkan Semua Ayat
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TOP MUSHAF CONTROLS BAR (JUZ, HALAMAN, TAJWID TOGGLE, LATIN, FONT)     */}
      {/* ========================================================================= */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-3 sm:p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-2.5 sticky top-16 z-20">
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
          {/* Tajweed Controls: ON/OFF, Perkecil, Show Lengkapnya, Panduan */}
          <div className="flex items-center flex-wrap gap-1.5 bg-amber-50/90 p-1 rounded-2xl border border-amber-200/90 shadow-2xs">
            {/* Tajweed ON / OFF Toggle */}
            <button
              type="button"
              onClick={onToggleTajweed}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                showTajweed
                  ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold shadow-2xs ring-1 ring-amber-300/60'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title="Aktifkan atau nonaktifkan warna tajwid"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Tajwid {showTajweed ? 'ON' : 'OFF'}</span>
            </button>

            {/* When Tajweed is ON: 3 distinct view controls */}
            {showTajweed && (
              <>
                {/* 1. Perkecil Tajwid */}
                <button
                  type="button"
                  onClick={() => setTajweedGlobalMode('collapsed')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                    tajweedGlobalMode === 'collapsed'
                      ? 'bg-amber-200/90 text-amber-950 font-bold shadow-2xs border border-amber-300 ring-1 ring-amber-300/60'
                      : 'text-amber-900 bg-white/80 hover:bg-amber-100 border border-amber-200'
                  }`}
                  title="Perkecil semua kotak penjelasan tajwid menjadi baris mini"
                >
                  <Minimize2 className="w-3 h-3 text-amber-800" />
                  <span>Perkecil Tajwid</span>
                </button>

                {/* 2. Perbesar Tajwid (Mode Kecil Dulu) */}
                <button
                  type="button"
                  onClick={() => setTajweedGlobalMode('compact')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                    tajweedGlobalMode === 'compact'
                      ? 'bg-amber-200/90 text-amber-950 font-bold shadow-2xs border border-amber-300 ring-1 ring-amber-300/60'
                      : 'text-amber-900 bg-white/80 hover:bg-amber-100 border border-amber-200'
                  }`}
                  title="Perbesar kartu tajwid (penjelasan dalam mode kecil dulu tanpa teks panjang)"
                >
                  <Maximize2 className="w-3 h-3 text-amber-800" />
                  <span>Perbesar Tajwid</span>
                </button>

                {/* 3. Kalimat Penjelasan */}
                <button
                  type="button"
                  onClick={() => setTajweedGlobalMode('expanded')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                    tajweedGlobalMode === 'expanded'
                      ? 'bg-amber-200/90 text-amber-950 font-bold shadow-2xs border border-amber-300 ring-1 ring-amber-300/60'
                      : 'text-amber-900 bg-white/80 hover:bg-amber-100 border border-amber-200'
                  }`}
                  title="Munculkan seluruh kalimat uraian penjelasan cara membaca tajwid"
                >
                  <BookOpen className="w-3 h-3 text-amber-800" />
                  <span>Kalimat Penjelasan</span>
                </button>
              </>
            )}

            {/* Guide info modal trigger */}
            <button
              type="button"
              onClick={onOpenTajweedModal}
              className="p-1 rounded-xl text-amber-800 hover:bg-amber-100 hover:text-amber-950 transition-colors cursor-pointer"
              title="Lihat Panduan Warna Tajwid Lengkap"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Latin Toggle */}
          <button
            onClick={onToggleLatin}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
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
              className={`px-2 py-0.5 text-xs rounded-lg transition-colors cursor-pointer ${
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
              className={`px-2 py-0.5 text-xs rounded-lg transition-colors cursor-pointer ${
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
              className={`px-2 py-0.5 text-xs rounded-lg transition-colors cursor-pointer ${
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

      {/* Surah Header Card if the first ayah starts a surah or to introduce current page's surah */}
      {surahInfo && (firstAyah?.numberInSurah === 1 ? (
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

          {/* Bismillah Header (except At-Taubah / Surah 9) */}
          {surahInfo.number !== 9 && (
            <div className="mt-5 pt-5 border-t border-white/20">
              <p className="font-arabic text-2xl sm:text-3xl text-white/95 leading-loose">
                بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Subtle Surah introduction strip if page continues an existing surah */
        <div className="px-4 py-2.5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-2xs flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">
              Surah {surahInfo.englishName}
            </span>
            <span className="text-slate-400">({surahInfo.name})</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500">
              {surahInfo.revelationType === 'Meccan' ? 'Makkiyyah' : 'Madaniyyah'} · {surahInfo.numberOfAyahs} Ayat
            </span>
          </div>
          <span className="font-medium text-slate-400">
            Hal. {currentPage}
          </span>
        </div>
      ))}

      {/* ========================================================================= */}
      {/* 3. VERSES CONTAINER (DAFTAR AYAT UTUH)                                    */}
      {/* ========================================================================= */}
      {displayAyahs.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white/80 border border-dashed border-slate-200 text-slate-400 space-y-3">
          <BookOpen className="w-10 h-10 mx-auto text-slate-300" />
          <p className="text-sm font-semibold text-slate-600">
            {searchQuery
              ? `Tidak ada ayat pada Halaman ${currentPage} yang cocok dengan "${searchQuery}".`
              : 'Tidak ada ayat ditemukan di halaman ini.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterMode('all');
              }}
              className="px-4 py-2 rounded-2xl bg-pink-50 text-pink-700 font-bold text-xs hover:bg-pink-100 transition-colors cursor-pointer"
            >
              Reset Pencarian
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayAyahs.map((ayah) => {
            const userStatus = statusMap[ayah.number];
            const isThisPlaying = isPlayingAudio && playingAyahNumber === ayah.number;
            const isMemorized = !!userStatus?.isMemorized;
            const isHighlighted = highlightedAyahNumber === ayah.number;
            const parsedTokens = parseTajweed(ayah.tajweedText || ayah.text);

            return (
              <div
                key={ayah.number}
                id={`mushaf-ayah-${ayah.number}`}
                data-surah-num={ayah.surah.number}
                data-ayah-num={ayah.numberInSurah}
                className={`p-4 sm:p-6 rounded-3xl border transition-all duration-300 bg-white ${
                  isHighlighted
                    ? 'ring-4 ring-pink-400 bg-pink-50/50 shadow-lg scale-[1.008]'
                    : isMemorized
                    ? 'border-emerald-300 bg-gradient-to-r from-emerald-50/30 to-white shadow-md'
                    : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
                }`}
              >
                {/* Surah Header Card if a new surah starts on this verse (e.g. on multi-surah pages like Juz 30) */}
                {ayah.numberInSurah === 1 && ayah.number !== firstAyah?.number && (
                  <div
                    className={`mb-5 p-5 sm:p-6 rounded-2xl text-center bg-gradient-to-r ${themeConfig.accentGradient} text-white shadow-md relative overflow-hidden`}
                  >
                    <p className="text-[11px] uppercase tracking-widest font-semibold opacity-85 mb-0.5">
                      {ayah.surah.revelationType === 'Meccan' ? 'Makkiyyah' : 'Madaniyyah'} · {ayah.surah.numberOfAyahs} Ayat
                    </p>
                    <h3 className="font-arabic text-2xl sm:text-3xl font-bold mb-1">
                      {ayah.surah.name}
                    </h3>
                    <h4 className="font-display text-base sm:text-lg font-bold">
                      Surah {ayah.surah.englishName}
                    </h4>

                    {ayah.surah.number !== 9 && (
                      <div className="mt-3 pt-3 border-t border-white/20">
                        <p className="font-arabic text-xl sm:text-2xl text-white/95 leading-loose">
                          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                        </p>
                      </div>
                    )}
                  </div>
                )}

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
                      disabled={isAudioLoading && playingAyahNumber === ayah.number}
                      className={`p-1.5 sm:p-2 rounded-xl border text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                        isThisPlaying
                          ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                      title={isThisPlaying ? 'Hentikan Audio' : 'Dengarkan Murottal'}
                    >
                      {isAudioLoading && playingAyahNumber === ayah.number ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : isThisPlaying ? (
                        <Square className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Switch to Flashcard Mode with this verse */}
                    <button
                      onClick={() => {
                        const idx = ayahs.findIndex((a) => a.number === ayah.number);
                        onSwitchToFlashcardWithAyah(idx !== -1 ? idx : 0);
                      }}
                      className="p-1.5 sm:p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                      title="Hafalkan ayat ini di Flashcard"
                    >
                      <Layers className="w-3.5 h-3.5 text-pink-600" />
                      <span className="hidden sm:inline">Hafalkan</span>
                    </button>

                    {/* Copy Button */}
                    <button
                      onClick={() => handleCopyAyah(ayah)}
                      className="p-1.5 sm:p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 transition-colors cursor-pointer"
                      title="Salin ayat & terjemahan"
                    >
                      {copiedAyahNumber === ayah.number ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Arabic Text Display */}
                <div className="text-right py-2 px-1">
                  <div
                    className={`font-arabic text-slate-900 leading-loose transition-all duration-150 ${getFontSizeClass()}`}
                    dir="rtl"
                  >
                    {/* Reliably renders TajweedText with full text fallback */}
                    <TajweedText
                      text={ayah.text}
                      tajweedText={ayah.tajweedText}
                      showTajweed={showTajweed}
                      onSelectRule={(rule) =>
                        setActiveTajweedRules((prev) => ({
                          ...prev,
                          [ayah.number]: rule,
                        }))
                      }
                    />
                    {/* Arabic Verse Number Ornament */}
                    <span className="inline-flex items-center justify-center font-arabic text-pink-600 mx-2 text-xl align-middle select-none">
                      ۝{toArabicNumerals(ayah.numberInSurah)}
                    </span>
                  </div>
                </div>

                {/* Latin Transliteration */}
                {showLatin && ayah.latin && (
                  <div className="mt-3 p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-indigo-950 text-xs sm:text-sm font-medium leading-relaxed">
                    <span className="text-[10px] uppercase font-bold text-indigo-500 block mb-0.5">
                      Transliterasi Latin:
                    </span>
                    {ayah.latin}
                  </div>
                )}

                {/* Indonesian Translation */}
                <div className="mt-2.5 p-3 rounded-2xl bg-slate-50/80 border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  <span className="text-[10px] uppercase font-bold text-slate-400 not-italic block mb-0.5">
                    Terjemahan:
                  </span>
                  "{ayah.translation}"
                </div>

                {/* Tajweed Explainer Card with Perkecil & Show Lengkapnya Buttons */}
                {showTajweed && (
                  <div className="mt-3">
                    <AyahTajweedExplainer
                      tokens={parsedTokens}
                      forceCollapsed={tajweedGlobalMode === 'collapsed'}
                      forceExpanded={tajweedGlobalMode === 'compact' || tajweedGlobalMode === 'expanded'}
                      forceExplanationsExpanded={tajweedGlobalMode === 'expanded'}
                      selectedRuleType={activeTajweedRules[ayah.number] || null}
                      onSelectRule={(rule) =>
                        setActiveTajweedRules((prev) => ({
                          ...prev,
                          [ayah.number]: rule,
                        }))
                      }
                      onOpenFullModal={onOpenTajweedModal}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Page Navigation Controls */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onPrevPage}
          disabled={currentPage <= 1}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Halaman Sebelumnya</span>
        </button>

        <button
          onClick={onOpenSelector}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs sm:text-sm font-semibold border border-slate-200 transition-colors cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-slate-600" />
          <span>Halaman {currentPage} (Juz {currentJuz})</span>
        </button>

        <button
          onClick={onNextPage}
          disabled={currentPage >= 604}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <span>Halaman Berikutnya</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
