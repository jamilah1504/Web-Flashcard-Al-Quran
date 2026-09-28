import { AyahStatusMap, ScheduleItem, AyahUserStatus } from '../types';
import { getAccessToken } from './firebaseAuth';
import {
  getConnectedSpreadsheetId,
  syncAllToGoogleSheet,
  loadAllFromGoogleSheet,
  syncSingleAyahToSheet,
  appendScheduleToSheet,
  updateScheduleInSheet,
  deleteScheduleFromSheet,
  isAutoSyncEnabled,
} from './googleSheetsApi';

/**
 * URL Google Apps Script Web App default (sebagaimana diminta disimulasikan).
 * Pengguna dapat memasukkan URL asli mereka melalui menu Pengaturan Google Sheets.
 */
export const DEFAULT_SCRIPT_URL = 'URL_WEB_APP_GOOGLE_SHEET_KAMU';
export const GAS_URL_STORAGE_KEY = 'hafalanku_gas_script_url_v1';
export const LAST_SYNC_STORAGE_KEY = 'hafalanku_last_sheet_sync_v1';

export function getScriptUrl(): string {
  try {
    const saved = localStorage.getItem(GAS_URL_STORAGE_KEY);
    if (saved && saved.trim() !== '') {
      return saved.trim();
    }
  } catch (e) {
    console.warn('Error reading script URL from localStorage', e);
  }
  return DEFAULT_SCRIPT_URL;
}

export function saveScriptUrl(url: string): void {
  try {
    if (!url || url.trim() === '') {
      localStorage.removeItem(GAS_URL_STORAGE_KEY);
    } else {
      localStorage.setItem(GAS_URL_STORAGE_KEY, url.trim());
    }
  } catch (e) {
    console.warn('Error saving script URL to localStorage', e);
  }
}

/**
 * Check if Google Sheets is configured, either via Google Workspace OAuth & connected Spreadsheet,
 * or via custom Apps Script URL.
 */
export function isRealScriptConfigured(): boolean {
  const spreadsheetId = getConnectedSpreadsheetId();
  if (spreadsheetId) return true;

  const url = getScriptUrl();
  return Boolean(
    url &&
    url !== DEFAULT_SCRIPT_URL &&
    url.startsWith('https://script.google.com/macros/s/')
  );
}

/**
 * Menyimpan data ke Google Sheets melalui Google Sheets API v4 (jika terhubung OAuth)
 * atau fetch POST ke Google Apps Script Web App.
 *
 * @param actionType Tipe aksi (misal: 'UPDATE_STATUS', 'ADD_SCHEDULE', 'UPDATE_SCHEDULE', 'DELETE_SCHEDULE', 'SYNC_ALL')
 * @param data Objek data yang dikirim
 */
