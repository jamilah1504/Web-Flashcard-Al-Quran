import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  BookOpen,
  HelpCircle,
  X,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import {
  TajweedToken,
  TajweedLegendItem,
  extractUniqueRulesFromTokens,
  TAJWEED_MAP,
  TajweedRuleType,
} from '../utils/tajweedHelper';

interface AyahTajweedExplainerProps {
  tokens?: TajweedToken[] | null;
  selectedRuleType?: TajweedRuleType | null;
  onSelectRule?: (ruleType: TajweedRuleType | null) => void;
  onOpenFullModal?: () => void;
  className?: string;
  compact?: boolean;
  defaultCollapsed?: boolean;
  forceCollapsed?: boolean;
  forceExpanded?: boolean;
  forceExplanationsExpanded?: boolean;
}

export const AyahTajweedExplainer: React.FC<AyahTajweedExplainerProps> = ({
  tokens,
  selectedRuleType = null,
  onSelectRule,
  onOpenFullModal,
  className = '',
  defaultCollapsed = false,
  forceCollapsed,
  forceExpanded,
  forceExplanationsExpanded,
}) => {
  const [internalSelectedRule, setInternalSelectedRule] = useState<TajweedRuleType | null>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(defaultCollapsed);

  // Sync when parent controls collapse or expansion globally
  useEffect(() => {
    if (forceCollapsed !== undefined && forceCollapsed) {
      setIsMinimized(true);
    }
  }, [forceCollapsed]);

  useEffect(() => {
    if (forceExpanded !== undefined && forceExpanded) {
      setIsMinimized(false);
    }
  }, [forceExpanded]);

  const activeRuleType =
    selectedRuleType !== undefined && selectedRuleType !== null
      ? selectedRuleType
      : internalSelectedRule;

  const handleSelect = (ruleType: TajweedRuleType) => {
    const next = activeRuleType === ruleType ? null : ruleType;
    if (onSelectRule) {
      onSelectRule(next);
    } else {
      setInternalSelectedRule(next);
    }
  };

  const presentRules: TajweedLegendItem[] = useMemo(() => {
    if (!tokens || tokens.length === 0) return [];
    return extractUniqueRulesFromTokens(tokens);
  }, [tokens]);

  const activeRule = useMemo(() => {
    if (!activeRuleType) return null;
    return TAJWEED_MAP.get(activeRuleType) || null;
  }, [activeRuleType]);

  // =========================================================================
  // CASE A: NO SPECIAL TAJWEED RULES (Harakat Asli / Normal Pronunciation)
  // =========================================================================
  if (presentRules.length === 0) {
    if (isMinimized) {
      return (
        <div
          className={`w-full rounded-2xl border border-slate-200/90 bg-slate-50/80 p-2 sm:px-3 sm:py-2 text-left transition-all flex flex-wrap items-center justify-between gap-2 shadow-2xs ${className}`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-700">
              Tajwid: Lafal Normal (Harakat Asli · 1 Harakat)
            </span>
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            {onOpenFullModal && (
              <button
                type="button"
                onClick={onOpenFullModal}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors text-xs cursor-pointer"
                title="Buka panduan lengkap tajwid"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsMinimized(false)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer shadow-2xs"
              title="Perbesar kartu tajwid"
            >
              <Maximize2 className="w-3 h-3 text-slate-600" />
              <span>Perbesar</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`w-full rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50/80 via-white to-slate-50/50 p-3 sm:p-3.5 text-left transition-all ${className}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2 mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>Hukum Tajwid: Lafal Normal (Harakat Asli)</span>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            {onOpenFullModal && (
              <button
                type="button"
                onClick={onOpenFullModal}
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                title="Lihat seluruh panduan tajwid"
              >
                <HelpCircle className="w-3 h-3 text-amber-600" />
                <span>Panduan</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300/80 transition-colors cursor-pointer shadow-2xs"
              title="Perkecil kotak tajwid ini"
            >
              <Minimize2 className="w-3 h-3" />
              <span>Perkecil</span>
              <ChevronUp className="w-3 h-3" />
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          Ayat ini dibaca sesuai harakat aslinya (1 ketukan/harakat per huruf vokal/sukun) tanpa pemanjangan mad khusus ataupun dengungan ghunnah tambahan.
        </p>
      </div>
    );
  }

  // =========================================================================
  // CASE B: MINIMIZED VIEW / DIPERKECIL (Hukum Tajwid Ditemukan)
  // =========================================================================
  if (isMinimized) {
    return (
      <div
        className={`w-full rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50/90 via-orange-50/60 to-white p-2.5 sm:px-3 sm:py-2 text-left transition-all flex flex-wrap items-center justify-between gap-2 shadow-2xs ${className}`}
      >
        <div className="flex items-center flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Tajwid ({presentRules.length} Hukum):</span>
          </div>

          <div className="flex items-center flex-wrap gap-1.5">
            {presentRules.map((rule) => (
              <button
                key={rule.id}
                type="button"
                onClick={() => {
                  setIsMinimized(false);
                  handleSelect(rule.id);
                }}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 border shadow-2xs hover:scale-105 transition-all cursor-pointer ${rule.bgColorClass} ${rule.textColorClass} ${rule.borderColorClass}`}
                title={`Klik untuk melihat cara membaca ${rule.name}`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: rule.colorHex }}
                />
                <span>{rule.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          {onOpenFullModal && (
            <button
              type="button"
              onClick={onOpenFullModal}
              className="p-1.5 rounded-xl text-amber-800 hover:text-amber-950 hover:bg-amber-100 transition-colors text-xs cursor-pointer"
              title="Buka panduan lengkap tajwid"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            </button>
          )}

          {/* Button Perbesar */}
          <button
            type="button"
            onClick={() => {
              setIsMinimized(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold border border-amber-300 transition-all cursor-pointer shadow-2xs"
            title="Perbesar kartu tajwid untuk melihat hukum tajwid di ayat ini"
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-800" />
            <span>Perbesar</span>
            <ChevronDown className="w-3 h-3 text-amber-800" />
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CASE C: EXPANDED VIEW / LENGKAP (Hukum Tajwid Ditemukan)
  // =========================================================================
  return (
    <div
      className={`w-full rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50/70 via-orange-50/30 to-white p-3 sm:p-3.5 text-left transition-all shadow-xs ${className}`}
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/70 pb-2.5 mb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Hukum Tajwid di Ayat Ini ({presentRules.length} Hukum):</span>
        </div>

        {/* Action Controls: Panduan, Perkecil */}
        <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-auto">
          {/* Full Guide Modal Button */}
          {onOpenFullModal && (
            <button
              type="button"
              onClick={onOpenFullModal}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium text-amber-800 hover:text-amber-950 bg-white hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
              title="Lihat seluruh daftar panduan tajwid lengkap"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Panduan</span>
            </button>
          )}

          {/* Single Toggle Button: Perkecil */}
          <button
            type="button"
            onClick={() => {
              setIsMinimized(true);
              if (onSelectRule) onSelectRule(null);
              else setInternalSelectedRule(null);
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs border border-amber-300/90 transition-all cursor-pointer shadow-2xs"
            title="Perkecil kotak tajwid ini menjadi baris ringkas"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Perkecil</span>
            <ChevronUp className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Interactive Rule Badges / Chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        {presentRules.map((rule) => {
          const isSelected = activeRuleType === rule.id;
          return (
            <button
              key={rule.id}
              type="button"
              onClick={() => handleSelect(rule.id)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? `bg-white ${rule.textColorClass} border-amber-400 ring-2 ring-amber-300 shadow-sm scale-105 font-bold`
                  : `${rule.bgColorClass} ${rule.textColorClass} ${rule.borderColorClass} hover:brightness-95 active:scale-95 shadow-2xs`
              }`}
              title={`Klik untuk melihat cara membaca hukum ${rule.name}`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: rule.colorHex }}
              />
              <span>{rule.name}</span>
              {isSelected ? (
                <ChevronUp className="w-3 h-3 ml-0.5 opacity-80" />
              ) : (
                <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
              )}
            </button>
          );
        })}
      </div>

      {/* Hint when no specific rule badge is clicked */}
      {!activeRule && (
        <div className="mt-2 text-[11px] text-amber-900/80 bg-amber-100/50 rounded-xl px-2.5 py-1 flex items-center justify-between border border-amber-200/50">
          <span>💡 Klik salah satu hukum tajwid di atas untuk melihat cara membaca & contohnya.</span>
        </div>
      )}

      {/* VIEW: Single Selected Rule Detailed Card (when clicking on a badge) */}
      <AnimatePresence>
        {activeRule && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 10 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div
              className={`p-3 sm:p-3.5 rounded-xl border ${activeRule.borderColorClass} ${activeRule.bgColorClass} relative shadow-xs`}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => handleSelect(activeRule.id)}
                className="absolute top-2.5 right-2.5 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/60 transition-colors cursor-pointer"
                title="Tutup penjelasan ini"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="pr-6 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: activeRule.colorHex }}
                  />
                  <h4 className={`text-xs sm:text-sm font-bold ${activeRule.textColorClass}`}>
                    {activeRule.name} ({activeRule.arabicName})
                  </h4>
                  <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-white/90 border border-slate-200/80 font-bold text-slate-700">
                    ⏱️ Durasi: {activeRule.duration}
                  </span>
                </div>

                {/* Cara Membaca */}
                <div className="text-xs text-slate-800 leading-relaxed bg-white/95 p-2.5 rounded-lg border border-slate-200/70">
                  <div className="font-bold text-slate-900 mb-0.5 flex items-center gap-1">
                    <span>📖 Cara Membacanya:</span>
                  </div>
                  <p className="font-medium text-slate-800 leading-relaxed">
                    {activeRule.howToRead}
                  </p>
                </div>

                {/* Huruf & Contoh */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 pt-0.5">
                  <div>
                    <span className="font-semibold text-slate-700">Huruf: </span>
                    <span className="font-arabic font-medium">{activeRule.letters}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Contoh: </span>
                    <span className="font-arabic font-medium">{activeRule.example}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
