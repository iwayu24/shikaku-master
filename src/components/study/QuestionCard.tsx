'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Bookmark,
  Calculator,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  RotateCcw,
  Sparkles,
  X,
  XCircle,
} from 'lucide-react';
import { useCalculator } from '@/components/layout/AppShell';
import { DifficultyStars, TrackBadge } from '@/components/ui/CommonUI';
import { examHasTool, getTrackById } from '@/exams/registry';
import { formatYen, gradeJournalAnswer } from '@/lib/constants';
import type {
  ContextTable,
  JournalEntryInput,
  JournalQuestionSpec,
  Question,
} from '@/types/exam';

export type UserAnswer =
  | { type: 'choice'; choiceIndex: number | null }
  | { type: 'journal'; debit: JournalEntryInput[]; credit: JournalEntryInput[] };

export interface QuestionCardProps {
  question: Question;
  answer: UserAnswer;
  onChange: (answer: UserAnswer) => void;
  disabled?: boolean;
  showResult?: boolean;
  questionNumber?: number;
  points?: number;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
}

export function createEmptyAnswer(question: Question): UserAnswer {
  if (question.type === 'journal') {
    const debitCount = Math.max(1, question.journalSpec?.debitSlots ?? 1);
    const creditCount = Math.max(1, question.journalSpec?.creditSlots ?? 1);
    return {
      type: 'journal',
      debit: Array.from({ length: debitCount }, () => ({ account: '', amount: 0 })),
      credit: Array.from({ length: creditCount }, () => ({ account: '', amount: 0 })),
    };
  }
  return { type: 'choice', choiceIndex: null };
}

export function isAnswerComplete(question: Question, answer: UserAnswer): boolean {
  if (question.type === 'choice') {
    return answer.type === 'choice' && answer.choiceIndex !== null;
  }
  if (answer.type !== 'journal') return false;
  const debitSlots = Math.max(1, question.journalSpec?.debitSlots ?? 1);
  const creditSlots = Math.max(1, question.journalSpec?.creditSlots ?? 1);

  if (answer.debit.length < debitSlots || answer.credit.length < creditSlots) {
    return false;
  }

  const allDebitFilled = answer.debit
    .slice(0, debitSlots)
    .every(
      (line) =>
        line.account.trim().length > 0 && Number.isFinite(line.amount) && line.amount > 0
    );
  const allCreditFilled = answer.credit
    .slice(0, creditSlots)
    .every(
      (line) =>
        line.account.trim().length > 0 && Number.isFinite(line.amount) && line.amount > 0
    );

  return allDebitFilled && allCreditFilled;
}

export function evaluateAnswer(question: Question, answer: UserAnswer): boolean {
  if (question.type === 'choice') {
    return (
      answer.type === 'choice' &&
      answer.choiceIndex !== null &&
      answer.choiceIndex === question.correctChoiceIndex
    );
  }
  if (answer.type !== 'journal' || !question.journalSpec) {
    return false;
  }
  return gradeJournalAnswer(answer.debit, answer.credit, question.journalSpec).isCorrect;
}

const CHOICE_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

function isNumericLikeCell(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  return /^[-+▲△¥￥(（]?\d[\d,.\s%％円個回倍時間点分秒)）]*$/.test(trimmed);
}

function formatEstimatedTime(seconds: number): string {
  if (seconds < 60) return `${seconds}秒`;
  const mins = Math.round((seconds / 60) * 10) / 10;
  return Number.isInteger(mins) ? `${mins}分` : `${mins}分`;
}

function getLineMatchStatuses(
  userEntries: JournalEntryInput[],
  correctEntries: JournalEntryInput[]
): boolean[] {
  const remaining = new Map<string, number>();
  for (const line of correctEntries) {
    const key = `${line.account.trim()}::${Math.round(Number(line.amount))}`;
    remaining.set(key, (remaining.get(key) ?? 0) + 1);
  }

  return userEntries.map((entry) => {
    const key = `${entry.account.trim()}::${Math.round(Number(entry.amount))}`;
    const count = remaining.get(key) ?? 0;
    if (count > 0) {
      remaining.set(key, count - 1);
      return true;
    }
    return false;
  });
}

