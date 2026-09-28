import React, { useState, useMemo } from 'react';
import {
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
  FileSpreadsheet,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AyahStatusMap, AyahUserStatus, AyahStatusType, ActiveView } from '../types';
import { ThemeConfig } from '../utils/themeHelper';

interface ProgressDashboardViewProps {
  statusMap: AyahStatusMap;
  themeConfig: ThemeConfig;
  onNavigateToAyah: (page: number, ayahNumber: number, view: ActiveView) => void;
  onRemoveStatus: (ayahNumber: number, type?: AyahStatusType) => void;
  onClearAllStatuses: () => void;
  dailyTarget: number;
  onChangeDailyTarget: (target: number) => void;
  onOpenGoogleSheetsModal: () => void;
  isSheetsConfigured: boolean;
}

export const ProgressDashboardView: React.FC<ProgressDashboardViewProps> = ({
  statusMap,
  themeConfig,
  onNavigateToAyah,
  onRemoveStatus,
  onClearAllStatuses,
  dailyTarget,
  onChangeDailyTarget,
  onOpenGoogleSheetsModal,
  isSheetsConfigured,
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

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filterType === 'memorized' && !item.isMemorized) return false;
      if (filterType === 'learning' && !item.isLearning) return false;
      if (filterType === 'favorite' && !item.isFavorite) return false;

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
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${themeConfig.accentGradient} flex items-center justify-center text-white shadow-md shadow-pink-200/50`}
          >
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold font-display text-slate-800 tracking-tight">
                Dashboard Progress & Favorit
              </h2>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Rekap Hafalan
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Pantau target hafalan harian, ayat yang sedang dihafal, dan ayat favorit tersimpan.
            </p>
          </div>
        </div>

        {/* Sync with Google Sheets button */}
        <button
          onClick={onOpenGoogleSheetsModal}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border text-xs font-semibold transition-all shadow-xs cursor-pointer ${
            isSheetsConfigured
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
          }`}
          title="Sinkronkan dengan Google Sheets"
        >
          <FileSpreadsheet className={`w-4 h-4 ${isSheetsConfigured ? 'text-emerald-600' : 'text-slate-500'}`} />
          <span>{isSheetsConfigured ? 'Google Sheets Aktif' : 'Hubungkan Google Sheets'}</span>
        </button>
      </div>

      {/* Daily Target Section */}
      <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-white via-rose-50/30 to-pink-50/20 border border-slate-200/90 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-pink-700 bg-pink-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Target className="w-3.5 h-3.5" />
                Target Hafalan Harian
              </span>
              <span className="text-xs text-slate-400">· {todayDisplayDate}</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 font-display">
              {isTargetAchieved ? (
                <span className="text-emerald-600 flex items-center gap-1.5">
                  <PartyPopper className="w-5 h-5 text-emerald-500" />
                  Maa syaa Allah, Target Hari Ini Tercapai!
                </span>
              ) : (
                <span>
                  Hari ini telah menghafal{' '}
                  <strong className="text-pink-600 font-bold">{todayMemorizedCount}</strong> dari{' '}
                  <strong className="text-slate-900">{dailyTarget}</strong> ayat
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500">
              Konsistensi sedikit demi sedikit jauh lebih dicintai Allah daripada banyak namun terputus.
            </p>
          </div>

          {/* Target Stepper */}
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs self-stretch sm:self-auto justify-between sm:justify-start">
            <span className="text-xs font-semibold text-slate-500 px-2">Ubah Target:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onChangeDailyTarget(Math.max(1, dailyTarget - 1))}
                className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                title="Kurangi target"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center text-sm font-bold text-slate-800">{dailyTarget}</span>
              <button
                type="button"
                onClick={() => onChangeDailyTarget(dailyTarget + 1)}
                className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                title="Tambah target"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between items-center text-xs text-slate-500 font-semibold">
            <span>Kemajuan Hari Ini</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${themeConfig.accentGradient}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Sudah Dihafal */}
        <button
          type="button"
          onClick={() => setFilterType('memorized')}
          className={`p-4 sm:p-5 rounded-3xl border text-left transition-all bg-white/95 backdrop-blur-xs shadow-xs hover:shadow-md ${
            filterType === 'memorized' ? 'ring-2 ring-emerald-400 border-emerald-300' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Sudah Dihafal (Mutqin)
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-display text-slate-800">{totalMemorized}</span>
            <span className="text-xs text-slate-400">ayat</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Ayat yang telah dihafal dengan lancar</p>
        </button>

        {/* Sedang Dihafal */}
        <button
          type="button"
          onClick={() => setFilterType('learning')}
          className={`p-4 sm:p-5 rounded-3xl border text-left transition-all bg-white/95 backdrop-blur-xs shadow-xs hover:shadow-md ${
            filterType === 'learning' ? 'ring-2 ring-amber-400 border-amber-300' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Sedang Dihafal (Proses)
            </span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-display text-slate-800">{totalLearning}</span>
            <span className="text-xs text-slate-400">ayat</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Dalam proses repetisi & pemantapan</p>
        </button>

        {/* Favorit / Bookmark */}
        <button
          type="button"
          onClick={() => setFilterType('favorite')}
          className={`p-4 sm:p-5 rounded-3xl border text-left transition-all bg-white/95 backdrop-blur-xs shadow-xs hover:shadow-md ${
            filterType === 'favorite' ? 'ring-2 ring-pink-400 border-pink-300' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-pink-800 bg-pink-50 px-2.5 py-1 rounded-full border border-pink-200">
              Ayat Favorit / Ditandai
            </span>
            <Bookmark className="w-5 h-5 text-pink-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-display text-slate-800">{totalFavorite}</span>
            <span className="text-xs text-slate-400">ayat</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Ayat penyejuk hati & renungan</p>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Tab Filters */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'all'
                ? `${themeConfig.badgeBg} font-bold shadow-xs`
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Semua ({items.length})
          </button>
          <button
            onClick={() => setFilterType('memorized')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'memorized'
                ? 'bg-emerald-100 text-emerald-800 font-bold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Sudah Dihafal ({totalMemorized})
          </button>
          <button
            onClick={() => setFilterType('learning')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'learning'
                ? 'bg-amber-100 text-amber-800 font-bold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Sedang Dihafal ({totalLearning})
          </button>
          <button
            onClick={() => setFilterType('favorite')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'favorite'
                ? 'bg-pink-100 text-pink-800 font-bold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Favorit ({totalFavorite})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari surat, ayat, hal..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-pink-300"
          />
        </div>
      </div>

      {/* Ayat Items List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl bg-white/70 backdrop-blur-xs border border-dashed border-slate-200 text-slate-400 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-pink-50 flex items-center justify-center text-pink-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-700 text-sm">Belum ada ayat pada kategori ini</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Tandai ayat di kartu Flashcard atau Mushaf dengan tombol 📌 Favorit, ⏳ Sedang Dihafal, atau ✅ Sudah Dihafal.
              </p>
            </div>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.ayahNumber}
              className="p-4 sm:p-5 rounded-3xl bg-white/95 backdrop-blur-xs border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-3"
            >
              {/* Header Row: Badges & Surah info */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-sm">
                    {item.surahName || `Surat ke-${item.surahNumber}`} : Ayat {item.numberInSurah}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    (Hal. {item.page}, Juz {item.juz})
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.isMemorized && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Sudah Dihafal
                    </span>
                  )}
                  {item.isLearning && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Sedang Dihafal
                    </span>
                  )}
                  {item.isFavorite && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-pink-100 text-pink-800 flex items-center gap-1">
                      <Bookmark className="w-3 h-3 fill-pink-600" /> Favorit
                    </span>
                  )}
                </div>
              </div>

              {/* Arabic Text */}
              {item.arabicText && (
                <p className="font-arabic text-xl sm:text-2xl text-slate-800 text-right leading-loose py-1">
                  {item.arabicText}
                </p>
              )}

              {/* Translation */}
              {item.translation && (
                <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                  "{item.translation}"
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigateToAyah(item.page, item.ayahNumber, 'flashcard')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 font-semibold transition-colors"
                  >
                    <span>Latihan di Flashcard</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onNavigateToAyah(item.page, item.ayahNumber, 'mushaf')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
                  >
                    <span>Buka di Mushaf</span>
                    <BookOpen className="w-3 h-3" />
                  </button>
                </div>

                <button
                  onClick={() => onRemoveStatus(item.ayahNumber)}
                  className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Hapus dari daftar status"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
