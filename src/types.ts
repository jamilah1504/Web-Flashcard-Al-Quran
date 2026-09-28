export interface SurahInfo {
  number: number;
  name: string; // Arabic name, e.g. "سُورَةُ النَّبَإِ"
  englishName: string; // e.g. "An-Naba"
  englishNameTranslation: string; // e.g. "The Tidings"
  revelationType: string; // "Meccan" | "Medinan"
  numberOfAyahs: number;
}

export interface Ayah {
  number: number; // Global number (1 - 6236)
  numberInSurah: number; // Verse number in that surah
  text: string; // Full Arabic text (clean uthmani)
  tajweedText?: string; // Arabic text with tajweed markup tags
  latin?: string; // Full Latin transliteration
  firstPhrase: string; // Initial hint / opener phrase (Arabic)
  firstPhraseLatin?: string; // Opener phrase in Latin
  translation: string; // Indonesian translation
  hasBismillahHeader?: boolean; // True if this is the start of a surah requiring Bismillah header
  surah: SurahInfo;
  juz: number;
  page: number;
  audioUrl?: string;
}

export interface JuzInfo {
  juzNumber: number;
  startPage: number;
  endPage: number;
  name: string;
  description: string;
  arabicName: string;
}

export type HintLength = 'short' | 'medium' | 'full';

export type AppTheme = 'blossom' | 'ocean' | 'sage';

export type ActiveView = 'flashcard' | 'mushaf' | 'calendar' | 'dashboard';

export type ScheduleActivityType = 'Setoran' | 'Muroja\'ah' | 'Tartil' | 'Hafalan Baru';
export type ScheduleStatus = 'Belum' | 'Selesai';

export interface ScheduleItem {
  id: string;
  date: string; // YYYY-MM-DD
  activityType: ScheduleActivityType;
  target: string;
  notes?: string;
  status: ScheduleStatus;
  createdAt: string;
  completedAt?: string;
}

export interface GoogleSheetSyncState {
  scriptUrl: string;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  syncError: string | null;
  isConfigured: boolean;
}

export type AyahStatusType = 'favorite' | 'learning' | 'memorized';

export interface AyahUserStatus {
  ayahNumber: number; // Global number
  surahNumber: number;
  surahName: string;
  numberInSurah: number;
  page: number;
  juz: number;
  isFavorite: boolean;
  isLearning: boolean;
  isMemorized: boolean;
  arabicText?: string;
  latinText?: string;
  translation?: string;
  updatedAt: string;
}

export type AyahStatusMap = Record<number, AyahUserStatus>;

export interface MemorizationState {
  [ayahNumber: number]: {
    memorized: boolean;
    reviewCount: number;
    lastPracticed?: string;
  };
}
