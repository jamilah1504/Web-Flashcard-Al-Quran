import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Award,
  Bookmark,
  Heart,
  Clock,
  CheckCircle2,
  BookOpen,
  Search,
  ExternalLink,
  Trash2,
  Sparkles,
  Target,
  Plus,
  Minus,
  PartyPopper,
  Calendar,
  FileSpreadsheet,
  Play,
  Pause,
  Loader2,
  Volume2,
  Copy,
  Check,
  Layers,
  Filter,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AyahStatusMap, AyahUserStatus, AyahStatusType, ActiveView } from '../types';
import { ThemeConfig } from '../utils/themeHelper';
import { getAyahAudioUrl, getFallbackAudioUrl, toArabicNumerals } from '../utils/quranHelper';

interface ProgressDashboardViewProps {
  statusMap: AyahStatusMap;
  themeConfig: ThemeConfig;
  onNavigateToAyah: (page: number, ayahNumber: number, view: ActiveView) => void;
  onToggleStatus: (item: AyahUserStatus, type: AyahStatusType) => void;
  onRemoveStatus: (ayahNumber: number, type?: AyahStatusType) => void;
  onClearAllStatuses: () => void;
  dailyTarget: number;
  onChangeDailyTarget: (target: number) => void;
  onOpenGoogleSheetsModal: () => void;
  isSheetsConfigured: boolean;
  onAddSampleStatuses?: () => void;
}

