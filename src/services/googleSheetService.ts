import { AyahStatusMap, ScheduleItem } from '../types';

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

export function isRealScriptConfigured(): boolean {
  const url = getScriptUrl();
  return Boolean(
    url &&
    url !== DEFAULT_SCRIPT_URL &&
    url.startsWith('https://script.google.com/macros/s/')
  );
}

/**
 * Menyimpan data ke Google Sheets melalui fetch POST ke Google Apps Script Web App.
 *
 * @param actionType Tipe aksi (misal: 'UPDATE_STATUS', 'ADD_SCHEDULE', 'UPDATE_SCHEDULE', 'DELETE_SCHEDULE', 'SYNC_ALL')
 * @param data Objek data yang dikirim
 */
export async function saveToSheet(
  actionType: string,
  data: any
): Promise<{ success: boolean; message: string; isSimulated?: boolean }> {
  const scriptUrl = getScriptUrl();

  // Mode Simulasi jika URL belum dikonfigurasi oleh user
  if (!scriptUrl || scriptUrl === DEFAULT_SCRIPT_URL || !scriptUrl.startsWith('https://script.google.com/')) {
    console.info(
      `[Simulasi Google Sheets API] Aksi: "${actionType}" berhasil dicatat secara lokal. Konfigurasikan URL Web App asli di tombol Google Sheets di header untuk integrasi langsung.`
    );
    try {
      localStorage.setItem(LAST_SYNC_STORAGE_KEY, new Date().toISOString());
    } catch {}
    return {
      success: true,
      message: 'Tersimpan secara lokal (Mode Simulasi Google Sheets). Masukkan URL Web App untuk sinkronisasi cloud.',
      isSimulated: true,
    };
  }

  try {
    // Catatan teknis: Menggunakan Content-Type text/plain agar browser tidak mengirim CORS OPTIONS preflight
    // yang sering kali gagal di endpoint Google Apps Script. Google Apps Script tetap membaca e.postData.contents secara utuh.
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
      message: error?.message || 'Gagal menghubungi server Google Apps Script. Data tetap tersimpan aman di browser Anda.',
      isSimulated: false,
    };
  }
}

/**
 * Mengambil seluruh data user (Status hafalan, Jadwal kalender, dll) dari Google Sheets
 */
