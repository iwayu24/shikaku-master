'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Clock,
  History,
  Layers,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import { useExamStore } from '@/lib/storage';
import { ComingSoonBanner, TrackBadge } from '@/components/ui/CommonUI';
import { formatTimer } from '@/lib/constants';
import type { MockExam } from '@/types/exam';

type ModeFilter = 'all' | 'full' | 'half';

function formatShortDate(iso: string): string {
  try {
    const d = new Date(iso);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${month}/${day} ${hours}:${mins}`;
  } catch {
    return '';
  }
}

export default function MockExamListPage() {
  const {
    isLoaded,
    activeExam,
    activeExamMockResults,
    setActiveExamId,
  } = useExamStore();

  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [modeFilter, setModeFilter] = useState<ModeFilter>('all');
  const [expandedExamIds, setExpandedExamIds] = useState<Record<string, boolean>>({});

  const gradeOptions = useMemo(() => {
    const seen = new Set<string>();
    for (const exam of activeExam.mockExams) {
      seen.add(exam.gradeLabel);
    }
    return Array.from(seen);
  }, [activeExam.mockExams]);

  const effectiveGradeFilter =
    gradeFilter === 'all' || gradeOptions.includes(gradeFilter)
      ? gradeFilter
      : 'all';

  const filteredExams = useMemo(() => {
    return activeExam.mockExams.filter((exam) => {
      if (effectiveGradeFilter !== 'all' && exam.gradeLabel !== effectiveGradeFilter) {
        return false;
      }
      if (modeFilter !== 'all' && exam.mode !== modeFilter) {
        return false;
      }
      return true;
    });
  }, [activeExam.mockExams, effectiveGradeFilter, modeFilter]);

  const statsByMockId = useMemo(() => {
    const map = new Map<
      string,
      { bestScore: number; latestScore: number; attempts: number; passed: boolean }
    >();
    for (const res of activeExamMockResults) {
      const existing = map.get(res.mockExamId);
      if (!existing) {
        map.set(res.mockExamId, {
          bestScore: res.score,
          latestScore: res.score,
          attempts: 1,
          passed: res.passed,
        });
      } else {
        map.set(res.mockExamId, {
          bestScore: Math.max(existing.bestScore, res.score),
          latestScore: existing.latestScore,
          attempts: existing.attempts + 1,
          passed: existing.passed || res.passed,
        });
      }
    }
    return map;
  }, [activeExamMockResults]);

  const toggleExpanded = (id: string) => {
    setExpandedExamIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const recentAttempts = useMemo(
    () => activeExamMockResults.slice(0, 3),
    [activeExamMockResults]
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700">
              <ClipboardCheck className="h-3.5 w-3.5" />
              <span>CBT形式・自動採点＆全問解説つき</span>
            </div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
              模擬テスト一覧
            </h1>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm">
              制限時間タイマー・見直しフラグ・簿記電卓に対応。受験後は大問別スコア分析と詳しい解説で弱点を徹底補強できます。
            </p>
          </div>
          {isLoaded && activeExamMockResults.length > 0 ? (
            <Link
              href="/stats"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs font-bold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
            >
              <History className="h-4 w-4" />
              <span>受験履歴 ({activeExamMockResults.length}回)</span>
            </Link>
          ) : null}
        </div>
      </section>

      {/* Coming Soon Empty State */}
      {activeExam.mockExams.length === 0 ? (
        <section className="space-y-4">
          {activeExam.status === 'coming-soon' ? (
            <ComingSoonBanner
              examName={activeExam.name}
              onSwitchToBoki={() => setActiveExamId('boki')}
            />
          ) : null}

          <div className="rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <ClipboardCheck className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-base font-extrabold text-slate-900">
              {activeExam.shortName}の模擬テストを準備中です
            </h2>
            <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-slate-500">
              現在、{activeExam.name}の模擬テストを拡充中です。まずはスキマ学習のプレビュー問題、または日商簿記の本番模擬テストをお試しください。
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
              <Link
                href="/study"
                className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-teal-600 px-5 text-xs font-bold text-white transition hover:bg-teal-700"
              >
                <Zap className="h-4 w-4" />
                プレビュー問題を解く
              </Link>
              {activeExam.id !== 'boki' ? (
                <button
                  type="button"
                  onClick={() => setActiveExamId('boki')}
                  className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-indigo-600 px-5 text-xs font-bold text-white transition hover:bg-indigo-700"
                >
                  日商簿記の模擬テストへ
                </button>
              ) : null}
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* Recent Exam Attempts Summary Strip */}
          {isLoaded && recentAttempts.length > 0 ? (
            <section className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                  <History className="h-3.5 w-3.5" />
                  <span>最近の受験結果</span>
                </h2>
                <Link
                  href="/stats"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                >
                  すべての履歴 →
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {recentAttempts.map((attempt) => (
                  <Link
                    key={attempt.id}
                    href={`/mock-exam/${attempt.mockExamId}`}
                    className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-2xs transition hover:border-indigo-300 hover:shadow-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            attempt.passed
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {attempt.passed ? '合格' : `あと${Math.max(0, attempt.passingScore - attempt.score)}点`}
                        </span>
                        <span className="text-[11px] text-slate-400 tabular-nums">
                          {formatShortDate(attempt.completedAt)}
                        </span>
                      </div>
                      <div className="mt-1 truncate text-xs font-bold text-slate-900">
                        {attempt.examTitle}
                      </div>
                    </div>
                    <div className="shrink-0 text-right tabular-nums">
                      <div
                        className={`text-base font-extrabold ${
                          attempt.passed ? 'text-emerald-600' : 'text-slate-900'
                        }`}
                      >
                        {attempt.score}
                        <span className="text-[11px] font-semibold text-slate-400">
                          /{attempt.totalPoints}
                        </span>
                      </div>
                      <div className="text-[10px] font-medium text-slate-400">
                        {formatTimer(attempt.durationSeconds)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {/* Filter Tabs */}
          <section className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
            {/* Grade Filter */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-[11px] font-bold text-slate-400">級・区分:</span>
              <button
                type="button"
                onClick={() => setGradeFilter('all')}
                className={`min-h-[36px] rounded-xl px-3.5 text-xs font-bold transition ${
                  effectiveGradeFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                すべて
              </button>
              {gradeOptions.map((grade) => (
                <button
                  key={grade}
                  type="button"
                  onClick={() => setGradeFilter(grade)}
                  className={`min-h-[36px] rounded-xl px-3.5 text-xs font-bold transition ${
                    effectiveGradeFilter === grade
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  {grade}
                </button>
              ))}
            </div>

            {/* Mode Filter */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-[11px] font-bold text-slate-400">形式:</span>
              {(
                [
                  { id: 'all', label: 'すべて' },
                  { id: 'full', label: '本番模試' },
                  { id: 'half', label: 'ハーフ模試' },
                ] as { id: ModeFilter; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setModeFilter(tab.id)}
                  className={`min-h-[36px] rounded-xl px-3.5 text-xs font-bold transition ${
                    modeFilter === tab.id
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </section>

          {/* Filtered Mock Exam Cards */}
          {filteredExams.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <p className="text-sm font-bold text-slate-700">
                条件に一致する模擬テストがありません
              </p>
              <button
                type="button"
                onClick={() => {
                  setGradeFilter('all');
                  setModeFilter('all');
                }}
                className="mt-3 inline-flex h-10 items-center rounded-xl bg-slate-900 px-4 text-xs font-bold text-white"
              >
                フィルターをリセット
              </button>
            </div>
          ) : (
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredExams.map((exam: MockExam) => {
                const stats = isLoaded ? statsByMockId.get(exam.id) : undefined;
                const totalQuestions = exam.sections.reduce(
                  (sum, sec) => sum + sec.questionIds.length,
                  0
                );
                const isExpanded = Boolean(expandedExamIds[exam.id]);

                return (
                  <article
                    key={exam.id}
                    className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-indigo-200 hover:shadow-md"
                  >
                    <div>
                      {/* Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <TrackBadge
                            label={exam.gradeLabel}
                            color={exam.gradeLabel.includes('3') ? 'emerald' : 'indigo'}
                          />
                          <span
                            className={`rounded-md px-2.5 py-0.5 text-xs font-bold ${
                              exam.mode === 'full'
                                ? 'bg-slate-900 text-white'
                                : 'bg-sky-50 text-sky-700 border border-sky-200'
                            }`}
                          >
                            {exam.mode === 'full' ? '本番模試' : 'ハーフ模試'}
                          </span>
                        </div>

                        {stats?.passed ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            合格ライン到達済
                          </span>
                        ) : null}
                      </div>

                      {/* Title & Subtitle */}
                      <h2 className="mt-3 text-lg font-extrabold tracking-tight text-slate-900">
                        {exam.title}
                      </h2>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">
                        {exam.subtitle}
                      </p>

                      {/* Spec Pills */}
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <div className="rounded-xl bg-slate-50 px-3 py-2 text-center">
                          <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-500">
                            <Clock className="h-3 w-3" />
                            制限時間
                          </div>
                          <div className="mt-0.5 text-sm font-extrabold text-slate-900 tabular-nums">
                            {exam.durationMinutes}分
                          </div>
                        </div>
                        <div className="rounded-xl bg-slate-50 px-3 py-2 text-center">
                          <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-500">
                            <Layers className="h-3 w-3" />
                            問題数
                          </div>
                          <div className="mt-0.5 text-sm font-extrabold text-slate-900 tabular-nums">
                            全{totalQuestions}問
                          </div>
                        </div>
                        <div className="rounded-xl bg-slate-50 px-3 py-2 text-center">
                          <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-500">
                            <Award className="h-3 w-3" />
                            合格基準
                          </div>
                          <div className="mt-0.5 text-sm font-extrabold text-slate-900 tabular-nums">
                            {exam.passingScore}点/{exam.totalPoints}点
                          </div>
                        </div>
                      </div>

                      {/* User Best Score & Attempts */}
                      <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5">
                        {stats ? (
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="inline-flex items-center gap-1.5 font-bold text-slate-700">
                              {stats.passed ? (
                                <Trophy className="h-4 w-4 text-emerald-600" />
                              ) : (
                                <Target className="h-4 w-4 text-amber-600" />
                              )}
                              最高スコア
                            </span>
                            <div className="flex items-center gap-2.5 tabular-nums">
                              <span
                                className={`text-sm font-extrabold ${
                                  stats.passed ? 'text-emerald-600' : 'text-amber-700'
                                }`}
                              >
                                {stats.bestScore} / {exam.totalPoints}点
                              </span>
                              <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-500 border border-slate-200/80">
                                受験 {stats.attempts}回
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="font-semibold">まだ受験していません</span>
                            <span className="text-[11px] font-bold text-indigo-600">
                              初挑戦で実力診断
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Expandable Section Breakdown */}
                      <div className="mt-3.5">
                        <button
                          type="button"
                          onClick={() => toggleExpanded(exam.id)}
                          aria-expanded={isExpanded}
                          className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                        >
                          <span>大問別配点を見る（全{exam.sections.length}大問）</span>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-slate-400" />
                          )}
                        </button>

                        {isExpanded ? (
                          <div className="mt-1.5 space-y-1.5 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-3">
                            {exam.sections.map((sec) => {
                              const secMax =
                                sec.questionIds.length * sec.pointsPerQuestion;
                              return (
                                <div
                                  key={sec.id}
                                  className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2 text-xs shadow-2xs"
                                >
                                  <div className="min-w-0">
                                    <div className="font-bold text-slate-900">
                                      {sec.title}
                                    </div>
                                    <div className="truncate text-[11px] text-slate-500">
                                      {sec.subtitle}
                                    </div>
                                  </div>
                                  <div className="shrink-0 text-right tabular-nums">
                                    <div className="font-extrabold text-indigo-700">
                                      {secMax}点
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                      {sec.questionIds.length}問 × {sec.pointsPerQuestion}点
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Primary Start CTA */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <Link
                        href={`/mock-exam/${exam.id}`}
                        className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98]"
                      >
                        <span>模擬テストを始める</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </>
      )}
    </div>
  );
}
