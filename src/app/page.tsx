'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Calculator,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Flame,
  Layers,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import { useExamStore } from '@/lib/storage';
import { useCalculator } from '@/components/layout/AppShell';
import {
  ComingSoonBanner,
  ProgressRing,
  TrackBadge,
} from '@/components/ui/CommonUI';
import { formatNumber, getTrackColorStyle } from '@/lib/constants';
import type { MockExam } from '@/types/exam';

function getQuickPillLabel(examId: string, trackId: string, shortName: string): string {
  if (examId === 'boki') {
    if (trackId === '3kyu') return '3級 5問';
    if (trackId === '2kyu-shogyo') return '2級商業 5問';
    if (trackId === '2kyu-kogyo') return '2級工業 5問';
  }
  return `${shortName} 5問`;
}

export default function HomePage() {
  const {
    isLoaded,
    progress,
    activeExam,
    allExams,
    todayCount,
    effectiveStreak,
    weakQuestionIds,
    bookmarkedQuestionIds,
    activeExamMockResults,
    setActiveExamId,
    getTrackMastery,
    getOverallMastery,
  } = useExamStore();
  const { openCalculator } = useCalculator();

  const dailyGoal = progress.dailyGoal;
  const dailyPercent = Math.min(100, Math.round((todayCount / Math.max(1, dailyGoal)) * 100));
  const dailyCompleted = isLoaded && todayCount >= dailyGoal;

  const trackMasteries = useMemo(
    () => getTrackMastery(activeExam.id),
    [getTrackMastery, activeExam.id]
  );
  const overallMastery = useMemo(
    () => getOverallMastery(activeExam.id),
    [getOverallMastery, activeExam.id]
  );

  const bestScoreByMockId = useMemo(() => {
    const map = new Map<string, { bestScore: number; passed: boolean; attempts: number }>();
    for (const result of activeExamMockResults) {
      const existing = map.get(result.mockExamId);
      if (!existing) {
        map.set(result.mockExamId, {
          bestScore: result.score,
          passed: result.passed,
          attempts: 1,
        });
      } else {
        map.set(result.mockExamId, {
          bestScore: Math.max(existing.bestScore, result.score),
          passed: existing.passed || result.passed,
          attempts: existing.attempts + 1,
        });
      }
    }
    return map;
  }, [activeExamMockResults]);

  const hasCalculator = activeExam.tools.includes('calculator');
  const isComingSoon = activeExam.status === 'coming-soon';

  const featuredMockExams: MockExam[] = useMemo(
    () => activeExam.mockExams.slice(0, 4),
    [activeExam.mockExams]
  );

  const quickLaunchTracks = useMemo(
    () =>
      activeExam.tracks.filter((track) =>
        activeExam.questions.some((q) => q.trackId === track.id)
      ),
    [activeExam]
  );

  return (
    <div className="space-y-6">
      {/* Top Hero Card */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F172A] via-slate-900 to-indigo-950 p-5 text-white shadow-lg sm:p-7">
        {/* Subtle decorative glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-16 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-emerald-500/15 blur-3xl"
        />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: Exam Identity + Streak / XP */}
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                  isComingSoon
                    ? 'bg-teal-400/20 text-teal-200 ring-1 ring-teal-300/30'
                    : 'bg-emerald-400/20 text-emerald-200 ring-1 ring-emerald-300/30'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isComingSoon ? 'bg-teal-300' : 'bg-emerald-400'
                  }`}
                />
                {isComingSoon ? '拡張プレビュー' : 'アクティブコース'}
              </span>

              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2.5 py-1 text-[11px] font-bold text-amber-200 ring-1 ring-amber-300/25 tabular-nums">
                <Flame className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {isLoaded ? `${effectiveStreak}日連続` : '0日連続'}
              </span>

              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-indigo-100 ring-1 ring-white/15 tabular-nums">
                <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
                {isLoaded ? `${formatNumber(progress.xp)} XP` : '0 XP'}
              </span>
            </div>

            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                {activeExam.name}
              </h1>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-300 sm:text-sm">
                {activeExam.tagline}
              </p>
            </div>
          </div>

          {/* Right: Crisp Elevated Daily Goal Ring Tile */}
          <div className="flex shrink-0 items-center justify-between gap-4 rounded-2xl bg-white/95 px-4 py-3 text-slate-900 shadow-md sm:flex-col sm:justify-center sm:px-5 sm:py-4">
            <ProgressRing
              value={isLoaded ? dailyPercent : 0}
              size={84}
              strokeWidth={7}
              color={dailyCompleted ? '#10B981' : '#4F46E5'}
              trackColor="#E2E8F0"
              label={isLoaded ? `${todayCount}/${dailyGoal}` : `0/${dailyGoal}`}
              sublabel="今日の目標"
            />
            <div className="text-right sm:text-center">
              <div className="text-xs font-bold text-slate-900">
                {dailyCompleted ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    目標達成！
                  </span>
                ) : (
                  <span className="tabular-nums">
                    あと {Math.max(0, dailyGoal - (isLoaded ? todayCount : 0))} 問
                  </span>
                )}
              </div>
              <div className="mt-0.5 text-[11px] text-slate-500 tabular-nums">
                全体習得 {isLoaded ? overallMastery.masteryRate : 0}%
              </div>
            </div>
          </div>
        </div>

        {/* Big Primary CTA */}
        <div className="relative mt-5">
          <Link
            href="/study?mode=quick&count=5&autostart=1"
            className="group flex min-h-[56px] w-full items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-500 to-emerald-500 px-5 py-3.5 text-white shadow-md shadow-indigo-950/30 transition hover:brightness-105 active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xs">
                <Zap className="h-5 w-5 fill-amber-300 text-amber-200" />
              </span>
              <div className="text-left">
                <div className="text-sm font-extrabold tracking-tight sm:text-base">
                  {isComingSoon
                    ? '⚡ プレビュー問題を体験スタート'
                    : '⚡ 1分スキマ学習をスタート（5問）'}
                </div>
                <div className="text-[11px] font-medium text-indigo-100">
                  {isComingSoon
                    ? 'サンプル問題と詳しい解説を今すぐチェック'
                    : '未解答・苦手問題を優先出題して効率アップ'}
                </div>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Quick-Launch Horizontal Pills */}
        <div className="relative mt-3.5 -mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1">
          {quickLaunchTracks.map((track) => (
            <Link
              key={track.id}
              href={`/study?mode=track&track=${encodeURIComponent(track.id)}&count=5&autostart=1`}
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 text-xs font-bold text-white backdrop-blur-xs transition hover:bg-white/20 active:scale-95"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: track.hexColor }}
              />
              <span>{getQuickPillLabel(activeExam.id, track.id, track.shortName)}</span>
            </Link>
          ))}

          <Link
            href="/study?mode=weak&autostart=1"
            className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-xs font-bold backdrop-blur-xs transition active:scale-95 tabular-nums ${
              isLoaded && weakQuestionIds.length > 0
                ? 'border-amber-300/40 bg-amber-400/20 text-amber-100 hover:bg-amber-400/30'
                : 'border-white/15 bg-white/10 text-slate-200 hover:bg-white/20'
            }`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>苦手復習 ({isLoaded ? weakQuestionIds.length : 0}問)</span>
          </Link>
        </div>
      </section>

      {/* Coming Soon Mode (e.g., 中小企業診断士) */}
      {isComingSoon ? (
        <section className="space-y-4">
          <ComingSoonBanner
            examName={activeExam.name}
            onSwitchToBoki={() => setActiveExamId('boki')}
          />

          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 sm:text-lg">
                  全{activeExam.tracks.length}科目 学習ロードマップ
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  公式カリキュラムに沿った科目設計済み。プレビュー問題からすぐに試せます。
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/study"
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-teal-600 px-4 text-xs font-bold text-white shadow-xs transition hover:bg-teal-700 active:scale-[0.98]"
                >
                  <Zap className="h-4 w-4" />
                  プレビュー問題を解く（{activeExam.questions.length}問）
                </Link>
                <button
                  type="button"
                  onClick={() => setActiveExamId('boki')}
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  日商簿記へ切替
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {activeExam.tracks.map((track, idx) => {
                const count = activeExam.questions.filter(
                  (q) => q.trackId === track.id
                ).length;
                const style = getTrackColorStyle(track.color);

                return (
                  <div
                    key={track.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 transition hover:border-slate-300 hover:bg-white"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-slate-400 tabular-nums">
                          科目 {idx + 1}
                        </span>
                        <TrackBadge
                          label={count > 0 ? `プレビュー ${count}問` : '近日公開'}
                          color={count > 0 ? track.color : 'teal'}
                          size="xs"
                        />
                      </div>
                      <h3 className="mt-2 text-sm font-bold text-slate-900">
                        {track.name}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">
                        {track.description}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {track.categories.map((cat) => (
                          <span
                            key={cat}
                            className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${style.badgeClass}`}
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>

                    {count > 0 ? (
                      <Link
                        href={`/study?mode=track&track=${encodeURIComponent(track.id)}&autostart=1`}
                        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-1 rounded-xl bg-slate-900 px-3 text-xs font-bold text-white transition hover:bg-indigo-600"
                      >
                        この科目のサンプルを解く
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : (
        /* Active Exam: Track Mastery Section */
        <section className="space-y-3.5">
          <div className="flex items-end justify-between gap-2">
            <div>
              <h2 className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
                トラック別マスター進捗
              </h2>
              <p className="text-xs text-slate-500">
                科目・論点ごとの習得度を確認して、ピンポイント演習へ
              </p>
            </div>
            <Link
              href="/stats"
              className="inline-flex items-center gap-0.5 text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              詳細分析
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {activeExam.tracks.map((track) => {
              const mastery = trackMasteries.find((m) => m.trackId === track.id);
              const style = getTrackColorStyle(track.color);
              const total = mastery?.totalQuestions ?? 0;
              const attempted = isLoaded ? (mastery?.attemptedQuestions ?? 0) : 0;
              const masteryRate = isLoaded ? (mastery?.masteryRate ?? 0) : 0;
              const accuracy = isLoaded ? (mastery?.accuracy ?? 0) : 0;

              return (
                <div
                  key={track.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition hover:border-slate-300 sm:p-5"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <TrackBadge label={track.shortName} color={track.color} />
                      <span className={`text-lg font-extrabold tabular-nums ${style.accentClass}`}>
                        {masteryRate}%
                      </span>
                    </div>

                    <h3 className="mt-2.5 text-sm font-extrabold text-slate-900">
                      {track.name}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500 line-clamp-2">
                      {track.description}
                    </p>

                    {/* Mastery Progress Bar */}
                    <div className="mt-3.5">
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${style.barClass}`}
                          style={{ width: `${masteryRate}%` }}
                        />
                      </div>
                      <div className="mt-1.5 flex items-center justify-between text-[11px] font-medium text-slate-500 tabular-nums">
                        <span>
                          解答済 {attempted} / {total}問
                        </span>
                        <span>
                          正答率 {attempted > 0 ? `${accuracy}%` : '--'}
                        </span>
                      </div>
                    </div>

                    {/* Top Categories Quick-Tap Pills */}
                    {track.categories.length > 0 ? (
                      <div className="mt-3.5 flex flex-wrap gap-1.5">
                        {track.categories.slice(0, 4).map((category) => (
                          <Link
                            key={category}
                            href={`/study?mode=category&track=${encodeURIComponent(track.id)}&category=${encodeURIComponent(category)}&autostart=1`}
                            className="inline-flex min-h-[30px] items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                          >
                            {category}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <Link
                      href={`/study?mode=track&track=${encodeURIComponent(track.id)}&autostart=1`}
                      className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white transition hover:bg-indigo-600 active:scale-[0.98]"
                    >
                      <span>演習する</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Mock Exams Spotlight */}
      {featuredMockExams.length > 0 ? (
        <section className="space-y-3.5">
          <div className="flex items-end justify-between gap-2">
            <div>
              <h2 className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
                本番＆ハーフ模擬テスト
              </h2>
              <p className="text-xs text-slate-500">
                ネット試験（CBT）形式で実戦力をチェック・70点以上で合格ライン
              </p>
            </div>
            <Link
              href="/mock-exam"
              className="inline-flex items-center gap-0.5 text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              すべて見る
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {featuredMockExams.map((exam) => {
              const stats = isLoaded ? bestScoreByMockId.get(exam.id) : undefined;
              const questionCount = exam.sections.reduce(
                (sum, sec) => sum + sec.questionIds.length,
                0
              );

              return (
                <div
                  key={exam.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition hover:border-indigo-200 hover:shadow-sm sm:p-5"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <TrackBadge
                          label={exam.gradeLabel}
                          color={exam.gradeLabel.includes('3') ? 'emerald' : 'indigo'}
                          size="xs"
                        />
                        <span
                          className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                            exam.mode === 'full'
                              ? 'bg-slate-900 text-white'
                              : 'bg-sky-50 text-sky-700 border border-sky-200'
                          }`}
                        >
                          {exam.mode === 'full' ? '本番模試' : 'ハーフ模試'}
                        </span>
                      </div>

                      {stats ? (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold tabular-nums ${
                            stats.passed
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {stats.passed ? (
                            <Trophy className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <Target className="h-3 w-3 text-amber-600" />
                          )}
                          最高 {stats.bestScore}点
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400">
                          未受験
                        </span>
                      )}
                    </div>

                    <h3 className="mt-2.5 text-sm font-extrabold text-slate-900 sm:text-base">
                      {exam.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      {exam.subtitle}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600 tabular-nums">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {exam.durationMinutes}分
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ClipboardCheck className="h-3.5 w-3.5 text-slate-400" />
                        全{questionCount}問
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Award className="h-3.5 w-3.5 text-slate-400" />
                        合格 {exam.passingScore}点/{exam.totalPoints}点
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Link
                      href={`/mock-exam/${exam.id}`}
                      className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white shadow-2xs transition hover:bg-indigo-700 active:scale-[0.98]"
                    >
                      <span>{stats ? 'もう一度受験する' : '模擬テストを始める'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* Quick Tools & Multi-Exam Platform Section */}
      <section className="space-y-3.5">
        <h2 className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
          クイックツール & 拡張プラットフォーム
        </h2>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Reference Dictionary Quick Card */}
          <Link
            href="/dictionary"
            className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition hover:border-indigo-300 hover:shadow-sm"
          >
            <div className="flex items-center gap-3.5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                <BookOpen className="h-5 w-5" />
              </span>
              <div>
                <div className="text-sm font-extrabold text-slate-900">
                  {activeExam.referenceTitle}
                </div>
                <div className="mt-0.5 text-xs text-slate-500 tabular-nums">
                  {activeExam.references.length}語を収録・すぐに検索
                </div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-indigo-600" />
          </Link>

          {/* Calculator Quick Card */}
          {hasCalculator ? (
            <button
              type="button"
              onClick={openCalculator}
              className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-xs transition hover:border-emerald-300 hover:shadow-sm active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white">
                  <Calculator className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-sm font-extrabold text-slate-900">
                    簿記電卓を開く
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    00キー対応・いつでも即計算
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-emerald-600" />
            </button>
          ) : (
            <Link
              href="/stats"
              className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition hover:border-emerald-300 hover:shadow-sm"
            >
              <div className="flex items-center gap-3.5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white">
                  <BarChart3 className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-sm font-extrabold text-slate-900">
                    学習分析・成績
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500 tabular-nums">
                    ブックマーク {isLoaded ? bookmarkedQuestionIds.length : 0}問
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-emerald-600" />
            </Link>
          )}

          {/* Scalable Multi-Exam Platform Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-indigo-50/50 p-4 shadow-xs sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800">
              <Layers className="h-4 w-4 text-indigo-600" />
              <span>マルチ資格プラットフォーム</span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
              ワンタップで資格コースを切替。学習履歴は資格ごとに安全に保存されます。
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {allExams.map((exam) => {
                const isCurrent = exam.id === activeExam.id;
                return (
                  <button
                    key={exam.id}
                    type="button"
                    onClick={() => setActiveExamId(exam.id)}
                    className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
                      isCurrent
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50'
                    }`}
                  >
                    <span>{exam.shortName}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        isCurrent
                          ? 'bg-white/20 text-white'
                          : exam.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-teal-100 text-teal-700'
                      }`}
                    >
                      {exam.status === 'active'
                        ? '公開中'
                        : `${exam.tracks.length}科目・プレビュー`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
