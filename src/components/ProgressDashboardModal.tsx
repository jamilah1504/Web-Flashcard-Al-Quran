import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Award,
  Bookmark,
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
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AyahStatusMap, AyahUserStatus, AyahStatusType, ActiveView } from '../types';
import { ThemeConfig } from '../utils/themeHelper';

interface ProgressDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  statusMap: AyahStatusMap;
  themeConfig: ThemeConfig;
  onNavigateToAyah: (page: number, ayahNumber: number, view: ActiveView) => void;
  onRemoveStatus: (ayahNumber: number, type?: AyahStatusType) => void;
  onClearAllStatuses: () => void;
  dailyTarget: number;
  onChangeDailyTarget: (target: number) => void;
}

export const ProgressDashboardModal: React.FC<ProgressDashboardModalProps> = ({
  isOpen,
  onClose,
  statusMap,
  themeConfig,
  onNavigateToAyah,
  onRemoveStatus,
  onClearAllStatuses,
  dailyTarget,
  onChangeDailyTarget,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'memorized' | 'learning' | 'favorite'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Collect array of status items
  const items: AyahUserStatus[] = useMemo(() => {
    return (Object.values(statusMap) as AyahUserStatus[]).filter(
      (item) => item.isFavorite || item.isLearning || item.isMemorized
    );
  }, [statusMap]);

  // Totals
  const totalMemorized = useMemo(() => items.filter((i) => i.isMemorized).length, [items]);
  const totalLearning = useMemo(() => items.filter((i) => i.isLearning).length, [items]);
  const totalFavorite = useMemo(() => items.filter((i) => i.isFavorite).length, [items]);

  // Today's Date String: YYYY-MM-DD
  const todayKey = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  // Today's Date Formatted for Display in Indonesian
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
    return items.filter(
      (item) => item.isMemorized && item.updatedAt && item.updatedAt.startsWith(todayKey)
    );
  }, [items, todayKey]);

  const todayMemorizedCount = todayMemorizedItems.length;
  const progressPercent = Math.min(
    100,
    dailyTarget > 0 ? Math.round((todayMemorizedCount / dailyTarget) * 100) : 0
  );
  const isTargetAchieved = todayMemorizedCount >= dailyTarget && dailyTarget > 0;

  // Trigger celebration confetti
  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6'],
      });
    } catch (e) {}
  };

  // Filtered items for the list
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Filter by type
      if (filterType === 'memorized' && !item.isMemorized) return false;
      if (filterType === 'learning' && !item.isLearning) return false;
      if (filterType === 'favorite' && !item.isFavorite) return false;

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesSurah = item.surahName?.toLowerCase().includes(q);
        const matchesAyahNum = String(item.numberInSurah) === q;
        const matchesPage = `halaman ${item.page}`.includes(q) || String(item.page) === q;
        return matchesSurah || matchesAyahNum || matchesPage;
      }

      return true;
    });
  }, [items, filterType, searchQuery]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-slate-100 flex flex-col max-h-[92vh]"
          >
            {/* Header */}
            <div
              className={`p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r ${themeConfig.accentGradient} text-white flex items-center justify-between`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base sm:text-lg leading-tight">
                    Dashboard Hafalan & Target
                  </h3>
                  <p className="text-xs text-white/85">
                    Target harian, capaian hafalan, dan penanda ayat
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Container */}
            <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
              {/* ========================================================= */}
              {/* SECTION: TARGET HAFALAN HARIAN (DAILY GOAL & PROGRESS)   */}
              {/* ========================================================= */}
              <div className="p-4 sm:p-5 bg-gradient-to-br from-amber-50/70 via-rose-50/40 to-white">
                <div className="bg-white/95 rounded-2xl border border-amber-200/90 shadow-sm p-4 sm:p-5 space-y-4">
                  {/* Title & Date */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
                        <Target className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                          <span>Target Hafalan Harian</span>
                          {isTargetAchieved && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                              Tercapai 🎉
                            </span>
                          )}
                        </h4>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{todayDisplayDate}</span>
                        </p>
                      </div>
                    </div>

                    {/* Target Stepper */}
                    <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-50 p-1 rounded-2xl border border-slate-200/80">
                      <span className="text-xs font-semibold text-slate-600 px-2">Target:</span>
                      <button
                        type="button"
                        onClick={() => onChangeDailyTarget(Math.max(1, dailyTarget - 1))}
                        className="w-7 h-7 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-sm shadow-2xs active:scale-95 transition-all"
                        title="Kurangi target"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <div className="w-10 text-center font-display font-bold text-sm text-slate-900">
                        {dailyTarget}
                      </div>

                      <button
                        type="button"
                        onClick={() => onChangeDailyTarget(Math.min(50, dailyTarget + 1))}
                        className="w-7 h-7 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-sm shadow-2xs active:scale-95 transition-all"
                        title="Tambah target"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-medium text-slate-500 pr-1.5">Ayat</span>
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-[11px] text-slate-400 font-medium mr-1">Pilih cepat:</span>
                    {[3, 5, 7, 10, 15].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => onChangeDailyTarget(preset)}
                        className={`px-2.5 py-1 rounded-xl font-medium transition-all ${
                          dailyTarget === preset
                            ? 'bg-amber-500 text-white font-bold shadow-xs scale-105'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {preset} Ayat
                      </button>
                    ))}
                  </div>

                  {/* Progress Bar & Counter */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">
                        Progres Hari Ini:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-display font-bold text-slate-900">
                          {todayMemorizedCount} / {dailyTarget} Ayat
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                            isTargetAchieved
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {progressPercent}%
                        </span>
                      </div>
                    </div>

                    {/* Visual Progress Track */}
                    <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/80">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className={`h-full rounded-full transition-all ${
                          isTargetAchieved
                            ? 'bg-gradient-to-r from-emerald-400 to-teal-500 shadow-sm shadow-emerald-200'
                            : 'bg-gradient-to-r from-amber-400 via-rose-400 to-pink-500 shadow-sm shadow-amber-200'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Motivational Feedback & Celebration */}
                  <div
                    className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs ${
                      isTargetAchieved
                        ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                        : todayMemorizedCount > 0
                        ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isTargetAchieved ? (
                        <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Flame className="w-4 h-4 text-amber-500 shrink-0" />
                      )}
                      <p className="font-medium leading-relaxed">
                        {isTargetAchieved
                          ? `Alhamdulillah! Target ${dailyTarget} ayat hari ini tercapai! Semoga berkah dan mutqin 🤲`
                          : todayMemorizedCount > 0
                          ? `Bagus sekali! Kurang ${dailyTarget - todayMemorizedCount} ayat lagi menuju target harianmu. Semangat! 💪`
                          : `Belum ada ayat yang dihafal hari ini. Bismillah, mulai 1 ayat pertamamu sekarang! 🌸`}
                      </p>
                    </div>

                    {isTargetAchieved && (
                      <button
                        type="button"
                        onClick={triggerCelebration}
                        className="self-start sm:self-auto px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-all"
                      >
                        <PartyPopper className="w-3.5 h-3.5" />
                        <span>Rayakan!</span>
                      </button>
                    )}
                  </div>

                  {/* List of Ayahs memorized today */}
                  {todayMemorizedItems.length > 0 && (
                    <div className="pt-1">
                      <div className="text-[11px] font-semibold text-slate-500 mb-1.5">
                        Ayat yang dihafal hari ini ({todayMemorizedItems.length}):
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {todayMemorizedItems.map((ayahItem) => (
                          <button
                            key={ayahItem.ayahNumber}
                            type="button"
                            onClick={() => {
                              onNavigateToAyah(ayahItem.page, ayahItem.ayahNumber, 'flashcard');
                              onClose();
                            }}
                            className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-all flex items-center gap-1"
                            title="Buka ayat ini di Flashcard"
                          >
                            <span>
                              {ayahItem.surahName || `Surah ${ayahItem.surahNumber}`} : {ayahItem.numberInSurah}
                            </span>
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ========================================================= */}
              {/* SECTION: SUMMARY STATS COUNTERS                           */}
              {/* ========================================================= */}
              <div className="p-4 sm:p-5 bg-slate-50 grid grid-cols-3 gap-2 sm:gap-3">
                {/* Sudah Hafal */}
                <div
                  onClick={() => setFilterType('memorized')}
                  className={`p-3 rounded-2xl border text-center cursor-pointer transition-all ${
                    filterType === 'memorized'
                      ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-200'
                      : 'bg-white border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 text-emerald-600 mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-semibold">Sudah Hafal</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-display font-bold text-slate-900">
                    {totalMemorized}
                  </div>
                  <span className="text-[10px] text-slate-500">Total Lancar</span>
                </div>

                {/* Sedang Dihafal */}
                <div
                  onClick={() => setFilterType('learning')}
                  className={`p-3 rounded-2xl border text-center cursor-pointer transition-all ${
                    filterType === 'learning'
                      ? 'bg-sky-50 border-sky-300 ring-2 ring-sky-200'
                      : 'bg-white border-slate-200 hover:border-sky-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 text-sky-600 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-semibold">Sedang Dihafal</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-display font-bold text-slate-900">
                    {totalLearning}
                  </div>
                  <span className="text-[10px] text-slate-500">Dalam Proses</span>
                </div>

                {/* Favorit */}
                <div
                  onClick={() => setFilterType('favorite')}
                  className={`p-3 rounded-2xl border text-center cursor-pointer transition-all ${
                    filterType === 'favorite'
                      ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-200'
                      : 'bg-white border-slate-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 text-amber-600 mb-1">
                    <Bookmark className="w-4 h-4 fill-amber-500/20" />
                    <span className="text-xs font-semibold">Favorit</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-display font-bold text-slate-900">
                    {totalFavorite}
                  </div>
                  <span className="text-[10px] text-slate-500">Bookmark</span>
                </div>
              </div>

              {/* ========================================================= */}
              {/* SECTION: FILTER & SEARCH BAR                              */}
              {/* ========================================================= */}
              <div className="p-3 sm:p-4 bg-white flex flex-wrap items-center justify-between gap-2.5">
                {/* Filter Tabs */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      filterType === 'all'
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Semua ({items.length})
                  </button>
                  <button
                    onClick={() => setFilterType('memorized')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      filterType === 'memorized'
                        ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ✅ Hafal ({totalMemorized})
                  </button>
                  <button
                    onClick={() => setFilterType('learning')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      filterType === 'learning'
                        ? 'bg-white text-sky-700 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ⏳ Proses ({totalLearning})
                  </button>
                  <button
                    onClick={() => setFilterType('favorite')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      filterType === 'favorite'
                        ? 'bg-white text-amber-700 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📌 Favorit ({totalFavorite})
                  </button>
                </div>

                {/* Search Box */}
                <div className="relative flex-1 min-w-[150px] max-w-xs">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari surah / nomor ayat..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-300"
                  />
                </div>
              </div>

              {/* ========================================================= */}
              {/* SECTION: LIST OF MARKED AYAHS                             */}
              {/* ========================================================= */}
              <div className="p-3 sm:p-4 space-y-2.5 divide-y divide-slate-100">
                {filteredItems.length === 0 ? (
                  <div className="py-10 text-center text-slate-500 space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">
                      {items.length === 0
                        ? 'Belum ada ayat yang ditandai'
                        : 'Tidak ada ayat yang cocok dengan filter'}
                    </p>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      Gunakan tombol 📌 Favorit, ⏳ Sedang Dihafal, atau ✅ Sudah Dihafal di setiap kartu ayat untuk mencatat progres hafalan Anda.
                    </p>
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <div
                      key={item.ayahNumber}
                      className="pt-2.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                    >
                      {/* Item Info */}
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-1.5">
                          <span className="font-semibold text-slate-800 text-sm">
                            {item.surahName || `Surah ${item.surahNumber}`} : {item.numberInSurah}
                          </span>
                          <span className="text-[11px] text-slate-400">·</span>
                          <span className="text-[11px] text-slate-500">
                            Halaman {item.page} (Juz {item.juz})
                          </span>

                          {/* Status Badges */}
                          {item.isMemorized && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                              <CheckCircle2 className="w-3 h-3" /> Sudah Hafal
                            </span>
                          )}
                          {item.isLearning && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-100 text-sky-700">
                              <Clock className="w-3 h-3" /> Sedang Dihafal
                            </span>
                          )}
                          {item.isFavorite && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700">
                              <Bookmark className="w-3 h-3 fill-amber-500" /> Favorit
                            </span>
                          )}
                        </div>

                        {item.arabicText && (
                          <p
                            className="font-arabic text-sm text-slate-700 text-right truncate"
                            dir="rtl"
                          >
                            {item.arabicText}
                          </p>
                        )}
                      </div>

                      {/* Quick Jump Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            onNavigateToAyah(item.page, item.ayahNumber, 'flashcard');
                            onClose();
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-semibold border border-pink-200 transition-colors flex items-center gap-1"
                          title="Buka ayat di mode Flashcard"
                        >
                          <span>Flashcard</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => {
                            onNavigateToAyah(item.page, item.ayahNumber, 'mushaf');
                            onClose();
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-colors flex items-center gap-1"
                          title="Buka ayat di mode Mushaf"
                        >
                          <span>Mushaf</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => onRemoveStatus(item.ayahNumber)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Hapus status ayat ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              {items.length > 0 ? (
                <button
                  onClick={() => {
                    if (window.confirm('Yakin ingin mereset semua tanda hafalan dan favorit?')) {
                      onClearAllStatuses();
                    }
                  }}
                  className="text-xs text-rose-600 hover:text-rose-700 hover:underline"
                >
                  Reset Semua Data
                </button>
              ) : (
                <span className="text-xs text-slate-400">
                  Data tersimpan otomatis di perangkat Anda
                </span>
              )}

              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
