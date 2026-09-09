import React from 'react';
import { X, Layers, CheckCircle2, Circle, Sparkles, BookOpen } from 'lucide-react';
import { Ayah } from '../types';

interface VerseGridModalProps {
  isOpen: boolean;
  onClose: () => void;
  ayahs: Ayah[];
  currentIndex: number;
  onSelectAyah: (index: number) => void;
  memorizedMap: Record<number, boolean>;
  currentPage: number;
}

export const VerseGridModal: React.FC<VerseGridModalProps> = ({
  isOpen,
  onClose,
  ayahs,
  currentIndex,
  onSelectAyah,
  memorizedMap,
  currentPage,
}) => {
  if (!isOpen) return null;

  const memorizedCount = ayahs.filter((a) => memorizedMap[a.number]).length;
  const isAllMastered = ayahs.length > 0 && memorizedCount === ayahs.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-pink-100 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-rose-50 via-pink-50 to-purple-50 border-b border-pink-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-purple-100 text-purple-700">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-slate-800 text-base sm:text-lg">
                Daftar Ayat Halaman {currentPage}
              </h2>
              <p className="text-xs text-rose-500 font-medium">
                {memorizedCount} dari {ayahs.length} ayat sudah dihafal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Celebration Banner if all mastered */}
        {isAllMastered && (
          <div className="mx-4 mt-4 p-3 rounded-2xl bg-gradient-to-r from-pink-100 via-rose-100 to-amber-100 border border-pink-200 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-pink-600 shrink-0 fill-pink-300" />
            <div>
              <p className="text-xs font-bold text-pink-900">
                Alhamdulillah! Semua ayat di halaman ini sudah kamu hafal! 🎉
              </p>
              <p className="text-[11px] text-pink-700">
                Pertahankan hafalanmu dengan terus memuraja'ah secara berkala.
              </p>
            </div>
          </div>
        )}

        {/* List of Ayahs on this Page */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2 max-h-[420px]">
          {ayahs.map((a, idx) => {
            const isCurrent = idx === currentIndex;
            const isDone = !!memorizedMap[a.number];

            return (
              <button
                key={a.number}
                onClick={() => {
                  onSelectAyah(idx);
                  onClose();
                }}
                className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] ${
                  isCurrent
                    ? 'bg-pink-100/90 border-pink-300 ring-2 ring-pink-200'
                    : isDone
                    ? 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100/60'
                    : 'bg-white hover:bg-pink-50/40 border-pink-100'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      isDone
                        ? 'bg-emerald-200 text-emerald-800'
                        : isCurrent
                        ? 'bg-pink-500 text-white'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {idx + 1}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-display font-bold text-xs text-slate-800 truncate">
                        {a.surah.englishName} : {a.numberInSurah}
                      </span>
                      {isDone && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.2 rounded-full">
                          Hafal
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500 line-clamp-1 font-sans">
                      {a.translation}
                    </p>
                  </div>
                </div>

                {/* Right side: Arabic preview */}
                <div className="text-right shrink-0 pl-2">
                  <p dir="rtl" className="font-arabic text-sm text-pink-900 font-bold max-w-[140px] truncate">
                    {a.firstPhrase}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-rose-50/40 border-t border-pink-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white border border-pink-200 text-pink-700 hover:bg-pink-50 font-semibold text-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
