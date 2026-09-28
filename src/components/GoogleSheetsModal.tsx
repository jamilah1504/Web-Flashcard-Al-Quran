import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  FileSpreadsheet,
  Check,
  ExternalLink,
  RefreshCw,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Database,
  ArrowRight,
  ShieldCheck,
  LogOut,
  FolderOpen,
  Plus,
  Cloud,
  ChevronDown,
  ChevronRight,
  Layers,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  googleSignIn,
  logout,
  getAccessToken,
  initAuth,
} from '../services/firebaseAuth';
import {
  listUserSpreadsheets,
  createQuranSpreadsheet,
  getConnectedSpreadsheetId,
  setConnectedSpreadsheet,
  getConnectedSpreadsheetTitle,
  isAutoSyncEnabled,
  setAutoSyncEnabled,
  SpreadsheetFile,
} from '../services/googleSheetsApi';
import {
  getScriptUrl,
  saveScriptUrl,
  isRealScriptConfigured,
  GOOGLE_APPS_SCRIPT_CODE,
  DEFAULT_SCRIPT_URL,
} from '../services/googleSheetService';
import { ThemeConfig } from '../utils/themeHelper';
import { AyahStatusMap, ScheduleItem, AyahUserStatus } from '../types';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeConfig: ThemeConfig;
  lastSyncedAt: string | null;
  onTriggerSync: (spreadsheetId?: string) => Promise<void>;
  onTriggerLoad?: (spreadsheetId: string) => Promise<void>;
  isSyncing: boolean;
  syncMessage: string | null;
  statusMap: AyahStatusMap;
  schedules: ScheduleItem[];
  dailyTarget: number;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  themeConfig,
  lastSyncedAt,
  onTriggerSync,
  onTriggerLoad,
  isSyncing,
  syncMessage,
  statusMap,
  schedules,
  dailyTarget,
}) => {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Spreadsheet state
  const [connectedId, setConnectedId] = useState<string | null>(() => getConnectedSpreadsheetId());
  const [connectedTitle, setConnectedTitle] = useState<string>(() => getConnectedSpreadsheetTitle());
  const [driveSheets, setDriveSheets] = useState<SpreadsheetFile[]>([]);
  const [isLoadingSheets, setIsLoadingSheets] = useState<boolean>(false);
  const [isCreatingSheet, setIsCreatingSheet] = useState<boolean>(false);
  const [showDriveList, setShowDriveList] = useState<boolean>(false);
  const [manualSheetInput, setManualSheetInput] = useState<string>('');
  const [autoSync, setAutoSync] = useState<boolean>(() => isAutoSyncEnabled());

  // Apps Script alternative tab
  const [showAppsScriptOption, setShowAppsScriptOption] = useState<boolean>(false);
  const [urlInput, setUrlInput] = useState<string>(() => {
    const u = getScriptUrl();
    return u === DEFAULT_SCRIPT_URL ? '' : u;
  });
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Mandatory confirmation dialog state for mutating / overwrite actions
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionType: 'SYNC' | 'LOAD' | 'DISCONNECT';
    targetId?: string;
  } | null>(null);

  // Init auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setCurrentUser(user);
        setAuthError(null);
      },
      () => {
        setCurrentUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch user spreadsheets when logged in
  useEffect(() => {
    if (currentUser && isOpen) {
      loadDriveSpreadsheets();
    }
  }, [currentUser, isOpen]);

  const loadDriveSpreadsheets = async () => {
    const token = await getAccessToken();
    if (!token) return;
    setIsLoadingSheets(true);
    try {
      const list = await listUserSpreadsheets(token);
      setDriveSheets(list);
    } catch (err: any) {
      console.warn('Failed to load drive sheets:', err);
    } finally {
      setIsLoadingSheets(false);
    }
  };

  if (!isOpen) return null;

  const allStatuses = Object.values(statusMap) as AyahUserStatus[];
  const memorizedCount = allStatuses.filter((s) => s.isMemorized).length;
  const learningCount = allStatuses.filter((s) => s.isLearning).length;
  const favoriteCount = allStatuses.filter((s) => s.isFavorite).length;

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res?.user) {
        setCurrentUser(res.user);
        // Load sheets immediately
        const list = await listUserSpreadsheets(res.accessToken);
        setDriveSheets(list);
      }
    } catch (err: any) {
      console.error('Sign in failed:', err);
      setAuthError(err?.message || 'Gagal masuk dengan Google. Pastikan popup tidak diblokir.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setCurrentUser(null);
    setConnectedSpreadsheet(null);
    setConnectedId(null);
  };

  const handleCreateNewSheet = async () => {
    const token = await getAccessToken();
    if (!token) {
      setAuthError('Silakan masuk dengan Google terlebih dahulu.');
      return;
    }

    setIsCreatingSheet(true);
    setAuthError(null);
    try {
      const newSheet = await createQuranSpreadsheet(
        token,
        `HafalanKu - Database & Tracker Al-Qur'an (${new Date().toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })})`
      );

      setConnectedSpreadsheet(newSheet.id, newSheet.title);
      setConnectedId(newSheet.id);
      setConnectedTitle(newSheet.title);

      // Now sync initial data to newly created sheet
      await onTriggerSync(newSheet.id);
      await loadDriveSpreadsheets();
    } catch (err: any) {
      console.error('Create sheet failed:', err);
      setAuthError(err?.message || 'Gagal membuat spreadsheet baru di Google Drive.');
    } finally {
      setIsCreatingSheet(false);
    }
  };

  const handleSelectSheet = (sheet: SpreadsheetFile) => {
    setConnectedSpreadsheet(sheet.id, sheet.name);
    setConnectedId(sheet.id);
    setConnectedTitle(sheet.name);
    setShowDriveList(false);
  };

  const handleManualSheetSubmit = () => {
    let raw = manualSheetInput.trim();
    if (!raw) return;

    // Extract ID if full URL was pasted
    const match = raw.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    const id = match ? match[1] : raw;

    setConnectedSpreadsheet(id, `Spreadsheet (${id.substring(0, 8)}...)`);
    setConnectedId(id);
    setConnectedTitle(`Spreadsheet (${id.substring(0, 8)}...)`);
    setManualSheetInput('');
    setShowDriveList(false);
  };

  const handleToggleAutoSync = (enabled: boolean) => {
    setAutoSync(enabled);
    setAutoSyncEnabled(enabled);
  };

  // Execution after confirmation
  const handleExecuteConfirmedAction = async () => {
    if (!confirmDialog) return;
    const { actionType, targetId } = confirmDialog;
    setConfirmDialog(null);

    const sheetId = targetId || connectedId || undefined;

    if (actionType === 'SYNC') {
      await onTriggerSync(sheetId);
    } else if (actionType === 'LOAD' && onTriggerLoad && sheetId) {
      await onTriggerLoad(sheetId);
    } else if (actionType === 'DISCONNECT') {
      setConnectedSpreadsheet(null);
      setConnectedId(null);
    }
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
          <div
            className={`p-4 sm:p-5 bg-gradient-to-r ${themeConfig.accentGradient} text-white flex items-center justify-between`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold font-display tracking-tight flex items-center gap-2">
                  Integrasi Google Sheets & Drive
                  <span className="text-[11px] font-semibold bg-white/25 px-2 py-0.5 rounded-full text-white">
                    Cloud Storage
                  </span>
                </h3>
                <p className="text-xs text-white/90">
                  Sinkronkan hafalan dan jadwal Al-Qur'an langsung ke akun Google Anda
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/15 hover:bg-white/30 text-white transition-colors cursor-pointer"
              aria-label="Tutup modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Auth Notification or Error */}
            {authError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="flex-1">{authError}</span>
                <button
                  onClick={() => setAuthError(null)}
                  className="text-rose-500 hover:text-rose-700 font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* SECTION 1: Google Account Status */}
            <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {currentUser ? (
                    <>
                      {currentUser.photoURL ? (
                        <img
                          src={currentUser.photoURL}
                          alt={currentUser.displayName || 'Google User'}
                          className="w-10 h-10 rounded-full border-2 border-emerald-400 shadow-xs object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
                          {currentUser.displayName?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-800">
                            {currentUser.displayName || 'Pengguna Google'}
                          </span>
                          <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Terhubung
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                      </div>
                    </>
                  ) : (
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Akun Google Workspace</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Hubungkan akun Google untuk membaca & menulis spreadsheet di Google Drive
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  {currentUser ? (
                    <button
                      onClick={handleSignOut}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-slate-500" />
                      <span>Keluar</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleSignIn}
                      disabled={isAuthenticating}
                      className="gsi-material-button w-full sm:w-auto shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50"
                    >
                      <div className="gsi-material-button-content-wrapper">
                        <div className="gsi-material-button-icon">
                          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                            <path
                              fill="#EA4335"
                              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                            />
                            <path
                              fill="#4285F4"
                              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                            />
                            <path
                              fill="#34A853"
                              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                            />
                          </svg>
                        </div>
                        <span className="gsi-material-button-contents">
                          {isAuthenticating ? 'Menghubungkan...' : 'Sign in with Google'}
                        </span>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 2: Active Connected Spreadsheet Status */}
            {currentUser && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-pink-600" />
                    Target Google Spreadsheet:
                  </h4>
                  {connectedId && (
                    <button
                      onClick={() =>
                        setConfirmDialog({
                          isOpen: true,
                          title: 'Lepaskan Spreadsheet',
                          description:
                            'Apakah Anda yakin ingin melepaskan tautan spreadsheet ini? Data Anda di aplikasi dan di Google Sheets tetap aman.',
                          actionType: 'DISCONNECT',
                        })
                      }
                      className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      Ganti Spreadsheet
                    </button>
                  )}
                </div>

                {connectedId ? (
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <FileSpreadsheet className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800">{connectedTitle}</span>
                            <span className="text-[10px] font-semibold bg-emerald-200/80 text-emerald-900 px-1.5 py-0.2 rounded-md">
                              Aktif
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                            ID: {connectedId.substring(0, 16)}...
                          </p>
                          {lastSyncedAt && (
                            <p className="text-[10px] text-emerald-700 font-medium mt-1">
                              Terakhir sinkron:{' '}
                              {new Date(lastSyncedAt).toLocaleString('id-ID', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })}
                            </p>
                          )}
                        </div>
                      </div>

                      <a
                        href={`https://docs.google.com/spreadsheets/d/${connectedId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-2xs"
                      >
                        <span>Buka Spreadsheet</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p className="font-bold">Belum ada Spreadsheet yang ditautkan</p>
                        <p className="text-slate-600 mt-0.5">
                          Anda dapat membuat spreadsheet baru otomatis dalam 1 klik, atau memilih
                          spreadsheet yang sudah ada di Google Drive Anda.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={handleCreateNewSheet}
                        disabled={isCreatingSheet}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white shadow-xs cursor-pointer ${themeConfig.primaryButton} disabled:opacity-50`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isCreatingSheet ? 'Membuat Spreadsheet...' : '✨ Buat Spreadsheet Otomatis'}</span>
                      </button>

                      <button
                        onClick={() => setShowDriveList(!showDriveList)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
                        <span>Pilih dari Google Drive</span>
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Drive Spreadsheets Picker Dropdown / Modal */}
                {showDriveList && (
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Cloud className="w-3.5 h-3.5 text-blue-500" />
                        File Spreadsheet di Google Drive Anda:
                      </span>
                      <button
                        onClick={loadDriveSpreadsheets}
                        className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1"
                      >
                        <RefreshCw className={`w-3 h-3 ${isLoadingSheets ? 'animate-spin' : ''}`} />
                        <span>Segarkan</span>
                      </button>
                    </div>

                    {isLoadingSheets ? (
                      <div className="py-6 text-center text-xs text-slate-500">
                        Memuat daftar spreadsheet dari Google Drive...
                      </div>
                    ) : driveSheets.length > 0 ? (
                      <div className="max-h-48 overflow-y-auto space-y-1.5">
                        {driveSheets.map((sheet) => (
                          <div
                            key={sheet.id}
                            onClick={() => handleSelectSheet(sheet)}
                            className="p-2.5 rounded-xl hover:bg-pink-50 border border-slate-100 hover:border-pink-200 flex items-center justify-between gap-2 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span className="text-xs font-medium text-slate-800 truncate">
                                {sheet.name}
                              </span>
                            </div>
                            <span className="text-[10px] text-pink-600 font-semibold shrink-0">
                              Pilih
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-3 text-center text-xs text-slate-400">
                        Tidak ada spreadsheet yang ditemukan di Drive.
                      </div>
                    )}

                    {/* Manual input ID */}
                    <div className="pt-2 border-t border-slate-100">
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Atau tempel Link / ID Spreadsheet:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={manualSheetInput}
                          onChange={(e) => setManualSheetInput(e.target.value)}
                          placeholder="https://docs.google.com/spreadsheets/d/XXXXX..."
                          className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-pink-400"
                        />
                        <button
                          onClick={handleManualSheetSubmit}
                          className="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
                        >
                          Pakai
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SECTION 3: Sync Actions & Stats Summary */}
            {currentUser && connectedId && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800">
                    Operasi Sinkronisasi Data
                  </h4>
                  {syncMessage && (
                    <span className="text-[11px] font-semibold text-emerald-700 animate-pulse">
                      {syncMessage}
                    </span>
                  )}
                </div>

                {/* Data to be synced summary */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                    <p className="text-[10px] text-emerald-800 font-medium">Sudah Hafal</p>
                    <p className="text-base font-bold text-emerald-950 mt-0.5">{memorizedCount}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100">
                    <p className="text-[10px] text-amber-800 font-medium">Sedang Dihafal</p>
                    <p className="text-base font-bold text-amber-950 mt-0.5">{learningCount}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                    <p className="text-[10px] text-blue-800 font-medium">Agenda Jadwal</p>
                    <p className="text-base font-bold text-blue-950 mt-0.5">{schedules.length}</p>
                  </div>
                </div>

                {/* Actions: Export to Sheet & Import from Sheet */}
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  {/* Export Button */}
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmDialog({
                        isOpen: true,
                        title: 'Sinkronkan & Cadangkan ke Google Sheets',
                        description: `Aplikasi akan memperbarui ${
                          Object.keys(statusMap).length
                        } status ayat dan ${
                          schedules.length
                        } agenda ke spreadsheet "${connectedTitle}". Apakah Anda ingin melanjutkan?`,
                        actionType: 'SYNC',
                      })
                    }
                    disabled={isSyncing}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs text-white shadow-xs transition-all cursor-pointer ${themeConfig.primaryButton} disabled:opacity-50`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>
                      {isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang ke Google Sheets'}
                    </span>
                  </button>

                  {/* Import Button */}
                  {onTriggerLoad && (
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmDialog({
                          isOpen: true,
                          title: 'Muat & Pulihkan dari Google Sheets',
                          description: `Data status hafalan dan jadwal di aplikasi ini akan diperbarui sesuai isi spreadsheet "${connectedTitle}". Apakah Anda ingin melanjutkan?`,
                          actionType: 'LOAD',
                        })
                      }
                      disabled={isSyncing}
                      className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Impor dari Sheets
                    </button>
                  )}
                </div>

                {/* Auto Sync Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      Sinkronisasi Otomatis di Latar Belakang
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Otomatis perbarui spreadsheet saat Anda menandai ayat atau membuat jadwal baru
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSync}
                      onChange={(e) => handleToggleAutoSync(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-600"></div>
                  </label>
                </div>
              </div>
            )}

            {/* SECTION 4: Apps Script / Webhook Option (Alternative) */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAppsScriptOption(!showAppsScriptOption)}
                className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-slate-900 py-1"
              >
                <span>Pilihan Lain: Hubungkan via Google Apps Script Webhook</span>
                {showAppsScriptOption ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {showAppsScriptOption && (
                <div className="mt-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Jika Anda lebih memilih menggunakan Google Apps Script Web App tanpa OAuth
                    login langsung, masukkan URL Web App yang telah dideploy di bawah:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                      className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                    />
                    <button
                      onClick={() => {
                        saveScriptUrl(urlInput.trim());
                        setSaveSuccess(true);
                        setTimeout(() => setSaveSuccess(false), 2500);
                      }}
                      className="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      {saveSuccess ? 'Tersimpan ✓' : 'Simpan'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Aman & privasi terjamin di Google Drive akun pribadi Anda</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>

          {/* MANDATORY USER CONFIRMATION DIALOG (For Destructive/Mutating Operations) */}
          {confirmDialog && confirmDialog.isOpen && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-5 border border-slate-100 space-y-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{confirmDialog.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {confirmDialog.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setConfirmDialog(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteConfirmedAction}
                    className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                  >
                    Ya, Lanjutkan
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
