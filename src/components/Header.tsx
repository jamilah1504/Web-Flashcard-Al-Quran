import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Volume2,
  VolumeX,
  Layers,
  ChevronDown,
  Award,
  Palette,
  Check,
  HelpCircle,
  Target,
} from 'lucide-react';
import { JuzInfo, HintLength, ActiveView, AppTheme } from '../types';
import { ThemeConfig, THEME_LIST } from '../utils/themeHelper';

interface HeaderProps {
  activeView: ActiveView;
  onChangeView: (view: ActiveView) => void;
  currentTheme: AppTheme;
  themeConfig: ThemeConfig;
  onChangeTheme: (theme: AppTheme) => void;
  currentPage: number;
  currentJuz: JuzInfo;
  currentSurahName?: string;
  totalAyahs: number;
  memorizedCount: number;
  learningCount: number;
  favoriteCount: number;
  onOpenSelector: () => void;
  onOpenGrid: () => void;
  onOpenDashboard: () => void;
  onOpenTajweedModal: () => void;
  hintMode: HintLength;
  onChangeHintMode: (mode: HintLength) => void;
  isAudioMuted: boolean;
  onToggleAudioMute: () => void;
  isPlayingAudio?: boolean;
  dailyTarget?: number;
  todayMemorizedCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onChangeView,
  currentTheme,
  themeConfig,
  onChangeTheme,
  currentPage,
  currentJuz,
  currentSurahName,
  totalAyahs,
  memorizedCount,
  learningCount,
  favoriteCount,
  onOpenSelector,
  onOpenGrid,
  onOpenDashboard,
  onOpenTajweedModal,
  hintMode,
  onChangeHintMode,
  isAudioMuted,
  onToggleAudioMute,
  isPlayingAudio = false,
  dailyTarget = 5,
  todayMemorizedCount = 0,
}) => {
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const percentMemorized = totalAyahs > 0 ? Math.round((memorizedCount / totalAyahs) * 100) : 0;

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-colors">
      {/* Main Top Navigation Row */}
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex flex-col md:flex-row items-center justify-between gap-2.5">
        {/* Left: Brand + View Switcher */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr ${themeConfig.accentGradient} flex items-center justify-center text-white shadow-md shadow-slate-300/40`}
            >
              <Sparkles className="w-5 h-5 fill-white/80" />
            </div>
            <div>
              <h1 className="font-display font-bold text-slate-800 text-base sm:text-lg tracking-tight leading-none">
                HafalanKu
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                Al-Qur'an Hafalan & Belajar
              </p>
            </div>
          </div>

          {/* View Mode Switcher (Segmented Buttons) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
            <button
              onClick={() => onChangeView('flashcard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeView === 'flashcard'
                  ? `${themeConfig.activeTabClass} shadow-xs`
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span>Flashcard</span>
            </button>
            <button
              onClick={() => onChangeView('mushaf')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeView === 'mushaf'
                  ? `${themeConfig.activeTabClass} shadow-xs`
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span>Mushaf</span>
            </button>
          </div>
        </div>

        {/* Right: Actions Cluster (Selector, Dashboard, Theme, Audio) */}
        <div className="flex items-center justify-between md:justify-end gap-1.5 sm:gap-2 w-full md:w-auto">
          {/* Juz & Page Selector button */}
          <button
            onClick={onOpenSelector}
            id="page-selector-btn"
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold transition-all shadow-xs"
            title="Klik untuk memilih Surat, Ayat, Juz atau Halaman"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span className="truncate max-w-[100px] sm:max-w-none">
              {currentSurahName || `Hal. ${currentPage}`}
            </span>
            <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-300" />
            <span className="hidden sm:inline-block text-[11px] text-slate-500">
              Hal {currentPage}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>

          {/* Progress Dashboard Button */}
          <button
            onClick={onOpenDashboard}
            id="open-dashboard-btn"
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl border text-xs font-semibold transition-all shadow-xs ${
              memorizedCount > 0
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title="Buka Dashboard Rekap Hafalan & Bookmark"
          >
            <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="hidden xs:inline">Progres</span>
            <span className="px-1.5 py-0.5 rounded-lg bg-emerald-200/80 text-emerald-900 text-[10px] sm:text-[11px] font-bold">
              {memorizedCount}
            </span>
          </button>

          {/* Daily Target Button */}
          <button
            onClick={onOpenDashboard}
            id="open-daily-target-btn"
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-2xl border text-xs font-semibold transition-all shadow-xs ${
              todayMemorizedCount >= dailyTarget
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-amber-50/80 text-amber-900 border-amber-200/90 hover:bg-amber-100'
            }`}
            title={`Target Hari Ini: ${todayMemorizedCount} dari ${dailyTarget} ayat`}
          >
            <Target className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="hidden sm:inline">Target:</span>
            <span className="font-bold text-[11px] text-amber-950">
              {todayMemorizedCount}/{dailyTarget}
            </span>
          </button>

          {/* Tajweed Help Guide Button */}
          <button
            onClick={onOpenTajweedModal}
            className="p-2 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors shrink-0"
            title="Panduan Warna Tajwid untuk Pemula"
          >
            <HelpCircle className="w-4 h-4 text-amber-600" />
          </button>

          {/* Theme Selector Popover */}
          <div className="relative">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="flex items-center gap-1 p-2 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shrink-0"
              title="Ganti Tema Warna Aplikasi"
            >
              <Palette className="w-4 h-4 text-slate-600" />
              <span className="text-xs hidden lg:inline">{themeConfig.emoji}</span>
            </button>

            {showThemeMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowThemeMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 p-2 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 animate-fadeIn space-y-1">
                  <div className="px-2 py-1 text-[11px] font-bold uppercase text-slate-400">
                    Pilih Tema Warna
                  </div>
                  {THEME_LIST.map((theme) => {
                    const isSelected = currentTheme === theme.id;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => {
                          onChangeTheme(theme.id);
                          setShowThemeMenu(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-slate-100 text-slate-900 font-bold'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{theme.emoji}</span>
                          <div>
                            <div>{theme.name}</div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              {theme.subtitle}
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Audio Mute/Unmute Toggle */}
          <button
            onClick={onToggleAudioMute}
            id="audio-mute-toggle-btn"
            className={`flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-2xl border transition-colors shrink-0 text-xs font-semibold ${
              isAudioMuted
                ? 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                : isPlayingAudio
                ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}
            title={
              isAudioMuted
                ? 'Audio dinonaktifkan (Klik untuk mengaktifkan)'
                : isPlayingAudio
                ? 'Audio sedang berputar (Klik untuk menonaktifkan)'
                : 'Audio aktif (Klik untuk menonaktifkan)'
            }
          >
            {isAudioMuted ? (
              <VolumeX className="w-4 h-4 text-slate-500 shrink-0" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span className="hidden xl:inline text-[11px]">
              {isAudioMuted ? 'Mute' : 'Audio'}
            </span>
          </button>
        </div>
      </div>

      {/* Mini Progress Strip */}
      <div className="w-full bg-slate-100 h-1 relative overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${themeConfig.progressGradient} transition-all duration-500 ease-out`}
          style={{ width: `${percentMemorized}%` }}
        />
      </div>
    </header>
  );
};
