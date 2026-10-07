import React from 'react';
import { toArabicNumerals } from '../utils/quranHelper';

interface AyahEndSymbolProps {
  number: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Standard Quranic Ayah End Marker
 * Displays the Eastern Arabic ayah numeral inside authentic Quranic ornate parenthesis ﴿...﴾.
 * Uses strict LTR bidi isolation inside the badge so that the ornate brackets always
 * embrace the verse number (opening inward) and never appear inverted or back-to-back.
 */
export const AyahEndSymbol: React.FC<AyahEndSymbolProps> = ({
  number,
  className = '',
  size = 'md',
}) => {
  const arabicNum = toArabicNumerals(number);

  const sizeClasses = {
    sm: 'text-sm sm:text-base',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
  }[size];

  return (
    <span
      dir="ltr"
      className={`inline-flex items-center justify-center font-arabic text-pink-600 font-bold mx-1.5 align-middle select-none whitespace-nowrap tracking-normal ${sizeClasses} ${className}`}
      style={{ unicodeBidi: 'isolate', direction: 'ltr' }}
      title={`Akhir Ayat ${number}`}
      aria-label={`Akhir Ayat ${number}`}
    >
      <span className="leading-none text-pink-500/90 select-none" aria-hidden="true">&#xFD3F;</span>
      <span className="font-arabic font-bold mx-0.5 leading-none px-0.5 text-pink-700">{arabicNum}</span>
      <span className="leading-none text-pink-500/90 select-none" aria-hidden="true">&#xFD3E;</span>
    </span>
  );
};
