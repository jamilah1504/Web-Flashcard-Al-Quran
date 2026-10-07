export type TajweedRuleType =
  | 'ghunnah'
  | 'ikhfa'
  | 'idgham'
  | 'idgham_bilaghunnah'
  | 'qalqalah'
  | 'mad'
  | 'mad_thobii'
  | 'iqlab'
  | 'idzhar'
  | 'silent'
  | 'normal';

export interface TajweedToken {
  text: string;
  type?: TajweedRuleType;
  colorClass?: string;
  ruleName?: string;
  description?: string;
  howToRead?: string; // Penjelasan cara membacanya
  duration?: string;  // Durasi harakat / ketukan
  letters?: string;   // Huruf terkait
  ruleInfo?: TajweedLegendItem;
}

export interface TajweedLegendItem {
  id: TajweedRuleType;
  name: string;
  arabicName: string;
  colorHex: string;
  textColorClass: string;
  bgColorClass: string;
  borderColorClass: string;
  explanation: string;
  howToRead: string;  // Penjelasan konkret cara membacanya
  duration: string;
  letters: string;
  example: string;
}

export const TAJWEED_LEGEND: TajweedLegendItem[] = [
  {
    id: 'ghunnah',
    name: 'Ghunnah (Dengung)',
    arabicName: 'غُنَّة',
    colorHex: '#0284c7',
    textColorClass: 'text-sky-600',
    bgColorClass: 'bg-sky-50',
    borderColorClass: 'border-sky-200',
    explanation: 'Dengung ditahan pada huruf Nun (نّ) atau Mim (مّ) bertasydid serta Idgham Bighunnah.',
    howToRead:
      'Tahan dan dengungkan suara di rongga hidung (khoisyum) selama 2 harakat (2 ketukan) penuh sebelum melanjutkan ke huruf berikutnya.',
    duration: '2 Harakat (Ketukan)',
    letters: 'نّ - مّ',
    example: 'عَمَّ - إِنَّ - مِن مَّالٍ',
  },
  {
    id: 'ikhfa',
    name: 'Ikhfa (Samar-samar)',
    arabicName: 'إِخْفَاء',
    colorHex: '#d97706',
    textColorClass: 'text-amber-600',
    bgColorClass: 'bg-amber-50',
    borderColorClass: 'border-amber-200',
    explanation: 'Menyamarkan bunyi Nun mati (نْ) atau Tanwin saat bertemu 15 huruf Ikhfa.',
    howToRead:
      'Samarkan bunyi nun mati/tanwin mendekati makhraj huruf berikutnya disertai suara dengung 2 harakat di pangkal hidung. Jangan membaca bunyi "N" murni dan jangan melebur penuh.',
    duration: '2 Harakat (Ketukan)',
    letters: 'ت - ث - ج - د - ذ - ز - س - ش - ص - ض - ط - ظ - ف - ق - ك',
    example: 'مِن قَبْلُ - أَنفُسَهُمْ - كِتَٰبٌ كَرِيمٌ',
  },
  {
    id: 'qalqalah',
    name: 'Qalqalah (Pantulan)',
    arabicName: 'قَلْقَلَة',
    colorHex: '#059669',
    textColorClass: 'text-emerald-600',
    bgColorClass: 'bg-emerald-50',
    borderColorClass: 'border-emerald-200',
    explanation: 'Memantulkan bunyi huruf sukun atau berhenti (waqaf) pada 5 huruf Qalqalah.',
    howToRead:
      'Pantulkan makhraj huruf dengan getaran membal yang jelas dan lepas seketika saat berharakat sukun atau waqaf. Bibir dan lidah tidak boleh menahan huruf dan jangan memunculkan bunyi vokal baru.',
    duration: '1 Ketukan Pantulan',
    letters: 'ق - ط - ب - ج - د (Baju Di Toko)',
    example: 'يَجْعَلْ - الْفَلَقِ - أَحَدْ - أَبْصَٰرُهُمْ',
  },
  {
    id: 'mad',
    name: 'Mad Wajib / Jaiz (Panjang)',
    arabicName: 'مَدّ',
    colorHex: '#e11d48',
    textColorClass: 'text-rose-600',
    bgColorClass: 'bg-rose-50',
    borderColorClass: 'border-rose-200',
    explanation: 'Bacaan dipanjangkan 4 sampai 5 harakat ketika tanda mad (~) bertemu huruf Hamzah.',
    howToRead:
      'Panjangkan suara secara mantap dan stabil selama 4 hingga 5 harakat (setara 2 sampai 2,5 alif) tanpa terputus.',
    duration: '4 - 5 Harakat',
    letters: 'Huruf Mad + Hamzah (ء)',
    example: 'يَتَسَآءَلُونَ - جَآءَ - وَفِىٓ أَنفُسِكُمْ',
  },
  {
    id: 'mad_thobii',
    name: 'Mad Thabi\'i / Asli (Panjang 2 Harakat)',
    arabicName: 'مَدّ طَبِيعِي',
    colorHex: '#ea580c',
    textColorClass: 'text-orange-600',
    bgColorClass: 'bg-orange-50',
    borderColorClass: 'border-orange-200',
    explanation: 'Pemanjangan suara huruf mad asli (Alif setelah fathah, Wawu setelah dhammah, Ya setelah kasrah).',
    howToRead:
      'Panjangkan suara huruf tepat 2 harakat (1 alif / 2 ketukan) secara wajar dan mengalir, tanpa dilebihkan dan tanpa dipendekkan.',
    duration: '2 Harakat (1 Alif)',
    letters: 'ا - و - ي (Alif, Wawu, Ya sukun)',
    example: 'قَالَ - يَقُولُ - قِيلَ - الرَّحْمَٰنِ',
  },
  {
    id: 'iqlab',
    name: 'Iqlab (Tukar Bunyi Mim)',
    arabicName: 'إِقْلَاب',
    colorHex: '#9333ea',
    textColorClass: 'text-purple-600',
    bgColorClass: 'bg-purple-50',
    borderColorClass: 'border-purple-200',
    explanation: 'Mengubah bunyi Nun mati/tanwin menjadi suara Mim (م) ketika bertemu huruf Ba (ب).',
    howToRead:
      'Ubah bunyi Nun mati atau Tanwin menjadi bunyi suara huruf Mim (M) lembut dengan merapatkan kedua bibir secara rileks (tanpa ditekan kuat) dan dengungkan selama 2 harakat.',
    duration: '2 Harakat (Ketukan)',
    letters: 'ب (Ba)',
    example: 'مِنۢ بَعْدِ - أَنۢبِئْهُم - عَلِيمٌۢ بِذَاتِ',
  },
  {
    id: 'idgham',
    name: 'Idgham Bighunnah (Lebur + Dengung)',
    arabicName: 'إِدْغَام بِغُنَّة',
    colorHex: '#0d9488',
    textColorClass: 'text-teal-600',
    bgColorClass: 'bg-teal-50',
    borderColorClass: 'border-teal-200',
    explanation: 'Memasukkan bunyi Nun mati/tanwin ke huruf berikutnya disertai suara dengung.',
    howToRead:
      'Leburkan bunyi Nun mati atau Tanwin secara menyatu ke huruf berikutnya (Ya, Nun, Mim, Wawu) disertai dengungan di rongga hidung selama 2 harakat.',
    duration: '2 Harakat (Ketukan)',
    letters: 'ي - ن - م - و (Yanmu)',
    example: 'مَن يَقُولُ - مِن وَالٍ - لَهَبٍ وَتَبَّ',
  },
  {
    id: 'idgham_bilaghunnah',
    name: 'Idgham Bilaghunnah (Lebur Tanpa Dengung)',
    arabicName: 'إِدْغَام بِلَا غُنَّة',
    colorHex: '#4f46e5',
    textColorClass: 'text-indigo-600',
    bgColorClass: 'bg-indigo-50',
    borderColorClass: 'border-indigo-200',
    explanation: 'Memasukkan bunyi Nun mati/tanwin ke huruf Lam (ل) atau Ra (ر) secara penuh tanpa dengung.',
    howToRead:
      'Leburkan bunyi Nun mati atau Tanwin secara penuh ke huruf Lam atau Ra berikutnya secara bersih dan tegas TANPA mendengung sama sekali.',
    duration: '0 Harakat (Langsung lebur)',
    letters: 'ل - ر (Lam & Ra)',
    example: 'مِن لَّدُنْهُ - مِن رَّبِّهِمْ - غَفُورٌ رَّحِيمٌ',
  },
  {
    id: 'idzhar',
    name: 'Idzhar Halqi (Jelas & Terang)',
    arabicName: 'إِظْهَار حَلْقِي',
    colorHex: '#2563eb',
    textColorClass: 'text-blue-600',
    bgColorClass: 'bg-blue-50',
    borderColorClass: 'border-blue-200',
    explanation: 'Membaca bunyi Nun mati/tanwin dengan jelas tanpa dengung saat bertemu 6 huruf tenggorokan.',
    howToRead:
      'Lafalkan bunyi Nun mati atau Tanwin secara jelas, bersih, dan terang dari tenggorokan tanpa dengung, tanpa memantul, dan tanpa jeda.',
    duration: '1 Harakat (Jelas)',
    letters: 'ء - هـ - ع - غ - ح - خ',
    example: 'مَنْ ءَامَنَ - أَنْعَمْتَ - عَذَابٌ أَلِيمٌ',
  },
  {
    id: 'silent',
    name: 'Hamzah Wasl / Lam Syamsiyah',
    arabicName: 'هَمْزَةُ وَصْل / لَام شَمْسِيَّة',
    colorHex: '#94a3b8',
    textColorClass: 'text-slate-400',
    bgColorClass: 'bg-slate-50',
    borderColorClass: 'border-slate-200',
    explanation: 'Huruf yang tertulis dalam mushaf namun dilewati/tidak dibaca saat kalimat disambung.',
    howToRead:
      'Huruf ini hanya dibaca jika Anda memulai bacaan di awal kalimat. Jika disambung (washal) dari kata sebelumnya, lewati huruf ini langsung ke huruf berharakat berikutnya.',
    duration: 'Tidak Dibaca (0 Harakat)',
    letters: 'ٱ (Hamzah Wasl) & Lam Syamsiyah',
    example: 'ٱلرَّحْمَٰنِ - وَٱلشَّمْسِ - بِٱلْحَقِّ',
  },
];

