import { HintLength } from '../types';

/**
 * Extracts the first phrase (opener/pancingan) of an Arabic ayah.
 * Keeps Arabic script intact with full harakat.
 */
export function extractFirstPhrase(arabicText: string, mode: HintLength = 'short'): string {
  if (!arabicText) return '';

  // Clean extra white spaces
  const trimmed = arabicText.trim();
  const words = trimmed.split(/\s+/);

  if (words.length <= 2) {
    return trimmed;
  }

  let wordCount = 2;
  if (mode === 'medium') {
    wordCount = Math.min(4, words.length - 1);
  } else if (mode === 'full') {
    wordCount = Math.min(Math.ceil(words.length / 2), words.length);
  }

  return words.slice(0, wordCount).join(' ') + ' ...';
}

/**
 * Extracts opener phrase from Latin transliteration
 */
export function extractFirstPhraseLatin(latinText?: string, mode: HintLength = 'short'): string {
  if (!latinText) return '';

  const words = latinText.trim().split(/\s+/);
  if (words.length <= 2) return latinText;

  let wordCount = 2;
  if (mode === 'medium') {
    wordCount = Math.min(4, words.length - 1);
  } else if (mode === 'full') {
    wordCount = Math.min(Math.ceil(words.length / 2), words.length);
  }

  return words.slice(0, wordCount).join(' ') + '...';
}

/**
 * Generates primary audio URL (verses.quran.com - Mishary Rashid Alafasy)
 * Format: 3-digit surah + 3-digit ayah (e.g. 001001.mp3)
 */
export function getAyahAudioUrl(surahNumber: number, ayahNumber: number): string {
  const sStr = String(surahNumber).padStart(3, '0');
  const aStr = String(ayahNumber).padStart(3, '0');
  return `https://verses.quran.com/Alafasy/mp3/${sStr}${aStr}.mp3`;
}

/**
 * Format Arabic Ayah End Marker Symbol ۝ with eastern Arabic numerals
 */
export function toArabicNumerals(n: number): string {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return n
    .toString()
    .split('')
    .map((d) => arabicDigits[parseInt(d, 10)] || d)
    .join('');
}

/**
 * Generates fallback audio URL (everyayah.com - Mishary Rashid Alafasy)
 */
export function getFallbackAudioUrl(surahNumber: number, ayahNumber: number): string {
  const sStr = String(surahNumber).padStart(3, '0');
  const aStr = String(ayahNumber).padStart(3, '0');
  return `https://everyayah.com/data/Alafasy_128kbps/${sStr}${aStr}.mp3`;
}

/**
 * Basic Latin phonetics generator for Arabic text if API transliteration is missing
 */
export function generateLatinFallback(arabicText: string): string {
  if (!arabicText) return '';

  // Common phrases mapping
  const clean = arabicText.replace(/[^\u0600-\u06FF\s]/g, '').trim();
  if (clean.includes('بسم الله الرحمن الرحيم')) {
    return 'Bismillaahir-rahmaanir-rahiim';
  }
  if (clean.includes('الحمد لله رب العالمين')) {
    return "Al-hamdu lillaahi rabbil-'aalamiin";
  }
  if (clean.includes('الرحمن الرحيم')) {
    return 'Ar-rahmaanir-rahiim';
  }
  if (clean.includes('مالك يوم الدين')) {
    return 'Maaliki yawmid-diin';
  }

  // General transliteration mapping table
  const map: Record<string, string> = {
    'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'aa', 'ى': 'a', 'ء': "'", 'ئ': "'", 'ؤ': "'",
    'ب': 'b', 'ت': 't', 'ث': 'ts', 'ج': 'j', 'ح': 'h', 'خ': 'kh',
    'د': 'd', 'ذ': 'dz', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sy',
    'ص': 'sh', 'ض': 'dh', 'ط': 'th', 'ظ': 'zh', 'ع': "'", 'غ': 'gh',
    'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
    'ه': 'h', 'و': 'w', 'ي': 'y', 'ة': 'h',
    // Harakat
    '\u064E': 'a', // Fatha
    '\u064F': 'u', // Damma
    '\u0650': 'i', // Kasra
    '\u064B': 'an', // Fathatan
    '\u064C': 'un', // Dammatan
    '\u064D': 'in', // Kasratan
    '\u0651': '', // Shaddah
    '\u0652': '', // Sukun
    '\u0670': 'aa', // Dagger alif
  };

  let latin = '';
  for (let i = 0; i < arabicText.length; i++) {
    const char = arabicText[i];
    if (char === ' ') {
      latin += ' ';
    } else if (map[char] !== undefined) {
      latin += map[char];
    }
  }

  // Clean redundant vowels and format nicely
  return latin
    .replace(/aa+/g, 'aa')
    .replace(/ii+/g, 'ii')
    .replace(/uu+/g, 'uu')
    .replace(/\s+/g, ' ')
    .trim();
}
