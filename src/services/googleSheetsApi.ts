import { AyahStatusMap, ScheduleItem, AyahUserStatus } from '../types';

export interface SpreadsheetFile {
  id: string;
  name: string;
  modifiedTime?: string;
  webViewLink?: string;
}

export const CONNECTED_SHEET_ID_KEY = 'hafalanku_google_spreadsheet_id_v2';
export const CONNECTED_SHEET_TITLE_KEY = 'hafalanku_google_spreadsheet_title_v2';
export const AUTO_SYNC_STORAGE_KEY = 'hafalanku_google_sheets_auto_sync';

export function getConnectedSpreadsheetId(): string | null {
  try {
    return localStorage.getItem(CONNECTED_SHEET_ID_KEY);
  } catch {
    return null;
  }
}

export function setConnectedSpreadsheet(id: string | null, title?: string | null) {
  try {
    if (id) {
      localStorage.setItem(CONNECTED_SHEET_ID_KEY, id);
      if (title) localStorage.setItem(CONNECTED_SHEET_TITLE_KEY, title);
    } else {
      localStorage.removeItem(CONNECTED_SHEET_ID_KEY);
      localStorage.removeItem(CONNECTED_SHEET_TITLE_KEY);
    }
  } catch (e) {
    console.warn('Error saving spreadsheet id:', e);
  }
}

export function getConnectedSpreadsheetTitle(): string {
  try {
    return (
      localStorage.getItem(CONNECTED_SHEET_TITLE_KEY) ||
      "HafalanKu - Database & Tracker Al-Qur'an"
    );
  } catch {
    return "HafalanKu - Database & Tracker Al-Qur'an";
  }
}

export function isAutoSyncEnabled(): boolean {
  try {
    const val = localStorage.getItem(AUTO_SYNC_STORAGE_KEY);
    return val === null ? true : val === 'true'; // Default true
  } catch {
    return true;
  }
}

export function setAutoSyncEnabled(enabled: boolean) {
  try {
    localStorage.setItem(AUTO_SYNC_STORAGE_KEY, String(enabled));
  } catch {}
}

/**
 * List spreadsheets available in user's Google Drive
 */
