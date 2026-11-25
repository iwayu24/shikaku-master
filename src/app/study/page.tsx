'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Bookmark,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Flame,
  Layers,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  XCircle,
  Zap,
} from 'lucide-react';
import {
  createEmptyAnswer,
  evaluateAnswer,
  isAnswerComplete,
  QuestionCard,
  type UserAnswer,
} from '@/components/study/QuestionCard';
import { ExplanationPanel } from '@/components/study/ExplanationPanel';
import {
  ComingSoonBanner,
  ProgressRing,
  TrackBadge,
} from '@/components/ui/CommonUI';
import { getTrackById } from '@/exams/registry';
import { getTrackColorStyle } from '@/lib/constants';
import { useExamStore } from '@/lib/storage';
import type { AnswerRecord, Question, TrackId } from '@/types/exam';

type StudyPhase = 'launcher' | 'active' | 'summary';
type StudyMode = 'quick' | 'track' | 'category' | 'weak' | 'bookmark' | 'all';

interface SessionAnswerItem {
  question: Question;
  answer: UserAnswer;
  isCorrect: boolean;
  earnedXp: number;
}

interface SessionConfig {
  mode: StudyMode;
  label: string;
  trackId?: TrackId;
  category?: string;
  count: number | 'all';
}

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function selectSmartQuestions(
  pool: Question[],
  answers: Record<string, AnswerRecord>,
  count: number | 'all'
): Question[] {
  const unanswered: Question[] = [];
  const weak: Question[] = [];
  const mastered: Question[] = [];

  for (const q of pool) {
    const rec = answers[q.id];
    if (!rec || rec.attempts === 0) {
      unanswered.push(q);
    } else if (!rec.lastCorrect || rec.correctCount / rec.attempts < 0.7) {
      weak.push(q);
    } else {
      mastered.push(q);
    }
  }

  const prioritized = [
    ...shuffleArray(unanswered),
    ...shuffleArray(weak),
    ...shuffleArray(mastered),
  ];

  if (count === 'all') return prioritized;
  return prioritized.slice(0, count);
}

