import React, { useMemo } from 'react';
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
  const effectiveText = text || textWithTags || '';
  const effectiveTajweed = tajweedText || textWithTags || effectiveText;
  const handleRuleClick = onRuleClick || onSelectRule;

  const tokens: TajweedToken[] = useMemo(() => {
    if (!showTajweed) return [{ text: effectiveText, type: 'normal' }];
    return parseTajweed(effectiveTajweed || effectiveText);
  }, [effectiveText, effectiveTajweed, showTajweed]);

  // Common typography styles to ensure Arabic ligatures & harakat remain crystal clear without collisions
  const arabicTypographyStyle: React.CSSProperties = {
    fontFamily: "'Amiri', 'Scheherazade New', 'Traditional Arabic', serif",
    fontFeatureSettings: '"kern" 1, "liga" 1, "calt" 1, "mkmk" 1, "mark" 1',
    textRendering: 'optimizeLegibility',
    WebkitFontSmoothing: 'antialiased',
    letterSpacing: 'normal',
    wordSpacing: 'normal',
  };

  if (!showTajweed || tokens.length === 0) {
    return (
      <span
        dir="rtl"
        lang="ar"
        className={`font-arabic select-text leading-[2.6] tracking-normal ${className}`}
        style={arabicTypographyStyle}
      >
        {effectiveText}
      </span>
    );
  }

  return (
    <span
      dir="rtl"
      lang="ar"
      className={`font-arabic select-text leading-[2.6] tracking-normal ${className}`}
      style={arabicTypographyStyle}
    >
      {tokens.map((token, index) => {
        if (token.type === 'normal' || !token.colorClass) {
          return (
            <span key={index} style={{ display: 'inline', padding: 0, margin: 0 }}>
              {token.text}
            </span>
          );
        }

        const ruleInfo = token.ruleInfo || (token.type ? TAJWEED_MAP.get(token.type) : undefined);
        const titleText = ruleInfo
          ? `${ruleInfo.name}: ${ruleInfo.howToRead}`
          : token.ruleName || 'Hukum Tajwid';

        return (
          <span
            key={index}
            className={`${token.colorClass} cursor-pointer transition-opacity duration-150 hover:opacity-80 active:opacity-70`}
            style={{
              // Never use inline-block or horizontal padding inside Arabic cursive words
              display: 'inline',
              padding: 0,
              margin: 0,
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (ruleInfo && handleRuleClick) {
                handleRuleClick(ruleInfo.id);
              }
            }}
            title={titleText}
          >
            {token.text}
          </span>
        );
      })}
    </span>
  );
};
