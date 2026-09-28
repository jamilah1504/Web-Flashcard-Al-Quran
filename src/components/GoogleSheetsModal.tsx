import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  FileSpreadsheet,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Database,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import {
  getScriptUrl,
  saveScriptUrl,
  isRealScriptConfigured,
  GOOGLE_APPS_SCRIPT_CODE,
  DEFAULT_SCRIPT_URL,
} from '../services/googleSheetService';
import { ThemeConfig } from '../utils/themeHelper';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeConfig: ThemeConfig;
  lastSyncedAt: string | null;
  onTriggerSync: () => Promise<void>;
  isSyncing: boolean;
  syncMessage: string | null;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  themeConfig,
  lastSyncedAt,
  onTriggerSync,
  isSyncing,
  syncMessage,
}) => {
  const [urlInput, setUrlInput] = useState<string>(() => {
    const u = getScriptUrl();
    return u === DEFAULT_SCRIPT_URL ? '' : u;
  });
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [showCodePreview, setShowCodePreview] = useState<boolean>(false);

  if (!isOpen) return null;

  const isConfigured = isRealScriptConfigured();

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  const handleSaveUrl = () => {
    const trimmed = urlInput.trim();
    saveScriptUrl(trimmed);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-900/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6"
        >
          {/* Header Banner */}
          <div className={`p-4 sm:p-5 bg-gradient-to-r ${themeConfig.accentGradient} text-white flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold font-display tracking-tight flex items-center gap-2">
                  Integrasi Google Sheets API
                  <span className="text-[11px] font-semibold bg-white/25 px-2 py-0.5 rounded-full text-white">
                    Cloud Storage
                  </span>
                </h3>
                <p className="text-xs text-white/90">
                  Sinkronisasi Status Hafalan & Kalender Muroja'ah ke Spreadsheet Anda
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/15 hover:bg-white/30 text-white transition-colors"
              aria-label="Tutup modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Status Card */}
            <div className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
              isConfigured
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                : 'bg-amber-50/80 border-amber-200 text-amber-950'
            }`}>
              <div className="flex items-start gap-3">
                {isConfigured ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm">
                      {isConfigured ? 'Google Sheets Terhubung' : 'Mode Penyimpanan Lokal (Siap Digunakan)'}
                    </span>
                    {lastSyncedAt && (
                      <span className="text-[10px] text-slate-500 font-medium">
                        Terakhir sinkron: {new Date(lastSyncedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-slate-600 leading-relaxed">
                    {isConfigured
                      ? 'Semua perubahan aksi user (Status ayat & jadwal kalender) otomatis dikirim dan dicadangkan ke Google Spreadsheet Anda.'
                      : 'Data Anda saat ini aman tersimpan di browser (localStorage). Untuk menghubungkan ke Google Sheets pribadi Anda secara gratis tanpa server, ikuti panduan singkat di bawah ini.'}
                  </p>
                </div>
              </div>
            </div>

            {/* URL Input Form */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                URL Web App Google Apps Script:
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                  className="flex-1 px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={handleSaveUrl}
                  className={`px-4 py-2.5 rounded-2xl font-semibold text-xs transition-all shadow-xs shrink-0 ${themeConfig.primaryButton}`}
                >
                  {saveSuccess ? 'Tersimpan ✓' : 'Simpan URL'}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <span>Default disimulasikan dengan variabel</span>
                <code className="bg-slate-100 px-1 py-0.5 rounded-sm text-pink-700 font-mono text-[10px]">
                  SCRIPT_URL
                </code>
              </p>
            </div>

            {/* Quick Sync Button */}
            <div className="flex items-center justify-between pt-1">
              <div className="text-xs text-slate-500">
                {syncMessage && (
                  <span className="text-emerald-700 font-medium">{syncMessage}</span>
                )}
              </div>
              <button
                type="button"
                onClick={onTriggerSync}
                disabled={isSyncing}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-pink-600' : ''}`} />
                <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
              </button>
            </div>

            {/* Step-by-Step Easy Guide */}
            <div className="pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-3">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Cara Menghubungkan Google Sheets (Hanya 2 Menit):
              </h4>

              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                    1
                  </span>
                  <div>
                    <p className="font-semibold text-slate-800">Buat Spreadsheet Baru</p>
                    <p className="text-slate-500 mt-0.5">
                      Buka Google Sheets di{' '}
                      <a
                        href="https://sheets.new"
                        target="_blank"
                        rel="noreferrer"
                        className="text-pink-600 underline font-medium inline-flex items-center gap-0.5"
                      >
                        sheets.new <ExternalLink className="w-3 h-3 inline" />
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                    2
                  </span>
                  <div>
                    <p className="font-semibold text-slate-800">Buka Menu Apps Script</p>
                    <p className="text-slate-500 mt-0.5">
                      Di Google Sheets, klik menu <strong>Ekstensi (Extensions)</strong> &gt; <strong>Apps Script</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                    3
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">Salin & Tempel Kode Backend (Code.gs)</p>
                    <p className="text-slate-500 mt-0.5">
                      Hapus teks lama di file <code>Code.gs</code> lalu tempel kode berikut:
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 font-semibold text-xs transition-colors"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Kode Berhasil Disalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin Kode Backend Apps Script</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCodePreview(!showCodePreview)}
                        className="text-[11px] text-slate-500 hover:text-slate-800 underline"
                      >
                        {showCodePreview ? 'Sembunyikan Kode' : 'Lihat Kode'}
                      </button>
                    </div>

                    {showCodePreview && (
                      <pre className="mt-2 p-3 bg-slate-900 text-emerald-300 rounded-xl text-[10px] font-mono max-h-48 overflow-y-auto">
                        {GOOGLE_APPS_SCRIPT_CODE}
                      </pre>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                    4
                  </span>
                  <div>
                    <p className="font-semibold text-slate-800">Deploy sebagai Aplikasi Web (Web App)</p>
                    <p className="text-slate-500 mt-0.5">
                      Klik tombol <strong>Deploy (Terapkan)</strong> di kanan atas &gt; <strong>New deployment (Penerapan baru)</strong> &gt; pilih ikon gerigi <strong>Web app</strong>. Atur "Who has access" ke <strong>Anyone (Siapa saja)</strong>, lalu Deploy dan salin link URL-nya.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                    5
                  </span>
                  <div>
                    <p className="font-semibold text-slate-800">Tempelkan URL di Atas</p>
                    <p className="text-slate-500 mt-0.5">
                      Tempel URL yang didapat pada kolom input di atas, lalu klik "Simpan URL". Selesai!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Aman & privasi terjamin di Google Drive pribadi Anda</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs transition-colors"
            >
              Tutup
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
