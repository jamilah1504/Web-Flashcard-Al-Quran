import React, { useMemo, useState } from 'react';
import { parseTajweed, TajweedToken, TajweedRuleType, TAJWEED_MAP } from '../utils/tajweedHelper';

interface TajweedTextProps {
  text?: string;
  textWithTags?: string;
  tajweedText?: string;
  showTajweed?: boolean;
  className?: string;
  onRuleClick?: (ruleType: TajweedRuleType) => void;
  onSelectRule?: (ruleType: TajweedRuleType) => void;
}

export const TajweedText: React.FC<TajweedTextProps> = ({
  text = '',
  textWithTags,
  tajweedText,
  showTajweed = true,
  className = '',
  onRuleClick,
  onSelectRule,
}) => {
  const [activeTooltipIndex, setActiveTooltipIndex] = useState<number | null>(null);

  const effectiveText = text || textWithTags || '';
  const effectiveTajweed = tajweedText || textWithTags || effectiveText;

  const handleRuleClick = onRuleClick || onSelectRule;

  const tokens: TajweedToken[] = useMemo(() => {
    if (!showTajweed) return [{ text: effectiveText, type: 'normal' }];
    return parseTajweed(effectiveTajweed || effectiveText);
  }, [effectiveText, effectiveTajweed, showTajweed]);

  if (!showTajweed || tokens.length === 0) {
    return (
      <span
        dir="rtl"
        lang="ar"
        className={`font-arabic leading-[2.2] select-text tracking-wide ${className}`}
      >
        {effectiveText}
      </span>
    );
  }

  return (
    <span
      dir="rtl"
      lang="ar"
      className={`font-arabic leading-[2.2] select-text tracking-wide ${className} relative`}
    >
      {tokens.map((token, index) => {
        if (token.type === 'normal' || !token.colorClass) {
          return <span key={index}>{token.text}</span>;
        }

        const isTooltipActive = activeTooltipIndex === index;
        const ruleInfo = token.ruleInfo || (token.type ? TAJWEED_MAP.get(token.type) : undefined);

        return (
          <span
            key={index}
            className="relative inline-block group"
            onMouseEnter={() => setActiveTooltipIndex(index)}
            onMouseLeave={() => setActiveTooltipIndex(null)}
          >
            <span
              className={`${token.colorClass} transition-all duration-200 cursor-help px-0.5 rounded-sm hover:underline hover:brightness-90`}
              onClick={(e) => {
                e.stopPropagation();
                if (ruleInfo && handleRuleClick) {
                  handleRuleClick(ruleInfo.id);
                }
              }}
              title={ruleInfo ? `${ruleInfo.name}: ${ruleInfo.howToRead}` : undefined}
            >
              {token.text}
            </span>

            {/* Hover Tooltip Card */}
            {isTooltipActive && ruleInfo && (
              <span
                dir="ltr"
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2.5 rounded-xl bg-white text-slate-800 border border-amber-200 shadow-xl z-30 pointer-events-none text-left animate-fadeIn block ring-1 ring-black/5"
              >
                <span className="font-bold flex items-center gap-1.5 text-amber-900 text-xs">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: ruleInfo.colorHex }}
                  />
                  <span>{ruleInfo.name}</span>
                </span>
                <span className="text-[11px] text-slate-600 block mt-1 leading-snug">
                  {ruleInfo.howToRead}
                </span>
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
};