function ContextTableCard({ table }: { table: ContextTable }) {
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50/50">
      <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 bg-slate-100/70 px-3.5 py-2">
        <span className="text-xs font-bold text-slate-700">
          {table.title ?? '資料・データ'}
        </span>
        {table.headers.length >= 3 ? (
          <span className="text-[10px] font-medium text-slate-400 sm:hidden">
            ← 横スクロール可
          </span>
        ) : null}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[280px] border-collapse text-left text-xs sm:text-[13px]">
          <thead>
            <tr className="border-b border-slate-200 bg-white/80 text-slate-600">
              {table.headers.map((header, idx) => {
                const sampleNumeric =
                  idx > 0 &&
                  table.rows.length > 0 &&
                  table.rows.every((r) => !r[idx] || isNumericLikeCell(r[idx]));
                return (
                  <th
                    key={idx}
                    className={`whitespace-nowrap px-3.5 py-2 font-bold ${
                      sampleNumeric ? 'text-right' : 'text-left'
                    }`}
                  >
                    {header}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70 bg-white">
            {table.rows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-50/60">
                {row.map((cell, cIdx) => {
                  const numeric = cIdx > 0 && isNumericLikeCell(cell);
                  return (
                    <td
                      key={cIdx}
                      className={`px-3.5 py-2.5 text-slate-800 ${
                        numeric
                          ? 'whitespace-nowrap text-right font-semibold tabular-nums'
                          : 'font-medium'
                      }`}
                    >
                      {cell}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface ActivePickerState {
  side: 'debit' | 'credit';
  index: number;
  field: 'account' | 'amount';
}

interface JournalBuilderProps {
  questionId: string;
  spec: JournalQuestionSpec;
  debit: JournalEntryInput[];
  credit: JournalEntryInput[];
  onChange: (next: { debit: JournalEntryInput[]; credit: JournalEntryInput[] }) => void;
  disabled: boolean;
  showResult: boolean;
}

function JournalBuilder({
  questionId,
  spec,
  debit,
  credit,
  onChange,
  disabled,
  showResult,
}: JournalBuilderProps) {
  const [activePicker, setActivePicker] = useState<ActivePickerState | null>(null);
  const [customAmountText, setCustomAmountText] = useState<string>('');

  // Reset open picker whenever question changes or card becomes disabled
  useEffect(() => {
    setActivePicker(null);
    setCustomAmountText('');
  }, [questionId, disabled]);

  // Close picker on Escape key
  useEffect(() => {
    if (!activePicker) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActivePicker(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activePicker]);

  const debitTotal = useMemo(
    () =>
      debit.reduce(
        (sum, line) => sum + (Number.isFinite(line.amount) ? Math.round(line.amount) : 0),
        0
      ),
    [debit]
  );

  const creditTotal = useMemo(
    () =>
      credit.reduce(
        (sum, line) => sum + (Number.isFinite(line.amount) ? Math.round(line.amount) : 0),
        0
      ),
    [credit]
  );

  const diff = Math.abs(debitTotal - creditTotal);
  const isBalanced = debitTotal > 0 && debitTotal === creditTotal;
  const hasAnyInput = useMemo(
    () =>
      debit.some((d) => d.account || d.amount > 0) ||
      credit.some((c) => c.account || c.amount > 0),
    [debit, credit]
  );

  const gradeResult = useMemo(
    () => (showResult ? gradeJournalAnswer(debit, credit, spec) : null),
    [showResult, debit, credit, spec]
  );

  const debitLineMatches = useMemo(
    () => (showResult ? getLineMatchStatuses(debit, spec.correctDebit) : []),
    [showResult, debit, spec.correctDebit]
  );

  const creditLineMatches = useMemo(
    () => (showResult ? getLineMatchStatuses(credit, spec.correctCredit) : []),
    [showResult, credit, spec.correctCredit]
  );

  const openSlotPicker = (
    side: 'debit' | 'credit',
    index: number,
    field: 'account' | 'amount'
  ) => {
    if (disabled) return;
    const isSame =
      activePicker?.side === side &&
      activePicker?.index === index &&
      activePicker?.field === field;
    if (isSame) {
      setActivePicker(null);
      return;
    }
    const targetList = side === 'debit' ? debit : credit;
    const currentAmount = targetList[index]?.amount ?? 0;
    setCustomAmountText(currentAmount > 0 ? String(currentAmount) : '');
    setActivePicker({ side, index, field });
  };

  const updateLine = (
    side: 'debit' | 'credit',
    index: number,
    patch: Partial<JournalEntryInput>
  ) => {
    if (disabled) return;
    if (side === 'debit') {
      const nextDebit = debit.map((item, idx) =>
        idx === index ? { ...item, ...patch } : item
      );
      onChange({ debit: nextDebit, credit });
    } else {
      const nextCredit = credit.map((item, idx) =>
        idx === index ? { ...item, ...patch } : item
      );
      onChange({ debit, credit: nextCredit });
    }
  };

  const handleSelectAccount = (account: string) => {
    if (!activePicker) return;
    const { side, index } = activePicker;
    const currentLine = (side === 'debit' ? debit : credit)[index];
    updateLine(side, index, { account });

    // Effortless 1-thumb flow: automatically advance to Amount if still unset
    if (!currentLine || currentLine.amount <= 0) {
      setCustomAmountText('');
      setActivePicker({ side, index, field: 'amount' });
    } else {
      setActivePicker(null);
    }
  };

  const handleSelectAmount = (amount: number) => {
    if (!activePicker) return;
    const { side, index } = activePicker;
    updateLine(side, index, { amount });
    setCustomAmountText(amount > 0 ? String(amount) : '');
    setActivePicker(null);
  };

  const handleApplyCustomAmount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePicker) return;
    const cleaned = customAmountText.replace(/[^\d]/g, '');
    const parsed = parseInt(cleaned, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    handleSelectAmount(parsed);
  };

  const handleClearActiveSlot = () => {
    if (!activePicker) return;
    if (activePicker.field === 'account') {
      updateLine(activePicker.side, activePicker.index, { account: '' });
    } else {
      updateLine(activePicker.side, activePicker.index, { amount: 0 });
      setCustomAmountText('');
    }
    setActivePicker(null);
  };

  const handleResetAll = () => {
    if (disabled) return;
    setActivePicker(null);
    onChange({
      debit: debit.map(() => ({ account: '', amount: 0 })),
      credit: credit.map(() => ({ account: '', amount: 0 })),
    });
  };

  // Compute remaining balance helper for amount picker (purely from user's own entries)
  const balanceSuggestion = useMemo(() => {
    if (!activePicker || activePicker.field !== 'amount') return null;
    const { side, index } = activePicker;
    const thisSideEntries = side === 'debit' ? debit : credit;
    const otherSideTotal = side === 'debit' ? creditTotal : debitTotal;
    if (otherSideTotal <= 0) return null;

    const otherRowsOnThisSide = thisSideEntries.reduce(
      (sum, row, idx) =>
        idx === index ? sum : sum + (Number.isFinite(row.amount) ? row.amount : 0),
      0
    );
    const needed = otherSideTotal - otherRowsOnThisSide;
    return needed > 0 ? needed : null;
  }, [activePicker, debit, credit, debitTotal, creditTotal]);

  const activeSideLines = activePicker
    ? activePicker.side === 'debit'
      ? debit
      : credit
    : [];
  const activeCurrentLine = activePicker ? activeSideLines[activePicker.index] : undefined;
  const usedAccountsOnActiveSide = new Set(
    activeSideLines
      .map((l, idx) => (idx === activePicker?.index ? '' : l.account))
      .filter(Boolean)
  );

  const renderSideCard = (
    side: 'debit' | 'credit',
    entries: JournalEntryInput[],
    total: number,
    sideCorrect: boolean | undefined,
    lineMatches: boolean[]
  ) => {
    const isDebit = side === 'debit';
    const headerBg = isDebit
      ? 'bg-blue-50/85 border-blue-100 text-blue-950'
      : 'bg-rose-50/80 border-rose-100 text-rose-950';
    const tagBg = isDebit
      ? 'bg-blue-600 text-white'
      : 'bg-rose-600 text-white';
    const cardBorder = showResult
      ? sideCorrect
        ? 'border-emerald-300 ring-1 ring-emerald-200/70'
        : 'border-rose-300 ring-1 ring-rose-200/70'
      : isDebit
        ? 'border-blue-200/80'
        : 'border-rose-200/80';

    return (
      <div className={`overflow-hidden rounded-2xl border bg-white shadow-2xs transition ${cardBorder}`}>
        {/* Side Header */}
        <div className={`flex items-center justify-between gap-2 border-b px-3.5 py-2.5 ${headerBg}`}>
          <div className="flex items-center gap-2">
            <span className={`rounded-lg px-2 py-0.5 text-xs font-extrabold tracking-wide ${tagBg}`}>
              {isDebit ? '借方' : '貸方'}
            </span>
            <span className="text-[11px] font-semibold opacity-75">
              {isDebit ? '左' : '右'} ・ {entries.length}行
            </span>
            {showResult && sideCorrect !== undefined ? (
              sideCorrect ? (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                  <Check className="h-3 w-3" />
                  一致
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-800">
                  <X className="h-3 w-3" />
                  要確認
                </span>
              )
            ) : null}
          </div>
          <span className="text-xs font-bold tabular-nums opacity-85">
            計 {formatYen(total)}
          </span>
        </div>

        {/* Slot Rows */}
        <div className="divide-y divide-slate-100 p-2.5 space-y-2">
          {entries.map((entry, idx) => {
            const isAccountOpen =
              activePicker?.side === side &&
              activePicker?.index === idx &&
              activePicker?.field === 'account';
            const isAmountOpen =
              activePicker?.side === side &&
              activePicker?.index === idx &&
              activePicker?.field === 'amount';
            const lineOk = showResult ? lineMatches[idx] : undefined;

            return (
              <div
                key={idx}
                className={`flex items-stretch gap-2 pt-2 first:pt-0 ${
                  showResult ? 'items-center' : ''
                }`}
              >
                {/* Account Slot Button */}
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => openSlotPicker(side, idx, 'account')}
                  className={`group flex min-h-[48px] flex-1 items-center justify-between gap-1.5 rounded-xl border-2 px-3 py-2 text-left transition active:scale-[0.99] ${
                    showResult
                      ? lineOk
                        ? 'border-emerald-300 bg-emerald-50/70 text-emerald-950'
                        : 'border-rose-300 bg-rose-50/60 text-rose-950'
                      : isAccountOpen
                        ? 'border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                        : entry.account
                          ? 'border-slate-200 bg-white hover:border-indigo-300'
                          : 'border-dashed border-slate-300 bg-slate-50/70 hover:border-indigo-300 hover:bg-indigo-50/30'
                  } ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <span
                    className={`truncate text-sm ${
                      entry.account
                        ? 'font-bold text-slate-900'
                        : 'font-medium text-slate-400'
                    }`}
                  >
                    {entry.account || '勘定科目を選択'}
                  </span>
                  {!disabled ? (
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                        isAccountOpen ? 'rotate-180 text-indigo-600' : ''
                      }`}
                    />
                  ) : showResult ? (
                    lineOk ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    ) : (
                      <XCircle className="h-4 w-4 shrink-0 text-rose-500" />
                    )
                  ) : null}
                </button>

                {/* Amount Slot Button */}
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => openSlotPicker(side, idx, 'amount')}
                  className={`flex min-h-[48px] w-[124px] shrink-0 items-center justify-end gap-1 rounded-xl border-2 px-3 py-2 text-right tabular-nums transition active:scale-[0.99] sm:w-[136px] ${
                    showResult
                      ? lineOk
                        ? 'border-emerald-300 bg-emerald-50/70 text-emerald-950'
                        : 'border-rose-300 bg-rose-50/60 text-rose-950'
                      : isAmountOpen
                        ? 'border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                        : entry.amount > 0
                          ? 'border-slate-200 bg-white hover:border-indigo-300'
                          : 'border-dashed border-slate-300 bg-slate-50/70 hover:border-indigo-300 hover:bg-indigo-50/30'
                  } ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <span
                    className={`truncate text-sm ${
                      entry.amount > 0
                        ? 'font-bold text-slate-900'
                        : 'font-medium text-slate-400'
                    }`}
                  >
                    {entry.amount > 0 ? formatYen(entry.amount) : '金額'}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-5 space-y-3">
      {/* Subtle 1-thumb hint */}
      {!disabled && !hasAnyInput ? (
        <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          <span>各枠をタップして、チップから勘定科目と金額を選んでください</span>
        </p>
      ) : null}

      {/* Debit & Credit Cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {renderSideCard(
          'debit',
          debit,
          debitTotal,
          gradeResult?.debitCorrect,
          debitLineMatches
        )}
        {renderSideCard(
          'credit',
          credit,
          creditTotal,
          gradeResult?.creditCorrect,
          creditLineMatches
        )}
      </div>

      {/* Live 貸借バランスメーター */}
      <div
        className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-xs transition ${
          isBalanced
            ? 'border-emerald-200 bg-emerald-50/80 text-emerald-900'
            : debitTotal > 0 || creditTotal > 0
              ? 'border-amber-200 bg-amber-50/80 text-amber-900'
              : 'border-slate-200 bg-slate-50 text-slate-600'
        }`}
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 tabular-nums">
          <span className="font-semibold">
            借方合計 <strong className="font-extrabold">{formatYen(debitTotal)}</strong>
          </span>
          <span className="text-slate-300">|</span>
          <span className="font-semibold">
            貸方合計 <strong className="font-extrabold">{formatYen(creditTotal)}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isBalanced ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-2xs">
              <Check className="h-3 w-3" />
              貸借一致
            </span>
          ) : debitTotal > 0 || creditTotal > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-300/70 tabular-nums">
              <AlertCircle className="h-3 w-3" />
              差額 {formatYen(diff)}
            </span>
          ) : (
            <span className="text-[11px] font-medium text-slate-400">
              貸借一致でバランス確認
            </span>
          )}

          {!disabled && hasAnyInput ? (
            <button
              type="button"
              onClick={handleResetAll}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-500 transition hover:bg-white/80 hover:text-slate-800"
              title="仕訳をすべてクリア"
            >
              <RotateCcw className="h-3 w-3" />
              <span>クリア</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Chip Palette Picker — Mobile Bottom Sheet + Desktop Inline Panel */}
      {activePicker && !disabled ? (
        <>
          {/* Mobile Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[1px] md:hidden"
            onClick={() => setActivePicker(null)}
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-label={
              activePicker.field === 'account' ? '勘定科目を選択' : '金額を選択'
            }
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-[75dvh] flex-col rounded-t-3xl border-t border-slate-200 bg-white shadow-2xl pb-[env(safe-area-inset-bottom)] md:static md:z-auto md:max-h-none md:rounded-2xl md:border md:border-indigo-200 md:bg-indigo-50/30 md:shadow-sm"
          >
            {/* Mobile drag handle */}
            <div className="flex justify-center pt-2.5 pb-1 md:hidden">
              <span className="h-1 w-10 rounded-full bg-slate-300" />
            </div>

            {/* Picker Header */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-md px-2 py-0.5 text-[11px] font-extrabold text-white ${
                    activePicker.side === 'debit' ? 'bg-blue-600' : 'bg-rose-600'
                  }`}
                >
                  {activePicker.side === 'debit' ? '借方' : '貸方'}{' '}
                  {activePicker.index + 1}行目
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {activePicker.field === 'account'
                    ? '勘定科目をタップ'
                    : '金額をタップ'}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {(activePicker.field === 'account' && activeCurrentLine?.account) ||
                (activePicker.field === 'amount' && (activeCurrentLine?.amount ?? 0) > 0) ? (
                  <button
                    type="button"
                    onClick={handleClearActiveSlot}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                  >
                    クリア
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setActivePicker(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="パレットを閉じる"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Picker Body */}
            <div className="overflow-y-auto p-4">
              {activePicker.field === 'account' ? (
                <div className="flex flex-wrap gap-2">
                  {spec.accountChoices.map((account) => {
                    const isSelected = activeCurrentLine?.account === account;
                    const usedElsewhere = usedAccountsOnActiveSide.has(account);
                    return (
                      <button
                        key={account}
                        type="button"
                        onClick={() => handleSelectAccount(account)}
                        className={`inline-flex min-h-[46px] items-center gap-1.5 rounded-xl border-2 px-3.5 py-2 text-sm font-bold transition active:scale-[0.97] ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                            : usedElsewhere
                              ? 'border-slate-200 bg-slate-100/80 text-slate-500 hover:border-indigo-300 hover:bg-white'
                              : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-400 hover:bg-indigo-50/60'
                        }`}
                      >
                        {isSelected ? <Check className="h-4 w-4 shrink-0" /> : null}
                        <span>{account}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Balance quick-fill shortcut */}
                  {balanceSuggestion !== null ? (
                    <button
                      type="button"
                      onClick={() => handleSelectAmount(balanceSuggestion)}
                      className="flex min-h-[44px] w-full items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/90 px-3.5 py-2 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100/80 active:scale-[0.99]"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                        貸借差額をワンタップ入力
                      </span>
                      <span className="text-sm font-extrabold tabular-nums">
                        {formatYen(balanceSuggestion)}
                      </span>
                    </button>
                  ) : null}

                  {/* Amount Chips */}
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {spec.amountChoices.map((amt) => {
                      const isSelected = activeCurrentLine?.amount === amt;
                      return (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => handleSelectAmount(amt)}
                          className={`flex min-h-[48px] items-center justify-center gap-1 rounded-xl border-2 px-3 py-2 text-sm font-bold tabular-nums transition active:scale-[0.97] ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                              : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-400 hover:bg-indigo-50/60'
                          }`}
                        >
                          {isSelected ? <Check className="h-3.5 w-3.5 shrink-0" /> : null}
                          <span>{formatYen(amt)}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Numeric Input Fallback */}
                  <form
                    onSubmit={handleApplyCustomAmount}
                    className="flex items-center gap-2 border-t border-slate-200/80 pt-3"
                  >
                    <div className="relative flex-1">
                      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-bold text-slate-400">
                        ¥
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9,]*"
                        value={customAmountText}
                        onChange={(e) =>
                          setCustomAmountText(e.target.value.replace(/[^\d,]/g, ''))
                        }
                        placeholder="金額を直接入力"
                        className="h-11 w-full rounded-xl border border-slate-300 bg-white pr-3 pl-7 text-sm font-bold text-slate-900 tabular-nums placeholder:font-normal placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={
                        !customAmountText.replace(/[^\d]/g, '') ||
                        parseInt(customAmountText.replace(/[^\d]/g, ''), 10) <= 0
                      }
                      className="h-11 shrink-0 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white transition hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400"
                    >
                      適用
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

interface ChoiceRendererProps {
  choices: string[];
  selectedIndex: number | null;
  correctIndex?: number;
  onSelect: (index: number) => void;
  disabled: boolean;
  showResult: boolean;
}

function ChoiceRenderer({
  choices,
  selectedIndex,
  correctIndex,
  onSelect,
  disabled,
  showResult,
}: ChoiceRendererProps) {
  return (
    <div className="mt-5 space-y-2.5" role="radiogroup" aria-label="選択肢">
      {choices.map((choice, idx) => {
        const letter = CHOICE_LETTERS[idx] ?? String(idx + 1);
        const isSelected = selectedIndex === idx;
        const isCorrectChoice = showResult && correctIndex === idx;
        const isWrongSelected = showResult && isSelected && !isCorrectChoice;

        let cardClass =
          'border-slate-200 bg-white text-slate-800 hover:border-indigo-300 hover:bg-indigo-50/30';
        let badgeClass = 'bg-slate-100 text-slate-600 border-slate-200';

        if (showResult) {
          if (isCorrectChoice) {
            cardClass =
              'border-emerald-500 bg-emerald-50/85 text-emerald-950 ring-1 ring-emerald-500/25';
            badgeClass = 'bg-emerald-600 text-white border-emerald-600';
          } else if (isWrongSelected) {
            cardClass =
              'border-rose-400 bg-rose-50/85 text-rose-950 ring-1 ring-rose-400/20';
            badgeClass = 'bg-rose-500 text-white border-rose-500';
          } else {
            cardClass = 'border-slate-200/80 bg-slate-50/60 text-slate-500 opacity-75';
            badgeClass = 'bg-slate-100 text-slate-400 border-slate-200';
          }
        } else if (isSelected) {
          cardClass =
            'border-indigo-600 bg-indigo-50/75 text-indigo-950 ring-1 ring-indigo-600/20 shadow-2xs';
          badgeClass = 'bg-indigo-600 text-white border-indigo-600';
        }

        return (
          <button
            key={idx}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onSelect(idx)}
            className={`flex min-h-[54px] w-full items-center gap-3 rounded-2xl border-2 px-3.5 py-3 text-left transition active:scale-[0.99] ${cardClass} ${
              disabled ? 'cursor-default' : 'cursor-pointer'
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-xs font-extrabold transition ${badgeClass}`}
            >
              {letter}
            </span>
            <span className="flex-1 text-sm leading-relaxed font-semibold sm:text-[15px]">
              {choice}
            </span>
            {showResult && isCorrectChoice ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-bold text-white">
                <Check className="h-3.5 w-3.5" />
                正解
              </span>
            ) : null}
            {showResult && isWrongSelected ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-rose-500 px-2.5 py-0.5 text-[11px] font-bold text-white">
                <X className="h-3.5 w-3.5" />
                不正解
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function QuestionCard({
  question,
  answer,
  onChange,
  disabled = false,
  showResult = false,
  questionNumber,
  points,
  isBookmarked = false,
  onToggleBookmark,
}: QuestionCardProps) {
  const { openCalculator } = useCalculator();
  const track = getTrackById(question.examId, question.trackId);
  const showCalculatorBtn = examHasTool(question.examId, 'calculator');

  const safeJournalAnswer = useMemo(() => {
    if (answer.type === 'journal') return answer;
    const fallback = createEmptyAnswer(question);
    return fallback.type === 'journal'
      ? fallback
      : { type: 'journal' as const, debit: [], credit: [] };
  }, [answer, question]);

  const safeChoiceIndex = answer.type === 'choice' ? answer.choiceIndex : null;

  return (
    <article className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs sm:p-6">
      {/* Header Bar */}
      <div className="flex items-start justify-between gap-2 pb-3.5 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {questionNumber !== undefined ? (
            <span className="inline-flex items-center rounded-lg bg-slate-900 px-2 py-0.5 text-xs font-extrabold text-white tabular-nums">
              Q{questionNumber}
            </span>
          ) : null}
          {points !== undefined ? (
            <span className="inline-flex items-center rounded-lg bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200/80 tabular-nums">
              {points}点
            </span>
          ) : null}
          <TrackBadge
            label={track?.shortName ?? question.trackId}
            color={track?.color ?? 'indigo'}
            size="xs"
          />
          <span className="inline-flex items-center rounded-md border border-slate-200/90 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
            {question.category}
          </span>
          <DifficultyStars difficulty={question.difficulty} />
          <span className="hidden items-center gap-1 text-[11px] font-medium text-slate-400 sm:inline-flex">
            <Clock className="h-3 w-3" />
            目安{formatEstimatedTime(question.estimatedSeconds)}
          </span>
        </div>

        {/* Utility Icons */}
        <div className="flex shrink-0 items-center gap-1">
          {showCalculatorBtn ? (
            <button
              type="button"
              onClick={openCalculator}
              className="inline-flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs font-bold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 active:scale-95"
              aria-label="電卓を開く"
              title="電卓を開く"
            >
              <Calculator className="h-4 w-4 text-indigo-600" />
              <span className="hidden sm:inline">電卓</span>
            </button>
          ) : null}

          {onToggleBookmark ? (
            <button
              type="button"
              onClick={onToggleBookmark}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border transition active:scale-95 ${
                isBookmarked
                  ? 'border-amber-300 bg-amber-50 text-amber-600'
                  : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300 hover:text-slate-600'
              }`}
              aria-label={isBookmarked ? 'ブックマークを解除' : 'ブックマークに追加'}
              aria-pressed={isBookmarked}
              title={isBookmarked ? 'ブックマーク済み' : 'ブックマークに追加'}
            >
              <Bookmark
                className={`h-4 w-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`}
              />
            </button>
          ) : null}
        </div>
      </div>

      {/* Question Title & Prompt */}
      <div className="mt-4">
        {question.title ? (
          <h2 className="mb-1.5 text-xs font-bold tracking-wide text-indigo-600">
            {question.title}
          </h2>
        ) : null}
        <p className="text-[15px] leading-[1.8] font-medium whitespace-pre-line text-slate-800 sm:text-base">
          {question.prompt}
        </p>
      </div>

      {/* Optional Financial/Context Table */}
      {question.contextTable ? <ContextTableCard table={question.contextTable} /> : null}

      {/* Composable Question Input Area */}
      {question.type === 'journal' && question.journalSpec ? (
        <JournalBuilder
          questionId={question.id}
          spec={question.journalSpec}
          debit={safeJournalAnswer.debit}
          credit={safeJournalAnswer.credit}
          onChange={(next) =>
            onChange({
              type: 'journal',
              debit: next.debit,
              credit: next.credit,
            })
          }
          disabled={disabled}
          showResult={showResult}
        />
      ) : question.type === 'choice' && question.choices ? (
        <ChoiceRenderer
          choices={question.choices}
          selectedIndex={safeChoiceIndex}
          correctIndex={question.correctChoiceIndex}
          onSelect={(choiceIndex) => onChange({ type: 'choice', choiceIndex })}
          disabled={disabled}
          showResult={showResult}
        />
      ) : null}
    </article>
  );
}
