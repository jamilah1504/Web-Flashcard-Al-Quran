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
import { Ayah, HintLength } from './types';
import { getJuzByPage } from './data/juzData';
import { fetchAyahsForPage } from './services/quranApi';
import { getPageForSurahAndAyah } from './data/quranMeta';
import { getAyahAudioUrl, getFallbackAudioUrl } from './utils/quranHelper';
import { Header } from './components/Header';
import { Flashcard } from './components/Flashcard';
import { Controls } from './components/Controls';
import { SelectorModal } from './components/SelectorModal';
import { VerseGridModal } from './components/VerseGridModal';
import { FloralBackground } from './components/FloralBackground';

const MEMORIZED_STORAGE_KEY = 'tahfidz_memorized_ayahs_v1';
const LAST_PAGE_STORAGE_KEY = 'tahfidz_last_page_v1';
const AUDIO_MUTED_STORAGE_KEY = 'tahfidz_audio_muted';

export default function App() {
  // 1. Core State
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
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(AUDIO_MUTED_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Modals state
  const [isSelectorOpen, setIsSelectorOpen] = useState<boolean>(false);
  const [isGridOpen, setIsGridOpen] = useState<boolean>(false);

  // Memorized state map (ayah.number -> boolean)
  const [memorizedMap, setMemorizedMap] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem(MEMORIZED_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Save memorized map changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(MEMORIZED_STORAGE_KEY, JSON.stringify(memorizedMap));
    } catch (e) {
      console.warn('Could not save memorization state:', e);
    }
  }, [memorizedMap]);

  // Save last visited page
  useEffect(() => {
    try {
      localStorage.setItem(LAST_PAGE_STORAGE_KEY, currentPage.toString());
    } catch (e) {}
  }, [currentPage]);

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
      setIsFlipped(false); // Reset to pancingan/hint for the previous card
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < ayahs.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false); // Reset to pancingan/hint for the next card
    }
  }, [currentIndex, ayahs.length]);

  const handleToggleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleToggleMemorized = useCallback(() => {
    if (!currentAyah) return;
    setMemorizedMap((prev) => {
      const next = { ...prev, [currentAyah.number]: !prev[currentAyah.number] };
      return next;
    });
  }, [currentAyah]);

  // Stop/Disable current audio playback and clear instances
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setIsPlayingAudio(false);
    setIsAudioLoading(false);
  }, []);

  // Stop audio whenever active ayah, page, or view changes
  useEffect(() => {
    stopAudio();
  }, [currentAyah?.number, currentPage, stopAudio]);

  // Clean up audio on component unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  // Toggle Play / Nonaktifkan Audio for the current Ayah
  const handleToggleAudio = useCallback(() => {
    if (!currentAyah) return;

    // If currently playing or loading, nonaktifkan / stop audio immediately
    if (isPlayingAudio || isAudioLoading) {
      stopAudio();
      return;
    }

    // If audio is muted globally, unmute it when explicitly triggered
    if (isAudioMuted) {
      setIsAudioMuted(false);
      try {
        localStorage.setItem(AUDIO_MUTED_STORAGE_KEY, 'false');
      } catch {}
    }

    stopAudio();
    setIsAudioLoading(true);

    const primaryUrl =
      currentAyah.audioUrl ||
      getAyahAudioUrl(currentAyah.surah.number, currentAyah.numberInSurah);
    const audio = new Audio(primaryUrl);
    audioRef.current = audio;

    let hasTriedFallback = false;

    audio.onplaying = () => {
      setIsAudioLoading(false);
      setIsPlayingAudio(true);
    };

    audio.onended = () => {
      setIsPlayingAudio(false);
      setIsAudioLoading(false);
      audioRef.current = null;
    };

    audio.onerror = () => {
      if (!hasTriedFallback && currentAyah) {
        hasTriedFallback = true;
        console.warn('Primary audio failed, switching to backup reciter URL...');
        const fallbackUrl = getFallbackAudioUrl(
          currentAyah.surah.number,
          currentAyah.numberInSurah
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
      if (!hasTriedFallback && currentAyah) {
        hasTriedFallback = true;
        const fallbackUrl = getFallbackAudioUrl(
          currentAyah.surah.number,
          currentAyah.numberInSurah
        );
        audio.src = fallbackUrl;
        audio.load();
        audio.play().catch(() => stopAudio());
      } else {
        stopAudio();
      }
    });
  }, [currentAyah, isPlayingAudio, isAudioLoading, isAudioMuted, stopAudio]);

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

  // Shuffle toggle
  const handleToggleShuffle = useCallback(() => {
    if (!isShuffled) {
      // Create new shuffled order
      const indices = Array.from({ length: ayahs.length }, (_, i) => i);
      // Fisher-Yates shuffle
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
        // Already on the same page, jump immediately to the verse
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

      // Need to load the target page
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering when user is typing in an input
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
        handleToggleMemorized();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, handleToggleFlip, handleToggleMemorized]);

  // Stats calculation
  const memorizedOnThisPage = useMemo(() => {
    return ayahs.filter((a) => memorizedMap[a.number]).length;
  }, [ayahs, memorizedMap]);

  const currentSurahName = currentAyah?.surah?.englishName;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-rose-50/70 via-purple-50/30 to-amber-50/40 text-slate-800 relative overflow-x-hidden font-sans">
      {/* Delicate Floral Shadows in Background */}
      <FloralBackground />

      {/* Decorative Pastel Ambient Orbs */}
      <div className="fixed top-12 -left-20 w-80 h-80 bg-pink-300/15 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-1/3 -right-20 w-96 h-96 bg-purple-300/15 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-10 left-1/4 w-72 h-72 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar / Header */}
      <Header
        currentPage={currentPage}
        currentJuz={currentJuz}
        currentSurahName={currentSurahName}
        totalAyahs={ayahs.length}
        memorizedCount={memorizedOnThisPage}
        onOpenSelector={() => setIsSelectorOpen(true)}
        onOpenGrid={() => setIsGridOpen(true)}
        hintMode={hintMode}
        onChangeHintMode={(mode) => setHintMode(mode)}
        isAudioMuted={isAudioMuted}
        onToggleAudioMute={handleToggleAudioMute}
        isPlayingAudio={isPlayingAudio}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4 sm:py-6 flex flex-col justify-center relative z-10">
        {/* Notice/Alert if any */}
        {errorMessage && (
          <div className="max-w-2xl mx-auto mb-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between gap-2">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-amber-600 hover:text-amber-800 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Loading State Skeleton */}
        {isLoading ? (
          <div className="w-full max-w-2xl mx-auto min-h-[400px] bg-white/70 backdrop-blur-md rounded-3xl border border-pink-100 shadow-xl p-8 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-pink-200 border-t-pink-500 animate-spin" />
            <p className="text-sm font-semibold text-pink-700 animate-pulse">
              Memuat ayat Al-Qur'an Halaman {currentPage}...
            </p>
            <p className="text-xs text-stone-400">Menyiapkan pancingan dan mushaf rasm Utsmani</p>
          </div>
        ) : currentAyah ? (
          <div className="space-y-4 sm:space-y-6">
            {/* The 3D Interactive Flashcard */}
            <Flashcard
              ayah={currentAyah}
              index={currentIndex}
              total={ayahs.length}
              isFlipped={isFlipped}
              onToggleFlip={handleToggleFlip}
              isMemorized={!!memorizedMap[currentAyah.number]}
              onToggleMemorized={handleToggleMemorized}
              isAudioMuted={isAudioMuted}
              isPlayingAudio={isPlayingAudio}
              isAudioLoading={isAudioLoading}
              onToggleAudio={handleToggleAudio}
            />

            {/* Navigation & Controls */}
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
              isPlayingAudio={isPlayingAudio}
              isAudioLoading={isAudioLoading}
              isAudioMuted={isAudioMuted}
              onToggleAudio={handleToggleAudio}
            />
          </div>
        ) : (
          <div className="w-full max-w-2xl mx-auto min-h-[300px] bg-white/80 rounded-3xl border border-pink-100 p-8 text-center flex flex-col items-center justify-center space-y-3">
            <p className="text-sm font-semibold text-stone-600">
              Tidak ada ayat ditemukan di halaman ini.
            </p>
            <button
              onClick={() => setCurrentPage(582)}
              className="px-4 py-2 rounded-xl bg-pink-500 text-white text-xs font-semibold hover:bg-pink-600"
            >
              Kembali ke Juz 'Amma (Halaman 582)
            </button>
          </div>
        )}

        {/* Motivational Tahfidz Card */}
        <div className="max-w-2xl mx-auto mt-6 p-4 rounded-2xl bg-white/60 backdrop-blur-xs border border-pink-100/80 shadow-2xs flex items-center gap-3 text-xs text-stone-600">
          <div className="p-2 rounded-xl bg-pink-100/70 text-pink-600 shrink-0">
            <Flower2 className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-800">
              Tips Menghafal Mandiri (Metode Pancingan):
            </p>
            <p className="text-stone-500 mt-0.5 leading-relaxed">
              Baca 2-3 kata awal di kartu, sambungkan ayat sampai selesai di ingatanmu, lalu balikkan
              kartu untuk mengoreksi bacaan serta tajwidmu.
            </p>
          </div>
        </div>
      </main>

      {/* Sweet Aesthetic Footer */}
      <footer className="w-full py-4 text-center border-t border-pink-100/80 bg-white/50 backdrop-blur-xs text-xs text-stone-500 relative z-10">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="flex items-center gap-1">
            <span>Dibuat dengan</span>
            <Heart className="w-3.5 h-3.5 fill-pink-400 text-pink-400 inline" />
            <span>untuk para penghafal Al-Qur'an</span>
          </p>
          <div className="flex items-center gap-3 text-stone-400">
            <span>Rasm Utsmani Madinah</span>
            <span>•</span>
            <span>604 Halaman</span>
            <span>•</span>
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
        memorizedMap={memorizedMap}
        currentPage={currentPage}
      />
    </div>
  );
}
