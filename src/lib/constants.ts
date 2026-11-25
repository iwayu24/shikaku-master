import type {
  AccountElement,
  ExamTrack,
  JournalEntryInput,
  JournalQuestionSpec,
} from '@/types/exam';

export interface ElementMeta {
  key: AccountElement;
  label: string;
  shortLabel: string;
  homeSide: 'debit' | 'credit';
  homeSideLabel: string;
  badgeClass: string;
  dotClass: string;
  barClass: string;
  softBgClass: string;
  textClass: string;
}

export const ACCOUNT_ELEMENTS: AccountElement[] = [
  'asset',
  'liability',
  'equity',
  'revenue',
  'expense',
];

export const ELEMENT_META: Record<AccountElement, ElementMeta> = {
  asset: {
    key: 'asset',
    label: '資産',
    shortLabel: '資産',
    homeSide: 'debit',
    homeSideLabel: '借方（左）',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    dotClass: 'bg-blue-500',
    barClass: 'bg-blue-500',
    softBgClass: 'bg-blue-50/70',
    textClass: 'text-blue-700',
  },
  liability: {
    key: 'liability',
    label: '負債',
    shortLabel: '負債',
    homeSide: 'credit',
    homeSideLabel: '貸方（右）',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    dotClass: 'bg-rose-500',
    barClass: 'bg-rose-500',
    softBgClass: 'bg-rose-50/70',
    textClass: 'text-rose-700',
  },
  equity: {
    key: 'equity',
    label: '純資産',
    shortLabel: '純資産',
    homeSide: 'credit',
    homeSideLabel: '貸方（右）',
    badgeClass: 'bg-violet-50 text-violet-700 border-violet-200',
    dotClass: 'bg-violet-500',
    barClass: 'bg-violet-500',
    softBgClass: 'bg-violet-50/70',
    textClass: 'text-violet-700',
  },
  revenue: {
    key: 'revenue',
    label: '収益',
    shortLabel: '収益',
    homeSide: 'credit',
    homeSideLabel: '貸方（右）',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
    barClass: 'bg-emerald-500',
    softBgClass: 'bg-emerald-50/70',
    textClass: 'text-emerald-700',
  },
  expense: {
    key: 'expense',
    label: '費用',
    shortLabel: '費用',
    homeSide: 'debit',
    homeSideLabel: '借方（左）',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    dotClass: 'bg-amber-500',
    barClass: 'bg-amber-500',
    softBgClass: 'bg-amber-50/70',
    textClass: 'text-amber-800',
  },
};

export interface TrackColorStyle {
  badgeClass: string;
  accentClass: string;
  barClass: string;
  softBgClass: string;
  borderClass: string;
  dotClass: string;
}

export const TRACK_COLOR_STYLES: Record<ExamTrack['color'], TrackColorStyle> = {
  emerald: {
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    accentClass: 'text-emerald-600',
    barClass: 'bg-emerald-500',
    softBgClass: 'bg-emerald-50/70',
    borderClass: 'border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  indigo: {
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    accentClass: 'text-indigo-600',
    barClass: 'bg-indigo-600',
    softBgClass: 'bg-indigo-50/70',
    borderClass: 'border-indigo-200',
    dotClass: 'bg-indigo-600',
  },
  sky: {
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
    accentClass: 'text-sky-600',
    barClass: 'bg-sky-600',
    softBgClass: 'bg-sky-50/70',
    borderClass: 'border-sky-200',
    dotClass: 'bg-sky-600',
  },
  amber: {
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    accentClass: 'text-amber-600',
    barClass: 'bg-amber-500',
    softBgClass: 'bg-amber-50/70',
    borderClass: 'border-amber-200',
    dotClass: 'bg-amber-500',
  },
  rose: {
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    accentClass: 'text-rose-600',
    barClass: 'bg-rose-500',
    softBgClass: 'bg-rose-50/70',
    borderClass: 'border-rose-200',
    dotClass: 'bg-rose-500',
  },
  violet: {
    badgeClass: 'bg-violet-50 text-violet-700 border-violet-200',
    accentClass: 'text-violet-600',
    barClass: 'bg-violet-500',
    softBgClass: 'bg-violet-50/70',
    borderClass: 'border-violet-200',
    dotClass: 'bg-violet-500',
  },
  teal: {
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
    accentClass: 'text-teal-600',
    barClass: 'bg-teal-500',
    softBgClass: 'bg-teal-50/70',
    borderClass: 'border-teal-200',
    dotClass: 'bg-teal-500',
  },
};

