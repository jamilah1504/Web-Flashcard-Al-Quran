import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';
import { TAJWEED_LEGEND } from '../utils/tajweedHelper';
import { ThemeConfig } from '../utils/themeHelper';

interface TajweedModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeConfig: ThemeConfig;
  highlightRule?: string | null;
}

export const TajweedModal: React.FC<TajweedModalProps> = ({
  isOpen,
  onClose,
  themeConfig,
  highlightRule,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-slate-100 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div
              className={`p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r ${themeConfig.accentGradient} text-white flex items-center justify-between`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base sm:text-lg leading-tight">
                    Panduan & Penjelasan Tajwid Berwarna
                  </h3>
                  <p className="text-xs text-white/85">
                    Panduan pelafalan dan durasi bacaan huruf Al-Qur'an bagi pemula
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 divide-y divide-slate-100">
              <div className="bg-amber-50/80 rounded-2xl p-3.5 border border-amber-200/80 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5 shadow-2xs">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Setiap warna pada huruf Arab melambangkan hukum tajwid tertentu. Ketuk atau arahkan kursor ke huruf untuk melihat instruksi cara membaca dan durasi ketukannya.
                </span>
              </div>

              <div className="pt-2 space-y-3.5">
                {TAJWEED_LEGEND.map((rule) => {
                  const isHighlighted =
                    highlightRule &&
                    rule.name.toLowerCase().includes(highlightRule.toLowerCase());
                  return (
                    <div
                      key={rule.id}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                        isHighlighted
                          ? 'border-amber-400 bg-amber-50/70 shadow-md ring-2 ring-amber-300'
                          : `${rule.bgColorClass} ${rule.borderColorClass}`
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full inline-block shrink-0 shadow-xs"
                            style={{ backgroundColor: rule.colorHex }}
                          />
                          <span className={`text-sm font-bold ${rule.textColorClass}`}>
                            {rule.name}
                          </span>
                        </div>
                        <span className="font-arabic text-base font-bold text-slate-700">
                          {rule.arabicName}
                        </span>
                      </div>

                      {/* Cara Membaca */}
                      <div className="p-2.5 rounded-xl bg-white/90 border border-slate-200/70 mb-2">
                        <span className="text-[11px] font-bold text-slate-900 block mb-0.5">
                          📖 Cara Membacanya:
                        </span>
                        <p className="text-xs text-slate-700 font-medium leading-relaxed">
                          {rule.howToRead}
                        </p>
                      </div>

                      {/* Detail Chips */}
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 mb-2">
                        <span className="px-2 py-0.5 rounded-lg bg-white/80 border border-slate-200/70 font-semibold text-slate-700">
                          ⏱️ Durasi: {rule.duration}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-white/80 border border-slate-200/70">
                          Huruf: <strong className="font-arabic">{rule.letters}</strong>
                        </span>
                      </div>

                      {/* Contoh */}
                      <div className="flex items-center justify-between text-xs bg-white/80 rounded-xl px-3 py-1.5 border border-slate-200/60">
                        <span className="text-[11px] font-medium text-slate-500">Contoh Lafal:</span>
                        <span className="font-arabic text-sm text-slate-900 font-bold" dir="rtl">
                          {rule.example}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Fitur warna tajwid dapat diaktifkan/dinonaktifkan kapan saja
              </span>
              <button
                onClick={onClose}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r ${themeConfig.accentGradient} shadow-sm hover:opacity-95 transition-opacity`}
              >
                Paham & Tutup
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