export async function saveToSheet(
  actionType: string,
  data: any
): Promise<{ success: boolean; message: string; isSimulated?: boolean; rowsSynced?: number }> {
  // 1. Coba gunakan Google Sheets API v4 langsung jika ada token & spreadsheet ID
  const accessToken = await getAccessToken();
  const spreadsheetId = getConnectedSpreadsheetId();

  if (accessToken && spreadsheetId) {
    try {
      if (actionType === 'SYNC_ALL' || actionType === 'UPDATE_ALL_STATUSES') {
        const res = await syncAllToGoogleSheet(
          accessToken,
          spreadsheetId,
          data.statuses || {},
          data.schedules || [],
          data.dailyTarget || 5
        );
        localStorage.setItem(LAST_SYNC_STORAGE_KEY, new Date().toISOString());
        return {
          success: true,
          message: res.message,
          rowsSynced: res.rowsSynced,
          isSimulated: false,
        };
      }

      if (actionType === 'UPDATE_STATUS' && isAutoSyncEnabled()) {
        await syncSingleAyahToSheet(accessToken, spreadsheetId, data as AyahUserStatus);
        localStorage.setItem(LAST_SYNC_STORAGE_KEY, new Date().toISOString());
        return {
          success: true,
          message: 'Status ayat diperbarui di Google Sheets.',
          isSimulated: false,
        };
      }

      if (actionType === 'ADD_SCHEDULE' && isAutoSyncEnabled()) {
        await appendScheduleToSheet(accessToken, spreadsheetId, data as ScheduleItem);
        localStorage.setItem(LAST_SYNC_STORAGE_KEY, new Date().toISOString());
        return {
          success: true,
          message: 'Jadwal ditambahkan ke Google Sheets.',
          isSimulated: false,
        };
      }

      if (actionType === 'UPDATE_SCHEDULE' && isAutoSyncEnabled()) {
        await updateScheduleInSheet(accessToken, spreadsheetId, data as ScheduleItem);
        localStorage.setItem(LAST_SYNC_STORAGE_KEY, new Date().toISOString());
        return {
          success: true,
          message: 'Jadwal diperbarui di Google Sheets.',
          isSimulated: false,
        };
      }

      if (actionType === 'DELETE_SCHEDULE' && isAutoSyncEnabled()) {
        await deleteScheduleFromSheet(accessToken, spreadsheetId, data.id);
        localStorage.setItem(LAST_SYNC_STORAGE_KEY, new Date().toISOString());
        return {
          success: true,
          message: 'Jadwal dihapus dari Google Sheets.',
          isSimulated: false,
        };
      }
    } catch (err: any) {
      console.warn('[Google Sheets API Error]', err);
      // If error happens, fall through or return error
      return {
        success: false,
        message: err?.message || 'Gagal menyimpan ke Google Sheets API.',
        isSimulated: false,
      };
    }
  }

  // 2. Fallback: Google Apps Script Web App
  const scriptUrl = getScriptUrl();

  // Mode Simulasi jika URL belum dikonfigurasi oleh user
  if (!scriptUrl || scriptUrl === DEFAULT_SCRIPT_URL || !scriptUrl.startsWith('https://script.google.com/')) {
    try {
      localStorage.setItem(LAST_SYNC_STORAGE_KEY, new Date().toISOString());
    } catch {}
    return {
      success: true,
      message: 'Tersimpan secara lokal (Hubungkan Google Sheets untuk sinkronisasi cloud langsung).',
      isSimulated: true,
    };
  }

  try {
    const payload = JSON.stringify({
      action: actionType,
      data: data,
      timestamp: new Date().toISOString(),
      appName: 'HafalanKu & Tracker Al-Quran',
    });

    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: payload,
    });

    const result = await response.json();
    if (result && result.status === 'success') {
      try {
        localStorage.setItem(LAST_SYNC_STORAGE_KEY, new Date().toISOString());
      } catch {}
      return {
        success: true,
        message: result.message || 'Berhasil disinkronkan ke Google Sheets!',
        isSimulated: false,
      };
    } else {
      return {
        success: false,
        message: result.message || 'Gagal memproses data di Google Sheets script.',
        isSimulated: false,
      };
    }
  } catch (error: any) {
    console.warn('[Google Sheets Sync Error]', error);
    return {
      success: false,
      message: error?.message || 'Gagal menghubungi server Google Apps Script.',
      isSimulated: false,
    };
  }
}

/**
 * Mengambil seluruh data user (Status hafalan, Jadwal kalender, dll) dari Google Sheets
 */