export async function loadFromSheet(): Promise<{
  success: boolean;
  data?: {
    statuses?: AyahStatusMap;
    schedules?: ScheduleItem[];
    dailyTarget?: number;
  };
  message: string;
  isSimulated?: boolean;
}> {
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
 * Cara Pemasangan:
 * 1. Buat Google Spreadsheet baru di https://sheets.new
 * 2. Klik menu "Extensions" (Ekstensi) > "Apps Script"
 * 3. Hapus semua kode yang ada di Code.gs, lalu paste seluruh kode ini.
 * 4. Klik tombol "Save" (ikon disket).
 * 5. Klik "Deploy" (Terapkan) > "New deployment" (Penerapan baru).
 * 6. Pilih tipe: "Web app" (Aplikasi Web).
 * 7. Konfigurasi:
 *    - Description: HafalanKu API
 *    - Execute as: "Me" (Saya)
 *    - Who has access: "Anyone" (Siapa saja)  <-- PENTING!
 * 8. Klik "Deploy", izinkan hak akses (Authorize access), lalu salin "Web App URL".
 * 9. Tempelkan URL tersebut ke web HafalanKu di tombol "Google Sheets" di header!
 * =========================================================================
 */

function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Sheet Status Hafalan
  var sheetStatus = ss.getSheetByName("StatusHafalan");
  if (!sheetStatus) {
    sheetStatus = ss.insertSheet("StatusHafalan");
    sheetStatus.appendRow([
      "Ayah Number",
      "Surah Number",
      "Surah Name",
      "Ayah In Surah",
      "Page",
      "Juz",
      "Is Favorite",
      "Is Learning",
      "Is Memorized",
      "Arabic Text",
      "Latin Text",
      "Translation",
      "Updated At"
    ]);
    sheetStatus.getRange(1, 1, 1, 13).setFontWeight("bold").setBackground("#FCE7F3");
  }

  // 2. Sheet Jadwal Kalender
  var sheetJadwal = ss.getSheetByName("JadwalKalender");
  if (!sheetJadwal) {
    sheetJadwal = ss.insertSheet("JadwalKalender");
    sheetJadwal.appendRow([
      "ID",
      "Tanggal",
      "Jenis Kegiatan",
      "Target / Deskripsi",
      "Catatan",
      "Status",
      "Created At",
      "Completed At"
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

    var sheets = setupSheets();
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === "SYNC_ALL" || action === "UPDATE_ALL_STATUSES") {
      // Perbarui seluruh status hafalan
      var statusSheet = ss.getSheetByName("StatusHafalan");
      if (statusSheet && data.statuses) {
        var lastRow = statusSheet.getLastRow();
        if (lastRow > 1) {
          statusSheet.getRange(2, 1, lastRow - 1, 13).clearContent();
        }
        var rows = [];
        var statuses = data.statuses;
        for (var k in statuses) {
          var s = statuses[k];
          rows.push([
            s.ayahNumber,
            s.surahNumber || "",
            s.surahName || "",
            s.numberInSurah || "",
            s.page || "",
            s.juz || "",
            s.isFavorite ? "YES" : "NO",
            s.isLearning ? "YES" : "NO",
            s.isMemorized ? "YES" : "NO",
            s.arabicText || "",
            s.latinText || "",
            s.translation || "",
            s.updatedAt || new Date().toISOString()
          ]);
        }
        if (rows.length > 0) {
          statusSheet.getRange(2, 1, rows.length, 13).setValues(rows);
        }
      }

      // Perbarui seluruh jadwal
      if (data.schedules) {
        var jadwalSheet = ss.getSheetByName("JadwalKalender");
        var lastJRow = jadwalSheet.getLastRow();
        if (lastJRow > 1) {
          jadwalSheet.getRange(2, 1, lastJRow - 1, 8).clearContent();
        }
        var jRows = [];
        for (var i = 0; i < data.schedules.length; i++) {
          var item = data.schedules[i];
          jRows.push([
            item.id,
            item.date,
            item.activityType,
            item.target,
            item.notes || "",
            item.status,
            item.createdAt || "",
            item.completedAt || ""
          ]);
        }
        if (jRows.length > 0) {
          jadwalSheet.getRange(2, 1, jRows.length, 8).setValues(jRows);
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Sinkronisasi penuh ke Google Sheets berhasil!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "UPDATE_STATUS") {
      // Update single status item
      var statusSheet = ss.getSheetByName("StatusHafalan");
      var s = data;
      var dataRange = statusSheet.getDataRange().getValues();
      var foundIndex = -1;
      for (var r = 1; r < dataRange.length; r++) {
        if (String(dataRange[r][0]) === String(s.ayahNumber)) {
          foundIndex = r + 1; // 1-based index
          break;
        }
      }

      var rowData = [
        s.ayahNumber,
        s.surahNumber || "",
        s.surahName || "",
        s.numberInSurah || "",
        s.page || "",
        s.juz || "",
        s.isFavorite ? "YES" : "NO",
        s.isLearning ? "YES" : "NO",
        s.isMemorized ? "YES" : "NO",
        s.arabicText || "",
        s.latinText || "",
        s.translation || "",
        s.updatedAt || new Date().toISOString()
      ];

      if (foundIndex > 0) {
        statusSheet.getRange(foundIndex, 1, 1, 13).setValues([rowData]);
      } else {
        statusSheet.appendRow(rowData);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Status ayat berhasil diperbarui di Google Sheets!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "ADD_SCHEDULE") {
      var jadwalSheet = ss.getSheetByName("JadwalKalender");
      var j = data;
      jadwalSheet.appendRow([
        j.id,
        j.date,
        j.activityType,
        j.target,
        j.notes || "",
        j.status,
        j.createdAt || new Date().toISOString(),
        j.completedAt || ""
      ]);

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Jadwal berhasil ditambahkan ke Google Sheets!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "UPDATE_SCHEDULE") {
      var jadwalSheet = ss.getSheetByName("JadwalKalender");
      var j = data;
      var values = jadwalSheet.getDataRange().getValues();
      var targetRow = -1;
      for (var row = 1; row < values.length; row++) {
        if (String(values[row][0]) === String(j.id)) {
          targetRow = row + 1;
          break;
        }
      }
      if (targetRow > 0) {
        jadwalSheet.getRange(targetRow, 1, 1, 8).setValues([[
          j.id,
          j.date,
          j.activityType,
          j.target,
          j.notes || "",
          j.status,
          j.createdAt || "",
          j.completedAt || ""
        ]]);
      } else {
        jadwalSheet.appendRow([
          j.id,
          j.date,
          j.activityType,
          j.target,
          j.notes || "",
          j.status,
          j.createdAt || "",
          j.completedAt || ""
        ]);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Status jadwal berhasil diperbarui!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "DELETE_SCHEDULE") {
      var jadwalSheet = ss.getSheetByName("JadwalKalender");
      var idToDelete = String(data.id);
      var values = jadwalSheet.getDataRange().getValues();
      for (var row = values.length - 1; row >= 1; row--) {
        if (String(values[row][0]) === idToDelete) {
          jadwalSheet.deleteRow(row + 1);
          break;
        }
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Jadwal berhasil dihapus dari Google Sheets!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Aksi tidak dikenali: " + action
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  try {
    setupSheets();
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Baca Status Hafalan
    var statusSheet = ss.getSheetByName("StatusHafalan");
    var statusValues = statusSheet ? statusSheet.getDataRange().getValues() : [];
    var statuses = {};

    if (statusValues.length > 1) {
      for (var r = 1; r < statusValues.length; r++) {
        var row = statusValues[r];
        var num = parseInt(row[0], 10);
        if (num) {
          statuses[num] = {
            ayahNumber: num,
            surahNumber: parseInt(row[1], 10) || 0,
            surahName: String(row[2] || ""),
            numberInSurah: parseInt(row[3], 10) || 0,
            page: parseInt(row[4], 10) || 0,
            juz: parseInt(row[5], 10) || 0,
            isFavorite: row[6] === "YES" || row[6] === true,
            isLearning: row[7] === "YES" || row[7] === true,
            isMemorized: row[8] === "YES" || row[8] === true,
            arabicText: String(row[9] || ""),
            latinText: String(row[10] || ""),
            translation: String(row[11] || ""),
            updatedAt: String(row[12] || new Date().toISOString())
          };
        }
      }
    }

    // 2. Baca Jadwal Kalender
    var jadwalSheet = ss.getSheetByName("JadwalKalender");
    var jadwalValues = jadwalSheet ? jadwalSheet.getDataRange().getValues() : [];
    var schedules = [];

    if (jadwalValues.length > 1) {
      for (var j = 1; j < jadwalValues.length; j++) {
        var jRow = jadwalValues[j];
        if (jRow[0]) {
          schedules.push({
            id: String(jRow[0]),
            date: String(jRow[1] || ""),
            activityType: String(jRow[2] || "Setoran"),
            target: String(jRow[3] || ""),
            notes: String(jRow[4] || ""),
            status: String(jRow[5] || "Belum"),
            createdAt: String(jRow[6] || ""),
            completedAt: String(jRow[7] || "")
          });
        }
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      data: {
        statuses: statuses,
        schedules: schedules
      }
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
`;