function StudyPageContent() {
  const searchParams = useSearchParams();
  const {
    isLoaded,
    progress,
    activeExam,
    todayCount,
    effectiveStreak,
    weakQuestionIds,
    bookmarkedQuestionIds,
    setActiveExamId,
    recordAnswer,
    toggleBookmark,
    isBookmarked,
    getAnswerRecord,
    getTrackMastery,
    getCategoryStats,
  } = useExamStore();

  const [phase, setPhase] = useState<StudyPhase>('launcher');
  const [selectedQuickTrack, setSelectedQuickTrack] = useState<TrackId | 'all'>('all');
  const [selectedQuickCount, setSelectedQuickCount] = useState<5 | 10>(5);
  const [expandedTracks, setExpandedTracks] = useState<Record<string, boolean>>({});
  const [launcherNotice, setLauncherNotice] = useState<string | null>(null);

  // Active drill state
  const [sessionConfig, setSessionConfig] = useState<SessionConfig | null>(null);
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentAnswer, setCurrentAnswer] = useState<UserAnswer>({
    type: 'choice',
    choiceIndex: null,
  });
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [currentIsCorrect, setCurrentIsCorrect] = useState<boolean>(false);
  const [sessionResults, setSessionResults] = useState<SessionAnswerItem[]>([]);
  const [expandedReviewIds, setExpandedReviewIds] = useState<Record<string, boolean>>({});

  const questionStartRef = useRef<number>(Date.now());
  const explanationRef = useRef<HTMLDivElement>(null);
  const prevExamIdRef = useRef<string>(activeExam.id);
  const handledAutoStartKeyRef = useRef<string>('');

  const trackMasteryList = useMemo(
    () => getTrackMastery(activeExam.id),
    [getTrackMastery, activeExam.id]
  );

  // Initialize first track accordion open
  useEffect(() => {
    if (activeExam.tracks.length > 0) {
      setExpandedTracks((prev) => {
        if (Object.keys(prev).length > 0 && prev[activeExam.tracks[0].id] !== undefined) {
          return prev;
        }
        return { [activeExam.tracks[0].id]: true };
      });
    }
  }, [activeExam.tracks]);

  // Reset session when active exam changes
  useEffect(() => {
    if (prevExamIdRef.current !== activeExam.id) {
      prevExamIdRef.current = activeExam.id;
      setPhase('launcher');
      setSelectedQuickTrack('all');
      setSessionQuestions([]);
      setSessionResults([]);
      setLauncherNotice(null);
      setExpandedTracks(
        activeExam.tracks[0] ? { [activeExam.tracks[0].id]: true } : {}
      );
    }
  }, [activeExam.id, activeExam.tracks]);

  const startSessionWithQuestions = useCallback(
    (questions: Question[], config: SessionConfig) => {
      if (questions.length === 0) {
        setLauncherNotice('条件に一致する問題がありませんでした。別のコースや分野をお試しください。');
        return;
      }
      setLauncherNotice(null);
      setSessionConfig(config);
      setSessionQuestions(questions);
      setCurrentIndex(0);
      setCurrentAnswer(createEmptyAnswer(questions[0]));
      setIsSubmitted(false);
      setCurrentIsCorrect(false);
      setSessionResults([]);
      setExpandedReviewIds({});
      questionStartRef.current = Date.now();
      setPhase('active');
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    []
  );

  const launchMode = useCallback(
    (
      mode: StudyMode,
      options?: {
        trackId?: TrackId | 'all';
        category?: string;
        count?: number | 'all';
      }
    ) => {
      const trackId = options?.trackId && options.trackId !== 'all' ? options.trackId : undefined;
      const category = options?.category;
      const count = options?.count ?? (mode === 'quick' ? 5 : 'all');

      let pool = activeExam.questions;

      if (mode === 'weak') {
        const byId = new Map(activeExam.questions.map((q) => [q.id, q]));
        pool = weakQuestionIds
          .map((id) => byId.get(id))
          .filter((q): q is Question => q !== undefined);
        if (pool.length === 0) {
          setLauncherNotice('現在、苦手問題はありません！新しい問題にチャレンジしましょう。');
          return;
        }
        const selected = count === 'all' ? pool : pool.slice(0, count);
        startSessionWithQuestions(selected, {
          mode,
          label: '苦手克服ドリル',
          count,
        });
        return;
      }

      if (mode === 'bookmark') {
        const byId = new Map(activeExam.questions.map((q) => [q.id, q]));
        pool = bookmarkedQuestionIds
          .map((id) => byId.get(id))
          .filter((q): q is Question => Boolean(q));
        if (pool.length === 0) {
          setLauncherNotice('ブックマークされた問題がまだありません。問題右上のしおりアイコンで保存できます。');
          return;
        }
        const selected = count === 'all' ? pool : pool.slice(0, count);
        startSessionWithQuestions(selected, {
          mode,
          label: 'ブックマーク復習',
          count,
        });
        return;
      }

      if (trackId) {
        pool = pool.filter((q) => q.trackId === trackId);
      }

      if (category) {
        pool = pool.filter((q) => q.category === category);
      }

      const trackObj = trackId ? getTrackById(activeExam.id, trackId) : undefined;
      let label = '1分スキマドリル';
      if (mode === 'category' && category) {
        label = trackObj ? `${trackObj.shortName}・${category}` : category;
      } else if (mode === 'track' && trackObj) {
        label = `${trackObj.shortName} トレーニング`;
      } else if (mode === 'all') {
        label = `${activeExam.shortName} 全問演習`;
      } else if (mode === 'quick') {
        label = trackObj ? `${trackObj.shortName} スキマドリル` : '1分スキマドリル';
      }

      const selected = selectSmartQuestions(pool, progress.answers, count);
      startSessionWithQuestions(selected, {
        mode,
        label,
        trackId,
        category,
        count,
      });
    },
    [
      activeExam,
      bookmarkedQuestionIds,
      progress.answers,
      startSessionWithQuestions,
      weakQuestionIds,
    ]
  );

  // Handle URL query params (mode, track, category, count, autostart)
  const searchParamsString = searchParams.toString();
  useEffect(() => {
    if (!isLoaded) return;

    const modeParam = searchParams.get('mode') as StudyMode | null;
    const trackParam = searchParams.get('track');
    const categoryParam = searchParams.get('category');
    const countParam = searchParams.get('count');
    const autostartParam = searchParams.get('autostart');

    if (
      trackParam &&
      activeExam.tracks.some((t) => t.id === trackParam)
    ) {
      setSelectedQuickTrack(trackParam);
      setExpandedTracks((prev) => ({ ...prev, [trackParam]: true }));
    }

    if (countParam === '10') {
      setSelectedQuickCount(10);
    } else if (countParam === '5') {
      setSelectedQuickCount(5);
    }

    const shouldAutoStart =
      autostartParam === '1' ||
      Boolean(categoryParam) ||
      modeParam === 'weak' ||
      modeParam === 'bookmark';

    if (shouldAutoStart && handledAutoStartKeyRef.current !== `${activeExam.id}|${searchParamsString}`) {
      handledAutoStartKeyRef.current = `${activeExam.id}|${searchParamsString}`;
      const resolvedMode: StudyMode =
        modeParam ??
        (categoryParam ? 'category' : trackParam ? 'track' : 'quick');
      const resolvedCount: number | 'all' =
        countParam === 'all'
          ? 'all'
          : countParam === '10'
            ? 10
            : countParam === '5'
              ? 5
              : resolvedMode === 'quick'
                ? 5
                : 'all';

      launchMode(resolvedMode, {
        trackId: trackParam ?? 'all',
        category: categoryParam ?? undefined,
        count: resolvedCount,
      });
    }
  }, [isLoaded, searchParams, searchParamsString, activeExam.id, activeExam.tracks, launchMode]);

  const currentQuestion = sessionQuestions[currentIndex];
  const answerReady = currentQuestion
    ? isAnswerComplete(currentQuestion, currentAnswer)
    : false;

  const handleSubmitAnswer = () => {
    if (!currentQuestion || isSubmitted || !answerReady) return;
    const isCorrect = evaluateAnswer(currentQuestion, currentAnswer);
    const elapsedSeconds = Math.max(
      1,
      Math.round((Date.now() - questionStartRef.current) / 1000)
    );

    const existing = getAnswerRecord(currentQuestion.id);
    const prevWasMastered = existing ? existing.lastCorrect : false;
    const earnedXp = isCorrect ? (prevWasMastered ? 15 : 25) : 5;

    recordAnswer(currentQuestion.id, isCorrect, elapsedSeconds);
    setCurrentIsCorrect(isCorrect);
    setIsSubmitted(true);
    setSessionResults((prev) => [
      ...prev,
      {
        question: currentQuestion,
        answer: currentAnswer,
        isCorrect,
        earnedXp,
      },
    ]);

    window.setTimeout(() => {
      explanationRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }, 100);
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < sessionQuestions.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setCurrentAnswer(createEmptyAnswer(sessionQuestions[nextIdx]));
      setIsSubmitted(false);
      setCurrentIsCorrect(false);
      questionStartRef.current = Date.now();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setPhase('summary');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleExitDrill = () => {
    setPhase('launcher');
    setLauncherNotice(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickPoolCount = useMemo(() => {
    if (selectedQuickTrack === 'all') return activeExam.questions.length;
    return activeExam.questions.filter((q) => q.trackId === selectedQuickTrack).length;
  }, [activeExam.questions, selectedQuickTrack]);

  const effectiveQuickCount = Math.min(selectedQuickCount, quickPoolCount);

  // ---------------- ACTIVE DRILL VIEW ----------------
  if (phase === 'active' && currentQuestion) {
    const track = getTrackById(currentQuestion.examId, currentQuestion.trackId);
    const progressPct = Math.round(
      ((currentIndex + (isSubmitted ? 1 : 0)) / Math.max(1, sessionQuestions.length)) * 100
    );
    const isLast = currentIndex + 1 === sessionQuestions.length;
    const correctSoFar = sessionResults.filter((r) => r.isCorrect).length;
    const bookmarked = isBookmarked(currentQuestion.id);

    return (
      <div className="space-y-4 pb-28 md:pb-8">
        {/* Slim Sticky Progress Header */}
        <div className="sticky top-14 z-20 -mx-4 border-b border-slate-200/80 bg-slate-50/95 px-4 pt-2.5 pb-2 backdrop-blur-md sm:top-16 sm:-mx-6 sm:px-6">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleExitDrill}
              className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-bold text-slate-600 transition hover:bg-slate-200/70 hover:text-slate-900"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>終了</span>
            </button>

            <div className="min-w-0 flex-1 text-center">
              <div className="truncate text-xs font-bold text-slate-700">
                {sessionConfig?.label ?? track?.shortName ?? 'スキマ学習'}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 tabular-nums">
              {sessionResults.length > 0 ? (
                <span className="hidden rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200 sm:inline-flex">
                  正解 {correctSoFar}/{sessionResults.length}
                </span>
              ) : null}
              <span className="rounded-lg bg-slate-900 px-2.5 py-0.5 text-xs font-extrabold text-white">
                {currentIndex + 1} / {sessionQuestions.length}
              </span>
            </div>
          </div>

          {/* Slim Progress Track */}
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-300 ease-out"
              style={{ width: `${Math.max(6, progressPct)}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <QuestionCard
          question={currentQuestion}
          answer={currentAnswer}
          onChange={setCurrentAnswer}
          disabled={isSubmitted}
          showResult={isSubmitted}
          questionNumber={currentIndex + 1}
          isBookmarked={bookmarked}
          onToggleBookmark={() => toggleBookmark(currentQuestion.id)}
        />

        {/* Explanation Panel (immediately after submission) */}
        {isSubmitted ? (
          <div ref={explanationRef} className="scroll-mt-32">
            <ExplanationPanel
              question={currentQuestion}
              userAnswer={currentAnswer}
              isCorrect={currentIsCorrect}
            />
          </div>
        ) : null}

        {/* Thumb-Zone Sticky Bottom Action Bar (sits cleanly above mobile BottomNav) */}
        <div className="fixed inset-x-0 bottom-[calc(57px+env(safe-area-inset-bottom))] z-20 border-t border-slate-200/90 bg-white/95 px-4 py-2.5 shadow-[0_-6px_20px_rgba(15,23,42,0.06)] backdrop-blur-md md:sticky md:bottom-4 md:mx-0 md:rounded-2xl md:border md:p-3 md:shadow-lg">
          <div className="mx-auto max-w-5xl">
            {!isSubmitted ? (
              <div className="space-y-1.5">
                {!answerReady ? (
                  <p className="text-center text-[11px] font-medium text-slate-400">
                    {currentQuestion.type === 'journal'
                      ? '借方・貸方のすべての科目と金額を選択するとチェックできます'
                      : '選択肢を1つタップしてください'}
                  </p>
                ) : null}
                <button
                  type="button"
                  disabled={!answerReady}
                  onClick={handleSubmitAnswer}
                  className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.99] disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                >
                  <CheckCircle2 className="h-4.5 w-4.5" />
                  <span>回答をチェック</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => toggleBookmark(currentQuestion.id)}
                  className={`flex min-h-[48px] shrink-0 items-center justify-center gap-1.5 rounded-xl border px-3.5 text-xs font-bold transition active:scale-95 ${
                    bookmarked
                      ? 'border-amber-300 bg-amber-50 text-amber-700'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                  aria-label="ブックマークを切り替え"
                >
                  <Bookmark
                    className={`h-4 w-4 ${bookmarked ? 'fill-amber-500 text-amber-500' : ''}`}
                  />
                  <span className="hidden sm:inline">
                    {bookmarked ? '保存済' : '復習保存'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className={`flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl px-5 text-sm font-extrabold text-white shadow-sm transition active:scale-[0.99] ${
                    isLast
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  <span>{isLast ? '結果を見る 🎉' : '次の問題へ'}</span>
                  {!isLast ? <ArrowRight className="h-4 w-4" /> : null}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------------- SESSION SUMMARY SCREEN ----------------
  if (phase === 'summary') {
    const total = sessionResults.length;
    const correctCount = sessionResults.filter((r) => r.isCorrect).length;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const totalXp = sessionResults.reduce((sum, r) => sum + r.earnedXp, 0);
    const wrongItems = sessionResults.filter((r) => !r.isCorrect);
    const dailyGoalReached = todayCount >= progress.dailyGoal;

    const headline =
      accuracy === 100
        ? 'パーフェクト！全問正解！'
        : accuracy >= 70
          ? 'ナイスファイト！合格圏内です！'
          : 'ナイスチャレンジ！復習で一気に伸びます！';

    return (
      <div className="space-y-5">
        {/* Celebratory Summary Card */}
        <section className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 px-5 py-6 text-white sm:px-7">
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                <div className="rounded-full bg-white p-1.5 shadow-md">
                  <ProgressRing
                    value={accuracy}
                    size={96}
                    strokeWidth={8}
                    color={accuracy >= 70 ? '#10B981' : '#4F46E5'}
                    label={`${accuracy}%`}
                    sublabel={`${correctCount}/${total}問`}
                  />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold backdrop-blur-xs">
                    <Trophy className="h-3.5 w-3.5 text-amber-300" />
                    <span>{sessionConfig?.label ?? 'セッション完了'}</span>
                  </div>
                  <h1 className="mt-2 text-lg font-extrabold tracking-tight sm:text-xl">
                    {headline}
                  </h1>
                  <p className="mt-1 text-xs text-indigo-100">
                    スキマ時間の積み上げが合格への最短ルートです。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stat Tiles */}
          <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50/70">
            <div className="p-3.5 text-center">
              <div className="text-[11px] font-bold text-slate-500">獲得XP</div>
              <div className="mt-1 inline-flex items-center gap-1 text-base font-extrabold text-indigo-600 tabular-nums sm:text-lg">
                <Sparkles className="h-4 w-4" />+{totalXp}
              </div>
            </div>
            <div className="p-3.5 text-center">
              <div className="text-[11px] font-bold text-slate-500">今日の目標</div>
              <div className="mt-1 text-base font-extrabold text-slate-900 tabular-nums sm:text-lg">
                {todayCount}/{progress.dailyGoal}問
              </div>
              {dailyGoalReached ? (
                <span className="mt-0.5 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  目標達成!
                </span>
              ) : null}
            </div>
            <div className="p-3.5 text-center">
              <div className="text-[11px] font-bold text-slate-500">連続学習</div>
              <div className="mt-1 inline-flex items-center gap-1 text-base font-extrabold text-amber-600 tabular-nums sm:text-lg">
                <Flame className="h-4 w-4 fill-amber-500 text-amber-500" />
                {effectiveStreak}日
              </div>
            </div>
          </div>

          {/* Primary Next Actions */}
          <div className="flex flex-col gap-2.5 p-4 sm:flex-row sm:p-5">
            <button
              type="button"
              onClick={() =>
                launchMode('quick', {
                  trackId: sessionConfig?.trackId ?? 'all',
                  count: 5,
                })
              }
              className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-extrabold text-white shadow-xs transition hover:bg-indigo-700 active:scale-[0.99]"
            >
              <Zap className="h-4 w-4" />
              <span>もう5問チャレンジ！</span>
            </button>

            {wrongItems.length > 0 ? (
              <button
                type="button"
                onClick={() =>
                  startSessionWithQuestions(
                    wrongItems.map((w) => w.question),
                    {
                      mode: 'weak',
                      label: '間違えた問題の解き直し',
                      count: 'all',
                    }
                  )
                }
                className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-extrabold text-rose-700 transition hover:bg-rose-100 active:scale-[0.99]"
              >
                <RotateCcw className="h-4 w-4" />
                <span>間違えた{wrongItems.length}問だけ解き直す</span>
              </button>
            ) : null}

            <button
              type="button"
              onClick={handleExitDrill}
              className="flex min-h-[48px] items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 sm:flex-initial"
            >
              <span>学習メニューへ</span>
            </button>
          </div>
        </section>

        {/* Review List */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-800">
              解答の振り返り（タップで解説を確認）
            </h2>
            <span className="text-xs font-semibold text-slate-500 tabular-nums">
              {total}問
            </span>
          </div>

          <div className="space-y-2.5">
            {sessionResults.map((item, idx) => {
              const expanded = Boolean(expandedReviewIds[item.question.id]);
              const track = getTrackById(item.question.examId, item.question.trackId);
              const bookmarked = isBookmarked(item.question.id);

              return (
                <div
                  key={`${item.question.id}-${idx}`}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs"
                >
                  <div className="flex items-center gap-2 p-3.5 sm:p-4">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedReviewIds((prev) => ({
                          ...prev,
                          [item.question.id]: !prev[item.question.id],
                        }))
                      }
                      className="flex min-w-0 flex-1 items-start gap-3 text-left"
                    >
                      {item.isCorrect ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                      ) : (
                        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-extrabold text-slate-400 tabular-nums">
                            Q{idx + 1}
                          </span>
                          <TrackBadge
                            label={track?.shortName ?? item.question.trackId}
                            color={track?.color ?? 'indigo'}
                            size="xs"
                          />
                          <span className="text-[11px] font-semibold text-slate-500">
                            {item.question.category}
                          </span>
                        </div>
                        <div className="mt-1 line-clamp-2 text-sm font-bold text-slate-900">
                          {item.question.title || item.question.prompt}
                        </div>
                      </div>
                      <ChevronDown
                        className={`mt-1 h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                          expanded ? 'rotate-180 text-indigo-600' : ''
                        }`}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleBookmark(item.question.id)}
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition ${
                        bookmarked
                          ? 'border-amber-300 bg-amber-50 text-amber-600'
                          : 'border-slate-200 bg-slate-50 text-slate-400 hover:text-slate-600'
                      }`}
                      aria-label="ブックマークを切り替え"
                    >
                      <Bookmark
                        className={`h-4 w-4 ${bookmarked ? 'fill-amber-500 text-amber-500' : ''}`}
                      />
                    </button>
                  </div>

                  {expanded ? (
                    <div className="border-t border-slate-100 bg-slate-50/50 p-3 sm:p-4">
                      <ExplanationPanel
                        question={item.question}
                        userAnswer={item.answer}
                        isCorrect={item.isCorrect}
                        compact
                      />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  // ---------------- MODE LAUNCHER VIEW ----------------
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
            スキマ学習
          </h1>
          <p className="mt-0.5 text-xs font-medium text-slate-500 sm:text-sm">
            {activeExam.name}・1タップ仕訳入力＆詳しいステップ解説でサクッと定着
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs tabular-nums">
          <Target className="h-3.5 w-3.5 text-indigo-600" />
          <span>
            今日 {todayCount} / {progress.dailyGoal}問
          </span>
          {todayCount >= progress.dailyGoal ? (
            <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-700">
              達成
            </span>
          ) : null}
        </div>
      </div>

      {/* Coming Soon Banner for preview exams */}
      {activeExam.status === 'coming-soon' ? (
        <ComingSoonBanner
          examName={activeExam.name}
          onSwitchToBoki={() => setActiveExamId('boki')}
        />
      ) : null}

      {/* Friendly Launcher Notice */}
      {launcherNotice ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-900">
          <span>{launcherNotice}</span>
          <button
            type="button"
            onClick={() => setLauncherNotice(null)}
            className="shrink-0 font-bold text-amber-700 hover:underline"
          >
            閉じる
          </button>
        </div>
      ) : null}

      {/* Hero: ⚡ 1分スキマ5問ドリル */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 p-5 text-white shadow-md sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold tracking-wide text-indigo-50 backdrop-blur-xs">
              <Zap className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
              <span>おすすめ・未演習と苦手を優先出題</span>
            </div>
            <h2 className="mt-2.5 text-lg font-extrabold tracking-tight sm:text-xl">
              {activeExam.status === 'coming-soon'
                ? 'プレビュー問題クイック体験'
                : '1分スキマ5問ドリル'}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-indigo-100">
              通勤・休憩のすきま時間に最適。コースを選んでワンタップでスタートできます。
            </p>
          </div>
          <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 sm:flex">
            <Award className="h-6 w-6 text-amber-300" />
          </div>
        </div>

        {/* Track Filter Pills */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedQuickTrack('all')}
            className={`min-h-[38px] rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              selectedQuickTrack === 'all'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            すべて ({activeExam.questions.length})
          </button>
          {activeExam.tracks.map((track) => {
            const count = activeExam.questions.filter((q) => q.trackId === track.id).length;
            if (count === 0) return null;
            const active = selectedQuickTrack === track.id;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => setSelectedQuickTrack(track.id)}
                className={`min-h-[38px] rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  active
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'bg-white/15 text-white hover:bg-white/25'
                }`}
              >
                {track.shortName} ({count})
              </button>
            );
          })}
        </div>

        {/* Count Selector + CTA */}
        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center">
          {quickPoolCount > 5 ? (
            <div className="inline-flex rounded-xl bg-indigo-950/30 p-1">
              {([5, 10] as const).map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setSelectedQuickCount(cnt)}
                  className={`min-h-[40px] rounded-lg px-3.5 text-xs font-bold tabular-nums transition ${
                    selectedQuickCount === cnt
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-indigo-100 hover:text-white'
                  }`}
                >
                  {cnt}問
                </button>
              ))}
            </div>
          ) : null}

          <button
            type="button"
            disabled={quickPoolCount === 0}
            onClick={() =>
              launchMode('quick', {
                trackId: selectedQuickTrack,
                count: effectiveQuickCount,
              })
            }
            className="flex min-h-[50px] flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-extrabold text-indigo-700 shadow-sm transition hover:bg-indigo-50 active:scale-[0.99] disabled:opacity-50"
          >
            <Play className="h-4 w-4 fill-indigo-600 text-indigo-600" />
            <span>
              {effectiveQuickCount > 0
                ? `${effectiveQuickCount}問ドリルをスタート`
                : '問題がありません'}
            </span>
          </button>
        </div>
      </section>

      {/* Quick Review Modes: 🔥 苦手克服 & 🔖 ブックマーク復習 */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => launchMode('weak', { count: 'all' })}
          className="group flex items-start justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 text-left shadow-2xs transition hover:border-rose-300 hover:shadow-sm active:scale-[0.99]"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
              <Flame className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-slate-900">
                  苦手克服
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold tabular-nums ${
                    weakQuestionIds.length > 0
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {weakQuestionIds.length}問
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                {weakQuestionIds.length > 0
                  ? '直近で間違えた問題・正答率が低い問題を集中復習'
                  : '苦手問題はありません！素晴らしい✨'}
              </p>
            </div>
          </div>
          <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-rose-500" />
        </button>

        <button
          type="button"
          onClick={() => launchMode('bookmark', { count: 'all' })}
          className="group flex items-start justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 text-left shadow-2xs transition hover:border-amber-300 hover:shadow-sm active:scale-[0.99]"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
              <Bookmark className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-slate-900">
                  ブックマーク復習
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold tabular-nums ${
                    bookmarkedQuestionIds.length > 0
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {bookmarkedQuestionIds.length}問
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                {bookmarkedQuestionIds.length > 0
                  ? 'しおりを付けた重要論点だけを効率よく見直し'
                  : '気になった問題にブックマークを付けて保存できます'}
              </p>
            </div>
          </div>
          <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-amber-500" />
        </button>
      </section>

      {/* 📚 分野別トレーニング */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Layers className="h-4.5 w-4.5 text-indigo-600" />
            <h2 className="text-base font-extrabold text-slate-900">
              分野別トレーニング
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500 tabular-nums">
            全{activeExam.questions.length}問収録
          </span>
        </div>

        <div className="space-y-3">
          {activeExam.tracks.map((track) => {
            const mastery = trackMasteryList.find((m) => m.trackId === track.id);
            const catStats = getCategoryStats(activeExam.id, track.id);
            const style = getTrackColorStyle(track.color);
            const isExpanded = Boolean(expandedTracks[track.id]);
            const hasQuestions = (mastery?.totalQuestions ?? 0) > 0;

            return (
              <div
                key={track.id}
                className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs"
              >
                {/* Track Accordion Header */}
                <div className="flex items-center gap-2 p-4">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedTracks((prev) => ({
                        ...prev,
                        [track.id]: !prev[track.id],
                      }))
                    }
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <TrackBadge label={track.shortName} color={track.color} size="xs" />
                        <span className="text-sm font-extrabold text-slate-900">
                          {track.name}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                        {track.description}
                      </p>

                      {hasQuestions && mastery ? (
                        <div className="mt-2.5 flex items-center gap-2.5">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${style.barClass}`}
                              style={{ width: `${mastery.masteryRate}%` }}
                            />
                          </div>
                          <span className="shrink-0 text-[11px] font-bold text-slate-600 tabular-nums">
                            定着 {mastery.masteredQuestions}/{mastery.totalQuestions}問 (
                            {mastery.masteryRate}%)
                          </span>
                        </div>
                      ) : (
                        <span className="mt-1.5 inline-block text-[11px] font-semibold text-slate-400">
                          準備中（近日問題追加予定）
                        </span>
                      )}
                    </div>

                    <ChevronDown
                      className={`h-4.5 w-4.5 shrink-0 text-slate-400 transition-transform ${
                        isExpanded ? 'rotate-180 text-indigo-600' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Expanded Categories */}
                {isExpanded ? (
                  <div className="border-t border-slate-100 bg-slate-50/60 p-3.5 sm:p-4">
                    {hasQuestions && catStats.length > 0 ? (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-500">
                            分野をタップして演習開始
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              launchMode('track', { trackId: track.id, count: 'all' })
                            }
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-extrabold transition hover:opacity-80 ${style.badgeClass} border`}
                          >
                            <Play className="h-3 w-3" />
                            <span>{track.shortName} 全問に挑戦</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {catStats.map((stat) => (
                            <button
                              key={`${stat.trackId}-${stat.category}`}
                              type="button"
                              onClick={() =>
                                launchMode('category', {
                                  trackId: track.id,
                                  category: stat.category,
                                  count: 'all',
                                })
                              }
                              className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200/90 bg-white px-3.5 py-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50/30 active:scale-[0.99]"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="truncate text-sm font-bold text-slate-800 group-hover:text-indigo-700">
                                    {stat.category}
                                  </span>
                                </div>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500 tabular-nums">
                                  <span>{stat.totalQuestions}問</span>
                                  <span className="text-slate-300">•</span>
                                  <span>
                                    演習済 {stat.attemptedQuestions}/{stat.totalQuestions}
                                  </span>
                                  {stat.attemptedQuestions > 0 ? (
                                    <>
                                      <span className="text-slate-300">•</span>
                                      <span
                                        className={
                                          stat.accuracy >= 70
                                            ? 'text-emerald-600'
                                            : 'text-amber-600'
                                        }
                                      >
                                        正答率 {stat.accuracy}%
                                      </span>
                                    </>
                                  ) : null}
                                </div>
                              </div>

                              <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-500" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 py-2 text-xs font-medium text-slate-500">
                        <BookOpen className="h-4 w-4 text-slate-400" />
                        <span>この科目の問題は今後のアップデートで追加予定です。</span>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default function StudyPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <div className="h-8 w-40 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-48 animate-pulse rounded-3xl bg-slate-200" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="h-24 animate-pulse rounded-2xl bg-slate-200" />
            <div className="h-24 animate-pulse rounded-2xl bg-slate-200" />
          </div>
        </div>
      }
    >
      <StudyPageContent />
    </Suspense>
  );
}
