import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  X,
  ExternalLink,
  MessageCircle,
  Send,
  Eye,
  Sparkles,
} from 'lucide-react';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://hafalanku.app';
  const shareTitle = "HafalanKu – Al-Qur'an Hafalan & Belajar Interaktif";
  const shareText =
    "Yuk belajar dan hafalkan Al-Qur'an dengan aplikasi HafalanKu! Ada Flashcard tebak ayat, panduan tajwid berwarna, audio murottal, dan sinkronisasi Google Sheets: ";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: currentUrl,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    shareText + '\n' + currentUrl
  )}`;

  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(
    currentUrl
  )}&text=${encodeURIComponent(shareText)}`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}&url=${encodeURIComponent(currentUrl)}`;

  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    currentUrl
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-pink-800 p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center text-amber-300">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight font-display">
                Bagikan Tautan &amp; Pratinjau Cover
              </h2>
              <p className="text-xs text-rose-100/90 mt-0.5">
                Pratinjau visual banner saat link dibagikan ke media sosial
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Live Cover Card Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                Pratinjau Cover Social Share (OpenGraph)
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                1200 x 630 px
              </span>
            </div>

            {/* Social Link Card Mockup */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-slate-50 transition hover:shadow-md">
              <div className="relative aspect-[1200/630] w-full bg-emerald-950 overflow-hidden">
                <img
                  src="/og-cover.png"
                  alt="Cover Banner HafalanKu"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-[10px] text-white font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Banner Resmi
                </div>
              </div>

              <div className="p-3 bg-white space-y-1">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 truncate">
                  {typeof window !== 'undefined' ? window.location.hostname : 'hafalanku.app'}
                </div>
                <h4 className="font-bold text-slate-800 text-sm leading-snug line-clamp-1">
                  HafalanKu – Al-Qur'an Hafalan &amp; Belajar Interaktif
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2">
                  Aplikasi Al-Qur'an Hafalan &amp; Belajar interaktif ramah pemula: Flashcard tebak ayat, mode Mushaf digital, panduan tajwid berwarna, audio murottal, dan sinkronisasi Google Sheets.
                </p>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 italic text-center">
              *Tampilan di atas otomatis muncul saat Anda mengirimkan link ke WhatsApp, Telegram, Facebook, Twitter/X, dsb.
            </p>
          </div>

          {/* Salin Tautan Cepat */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Tautan Aplikasi
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-mono truncate focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={handleCopyLink}
                className={`h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition active:scale-95 cursor-pointer ${
                  copied
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin'}</span>
              </button>
            </div>
          </div>

          {/* Tombol Bagikan Langsung */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Kirim Langsung Ke
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100/90 text-emerald-800 border border-emerald-200 flex flex-col items-center justify-center gap-1 text-xs font-bold transition active:scale-95"
              >
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                <span>WhatsApp</span>
              </a>

              {/* Telegram */}
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-2xl bg-sky-50 hover:bg-sky-100/90 text-sky-800 border border-sky-200 flex flex-col items-center justify-center gap-1 text-xs font-bold transition active:scale-95"
              >
                <Send className="w-5 h-5 text-sky-600" />
                <span>Telegram</span>
              </a>

              {/* Twitter / X */}
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 flex flex-col items-center justify-center gap-1 text-xs font-bold transition active:scale-95"
              >
                <span className="text-base font-bold leading-none">𝕏</span>
                <span>Twitter / X</span>
              </a>

              {/* Facebook */}
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-2xl bg-blue-50 hover:bg-blue-100/90 text-blue-800 border border-blue-200 flex flex-col items-center justify-center gap-1 text-xs font-bold transition active:scale-95"
              >
                <ExternalLink className="w-5 h-5 text-blue-600" />
                <span>Facebook</span>
              </a>
            </div>

            {/* Native Mobile Share Button */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 active:scale-98 text-white font-bold text-xs shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Buka Menu Bagikan HP (Semua Aplikasi)</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 active:scale-95 text-xs font-bold text-slate-700 transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