export function getTrackColorStyle(color?: ExamTrack['color']): TrackColorStyle {
  return TRACK_COLOR_STYLES[color ?? 'indigo'];
}

export function formatYen(
  amount: number,
  options?: { showSymbol?: boolean; showSign?: boolean }
): string {
  const showSymbol = options?.showSymbol ?? true;
  const showSign = options?.showSign ?? false;
  const safeValue = Number.isFinite(amount) ? Math.round(amount) : 0;
  const isNegative = safeValue < 0;
  const absFormatted = Math.abs(safeValue).toLocaleString('ja-JP');
  const symbol = showSymbol ? '¥' : '';

  if (isNegative) {
    return `-${symbol}${absFormatted}`;
  }
  if (showSign && safeValue > 0) {
    return `+${symbol}${absFormatted}`;
  }
  return `${symbol}${absFormatted}`;
}

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '0';
  return value.toLocaleString('ja-JP');
}

export function formatTimer(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export interface JournalGradeResult {
  isCorrect: boolean;
  debitCorrect: boolean;
  creditCorrect: boolean;
  isBalanced: boolean;
  debitTotal: number;
  creditTotal: number;
}

function normalizeJournalEntries(entries: JournalEntryInput[]): JournalEntryInput[] {
  return entries
    .map((entry) => ({
      account: entry.account.trim(),
      amount: Number(entry.amount),
    }))
    .filter(
      (entry) =>
        entry.account.length > 0 || (Number.isFinite(entry.amount) && entry.amount !== 0)
    );
}

function toCanonicalMultiset(entries: JournalEntryInput[]): string[] {
  return entries
    .map(
      (entry) =>
        `${entry.account}::${Number.isFinite(entry.amount) ? Math.round(entry.amount) : NaN}`
    )
    .sort();
}

function matchJournalSide(
  userEntries: JournalEntryInput[],
  correctEntries: JournalEntryInput[]
): boolean {
  const normalizedUser = normalizeJournalEntries(userEntries);
  const normalizedCorrect = normalizeJournalEntries(correctEntries);

  if (normalizedUser.length !== normalizedCorrect.length) {
    return false;
  }

  const userKeys = toCanonicalMultiset(normalizedUser);
  const correctKeys = toCanonicalMultiset(normalizedCorrect);

  return userKeys.every((key, idx) => key === correctKeys[idx]);
}

/**
 * Order-independent exact matcher for debit and credit journal entries.
 */
export function gradeJournalAnswer(
  userDebit: JournalEntryInput[],
  userCredit: JournalEntryInput[],
  spec: JournalQuestionSpec
): JournalGradeResult {
  const normalizedDebit = normalizeJournalEntries(userDebit);
  const normalizedCredit = normalizeJournalEntries(userCredit);

  const debitTotal = normalizedDebit.reduce(
    (sum, line) => sum + (Number.isFinite(line.amount) ? Math.round(line.amount) : 0),
    0
  );
  const creditTotal = normalizedCredit.reduce(
    (sum, line) => sum + (Number.isFinite(line.amount) ? Math.round(line.amount) : 0),
    0
  );

  const debitCorrect = matchJournalSide(normalizedDebit, spec.correctDebit);
  const creditCorrect = matchJournalSide(normalizedCredit, spec.correctCredit);
  const isBalanced = debitTotal > 0 && debitTotal === creditTotal;

  return {
    isCorrect: debitCorrect && creditCorrect,
    debitCorrect,
    creditCorrect,
    isBalanced,
    debitTotal,
    creditTotal,
  };
}