export const TAJWEED_MAP = new Map<TajweedRuleType, TajweedLegendItem>(
  TAJWEED_LEGEND.map((item) => [item.id, item])
);

/**
 * Maps raw letter tag in api.alquran.cloud to rule & styling
 */
function mapTagToRule(tag: string): {
  type: TajweedRuleType;
  colorClass: string;
  ruleName: string;
  description: string;
  howToRead: string;
  duration: string;
  letters: string;
} {
  switch (tag) {
    case 'g': // Ghunnah
      return {
        type: 'ghunnah',
        colorClass: 'text-sky-600 font-bold',
        ruleName: 'Ghunnah (Dengung)',
        description: 'Dengung ditahan 2 harakat',
        howToRead:
          'Tahan dan dengungkan suara di rongga hidung selama 2 harakat penuh sebelum melanjutkan ke huruf berikutnya.',
        duration: '2 Harakat',
        letters: 'نّ - مّ',
      };
    case 'c': // Ikhfa
    case 'n':
      return {
        type: 'ikhfa',
        colorClass: 'text-amber-600 font-bold',
        ruleName: 'Ikhfa (Samar-samar)',
        description: 'Samar-samar disertai dengung 2 harakat',
        howToRead:
          'Samarkan bunyi nun/tanwin mendekati makhraj huruf berikutnya disertai dengung 2 harakat. Jangan membaca "N" murni.',
        duration: '2 Harakat',
        letters: 'ت - ث - ج - د - ذ - ز - س - ش - ص - ض - ط - ظ - ف - ق - ك',
      };
    case 'q': // Qalqalah
      return {
        type: 'qalqalah',
        colorClass: 'text-emerald-600 font-bold',
        ruleName: 'Qalqalah (Pantulan)',
        description: 'Pantulan bunyi huruf membal yang jelas',
        howToRead:
          'Pantulkan bunyi huruf dengan getaran membal yang jelas dan lepas seketika saat sukun atau waqaf, tanpa memunculkan bunyi vokal baru.',
        duration: '1 Ketukan Pantulan',
        letters: 'ق - ط - ب - ج - د',
      };
    case 'p': // Mad Wajib / Ja'iz
    case 'o':
    case 'm':
      return {
        type: 'mad',
        colorClass: 'text-rose-600 font-bold',
        ruleName: 'Mad Panjang (Wajib/Jaiz)',
        description: 'Panjang 4 hingga 5 harakat',
        howToRead:
          'Panjangkan suara secara mantap dan stabil selama 4 hingga 5 harakat karena tanda mad (~) bertemu Hamzah.',
        duration: '4 - 5 Harakat',
        letters: 'Huruf Mad + Hamzah',
      };
    case 'a': // Alif Mad / Mad Thobi'i
      return {
        type: 'mad_thobii',
        colorClass: 'text-orange-600 font-semibold',
        ruleName: 'Mad Thabi\'i (Panjang 2 Harakat)',
        description: 'Panjang wajar 2 harakat',
        howToRead:
          'Panjangkan suara huruf tepat 2 harakat (1 alif / 2 ketukan) secara mengalir tanpa dilebihkan.',
        duration: '2 Harakat',
        letters: 'ا - و - ي',
      };
    case 'f': // Iqlab
      return {
        type: 'iqlab',
        colorClass: 'text-purple-600 font-bold',
        ruleName: 'Iqlab (Tukar Mim)',
        description: 'Ubah bunyi menjadi Mim disertai dengung',
        howToRead:
          'Ubah bunyi Nun mati atau Tanwin menjadi suara Mim lembut dengan merapatkan bibir secara rileks dan dengungkan 2 harakat.',
        duration: '2 Harakat',
        letters: 'ب (Ba)',
      };
    case 'w': // Idgham
    case 'i':
      return {
        type: 'idgham',
        colorClass: 'text-teal-600 font-bold',
        ruleName: 'Idgham Bighunnah (Lebur + Dengung)',
        description: 'Leburkan huruf disertai dengung 2 harakat',
        howToRead:
          'Masukkan bunyi Nun mati atau Tanwin secara menyatu ke huruf berikutnya disertai dengung di rongga hidung selama 2 harakat.',
        duration: '2 Harakat',
        letters: 'ي - ن - م - و',
      };
    case 'b': // Idgham bila ghunnah
      return {
        type: 'idgham_bilaghunnah',
        colorClass: 'text-indigo-600 font-bold',
        ruleName: 'Idgham Bilaghunnah (Lebur Tanpa Dengung)',
        description: 'Leburkan huruf secara penuh tanpa dengung',
        howToRead:
          'Leburkan bunyi Nun mati atau Tanwin ke huruf Lam atau Ra secara penuh dan bersih TANPA mendengung sama sekali.',
        duration: '0 Harakat (Langsung lebur)',
        letters: 'ل - ر',
      };
    case 'h': // Hamzah Wasl
    case 'l': // Lam Syamsiyyah
    case 's': // Silent letter
      return {
        type: 'silent',
        colorClass: 'text-slate-400 opacity-75',
        ruleName: 'Hamzah Wasl / Dilewati',
        description: 'Tidak dibaca saat washal (disambung)',
        howToRead:
          'Huruf ini hanya dibaca jika Anda memulai bacaan di awal kata; jika disambung dari kata sebelumnya, langsung lewati huruf ini.',
        duration: 'Tidak Dibaca (0 Harakat)',
        letters: 'ٱ (Hamzah Wasl) / Huruf Tanpa Harakat',
      };
    default:
      return {
        type: 'normal',
        colorClass: 'text-inherit',
        ruleName: 'Normal',
        description: '',
        howToRead: 'Baca sesuai harakat aslinya secara wajar.',
        duration: '1 Harakat',
        letters: '',
      };
  }
}

