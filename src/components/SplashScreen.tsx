import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Sparkles, Heart, ChevronRight, Moon, Award } from 'lucide-react';
import { AppTheme } from '../types';
import { ThemeConfig } from '../utils/themeHelper';

interface SplashScreenProps {
  isLoadingData: boolean;
  onFinish: () => void;
  themeConfig: ThemeConfig;
  currentTheme: AppTheme;
}

const QUOTES = [
  {
    arabic: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
    translation: 'Sebaik-baik kalian adalah orang yang mempelajari Al-Qur\'an dan mengajarkannya.',
    source: 'HR. Bukhari',
  },
  {
    arabic: 'وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ',
    translation: 'Dan sungguh, telah Kami mudahkan Al-Qur\'an untuk peringatan, maka adakah orang yang mau mengambil pelajaran?',
    source: 'QS. Al-Qamar: 17',
  },
  {
    arabic: 'اقْرَءُوا الْقُرْآنَ فَإِنَّهُ يَأْتِي يَوْمَ الْقِيَامَةِ شَفِيعًا لِأَصْحَابِهِ',
    translation: 'Bacalah Al-Qur\'an, sesungguhnya ia akan datang pada hari kiamat memberikan syafaat bagi pembacanya.',
    source: 'HR. Muslim',
  },
];

const LOADING_STEPS = [
  { percent: 20, text: 'Bismillah, memulai niat mulia...' },
  { percent: 45, text: 'Menyiapkan Mushaf Al-Qur\'an & ayat-ayat suci...' },
  { percent: 70, text: 'Memuat panduan tajwid berwarna & audio murottal...' },
  { percent: 90, text: 'Menyiapkan dashboard & target hafalan harian...' },
  { percent: 100, text: 'Alhamdulillah, selamat menghafal!' },
];

