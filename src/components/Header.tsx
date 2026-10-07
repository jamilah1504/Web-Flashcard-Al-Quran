import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Layers,
  ChevronDown,
  Award,
  Palette,
  Check,
  HelpCircle,
  Calendar,
  FileSpreadsheet,
  Target,
  RefreshCw,
  Share2,
  Smartphone,
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
  onOpenTajweedModal: () => void;
  onOpenGoogleSheets: () => void;
  isSheetsConfigured: boolean;
  onOpenInstallGuide?: () => void;
  onOpenShareModal?: () => void;
  hintMode: HintLength;
  onChangeHintMode: (mode: HintLength) => void;
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
  onOpenTajweedModal,
  onOpenGoogleSheets,
  isSheetsConfigured,
  onOpenInstallGuide,
  onOpenShareModal,
  dailyTarget = 5,
  todayMemorizedCount = 0,
}) => {
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-colors">
      {/* Main Flex-Wrap Container with Consistent Spacing & Responsive Scaling */}
      <div className="max-w-6xl mx-auto px-2.5 sm:px-4 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-2 sm:gap-2.5">
        
        {/* 1. Left: Brand Identity with Official App Logo */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <div className="relative group cursor-pointer" onClick={onOpenInstallGuide} title="HafalanKu - Klik untuk info pemasangan di HP">
            <img
              src="/icon.svg"
              alt="Logo HafalanKu"
              className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-2xl shadow-md border border-emerald-600/20 object-cover shrink-0 group-hover:scale-105 transition-transform"
            />
          </div>
          <div className="min-w-0">
            <h1 className="font-display font-bold text-slate-800 text-sm xs:text-base sm:text-lg tracking-tight leading-none flex items-center gap-1.5">
              <span className="truncate">HafalanKu</span>
              <span className="hidden sm:inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-pink-100 text-pink-700 shrink-0">
                Al-Qur'an
              </span>
            </h1>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-tight mt-0.5 hidden xs:block truncate">
              Tracker &amp; Hafalan Ramah Pemula
            </p>
          </div>
        </div>

        {/* 2. Center: Desktop Navigation Tabs (Hidden on mobile, wraps smoothly on tablets) */}
        <nav
          aria-label="Navigasi Utama Desktop"
          className="hidden md:flex flex-wrap items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80 gap-0.5"
        >
          <button
            onClick={() => onChangeView('flashcard')}
            className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
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
            className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeView === 'mushaf'
                ? `${themeConfig.activeTabClass} shadow-xs`
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span>Mushaf</span>
          </button>

          <button
            onClick={() => onChangeView('calendar')}
            className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeView === 'calendar'
                ? `${themeConfig.activeTabClass} shadow-xs`
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>Kalender</span>
          </button>

          <button
            onClick={() => onChangeView('dashboard')}
            className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeView === 'dashboard'
                ? `${themeConfig.activeTabClass} shadow-xs`
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5 shrink-0" />
            <span>Dashboard</span>
            {memorizedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                {memorizedCount}
              </span>
            )}
          </button>
        </nav>

        {/* 3. Right: Action Buttons (Selector, Stats, Sync, Tajweed, Theme Toggle) */}
        {/* Organized in a flex-wrap container with consistent spacing (gap-1.5 sm:gap-2) and responsive scaling */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          
          {/* Action 1: Juz & Page Selector */}
          <button
            onClick={onOpenSelector}
            aria-label="Pilih Surat, Ayat, Juz atau Halaman"
            className="h-8.5 sm:h-9 px-2 xs:px-2.5 sm:px-3 rounded-xl sm:rounded-2xl bg-slate-50 hover:bg-slate-100 active:scale-95 border border-slate-200/90 text-slate-800 text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition-all shadow-2xs cursor-pointer"
            title="Pilih Surat, Ayat, Juz atau Halaman"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span className="truncate max-w-[68px] xs:max-w-[85px] sm:max-w-[110px] text-[11px] sm:text-xs">
              {currentSurahName || `Hal. ${currentPage}`}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>

          {/* Action 2: Stats / Progress Pill Button */}
          <button
            onClick={() => onChangeView('dashboard')}
            aria-label={`Progres Hafalan: ${memorizedCount} ayat selesai. Target hari ini: ${todayMemorizedCount}/${dailyTarget}`}
            className={`h-8.5 sm:h-9 px-2 xs:px-2.5 sm:px-3 rounded-xl sm:rounded-2xl border text-xs font-semibold flex items-center gap-1 sm:gap-1.5 active:scale-95 transition-all shadow-2xs cursor-pointer ${
              activeView === 'dashboard'
                ? 'bg-emerald-100/90 text-emerald-950 border-emerald-300 font-bold'
                : memorizedCount > 0
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100/80'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title="Klik untuk membuka Dashboard Progres & Target"
          >
            <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="hidden xs:inline text-[11px] sm:text-xs">Progres</span>
            <span className="px-1.5 py-0.5 rounded-lg bg-emerald-200/70 text-emerald-900 text-[10px] sm:text-[11px] font-bold">
              {memorizedCount}
            </span>
            {dailyTarget > 0 && (
              <span className="hidden lg:inline text-[10px] text-slate-500 font-medium">
                ({todayMemorizedCount}/{dailyTarget})
              </span>
            )}
          </button>

          {/* Action 3: Sync / Google Sheets Button */}
          <button
            onClick={onOpenGoogleSheets}
            aria-label="Pengaturan Google Sheets API & Status Sinkronisasi"
            className={`h-8.5 sm:h-9 px-2 xs:px-2.5 sm:px-3 rounded-xl sm:rounded-2xl border text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-2xs relative cursor-pointer ${
              isSheetsConfigured
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title={
              isSheetsConfigured
                ? 'Google Sheets Terhubung (Klik untuk sinkronisasi/pengaturan)'
                : 'Penyimpanan Lokal (Klik untuk menghubungkan Google Sheets)'
            }
          >
            <FileSpreadsheet
              className={`w-3.5 h-3.5 shrink-0 ${
                isSheetsConfigured ? 'text-emerald-600' : 'text-slate-500'
              }`}
            />
            <span className="hidden sm:inline text-[11px] sm:text-xs">
              {isSheetsConfigured ? 'Sync' : 'Sheets'}
            </span>
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isSheetsConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
              }`}
            />
          </button>

          {/* Action 4: Tajweed Guide Modal Trigger */}
          <button
            onClick={onOpenTajweedModal}
            aria-label="Panduan Warna Tajwid untuk Pemula"
            className="h-8.5 sm:h-9 w-8.5 sm:w-9 rounded-xl sm:rounded-2xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-600 border border-slate-200 flex items-center justify-center transition-all shadow-2xs cursor-pointer shrink-0"
            title="Panduan Warna Tajwid untuk Pemula"
          >
            <HelpCircle className="w-4 h-4 text-amber-600" />
          </button>

          {/* Action 5: Bagikan (Share Link & Preview Cover) */}
          {onOpenShareModal && (
            <button
              onClick={onOpenShareModal}
              aria-label="Bagikan Tautan Aplikasi & Pratinjau Cover"
              className="h-8.5 sm:h-9 px-2 xs:px-2.5 rounded-xl sm:rounded-2xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-700 border border-slate-200 flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer shrink-0"
              title="Bagikan Tautan & Pratinjau Cover"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline text-[11px] sm:text-xs font-semibold text-slate-700">
                Bagikan
              </span>
            </button>
          )}

          {/* Action 7: Theme Toggle Button & Dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              aria-label="Ganti Tema Warna Aplikasi"
              className="h-8.5 sm:h-9 px-2 xs:px-2.5 rounded-xl sm:rounded-2xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-700 border border-slate-200 flex items-center justify-center gap-1 transition-all shadow-2xs cursor-pointer"
              title="Ganti Tema Warna Aplikasi"
            >
              <Palette className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span className="text-xs">{themeConfig.emoji}</span>
            </button>

            {showThemeMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowThemeMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-64 max-w-[calc(100vw-20px)] p-2.5 bg-white rounded-3xl shadow-2xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 space-y-1.5">
                  <div className="px-2 py-1 text-[11px] font-bold uppercase text-slate-400">
                    Pilih Tema Warna (3 Pilihan)
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
                        className={`w-full flex items-center justify-between p-2 rounded-2xl text-left text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-100 text-slate-900 font-bold border border-slate-200'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{theme.emoji}</span>
                          <div>
                            <div className="font-semibold">{theme.name}</div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              {theme.subtitle}
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      {/* 4. Mobile Sub-Navigation Bar: Organized in a clean 4-tab container with responsive touch scaling */}
      <nav
        aria-label="Navigasi Halaman Mobile"
        className="md:hidden border-t border-slate-200/70 bg-white/95 backdrop-blur-md px-1.5 py-1"
      >
        <div className="grid grid-cols-4 gap-1 max-w-md mx-auto">
          {/* Tab 1: Flashcard */}
          <button
            type="button"
            onClick={() => onChangeView('flashcard')}
            className={`min-h-[44px] flex flex-col items-center justify-center py-1 px-1 rounded-xl text-center transition-all cursor-pointer ${
              activeView === 'flashcard'
                ? `${themeConfig.badgeBg} font-bold shadow-xs`
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <Layers className="w-4 h-4 mb-0.5 shrink-0" />
            <span className="text-[10px] xs:text-[11px] leading-tight">Flashcard</span>
          </button>

          {/* Tab 2: Mushaf */}
          <button
            type="button"
            onClick={() => onChangeView('mushaf')}
            className={`min-h-[44px] flex flex-col items-center justify-center py-1 px-1 rounded-xl text-center transition-all cursor-pointer ${
              activeView === 'mushaf'
                ? `${themeConfig.badgeBg} font-bold shadow-xs`
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <BookOpen className="w-4 h-4 mb-0.5 shrink-0" />
            <span className="text-[10px] xs:text-[11px] leading-tight">Mushaf</span>
          </button>

          {/* Tab 3: Kalender & Jadwal */}
          <button
            type="button"
            onClick={() => onChangeView('calendar')}
            className={`min-h-[44px] flex flex-col items-center justify-center py-1 px-1 rounded-xl text-center transition-all cursor-pointer ${
              activeView === 'calendar'
                ? `${themeConfig.badgeBg} font-bold shadow-xs`
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <Calendar className="w-4 h-4 mb-0.5 shrink-0" />
            <span className="text-[10px] xs:text-[11px] leading-tight">Jadwal</span>
          </button>

          {/* Tab 4: Dashboard Progres */}
          <button
            type="button"
            onClick={() => onChangeView('dashboard')}
            className={`min-h-[44px] flex flex-col items-center justify-center py-1 px-1 rounded-xl text-center transition-all relative cursor-pointer ${
              activeView === 'dashboard'
                ? `${themeConfig.badgeBg} font-bold shadow-xs`
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <div className="relative">
              <Award className="w-4 h-4 mb-0.5 shrink-0" />
              {memorizedCount > 0 && (
                <span className="absolute -top-1 -right-2 px-1 rounded-full bg-emerald-500 text-white text-[8px] font-bold leading-tight">
                  {memorizedCount > 99 ? '99+' : memorizedCount}
                </span>
              )}
            </div>
            <span className="text-[10px] xs:text-[11px] leading-tight">Progres</span>
          </button>
        </div>
      </nav>
    </header>
  );
};