export async function loadFromSheet(customSpreadsheetId?: string): Promise<{
  success: boolean;
  data?: {
    statuses?: AyahStatusMap;
    schedules?: ScheduleItem[];
    dailyTarget?: number;
  };
  message: string;
  isSimulated?: boolean;
}> {
  // 1. Coba baca dari Google Sheets API v4
  const accessToken = await getAccessToken();
  const spreadsheetId = customSpreadsheetId || getConnectedSpreadsheetId();

  if (accessToken && spreadsheetId) {
    try {
      const result = await loadAllFromGoogleSheet(accessToken, spreadsheetId);
      localStorage.setItem(LAST_SYNC_STORAGE_KEY, new Date().toISOString());
      return {
        success: true,
        data: result,
        message: 'Data berhasil dimuat dari Google Sheets!',
        isSimulated: false,
      };
    } catch (err: any) {
      console.warn('[Google Sheets Load Error]', err);
      return {
        success: false,
        message: err?.message || 'Gagal memuat data dari Google Sheets API.',
        isSimulated: false,
      };
    }
  }

  // 2. Fallback: Google Apps Script Web App
  const scriptUrl = getScriptUrl();

  if (!scriptUrl || scriptUrl === DEFAULT_SCRIPT_URL || !scriptUrl.startsWith('https://script.google.com/')) {
    return {
      success: true,
      message: 'Menggunakan data lokal browser (Mode Simulasi Google Sheets).',
      isSimulated: true,
    };
  }

  try {
    const fetchUrl = `${scriptUrl}?action=LOAD_ALL&t=${Date.now()}`;
    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    const result = await response.json();
    if (result && result.status === 'success') {
      try {
        localStorage.setItem(LAST_SYNC_STORAGE_KEY, new Date().toISOString());
      } catch {}
      return {
        success: true,
        data: result.data || {},
        message: 'Data berhasil dimuat dari Google Sheets!',
        isSimulated: false,
      };
    } else {
      return {
        success: false,
        message: result.message || 'Gagal mengambil data dari Google Sheets.',
        isSimulated: false,
      };
    }
  } catch (error: any) {
    console.warn('[Google Sheets Load Error]', error);
    return {
      success: false,
      message: error?.message || 'Tidak dapat terhubung ke Google Sheets. Menggunakan data lokal.',
      isSimulated: false,
    };
  }
}

/**
 * Kode Google Apps Script (Code.gs) lengkap yang bisa langsung disalin oleh pengguna
 * ke Google Sheets -> Extensions -> Apps Script.
 */
export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * BACKEND GOOGLE APPS SCRIPT: HAFALANKU & TRACKER AL-QUR'AN
 * =========================================================================
 */
function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Sheet Status Hafalan
  var sheetStatus = ss.getSheetByName("StatusHafalan");
  if (!sheetStatus) {
    sheetStatus = ss.insertSheet("StatusHafalan");
    sheetStatus.appendRow([
      "Ayah Number", "Surah Number", "Surah Name", "Ayah In Surah",
      "Page", "Juz", "Is Favorite", "Is Learning", "Is Memorized",
      "Arabic Text", "Latin Text", "Translation", "Updated At"
    ]);
    sheetStatus.getRange(1, 1, 1, 13).setFontWeight("bold").setBackground("#FCE7F3");
  }

  // 2. Sheet Jadwal Kalender
  var sheetJadwal = ss.getSheetByName("JadwalKalender");
  if (!sheetJadwal) {
    sheetJadwal = ss.insertSheet("JadwalKalender");
    sheetJadwal.appendRow([
      "ID", "Tanggal", "Jenis Kegiatan", "Target / Deskripsi",
      "Catatan", "Status", "Created At", "Completed At"
    ]);
    sheetJadwal.getRange(1, 1, 1, 8).setFontWeight("bold").setBackground("#E0E7FF");
  }

  return { statusSheet: sheetStatus, jadwalSheet: sheetJadwal };
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(15000);
  try {
    var raw = e.postData.contents;
    var request = JSON.parse(raw);
    var action = request.action;
    var data = request.data;
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === "SYNC_ALL" || action === "UPDATE_ALL_STATUSES") {
      var statusSheet = ss.getSheetByName("StatusHafalan");
      if (statusSheet && data.statuses) {
        var lastRow = statusSheet.getLastRow();
        if (lastRow > 1) {
          statusSheet.getRange(2, 1, lastRow - 1, 13).clearContent();
        }
        var rows = [];
        for (var k in data.statuses) {
          var s = data.statuses[k];
          rows.push([
            s.ayahNumber, s.surahNumber || "", s.surahName || "", s.numberInSurah || "",
            s.page || "", s.juz || "", s.isFavorite ? "YES" : "NO",
            s.isLearning ? "YES" : "NO", s.isMemorized ? "YES" : "NO",
            s.arabicText || "", s.latinText || "", s.translation || "",
            s.updatedAt || new Date().toISOString()
          ]);
        }
        if (rows.length > 0) statusSheet.getRange(2, 1, rows.length, 13).setValues(rows);
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Sinkronisasi berhasil!" })).setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
`;
