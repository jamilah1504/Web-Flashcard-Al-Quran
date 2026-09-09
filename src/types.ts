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
  text: string; // Full Arabic text
  firstPhrase: string; // Initial hint / opener phrase
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

export interface MemorizationState {
  [ayahNumber: number]: {
    memorized: boolean;
    reviewCount: number;
    lastPracticed?: string;
  };
}