export async function listUserSpreadsheets(accessToken: string): Promise<SpreadsheetFile[]> {
  const query = encodeURIComponent(
    "mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false"
  );
  const fields = encodeURIComponent('files(id, name, modifiedTime, webViewLink)');
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&orderBy=modifiedTime%20desc&pageSize=30`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gagal mengambil daftar spreadsheet (${response.status})`);
  }

  const data = await response.json();
  return (data.files || []).map((file: any) => ({
    id: file.id,
    name: file.name,
    modifiedTime: file.modifiedTime,
    webViewLink: file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}`,
  }));
}

/**
 * Create a new styled Quran tracker spreadsheet in user's Google Drive
 */
export async function createQuranSpreadsheet(
  accessToken: string,
  title: string = "HafalanKu - Database & Tracker Al-Qur'an"
): Promise<{ id: string; title: string; webViewLink: string }> {
  const createUrl = 'https://sheets.googleapis.com/v4/spreadsheets';

  const body = {
    properties: {
      title,
    },
    sheets: [
      {
        properties: {
          title: 'StatusHafalan',
          gridProperties: {
            frozenRowCount: 1,
          },
        },
      },
      {
        properties: {
          title: 'JadwalKalender',
          gridProperties: {
            frozenRowCount: 1,
          },
        },
      },
      {
        properties: {
          title: 'RingkasanStatistik',
          gridProperties: {
            frozenRowCount: 1,
          },
        },
      },
    ],
  };

  const response = await fetch(createUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gagal membuat spreadsheet baru (${response.status})`);
  }

  const created = await response.json();
  const spreadsheetId = created.spreadsheetId;
  const webViewLink = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

  // Initialize Header rows with styling
  const headerValuesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`;
  const headerValues = {
    valueInputOption: 'USER_ENTERED',
    data: [
      {
        range: 'StatusHafalan!A1:M1',
        values: [
          [
            'Ayah Number',
            'Surah Number',
            'Surah Name',
            'Ayah In Surah',
            'Page',
            'Juz',
            'Is Favorite',
            'Is Learning',
            'Is Memorized',
            'Arabic Text',
            'Latin Text',
            'Translation',
            'Updated At',
          ],
        ],
      },
      {
        range: 'JadwalKalender!A1:H1',
        values: [
          [
            'ID',
            'Tanggal',
            'Jenis Kegiatan',
            'Target / Deskripsi',
            'Catatan',
            'Status',
            'Created At',
            'Completed At',
          ],
        ],
      },
      {
        range: 'RingkasanStatistik!A1:D1',
        values: [['Metrik', 'Nilai', 'Keterangan', 'Terakhir Diperbarui']],
      },
    ],
  };

  await fetch(headerValuesUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(headerValues),
  });

  return {
    id: spreadsheetId,
    title,
    webViewLink,
  };
}

/**
 * Check if the sheets exist in the spreadsheet; if missing, create them.
 */
async function ensureSheetsExist(
  accessToken: string,
  spreadsheetId: string
): Promise<{ statusSheetId?: number; jadwalSheetId?: number }> {
  const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets(properties(sheetId,title))`;
  const metaRes = await fetch(metaUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!metaRes.ok) {
    const err = await metaRes.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Gagal memeriksa tab spreadsheet.');
  }

  const metaData = await metaRes.json();
  const existingSheets = metaData.sheets || [];
  const titles = existingSheets.map((s: any) => s.properties.title);

  const requests: any[] = [];
  if (!titles.includes('StatusHafalan')) {
    requests.push({
      addSheet: {
        properties: {
          title: 'StatusHafalan',
          gridProperties: { frozenRowCount: 1 },
        },
      },
    });
  }
  if (!titles.includes('JadwalKalender')) {
    requests.push({
      addSheet: {
        properties: {
          title: 'JadwalKalender',
          gridProperties: { frozenRowCount: 1 },
        },
      },
    });
  }
  if (!titles.includes('RingkasanStatistik')) {
    requests.push({
      addSheet: {
        properties: {
          title: 'RingkasanStatistik',
          gridProperties: { frozenRowCount: 1 },
        },
      },
    });
  }

  if (requests.length > 0) {
    const batchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
    await fetch(batchUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    });

    // Write headers for newly created sheets
    const headerUpdates: any[] = [];
    if (!titles.includes('StatusHafalan')) {
      headerUpdates.push({
        range: 'StatusHafalan!A1:M1',
        values: [
          [
            'Ayah Number',
            'Surah Number',
            'Surah Name',
            'Ayah In Surah',
            'Page',
            'Juz',
            'Is Favorite',
            'Is Learning',
            'Is Memorized',
            'Arabic Text',
            'Latin Text',
            'Translation',
            'Updated At',
          ],
        ],
      });
    }
    if (!titles.includes('JadwalKalender')) {
      headerUpdates.push({
        range: 'JadwalKalender!A1:H1',
        values: [
          [
            'ID',
            'Tanggal',
            'Jenis Kegiatan',
            'Target / Deskripsi',
            'Catatan',
            'Status',
            'Created At',
            'Completed At',
          ],
        ],
      });
    }

    if (headerUpdates.length > 0) {
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            valueInputOption: 'USER_ENTERED',
            data: headerUpdates,
          }),
        }
      );
    }
  }

  return {};
}

/**
 * Sync entire local data (statuses, schedules, statistics) to Google Sheets
 */
