import React, { useState } from 'react';
import {
  X,
  Search,
  BookOpen,
  Sparkles,
  Hash,
  Compass,
  ArrowLeft,
  ChevronRight,
  ListOrdered,
} from 'lucide-react';
import { JUZ_LIST, POPULAR_PRESETS, getJuzByPage } from '../data/juzData';
import { ALL_SURAHS, SurahMeta } from '../data/quranMeta';

interface SelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: number;
  onSelectPage: (page: number) => void;
  onSelectSurahAndAyah: (surahNumber: number, ayahNumber: number) => void;
  initialTab?: 'surah' | 'juz' | 'page' | 'presets';
}

export const SelectorModal: React.FC<SelectorModalProps> = ({
  isOpen,
  onClose,
  currentPage,
  onSelectPage,
  onSelectSurahAndAyah,
  initialTab = 'surah',
}) => {
  const [activeTab, setActiveTab] = useState<'surah' | 'juz' | 'page' | 'presets'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [pageInput, setPageInput] = useState(currentPage.toString());

  // Surah & Ayah picker states
  const [selectedSurah, setSelectedSurah] = useState<SurahMeta | null>(null);
  const [surahFilter, setSurahFilter] = useState<'all' | 'juz30' | 'makkiyyah' | 'madaniyyah'>('all');
  const [ayahJumpInput, setAyahJumpInput] = useState('1');

  if (!isOpen) return null;

  const currentJuz = getJuzByPage(currentPage);

  // Filter Surah list
  const filteredSurahs = ALL_SURAHS.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.englishName.toLowerCase().includes(q) ||
      s.englishNameTranslation.toLowerCase().includes(q) ||
      s.number.toString() === q ||
      s.name.includes(q);

    if (!matchesSearch) return false;

    if (surahFilter === 'juz30') {
      return s.number >= 78; // Surah An-Naba to An-Naas
    }
    if (surahFilter === 'makkiyyah') {
      return s.revelationType === 'Meccan';
    }
    if (surahFilter === 'madaniyyah') {
      return s.revelationType === 'Medinan';
    }
    return true;
  });

  // Filter Juz list
  const filteredJuz = JUZ_LIST.filter((j) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      j.name.toLowerCase().includes(q) ||
      j.description.toLowerCase().includes(q) ||
      j.juzNumber.toString() === q
    );
  });

  const handleApplyPage = (pageNum: number) => {
    const validPage = Math.max(1, Math.min(604, pageNum));
    onSelectPage(validPage);
    onClose();
  };

  const handleApplySurahAndAyah = (surahNum: number, ayahNum: number) => {
    onSelectSurahAndAyah(surahNum, ayahNum);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in">
      {/* Modal Container */}
      <div className="relative w-full max-w-xl bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-pink-100 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-rose-50/80 via-pink-50/60 to-purple-50/80 border-b border-pink-100/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-pink-100 text-pink-700">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-slate-800 text-base sm:text-lg">
                Pilih Surat, Ayat & Halaman
              </h2>
              <p className="text-xs text-rose-500 font-medium">
                Mushaf Madinah 15 Baris Rasm Utsmani (114 Surat • 604 Halaman)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-white/80 transition-colors"
            title="Tutup dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-pink-100/70 px-3 sm:px-4 pt-2.5 bg-rose-50/30 gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
          {/* TAB 1: SURAT & AYAT */}
          <button
            onClick={() => {
              setActiveTab('surah');
              setSelectedSurah(null);
            }}
            className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 shrink-0 whitespace-nowrap ${
              activeTab === 'surah'
                ? 'border-pink-500 text-pink-700 bg-white shadow-xs font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-pink-500" />
            <span>Pilih Surat & Ayat</span>
          </button>

          {/* TAB 2: JUZ */}
          <button
            onClick={() => setActiveTab('juz')}
            className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 shrink-0 whitespace-nowrap ${
              activeTab === 'juz'
                ? 'border-pink-500 text-pink-700 bg-white shadow-xs font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden sm:inline">Pilih Juz (1 - 30)</span>
            <span className="sm:hidden">Juz</span>
          </button>

          {/* TAB 3: NOMOR HALAMAN */}
          <button
            onClick={() => setActiveTab('page')}
            className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 shrink-0 whitespace-nowrap ${
              activeTab === 'page'
                ? 'border-pink-500 text-pink-700 bg-white shadow-xs font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Hash className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden sm:inline">Nomor Halaman</span>
            <span className="sm:hidden">Halaman</span>
          </button>

          {/* TAB 4: SURAH POPULER */}
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 shrink-0 whitespace-nowrap ${
              activeTab === 'presets'
                ? 'border-pink-500 text-pink-700 bg-white shadow-xs font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
            <span className="hidden sm:inline">Surah Populer</span>
            <span className="sm:hidden">Populer</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-3.5 sm:p-5 overflow-y-auto flex-1 space-y-3.5">
          {/* ======================================================== */}
          {/* TAB 1: SURAT & AYAT SELECTOR                             */}
          {/* ======================================================== */}
          {activeTab === 'surah' && (
            <div>
              {!selectedSurah ? (
                /* STEP 1: PILIH SURAT (1 - 114) */
                <div className="space-y-3">
                  {/* Search Box */}
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Cari surat (cth: Al-Baqarah, Yasin, Al-Kahf, 18, An-Naba)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-pink-200/80 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all placeholder:text-stone-400"
                    />
                  </div>

                  {/* Filter Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 text-xs">
                    <button
                      onClick={() => setSurahFilter('all')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 ${
                        surahFilter === 'all'
                          ? 'bg-pink-500 text-white font-bold'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      Semua (114)
                    </button>
                    <button
                      onClick={() => setSurahFilter('juz30')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 ${
                        surahFilter === 'juz30'
                          ? 'bg-pink-500 text-white font-bold'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      Juz 30 (Juz 'Amma)
                    </button>
                    <button
                      onClick={() => setSurahFilter('makkiyyah')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 ${
                        surahFilter === 'makkiyyah'
                          ? 'bg-pink-500 text-white font-bold'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      Makkiyyah
                    </button>
                    <button
                      onClick={() => setSurahFilter('madaniyyah')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 ${
                        surahFilter === 'madaniyyah'
                          ? 'bg-pink-500 text-white font-bold'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      Madaniyyah
                    </button>
                  </div>

                  {/* List of 114 Surahs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[340px] sm:max-h-[380px] overflow-y-auto pr-1">
                    {filteredSurahs.map((surah) => (
                      <button
                        key={surah.number}
                        onClick={() => {
                          setSelectedSurah(surah);
                          setAyahJumpInput('1');
                        }}
                        className="p-2.5 sm:p-3 rounded-2xl border border-pink-100 hover:border-pink-300 bg-white hover:bg-pink-50/60 text-left flex items-center justify-between gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.99] group shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Number Badge */}
                          <div className="w-8 h-8 rounded-xl bg-pink-100/90 text-pink-700 font-display font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-pink-500 group-hover:text-white transition-colors">
                            {surah.number}
                          </div>
                          {/* Names */}
                          <div className="min-w-0">
                            <p className="font-display font-bold text-slate-800 text-xs sm:text-sm truncate">
                              {surah.englishName}
                            </p>
                            <p className="text-[11px] text-stone-500 truncate">
                              {surah.englishNameTranslation}
                            </p>
                            <p className="text-[10px] text-rose-500 font-medium">
                              {surah.numberOfAyahs} Ayat • Hal. {surah.startPage}
                            </p>
                          </div>
                        </div>

                        {/* Arabic Calligraphy & Action */}
                        <div className="text-right shrink-0">
                          <p className="font-arabic text-sm sm:text-base font-bold text-pink-800/90">
                            {surah.name}
                          </p>
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-pink-600 font-semibold group-hover:text-pink-700">
                            <span>Pilih Ayat</span>
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* STEP 2: PILIH AYAT SETELAH PILIH SURAT */
                <div className="space-y-3.5">
                  {/* Back to Surah List Button */}
                  <button
                    onClick={() => setSelectedSurah(null)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-semibold transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali ke Daftar Surat</span>
                  </button>

                  {/* Selected Surah Banner Card */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-pink-100/70 via-rose-50 to-purple-100/60 border border-pink-200/80 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-pink-500 text-white font-bold text-xs flex items-center justify-center">
                          {selectedSurah.number}
                        </span>
                        <h3 className="font-display font-bold text-slate-800 text-sm sm:text-base">
                          {selectedSurah.englishName}
                        </h3>
                        <span className="text-xs text-stone-500 hidden xs:inline">
                          ({selectedSurah.englishNameTranslation})
                        </span>
                      </div>
                      <p className="text-xs text-rose-600 font-medium mt-1">
                        Total {selectedSurah.numberOfAyahs} Ayat • Dimulai dari Halaman{' '}
                        {selectedSurah.startPage} •{' '}
                        {selectedSurah.revelationType === 'Meccan' ? 'Makkiyyah' : 'Madaniyyah'}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-arabic text-xl sm:text-2xl font-bold text-pink-900">
                        {selectedSurah.name}
                      </p>
                    </div>
                  </div>

                  {/* Quick Action: Mulai dari Ayat 1 */}
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200/70 text-xs">
                    <button
                      onClick={() => handleApplySurahAndAyah(selectedSurah.number, 1)}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold hover:from-pink-600 hover:to-rose-600 shadow-2xs transition-all flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3 h-3 fill-white/70" />
                      <span>Mulai dari Ayat 1 (Awal Surat)</span>
                    </button>

                    {/* Direct Ayah Input Jump */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-stone-500 text-[11px] whitespace-nowrap">Lompat:</span>
                      <input
                        type="number"
                        min={1}
                        max={selectedSurah.numberOfAyahs}
                        value={ayahJumpInput}
                        onChange={(e) => setAyahJumpInput(e.target.value)}
                        className="w-14 text-center py-1 text-xs font-bold border border-pink-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-pink-400"
                      />
                      <button
                        onClick={() => {
                          const num = parseInt(ayahJumpInput, 10) || 1;
                          const validAyah = Math.max(1, Math.min(selectedSurah.numberOfAyahs, num));
                          handleApplySurahAndAyah(selectedSurah.number, validAyah);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-pink-100 hover:bg-pink-200 text-pink-800 font-semibold text-xs transition-colors"
                      >
                        Buka
                      </button>
                    </div>
                  </div>

                  {/* Grid of All Ayahs in this Surah */}
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-2">
                      Pilih nomor ayat yang ingin dihafal ({selectedSurah.numberOfAyahs} ayat):
                    </p>
                    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1.5 max-h-[260px] sm:max-h-[300px] overflow-y-auto pr-1 p-1">
                      {Array.from({ length: selectedSurah.numberOfAyahs }, (_, i) => i + 1).map(
                        (ayahNum) => (
                          <button
                            key={ayahNum}
                            onClick={() => handleApplySurahAndAyah(selectedSurah.number, ayahNum)}
                            className="py-2 rounded-xl bg-white hover:bg-pink-100 border border-pink-100 hover:border-pink-300 text-slate-700 hover:text-pink-800 font-bold text-xs transition-all hover:scale-105 active:scale-95 shadow-2xs flex flex-col items-center justify-center"
                            title={`Ayat ${ayahNum}`}
                          >
                            <span>{ayahNum}</span>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: JUZ SELECTOR                                      */}
          {/* ======================================================== */}
          {activeTab === 'juz' && (
            <div className="space-y-3">
              {/* Search Box */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Cari Juz atau nama Surah (misal: Juz 30, An-Naba, Al-Mulk)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-pink-200/80 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all placeholder:text-stone-400"
                />
              </div>

              {/* Juz Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[340px] sm:max-h-[380px] overflow-y-auto pr-1">
                {filteredJuz.map((j) => {
                  const isCurrent = currentJuz.juzNumber === j.juzNumber;
                  return (
                    <button
                      key={j.juzNumber}
                      onClick={() => handleApplyPage(j.startPage)}
                      className={`p-3 rounded-2xl border text-left flex items-start justify-between transition-all hover:scale-[1.01] active:scale-[0.99] ${
                        isCurrent
                          ? 'bg-gradient-to-br from-pink-100/90 to-rose-50 border-pink-300 ring-2 ring-pink-200'
                          : 'bg-white hover:bg-pink-50/50 border-pink-100 hover:border-pink-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-slate-800 text-sm">
                            {j.name}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] bg-pink-500 text-white font-semibold px-1.5 py-0.2 rounded-full">
                              Aktif
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                          {j.description}
                        </p>
                        <p className="text-[11px] font-semibold text-rose-500 mt-1">
                          Halaman {j.startPage} - {j.endPage}
                        </p>
                      </div>
                      <span className="font-arabic text-lg text-pink-700/80 font-bold ml-2">
                        {j.arabicName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: DIRECT PAGE INPUT                                 */}
          {/* ======================================================== */}
          {activeTab === 'page' && (
            <div className="space-y-4 py-2">
              <div className="bg-rose-50/60 p-4 rounded-2xl border border-pink-200/60 text-center space-y-3">
                <p className="text-xs text-stone-600 font-medium">
                  Masukkan nomor halaman antara <strong className="text-pink-600">1</strong> hingga{' '}
                  <strong className="text-pink-600">604</strong>
                </p>

                <div className="flex items-center justify-center gap-2 max-w-xs mx-auto">
                  <button
                    onClick={() => {
                      const val = Math.max(1, (parseInt(pageInput, 10) || 1) - 1);
                      setPageInput(val.toString());
                    }}
                    className="w-10 h-10 rounded-xl bg-white border border-pink-200 text-pink-700 font-bold hover:bg-pink-100 transition-colors flex items-center justify-center text-base"
                  >
                    -
                  </button>

                  <input
                    type="number"
                    min={1}
                    max={604}
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    className="w-28 text-center py-2 text-xl font-display font-bold text-slate-800 bg-white border-2 border-pink-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />

                  <button
                    onClick={() => {
                      const val = Math.min(604, (parseInt(pageInput, 10) || 1) + 1);
                      setPageInput(val.toString());
                    }}
                    className="w-10 h-10 rounded-xl bg-white border border-pink-200 text-pink-700 font-bold hover:bg-pink-100 transition-colors flex items-center justify-center text-base"
                  >
                    +
                  </button>
                </div>

                <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                  {[1, 293, 440, 562, 582, 604].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPageInput(p.toString())}
                      className="px-2.5 py-1 text-xs rounded-lg bg-white/90 border border-pink-200 text-pink-700 hover:bg-pink-100 transition-colors font-semibold"
                    >
                      Hal {p}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handleApplyPage(parseInt(pageInput, 10) || 1)}
                  className="w-full max-w-xs mx-auto mt-2 py-2.5 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold text-sm rounded-xl shadow-md shadow-pink-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Buka Halaman Ini ✨
                </button>
              </div>

              <div className="text-xs text-stone-500 text-center">
                Info: Halaman yang dipilih saat ini adalah{' '}
                <strong className="text-slate-700">Halaman {currentPage}</strong> ({currentJuz.name}
                ).
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: POPULAR PRESETS                                   */}
          {/* ======================================================== */}
          {activeTab === 'presets' && (
            <div className="space-y-2.5">
              <p className="text-xs text-stone-600 font-medium">
                Pilih surat dan halaman favorit yang sering dihafal para penuntut ilmu:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[340px] sm:max-h-[380px] overflow-y-auto pr-1">
                {POPULAR_PRESETS.map((p) => {
                  const isCurrent = currentPage === p.page;
                  return (
                    <button
                      key={p.page}
                      onClick={() => handleApplyPage(p.page)}
                      className={`p-3 rounded-2xl border text-left transition-all hover:scale-[1.01] active:scale-[0.99] flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-pink-100/80 border-pink-300 ring-2 ring-pink-200'
                          : 'bg-white hover:bg-pink-50/40 border-pink-100 hover:border-pink-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display font-bold text-slate-800 text-sm">
                          {p.title}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${p.iconColor}`}
                        >
                          {p.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">{p.subtitle}</p>
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-100 text-[11px]">
                        <span className="text-rose-600 font-semibold">Halaman {p.page}</span>
                        <span className="text-stone-400">Juz {p.juz}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-rose-50/40 border-t border-pink-100 flex items-center justify-between text-xs text-stone-500">
          <span>Mushaf Standar Madinah 15 Baris</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-pink-200 text-pink-700 hover:bg-pink-50 font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

