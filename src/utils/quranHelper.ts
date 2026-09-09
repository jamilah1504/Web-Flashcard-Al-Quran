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