export const SplashScreen: React.FC<SplashScreenProps> = ({
  isLoadingData,
  onFinish,
  themeConfig,
  currentTheme,
}) => {
  const [progress, setProgress] = useState<number>(10);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [quoteIndex] = useState<number>(() => Math.floor(Math.random() * QUOTES.length));

  // Progress animation
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        // If data is still loading, cap at 85%
        if (isLoadingData && prev >= 85) {
          return 85;
        }
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        const increment = prev < 60 ? Math.random() * 15 + 8 : Math.random() * 10 + 5;
        return Math.min(100, Math.round(prev + increment));
      });
    }, 280);

    return () => clearInterval(timer);
  }, [isLoadingData]);

  // Update step text based on progress
  useEffect(() => {
    let currentStep = 0;
    for (let i = 0; i < LOADING_STEPS.length; i++) {
      if (progress >= LOADING_STEPS[i].percent) {
        currentStep = i;
      }
    }
    setStepIndex(currentStep);
  }, [progress]);

  // When progress reaches 100% and data is ready, automatically finish after short pause
  useEffect(() => {
    if (progress >= 100 && !isLoadingData) {
      const exitTimer = setTimeout(() => {
        onFinish();
      }, 500);
      return () => clearTimeout(exitTimer);
    }
  }, [progress, isLoadingData, onFinish]);

  const activeQuote = QUOTES[quoteIndex];

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-between p-6 sm:p-10 select-none overflow-hidden bg-gradient-to-b from-white via-rose-50/50 to-amber-50/40"
      style={{
        background:
          currentTheme === 'ocean'
            ? 'linear-gradient(to bottom, #ffffff, #f0f9ff, #e0f2fe)'
            : currentTheme === 'sage'
            ? 'linear-gradient(to bottom, #ffffff, #f0fdf4, #ecfdf5)'
            : 'linear-gradient(to bottom, #ffffff, #fff1f2, #fdf2f8)',
      }}
    >
      {/* Background Ambient Glow & Islamic Star Geometry */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Radial Glows */}
        <div
          className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-30 ${
            currentTheme === 'ocean'
              ? 'bg-sky-400'
              : currentTheme === 'sage'
              ? 'bg-emerald-400'
              : 'bg-rose-400'
          }`}
        />
        <div
          className={`absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-30 ${
            currentTheme === 'ocean'
              ? 'bg-blue-400'
              : currentTheme === 'sage'
              ? 'bg-teal-400'
              : 'bg-pink-400'
          }`}
        />

        {/* Subtle Islamic Motif Stars */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.035]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="islamic-star-pattern" width="80" height="80" patternUnits="userSpaceOnUse">
              <path
                d="M40 0 L52 28 L80 40 L52 52 L40 80 L28 52 L0 40 L28 28 Z"
                fill="currentColor"
              />
              <circle cx="40" cy="40" r="12" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamic-star-pattern)" />
        </svg>
      </div>

      {/* Top Bar: Basmalah Calligraphy & Bismillah */}
      <div className="relative z-10 w-full text-center pt-2 sm:pt-4">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="inline-block"
        >
          <div className="px-4 py-1.5 rounded-full bg-white/80 border border-slate-200/80 shadow-2xs backdrop-blur-xs">
            <span className="font-arabic text-lg sm:text-2xl text-slate-800 tracking-wider">
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </span>
          </div>
        </motion.div>
      </div>

      {/* Center Section: App Brand, Animated Logo, & Quote */}
      <div className="relative z-10 flex flex-col items-center justify-center max-w-md w-full my-auto text-center px-2">
        {/* Animated App Icon with Glowing Ring */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative mb-5"
        >
          {/* Pulsing Aura */}
          <div
            className={`absolute inset-0 rounded-3xl blur-xl opacity-50 scale-125 animate-pulse ${
              currentTheme === 'ocean'
                ? 'bg-sky-400'
                : currentTheme === 'sage'
                ? 'bg-emerald-400'
                : 'bg-rose-400'
            }`}
          />

          {/* Icon Box */}
          <div
            className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr ${themeConfig.accentGradient} p-0.5 shadow-2xl flex items-center justify-center`}
          >
            <div className="w-full h-full bg-white/15 backdrop-blur-md rounded-[22px] flex items-center justify-center text-white">
              <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-white drop-shadow-md animate-bounce-subtle" />
            </div>

            {/* Sparkle Badge */}
            <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shadow-lg border-2 border-white">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
            </div>
          </div>
        </motion.div>

        {/* App Title */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="space-y-1 mb-6"
        >
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight flex items-center justify-center gap-2">
            <span>HafalanKu</span>
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-600">
            Teman Menghafal Al-Qur'an 30 Juz & Tajwid Berwarna
          </p>
        </motion.div>

        {/* Inspiring Quranic / Hadith Quote Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="w-full bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-lg shadow-slate-100 space-y-2.5 mb-6"
        >
          <p
            dir="rtl"
            lang="ar"
            className="font-arabic text-xl sm:text-2xl text-slate-800 leading-relaxed font-bold text-center"
          >
            {activeQuote.arabic}
          </p>
          <p className="text-xs sm:text-sm text-slate-600 italic font-medium leading-relaxed">
            "{activeQuote.translation}"
          </p>
          <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-400">
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
            <span>{activeQuote.source}</span>
          </div>
        </motion.div>

        {/* Dynamic Progress Bar & Step Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="w-full space-y-2.5"
        >
          <div className="flex items-center justify-between text-xs font-semibold px-1">
            <span className="text-slate-600 truncate max-w-[260px]">
              {LOADING_STEPS[stepIndex]?.text}
            </span>
            <span className={`font-mono font-bold ${themeConfig.badgeText}`}>
              {progress}%
            </span>
          </div>

          {/* Progress Bar Track */}
          <div className="w-full h-3 bg-slate-200/70 rounded-full overflow-hidden p-0.5 border border-slate-300/60 shadow-inner">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${themeConfig.accentGradient} transition-all duration-300 ease-out shadow-sm`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar: Action Button & Credits */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="relative z-10 w-full flex flex-col items-center gap-3 pb-2"
      >
        {/* Skip / Enter Button if ready or user wants to proceed */}
        <button
          onClick={onFinish}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 ${
            progress >= 60
              ? `${themeConfig.primaryButton} animate-pulse`
              : 'bg-white/80 hover:bg-white text-slate-600 border border-slate-200 shadow-2xs'
          }`}
        >
          <span>{progress >= 100 ? 'Mulai Menghafal Sekarang' : 'Masuk ke Aplikasi'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        <p className="text-[11px] text-slate-400 font-medium">
          Murottal Syekh Mishari Rashid · Teks Utsmani Kemenag / Madinah · 604 Halaman
        </p>
      </motion.div>
    </motion.div>
  );
};
