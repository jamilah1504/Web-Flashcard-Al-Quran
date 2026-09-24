import { Ayah, HintLength } from '../types';
import { SAMPLE_PAGES } from '../data/samplePages';
import {
  extractFirstPhrase,
  extractFirstPhraseLatin,
  getAyahAudioUrl,
  generateLatinFallback,
} from '../utils/quranHelper';

const CACHE_PREFIX = 'hafalanku_live_v5_page_';
const BISMILLAH_REGEX = /^بِسْمِ\s+ٱللَّهِ\s+ٱلرَّحْمَٰنِ\s+ٱلرَّحِيمِ\s*/;
const BISMILLAH_TAJWEED_REGEX = /^بِسْمِ\s+\[h:?\d*\[ٱ\]للَّهِ\s+\[h:?\d*\[ٱ\]\[l\[ل\]رَّحْمَ\[n\[ـٰ\]نِ\s+\[h:?\d*\[ٱ\]\[l\[ل\]رَّح\[p\[ِي\]مِ\s*/;
const BISMILLAH_LATIN_REGEX = /^bismillaahir?\s+rahmaanir?\s+raheem\s*/i;

export async function fetchAyahsForPage(
  pageNumber: number,
  hintMode: HintLength = 'short'
): Promise<{ ayahs: Ayah[]; fromCache: boolean; error?: string }> {
  // 1. Check localStorage cache for instant fast loading & offline support
  try {
    const cachedStr = localStorage.getItem(`${CACHE_PREFIX}${pageNumber}`);
    if (cachedStr) {
      const parsed: Ayah[] = JSON.parse(cachedStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const ayahs = parsed.map((a) => ({
          ...a,
          firstPhrase: extractFirstPhrase(a.text, hintMode),
          firstPhraseLatin: extractFirstPhraseLatin(a.latin, hintMode),
          audioUrl: getAyahAudioUrl(a.surah.number, a.numberInSurah),
        }));
        return { ayahs, fromCache: true };
      }
    }
  } catch (e) {
    console.warn('Gagal membaca cache lokal:', e);
  }

  // 2. Fetch live authentic data from AlQuran Cloud API
  // Using parallel requests for Arabic Uthmani, Indonesian translation, Latin transliteration & Tajweed
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9500);

    const [uthmaniRes, indoRes, latinRes, tajweedRes] = await Promise.allSettled([
      fetch(`https://api.alquran.cloud/v1/page/${pageNumber}/quran-uthmani`, {
        signal: controller.signal,
      }),
      fetch(`https://api.alquran.cloud/v1/page/${pageNumber}/id.indonesian`, {
        signal: controller.signal,
      }),
      fetch(`https://api.alquran.cloud/v1/page/${pageNumber}/en.transliteration`, {
        signal: controller.signal,
      }),
      fetch(`https://api.alquran.cloud/v1/page/${pageNumber}/quran-tajweed`, {
        signal: controller.signal,
      }),
    ]);
    clearTimeout(timeoutId);

    // Primary required: uthmani
    if (uthmaniRes.status !== 'fulfilled' || !uthmaniRes.value.ok) {
      throw new Error('Gagal memuat teks Al-Qur\'an Utsmani');
    }

    const uthmaniJson = await uthmaniRes.value.json();
    if (uthmaniJson.code !== 200 || !Array.isArray(uthmaniJson.data?.ayahs)) {
      throw new Error('Format data Uthmani tidak sesuai');
    }

    // Secondary: indonesian
    const indoMap = new Map<number, string>();
    if (indoRes.status === 'fulfilled' && indoRes.value.ok) {
      try {
        const indoJson = await indoRes.value.json();
        if (indoJson.code === 200 && Array.isArray(indoJson.data?.ayahs)) {
          for (const item of indoJson.data.ayahs) {
            indoMap.set(item.number, item.text);
          }
        }
      } catch (e) {
        console.warn('Gagal mem-parsing terjemahan:', e);
      }
    }

    // Tertiary: latin transliteration
    const latinMap = new Map<number, string>();
    if (latinRes.status === 'fulfilled' && latinRes.value.ok) {
      try {
        const latinJson = await latinRes.value.json();
        if (latinJson.code === 200 && Array.isArray(latinJson.data?.ayahs)) {
          for (const item of latinJson.data.ayahs) {
            latinMap.set(item.number, item.text);
          }
        }
      } catch (e) {
        console.warn('Gagal mem-parsing transliterasi latin:', e);
      }
    }

    // Quaternary: tajweed
    const tajweedMap = new Map<number, string>();
    if (tajweedRes.status === 'fulfilled' && tajweedRes.value.ok) {
      try {
        const tajweedJson = await tajweedRes.value.json();
        if (tajweedJson.code === 200 && Array.isArray(tajweedJson.data?.ayahs)) {
          for (const item of tajweedJson.data.ayahs) {
            tajweedMap.set(item.number, item.text);
          }
        }
      } catch (e) {
        console.warn('Gagal mem-parsing data tajwid:', e);
      }
    }

    const result: Ayah[] = uthmaniJson.data.ayahs.map((item: any) => {
      let rawText: string = (item.text || '').trim();
      let hasBismillahHeader = false;

      // Handle Bismillah in Surahs other than Al-Fatihah (Surah 1)
      if (item.numberInSurah === 1 && item.surah?.number !== 1) {
        if (BISMILLAH_REGEX.test(rawText)) {
          rawText = rawText.replace(BISMILLAH_REGEX, '').trim();
          hasBismillahHeader = true;
        }
      }

      // Latin transliteration
      let rawLatin = latinMap.get(item.number) || '';
      if (item.numberInSurah === 1 && item.surah?.number !== 1 && rawLatin) {
        rawLatin = rawLatin.replace(BISMILLAH_LATIN_REGEX, '').trim();
      }
      if (!rawLatin) {
        rawLatin = generateLatinFallback(rawText);
      }

      // Tajweed text
      let rawTajweed = tajweedMap.get(item.number) || rawText;
      if (item.numberInSurah === 1 && item.surah?.number !== 1 && rawTajweed) {
        rawTajweed = rawTajweed.replace(BISMILLAH_TAJWEED_REGEX, '').replace(BISMILLAH_REGEX, '').trim();
      }

      return {
        number: item.number,
        numberInSurah: item.numberInSurah,
        text: rawText,
        tajweedText: rawTajweed,
        latin: rawLatin,
        hasBismillahHeader,
        firstPhrase: extractFirstPhrase(rawText, hintMode),
        firstPhraseLatin: extractFirstPhraseLatin(rawLatin, hintMode),
        translation: indoMap.get(item.number) || 'Terjemahan tidak tersedia.',
        surah: {
          number: item.surah.number,
          name: item.surah.name,
          englishName: item.surah.englishName,
          englishNameTranslation: item.surah.englishNameTranslation,
          revelationType: item.surah.revelationType,
          numberOfAyahs: item.surah.numberOfAyahs,
        },
        juz: item.juz,
        page: item.page,
        audioUrl: getAyahAudioUrl(item.surah.number, item.numberInSurah),
      };
    });

    // Save to localStorage cache
    try {
      localStorage.setItem(`${CACHE_PREFIX}${pageNumber}`, JSON.stringify(result));
    } catch (storageErr) {
      console.warn('Kapasitas localStorage penuh, melewati penyimpanan cache');
    }

    return { ayahs: result, fromCache: false };
  } catch (error: any) {
    console.error(`Error fetching page ${pageNumber}:`, error);

    // Fallback to sample pages if offline or network failure
    const fallbackKey = pageNumber in SAMPLE_PAGES ? pageNumber : 582;
    const fallbackAyahs = (SAMPLE_PAGES[fallbackKey] || SAMPLE_PAGES[582] || SAMPLE_PAGES[1]).map(
      (a) => ({
        ...a,
        latin: a.latin || generateLatinFallback(a.text),
        tajweedText: a.tajweedText || a.text,
        firstPhrase: extractFirstPhrase(a.text, hintMode),
        firstPhraseLatin: extractFirstPhraseLatin(a.latin || generateLatinFallback(a.text), hintMode),
      })
    );

    return {
      ayahs: fallbackAyahs,
      fromCache: false,
      error:
        'Koneksi internet bermasalah. Menampilkan data mushaf offline. Coba muat ulang jika terhubung ke internet.',
    };
  }
}
