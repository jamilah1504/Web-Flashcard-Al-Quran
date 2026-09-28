import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
  Bookmark,
  Layers,
  Heart,
  Filter,
  Check,
  CalendarDays,
  FileSpreadsheet,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ScheduleItem, ScheduleActivityType, ScheduleStatus } from '../types';
import { ThemeConfig } from '../utils/themeHelper';

interface CalendarScheduleViewProps {
  schedules: ScheduleItem[];
  onAddSchedule: (schedule: Omit<ScheduleItem, 'id' | 'createdAt'>) => void;
  onUpdateSchedule: (schedule: ScheduleItem) => void;
  onDeleteSchedule: (id: string) => void;
  themeConfig: ThemeConfig;
  onOpenGoogleSheetsModal: () => void;
  isSheetsConfigured: boolean;
}

const ACTIVITY_CONFIG: Record<
  ScheduleActivityType,
  { label: string; bg: string; text: string; border: string; dot: string; icon: string }
> = {
  Setoran: {
    label: 'Setoran',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
    icon: '🌸',
  },
  "Muroja'ah": {
    label: "Muroja'ah",
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    dot: 'bg-indigo-500',
    icon: '📖',
  },
  Tartil: {
    label: 'Tartil',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    icon: '🌿',
  },
  'Hafalan Baru': {
    label: 'Hafalan Baru',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    icon: '✨',
  },
};

const SUGGESTIONS = [
  'Setoran Surat Al-Baqarah ayat 1-10',
  "Muroja'ah Juz 30 (Surat An-Naba - An-Nas)",
  "Muroja'ah Juz 1",
  'Tartil 1 lembar ba’da Subuh',
  'Setoran Surat Al-Mulk ayat 1-30',
  'Hafalan Baru Surat Ar-Rahman ayat 1-15',
  'Muroja’ah Surat Yasin bersama teman',
];

