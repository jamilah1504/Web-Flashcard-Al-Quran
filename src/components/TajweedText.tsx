import React, { useMemo, useState } from 'react';
import { parseTajweed, TajweedToken, TajweedRuleType } from '../utils/tajweedHelper';

interface TajweedTextProps {
  text: string;
  tajweedText?: string;
  showTajweed?: boolean;
  className?: string;
  onRuleClick?: (ruleType: TajweedRuleType) => void;
}

export const TajweedText: React.FC<TajweedTextProps> = ({
  text,
  tajweedText,
  showTajweed = true,
  className = '',
  onRuleClick,
}) => {
  const [activeTooltipIndex, setActiveTooltipIndex] = useState<number | null>(null);

  const tokens: TajweedToken[] = useMemo(() => {
    if (!showTajweed) return [{ text, type: 'normal' }];
    return parseTajweed(tajweedText || text);
  }, [text, tajweedText, showTajweed]);

  if (!showTajweed || tokens.length === 0) {
    return (
      <span
        dir="rtl"
        lang="ar"
        className={`font-arabic leading-[2.2] select-text tracking-wide ${className}`}
      >
        {text}
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
                setActiveTooltipIndex((prev) => (prev === index ? null : index));
                if (token.type && onRuleClick) {
                  onRuleClick(token.type);
                }
              }}
            >
              {token.text}
            </span>

            {/* Interactive Floating Callout / Tooltip */}
            {isTooltipActive && token.ruleName && (
              <span
                dir="ltr"
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-40 w-52 sm:w-64 p-2.5 bg-slate-900/95 text-white text-xs rounded-xl shadow-2xl backdrop-blur-md border border-slate-700 pointer-events-auto text-left font-sans animate-fadeIn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (token.type && onRuleClick) {
                    onRuleClick(token.type);
                  }
                }}
              >
                <span className="block font-bold text-amber-300 text-xs border-b border-slate-700 pb-1 mb-1">
                  🏷️ {token.ruleName}
                </span>
                <span className="block text-slate-200 text-[11px] leading-relaxed">
                  <strong className="text-white">Cara baca: </strong>
                  {token.howToRead || token.description}
                </span>
                {token.duration && (
                  <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 bg-slate-800 rounded-md text-amber-200">
                    ⏱️ {token.duration}
                  </span>
                )}
                {/* Arrow pointer */}
                <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
};
