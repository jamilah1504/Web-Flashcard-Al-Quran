import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  RefreshCw,
  Heart,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Award,
  Flower2,
  CheckCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  Ayah,
  HintLength,
  ActiveView,
  AppTheme,
  AyahStatusType,
  AyahStatusMap,
  AyahUserStatus,
} from './types';
import { getJuzByPage } from './data/juzData';
import { fetchAyahsForPage } from './services/quranApi';
import { getPageForSurahAndAyah } from './data/quranMeta';
import { getAyahAudioUrl, getFallbackAudioUrl } from './utils/quranHelper';
import { THEMES, ThemeConfig } from './utils/themeHelper';
import { Header } from './components/Header';
import { Flashcard } from './components/Flashcard';
import { Controls } from './components/Controls';
import { MushafView } from './components/MushafView';
import { ProgressDashboardModal } from './components/ProgressDashboardModal';
import { TajweedModal } from './components/TajweedModal';
import { SelectorModal } from './components/SelectorModal';
import { VerseGridModal } from './components/VerseGridModal';
import { FloralBackground } from './components/FloralBackground';

const STATUS_STORAGE_KEY = 'hafalanku_ayah_statuses_v2';
const OLD_MEMORIZED_STORAGE_KEY = 'tahfidz_memorized_ayahs_v1';
const THEME_STORAGE_KEY = 'hafalanku_theme_v1';
const LAST_PAGE_STORAGE_KEY = 'hafalanku_last_page_v1';
const AUDIO_MUTED_STORAGE_KEY = 'hafalanku_audio_muted';
const SHOW_LATIN_STORAGE_KEY = 'hafalanku_show_latin';
const SHOW_TAJWEED_STORAGE_KEY = 'hafalanku_show_tajweed';
const DAILY_TARGET_STORAGE_KEY = 'hafalanku_daily_target_v2';