export async function syncAllToGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  statuses: AyahStatusMap,
  schedules: ScheduleItem[],
  dailyTarget: number = 5
): Promise<{ success: boolean; message: string; rowsSynced: number }> {
  await ensureSheetsExist(accessToken, spreadsheetId);

  // 1. Prepare StatusHafalan rows
  const statusRows: any[][] = [];
  for (const key of Object.keys(statuses)) {
    const s = statuses[Number(key)];
    if (!s) continue;
    statusRows.push([
      s.ayahNumber,
      s.surahNumber || '',
      s.surahName || '',
      s.numberInSurah || '',
      s.page || '',
      s.juz || '',
      s.isFavorite ? 'YES' : 'NO',
      s.isLearning ? 'YES' : 'NO',
      s.isMemorized ? 'YES' : 'NO',
      s.arabicText || '',
      s.latinText || '',
      s.translation || '',
      s.updatedAt || new Date().toISOString(),
    ]);
  }

  // 2. Prepare JadwalKalender rows
  const scheduleRows: any[][] = schedules.map((item) => [
    item.id,
    item.date,
    item.activityType,
    item.target,
    item.notes || '',
    item.status,
    item.createdAt || '',
    item.completedAt || '',
  ]);

  // 3. Clear old data rows in StatusHafalan and JadwalKalender
  const clearRanges = ['StatusHafalan!A2:M10000', 'JadwalKalender!A2:H2000'];
  for (const range of clearRanges) {
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
        range
      )}:clear`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    ).catch(() => {});
  }

  // 4. Batch update data
  const dataPayload: any[] = [];

  if (statusRows.length > 0) {
    dataPayload.push({
      range: `StatusHafalan!A2:M${statusRows.length + 1}`,
      values: statusRows,
    });
  }

  if (scheduleRows.length > 0) {
    dataPayload.push({
      range: `JadwalKalender!A2:H${scheduleRows.length + 1}`,
      values: scheduleRows,
    });
  }

  // Summary statistics
  const memorizedTotal = Object.values(statuses).filter((s) => s.isMemorized).length;
  const learningTotal = Object.values(statuses).filter((s) => s.isLearning).length;
  const favoriteTotal = Object.values(statuses).filter((s) => s.isFavorite).length;

  dataPayload.push({
    range: 'RingkasanStatistik!A2:D6',
    values: [
      ['Total Ayat Dihafal', memorizedTotal, 'Status Sudah Dihafal', new Date().toISOString()],
      ['Sedang Dihafal', learningTotal, 'Status Sedang Dihafal', new Date().toISOString()],
      ['Ayat Favorit / Ditandai', favoriteTotal, 'Status Favorit', new Date().toISOString()],
      ['Target Hafalan Harian', dailyTarget, 'Ayat per hari', new Date().toISOString()],
      ['Total Jadwal Muroja\'ah', schedules.length, 'Item agenda kalender', new Date().toISOString()],
    ],
  });

  const batchUpdateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`;
  const response = await fetch(batchUpdateUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data: dataPayload,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Gagal menyimpan data ke Google Sheets');
  }

  return {
    success: true,
    message: `Berhasil sinkronisasi ${statusRows.length} status ayat & ${scheduleRows.length} agenda ke Google Sheets!`,
    rowsSynced: statusRows.length + scheduleRows.length,
  };
}

/**
 * Load all data (statuses and schedules) from Google Sheets into the app
 */
