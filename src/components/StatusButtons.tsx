import React from 'react';
import { Bookmark, Clock, CheckCircle2 } from 'lucide-react';
import { Ayah, AyahStatusType, AyahUserStatus } from '../types';

interface StatusButtonsProps {
  ayah: Ayah;
  status?: AyahUserStatus;
  onToggleStatus: (ayah: Ayah, type: AyahStatusType) => void;
  size?: 'sm' | 'md';
  showLabels?: boolean;
  className?: string;
}

export const StatusButtons: React.FC<StatusButtonsProps> = ({
  ayah,
  status,
  onToggleStatus,
  size = 'md',
  showLabels = true,
  className = '',
}) => {
  const isFav = !!status?.isFavorite;
  const isLearn = !!status?.isLearning;
  const isMemo = !!status?.isMemorized;

  const btnBase =
    size === 'sm'
      ? 'px-2 py-1 text-[11px] gap-1'
      : 'px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs gap-1.5';

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-3.5 h-3.5 sm:w-4 sm:h-4';

  return (
    <div
      className={`inline-flex items-center gap-1 sm:gap-1.5 p-1 rounded-2xl bg-white/80 border border-slate-200/80 shadow-xs backdrop-blur-xs ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* 1. Favorit / Bookmark (📌) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleStatus(ayah, 'favorite');
        }}
        title={isFav ? 'Hapus dari Favorit / Bookmark' : 'Tandai sebagai Ayat Favorit / Bookmark'}
        className={`flex items-center rounded-xl font-medium transition-all ${btnBase} ${
          isFav
            ? 'bg-amber-500 text-white shadow-xs font-semibold ring-1 ring-amber-400'
            : 'text-slate-600 hover:bg-amber-50 hover:text-amber-700'
        }`}
      >
        <Bookmark className={`${iconSize} shrink-0 ${isFav ? 'fill-current' : ''}`} />
        {showLabels && (
          <span className="hidden xs:inline">{isFav ? 'Favorit' : 'Bookmark'}</span>
        )}
      </button>

      {/* 2. Sedang Dihafal (⏳) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleStatus(ayah, 'learning');
        }}
        title={isLearn ? 'Batalkan status Sedang Dihafal' : 'Tandai Sedang Dihafal'}
        className={`flex items-center rounded-xl font-medium transition-all ${btnBase} ${
          isLearn
            ? 'bg-sky-500 text-white shadow-xs font-semibold ring-1 ring-sky-400'
            : 'text-slate-600 hover:bg-sky-50 hover:text-sky-700'
        }`}
      >
        <Clock className={`${iconSize} shrink-0`} />
        {showLabels && (
          <span className="hidden xs:inline">Sedang Dihafal</span>
        )}
      </button>

      {/* 3. Sudah Dihafal (✅) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleStatus(ayah, 'memorized');
        }}
        title={isMemo ? 'Batalkan status Sudah Dihafal' : 'Tandai Sudah Dihafal (Lancar)'}
        className={`flex items-center rounded-xl font-medium transition-all ${btnBase} ${
          isMemo
            ? 'bg-emerald-500 text-white shadow-xs font-semibold ring-1 ring-emerald-400'
            : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
        }`}
      >
        <CheckCircle2 className={`${iconSize} shrink-0 ${isMemo ? 'fill-emerald-100/20' : ''}`} />
        {showLabels && (
          <span>{isMemo ? 'Hafal' : 'Sudah Hafal'}</span>
        )}
      </button>
    </div>
  );
};
