import React from 'react';
import { Smartphone, Download, X, Share2, PlusSquare, CheckCircle2, ArrowRight } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Header with Rose-Pink Gradient Banner */}
        <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-pink-800 p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3.5">
            {/* App Icon Preview with Home Screen rounded badge styling */}
            <div className="relative">
              <img
                src="/pwa-192x192.png"
                alt="Logo HafalanKu"
                className="w-16 h-16 rounded-2xl shadow-lg border-2 border-pink-300/40 object-cover"
              />
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 border-2 border-white"></span>
              </span>
            </div>

            <div>
              <span className="px-2 py-0.5 rounded-full bg-rose-950/60 text-[10px] font-bold text-amber-300 border border-pink-400/30">
                PWA Siap Pasang
              </span>
              <h2 className="text-lg font-bold text-white mt-1 leading-tight font-display">
                Tambahkan ke Layar Utama HP
              </h2>
              <p className="text-xs text-rose-100/90 mt-0.5">
                Buka HafalanKu seperti aplikasi asli
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Status jika sudah terpasang */}
          {isInstalled && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                <strong>Aplikasi telah terpasang!</strong> Anda sedang menggunakan HafalanKu langsung dari layar utama.
              </span>
            </div>
          )}

          {/* Direct Install Button (Chrome / Android / Chromium) */}
          {isInstallable && (
            <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-2xl text-center space-y-2.5">
              <p className="text-xs font-medium text-rose-950">
                Perangkat Anda mendukung instalasi cepat 1-klik:
              </p>
              <button
                onClick={handleInstallClick}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 active:scale-98 text-white font-bold text-sm shadow-md shadow-rose-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Pasang Aplikasi Sekarang</span>
              </button>
            </div>
          )}

          {/* Panduan Langkah Tambah ke Layar Utama HP */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {isIOS ? 'Cara Pasang di iPhone / iPad (Safari)' : 'Cara Pasang di HP (Android & Browser)'}
            </h3>

            {isIOS ? (
              /* Panduan iOS */
              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                  <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </div>
                  <div className="text-xs text-slate-700">
                    Ketuk tombol <strong>Bagikan (Share)</strong>{' '}
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                      <Share2 className="w-3 h-3 inline mr-1" /> Ikon Kotak & Panah
                    </span>{' '}
                    di baris bawah browser Safari.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                  <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </div>
                  <div className="text-xs text-slate-700">
                    Gulir ke bawah pada menu, lalu pilih{' '}
                    <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong>{' '}
                    <PlusSquare className="w-3.5 h-3.5 inline text-slate-600" />.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                    3
                  </div>
                  <div className="text-xs text-slate-700">
                    Ketuk <strong>"Tambah" (Add)</strong> di pojok kanan atas. Logo <strong>HafalanKu</strong> akan langsung muncul di beranda HP Anda!
                  </div>
                </div>
              </div>
            ) : (
              /* Panduan Android / Chrome */
              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </div>
                  <div className="text-xs text-slate-700">
                    Buka menu browser dengan mengetuk <strong>titik tiga (⋮)</strong> di sudut kanan atas layar Chrome atau browser Anda.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </div>
                  <div className="text-xs text-slate-700">
                    Pilih opsi <strong>"Tambahkan ke Layar Utama"</strong> atau <strong>"Install Aplikasi"</strong> (Add to Home Screen).
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                    3
                  </div>
                  <div className="text-xs text-slate-700">
                    Konfirmasi dengan menekan <strong>"Pasang" / "Tambah"</strong>. Logo resmi <strong>HafalanKu</strong> siap dibuka kapan pun dari layar utama tanpa membuka tab browser lagi!
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Keunggulan PWA */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">
              Keuntungan Pasang di HP:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Layar penuh (tanpa bar URL)</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Akses kilat dari beranda</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Hemat kuota &amp; ringan</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Tersimpan di memori lokal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 active:scale-95 text-xs font-bold text-slate-700 transition cursor-pointer"
          >
            Mengerti &amp; Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
