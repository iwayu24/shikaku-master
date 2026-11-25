'use client';

import React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Award,
  BookOpen,
  Calculator,
  CheckCircle2,
  ChevronRight,
  Info,
  Lightbulb,
  ListChecks,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { ElementBadge } from '@/components/ui/CommonUI';
import type { UserAnswer } from '@/components/study/QuestionCard';
import { formatYen } from '@/lib/constants';
import type {
  BoxDiagram,
  ContextTable,
  ExplanationBlock,
  JournalLine,
  Question,
} from '@/types/exam';

export interface ExplanationPanelProps {
  question: Question;
  userAnswer?: UserAnswer;
  isCorrect?: boolean;
  compact?: boolean;
}

const CHOICE_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

function isNumericLikeCell(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  return /^[-+▲△¥￥(（]?\d[\d,.\s%％円個回倍時間点分秒)）]*$/.test(trimmed);
}

function JournalBreakdownCard({
  title = '正解の仕訳（要素・増減つき）',
  debit,
  credit,
}: {
  title?: string;
  debit: JournalLine[];
  credit: JournalLine[];
}) {
  const debitTotal = debit.reduce((sum, l) => sum + l.amount, 0);
  const creditTotal = credit.reduce((sum, l) => sum + l.amount, 0);

  const renderLines = (lines: JournalLine[], side: 'debit' | 'credit') => {
    const isDebit = side === 'debit';
    return (
      <div className="flex flex-col">
        <div
          className={`flex items-center justify-between px-3.5 py-2 text-xs font-extrabold ${
            isDebit
              ? 'bg-blue-50/90 text-blue-900 border-b border-blue-100'
              : 'bg-rose-50/85 text-rose-900 border-b border-rose-100'
          }`}
        >
          <span>{isDebit ? '借方（左）' : '貸方（右）'}</span>
          <span className="tabular-nums opacity-80">{formatYen(isDebit ? debitTotal : creditTotal)}</span>
        </div>
        <div className="divide-y divide-slate-100 bg-white">
          {lines.map((line, idx) => (
            <div
              key={`${line.account}-${idx}`}
              className="flex items-center justify-between gap-2 px-3.5 py-2.5"
            >
              <div className="min-w-0 space-y-1">
                <div className="truncate text-sm font-bold text-slate-900">
                  {line.account}
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <ElementBadge element={line.element} size="xs" />
                  <span
                    className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                      line.direction === 'increase'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                        : 'bg-slate-100 text-slate-600 border border-slate-200/80'
                    }`}
                  >
                    {line.direction === 'increase' ? (
                      <>
                        <ArrowUpRight className="h-3 w-3" />
                        増加
                      </>
                    ) : (
                      <>
                        <ArrowDownRight className="h-3 w-3" />
                        減少
                      </>
                    )}
                  </span>
                </div>
              </div>
              <span className="shrink-0 text-sm font-extrabold text-slate-900 tabular-nums">
                {formatYen(line.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
      <div className="flex items-center justify-between border-b border-slate-200/90 bg-slate-50/90 px-3.5 py-2">
        <span className="text-xs font-bold text-slate-700">{title}</span>
        {debitTotal === creditTotal && debitTotal > 0 ? (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 tabular-nums">
            貸借一致 {formatYen(debitTotal)}
          </span>
        ) : null}
      </div>
      <div className="grid grid-cols-1 divide-y divide-slate-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        {renderLines(debit, 'debit')}
        {renderLines(credit, 'credit')}
      </div>
    </div>
  );
}

function BoxDiagramCard({ diagram }: { diagram: BoxDiagram }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
      <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 bg-slate-50 px-3.5 py-2">
        <span className="text-xs font-bold text-slate-800">{diagram.title}</span>
        {diagram.unit ? (
          <span className="rounded-md bg-slate-200/70 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
            単位: {diagram.unit}
          </span>
        ) : null}
      </div>

      <div className="p-3.5 sm:p-4">
        <div className="overflow-hidden rounded-xl border-2 border-slate-300 bg-white">
          <div className="grid grid-cols-2 divide-x-2 divide-slate-300">
            {/* Left Side: 期首/月初 + 当期投入 */}
            <div className="divide-y divide-dashed divide-slate-200 bg-blue-50/35">
              <div className="p-3">
                <div className="text-[11px] font-bold text-blue-700">
                  {diagram.leftTop.label}
                </div>
                <div className="mt-1 text-sm font-extrabold text-slate-900 tabular-nums sm:text-[15px]">
                  {diagram.leftTop.value}
                </div>
              </div>
              <div className="p-3">
                <div className="text-[11px] font-bold text-blue-700">
                  {diagram.leftBottom.label}
                </div>
                <div className="mt-1 text-sm font-extrabold text-slate-900 tabular-nums sm:text-[15px]">
                  {diagram.leftBottom.value}
                </div>
              </div>
            </div>

            {/* Right Side: 完成品/売上原価 + 期末/月末 */}
            <div className="divide-y divide-dashed divide-slate-200 bg-emerald-50/35">
              <div className="p-3">
                <div className="text-[11px] font-bold text-emerald-700">
                  {diagram.rightTop.label}
                </div>
                <div className="mt-1 text-sm font-extrabold text-slate-900 tabular-nums sm:text-[15px]">
                  {diagram.rightTop.value}
                </div>
              </div>
              <div className="p-3">
                <div className="text-[11px] font-bold text-emerald-700">
                  {diagram.rightBottom.label}
                </div>
                <div className="mt-1 text-sm font-extrabold text-slate-900 tabular-nums sm:text-[15px]">
                  {diagram.rightBottom.value}
                </div>
              </div>
            </div>
          </div>
        </div>

        {diagram.note ? (
          <p className="mt-2.5 text-xs leading-relaxed text-slate-600">{diagram.note}</p>
        ) : null}
      </div>
    </div>
  );
}

function FormulaCard({
  title = '計算式',
  expression,
  note,
}: {
  title?: string;
  expression: string;
  note?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-3.5 sm:p-4">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-600">
        <Calculator className="h-3.5 w-3.5 text-indigo-600" />
        <span>{title}</span>
      </div>
      <div className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 font-mono text-xs leading-relaxed font-semibold whitespace-pre-line text-slate-900 tabular-nums sm:text-[13px]">
        {expression}
      </div>
      {note ? (
        <p className="mt-2 text-xs leading-relaxed text-slate-600">{note}</p>
      ) : null}
    </div>
  );
}

function StepsCard({
  title = 'ステップ別解説',
  items,
}: {
  title?: string;
  items: string[];
}) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4">
      <div className="mb-3 flex items-center gap-1.5 text-xs font-bold text-slate-700">
        <ListChecks className="h-4 w-4 text-indigo-600" />
        <span>{title}</span>
      </div>
      <ol className="space-y-3">
        {items.map((step, idx) => (
          <li key={idx} className="relative flex items-start gap-3">
            {idx < items.length - 1 ? (
              <span
                className="absolute top-6 bottom-[-12px] left-[11px] w-px bg-indigo-100"
                aria-hidden="true"
              />
            ) : null}
            <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-extrabold text-white tabular-nums shadow-2xs">
              {idx + 1}
            </span>
            <p className="flex-1 pt-0.5 text-sm leading-relaxed text-slate-700">
              {step}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ExplanationTableCard({ table }: { table: ContextTable }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
      {table.title ? (
        <div className="border-b border-slate-200/80 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700">
          {table.title}
        </div>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[260px] border-collapse text-left text-xs sm:text-[13px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600">
              {table.headers.map((header, idx) => (
                <th key={idx} className="whitespace-nowrap px-3.5 py-2 font-bold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {table.rows.map((row, rIdx) => (
              <tr key={rIdx}>
                {row.map((cell, cIdx) => {
                  const numeric = cIdx > 0 && isNumericLikeCell(cell);
                  return (
                    <td
                      key={cIdx}
                      className={`px-3.5 py-2.5 text-slate-800 ${
                        numeric
                          ? 'whitespace-nowrap text-right font-semibold tabular-nums'
                          : cIdx === 0
                            ? 'font-bold text-slate-900'
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

function ExtraBlockRenderer({ block }: { block: ExplanationBlock }) {
  switch (block.type) {
    case 'steps':
      return <StepsCard title={block.title ?? '補足ステップ'} items={block.items} />;
    case 'formula':
      return (
        <FormulaCard
          title={block.title ?? '公式・計算式'}
          expression={block.expression}
          note={block.note}
        />
      );
    case 'journal':
      return (
        <JournalBreakdownCard
          title={block.title ?? '関連仕訳'}
          debit={block.debit}
          credit={block.credit}
        />
      );
    case 'box-diagram':
      return <BoxDiagramCard diagram={block.diagram} />;
    case 'table':
      return <ExplanationTableCard table={block.table} />;
    case 'callout': {
      const styles =
        block.tone === 'warning'
          ? {
              wrap: 'border-rose-200 bg-rose-50/80 text-rose-950',
              icon: <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />,
            }
          : block.tone === 'tip'
            ? {
                wrap: 'border-emerald-200 bg-emerald-50/80 text-emerald-950',
                icon: <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />,
              }
            : {
                wrap: 'border-sky-200 bg-sky-50/80 text-sky-950',
                icon: <Info className="h-4 w-4 text-sky-600 shrink-0" />,
              };
      return (
        <div className={`rounded-2xl border p-3.5 sm:p-4 ${styles.wrap}`}>
          <div className="flex items-center gap-1.5 text-xs font-extrabold">
            {styles.icon}
            <span>{block.title}</span>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed opacity-90">{block.body}</p>
        </div>
      );
    }
  }
}

export function ExplanationPanel({
  question,
  isCorrect,
  compact = false,
}: ExplanationPanelProps) {
  const { explanation } = question;
  const correctChoiceLetter =
    question.type === 'choice' &&
    question.correctChoiceIndex !== undefined &&
    question.choices?.[question.correctChoiceIndex] !== undefined
      ? `${CHOICE_LETTERS[question.correctChoiceIndex] ?? question.correctChoiceIndex + 1}. ${question.choices[question.correctChoiceIndex]}`
      : null;

  return (
    <section
      aria-label="解説"
      className={`rounded-2xl border border-slate-200/90 bg-white shadow-xs ${
        compact ? 'space-y-3 p-3.5 sm:p-4' : 'space-y-4 p-4 sm:p-6'
      }`}
    >
      {/* Result Header */}
      {isCorrect !== undefined ? (
        <div
          className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 ${
            isCorrect
              ? 'border-emerald-200 bg-emerald-50/90 text-emerald-950'
              : 'border-rose-200 bg-rose-50/90 text-rose-950'
          }`}
        >
          {isCorrect ? (
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
          ) : (
            <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-rose-500" />
          )}
          <div className="min-w-0 flex-1">
            <div className="text-base font-extrabold tracking-tight">
              {isCorrect ? '正解！ナイス！' : '惜しい！ここでしっかり定着させよう'}
            </div>
            {!isCorrect && correctChoiceLetter ? (
              <div className="mt-1 text-xs font-bold text-rose-800">
                正解：{correctChoiceLetter}
              </div>
            ) : (
              <p className="mt-0.5 text-xs font-medium opacity-80">
                {isCorrect
                  ? '解説のポイントもサッと確認すると記憶が定着します。'
                  : '仕訳の要素・計算プロセスを下の解説で確認しましょう。'}
              </p>
            )}
          </div>
        </div>
      ) : null}

      {/* 要点 (Summary) Callout */}
      <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/65 p-3.5 sm:p-4">
        <div className="mb-1.5 flex items-center gap-1.5 text-xs font-extrabold text-indigo-700">
          <Lightbulb className="h-4 w-4 text-indigo-600" />
          <span>要点</span>
        </div>
        <p className="text-sm leading-relaxed font-semibold text-slate-800">
          {explanation.summary}
        </p>
      </div>

      {/* 色分け仕訳ビルダー表示 */}
      {explanation.journalBreakdown ? (
        <JournalBreakdownCard
          debit={explanation.journalBreakdown.debit}
          credit={explanation.journalBreakdown.credit}
        />
      ) : null}

      {/* ビジュアルボックス図 */}
      {explanation.boxDiagram ? (
        <BoxDiagramCard diagram={explanation.boxDiagram} />
      ) : null}

      {/* 計算式ボックス */}
      {explanation.calculation ? (
        <FormulaCard expression={explanation.calculation} />
      ) : null}

      {/* ステップ別解説 */}
      {explanation.steps.length > 0 ? <StepsCard items={explanation.steps} /> : null}

      {/* Composable Extra Blocks */}
      {explanation.extraBlocks && explanation.extraBlocks.length > 0 ? (
        <div className="space-y-3">
          {explanation.extraBlocks.map((block, idx) => (
            <ExtraBlockRenderer key={idx} block={block} />
          ))}
        </div>
      ) : null}

      {/* 合格ポイント & よくあるひっかけ */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {explanation.examTip ? (
          <div className="rounded-2xl border border-amber-200/90 bg-amber-50/75 p-3.5 sm:p-4">
            <div className="mb-1.5 flex items-center gap-1.5 text-xs font-extrabold text-amber-800">
              <Award className="h-4 w-4 text-amber-600" />
              <span>合格ポイント</span>
            </div>
            <p className="text-xs leading-relaxed font-medium text-amber-950/90 sm:text-[13px]">
              {explanation.examTip}
            </p>
          </div>
        ) : null}

        {explanation.commonMistake ? (
          <div className="rounded-2xl border border-rose-200/90 bg-rose-50/75 p-3.5 sm:p-4">
            <div className="mb-1.5 flex items-center gap-1.5 text-xs font-extrabold text-rose-800">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
              <span>よくあるひっかけ</span>
            </div>
            <p className="text-xs leading-relaxed font-medium text-rose-950/90 sm:text-[13px]">
              {explanation.commonMistake}
            </p>
          </div>
        ) : null}
      </div>

      {/* 関連用語 */}
      {explanation.relatedTerms && explanation.relatedTerms.length > 0 ? (
        <div className="border-t border-slate-100 pt-3">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <BookOpen className="h-3.5 w-3.5 text-slate-400" />
            <span>関連用語を辞典で確認</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {explanation.relatedTerms.map((term) => (
              <Link
                key={term}
                href={`/dictionary?q=${encodeURIComponent(term)}`}
                className="inline-flex min-h-[34px] items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
              >
                <span>{term}</span>
                <ChevronRight className="h-3 w-3 opacity-60" />
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