export const CalendarScheduleView: React.FC<CalendarScheduleViewProps> = ({
  schedules,
  onAddSchedule,
  onUpdateSchedule,
  onDeleteSchedule,
  themeConfig,
  onOpenGoogleSheetsModal,
  isSheetsConfigured,
}) => {
  // Today's Date formatted YYYY-MM-DD
  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  // Selected date on calendar
  const [selectedDate, setSelectedDate] = useState<string>(today);

  // Month navigation
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => new Date());

  // Filters
  const [filterActivity, setFilterActivity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Belum' | 'Selesai'>('all');
  const [dateFilterMode, setDateFilterMode] = useState<'all' | 'today' | 'selectedDate'>('selectedDate');

  // Modal / Form state
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);

  // Form Fields
  const [formDate, setFormDate] = useState<string>(today);
  const [formActivity, setFormActivity] = useState<ScheduleActivityType>('Setoran');
  const [formTarget, setFormTarget] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');
  const [formStatus, setFormStatus] = useState<ScheduleStatus>('Belum');

  // Calculate Calendar Days for currentMonthDate
  const calendarDays = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: Array<{ dayNumber: number; dateStr: string; isCurrentMonth: boolean }> = [];

    // Days from previous month for padding
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const m = month === 0 ? 12 : month;
      const y = month === 0 ? year - 1 : year;
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dayNumber: d, dateStr, isCurrentMonth: false });
    }

    // Days in current month
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ dayNumber: i, dateStr, isCurrentMonth: true });
    }

    // Days from next month to fill grid (multiple of 7)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const m = month === 11 ? 1 : month + 2;
      const y = month === 11 ? year + 1 : year;
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ dayNumber: i, dateStr, isCurrentMonth: false });
    }

    return days;
  }, [currentMonthDate]);

  // Map schedules by date for easy calendar marker lookup
  const schedulesByDate = useMemo(() => {
    const map: Record<string, ScheduleItem[]> = {};
    for (const item of schedules) {
      if (!map[item.date]) {
        map[item.date] = [];
      }
      map[item.date].push(item);
    }
    return map;
  }, [schedules]);

  // Statistics
  const totalCount = schedules.length;
  const completedCount = useMemo(() => schedules.filter((s) => s.status === 'Selesai').length, [schedules]);
  const pendingCount = totalCount - completedCount;
  const todaySchedules = useMemo(() => schedules.filter((s) => s.date === today), [schedules, today]);
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filtered schedules for the list
  const filteredList = useMemo(() => {
    return schedules
      .filter((item) => {
        // Date filter
        if (dateFilterMode === 'today' && item.date !== today) return false;
        if (dateFilterMode === 'selectedDate' && item.date !== selectedDate) return false;

        // Activity filter
        if (filterActivity !== 'all' && item.activityType !== filterActivity) return false;

        // Status filter
        if (filterStatus !== 'all' && item.status !== filterStatus) return false;

        return true;
      })
      .sort((a, b) => (a.date > b.date ? -1 : 1));
  }, [schedules, dateFilterMode, today, selectedDate, filterActivity, filterStatus]);

  // Handle open add modal
  const handleOpenAdd = (defaultDate?: string) => {
    setEditingItem(null);
    setFormDate(defaultDate || selectedDate || today);
    setFormActivity('Setoran');
    setFormTarget('');
    setFormNotes('');
    setFormStatus('Belum');
    setShowAddForm(true);
  };

  // Handle open edit modal
  const handleOpenEdit = (item: ScheduleItem) => {
    setEditingItem(item);
    setFormDate(item.date);
    setFormActivity(item.activityType);
    setFormTarget(item.target);
    setFormNotes(item.notes || '');
    setFormStatus(item.status);
    setShowAddForm(true);
  };

  // Submit form
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTarget.trim()) return;

    if (editingItem) {
      onUpdateSchedule({
        ...editingItem,
        date: formDate,
        activityType: formActivity,
        target: formTarget.trim(),
        notes: formNotes.trim(),
        status: formStatus,
        completedAt: formStatus === 'Selesai' && !editingItem.completedAt ? new Date().toISOString() : editingItem.completedAt,
      });
    } else {
      onAddSchedule({
        date: formDate,
        activityType: formActivity,
        target: formTarget.trim(),
        notes: formNotes.trim(),
        status: formStatus,
      });
    }

    if (formStatus === 'Selesai') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {}
    }

    setShowAddForm(false);
    setEditingItem(null);
  };

  // Toggle status directly from list
  const handleToggleStatus = (item: ScheduleItem) => {
    const nextStatus: ScheduleStatus = item.status === 'Belum' ? 'Selesai' : 'Belum';
    onUpdateSchedule({
      ...item,
      status: nextStatus,
      completedAt: nextStatus === 'Selesai' ? new Date().toISOString() : undefined,
    });

    if (nextStatus === 'Selesai') {
      try {
        confetti({
          particleCount: 65,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#f472b6', '#ec4899', '#38bdf8', '#34d399', '#fbbf24'],
        });
      } catch {}
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonthDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };

  const monthYearLabel = currentMonthDate.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${themeConfig.accentGradient} flex items-center justify-center text-white shadow-md shadow-pink-200/50`}
          >
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold font-display text-slate-800 tracking-tight">
                Kalender & Jadwal Hafalan
              </h2>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700">
                Setoran & Muroja'ah
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Atur target harian/mingguan dan pantau kedisiplinan muroja'ah Al-Qur'an Anda.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Google Sheets Status / Config Button */}
          <button
            onClick={onOpenGoogleSheetsModal}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl border text-xs font-semibold transition-all shadow-xs cursor-pointer ${
              isSheetsConfigured
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
            title="Konfigurasi Sinkronisasi Google Sheets"
          >
            <FileSpreadsheet className={`w-3.5 h-3.5 ${isSheetsConfigured ? 'text-emerald-600' : 'text-slate-500'}`} />
            <span className="hidden xs:inline">Google Sheets</span>
            <span
              className={`w-2 h-2 rounded-full ${isSheetsConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}
            />
          </button>

          {/* Add Schedule Button */}
          <button
            onClick={() => handleOpenAdd()}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-2xl font-semibold text-xs transition-all shadow-sm ${themeConfig.primaryButton}`}
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jadwal</span>
          </button>
        </div>
      </div>

      {/* KPI / Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Jadwal */}
        <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-xs border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Jadwal</span>
            <CalendarDays className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold font-display text-slate-800 mt-2">{totalCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Semua agenda</p>
        </div>

        {/* Hari Ini */}
        <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-xs border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Agenda Hari Ini</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold font-display text-amber-600 mt-2">{todaySchedules.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {todaySchedules.filter((s) => s.status === 'Selesai').length} telah selesai
          </p>
        </div>

        {/* Selesai */}
        <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-xs border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Sudah Selesai</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-display text-emerald-600 mt-2">{completedCount}</p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Belum Selesai */}
        <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-xs border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Menunggu</span>
            <Circle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold font-display text-rose-600 mt-2">{pendingCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{completionRate}% tuntas</p>
        </div>
      </div>

      {/* Main Grid: Calendar Widget & Agenda List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Month Calendar (5 cols) */}
        <div className="lg:col-span-5 bg-white/90 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
          {/* Calendar Month Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-slate-800 text-sm sm:text-base capitalize">
              {monthYearLabel}
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                title="Bulan sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setCurrentMonthDate(new Date());
                  setSelectedDate(today);
                }}
                className="px-2 py-1 rounded-xl text-[11px] font-semibold text-pink-700 bg-pink-50 hover:bg-pink-100 transition-colors"
              >
                Hari Ini
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                title="Bulan berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 text-center text-[11px] font-bold text-slate-400 tracking-wider">
            <span>Min</span>
            <span>Sen</span>
            <span>Sel</span>
            <span>Rab</span>
            <span>Kam</span>
            <span>Jum</span>
            <span>Sab</span>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => {
              const daySchedules = schedulesByDate[day.dateStr] || [];
              const isSelected = day.dateStr === selectedDate;
              const isToday = day.dateStr === today;
              const hasItems = daySchedules.length > 0;
              const hasPending = daySchedules.some((s) => s.status === 'Belum');
              const allDone = hasItems && !hasPending;

              return (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedDate(day.dateStr);
                    setDateFilterMode('selectedDate');
                  }}
                  className={`min-h-[50px] p-1 rounded-2xl flex flex-col items-center justify-between transition-all relative ${
                    !day.isCurrentMonth
                      ? 'text-slate-300 opacity-40 hover:opacity-80'
                      : isSelected
                      ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-300/40'
                      : isToday
                      ? 'bg-pink-50 text-pink-800 font-bold border border-pink-300 hover:bg-pink-100'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="text-xs mt-0.5">{day.dayNumber}</span>

                  {/* Indicator Dots */}
                  <div className="flex items-center gap-0.5 mb-1 h-2">
                    {hasItems && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected
                            ? 'bg-white'
                            : allDone
                            ? 'bg-emerald-500'
                            : 'bg-rose-500'
                        }`}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Date Summary & Quick Add */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 font-medium">Tanggal Dipilih:</span>
              <p className="font-semibold text-slate-800">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('id-ID', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
            <button
              onClick={() => handleOpenAdd(selectedDate)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Jadwalkan</span>
            </button>
          </div>
        </div>

        {/* Right Column: Schedule Agenda List & Filtering (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Filter Bar */}
          <div className="p-3 sm:p-4 rounded-3xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-xs space-y-3">
            {/* Date Scope Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
              <button
                onClick={() => setDateFilterMode('selectedDate')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  dateFilterMode === 'selectedDate'
                    ? `${themeConfig.badgeBg} font-bold shadow-xs`
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Tanggal Dipilih ({selectedDate})
              </button>
              <button
                onClick={() => setDateFilterMode('today')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  dateFilterMode === 'today'
                    ? `${themeConfig.badgeBg} font-bold shadow-xs`
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Hari Ini ({todaySchedules.length})
              </button>
              <button
                onClick={() => setDateFilterMode('all')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  dateFilterMode === 'all'
                    ? `${themeConfig.badgeBg} font-bold shadow-xs`
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Semua Jadwal ({totalCount})
              </button>
            </div>

            {/* Sub-Filters: Activity & Status */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
              {/* Activity filter */}
              <div className="flex items-center gap-1">
                <span className="text-slate-400 text-[11px]">Jenis:</span>
                <select
                  value={filterActivity}
                  onChange={(e) => setFilterActivity(e.target.value)}
                  className="px-2 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium focus:outline-hidden"
                >
                  <option value="all">Semua Kegiatan</option>
                  <option value="Setoran">🌸 Setoran</option>
                  <option value="Muroja'ah">📖 Muroja'ah</option>
                  <option value="Tartil">🌿 Tartil</option>
                  <option value="Hafalan Baru">✨ Hafalan Baru</option>
                </select>
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-1">
                <span className="text-slate-400 text-[11px]">Status:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-2 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium focus:outline-hidden"
                >
                  <option value="all">Semua</option>
                  <option value="Belum">⏳ Belum</option>
                  <option value="Selesai">✅ Selesai</option>
                </select>
              </div>
            </div>
          </div>

          {/* Agenda List */}
          <div className="space-y-3">
            {filteredList.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-3xl bg-white/70 backdrop-blur-xs border border-dashed border-slate-200 text-slate-400 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-pink-50 flex items-center justify-center text-pink-400">
                  <CalendarDays className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 text-sm">Belum ada agenda di tanggal/filter ini</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Yuk jadwalkan setoran ayat, muroja'ah juz, atau target tartil harianmu agar hafalan semakin mutqin!
                  </p>
                </div>
                <button
                  onClick={() => handleOpenAdd(selectedDate)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-semibold ${themeConfig.primaryButton}`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Jadwal Baru</span>
                </button>
              </div>
            ) : (
              filteredList.map((item) => {
                const conf = ACTIVITY_CONFIG[item.activityType] || ACTIVITY_CONFIG.Setoran;
                const isDone = item.status === 'Selesai';

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-3xl border transition-all duration-200 bg-white/95 backdrop-blur-xs shadow-xs hover:shadow-md flex items-start gap-3.5 ${
                      isDone
                        ? 'border-emerald-200 bg-emerald-50/20'
                        : 'border-slate-200/90'
                    }`}
                  >
                    {/* Status Checkbox Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item)}
                      className="mt-0.5 shrink-0 transition-transform active:scale-90"
                      title={isDone ? 'Tandai Belum Selesai' : 'Tandai Sudah Selesai'}
                    >
                      {isDone ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-slate-300 hover:border-pink-500 transition-colors bg-white flex items-center justify-center" />
                      )}
                    </button>

                    {/* Content Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {/* Activity Badge */}
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${conf.bg} ${conf.text} ${conf.border}`}
                        >
                          <span>{conf.icon}</span>
                          <span>{conf.label}</span>
                        </span>

                        {/* Date Tag */}
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(item.date + 'T00:00:00').toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </span>

                        {/* Status Label */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isDone ? '✓ Selesai' : '⏳ Belum'}
                        </span>
                      </div>

                      {/* Target / Description */}
                      <p
                        className={`text-sm font-semibold text-slate-800 leading-snug break-words ${
                          isDone ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {item.target}
                      </p>

                      {/* Optional Notes */}
                      {item.notes && (
                        <p className="text-xs text-slate-500 mt-1 bg-slate-50/80 p-2 rounded-xl border border-slate-100">
                          {item.notes}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons: Edit & Delete */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                        title="Edit Jadwal"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus jadwal "${item.target}"?`)) {
                            onDeleteSchedule(item.id);
                          }
                        }}
                        className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Hapus Jadwal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Schedule Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className={`p-4 sm:p-5 bg-gradient-to-r ${themeConfig.accentGradient} text-white flex items-center justify-between`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold font-display text-base sm:text-lg">
                    {editingItem ? 'Edit Jadwal Hafalan' : 'Tambah Jadwal Baru'}
                  </h3>
                  <p className="text-xs text-white/90">
                    Otomatis tersimpan & tersinkronisasi ke Google Sheets
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-1.5 rounded-full bg-white/15 hover:bg-white/30 text-white"
              >
                ✕
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmitForm} className="p-4 sm:p-6 space-y-4">
              {/* Tanggal */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Kegiatan:
                </label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                />
              </div>

              {/* Jenis Kegiatan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Jenis Kegiatan:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Setoran', "Muroja'ah", 'Tartil', 'Hafalan Baru'] as ScheduleActivityType[]).map((act) => {
                    const isSelected = formActivity === act;
                    const conf = ACTIVITY_CONFIG[act];
                    return (
                      <button
                        type="button"
                        key={act}
                        onClick={() => setFormActivity(act)}
                        className={`p-2 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                          isSelected
                            ? `${conf.bg} ${conf.text} border-pink-400 ring-2 ring-pink-300/50`
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-base">{conf.icon}</span>
                        <span>{conf.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target / Deskripsi */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target / Deskripsi Ayat:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Setoran Surat Al-Baqarah ayat 1-10"
                  value={formTarget}
                  onChange={(e) => setFormTarget(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                />

                {/* Suggestions Pills */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-slate-400 py-0.5">Template Cepat:</span>
                  {SUGGESTIONS.slice(0, 4).map((sugg, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setFormTarget(sugg)}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-pink-100 text-slate-600 hover:text-pink-800 transition-colors"
                    >
                      {sugg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Catatan Tambahan (Opsional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Tambahan (Opsional):
                </label>
                <textarea
                  rows={2}
                  placeholder="Misal: Disetor setelah maghrib ke Ustadzah, perhatikan mad jaiz..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-400 resize-none"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Status:
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="Belum"
                      checked={formStatus === 'Belum'}
                      onChange={() => setFormStatus('Belum')}
                      className="accent-pink-600"
                    />
                    <span>⏳ Belum Dikerjakan</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="Selesai"
                      checked={formStatus === 'Selesai'}
                      onChange={() => setFormStatus('Selesai')}
                      className="accent-emerald-600"
                    />
                    <span>✅ Sudah Selesai</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-2xl font-semibold text-xs transition-all shadow-sm ${themeConfig.primaryButton}`}
                >
                  {editingItem ? 'Simpan Perubahan' : 'Tambahkan Jadwal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
