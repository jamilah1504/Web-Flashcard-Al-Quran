import { AppTheme } from '../types';

export interface ThemeConfig {
  id: AppTheme;
  name: string;
  subtitle: string;
  emoji: string;
  bodyBgClass: string;
  accentGradient: string;
  primaryButton: string;
  activeTabClass: string;
  cardFrontBg: string;
  cardBackBg: string;
  cardBorder: string;
  cardShadow: string;
  badgeBg: string;
  badgeText: string;
  mushafBorder: string;
  mushafHeaderBg: string;
  progressGradient: string;
  ringClass: string;
  ambientGlow: string;
  patternType: 'blossom' | 'ocean' | 'sage';
}

export const THEMES: Record<AppTheme, ThemeConfig> = {
  blossom: {
    id: 'blossom',
    name: 'Warm Blossom',
    subtitle: 'Mawar & Peach Lembut',
    emoji: '🌸',
    bodyBgClass: 'bg-rose-50/40 text-slate-800 selection:bg-pink-200 selection:text-pink-900',
    accentGradient: 'from-rose-500 via-pink-500 to-rose-600',
    primaryButton: 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-md shadow-pink-300/40',
    activeTabClass: 'bg-white text-pink-700 shadow-sm font-semibold',
    cardFrontBg: 'bg-gradient-to-br from-white via-rose-50/70 to-pink-50/70',
    cardBackBg: 'bg-gradient-to-br from-white via-pink-50/70 to-purple-50/60',
    cardBorder: 'border-pink-200/90 hover:border-pink-300',
    cardShadow: 'shadow-xl shadow-pink-200/35 hover:shadow-2xl hover:shadow-pink-300/45',
    badgeBg: 'bg-pink-100/90 text-pink-700 border-pink-200/90',
    badgeText: 'text-pink-700',
    mushafBorder: 'border-pink-100',
    mushafHeaderBg: 'from-rose-50 via-pink-50/80 to-rose-100/50',
    progressGradient: 'from-pink-400 via-rose-500 to-pink-600',
    ringClass: 'ring-pink-300',
    ambientGlow: 'bg-pink-300/20',
    patternType: 'blossom',
  },
  ocean: {
    id: 'ocean',
    name: 'Biru Soft',
    subtitle: 'Nuansa Air & Ocean Breeze',
    emoji: '🌊',
    bodyBgClass: 'bg-sky-50/50 text-slate-800 selection:bg-sky-200 selection:text-sky-900',
    accentGradient: 'from-sky-500 via-blue-500 to-indigo-600',
    primaryButton: 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-md shadow-sky-300/40',
    activeTabClass: 'bg-white text-sky-800 shadow-sm font-semibold',
    cardFrontBg: 'bg-gradient-to-br from-white via-sky-50/70 to-blue-50/60',
    cardBackBg: 'bg-gradient-to-br from-white via-blue-50/70 to-indigo-50/60',
    cardBorder: 'border-sky-200/90 hover:border-sky-300',
    cardShadow: 'shadow-xl shadow-sky-200/35 hover:shadow-2xl hover:shadow-sky-300/45',
    badgeBg: 'bg-sky-100/90 text-sky-800 border-sky-200/90',
    badgeText: 'text-sky-800',
    mushafBorder: 'border-sky-100',
    mushafHeaderBg: 'from-sky-50 via-blue-50/80 to-sky-100/50',
    progressGradient: 'from-sky-400 via-blue-500 to-indigo-600',
    ringClass: 'ring-sky-300',
    ambientGlow: 'bg-sky-300/20',
    patternType: 'ocean',
  },
  sage: {
    id: 'sage',
    name: 'Hijau Soft',
    subtitle: 'Nuansa Daun & Forest Leaf',
    emoji: '🌿',
    bodyBgClass: 'bg-emerald-50/40 text-slate-800 selection:bg-emerald-200 selection:text-emerald-900',
    accentGradient: 'from-emerald-600 via-teal-600 to-emerald-700',
    primaryButton: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-300/40',
    activeTabClass: 'bg-white text-emerald-800 shadow-sm font-semibold',
    cardFrontBg: 'bg-gradient-to-br from-white via-emerald-50/70 to-teal-50/60',
    cardBackBg: 'bg-gradient-to-br from-white via-emerald-50/70 to-sage-50/60',
    cardBorder: 'border-emerald-200/90 hover:border-emerald-300',
    cardShadow: 'shadow-xl shadow-emerald-200/35 hover:shadow-2xl hover:shadow-emerald-300/45',
    badgeBg: 'bg-emerald-100/90 text-emerald-800 border-emerald-200/90',
    badgeText: 'text-emerald-800',
    mushafBorder: 'border-emerald-100',
    mushafHeaderBg: 'from-emerald-50 via-teal-50/80 to-emerald-100/50',
    progressGradient: 'from-emerald-400 via-teal-500 to-emerald-600',
    ringClass: 'ring-emerald-300',
    ambientGlow: 'bg-emerald-300/20',
    patternType: 'sage',
  },
};

export const THEME_LIST: ThemeConfig[] = [
  THEMES.blossom,
  THEMES.ocean,
  THEMES.sage,
];
