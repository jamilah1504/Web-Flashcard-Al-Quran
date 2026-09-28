/**
 * =========================================================================
 * BACKEND GOOGLE APPS SCRIPT: HAFALANKU & TRACKER AL-QUR'AN
 * =========================================================================
 * Dokumentasi & Petunjuk Pemasangan:
 *
 * 1. Buka Google Spreadsheet baru: https://sheets.new
 * 2. Beri nama file, misal: "Database HafalanKu & Tracker Al-Qur'an"
 * 3. Buka menu: Ekstensi (Extensions) > Apps Script
 * 4. Ganti isi file Code.gs dengan seluruh isi kode ini.
 * 5. Simpan (Save / Ctrl+S atau klik ikon disket).
 * 6. Klik tombol "Deploy" (Terapkan) berwarna biru di kanan atas > "New deployment" (Penerapan baru).
 * 7. Klik ikon gerigi (Select type) > pilih "Web app" (Aplikasi Web).
 * 8. Isi konfigurasi:
 *    - Description: HafalanKu Web App API
 *    - Execute as: "Me" (Saya / akun Google Anda)
 *    - Who has access: "Anyone" (Siapa saja)  <-- WAJIB PILIH INI agar frontend bisa fetch!
 * 9. Klik "Deploy", lalu klik "Authorize access" dan pilih akun Google Anda.
 *    (Jika ada peringatan "Google hasn't verified this app", klik "Advanced" > "Go to ... (unsafe)").
 * 10. Salin "Web app URL" (format: https://script.google.com/macros/s/XXXXX/exec).
 * 11. Buka aplikasi web HafalanKu, klik tombol "Google Sheets" di header,
 *     lalu tempelkan URL tersebut dan klik "Simpan & Sinkronkan"!
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
      var statusSheet = ss.getSheetByName("StatusHafalan");
      var s = data;
      var dataRange = statusSheet.getDataRange().getValues();
      var foundIndex = -1;
      for (var r = 1; r < dataRange.length; r++) {
        if (String(dataRange[r][0]) === String(s.ayahNumber)) {
          foundIndex = r + 1;
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
        message: "Status ayat berhasil disimpan ke Google Sheets!"
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
        message: "Status jadwal berhasil diperbarui di Google Sheets!"
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

    // 1. Ambil data status
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

    // 2. Ambil data jadwal
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
