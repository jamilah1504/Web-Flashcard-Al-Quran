import { Ayah, HintLength } from '../types';
import { SAMPLE_PAGES } from '../data/samplePages';
import { ALL_SURAHS } from '../data/quranMeta';
import {
  extractFirstPhrase,
  extractFirstPhraseLatin,
  getAyahAudioUrl,
  generateLatinFallback,
} from '../utils/quranHelper';

const CACHE_PREFIX = 'hafalanku_live_v6_page_';
const BISMILLAH_REGEX = /^بِسْمِ\s+ٱللَّهِ\s+ٱلرَّحْمَٰنِ\s+ٱلرَّحِيمِ\s*/;
const BISMILLAH_TAJWEED_REGEX = /^بِسْمِ\s+\[h:?\d*\[ٱ\]للَّهِ\s+\[h:?\d*\[ٱ\]\[l\[ل\]رَّحْمَ\[n\[ـٰ\]نِ\s+\[h:?\d*\[ٱ\]\[l\[ل\]رَّح\[p\[ِي\]مِ\s*/;
const BISMILLAH_LATIN_REGEX = /^bismillaahir?\s+rahmaanir?\s+raheem\s*/i;

function getFromStorage(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch (e) {}
  return null;
}

function setToStorage(key: string, val: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, val);
    }
  } catch (e) {}
}

/**
 * Secondary reliable fallback using api.quran.com
 */
async function fetchFromQuranComFallback(
  pageNumber: number,
  hintMode: HintLength
): Promise<Ayah[] | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const url = `https://api.quran.com/api/v4/verses/by_page/${pageNumber}?words=false&translations=33&fields=text_uthmani,chapter_id`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !Array.isArray(data.verses) || data.verses.length === 0) return null;

    return data.verses.map((v: any) => {
      const [sNumStr, aNumStr] = v.verse_key.split(':');
      const sNum = parseInt(sNumStr, 10);
      const aNum = parseInt(aNumStr, 10);
      const surahMeta = ALL_SURAHS.find((s) => s.number === sNum) || {
        number: sNum,
        name: '',
        englishName: `Surat ${sNum}`,
        englishNameTranslation: '',
        revelationType: 'Meccan' as const,
        numberOfAyahs: 1,
        startPage: pageNumber,
      };

      let rawText: string = (v.text_uthmani || '').trim();
      let hasBismillahHeader = false;
      if (aNum === 1 && sNum !== 1 && sNum !== 9) {
        if (BISMILLAH_REGEX.test(rawText)) {
          rawText = rawText.replace(BISMILLAH_REGEX, '').trim();
          hasBismillahHeader = true;
        }
      }

      const trans = (v.translations?.[0]?.text || '')
        .replace(/<[^>]*>/g, '')
        .trim() || 'Terjemahan tidak tersedia.';
      const latin = generateLatinFallback(rawText);

      return {
        number: v.id,
        numberInSurah: aNum,
        text: rawText,
        tajweedText: rawText,
        latin,
        hasBismillahHeader,
        firstPhrase: extractFirstPhrase(rawText, hintMode),
        firstPhraseLatin: extractFirstPhraseLatin(latin, hintMode),
        translation: trans,
        surah: surahMeta,
        juz: v.juz_number || 30,
        page: v.page_number || pageNumber,
        audioUrl: getAyahAudioUrl(sNum, aNum),
      };
    });
  } catch (e) {
    return null;
  }
}

export async function fetchAyahsForPage(
  pageNumber: number,
  hintMode: HintLength = 'short'
): Promise<{ ayahs: Ayah[]; fromCache: boolean; error?: string }> {
  // 1. Check cache for instant fast loading & offline support
  const cachedStr = getFromStorage(`${CACHE_PREFIX}${pageNumber}`);
  if (cachedStr) {
    try {
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
    } catch (e) {
      console.warn('Gagal membaca cache lokal:', e);
    }
  }

  // 2. Fetch live authentic data from AlQuran Cloud API
  // Using parallel requests for Arabic Uthmani, Indonesian translation, Latin transliteration & Tajweed
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8500);

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

    // Save to cache
    setToStorage(`${CACHE_PREFIX}${pageNumber}`, JSON.stringify(result));

    return { ayahs: result, fromCache: false };
  } catch (error: any) {
    console.warn(`Primary Quran API failed for page ${pageNumber}, attempting secondary fallback...`);

    // 3. Attempt Secondary Fallback: api.quran.com
    const secondaryAyahs = await fetchFromQuranComFallback(pageNumber, hintMode);
    if (secondaryAyahs && secondaryAyahs.length > 0) {
      setToStorage(`${CACHE_PREFIX}${pageNumber}`, JSON.stringify(secondaryAyahs));
      return { ayahs: secondaryAyahs, fromCache: false };
    }

    // 4. Final Fallback to Sample Pages if completely offline
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
        'Koneksi internet lambat. Menampilkan data mushaf cadangan offline. Klik muat ulang jika ingin mencoba kembali.',
    };
  }
}
