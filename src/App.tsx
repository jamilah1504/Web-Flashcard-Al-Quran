import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AnimatePresence } from 'motion/react';
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
  Calendar,
  FileSpreadsheet,
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
  ScheduleItem,
  ScheduleActivityType,
  ScheduleStatus,
} from './types';
import { getJuzByPage } from './data/juzData';
import { fetchAyahsForPage } from './services/quranApi';
import { getPageForSurahAndAyah } from './data/quranMeta';
import { getAyahAudioUrl, getFallbackAudioUrl } from './utils/quranHelper';
import { THEMES, ThemeConfig } from './utils/themeHelper';
import {
  saveToSheet,
  loadFromSheet,
  isRealScriptConfigured,
  LAST_SYNC_STORAGE_KEY,
} from './services/googleSheetService';

import { Header } from './components/Header';
import { Flashcard } from './components/Flashcard';
import { Controls } from './components/Controls';
import { MushafView } from './components/MushafView';
import { CalendarScheduleView } from './components/CalendarScheduleView';
import { ProgressDashboardView } from './components/ProgressDashboardView';
import { ProgressDashboardModal } from './components/ProgressDashboardModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { TajweedModal } from './components/TajweedModal';
import { SelectorModal } from './components/SelectorModal';
import { VerseGridModal } from './components/VerseGridModal';
import { FloralBackground } from './components/FloralBackground';
import { SplashScreen } from './components/SplashScreen';
import { InstallGuideModal } from './components/InstallGuideModal';
import { ShareAppModal } from './components/ShareAppModal';

const STATUS_STORAGE_KEY = 'hafalanku_ayah_statuses_v2';
const SCHEDULES_STORAGE_KEY = 'hafalanku_schedules_v2';
const OLD_MEMORIZED_STORAGE_KEY = 'tahfidz_memorized_ayahs_v1';
const THEME_STORAGE_KEY = 'hafalanku_theme_v1';
const LAST_PAGE_STORAGE_KEY = 'hafalanku_last_page_v1';
const AUDIO_MUTED_STORAGE_KEY = 'hafalanku_audio_muted';
const SHOW_LATIN_STORAGE_KEY = 'hafalanku_show_latin';
const SHOW_TAJWEED_STORAGE_KEY = 'hafalanku_show_tajweed';
const DAILY_TARGET_STORAGE_KEY = 'hafalanku_daily_target_v2';