/**
 * Checks if a character is an Arabic combining diacritic/harakah
 */
export function isCombiningMark(char: string): boolean {
  if (!char) return false;
  const code = char.charCodeAt(0);
  return (
    (code >= 0x0610 && code <= 0x061a) ||
    (code >= 0x064b && code <= 0x065f) ||
    code === 0x0670 ||
    (code >= 0x06d6 && code <= 0x06dc) ||
    (code >= 0x06df && code <= 0x06e4) ||
    (code >= 0x06e7 && code <= 0x06e8) ||
    (code >= 0x06ea && code <= 0x06ed)
  );
}

/**
 * Parses raw tajweed marked string from api.alquran.cloud (e.g. "عَ[g[مّ]َ يَتَس[o[َا]ٓءَل[p[ُو]نَ")
 * If string has no tags, applies rule-based heuristic parsing on standard Arabic text.
 */
export function parseTajweed(text: string): TajweedToken[] {
  if (!text) return [];

  const hasTags = /\[[a-z0-9:]+\[/i.test(text);

  if (hasTags) {
    const tokens: TajweedToken[] = [];
    const regex = /\[([a-z0-9:]+)\[([^\]]*)\]/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      // Normal text before this match
      if (match.index > lastIndex) {
        const normalText = text.substring(lastIndex, match.index);
        if (normalText) {
          tokens.push({ text: normalText, type: 'normal' });
        }
      }

      const tagRaw = match[1].split(':')[0].toLowerCase();
      let tokenText = match[2];

      // Absorb any immediately following combining marks into this token
      // e.g. Fathah after [g[مّ], Maddah after [o[َا]
      while (regex.lastIndex < text.length && isCombiningMark(text[regex.lastIndex])) {
        tokenText += text[regex.lastIndex];
        regex.lastIndex++;
      }

      const rule = mapTagToRule(tagRaw);
      tokens.push({
        text: tokenText,
        type: rule.type,
        colorClass: rule.colorClass,
        ruleName: rule.ruleName,
        description: rule.description,
        howToRead: rule.howToRead,
        duration: rule.duration,
        letters: rule.letters,
      });

      lastIndex = regex.lastIndex;
    }

    // Trailing text
    if (lastIndex < text.length) {
      const trailingText = text.substring(lastIndex);
      if (trailingText) {
        tokens.push({ text: trailingText, type: 'normal' });
      }
    }

    // Clean-up pass: ensure no token starts with an orphan combining mark
    for (let i = 1; i < tokens.length; i++) {
      while (tokens[i].text.length > 0 && isCombiningMark(tokens[i].text[0])) {
        tokens[i - 1].text += tokens[i].text[0];
        tokens[i].text = tokens[i].text.slice(1);
      }
    }

    return tokens.filter((t) => t.text.length > 0);
  }

  // Fallback: Heuristic tokenization for plain Arabic text
  return parseTajweedHeuristic(text);
}

/**
 * Intelligent heuristic tokenizer for standard Arabic Uthmani text when API tags are absent.
 */
function parseTajweedHeuristic(text: string): TajweedToken[] {
  const tokens: TajweedToken[] = [];
  // Regex to detect common Tajweed patterns while preventing orphan combining marks
  const regex = /(ٱ|[نم](?:[\u064B-\u0650]?)\u0651[\u064B-\u0650]?|[^\s\u0600-\u061F]*[\u0622\u0653\u06E6\u06E5ٓ~][^\s]*|[قطبجد][ْ\u0652]|ـٰ|[^\s\u0600-\u061F\u064B-\u065F\u0670][\u064E]?\u0670|[ۭۢ])/g;
  let lastIdx = 0;
  let m: RegExpExecArray | null;

  while ((m = regex.exec(text)) !== null) {
    if (m.index > lastIdx) {
      tokens.push({ text: text.substring(lastIdx, m.index), type: 'normal' });
    }

    let matched = m[0];

    // Absorb any immediately following combining marks
    while (regex.lastIndex < text.length && isCombiningMark(text[regex.lastIndex])) {
      matched += text[regex.lastIndex];
      regex.lastIndex++;
    }

    if (matched === 'ٱ') {
      tokens.push({
        text: matched,
        type: 'silent',
        colorClass: 'text-slate-400 opacity-75',
        ruleName: 'Hamzah Wasl',
        description: 'Dilewati saat disambung',
        howToRead: 'Hanya dibaca jika memulai kalimat di awal; jika disambung dari kata sebelumnya, huruf ini dilewati.',
        duration: '0 Harakat',
        letters: 'ٱ',
      });
    } else if (matched.includes('ٓ') || matched.includes('~') || matched.includes('آ') || matched.includes('\u0622') || matched.includes('\u0653')) {
      tokens.push({
        text: matched,
        type: 'mad',
        colorClass: 'text-rose-600 font-bold',
        ruleName: 'Mad Panjang (Wajib/Jaiz)',
        description: 'Panjang 4 hingga 5 harakat',
        howToRead: 'Panjangkan suara secara mantap selama 4 sampai 5 harakat karena tanda mad bertemu Hamzah.',
        duration: '4 - 5 Harakat',
        letters: 'Tanda Mad (ٓ / آ)',
      });
    } else if (matched.includes('ّ') && (matched.includes('ن') || matched.includes('م'))) {
      tokens.push({
        text: matched,
        type: 'ghunnah',
        colorClass: 'text-sky-600 font-bold',
        ruleName: 'Ghunnah (Dengung)',
        description: 'Dengung ditahan 2 harakat',
        howToRead: 'Tahan dan dengungkan suara di rongga hidung selama 2 harakat penuh sebelum lanjut ke huruf berikutnya.',
        duration: '2 Harakat',
        letters: 'نّ - مّ',
      });
    } else if (matched.includes('ٰ') || matched.includes('\u0670') || matched === 'ـٰ') {
      tokens.push({
        text: matched,
        type: 'mad_thobii',
        colorClass: 'text-orange-600 font-semibold',
        ruleName: 'Mad Thabi\'i (Panjang 2 Harakat)',
        description: 'Panjang wajar 2 harakat',
        howToRead: 'Panjangkan suara huruf tepat 2 harakat (1 alif / 2 ketukan) secara mengalir tanpa dilebihkan.',
        duration: '2 Harakat',
        letters: 'ٰ (Alif Khanjariyyah)',
      });
    } else if (/[قطبجد]/.test(matched) && (matched.includes('ْ') || matched.includes('\u0652'))) {
      tokens.push({
        text: matched,
        type: 'qalqalah',
        colorClass: 'text-emerald-600 font-bold',
        ruleName: 'Qalqalah (Pantulan)',
        description: 'Pantulan bunyi huruf membal',
        howToRead: 'Pantulkan bunyi huruf dengan getaran membal yang jelas dan lepas seketika saat sukun atau waqaf.',
        duration: '1 Ketukan Pantulan',
        letters: 'ق - ط - ب - ج - د',
      });
    } else if (matched === 'ۢ' || matched === 'ۭ') {
      tokens.push({
        text: matched,
        type: 'iqlab',
        colorClass: 'text-purple-600 font-bold',
        ruleName: 'Iqlab (Tukar Mim)',
        description: 'Tukar bunyi menjadi Mim lembut',
        howToRead: 'Ubah bunyi Nun mati atau Tanwin menjadi suara huruf Mim lembut tanpa merapatkan bibir terlalu keras, dengungkan 2 harakat.',
        duration: '2 Harakat',
        letters: 'ۢ (Mim Iqlab)',
      });
    } else {
      tokens.push({ text: matched, type: 'normal' });
    }

    lastIdx = regex.lastIndex;
  }

  if (lastIdx < text.length) {
    tokens.push({ text: text.substring(lastIdx), type: 'normal' });
  }

  // Clean-up pass: ensure no token starts with an orphan combining mark
  for (let i = 1; i < tokens.length; i++) {
    while (tokens[i].text.length > 0 && isCombiningMark(tokens[i].text[0])) {
      tokens[i - 1].text += tokens[i].text[0];
      tokens[i].text = tokens[i].text.slice(1);
    }
  }

  return tokens.filter((t) => t.text.length > 0);
}

/**
 * Extracts unique tajweed rules present in a parsed token array
 */
export function extractUniqueRulesFromTokens(tokens: TajweedToken[]): TajweedLegendItem[] {
  const seenTypes = new Set<TajweedRuleType>();
  const results: TajweedLegendItem[] = [];

  for (const t of tokens) {
    if (t.type && t.type !== 'normal' && !seenTypes.has(t.type)) {
      seenTypes.add(t.type);
      const legendItem = TAJWEED_MAP.get(t.type);
      if (legendItem) {
        results.push(legendItem);
      }
    }
  }

  return results;
}

/**
 * Strips all tajweed brackets to return pristine Arabic text
 */
export function stripTajweedTags(text: string): string {
  if (!text) return '';
  return text.replace(/\[[a-z0-9:]+\[([^\]]*)\]/g, '$1');
}
