'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  Bookmark,
  Calculator,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClipboardCheck,
  Clock,
  Flag,
  LayoutGrid,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import { getMockExamById, getQuestionById } from '@/exams/registry';
import { useExamStore } from '@/lib/storage';
import { useCalculator } from '@/components/layout/AppShell';
import { ProgressRing, TrackBadge } from '@/components/ui/CommonUI';
import { formatTimer } from '@/lib/constants';
import {
  QuestionCard,
  createEmptyAnswer,
  evaluateAnswer,
  isAnswerComplete,
  type UserAnswer,
} from '@/components/study/QuestionCard';
import { ExplanationPanel } from '@/components/study/ExplanationPanel';
import type {
  MockExamResult,
  MockExamSection,
  MockExamSectionScore,
  Question,
} from '@/types/exam';

type ExamStage = 'briefing' | 'running' | 'report';
type ReviewFilter = 'all' | 'wrong' | 'flagged';

interface ExamItem {
  globalIndex: number;
  sectionIndex: number;
  section: MockExamSection;
  questionIndexInSection: number;
  question: Question;
  points: number;
}

interface GradedItem extends ExamItem {
  userAnswer: UserAnswer;
  isComplete: boolean;
  isCorrect: boolean;
  wasFlagged: boolean;
}

export default function MockExamRunnerPage() {
  const params = useParams<{ id: string }>();
  const mockExamId = typeof params?.id === 'string' ? params.id : '';
  const mockExam = useMemo(() => getMockExamById(mockExamId), [mockExamId]);

  const {
    isLoaded,
    activeExamMockResults,
    recordAnswer,
    saveMockExamResult,
    isBookmarked,
    toggleBookmark,
  } = useExamStore();
  const { openCalculator } = useCalculator();

  // Build ordered question list across all sections
  const items: ExamItem[] = useMemo(() => {
    if (!mockExam) return [];
    const list: ExamItem[] = [];
    let globalIndex = 0;
    mockExam.sections.forEach((section, sectionIndex) => {
      section.questionIds.forEach((qid, questionIndexInSection) => {
        const question = getQuestionById(qid);
        if (!question) return;
        list.push({
          globalIndex,
          sectionIndex,
          section,
          questionIndexInSection,
          question,
          points: section.pointsPerQuestion,
        });
        globalIndex += 1;
      });
    });
    return list;
  }, [mockExam]);

  const pastStats = useMemo(() => {
    if (!mockExam) return null;
    const matching = activeExamMockResults.filter((r) => r.mockExamId === mockExam.id);
    if (matching.length === 0) return null;
    const bestScore = Math.max(...matching.map((r) => r.score));
    const passed = matching.some((r) => r.passed);
    return { bestScore, attempts: matching.length, passed };
  }, [activeExamMockResults, mockExam]);

  const [stage, setStage] = useState<ExamStage>('briefing');
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(
    () => (mockExam?.durationMinutes ?? 60) * 60
  );
  const [isPaused, setIsPaused] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [savedResult, setSavedResult] = useState<MockExamResult | null>(null);
  const [gradedItems, setGradedItems] = useState<GradedItem[]>([]);
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('all');
  const [expandedReviewIds, setExpandedReviewIds] = useState<Record<string, boolean>>({});

  // Refs to avoid stale closures on auto-submit
  const answersRef = useRef(answers);
  const flaggedRef = useRef(flagged);
  const remainingRef = useRef(remainingSeconds);
  const hasSubmittedRef = useRef(false);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    flaggedRef.current = flagged;
  }, [flagged]);

  useEffect(() => {
    remainingRef.current = remainingSeconds;
  }, [remainingSeconds]);

  // Reset if navigating between different mock exam IDs
  useEffect(() => {
    setStage('briefing');
    setAnswers({});
    setFlagged({});
    setCurrentIndex(0);
    setRemainingSeconds((mockExam?.durationMinutes ?? 60) * 60);
    setIsPaused(false);
    setShowNavigator(false);
    setShowSubmitModal(false);
    setSavedResult(null);
    setGradedItems([]);
    setReviewFilter('all');
    setExpandedReviewIds({});
    hasSubmittedRef.current = false;
  }, [mockExam]);

  const startExam = useCallback(() => {
    if (!mockExam || items.length === 0) return;
    const initialAnswers: Record<string, UserAnswer> = {};
    for (const item of items) {
      initialAnswers[item.question.id] = createEmptyAnswer(item.question);
    }
    hasSubmittedRef.current = false;
    setAnswers(initialAnswers);
    answersRef.current = initialAnswers;
    setFlagged({});
    flaggedRef.current = {};
    setCurrentIndex(0);
    const totalSecs = mockExam.durationMinutes * 60;
    setRemainingSeconds(totalSecs);
    remainingRef.current = totalSecs;
    setIsPaused(false);
    setShowNavigator(false);
    setShowSubmitModal(false);
    setSavedResult(null);
    setGradedItems([]);
    setStage('running');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [mockExam, items]);

  const finalizeExam = useCallback(() => {
    if (!mockExam || hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;

    const latestAnswers = answersRef.current;
    const latestFlagged = flaggedRef.current;
    const totalDurationSecs = mockExam.durationMinutes * 60;
    const elapsedSeconds = Math.max(1, totalDurationSecs - remainingRef.current);

    const nextGraded: GradedItem[] = [];
    const sectionScoreMap = new Map<string, MockExamSectionScore>();
    for (const sec of mockExam.sections) {
      sectionScoreMap.set(sec.id, {
        sectionId: sec.id,
        title: sec.title,
        earnedPoints: 0,
        maxPoints: 0,
        correctCount: 0,
        totalCount: 0,
      });
    }

    const wrongQuestionIds: string[] = [];
    let totalScore = 0;
    let computedTotalPoints = 0;
    let totalCorrectCount = 0;

    for (const item of items) {
      const userAnswer =
        latestAnswers[item.question.id] ?? createEmptyAnswer(item.question);
      const complete = isAnswerComplete(item.question, userAnswer);
      const correct = complete && evaluateAnswer(item.question, userAnswer);
      const wasFlagged = Boolean(latestFlagged[item.question.id]);

      nextGraded.push({
        ...item,
        userAnswer,
        isComplete: complete,
        isCorrect: correct,
        wasFlagged,
      });

      const secScore = sectionScoreMap.get(item.section.id);
      if (secScore) {
        secScore.maxPoints += item.points;
        secScore.totalCount += 1;
        if (correct) {
          secScore.earnedPoints += item.points;
          secScore.correctCount += 1;
        }
      }

      computedTotalPoints += item.points;
      if (correct) {
        totalScore += item.points;
        totalCorrectCount += 1;
      } else {
        wrongQuestionIds.push(item.question.id);
      }

      // Feed individual answers into the user's global learning stats & weak-point queue
      recordAnswer(item.question.id, correct);
    }

    const sectionScores = mockExam.sections
      .map((sec) => sectionScoreMap.get(sec.id))
      .filter((s): s is MockExamSectionScore => Boolean(s));

    const finalTotalPoints =
      computedTotalPoints > 0 ? computedTotalPoints : mockExam.totalPoints;
    const passed = totalScore >= mockExam.passingScore;

    const result = saveMockExamResult({
      examId: mockExam.examId,
      mockExamId: mockExam.id,
      examTitle: mockExam.title,
      gradeLabel: mockExam.gradeLabel,
      targetTrackIds: mockExam.targetTrackIds,
      mode: mockExam.mode,
      score: totalScore,
      totalPoints: finalTotalPoints,
      passingScore: mockExam.passingScore,
      passed,
      durationSeconds: elapsedSeconds,
      correctCount: totalCorrectCount,
      totalQuestions: items.length,
      sectionScores,
      wrongQuestionIds,
    });

    // Auto-expand the first up to 3 wrong questions for immediate review
    const initialExpanded: Record<string, boolean> = {};
    const wrongs = nextGraded.filter((g) => !g.isCorrect);
    wrongs.slice(0, 3).forEach((g) => {
      initialExpanded[g.question.id] = true;
    });

    setGradedItems(nextGraded);
    setSavedResult(result);
    setExpandedReviewIds(initialExpanded);
    setReviewFilter(wrongs.length > 0 ? 'wrong' : 'all');
    setShowNavigator(false);
    setShowSubmitModal(false);
    setIsPaused(false);
    setStage('report');

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [mockExam, items, recordAnswer, saveMockExamResult]);

  // Countdown timer effect
  useEffect(() => {
    if (stage !== 'running' || isPaused) return;
    const interval = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          remainingRef.current = 0;
          window.clearInterval(interval);
          // Defer finalize outside setState updater
          window.setTimeout(() => finalizeExam(), 0);
          return 0;
        }
        const next = prev - 1;
        remainingRef.current = next;
        return next;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [stage, isPaused, finalizeExam]);

  // Derived exam progress stats during 'running'
  const answeredCount = useMemo(() => {
    return items.reduce((count, item) => {
      const ans = answers[item.question.id];
      return ans && isAnswerComplete(item.question, ans) ? count + 1 : count;
    }, 0);
  }, [items, answers]);

  const flaggedCount = useMemo(
    () => Object.values(flagged).filter(Boolean).length,
    [flagged]
  );

  // Filtered review items in Stage 3
  const wrongGradedCount = useMemo(
    () => gradedItems.filter((g) => !g.isCorrect).length,
    [gradedItems]
  );
  const flaggedGradedCount = useMemo(
    () => gradedItems.filter((g) => g.wasFlagged).length,
    [gradedItems]
  );

  const visibleReviewItems = useMemo(() => {
    if (reviewFilter === 'wrong') return gradedItems.filter((g) => !g.isCorrect);
    if (reviewFilter === 'flagged') return gradedItems.filter((g) => g.wasFlagged);
    return gradedItems;
  }, [gradedItems, reviewFilter]);

  // Not found view
  if (!mockExam) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-lg font-extrabold text-slate-900">
          模擬テストが見つかりませんでした
        </h1>
        <p className="mt-1.5 text-xs text-slate-500">
          指定された模擬テストは存在しないか、移動された可能性があります。
        </p>
        <Link
          href="/mock-exam"
          className="mt-5 inline-flex h-11 items-center gap-1.5 rounded-xl bg-indigo-600 px-5 text-xs font-bold text-white transition hover:bg-indigo-700"
        >
          <ArrowLeft className="h-4 w-4" />
          模擬テスト一覧へ戻る
        </Link>
      </div>
    );
  }

  // =========================================================================
  // STAGE 1: PRE-EXAM BRIEFING
  // =========================================================================
  if (stage === 'briefing') {
    const totalPoints =
      items.reduce((sum, item) => sum + item.points, 0) || mockExam.totalPoints;

    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <Link
          href="/mock-exam"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 transition hover:text-indigo-600"
        >
          <ArrowLeft className="h-4 w-4" />
          模擬テスト一覧へ戻る
        </Link>

        {/* Hero Briefing Card */}
        <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <TrackBadge
                label={mockExam.gradeLabel}
                color={mockExam.gradeLabel.includes('3') ? 'emerald' : 'indigo'}
              />
              <span
                className={`rounded-md px-2.5 py-0.5 text-xs font-bold ${
                  mockExam.mode === 'full'
                    ? 'bg-slate-900 text-white'
                    : 'bg-sky-50 text-sky-700 border border-sky-200'
                }`}
              >
                {mockExam.mode === 'full' ? '本番模試' : 'ハーフ模試'}
              </span>
            </div>

            {isLoaded && pastStats ? (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tabular-nums ${
                  pastStats.passed
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {pastStats.passed ? (
                  <Trophy className="h-3.5 w-3.5" />
                ) : (
                  <Target className="h-3.5 w-3.5" />
                )}
                自己ベスト {pastStats.bestScore}点（{pastStats.attempts}回受験）
              </span>
            ) : null}
          </div>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {mockExam.title}
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
            {mockExam.subtitle}
          </p>

          {/* 3 Spec Cards */}
          <div className="mt-5 grid grid-cols-3 gap-2.5 sm:gap-3.5">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-3.5 text-center">
              <Clock className="mx-auto h-5 w-5 text-indigo-600" />
              <div className="mt-1.5 text-[11px] font-semibold text-slate-500">
                試験時間
              </div>
              <div className="mt-0.5 text-lg font-extrabold text-slate-900 tabular-nums">
                {mockExam.durationMinutes}分
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-3.5 text-center">
              <ClipboardCheck className="mx-auto h-5 w-5 text-indigo-600" />
              <div className="mt-1.5 text-[11px] font-semibold text-slate-500">
                出題数
              </div>
              <div className="mt-0.5 text-lg font-extrabold text-slate-900 tabular-nums">
                全{items.length}問
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-3.5 text-center">
              <Award className="mx-auto h-5 w-5 text-emerald-600" />
              <div className="mt-1.5 text-[11px] font-semibold text-slate-500">
                合格ライン
              </div>
              <div className="mt-0.5 text-lg font-extrabold text-slate-900 tabular-nums">
                {mockExam.passingScore}
                <span className="text-xs font-semibold text-slate-400">
                  /{totalPoints}点
                </span>
              </div>
            </div>
          </div>

          {/* Section Breakdown Table */}
          <div className="mt-6">
            <h2 className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
              大問構成と配点
            </h2>
            <div className="mt-2.5 overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5">大問・出題テーマ</th>
                    <th className="px-3 py-2.5 text-right whitespace-nowrap">問題数</th>
                    <th className="px-4 py-2.5 text-right whitespace-nowrap">配点</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {mockExam.sections.map((sec) => {
                    const secMax = sec.questionIds.length * sec.pointsPerQuestion;
                    return (
                      <tr key={sec.id}>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{sec.title}</div>
                          <div className="text-[11px] text-slate-500">{sec.subtitle}</div>
                        </td>
                        <td className="px-3 py-3 text-right font-semibold text-slate-700 tabular-nums whitespace-nowrap">
                          {sec.questionIds.length}問
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap">
                          <div className="font-extrabold text-indigo-700">{secMax}点</div>
                          <div className="text-[10px] text-slate-400">
                            @{sec.pointsPerQuestion}点
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-50/80 font-extrabold text-slate-900">
                  <tr>
                    <td className="px-4 py-2.5">合計</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {items.length}問
                    </td>
                    <td className="px-4 py-2.5 text-right text-indigo-700 tabular-nums">
                      {totalPoints}点
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Exam Tips */}
          <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
            <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-900">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              <span>本番さながらのCBT機能に対応</span>
            </div>
            <ul className="mt-2 space-y-1 text-xs leading-relaxed text-indigo-950/80">
              <li>・途中一時停止・再開に対応（一時停止中は問題画面をロックします）</li>
              <li>・右上の「電卓」ボタンからいつでも簿記電卓を利用できます</li>
              <li>・迷った問題は「見直しフラグ」を付けて問題一覧からすぐ戻れます</li>
              <li>・採点後は不正解の問題が自動で苦手復習リストに登録されます</li>
            </ul>
          </div>

          {/* Start CTA */}
          <div className="mt-6">
            <button
              type="button"
              onClick={startExam}
              disabled={items.length === 0}
              className="inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 text-base font-extrabold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Play className="h-5 w-5 fill-current" />
              <span>試験を開始する（{mockExam.durationMinutes}分）</span>
            </button>
          </div>
        </section>
      </div>
    );
  }

  // =========================================================================
  // STAGE 2: LIVE TIMED EXAM RUNNER
  // =========================================================================
  if (stage === 'running') {
    const currentItem = items[currentIndex];
    if (!currentItem) return null;

    const currentAnswer =
      answers[currentItem.question.id] ?? createEmptyAnswer(currentItem.question);
    const isCurrentFlagged = Boolean(flagged[currentItem.question.id]);
    const isLastQuestion = currentIndex === items.length - 1;
    const unansweredCount = items.length - answeredCount;
    const progressPct =
      items.length > 0 ? Math.round((answeredCount / items.length) * 100) : 0;

    const isCriticalTime = remainingSeconds <= 180;
    const isWarningTime = !isCriticalTime && remainingSeconds <= 600;

    const timerBadgeClass = isCriticalTime
      ? 'border-rose-300 bg-rose-50 text-rose-700 animate-pulse'
      : isWarningTime
        ? 'border-amber-300 bg-amber-50 text-amber-800'
        : 'border-slate-200 bg-slate-900 text-white';

    return (
      <div className="mx-auto max-w-3xl pb-24 sm:pb-20">
        {/* Sticky Exam Control Bar */}
        <div className="sticky top-14 z-20 -mx-4 mb-4 border-b border-slate-200/90 bg-white/95 px-3 py-2.5 shadow-xs backdrop-blur-md sm:top-16 sm:mx-0 sm:rounded-2xl sm:border sm:px-4">
          <div className="flex items-center justify-between gap-2">
            {/* Timer & Pause */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div
                className={`inline-flex h-10 items-center gap-1.5 rounded-xl border px-3 text-sm font-extrabold tabular-nums ${timerBadgeClass}`}
                aria-label={`残り時間 ${formatTimer(remainingSeconds)}`}
              >
                <Clock className="h-4 w-4 shrink-0" />
                <span>{formatTimer(remainingSeconds)}</span>
              </div>

              <button
                type="button"
                onClick={() => setIsPaused(true)}
                className="inline-flex h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 active:scale-95"
                title="試験を一時停止"
              >
                <Pause className="h-4 w-4" />
                <span className="hidden sm:inline">一時停止</span>
              </button>
            </div>

            {/* Right Controls: Calculator, Navigator Grid, Submit */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={openCalculator}
                className="inline-flex h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 active:scale-95"
                aria-label="電卓を開く"
              >
                <Calculator className="h-4 w-4 text-indigo-600" />
                <span className="hidden sm:inline">電卓</span>
              </button>

              <button
                type="button"
                onClick={() => setShowNavigator(true)}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-800 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 active:scale-95 tabular-nums"
              >
                <LayoutGrid className="h-4 w-4 text-slate-500" />
                <span>
                  {answeredCount}/{items.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowSubmitModal(true)}
                className="inline-flex h-10 items-center gap-1 rounded-xl bg-indigo-600 px-3 text-xs font-extrabold text-white shadow-2xs transition hover:bg-indigo-700 active:scale-95 sm:px-4"
              >
                <span>採点する</span>
              </button>
            </div>
          </div>

          {/* Answered Progress Hairline */}
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Section Header Banner */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-2xs">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-slate-900 px-2 py-0.5 text-[11px] font-extrabold text-white tabular-nums">
                問 {currentIndex + 1} / {items.length}
              </span>
              <span className="text-xs font-extrabold text-slate-900 sm:text-sm">
                {currentItem.section.title}
              </span>
              <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700 tabular-nums">
                配点 {currentItem.points}点
              </span>
            </div>
            <p className="mt-0.5 truncate text-[11px] text-slate-500">
              {currentItem.section.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setFlagged((prev) => ({
                ...prev,
                [currentItem.question.id]: !prev[currentItem.question.id],
              }))
            }
            className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition active:scale-95 ${
              isCurrentFlagged
                ? 'border-amber-300 bg-amber-50 text-amber-800'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Flag
              className={`h-3.5 w-3.5 ${
                isCurrentFlagged ? 'fill-amber-500 text-amber-500' : ''
              }`}
            />
            <span>{isCurrentFlagged ? '見直し中' : '見直しマーク'}</span>
          </button>
        </div>

        {/* Question Card */}
        <QuestionCard
          question={currentItem.question}
          answer={currentAnswer}
          onChange={(nextAnswer) =>
            setAnswers((prev) => ({
              ...prev,
              [currentItem.question.id]: nextAnswer,
            }))
          }
          disabled={false}
          showResult={false}
          questionNumber={currentIndex + 1}
          points={currentItem.points}
          isBookmarked={isBookmarked(currentItem.question.id)}
          onToggleBookmark={() => toggleBookmark(currentItem.question.id)}
        />

        {/* Sticky Bottom Navigation Bar (Above Mobile Bottom Nav + Safe Area) */}
        <div className="fixed right-0 bottom-[calc(57px+env(safe-area-inset-bottom))] left-0 z-20 border-t border-slate-200/90 bg-white/95 px-3 py-2.5 shadow-lg backdrop-blur-md md:bottom-0 md:pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto grid max-w-3xl grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setCurrentIndex((idx) => Math.max(0, idx - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={currentIndex === 0}
              className="inline-flex min-h-[48px] items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-800 transition hover:bg-slate-50 active:scale-95 disabled:opacity-40 sm:text-sm"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>前へ</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setFlagged((prev) => ({
                  ...prev,
                  [currentItem.question.id]: !prev[currentItem.question.id],
                }))
              }
              className={`inline-flex min-h-[48px] items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-extrabold transition active:scale-95 sm:text-sm ${
                isCurrentFlagged
                  ? 'border-amber-300 bg-amber-100 text-amber-900'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Flag
                className={`h-4 w-4 ${
                  isCurrentFlagged ? 'fill-amber-500 text-amber-600' : ''
                }`}
              />
              <span>見直し</span>
            </button>

            {isLastQuestion ? (
              <button
                type="button"
                onClick={() => setShowSubmitModal(true)}
                className="inline-flex min-h-[48px] items-center justify-center gap-1 rounded-xl bg-emerald-600 px-3 text-xs font-extrabold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95 sm:text-sm"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>採点確認</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setCurrentIndex((idx) => Math.min(items.length - 1, idx + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex min-h-[48px] items-center justify-center gap-1 rounded-xl bg-indigo-600 px-3 text-xs font-extrabold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95 sm:text-sm"
              >
                <span>次へ</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* PAUSE OVERLAY MODAL (hides questions for fairness) */}
        {isPaused ? (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="試験一時停止中"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md"
          >
            <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Pause className="h-7 w-7" />
              </div>
              <h2 className="mt-4 text-xl font-extrabold text-slate-900">
                試験を一時停止中
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                公正な受験のため問題画面を非表示にしています。準備ができたら再開してください。
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4 tabular-nums">
                <div>
                  <div className="text-[11px] font-semibold text-slate-500">残り時間</div>
                  <div className="mt-0.5 text-lg font-extrabold text-slate-900">
                    {formatTimer(remainingSeconds)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-500">回答済</div>
                  <div className="mt-0.5 text-lg font-extrabold text-indigo-700">
                    {answeredCount} / {items.length}問
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-2.5">
                <button
                  type="button"
                  onClick={() => setIsPaused(false)}
                  className="inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span>試験を再開する</span>
                </button>
                <Link
                  href="/mock-exam"
                  className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  試験を中断して一覧へ戻る
                </Link>
              </div>
            </div>
          </div>
        ) : null}

        {/* QUESTION NAVIGATOR DRAWER / MODAL */}
        {showNavigator ? (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="問題一覧ナビゲーター"
            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-xs sm:items-center sm:p-4"
            onClick={() => setShowNavigator(false)}
          >
            <div
              className="flex max-h-[85dvh] w-full max-w-xl flex-col rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    問題一覧ジャンプ
                  </h2>
                  <p className="text-xs text-slate-500 tabular-nums">
                    回答済 {answeredCount} / {items.length}問・見直し {flaggedCount}問
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNavigator(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                  aria-label="閉じる"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-2.5 text-[11px] font-semibold text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded border border-slate-300 bg-slate-100" />
                  未回答
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-indigo-600" />
                  回答済
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  見直しフラグ
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded ring-2 ring-slate-900 bg-white" />
                  現在表示中
                </span>
              </div>

              {/* Grouped Grid */}
              <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
                {mockExam.sections.map((section, sIdx) => {
                  const sectionItems = items.filter((it) => it.sectionIndex === sIdx);
                  if (sectionItems.length === 0) return null;

                  return (
                    <div key={section.id}>
                      <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>{section.title}</span>
                        <span className="text-[11px] text-slate-400 tabular-nums">
                          各{section.pointsPerQuestion}点
                        </span>
                      </div>
                      <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
                        {sectionItems.map((it) => {
                          const ans = answers[it.question.id];
                          const isAnswered = ans
                            ? isAnswerComplete(it.question, ans)
                            : false;
                          const isFlagged = Boolean(flagged[it.question.id]);
                          const isCurrent = it.globalIndex === currentIndex;

                          return (
                            <button
                              key={it.question.id}
                              type="button"
                              onClick={() => {
                                setCurrentIndex(it.globalIndex);
                                setShowNavigator(false);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className={`relative flex h-12 items-center justify-center rounded-xl text-sm font-extrabold tabular-nums transition active:scale-95 ${
                                isAnswered
                                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                  : 'border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                              } ${
                                isCurrent
                                  ? 'ring-2 ring-slate-900 ring-offset-2'
                                  : ''
                              }`}
                            >
                              <span>{it.globalIndex + 1}</span>
                              {isFlagged ? (
                                <span
                                  aria-label="見直しフラグあり"
                                  className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-white"
                                />
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-slate-100 p-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowNavigator(false);
                    setShowSubmitModal(true);
                  }}
                  className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-extrabold text-white transition hover:bg-indigo-600"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>採点確認へ進む</span>
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* SUBMIT CONFIRMATION MODAL */}
        {showSubmitModal ? (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="採点確認"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
            onClick={() => setShowSubmitModal(false)}
          >
            <div
              className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-slate-900">
                  解答を提出して採点しますか？
                </h2>
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label="閉じる"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2.5 text-center tabular-nums">
                <div className="rounded-2xl bg-indigo-50 p-3">
                  <div className="text-[11px] font-bold text-indigo-700">回答済</div>
                  <div className="mt-0.5 text-xl font-extrabold text-indigo-900">
                    {answeredCount}
                  </div>
                </div>
                <div
                  className={`rounded-2xl p-3 ${
                    unansweredCount > 0 ? 'bg-amber-50' : 'bg-slate-50'
                  }`}
                >
                  <div
                    className={`text-[11px] font-bold ${
                      unansweredCount > 0 ? 'text-amber-800' : 'text-slate-500'
                    }`}
                  >
                    未回答
                  </div>
                  <div
                    className={`mt-0.5 text-xl font-extrabold ${
                      unansweredCount > 0 ? 'text-amber-900' : 'text-slate-800'
                    }`}
                  >
                    {unansweredCount}
                  </div>
                </div>
                <div
                  className={`rounded-2xl p-3 ${
                    flaggedCount > 0 ? 'bg-amber-50' : 'bg-slate-50'
                  }`}
                >
                  <div
                    className={`text-[11px] font-bold ${
                      flaggedCount > 0 ? 'text-amber-800' : 'text-slate-500'
                    }`}
                  >
                    見直し
                  </div>
                  <div
                    className={`mt-0.5 text-xl font-extrabold ${
                      flaggedCount > 0 ? 'text-amber-900' : 'text-slate-800'
                    }`}
                  >
                    {flaggedCount}
                  </div>
                </div>
              </div>

              {unansweredCount > 0 ? (
                <div className="mt-4 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50/80 p-3 text-xs leading-relaxed text-amber-900">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <span>
                    未回答の問題が {unansweredCount} 問あります。問題一覧から確認することもできます。
                  </span>
                </div>
              ) : (
                <p className="mt-4 text-xs leading-relaxed text-slate-600">
                  すべての問題に解答済みです。採点して大問別スコアと全問の詳しい解説を確認しましょう。
                </p>
              )}

              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-extrabold text-slate-700 transition hover:bg-slate-50"
                >
                  問題に戻る
                </button>
                <button
                  type="button"
                  onClick={finalizeExam}
                  className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 text-xs font-extrabold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>採点して結果を見る</span>
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  // =========================================================================
  // STAGE 3: COMPREHENSIVE SCORE REPORT & FULL EXPLANATION REVIEW
  // =========================================================================
  if (!savedResult) return null;

  const scorePct =
    savedResult.totalPoints > 0
      ? Math.round((savedResult.score / savedResult.totalPoints) * 100)
      : 0;
  const accuracyPct =
    savedResult.totalQuestions > 0
      ? Math.round((savedResult.correctCount / savedResult.totalQuestions) * 100)
      : 0;
  const pointsToPass = Math.max(0, savedResult.passingScore - savedResult.score);

  const expandAllVisible = () => {
    const next: Record<string, boolean> = { ...expandedReviewIds };
    for (const item of visibleReviewItems) {
      next[item.question.id] = true;
    }
    setExpandedReviewIds(next);
  };

  const collapseAllVisible = () => {
    const next: Record<string, boolean> = { ...expandedReviewIds };
    for (const item of visibleReviewItems) {
      next[item.question.id] = false;
    }
    setExpandedReviewIds(next);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Hero Score Result Card */}
      <section
        className={`overflow-hidden rounded-3xl border p-5 shadow-md sm:p-7 ${
          savedResult.passed
            ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50/70'
            : 'border-amber-200 bg-gradient-to-br from-amber-50 via-white to-rose-50/60'
        }`}
      >
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold shadow-2xs bg-white border border-slate-200/80">
              {savedResult.passed ? (
                <>
                  <Trophy className="h-4 w-4 text-emerald-600" />
                  <span className="text-emerald-700">合格ライン到達 🎉</span>
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 text-amber-600" />
                  <span className="text-amber-800">あと {pointsToPass} 点で合格！</span>
                </>
              )}
            </div>

            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
              {savedResult.examTitle}
            </h1>

            <p className="text-xs leading-relaxed text-slate-600">
              {savedResult.passed
                ? '見事、合格基準点をクリアしました！間違えた論点も解説で確認して盤石にしましょう。'
                : '惜しい結果です！大問別スコアで弱点を特定し、解説レビューとスキマ学習で一気に合格ラインを超えましょう。'}
            </p>

            {/* Quick Metric Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 sm:justify-start tabular-nums">
              <span className="inline-flex items-center gap-1 rounded-xl bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-700 border border-slate-200/80">
                正答数 {savedResult.correctCount} / {savedResult.totalQuestions}問（{accuracyPct}%）
              </span>
              <span className="inline-flex items-center gap-1 rounded-xl bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-700 border border-slate-200/80">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                所要時間 {formatTimer(savedResult.durationSeconds)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 border border-indigo-200/80">
                <Sparkles className="h-3.5 w-3.5" />
                +{savedResult.passed ? 120 : 50} XP
              </span>
            </div>
          </div>

          <div className="shrink-0 rounded-3xl bg-white/95 p-4 shadow-sm ring-1 ring-slate-200/70">
            <ProgressRing
              value={scorePct}
              size={116}
              strokeWidth={9}
              color={savedResult.passed ? '#10B981' : '#F59E0B'}
              trackColor="#E2E8F0"
              label={`${savedResult.score}点`}
              sublabel={`/ ${savedResult.totalPoints}点`}
            />
          </div>
        </div>
      </section>

      {/* Section-by-Section Score Analysis */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6">
        <h2 className="text-base font-extrabold text-slate-900">
          大問別スコア分析
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">
          合格基準（70%）を目安に、得点源と強化すべき大問を確認しましょう
        </p>

        <div className="mt-4 space-y-3.5">
          {savedResult.sectionScores.map((sec) => {
            const pct =
              sec.maxPoints > 0
                ? Math.round((sec.earnedPoints / sec.maxPoints) * 100)
                : 0;
            const barClass =
              pct >= 70
                ? 'bg-emerald-500'
                : pct >= 50
                  ? 'bg-amber-500'
                  : 'bg-rose-500';
            const badgeClass =
              pct >= 70
                ? 'text-emerald-700 bg-emerald-50'
                : pct >= 50
                  ? 'text-amber-800 bg-amber-50'
                  : 'text-rose-700 bg-rose-50';

            return (
              <div
                key={sec.sectionId}
                className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-extrabold text-slate-900 sm:text-sm">
                    {sec.title}
                  </div>
                  <div className="flex items-center gap-2 tabular-nums">
                    <span className="text-xs font-semibold text-slate-500">
                      {sec.correctCount}/{sec.totalCount}問正解
                    </span>
                    <span
                      className={`rounded-lg px-2 py-0.5 text-xs font-extrabold ${badgeClass}`}
                    >
                      {sec.earnedPoints} / {sec.maxPoints}点（{pct}%）
                    </span>
                  </div>
                </div>
                <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-200/80">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barClass}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Full Question-by-Question Explanation Review */}
      <section className="space-y-3.5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 sm:text-lg">
              全問くわしい解説レビュー
            </h2>
            <p className="text-xs text-slate-500">
              各問題を開いて仕訳手順・計算式・つまずきポイントを確認できます
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={expandAllVisible}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-600 transition hover:bg-slate-50"
            >
              すべて開く
            </button>
            <button
              type="button"
              onClick={collapseAllVisible}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-600 transition hover:bg-slate-50"
            >
              すべて閉じる
            </button>
          </div>
        </div>

        {/* Review Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: 'all', label: `すべて (${gradedItems.length})` },
              { id: 'wrong', label: `不正解のみ (${wrongGradedCount})` },
              { id: 'flagged', label: `見直しフラグ (${flaggedGradedCount})` },
            ] as { id: ReviewFilter; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setReviewFilter(tab.id)}
              className={`min-h-[38px] rounded-xl px-3.5 text-xs font-bold transition tabular-nums ${
                reviewFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {visibleReviewItems.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-xs font-semibold text-slate-500">
            {reviewFilter === 'wrong'
              ? '不正解の問題はありません！全問正解の素晴らしい結果です 🎉'
              : '見直しフラグを付けた問題はありません。'}
          </div>
        ) : (
          <div className="space-y-3">
            {visibleReviewItems.map((item) => {
              const expanded = Boolean(expandedReviewIds[item.question.id]);
              const bookmarked = isBookmarked(item.question.id);

              const statusBadge = item.isCorrect ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  正解 +{item.points}点
                </span>
              ) : !item.isComplete ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2.5 py-0.5 text-[11px] font-extrabold text-slate-700">
                  <XCircle className="h-3.5 w-3.5" />
                  未回答 0/{item.points}点
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-extrabold text-rose-700">
                  <XCircle className="h-3.5 w-3.5" />
                  不正解 0/{item.points}点
                </span>
              );

              return (
                <div
                  key={item.question.id}
                  className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2 p-4">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedReviewIds((prev) => ({
                          ...prev,
                          [item.question.id]: !prev[item.question.id],
                        }))
                      }
                      aria-expanded={expanded}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-extrabold text-slate-700 tabular-nums">
                          問 {item.globalIndex + 1}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400">
                          {item.section.title}
                        </span>
                        {statusBadge}
                        {item.wasFlagged ? (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                            <Flag className="h-3 w-3 fill-amber-500 text-amber-500" />
                            見直し
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mt-1.5 text-sm font-extrabold text-slate-900">
                        {item.question.title}
                      </h3>
                    </button>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => toggleBookmark(item.question.id)}
                        className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${
                          bookmarked
                            ? 'border-amber-200 bg-amber-50 text-amber-600'
                            : 'border-slate-200 bg-white text-slate-400 hover:text-slate-700'
                        }`}
                        aria-label="ブックマーク切替"
                      >
                        <Bookmark
                          className={`h-4 w-4 ${bookmarked ? 'fill-amber-500' : ''}`}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedReviewIds((prev) => ({
                            ...prev,
                            [item.question.id]: !prev[item.question.id],
                          }))
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition hover:bg-slate-100"
                        aria-label={expanded ? '解説を閉じる' : '解説を開く'}
                      >
                        {expanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {expanded ? (
                    <div className="space-y-4 border-t border-slate-100 bg-slate-50/50 p-4">
                      {/* Question Prompt & User Answer Preview */}
                      <QuestionCard
                        question={item.question}
                        answer={item.userAnswer}
                        onChange={() => {}}
                        disabled={true}
                        showResult={true}
                        questionNumber={item.globalIndex + 1}
                        points={item.points}
                        isBookmarked={bookmarked}
                        onToggleBookmark={() => toggleBookmark(item.question.id)}
                      />

                      {/* Full Detailed Explanation */}
                      <ExplanationPanel
                        question={item.question}
                        userAnswer={item.userAnswer}
                        isCorrect={item.isCorrect}
                      />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer Action CTAs */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <button
            type="button"
            onClick={startExam}
            className="inline-flex min-h-[48px] items-center justify-center gap-1.5 rounded-2xl bg-indigo-600 px-4 text-xs font-extrabold text-white shadow-2xs transition hover:bg-indigo-700 active:scale-[0.98]"
          >
            <RotateCcw className="h-4 w-4" />
            <span>もう一度受験する</span>
          </button>

          <Link
            href="/study?mode=weak&autostart=1"
            className="inline-flex min-h-[48px] items-center justify-center gap-1.5 rounded-2xl bg-slate-900 px-4 text-xs font-extrabold text-white transition hover:bg-slate-800 active:scale-[0.98]"
          >
            <Zap className="h-4 w-4 text-amber-300" />
            <span>間違えた問題を復習</span>
          </Link>

          <Link
            href="/mock-exam"
            className="inline-flex min-h-[48px] items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 text-xs font-extrabold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
          >
            <span>模擬テスト一覧へ</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