export default function App() {
  // 0. Splash / Loading Screen State
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // 1. Navigation & View Mode State (4 Views)
  const [activeView, setActiveView] = useState<ActiveView>('flashcard');

  // 2. Theme State (3 soft aesthetic themes)
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as AppTheme;
      if (saved && (saved === 'blossom' || saved === 'ocean' || saved === 'sage')) {
        return saved;
      }
    } catch (e) {}
    return 'blossom'; // Default theme: Blossom (Girly Pink)
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

  // 6. Calendar & Schedule State (Halaman 3)
  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => {
    try {
      const saved = localStorage.getItem(SCHEDULES_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}

    // Initial default beginner-friendly schedule items
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const tmr = new Date(Date.now() + 86400000);
    const tmrStr = `${tmr.getFullYear()}-${String(tmr.getMonth() + 1).padStart(2, '0')}-${String(tmr.getDate()).padStart(2, '0')}`;

    return [
      {
        id: 'sch-1',
        date: todayStr,
        activityType: 'Setoran',
        target: "Setoran Surat An-Naba' ayat 1-15",
        notes: "Perhatikan dengung (ghunnah) dan mad wajib muttashil",
        status: 'Belum',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'sch-2',
        date: todayStr,
        activityType: "Muroja'ah",
        target: "Muroja'ah Surat Al-Mulk ayat 1-30",
        notes: "Dibaca tartil sebelum istirahat malam",
        status: 'Selesai',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      },
      {
        id: 'sch-3',
        date: tmrStr,
        activityType: 'Tartil',
        target: 'Tartil 1 lembar Surah Al-Baqarah ba’da Subuh',
        notes: 'Pahami terjemahan dan makna ayat',
        status: 'Belum',
        createdAt: new Date().toISOString(),
      },
    ];
  });

  // Save schedules to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(schedules));
    } catch (e) {}
  }, [schedules]);

  // 7. Google Sheets Sync State
  const [isGoogleSheetsModalOpen, setIsGoogleSheetsModalOpen] = useState<boolean>(false);
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() => {
    try {
      return localStorage.getItem(LAST_SYNC_STORAGE_KEY);
    } catch {
      return null;
    }
  });

  // Handle Full Manual Sync with Google Sheets
  const handleTriggerFullSync = async (spreadsheetId?: string) => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await saveToSheet('SYNC_ALL', {
        statuses: statusMap,
        schedules: schedules,
        dailyTarget: dailyTarget,
      });

      if (res.success) {
        const now = new Date().toISOString();
        setLastSyncedAt(now);
        setSyncMessage(res.message);
      } else {
        setSyncMessage(`Perhatian: ${res.message}`);
      }
    } catch (err: any) {
      setSyncMessage(err?.message || 'Gagal menyinkronkan data.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  // Handle Load / Restore Data from Google Sheets
  const handleTriggerLoad = async (spreadsheetId: string) => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await loadFromSheet(spreadsheetId);
      if (res.success && res.data) {
        if (res.data.statuses && Object.keys(res.data.statuses).length > 0) {
          setStatusMap(res.data.statuses);
        }
        if (res.data.schedules && res.data.schedules.length > 0) {
          setSchedules(res.data.schedules);
        }
        if (res.data.dailyTarget) {
          setDailyTarget(res.data.dailyTarget);
        }
        const now = new Date().toISOString();
        setLastSyncedAt(now);
        setSyncMessage(res.message || 'Data berhasil dimuat dari Google Sheets!');
      } else {
        setSyncMessage(`Perhatian: ${res.message}`);
      }
    } catch (err: any) {
      setSyncMessage(err?.message || 'Gagal memuat data dari Google Sheets.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  // Schedule Management Handlers (Auto sync to Google Sheets)
  const handleAddSchedule = useCallback(
    (newScheduleData: Omit<ScheduleItem, 'id' | 'createdAt'>) => {
      const newItem: ScheduleItem = {
        ...newScheduleData,
        id: `sch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString(),
      };
      setSchedules((prev) => [newItem, ...prev]);

      // Auto-save to Google Sheets
      saveToSheet('ADD_SCHEDULE', newItem).catch((e) =>
        console.warn('Auto-save schedule to sheet failed:', e)
      );
    },
    []
  );

  const handleUpdateSchedule = useCallback((updatedItem: ScheduleItem) => {
    setSchedules((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );

    // Auto-save to Google Sheets
    saveToSheet('UPDATE_SCHEDULE', updatedItem).catch((e) =>
      console.warn('Auto-update schedule to sheet failed:', e)
    );
  }, []);

  const handleDeleteSchedule = useCallback((id: string) => {
    setSchedules((prev) => prev.filter((item) => item.id !== id));

    // Auto-delete from Google Sheets
    saveToSheet('DELETE_SCHEDULE', { id }).catch((e) =>
      console.warn('Auto-delete schedule from sheet failed:', e)
    );
  }, []);

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

  // Toggle status for an Ayah (Auto-sync to Google Sheets)
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
        if (updated.isLearning) {
          updated.isMemorized = false;
        }
      } else if (type === 'memorized') {
        updated.isMemorized = !current.isMemorized;
        if (updated.isMemorized) {
          updated.isLearning = false;
        }
      }

      // Automatically sync updated ayah status to Google Sheets
      saveToSheet('UPDATE_STATUS', updated).catch((e) =>
        console.warn('Auto-save ayah status to sheet failed:', e)
      );

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

  // 8. Audio Playback State
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
  const pendingTargetAyahRef = useRef<{
    surahNumber?: number;
    ayahNumber?: number;
    globalAyahNumber?: number;
  } | null>(null);

  // Modals state
  const [isSelectorOpen, setIsSelectorOpen] = useState<boolean>(false);
  const [isGridOpen, setIsGridOpen] = useState<boolean>(false);
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
        if (!hasTriedFallback) {
          hasTriedFallback = true;
          const fallbackUrl = getFallbackAudioUrl(
            targetAyah.surah.number,
            targetAyah.numberInSurah
          );
          if (audioRef.current) {
            audioRef.current.src = fallbackUrl;
            audioRef.current.play().catch(() => {
              stopAudio();
            });
          }
        } else {
          stopAudio();
        }
      };

      audio.play().catch(() => {
        if (!hasTriedFallback) {
          hasTriedFallback = true;
          const fallbackUrl = getFallbackAudioUrl(
            targetAyah.surah.number,
            targetAyah.numberInSurah
          );
          if (audioRef.current) {
            audioRef.current.src = fallbackUrl;
            audioRef.current.play().catch(() => {
              stopAudio();
            });
          }
        } else {
          stopAudio();
        }
      });
    },
    [isPlayingAudio, playingAyahNumber, isAudioMuted, stopAudio]
  );

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
      setIsFlipped(false);
      setIsShuffled(false);
      setShuffledIndices([]);

      if (pendingTargetAyahRef.current) {
        const pending = pendingTargetAyahRef.current;
        pendingTargetAyahRef.current = null;

        let targetIndex = -1;
        if (pending.surahNumber !== undefined && pending.ayahNumber !== undefined) {
          targetIndex = res.ayahs.findIndex(
            (a) => a.surah.number === pending.surahNumber && a.numberInSurah === pending.ayahNumber
          );
        } else if (pending.globalAyahNumber !== undefined) {
          targetIndex = res.ayahs.findIndex(
            (a) => a.number === pending.globalAyahNumber
          );
        }

        const finalIdx = targetIndex !== -1 ? targetIndex : 0;
        setCurrentIndex(finalIdx);

        // Smooth scroll to that ayah in Mushaf view
        setTimeout(() => {
          const found = res.ayahs[finalIdx];
          if (found) {
            const el = document.getElementById(`mushaf-ayah-${found.number}`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              el.classList.add('ring-4', 'ring-pink-400');
              setTimeout(() => el.classList.remove('ring-4', 'ring-pink-400'), 2500);
            }
          }
        }, 200);
      } else {
        setCurrentIndex(0);
      }

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
    (surahNumber: number, ayahNumber: number) => {
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

          // If on Mushaf view, scroll to that ayah
          setTimeout(() => {
            const foundAyah = ayahs[targetIndex];
            const el = document.getElementById(`mushaf-ayah-${foundAyah.number}`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              el.classList.add('ring-4', 'ring-pink-400');
              setTimeout(() => el.classList.remove('ring-4', 'ring-pink-400'), 2500);
            }
          }, 150);
        }
        return;
      }

      pendingTargetAyahRef.current = { surahNumber, ayahNumber };
      setIsLoading(true);
      setCurrentPage(targetPage);
    },
    [currentPage, ayahs]
  );

  // Jump callback from Dashboard
  const handleNavigateFromDashboard = useCallback(
    (page: number, ayahNumber: number, targetView: ActiveView) => {
      setActiveView(targetView);
      if (page !== currentPage) {
        pendingTargetAyahRef.current = { globalAyahNumber: ayahNumber };
        setIsLoading(true);
        setCurrentPage(page);
      } else {
        const targetIndex = ayahs.findIndex((a) => a.number === ayahNumber);
        if (targetIndex !== -1) {
          setCurrentIndex(targetIndex);
          setIsFlipped(false);
        }
        if (targetView === 'mushaf') {
          setTimeout(() => {
            const el = document.getElementById(`mushaf-ayah-${ayahNumber}`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              el.classList.add('ring-4', 'ring-pink-400');
              setTimeout(() => el.classList.remove('ring-4', 'ring-pink-400'), 2500);
            }
          }, 150);
        }
      }
    },
    [currentPage, ayahs]
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeView, handleNext, handlePrev, handleToggleFlip]);

  // Aggregate statistics for header badge
  const totalMemorizedAll = useMemo(() => {
    return (Object.values(statusMap) as AyahUserStatus[]).filter((s) => s.isMemorized).length;
  }, [statusMap]);

  const learningCount = useMemo(() => {
    return (Object.values(statusMap) as AyahUserStatus[]).filter((s) => s.isLearning).length;
  }, [statusMap]);

  const favoriteCount = useMemo(() => {
    return (Object.values(statusMap) as AyahUserStatus[]).filter((s) => s.isFavorite).length;
  }, [statusMap]);

  // Today's Date String
  const todayKey = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const todayMemorizedCount = useMemo(() => {
    return (Object.values(statusMap) as AyahUserStatus[]).filter(
      (item) => item.isMemorized && item.updatedAt && item.updatedAt.startsWith(todayKey)
    ).length;
  }, [statusMap, todayKey]);

  // Current Surah name for header
  const currentSurahName = useMemo(() => {
    if (ayahs.length === 0) return undefined;
    const names = Array.from(new Set(ayahs.map((a) => a.surah.englishName)));
    if (names.length === 1) return names[0];
    return `${names[0]} & ${names.length - 1} Surat Lain`;
  }, [ayahs]);

  // Simple map for grid modal
  const simpleMemorizedMap = useMemo(() => {
    const map: Record<number, boolean> = {};
    for (const [k, v] of Object.entries(statusMap) as [string, AyahUserStatus][]) {
      if (v?.isMemorized) {
        map[Number(k)] = true;
      }
    }
    return map;
  }, [statusMap]);

  return (
    <div
      className={`min-h-screen flex flex-col justify-between ${themeConfig.bodyBgClass} relative overflow-x-hidden font-sans transition-colors duration-300`}
    >
      {/* 0. Welcome / Splash Loading Screen */}
      <AnimatePresence>
        {showSplash && (
          <SplashScreen
            isLoadingData={isLoading}
            onFinish={() => setShowSplash(false)}
            themeConfig={themeConfig}
            currentTheme={currentTheme}
          />
        )}
      </AnimatePresence>

      {/* Nature / Floral Ambient Background (Theme-Aware) */}
      <FloralBackground theme={currentTheme} />

      {/* Ambient Glows */}
      <div
        className={`fixed top-12 -left-20 w-80 h-80 ${themeConfig.ambientGlow} rounded-full blur-3xl pointer-events-none`}
      />
      <div
        className={`fixed top-1/3 -right-20 w-96 h-96 ${themeConfig.ambientGlow} rounded-full blur-3xl pointer-events-none`}
      />

      {/* Top Header with Multi-View, Brand, 3 Themes, Google Sheets & Stats */}
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
        onOpenTajweedModal={() => {
          setHighlightTajweedRule(null);
          setIsTajweedModalOpen(true);
        }}
        onOpenGoogleSheets={() => setIsGoogleSheetsModalOpen(true)}
        isSheetsConfigured={isRealScriptConfigured()}
        onOpenInstallGuide={() => setIsInstallGuideOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        hintMode={hintMode}
        onChangeHintMode={(mode) => setHintMode(mode)}
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

        {/* Conditional Rendering for the 4 Multi-Views */}
        {activeView === 'calendar' ? (
          /* ========================================================= */
          /* VIEW 3: KALENDER & JADWAL (SETORAN & MUROJA'AH)           */
          /* ========================================================= */
          <CalendarScheduleView
            schedules={schedules}
            onAddSchedule={handleAddSchedule}
            onUpdateSchedule={handleUpdateSchedule}
            onDeleteSchedule={handleDeleteSchedule}
            themeConfig={themeConfig}
            onOpenGoogleSheetsModal={() => setIsGoogleSheetsModalOpen(true)}
            isSheetsConfigured={isRealScriptConfigured()}
          />
        ) : activeView === 'dashboard' ? (
          /* ========================================================= */
          /* VIEW 4: DASHBOARD PROGRESS & FAVORIT                      */
          /* ========================================================= */
          <ProgressDashboardView
            statusMap={statusMap}
            themeConfig={themeConfig}
            onNavigateToAyah={handleNavigateFromDashboard}
            onRemoveStatus={handleRemoveStatus}
            onClearAllStatuses={handleClearAllStatuses}
            dailyTarget={dailyTarget}
            onChangeDailyTarget={handleUpdateDailyTarget}
            onOpenGoogleSheetsModal={() => setIsGoogleSheetsModalOpen(true)}
            isSheetsConfigured={isRealScriptConfigured()}
          />
        ) : isLoading ? (
          /* Loading Spinner for Quran Views */
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
              <div className={`p-2 rounded-xl shrink-0 ${themeConfig.badgeBg}`}>
                <Flower2 className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">
                  Tips Menghafal Mandiri (Metode Pancingan Kata):
                </p>
                <p className="text-slate-500 mt-0.5 leading-relaxed">
                  Lihat 2 kata awal sebagai pancingan ingatan, sambungkan kelanjutan ayat dalam hati, lalu ketuk kartu untuk memeriksa keakuratan lafal, harakat tajwid, dan artinya.
                  <br />
                  Gunakan tombol 📌 Favorit, ⏳ Sedang Dihafal, atau ✅ Sudah Dihafal untuk memantau progresmu. Data otomatis tersimpan dan disinkronkan ke Google Sheets!
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
            onSelectSurahAndAyah={handleSelectSurahAndAyah}
            onSelectPage={(newPage) => {
              setCurrentPage(newPage);
              setCurrentIndex(0);
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
            <button
              onClick={() => setIsGoogleSheetsModalOpen(true)}
              className="hover:text-pink-600 underline underline-offset-2 transition-colors cursor-pointer flex items-center gap-1"
              title="Integrasi Google Sheets"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Google Sheets API</span>
            </button>
            <span>·</span>
            <button
              onClick={() => setIsInstallGuideOpen(true)}
              className="hover:text-emerald-700 underline underline-offset-2 transition-colors cursor-pointer"
              title="Tambahkan ke Layar Utama HP"
            >
              Pasang di HP
            </button>
            <span>·</span>
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="hover:text-emerald-700 underline underline-offset-2 transition-colors cursor-pointer"
              title="Bagikan Tautan & Cover Banner"
            >
              Bagikan
            </button>
            <span>·</span>
            <button
              onClick={() => setShowSplash(true)}
              className="hover:text-slate-700 underline underline-offset-2 transition-colors cursor-pointer"
              title="Tampilkan layar pembuka"
            >
              Layar Pembuka
            </button>
            <span>·</span>
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

      {/* Modal: Google Sheets Setup & Sync */}
      <GoogleSheetsModal
        isOpen={isGoogleSheetsModalOpen}
        onClose={() => setIsGoogleSheetsModalOpen(false)}
        themeConfig={themeConfig}
        lastSyncedAt={lastSyncedAt}
        onTriggerSync={handleTriggerFullSync}
        onTriggerLoad={handleTriggerLoad}
        isSyncing={isSyncing}
        syncMessage={syncMessage}
        statusMap={statusMap}
        schedules={schedules}
        dailyTarget={dailyTarget}
      />

      {/* Modal: Panduan Tajwid Berwarna untuk Pemula */}
      <TajweedModal
        isOpen={isTajweedModalOpen}
        onClose={() => setIsTajweedModalOpen(false)}
        themeConfig={themeConfig}
        highlightRule={highlightTajweedRule}
      />

      {/* Modal: Panduan Tambah ke Layar Utama HP (PWA) */}
      <InstallGuideModal
        isOpen={isInstallGuideOpen}
        onClose={() => setIsInstallGuideOpen(false)}
      />

      {/* Modal: Bagikan Tautan & Pratinjau Cover Social Share */}
      <ShareAppModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
}
