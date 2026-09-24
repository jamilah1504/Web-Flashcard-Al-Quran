import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ChevronDown, ChevronUp, BookOpen, Volume2, HelpCircle, X } from 'lucide-react';
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
}

export const AyahTajweedExplainer: React.FC<AyahTajweedExplainerProps> = ({
  tokens,
  selectedRuleType = null,
  onSelectRule,
  onOpenFullModal,
  className = '',
  compact = false,
}) => {
  const [internalSelectedRule, setInternalSelectedRule] = useState<TajweedRuleType | null>(null);

  const activeRuleType = selectedRuleType !== undefined && selectedRuleType !== null
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

  if (presentRules.length === 0) {
    return null;
  }

  return (
    <div
      className={`w-full rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-white p-3 text-left transition-all ${className}`}
    >
      {/* Header bar: info + chips */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Hukum Tajwid di Ayat Ini:</span>
          <span className="text-[11px] text-amber-700/80 font-normal hidden sm:inline">
            (Ketuk untuk cara baca)
          </span>
        </div>

        {onOpenFullModal && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenFullModal();
            }}
            className="self-start sm:self-auto flex items-center gap-1 text-[11px] font-medium text-amber-800 hover:text-amber-950 underline underline-offset-2 transition-colors"
          >
            <HelpCircle className="w-3 h-3 text-amber-600" />
            <span>Panduan Lengkap</span>
          </button>
        )}
      </div>

      {/* Interactive Rule Badges / Chips */}
      <div className="flex flex-wrap items-center gap-1.5 mt-2">
        {presentRules.map((rule) => {
          const isSelected = activeRuleType === rule.id;
          return (
            <button
              key={rule.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(rule.id);
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-105'
                  : `${rule.bgColorClass} ${rule.textColorClass} ${rule.borderColorClass} hover:brightness-95 active:scale-95 shadow-2xs`
              }`}
              title={`Cara membaca hukum ${rule.name}`}
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

      {/* Expanded Explanation Card: How to read this specific rule */}
      <AnimatePresence>
        {activeRule && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
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
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(activeRule.id);
                }}
                className="absolute top-2.5 right-2.5 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/60 transition-colors"
                title="Tutup penjelasan"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="pr-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: activeRule.colorHex }}
                  />
                  <h4 className={`text-xs sm:text-sm font-bold ${activeRule.textColorClass}`}>
                    {activeRule.name} ({activeRule.arabicName})
                  </h4>
                  <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-white/80 border border-slate-200/80 font-semibold text-slate-700">
                    ⏱️ Durasi: {activeRule.duration}
                  </span>
                </div>

                {/* Instruction: Cara Membaca */}
                <div className="mt-2 text-xs text-slate-700 leading-relaxed bg-white/90 p-2.5 rounded-lg border border-slate-200/70">
                  <div className="font-bold text-slate-900 mb-0.5 flex items-center gap-1">
                    <span>📖 Cara Membacanya:</span>
                  </div>
                  <p className="font-medium text-slate-800 leading-relaxed">
                    {activeRule.howToRead}
                  </p>
                </div>

                {/* Extra Details: Letters & Examples */}
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
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