export const ProgressDashboardView: React.FC<ProgressDashboardViewProps> = ({
  statusMap,
  themeConfig,
  onNavigateToAyah,
  onToggleStatus,
  onRemoveStatus,
  onClearAllStatuses,
  dailyTarget,
  onChangeDailyTarget,
  onOpenGoogleSheetsModal,
  isSheetsConfigured,
  onAddSampleStatuses,
}) => {
  // 1. Filter & Search State
  const [filterType, setFilterType] = useState<'all' | 'learning' | 'memorized' | 'favorite'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSurahFilter, setSelectedSurahFilter] = useState<string>('all');
  const [selectedJuzFilter, setSelectedJuzFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'mushaf' | 'recent' | 'surah'>('mushaf');

  // Display toggles
  const [showLatin, setShowLatin] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [isTargetBannerExpanded, setIsTargetBannerExpanded] = useState(true);

  // Audio Playback State for verses in list
  const [playingAyahNumber, setPlayingAyahNumber] = useState<number | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Copied Ayah Feedback State
  const [copiedAyahNumber, setCopiedAyahNumber] = useState<number | null>(null);

  // Stop Audio on Unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePlayAudio = useCallback((item: AyahUserStatus) => {
    if (audioRef.current && playingAyahNumber === item.ayahNumber) {
      audioRef.current.pause();
      audioRef.current = null;
      setPlayingAyahNumber(null);
      setIsAudioLoading(false);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setIsAudioLoading(true);
    setPlayingAyahNumber(item.ayahNumber);

    const primaryUrl = getAyahAudioUrl(item.surahNumber, item.numberInSurah);
    const audio = new Audio(primaryUrl);
    audioRef.current = audio;

    let hasTriedFallback = false;

    audio.onplaying = () => {
      setIsAudioLoading(false);
    };

    audio.onended = () => {
      setPlayingAyahNumber(null);
      setIsAudioLoading(false);
      audioRef.current = null;
    };

    audio.onerror = () => {
      if (!hasTriedFallback) {
        hasTriedFallback = true;
        const fallbackUrl = getFallbackAudioUrl(item.surahNumber, item.numberInSurah);
        if (audioRef.current) {
          audioRef.current.src = fallbackUrl;
          audioRef.current.play().catch(() => {
            setPlayingAyahNumber(null);
            setIsAudioLoading(false);
            audioRef.current = null;
          });
        }
      } else {
        setPlayingAyahNumber(null);
        setIsAudioLoading(false);
        audioRef.current = null;
      }
    };

    audio.play().catch(() => {
      if (!hasTriedFallback) {
        hasTriedFallback = true;
        const fallbackUrl = getFallbackAudioUrl(item.surahNumber, item.numberInSurah);
        if (audioRef.current) {
          audioRef.current.src = fallbackUrl;
          audioRef.current.play().catch(() => {
            setPlayingAyahNumber(null);
            setIsAudioLoading(false);
            audioRef.current = null;
          });
        }
      } else {
        setPlayingAyahNumber(null);
        setIsAudioLoading(false);
        audioRef.current = null;
      }
    });
  }, [playingAyahNumber]);

  // Copy Ayah Text
  const handleCopyAyah = useCallback((item: AyahUserStatus) => {
    const textToCopy = `[QS. ${item.surahName || `Surat ${item.surahNumber}`} : Ayat ${item.numberInSurah}]\n${item.arabicText || ''}\n\n${item.latinText ? `${item.latinText}\n\n` : ''}${item.translation ? `"${item.translation}"` : ''}`;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedAyahNumber(item.ayahNumber);
      setTimeout(() => {
        setCopiedAyahNumber(null);
      }, 2000);
    }).catch(() => {});
  }, []);

  // Collect array of all status items
  const allItems: AyahUserStatus[] = useMemo(() => {
    return (Object.values(statusMap) as AyahUserStatus[]).filter(
      (item) => item.isFavorite || item.isLearning || item.isMemorized
    );
  }, [statusMap]);

  // Statistics Totals
  const totalMemorized = useMemo(() => allItems.filter((i) => i.isMemorized).length, [allItems]);
  const totalLearning = useMemo(() => allItems.filter((i) => i.isLearning).length, [allItems]);
  const totalFavorite = useMemo(() => allItems.filter((i) => i.isFavorite).length, [allItems]);

  // Available Surahs for dropdown filter
  const availableSurahs = useMemo(() => {
    const map = new Map<number, { surahNumber: number; surahName: string; count: number }>();
    allItems.forEach((item) => {
      const existing = map.get(item.surahNumber);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(item.surahNumber, {
          surahNumber: item.surahNumber,
          surahName: item.surahName || `Surat ${item.surahNumber}`,
          count: 1,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.surahNumber - b.surahNumber);
  }, [allItems]);

  // Available Juz for dropdown filter
  const availableJuzList = useMemo(() => {
    const set = new Set<number>();
    allItems.forEach((i) => {
      if (i.juz) set.add(i.juz);
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [allItems]);

  // Today's Date String: YYYY-MM-DD
  const todayKey = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const todayDisplayDate = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date());
    } catch {
      return 'Hari Ini';
    }
  }, []);

  // Ayahs memorized TODAY
  const todayMemorizedItems = useMemo(() => {
    return allItems.filter(
      (item) => item.isMemorized && item.updatedAt && item.updatedAt.startsWith(todayKey)
    );
  }, [allItems, todayKey]);

  const todayMemorizedCount = todayMemorizedItems.length;
  const progressPercent = Math.min(
    100,
    dailyTarget > 0 ? Math.round((todayMemorizedCount / dailyTarget) * 100) : 0
  );
  const isTargetAchieved = todayMemorizedCount >= dailyTarget && dailyTarget > 0;

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6'],
      });
    } catch (e) {}
  };

  // Filtered & Sorted items
  const filteredAndSortedItems = useMemo(() => {
    let result = allItems.filter((item) => {
      // 1. Status Filter
      if (filterType === 'memorized' && !item.isMemorized) return false;
      if (filterType === 'learning' && !item.isLearning) return false;
      if (filterType === 'favorite' && !item.isFavorite) return false;

      // 2. Surah Filter
      if (selectedSurahFilter !== 'all' && String(item.surahNumber) !== selectedSurahFilter) {
        return false;
      }

      // 3. Juz Filter
      if (selectedJuzFilter !== 'all' && String(item.juz) !== selectedJuzFilter) {
        return false;
      }

      // 4. Text Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesSurah = item.surahName?.toLowerCase().includes(q);
        const matchesAyahNum = String(item.numberInSurah) === q;
        const matchesPage = `halaman ${item.page}`.includes(q) || String(item.page) === q;
        const matchesTranslation = item.translation?.toLowerCase().includes(q);
        const matchesLatin = item.latinText?.toLowerCase().includes(q);
        const matchesArabic = item.arabicText?.includes(q);
        return matchesSurah || matchesAyahNum || matchesPage || matchesTranslation || matchesLatin || matchesArabic;
      }

      return true;
    });

    // Sorting
    return result.sort((a, b) => {
      if (sortBy === 'recent') {
        const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return timeB - timeA;
      }
      if (sortBy === 'surah') {
        const nameA = a.surahName || '';
        const nameB = b.surahName || '';
        return nameA.localeCompare(nameB) || a.numberInSurah - b.numberInSurah;
      }
      // Default: Mushaf natural order (global ayahNumber)
      return a.ayahNumber - b.ayahNumber;
    });
  }, [allItems, filterType, selectedSurahFilter, selectedJuzFilter, searchQuery, sortBy]);

  return (
    <div className="max-w-5xl w-full mx-auto px-2.5 sm:px-4 py-4 sm:py-6 space-y-5 sm:space-y-6">
      
      {/* 1. Page Header & Introduction Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr ${themeConfig.accentGradient} flex items-center justify-center text-white shadow-md shadow-slate-300/50 shrink-0`}
          >
            <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 fill-white/80" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-bold font-display text-slate-800 tracking-tight">
                Halaman Ayat Ditandai & Progres
              </h1>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700">
                Koleksi Hafalanku
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
              Daftar lengkap ayat yang ditandai <strong>Sedang Dihafal</strong>, <strong>Sudah Hafal</strong>, dan <strong>Disukai / Favorit</strong>. Dengarkan murottal langsung atau uji kembali di Flashcard.
            </p>
          </div>
        </div>

        {/* Sync with Google Sheets button */}
        <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto">
          <button
            onClick={onOpenGoogleSheetsModal}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-semibold transition-all shadow-2xs active:scale-95 cursor-pointer ${
              isSheetsConfigured
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
            title="Kelola & Sinkronkan Data ke Google Sheets"
          >
            <FileSpreadsheet className={`w-4 h-4 ${isSheetsConfigured ? 'text-emerald-600' : 'text-slate-500'}`} />
            <span>{isSheetsConfigured ? 'Tersambung Google Sheets' : 'Cadangkan ke Sheets'}</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive KPI Category Filter Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Card 1: Semua Ditandai */}
        <button
          type="button"
          onClick={() => setFilterType('all')}
          className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border text-left transition-all bg-white/95 backdrop-blur-xs shadow-2xs hover:shadow-xs cursor-pointer ${
            filterType === 'all'
              ? 'ring-2 ring-pink-500 border-pink-400 bg-pink-50/20'
              : 'border-slate-200/90 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
              Semua Ditandai
            </span>
            <Bookmark className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold font-display text-slate-800">
              {allItems.length}
            </span>
            <span className="text-xs text-slate-400">ayat</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5 truncate">Total seluruh ayat tersimpan</p>
        </button>

        {/* Card 2: Sedang Dihafal */}
        <button
          type="button"
          onClick={() => setFilterType('learning')}
          className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border text-left transition-all bg-white/95 backdrop-blur-xs shadow-2xs hover:shadow-xs cursor-pointer ${
            filterType === 'learning'
              ? 'ring-2 ring-sky-500 border-sky-400 bg-sky-50/20'
              : 'border-slate-200/90 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
              ⏳ Sedang Dihafal
            </span>
            <Clock className="w-4 h-4 text-sky-500" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold font-display text-sky-900">
              {totalLearning}
            </span>
            <span className="text-xs text-slate-400">ayat</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5 truncate">Dalam proses repetisi hafalan</p>
        </button>

        {/* Card 3: Sudah Hafal */}
        <button
          type="button"
          onClick={() => setFilterType('memorized')}
          className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border text-left transition-all bg-white/95 backdrop-blur-xs shadow-2xs hover:shadow-xs cursor-pointer ${
            filterType === 'memorized'
              ? 'ring-2 ring-emerald-500 border-emerald-400 bg-emerald-50/20'
              : 'border-slate-200/90 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              ✅ Sudah Hafal
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold font-display text-emerald-900">
              {totalMemorized}
            </span>
            <span className="text-xs text-slate-400">ayat</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5 truncate">Hafal lancar (mutqin)</p>
        </button>

        {/* Card 4: Disukai / Favorit */}
        <button
          type="button"
          onClick={() => setFilterType('favorite')}
          className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border text-left transition-all bg-white/95 backdrop-blur-xs shadow-2xs hover:shadow-xs cursor-pointer ${
            filterType === 'favorite'
              ? 'ring-2 ring-pink-500 border-pink-400 bg-pink-50/20'
              : 'border-slate-200/90 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-pink-800 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200">
              ❤️ Disukai / Favorit
            </span>
            <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold font-display text-pink-900">
              {totalFavorite}
            </span>
            <span className="text-xs text-slate-400">ayat</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5 truncate">Ayat penyejuk & tadabbur</p>
        </button>
      </div>

      {/* 3. Collapsible Daily Target Widget */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-white via-rose-50/20 to-pink-50/20 border border-slate-200/80 shadow-2xs transition-all">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsTargetBannerExpanded(!isTargetBannerExpanded)}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-pink-700 bg-pink-100 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              Target Hafalan Harian
            </span>
            <span className="text-xs text-slate-400">· {todayDisplayDate}</span>
          </div>
          <button
            type="button"
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-colors"
            title={isTargetBannerExpanded ? 'Sembunyikan detail target' : 'Buka detail target'}
          >
            {isTargetBannerExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {isTargetBannerExpanded && (
          <div className="mt-3.5 pt-3.5 border-t border-slate-200/60 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-800">
                  {isTargetAchieved ? (
                    <span className="text-emerald-600 flex items-center gap-1.5">
                      <PartyPopper className="w-4 h-4 text-emerald-500" />
                      Alhamdulillah, Target Hari Ini Tercapai!
                    </span>
                  ) : (
                    <span>
                      Hari ini telah menghafal{' '}
                      <strong className="text-pink-600 font-bold">{todayMemorizedCount}</strong> dari target{' '}
                      <strong className="text-slate-900">{dailyTarget}</strong> ayat
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tandai ayat dengan tombol ✅ Sudah Hafal untuk mencatat progres harianmu.
                </p>
              </div>

              {/* Target Stepper */}
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-slate-200 shadow-2xs self-stretch sm:self-auto justify-between sm:justify-start">
                <span className="text-xs font-semibold text-slate-500">Target Hari Ini:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeDailyTarget(Math.max(1, dailyTarget - 1));
                    }}
                    className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                    title="Kurangi target"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-7 text-center text-xs font-bold text-slate-800">{dailyTarget}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeDailyTarget(dailyTarget + 1);
                    }}
                    className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                    title="Tambah target"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                <span>Kemajuan Target: {todayMemorizedCount}/{dailyTarget} ayat</span>
                <span className="font-bold text-slate-700">{progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${themeConfig.accentGradient}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Filter Toolbar & Search Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-xs space-y-3.5">
        
        {/* Row 1: Search & Filter Tabs */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Tab Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterType === 'all'
                  ? `${themeConfig.badgeBg} font-bold shadow-xs`
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Semua ({allItems.length})
            </button>
            <button
              onClick={() => setFilterType('learning')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterType === 'learning'
                  ? 'bg-sky-100 text-sky-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Sedang Dihafal ({totalLearning})
            </button>
            <button
              onClick={() => setFilterType('memorized')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterType === 'memorized'
                  ? 'bg-emerald-100 text-emerald-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Sudah Hafal ({totalMemorized})
            </button>
            <button
              onClick={() => setFilterType('favorite')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterType === 'favorite'
                  ? 'bg-pink-100 text-pink-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Disukai ({totalFavorite})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari surat, ayat, arti, atau lafal..."
              className="w-full pl-9 pr-3 py-2 rounded-2xl bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-pink-300 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Secondary Dropdown Filters & Display Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2.5 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Surah Dropdown */}
            {availableSurahs.length > 0 && (
              <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
                <Filter className="w-3 h-3 text-slate-400" />
                <select
                  value={selectedSurahFilter}
                  onChange={(e) => setSelectedSurahFilter(e.target.value)}
                  className="bg-transparent text-xs text-slate-700 font-medium focus:outline-hidden cursor-pointer"
                >
                  <option value="all">Semua Surat ({availableSurahs.length})</option>
                  {availableSurahs.map((s) => (
                    <option key={s.surahNumber} value={String(s.surahNumber)}>
                      {s.surahName} ({s.count})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Juz Dropdown */}
            {availableJuzList.length > 1 && (
              <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-400 font-medium">Juz:</span>
                <select
                  value={selectedJuzFilter}
                  onChange={(e) => setSelectedJuzFilter(e.target.value)}
                  className="bg-transparent text-xs text-slate-700 font-medium focus:outline-hidden cursor-pointer"
                >
                  <option value="all">Semua Juz</option>
                  {availableJuzList.map((j) => (
                    <option key={j} value={String(j)}>
                      Juz {j}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs text-slate-700 font-medium focus:outline-hidden cursor-pointer"
              >
                <option value="mushaf">Urut Mushaf (Al-Qur'an)</option>
                <option value="recent">Terakhir Ditandai</option>
                <option value="surah">Nama Surat (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Quick Display Switches: Latin & Translation */}
          <div className="flex items-center gap-2 text-slate-600 font-medium ml-auto">
            <button
              type="button"
              onClick={() => setShowLatin(!showLatin)}
              className={`px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
                showLatin
                  ? 'bg-pink-50 text-pink-700 border-pink-200 font-bold'
                  : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}
            >
              Latin {showLatin ? 'ON' : 'OFF'}
            </button>
            <button
              type="button"
              onClick={() => setShowTranslation(!showTranslation)}
              className={`px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
                showTranslation
                  ? 'bg-pink-50 text-pink-700 border-pink-200 font-bold'
                  : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}
            >
              Arti {showTranslation ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* 5. Ayat Cards List */}
      <div className="space-y-3.5">
        {filteredAndSortedItems.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 px-5 rounded-3xl bg-white/80 backdrop-blur-xs border border-dashed border-slate-200/90 text-slate-500 space-y-4 shadow-2xs">
            <div
              className={`w-14 h-14 mx-auto rounded-3xl bg-pink-50 flex items-center justify-center text-pink-500 shadow-inner`}
            >
              <Bookmark className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="font-bold text-slate-800 text-base">
                {allItems.length === 0
                  ? 'Belum ada ayat yang ditandai'
                  : 'Tidak ada ayat sesuai filter ini'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {allItems.length === 0
                  ? 'Anda dapat menandai ayat di kartu Flashcard atau Mushaf dengan menekan tombol 📌 Favorit, ⏳ Sedang Dihafal, atau ✅ Sudah Hafal.'
                  : 'Coba ubah kata kunci pencarian atau ganti filter status di atas.'}
              </p>
            </div>

            {/* Quick Helper Action Buttons for Empty State */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {allItems.length === 0 && onAddSampleStatuses && (
                <button
                  type="button"
                  onClick={onAddSampleStatuses}
                  className="px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 text-white font-semibold text-xs shadow-sm hover:opacity-95 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Muat Contoh Ayat Hafalan</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => onNavigateToAyah(582, 5683, 'flashcard')}
                className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Buka Flashcard (Juz 'Amma)</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateToAyah(582, 5683, 'mushaf')}
                className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Buka Mushaf</span>
              </button>
            </div>
          </div>
        ) : (
          /* Verse Cards */
          filteredAndSortedItems.map((item) => {
            const isPlayingThis = playingAyahNumber === item.ayahNumber;
            const isCopiedThis = copiedAyahNumber === item.ayahNumber;

            return (
              <div
                key={item.ayahNumber}
                id={`marked-ayah-${item.ayahNumber}`}
                className="p-4 sm:p-6 rounded-3xl bg-white/95 backdrop-blur-xs border border-slate-200/90 shadow-2xs hover:shadow-md transition-all space-y-4 group"
              >
                {/* Header Row: Surah & Verse Badge, Juz, Page, and Status Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm sm:text-base">
                      {item.surahName || `Surat ke-${item.surahNumber}`} : Ayat {item.numberInSurah}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                      Hal. {item.page} · Juz {item.juz}
                    </span>
                  </div>

                  {/* Active Status Badges on Top Right */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {item.isFavorite && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 flex items-center gap-1 border border-pink-200">
                        <Heart className="w-3 h-3 fill-pink-600 text-pink-600" /> Disukai
                      </span>
                    )}
                    {item.isLearning && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 flex items-center gap-1 border border-sky-200">
                        <Clock className="w-3 h-3 text-sky-600" /> Sedang Dihafal
                      </span>
                    )}
                    {item.isMemorized && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 fill-emerald-100" /> Sudah Hafal
                      </span>
                    )}
                  </div>
                </div>

                {/* Arabic Text Display */}
                {item.arabicText && (
                  <div className="py-1">
                    <p
                      dir="rtl"
                      className="font-arabic text-2xl sm:text-3xl text-slate-800 text-right leading-[2.2] sm:leading-[2.4] select-text"
                    >
                      {item.arabicText}
                      <span className="inline-block text-pink-500 text-xl sm:text-2xl mr-2 font-serif select-none">
                        ۝{toArabicNumerals(item.numberInSurah)}
                      </span>
                    </p>
                  </div>
                )}

                {/* Latin Transliteration (Toggleable) */}
                {showLatin && item.latinText && (
                  <p className="text-xs sm:text-sm text-pink-800/90 font-medium leading-relaxed bg-pink-50/40 px-3 py-2 rounded-xl border border-pink-100/70">
                    {item.latinText}
                  </p>
                )}

                {/* Translation (Toggleable) */}
                {showTranslation && item.translation && (
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                    "{item.translation}"
                  </p>
                )}

                {/* Interactive Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                  
                  {/* Left: Audio Player & Status Toggles */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    
                    {/* Audio Murottal Button */}
                    <button
                      type="button"
                      onClick={() => handlePlayAudio(item)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer shadow-2xs active:scale-95 ${
                        isPlayingThis
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                      title={isPlayingThis ? 'Hentikan Audio Murottal' : 'Putar Audio Murottal'}
                    >
                      {isAudioLoading && isPlayingThis ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : isPlayingThis ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current" />
                      )}
                      <span>{isPlayingThis ? 'Berhenti' : 'Murottal'}</span>
                    </button>

                    {/* Quick In-Place Status Toggles */}
                    <div className="flex items-center bg-slate-50 p-0.5 rounded-xl border border-slate-200 gap-0.5">
                      {/* Toggle Disukai */}
                      <button
                        type="button"
                        onClick={() => onToggleStatus(item, 'favorite')}
                        className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                          item.isFavorite
                            ? 'bg-pink-100 text-pink-700 font-bold'
                            : 'text-slate-400 hover:text-pink-600 hover:bg-white'
                        }`}
                        title={item.isFavorite ? 'Hapus dari Disukai' : 'Tandai Disukai'}
                      >
                        <Heart className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-pink-600 text-pink-600' : ''}`} />
                      </button>

                      {/* Toggle Sedang Dihafal */}
                      <button
                        type="button"
                        onClick={() => onToggleStatus(item, 'learning')}
                        className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                          item.isLearning
                            ? 'bg-sky-100 text-sky-700 font-bold'
                            : 'text-slate-400 hover:text-sky-600 hover:bg-white'
                        }`}
                        title={item.isLearning ? 'Hapus status Sedang Dihafal' : 'Tandai Sedang Dihafal'}
                      >
                        <Clock className="w-3.5 h-3.5" />
                      </button>

                      {/* Toggle Sudah Hafal */}
                      <button
                        type="button"
                        onClick={() => {
                          if (!item.isMemorized) {
                            try {
                              confetti({
                                particleCount: 30,
                                spread: 50,
                                origin: { y: 0.7 },
                                colors: ['#10b981', '#34d399', '#f59e0b', '#ec4899'],
                              });
                            } catch (e) {}
                          }
                          onToggleStatus(item, 'memorized');
                        }}
                        className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                          item.isMemorized
                            ? 'bg-emerald-100 text-emerald-800 font-bold'
                            : 'text-slate-400 hover:text-emerald-600 hover:bg-white'
                        }`}
                        title={item.isMemorized ? 'Batalkan status Sudah Hafal' : 'Tandai Sudah Hafal (Lancar)'}
                      >
                        <CheckCircle2 className={`w-3.5 h-3.5 ${item.isMemorized ? 'text-emerald-600 fill-emerald-100' : ''}`} />
                      </button>
                    </div>

                    {/* Copy Text Button */}
                    <button
                      type="button"
                      onClick={() => handleCopyAyah(item)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors border border-slate-200/80 cursor-pointer"
                      title="Salin Teks Ayat & Terjemahan"
                    >
                      {isCopiedThis ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-semibold">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span className="hidden sm:inline">Salin</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Right: Practice & Navigate Buttons */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {/* Practice in Flashcard */}
                    <button
                      type="button"
                      onClick={() => onNavigateToAyah(item.page, item.ayahNumber, 'flashcard')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 font-semibold transition-colors cursor-pointer"
                      title="Uji hafalan ayat ini di Flashcard"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Uji di</span> Flashcard
                    </button>

                    {/* Open in Mushaf */}
                    <button
                      type="button"
                      onClick={() => onNavigateToAyah(item.page, item.ayahNumber, 'mushaf')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors cursor-pointer"
                      title="Lihat halaman ayat ini di Mushaf lengkap"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Buka</span> Mushaf
                    </button>

                    {/* Remove from marked list */}
                    <button
                      type="button"
                      onClick={() => onRemoveStatus(item.ayahNumber)}
                      className="p-1.5 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Hapus dari daftar ayat ditandai"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

      {/* 6. Footer Summary & Clear All Option */}
      {allItems.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-3xl bg-white/70 backdrop-blur-xs border border-slate-200/80 text-xs text-slate-500">
          <p>
            Menampilkan <strong>{filteredAndSortedItems.length}</strong> dari total{' '}
            <strong>{allItems.length}</strong> ayat tersimpan.
          </p>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Apakah Anda yakin ingin menghapus semua tanda ayat?')) {
                onClearAllStatuses();
              }
            }}
            className="text-slate-400 hover:text-rose-600 underline font-medium transition-colors cursor-pointer"
          >
            Hapus Semua Tanda Ayat
          </button>
        </div>
      )}

    </div>
  );
};
