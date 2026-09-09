import { Ayah, HintLength } from '../types';
import { SAMPLE_PAGES } from '../data/samplePages';
import { extractFirstPhrase, getAyahAudioUrl } from '../utils/quranHelper';

const CACHE_PREFIX = 'quran_live_v4_page_';
const BISMILLAH_REGEX = /^بِسْمِ\s+ٱللَّهِ\s+ٱلرَّحْمَٰنِ\s+ٱلرَّحِيمِ\s*/;

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
          // Ensure audioUrl uses reliable CDN (verses.quran.com)
          audioUrl: getAyahAudioUrl(a.surah.number, a.numberInSurah),
        }));
        return { ayahs, fromCache: true };
      }
    }
  } catch (e) {
    console.warn('Gagal membaca cache lokal:', e);
  }

  // 2. Fetch live authentic data from AlQuran Cloud API
  // Using official parallel requests for Arabic Uthmani and Indonesian translation
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const [uthmaniRes, indoRes] = await Promise.all([
      fetch(`https://api.alquran.cloud/v1/page/${pageNumber}/quran-uthmani`, {
        signal: controller.signal,
      }),
      fetch(`https://api.alquran.cloud/v1/page/${pageNumber}/id.indonesian`, {
        signal: controller.signal,
      }),
    ]);
    clearTimeout(timeoutId);

    if (!uthmaniRes.ok || !indoRes.ok) {
      throw new Error(`Gagal memuat API (Uthmani: ${uthmaniRes.status}, Indo: ${indoRes.status})`);
    }

    const [uthmaniJson, indoJson] = await Promise.all([uthmaniRes.json(), indoRes.json()]);

    if (
      uthmaniJson.code === 200 &&
      indoJson.code === 200 &&
      Array.isArray(uthmaniJson.data?.ayahs) &&
      Array.isArray(indoJson.data?.ayahs)
    ) {
      // Map Indonesian translation by global ayah number
      const indoMap = new Map<number, string>();
      for (const item of indoJson.data.ayahs) {
        indoMap.set(item.number, item.text);
      }

      const result: Ayah[] = uthmaniJson.data.ayahs.map((item: any) => {
        let rawText: string = (item.text || '').trim();
        let hasBismillahHeader = false;

        // In api.alquran.cloud quran-uthmani edition, Surahs other than Al-Fatihah (Surah 1)
        // have Bismillah prepended to verse 1. We cleanly separate this so that:
        // 1) The firstPhrase (pancingan hafalan) is genuinely the first words of the verse.
        // 2) The verse text matches the Indonesian translation accurately.
        // 3) Bismillah is displayed gracefully as a Surah header.
        if (item.numberInSurah === 1 && item.surah?.number !== 1) {
          if (BISMILLAH_REGEX.test(rawText)) {
            rawText = rawText.replace(BISMILLAH_REGEX, '').trim();
            hasBismillahHeader = true;
          }
        }

        return {
          number: item.number,
          numberInSurah: item.numberInSurah,
          text: rawText,
          hasBismillahHeader,
          firstPhrase: extractFirstPhrase(rawText, hintMode),
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
    } else {
      throw new Error('Format data Al-Qur\'an Cloud tidak valid');
    }
  } catch (error: any) {
    console.error(`Error fetching page ${pageNumber}:`, error);

    // Fallback to sample pages if offline or network failure
    const fallbackKey = pageNumber in SAMPLE_PAGES ? pageNumber : 582;
    const fallbackAyahs = (SAMPLE_PAGES[fallbackKey] || SAMPLE_PAGES[582] || SAMPLE_PAGES[1]).map(
      (a) => ({
        ...a,
        firstPhrase: extractFirstPhrase(a.text, hintMode),
      })
    );

    return {
      ayahs: fallbackAyahs,
      fromCache: false,
      error:
        'Koneksi internet bermasalah. Menampilkan data cadangan mushaf. Coba muat ulang saat terhubung ke internet.',
    };
  }
}
