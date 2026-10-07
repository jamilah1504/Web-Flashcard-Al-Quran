import React from 'react';
import { toArabicNumerals } from '../utils/quranHelper';

interface AyahEndSymbolProps {
  number: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Standard Quranic Ayah End Marker
 * Displays the Eastern Arabic ayah numeral inside authentic Quranic ornate parenthesis ﴿...﴾
 * with Right-to-Left formatting, guaranteeing that the verse number is strictly positioned
 * at the END of the verse and on the LEFT side of the Arabic text stream.
 */
export const AyahEndSymbol: React.FC<AyahEndSymbolProps> = ({
  number,
  className = '',
  size = 'md',
}) => {
  const arabicNum = toArabicNumerals(number);

  const sizeClasses = {
    sm: 'text-base sm:text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
  }[size];

  return (
    <span
      dir="rtl"
      lang="ar"
      className={`inline-flex items-center justify-center font-arabic text-pink-600 font-bold mx-1.5 align-middle select-none ${sizeClasses} ${className}`}
      title={`Akhir Ayat ${number}`}
    >
      &#x200F;﴿{arabicNum}﴾
    </span>
  );
};