export default function App() {
  // 1. Navigation & View Mode State
  const [activeView, setActiveView] = useState<ActiveView>('flashcard');

  // 2. Theme State (3 soft aesthetic themes)
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as AppTheme;
      if (saved && (saved === 'blossom' || saved === 'ocean' || saved === 'sage')) {
        return saved;
      }
    } catch (e) {}
    return 'blossom'; // Default theme
  });

  const themeConfig: ThemeConfig = useMemo(() => {
    return THEMES[currentTheme] || THEMES.blossom;
  }, [currentTheme]);

  const handleThemeChange = (newTheme: AppTheme) => {
    setCurrentTheme(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {}
  };

  // 3. Page & Quran Reading State
  const [currentPage, setCurrentPage] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(LAST_PAGE_STORAGE_KEY);
      if (saved) {
        const p = parseInt(saved, 10);
        if (p >= 1 && p <= 604) return p;
      }
    } catch (e) {}
    return 582; // Default to Juz 'Amma (Surah An-Naba', Halaman 582)
  });

  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [hintMode, setHintMode] = useState<HintLength>('short');
  const [isShuffled, setIsShuffled] = useState<boolean>(false);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 4. Beginner Aids: Latin Transliteration & Tajweed
  const [showLatin, setShowLatin] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SHOW_LATIN_STORAGE_KEY);
      return saved !== null ? saved === 'true' : true; // Default ON for beginners
    } catch {
      return true;
    }
  });

  const [showTajweed, setShowTajweed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SHOW_TAJWEED_STORAGE_KEY);
      return saved !== null ? saved === 'true' : true; // Default ON
    } catch {
      return true;
    }
  });

  const handleToggleLatin = () => {
    setShowLatin((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SHOW_LATIN_STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
  };

  const handleToggleTajweed = () => {
    setShowTajweed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SHOW_TAJWEED_STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
  };

  // 5. Memorization Status Management (📌 Bookmark, ⏳ Sedang Dihafal, ✅ Sudah Dihafal)
  const [statusMap, setStatusMap] = useState<AyahStatusMap>(() => {
    try {
      const saved = localStorage.getItem(STATUS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
      // Migration from old memorized list if exists
      const oldSaved = localStorage.getItem(OLD_MEMORIZED_STORAGE_KEY);
      if (oldSaved) {
        const oldObj = JSON.parse(oldSaved);
        const migrated: AyahStatusMap = {};
        for (const [key, val] of Object.entries(oldObj)) {
          if (val) {
            const num = parseInt(key, 10);
            migrated[num] = {
              ayahNumber: num,
              surahNumber: 0,
              surahName: '',
              numberInSurah: 0,
              page: 582,
              juz: 30,
              isFavorite: false,
              isLearning: false,
              isMemorized: true,
              updatedAt: new Date().toISOString(),
            };
          }
        }
        return migrated;
      }
    } catch (e) {
      console.warn('Failed to load status map:', e);
    }
    return {};
  });

  // Save statusMap to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STATUS_STORAGE_KEY, JSON.stringify(statusMap));
    } catch (e) {
      console.warn('Could not save status state:', e);
    }
  }, [statusMap]);

  // Save last visited page
  useEffect(() => {
    try {
      localStorage.setItem(LAST_PAGE_STORAGE_KEY, currentPage.toString());
    } catch (e) {}
  }, [currentPage]);

  // Daily Memorization Target State (Target Hafalan Harian)
  const [dailyTarget, setDailyTarget] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(DAILY_TARGET_STORAGE_KEY);
      return saved ? Math.max(1, parseInt(saved, 10)) : 5;
    } catch {
      return 5;
    }
  });

  const handleUpdateDailyTarget = useCallback((newTarget: number) => {
    setDailyTarget(newTarget);
    try {
      localStorage.setItem(DAILY_TARGET_STORAGE_KEY, String(newTarget));
    } catch (e) {}
  }, []);

  // Toggle status for an Ayah
  const handleToggleStatus = useCallback((ayahItem: Ayah, type: AyahStatusType) => {
    setStatusMap((prev) => {
      const current = prev[ayahItem.number] || {
        ayahNumber: ayahItem.number,
        surahNumber: ayahItem.surah.number,
        surahName: ayahItem.surah.englishName,
        numberInSurah: ayahItem.numberInSurah,
        page: ayahItem.page,
        juz: ayahItem.juz,
        isFavorite: false,
        isLearning: false,
        isMemorized: false,
        arabicText: ayahItem.text,
        latinText: ayahItem.latin,
        translation: ayahItem.translation,
        updatedAt: new Date().toISOString(),
      };

      const updated: AyahUserStatus = {
        ...current,
        surahName: current.surahName || ayahItem.surah.englishName,
        surahNumber: current.surahNumber || ayahItem.surah.number,
        numberInSurah: current.numberInSurah || ayahItem.numberInSurah,
        page: current.page || ayahItem.page,
        juz: current.juz || ayahItem.juz,
        arabicText: current.arabicText || ayahItem.text,
        latinText: current.latinText || ayahItem.latin,
        translation: current.translation || ayahItem.translation,
        updatedAt: new Date().toISOString(),
      };

      if (type === 'favorite') {
        updated.isFavorite = !current.isFavorite;
      } else if (type === 'learning') {
        updated.isLearning = !current.isLearning;
        // If set to learning, usually not yet memorized
        if (updated.isLearning) {
          updated.isMemorized = false;
        }
      } else if (type === 'memorized') {
        updated.isMemorized = !current.isMemorized;
        // If mastered, remove from learning
        if (updated.isMemorized) {
          updated.isLearning = false;
        }
      }

      return {
        ...prev,
        [ayahItem.number]: updated,
      };
    });
  }, []);

  const handleRemoveStatus = useCallback((ayahNumber: number) => {
    setStatusMap((prev) => {
      const next = { ...prev };
      delete next[ayahNumber];
      return next;
    });
  }, []);

  const handleClearAllStatuses = useCallback(() => {
    setStatusMap({});
    try {
      localStorage.removeItem(STATUS_STORAGE_KEY);
    } catch {}
  }, []);

  // 6. Audio Playback State
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [playingAyahNumber, setPlayingAyahNumber] = useState<number | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(AUDIO_MUTED_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Modals state
  const [isSelectorOpen, setIsSelectorOpen] = useState<boolean>(false);
  const [isGridOpen, setIsGridOpen] = useState<boolean>(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState<boolean>(false);
  const [isTajweedModalOpen, setIsTajweedModalOpen] = useState<boolean>(false);
  const [highlightTajweedRule, setHighlightTajweedRule] = useState<string | null>(null);

  // Stop audio immediately
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setIsPlayingAudio(false);
    setPlayingAyahNumber(null);
    setIsAudioLoading(false);
  }, []);

  // Play audio for a specific Ayah
  const handlePlayAyahAudio = useCallback(
    (targetAyah: Ayah) => {
      if (isPlayingAudio && playingAyahNumber === targetAyah.number) {
        stopAudio();
        return;
      }

      if (isAudioMuted) {
        setIsAudioMuted(false);
        try {
          localStorage.setItem(AUDIO_MUTED_STORAGE_KEY, 'false');
        } catch {}
      }

      stopAudio();
      setIsAudioLoading(true);
      setPlayingAyahNumber(targetAyah.number);

      const primaryUrl =
        targetAyah.audioUrl ||
        getAyahAudioUrl(targetAyah.surah.number, targetAyah.numberInSurah);
      const audio = new Audio(primaryUrl);
      audioRef.current = audio;

      let hasTriedFallback = false;

      audio.onplaying = () => {
        setIsAudioLoading(false);
        setIsPlayingAudio(true);
      };

      audio.onended = () => {
        setIsPlayingAudio(false);
        setPlayingAyahNumber(null);
        setIsAudioLoading(false);
        audioRef.current = null;
      };

      audio.onerror = () => {
        if (!hasTriedFallback && targetAyah) {
          hasTriedFallback = true;
          console.warn('Primary audio failed, switching to backup reciter URL...');
          const fallbackUrl = getFallbackAudioUrl(
            targetAyah.surah.number,
            targetAyah.numberInSurah
          );
          audio.src = fallbackUrl;
          audio.load();
          audio.play().catch((err) => {
            console.warn('Backup audio playback error:', err);
            stopAudio();
          });
        } else {
          stopAudio();
        }
      };

      audio.play().catch((err) => {
        console.warn('Primary audio play request failed:', err);
        if (!hasTriedFallback && targetAyah) {
          hasTriedFallback = true;
          const fallbackUrl = getFallbackAudioUrl(
            targetAyah.surah.number,
            targetAyah.numberInSurah
          );
          audio.src = fallbackUrl;
          audio.load();
          audio.play().catch(() => stopAudio());
        } else {
          stopAudio();
        }
      });
    },
    [isPlayingAudio, playingAyahNumber, isAudioMuted, stopAudio]
  );

  // Toggle global mute/disable audio
  const handleToggleAudioMute = useCallback(() => {
    setIsAudioMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(AUDIO_MUTED_STORAGE_KEY, String(next));
      } catch {}
      if (next) {
        stopAudio();
      }
      return next;
    });
  }, [stopAudio]);

  // Load Ayahs whenever currentPage or hintMode changes
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setErrorMessage(null);

    fetchAyahsForPage(currentPage, hintMode).then((res) => {
      if (!isMounted) return;
      setAyahs(res.ayahs);
      setIsLoading(false);
      setCurrentIndex(0);
      setIsFlipped(false);
      setIsShuffled(false);
      setShuffledIndices([]);

      if (res.error) {
        setErrorMessage(res.error);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [currentPage, hintMode]);

  // Stop audio whenever page changes
  useEffect(() => {
    stopAudio();
  }, [currentPage, stopAudio]);

  // Calculate current Juz Info
  const currentJuz = useMemo(() => getJuzByPage(currentPage), [currentPage]);

  // Actual index in ayahs array (accounts for shuffle mode)
  const activeAyahIndex = useMemo(() => {
    if (isShuffled && shuffledIndices.length === ayahs.length) {
      return shuffledIndices[currentIndex] ?? 0;
    }
    return currentIndex;
  }, [isShuffled, shuffledIndices, currentIndex, ayahs.length]);

  const currentAyah = ayahs[activeAyahIndex];

  // Navigation handlers
  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
      stopAudio();
    }
  }, [currentIndex, stopAudio]);

  const handleNext = useCallback(() => {
    if (currentIndex < ayahs.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      stopAudio();
    }
  }, [currentIndex, ayahs.length, stopAudio]);

  const handleToggleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  // Shuffle toggle
  const handleToggleShuffle = useCallback(() => {
    if (!isShuffled) {
      const indices = Array.from({ length: ayahs.length }, (_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      setShuffledIndices(indices);
      setIsShuffled(true);
      setCurrentIndex(0);
      setIsFlipped(false);
    } else {
      setIsShuffled(false);
      setShuffledIndices([]);
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  }, [isShuffled, ayahs.length]);

  const handleResetOrder = useCallback(() => {
    setIsShuffled(false);
    setShuffledIndices([]);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, []);

  // Jump to specific index (from grid modal)
  const handleSelectAyahIndex = useCallback((index: number) => {
    setIsShuffled(false);
    setShuffledIndices([]);
    setCurrentIndex(index);
    setIsFlipped(false);
  }, []);

  // Jump to specific Surah and Ayah
  const handleSelectSurahAndAyah = useCallback(
    async (surahNumber: number, ayahNumber: number) => {
      const targetPage = getPageForSurahAndAyah(surahNumber, ayahNumber);
      setIsSelectorOpen(false);

      if (targetPage === currentPage) {
        const targetIndex = ayahs.findIndex(
          (a) => a.surah.number === surahNumber && a.numberInSurah === ayahNumber
        );
        if (targetIndex !== -1) {
          setIsShuffled(false);
          setShuffledIndices([]);
          setCurrentIndex(targetIndex);
          setIsFlipped(false);
        }
        return;
      }

      setIsLoading(true);
      setCurrentPage(targetPage);
      try {
        const result = await fetchAyahsForPage(targetPage, hintMode);
        setAyahs(result.ayahs);
        setIsShuffled(false);
        setShuffledIndices([]);
        const targetIndex = result.ayahs.findIndex(
          (a) => a.surah.number === surahNumber && a.numberInSurah === ayahNumber
        );
        setCurrentIndex(targetIndex !== -1 ? targetIndex : 0);
        setIsFlipped(false);
        if (result.error) setErrorMessage(result.error);
      } catch (err: any) {
        setErrorMessage(err.message || 'Gagal memuat ayat');
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, ayahs, hintMode]
  );

  // Jump callback from Dashboard
  const handleNavigateFromDashboard = useCallback(
    async (page: number, ayahNumber: number, targetView: ActiveView) => {
      setActiveView(targetView);
      if (page !== currentPage) {
        setIsLoading(true);
        setCurrentPage(page);
        try {
          const result = await fetchAyahsForPage(page, hintMode);
          setAyahs(result.ayahs);
          const targetIndex = result.ayahs.findIndex((a) => a.number === ayahNumber);
          setCurrentIndex(targetIndex !== -1 ? targetIndex : 0);
          setIsFlipped(false);
        } catch (e) {
          console.warn('Navigation error:', e);
        } finally {
          setIsLoading(false);
        }
      } else {
        const targetIndex = ayahs.findIndex((a) => a.number === ayahNumber);
        if (targetIndex !== -1) {
          setCurrentIndex(targetIndex);
          setIsFlipped(false);
        }
      }

      // If switching to Mushaf view, scroll smoothly to the ayah element
      if (targetView === 'mushaf') {
        setTimeout(() => {
          const el = document.getElementById(`mushaf-ayah-${ayahNumber}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 400);
      }
    },
    [currentPage, ayahs, hintMode]
  );

  // Keyboard navigation for Flashcard view
  useEffect(() => {
    if (activeView !== 'flashcard') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleToggleFlip();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        if (currentAyah) {
          handleToggleStatus(currentAyah, 'memorized');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeView, handleNext, handlePrev, handleToggleFlip, handleToggleStatus, currentAyah]);

  // Stats calculation
  const memorizedOnThisPage = useMemo(() => {
    return ayahs.filter((a) => statusMap[a.number]?.isMemorized).length;
  }, [ayahs, statusMap]);

  const learningCount = useMemo(() => {
    return (Object.values(statusMap) as AyahUserStatus[]).filter((i) => i.isLearning).length;
  }, [statusMap]);

  const favoriteCount = useMemo(() => {
    return (Object.values(statusMap) as AyahUserStatus[]).filter((i) => i.isFavorite).length;
  }, [statusMap]);

  const totalMemorizedAll = useMemo(() => {
    return (Object.values(statusMap) as AyahUserStatus[]).filter((i) => i.isMemorized).length;
  }, [statusMap]);

  // Today key and count for Daily Memorization Target
  const todayKey = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const todayMemorizedCount = useMemo(() => {
    return (Object.values(statusMap) as AyahUserStatus[]).filter(
      (i) => i.isMemorized && i.updatedAt && i.updatedAt.startsWith(todayKey)
    ).length;
  }, [statusMap, todayKey]);

  const currentSurahName = currentAyah?.surah?.englishName;

  // Simple compatibility map for VerseGridModal
  const simpleMemorizedMap: Record<number, boolean> = useMemo(() => {
    const map: Record<number, boolean> = {};
    for (const [key, val] of Object.entries(statusMap) as [string, AyahUserStatus][]) {
      if (val.isMemorized) {
        map[Number(key)] = true;
      }
    }
    return map;
  }, [statusMap]);

  return (
    <div
      className={`min-h-screen flex flex-col justify-between ${themeConfig.bodyBgClass} relative overflow-x-hidden font-sans transition-colors duration-300`}
    >
      {/* Nature / Floral Ambient Background (Theme-Aware) */}
      <FloralBackground theme={currentTheme} />

      {/* Ambient Glows */}
      <div
        className={`fixed top-12 -left-20 w-80 h-80 ${themeConfig.ambientGlow} rounded-full blur-3xl pointer-events-none`}
      />
      <div
        className={`fixed top-1/3 -right-20 w-96 h-96 ${themeConfig.ambientGlow} rounded-full blur-3xl pointer-events-none`}
      />

      {/* Top Header with Brand, Views, Theme Switcher & Status Badge */}
      <Header
        activeView={activeView}
        onChangeView={setActiveView}
        currentTheme={currentTheme}
        themeConfig={themeConfig}
        onChangeTheme={handleThemeChange}
        currentPage={currentPage}
        currentJuz={currentJuz}
        currentSurahName={currentSurahName}
        totalAyahs={ayahs.length}
        memorizedCount={totalMemorizedAll}
        learningCount={learningCount}
        favoriteCount={favoriteCount}
        onOpenSelector={() => setIsSelectorOpen(true)}
        onOpenGrid={() => setIsGridOpen(true)}
        onOpenDashboard={() => setIsDashboardOpen(true)}
        onOpenTajweedModal={() => {
          setHighlightTajweedRule(null);
          setIsTajweedModalOpen(true);
        }}
        hintMode={hintMode}
        onChangeHintMode={(mode) => setHintMode(mode)}
        isAudioMuted={isAudioMuted}
        onToggleAudioMute={handleToggleAudioMute}
        isPlayingAudio={isPlayingAudio}
        dailyTarget={dailyTarget}
        todayMemorizedCount={todayMemorizedCount}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6 flex flex-col justify-center relative z-10">
        {/* Error / Offline Alert */}
        {errorMessage && (
          <div className="max-w-2xl mx-auto mb-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between gap-2 shadow-xs">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-amber-600 hover:text-amber-800 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="w-full max-w-2xl mx-auto min-h-[420px] bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200 shadow-xl p-8 flex flex-col items-center justify-center space-y-4">
            <div
              className={`w-12 h-12 rounded-full border-4 border-slate-200 border-t-current ${themeConfig.badgeText} animate-spin`}
            />
            <p className={`text-sm font-semibold ${themeConfig.badgeText} animate-pulse`}>
              Memuat ayat Al-Qur'an Halaman {currentPage}...
            </p>
            <p className="text-xs text-slate-400">
              Menyiapkan teks Utsmani, transliterasi Latin, panduan tajwid, & murottal
            </p>
          </div>
        ) : ayahs.length === 0 ? (
          <div className="w-full max-w-2xl mx-auto min-h-[300px] bg-white/90 rounded-3xl border border-slate-200 p-8 text-center flex flex-col items-center justify-center space-y-3">
            <p className="text-sm font-semibold text-slate-700">
              Tidak ada ayat ditemukan di halaman ini.
            </p>
            <button
              onClick={() => setCurrentPage(582)}
              className={`px-4 py-2 rounded-2xl ${themeConfig.primaryButton} text-xs font-semibold`}
            >
              Kembali ke Juz 'Amma (Halaman 582)
            </button>
          </div>
        ) : activeView === 'flashcard' && currentAyah ? (
          /* ========================================================= */
          /* VIEW 1: FLASHCARD HAFALAN (TEBAK AYAT & PANCINGAN)        */
          /* ========================================================= */
          <div className="space-y-4 sm:space-y-6">
            <Flashcard
              ayah={currentAyah}
              index={currentIndex}
              total={ayahs.length}
              isFlipped={isFlipped}
              onToggleFlip={handleToggleFlip}
              status={statusMap[currentAyah.number]}
              onToggleStatus={handleToggleStatus}
              themeConfig={themeConfig}
              showLatin={showLatin}
              showTajweed={showTajweed}
              onOpenTajweedModal={() => {
                setHighlightTajweedRule(null);
                setIsTajweedModalOpen(true);
              }}
              isAudioMuted={isAudioMuted}
              isPlayingAudio={isPlayingAudio && playingAyahNumber === currentAyah.number}
              isAudioLoading={isAudioLoading && playingAyahNumber === currentAyah.number}
              onToggleAudio={() => handlePlayAyahAudio(currentAyah)}
            />

            <Controls
              currentIndex={currentIndex}
              totalAyahs={ayahs.length}
              onPrev={handlePrev}
              onNext={handleNext}
              canPrev={currentIndex > 0}
              canNext={currentIndex < ayahs.length - 1}
              isShuffled={isShuffled}
              onToggleShuffle={handleToggleShuffle}
              onResetOrder={handleResetOrder}
              onToggleFlip={handleToggleFlip}
              isFlipped={isFlipped}
              themeConfig={themeConfig}
              showLatin={showLatin}
              onToggleLatin={handleToggleLatin}
              showTajweed={showTajweed}
              onToggleTajweed={handleToggleTajweed}
              isPlayingAudio={isPlayingAudio && playingAyahNumber === currentAyah.number}
              isAudioLoading={isAudioLoading && playingAyahNumber === currentAyah.number}
              isAudioMuted={isAudioMuted}
              onToggleAudio={() => handlePlayAyahAudio(currentAyah)}
            />

            {/* Beginner Helpful Guidance Strip */}
            <div className="max-w-2xl mx-auto p-3.5 sm:p-4 rounded-2xl bg-white/80 backdrop-blur-xs border border-slate-200/80 shadow-2xs flex items-start gap-3 text-xs text-slate-600">
              <div
                className={`p-2 rounded-xl shrink-0 ${themeConfig.badgeBg}`}
              >
                <Flower2 className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">
                  Tips Menghafal Mandiri (Metode Pancingan Kata):
                </p>
                <p className="text-slate-500 mt-0.5 leading-relaxed">
                  Lihat 2 kata awal sebagai pancingan ingatan, sambungkan kelanjutan ayat dalam hati, lalu ketuk kartu untuk memeriksa keakuratan lafal, harakat tajwid, dan artinya. Gunakan tombol 📌 Favorit, ⏳ Sedang Dihafal, atau ✅ Sudah Dihafal untuk memantau progresmu.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* VIEW 2: HALAMAN BACA (MUSHAF VIEW)                       */
          /* ========================================================= */
          <MushafView
            ayahs={ayahs}
            currentPage={currentPage}
            currentJuz={currentJuz.juzNumber}
            themeConfig={themeConfig}
            statusMap={statusMap}
            onToggleStatus={handleToggleStatus}
            isPlayingAudio={isPlayingAudio}
            playingAyahNumber={playingAyahNumber}
            isAudioLoading={isAudioLoading}
            onPlayAyahAudio={handlePlayAyahAudio}
            onStopAudio={stopAudio}
            onNextPage={() => {
              if (currentPage < 604) {
                setCurrentPage((p) => p + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            onPrevPage={() => {
              if (currentPage > 1) {
                setCurrentPage((p) => p - 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            onOpenSelector={() => setIsSelectorOpen(true)}
            showLatin={showLatin}
            onToggleLatin={handleToggleLatin}
            showTajweed={showTajweed}
            onToggleTajweed={handleToggleTajweed}
            onOpenTajweedModal={() => {
              setHighlightTajweedRule(null);
              setIsTajweedModalOpen(true);
            }}
            onSwitchToFlashcardWithAyah={(ayahIdx) => {
              setActiveView('flashcard');
              setCurrentIndex(ayahIdx);
              setIsFlipped(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center border-t border-slate-200/80 bg-white/60 backdrop-blur-xs text-xs text-slate-500 relative z-10">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="flex items-center gap-1">
            <span>Dibuat dengan</span>
            <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400 inline" />
            <span>untuk para penuntut ilmu & penghafal Al-Qur'an</span>
          </p>
          <div className="flex items-center gap-2.5 text-slate-400">
            <span>Rasm Utsmani Madinah</span>
            <span>·</span>
            <span>604 Halaman</span>
            <span>·</span>
            <span>30 Juz</span>
          </div>
        </div>
      </footer>

      {/* Modal: Juz & Page Selector */}
      <SelectorModal
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        currentPage={currentPage}
        onSelectPage={(newPage) => {
          setCurrentPage(newPage);
          setCurrentIndex(0);
          setIsFlipped(false);
        }}
        onSelectSurahAndAyah={handleSelectSurahAndAyah}
      />

      {/* Modal: Verse Grid for Current Page */}
      <VerseGridModal
        isOpen={isGridOpen}
        onClose={() => setIsGridOpen(false)}
        ayahs={ayahs}
        currentIndex={activeAyahIndex}
        onSelectAyah={handleSelectAyahIndex}
        memorizedMap={simpleMemorizedMap}
        currentPage={currentPage}
      />

      {/* Modal: Dashboard Progress Hafalan */}
      <ProgressDashboardModal
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        statusMap={statusMap}
        themeConfig={themeConfig}
        onNavigateToAyah={handleNavigateFromDashboard}
        onRemoveStatus={handleRemoveStatus}
        onClearAllStatuses={handleClearAllStatuses}
        dailyTarget={dailyTarget}
        onChangeDailyTarget={handleUpdateDailyTarget}
      />

      {/* Modal: Panduan Tajwid Berwarna untuk Pemula */}
      <TajweedModal
        isOpen={isTajweedModalOpen}
        onClose={() => setIsTajweedModalOpen(false)}
        themeConfig={themeConfig}
        highlightRule={highlightTajweedRule}
      />
    </div>
  );
}