export async function loadAllFromGoogleSheet(
  accessToken: string,
  spreadsheetId: string
): Promise<{
  statuses: AyahStatusMap;
  schedules: ScheduleItem[];
  dailyTarget?: number;
}> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?ranges=StatusHafalan!A2:M&ranges=JadwalKalender!A2:H&ranges=RingkasanStatistik!A2:B10`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Gagal memuat data dari Google Sheets.');
  }

  const data = await response.json();
  const valueRanges = data.valueRanges || [];

  const statuses: AyahStatusMap = {};
  const statusValues = valueRanges[0]?.values || [];
  for (const row of statusValues) {
    const num = parseInt(row[0], 10);
    if (num) {
      statuses[num] = {
        ayahNumber: num,
        surahNumber: parseInt(row[1], 10) || 0,
        surahName: String(row[2] || ''),
        numberInSurah: parseInt(row[3], 10) || 0,
        page: parseInt(row[4], 10) || 0,
        juz: parseInt(row[5], 10) || 0,
        isFavorite: row[6] === 'YES' || row[6] === true,
        isLearning: row[7] === 'YES' || row[7] === true,
        isMemorized: row[8] === 'YES' || row[8] === true,
        arabicText: String(row[9] || ''),
        latinText: String(row[10] || ''),
        translation: String(row[11] || ''),
        updatedAt: String(row[12] || new Date().toISOString()),
      };
    }
  }

  const schedules: ScheduleItem[] = [];
  const scheduleValues = valueRanges[1]?.values || [];
  for (const jRow of scheduleValues) {
    if (jRow[0]) {
      schedules.push({
        id: String(jRow[0]),
        date: String(jRow[1] || ''),
        activityType: (jRow[2] as any) || 'Setoran',
        target: String(jRow[3] || ''),
        notes: String(jRow[4] || ''),
        status: (jRow[5] as any) || 'Belum',
        createdAt: String(jRow[6] || ''),
        completedAt: String(jRow[7] || ''),
      });
    }
  }

  let dailyTarget: number | undefined;
  const statsValues = valueRanges[2]?.values || [];
  for (const stat of statsValues) {
    if (String(stat[0]).includes('Target')) {
      const parsed = parseInt(stat[1], 10);
      if (parsed > 0) dailyTarget = parsed;
    }
  }

  return {
    statuses,
    schedules,
    dailyTarget,
  };
}

/**
 * Incrementally save or update a single Ayah status to Google Sheets
 */
export async function syncSingleAyahToSheet(
  accessToken: string,
  spreadsheetId: string,
  status: AyahUserStatus
): Promise<void> {
  const getColUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/StatusHafalan!A2:A`;
  const res = await fetch(getColUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) return;

  const data = await res.json();
  const rows = data.values || [];
  let rowIndex = -1;

  for (let i = 0; i < rows.length; i++) {
    if (String(rows[i][0]) === String(status.ayahNumber)) {
      rowIndex = i + 2; // 1-based, offset by header row (row 1)
      break;
    }
  }

  const rowData = [
    status.ayahNumber,
    status.surahNumber || '',
    status.surahName || '',
    status.numberInSurah || '',
    status.page || '',
    status.juz || '',
    status.isFavorite ? 'YES' : 'NO',
    status.isLearning ? 'YES' : 'NO',
    status.isMemorized ? 'YES' : 'NO',
    status.arabicText || '',
    status.latinText || '',
    status.translation || '',
    status.updatedAt || new Date().toISOString(),
  ];

  if (rowIndex > 0) {
    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/StatusHafalan!A${rowIndex}:M${rowIndex}?valueInputOption=USER_ENTERED`;
    await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [rowData] }),
    });
  } else {
    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/StatusHafalan!A:M:append?valueInputOption=USER_ENTERED`;
    await fetch(appendUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [rowData] }),
    });
  }
}

/**
 * Incrementally append a new schedule item to Google Sheets
 */
export async function appendScheduleToSheet(
  accessToken: string,
  spreadsheetId: string,
  item: ScheduleItem
): Promise<void> {
  const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/JadwalKalender!A:H:append?valueInputOption=USER_ENTERED`;
  const row = [
    item.id,
    item.date,
    item.activityType,
    item.target,
    item.notes || '',
    item.status,
    item.createdAt || new Date().toISOString(),
    item.completedAt || '',
  ];

  await fetch(appendUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values: [row] }),
  });
}

/**
 * Incrementally update a schedule item in Google Sheets
 */
export async function updateScheduleInSheet(
  accessToken: string,
  spreadsheetId: string,
  item: ScheduleItem
): Promise<void> {
  const getColUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/JadwalKalender!A2:A`;
  const res = await fetch(getColUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) return;

  const data = await res.json();
  const rows = data.values || [];
  let rowIndex = -1;

  for (let i = 0; i < rows.length; i++) {
    if (String(rows[i][0]) === String(item.id)) {
      rowIndex = i + 2;
      break;
    }
  }

  const row = [
    item.id,
    item.date,
    item.activityType,
    item.target,
    item.notes || '',
    item.status,
    item.createdAt || '',
    item.completedAt || '',
  ];

  if (rowIndex > 0) {
    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/JadwalKalender!A${rowIndex}:H${rowIndex}?valueInputOption=USER_ENTERED`;
    await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [row] }),
    });
  } else {
    await appendScheduleToSheet(accessToken, spreadsheetId, item);
  }
}

/**
 * Incrementally delete a schedule item from Google Sheets
 */
export async function deleteScheduleFromSheet(
  accessToken: string,
  spreadsheetId: string,
  itemId: string
): Promise<void> {
  const getColUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/JadwalKalender!A2:A`;
  const res = await fetch(getColUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) return;

  const data = await res.json();
  const rows = data.values || [];
  let rowIndex = -1;

  for (let i = 0; i < rows.length; i++) {
    if (String(rows[i][0]) === String(itemId)) {
      rowIndex = i + 2;
      break;
    }
  }

  if (rowIndex > 0) {
    const clearUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/JadwalKalender!A${rowIndex}:H${rowIndex}:clear`;
    await fetch(clearUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }
}
