'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BarChart3,
  Bookmark,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Download,
  Flame,
  RotateCcw,
  Sparkles,
  Target,
  Trash2,
  Trophy,
  Zap,
} from 'lucide-react';
import { useExamStore } from '@/lib/storage';
import { ComingSoonBanner, TrackBadge } from '@/components/ui/CommonUI';
import {
  formatNumber,
  formatTimer,
  getTrackColorStyle,
} from '@/lib/constants';

const GOAL_OPTIONS = [3, 5, 10, 20];

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${y}/${m}/${day} ${h}:${min}`;
  } catch {
    return '';
  }
}

function getLast7Days(): { key: string; label: string }[] {
  const days: { key: string; label: string }[] = [];
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const now = new Date();
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    days.push({
      key: `${y}-${m}-${day}`,
      label: i === 0 ? '今日' : weekdays[d.getDay()],
    });
  }
  return days;
}

export default function StatsPage() {
  const {
    isLoaded,
    progress,
    activeExam,
    todayCount,
    effectiveStreak,
    weakQuestionIds,
    bookmarkedQuestionIds,
    activeExamMockResults,
    setActiveExamId,
    updateDailyGoal,
    resetProgress,
    getTrackMastery,
    getCategoryStats,
    getOverallMastery,
  } = useExamStore();

  const [selectedTrackId, setSelectedTrackId] = useState<string>('all');
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [resetConfirmMode, setResetConfirmMode] = useState<'none' | 'exam' | 'all'>(
    'none'
  );
  const [resetDoneMessage, setResetDoneMessage] = useState<string | null>(null);

  const overall = useMemo(
    () => getOverallMastery(activeExam.id),
    [getOverallMastery, activeExam.id]
  );

  const trackMasteries = useMemo(
    () => getTrackMastery(activeExam.id),
    [getTrackMastery, activeExam.id]
  );

  const totalAttemptsInExam = useMemo(() => {
    const qSet = new Set(activeExam.questions.map((q) => q.id));
    let sum = 0;
    for (const rec of Object.values(progress.answers)) {
      if (qSet.has(rec.questionId)) {
        sum += rec.attempts;
      }
    }
    return sum;
  }, [activeExam.questions, progress.answers]);

  const effectiveTrackFilter =
    selectedTrackId === 'all' ||
    activeExam.tracks.some((t) => t.id === selectedTrackId)
      ? selectedTrackId
      : 'all';

  const visibleTracks = useMemo(() => {
    if (effectiveTrackFilter === 'all') return activeExam.tracks;
    return activeExam.tracks.filter((t) => t.id === effectiveTrackFilter);
  }, [activeExam.tracks, effectiveTrackFilter]);

  const last7Days = useMemo(() => getLast7Days(), []);
  const maxDailyActivity = useMemo(() => {
    const counts = last7Days.map((d) => progress.studyHistory[d.key] ?? 0);
    return Math.max(progress.dailyGoal, ...counts, 1);
  }, [last7Days, progress.studyHistory, progress.dailyGoal]);

  const dailyPct = Math.min(
    100,
    Math.round((todayCount / Math.max(1, progress.dailyGoal)) * 100)
  );
  const userLevel = Math.floor(progress.xp / 200) + 1;

  const handleExportJson = () => {
    try {
      const payload = {
        exportedAt: new Date().toISOString(),
        app: 'shikaku-master',
        version: 1,
        progress,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const todayStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `shikaku-master-backup-${todayStr}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setExportMessage('バックアップJSONを保存しました');
      window.setTimeout(() => setExportMessage(null), 3500);
    } catch {
      setExportMessage('エクスポートに失敗しました');
    }
  };

  const handleConfirmReset = () => {
    if (resetConfirmMode === 'exam') {
      resetProgress(activeExam.id);
      setResetDoneMessage(`${activeExam.shortName}の学習データをリセットしました`);
    } else if (resetConfirmMode === 'all') {
      resetProgress();
      setResetDoneMessage('すべての学習データをリセットしました');
    }
    setResetConfirmMode('none');
    window.setTimeout(() => setResetDoneMessage(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700">
              <BarChart3 className="h-3.5 w-3.5" />
              <span>{activeExam.name}</span>
            </div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
              学習分析・成績管理
            </h1>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              分野別の正答率・模擬テスト推移・苦手問題を確認して、最短ルートで合格力を伸ばしましょう。
            </p>
          </div>
        </div>
      </section>

      {activeExam.status === 'coming-soon' ? (
        <ComingSoonBanner
          examName={activeExam.name}
          onSwitchToBoki={() => setActiveExamId('boki')}
        />
      ) : null}

      {/* KPI Grid */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <ClipboardCheck className="h-4 w-4 text-indigo-500" />
            <span>累計解答数</span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 tabular-nums">
            {isLoaded ? formatNumber(totalAttemptsInExam) : '0'}
            <span className="ml-1 text-xs font-semibold text-slate-400">回</span>
          </div>
          <div className="mt-1 text-[11px] font-medium text-slate-500 tabular-nums">
            演習済 {isLoaded ? overall.attemptedQuestions : 0} / {overall.totalQuestions}問
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <Target className="h-4 w-4 text-emerald-500" />
            <span>総合正答率</span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 tabular-nums">
            {isLoaded && overall.attemptedQuestions > 0 ? `${overall.accuracy}%` : '--'}
          </div>
          <div className="mt-1 text-[11px] font-medium text-slate-500 tabular-nums">
            習得済 {isLoaded ? overall.masteredQuestions : 0}問（{isLoaded ? overall.masteryRate : 0}%）
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <Flame className="h-4 w-4 text-amber-500" />
            <span>連続学習日数</span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 tabular-nums">
            {isLoaded ? effectiveStreak : 0}
            <span className="ml-1 text-xs font-semibold text-slate-400">日</span>
          </div>
          <div className="mt-1 text-[11px] font-medium text-slate-500 tabular-nums">
            最長記録 {isLoaded ? progress.longestStreak : 0}日
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <Sparkles className="h-4 w-4 text-violet-500" />
            <span>獲得XP</span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 tabular-nums">
            {isLoaded ? formatNumber(progress.xp) : '0'}
          </div>
          <div className="mt-1 text-[11px] font-medium text-slate-500 tabular-nums">
            ランク Lv.{isLoaded ? userLevel : 1}
          </div>
        </div>
      </section>

      {/* Daily Goal & 7-Day Activity */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Daily Goal Selector */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 sm:text-base">
                1日の学習目標
              </h2>
              <p className="text-xs text-slate-500">
                無理なく毎日続けられる問題数に設定しましょう
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-extrabold tabular-nums ${
                isLoaded && todayCount >= progress.dailyGoal
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-indigo-50 text-indigo-700'
              }`}
            >
              今日 {isLoaded ? todayCount : 0} / {progress.dailyGoal}問
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-3.5">
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  todayCount >= progress.dailyGoal ? 'bg-emerald-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${isLoaded ? dailyPct : 0}%` }}
              />
            </div>
          </div>

          {/* Goal Pills */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            {GOAL_OPTIONS.map((goal) => {
              const selected = progress.dailyGoal === goal;
              return (
                <button
                  key={goal}
                  type="button"
                  onClick={() => updateDailyGoal(goal)}
                  className={`min-h-[44px] rounded-xl border text-xs font-extrabold tabular-nums transition active:scale-95 ${
                    selected
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-2xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50'
                  }`}
                >
                  {goal}問/日
                </button>
              );
            })}
          </div>
        </div>

        {/* 7-Day Activity Mini Chart */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 sm:text-base">
                直近7日間の学習ボリューム
              </h2>
              <p className="text-xs text-slate-500">
                日別の解答数（全資格コース合算）
              </p>
            </div>
          </div>

          <div className="mt-4 grid h-28 grid-cols-7 items-end gap-2 pt-2">
            {last7Days.map((day) => {
              const count = isLoaded ? (progress.studyHistory[day.key] ?? 0) : 0;
              const heightPct =
                count > 0
                  ? Math.max(14, Math.round((count / maxDailyActivity) * 100))
                  : 6;
              const metGoal = count >= progress.dailyGoal;

              return (
                <div
                  key={day.key}
                  className="flex h-full flex-col items-center justify-end gap-1.5"
                >
                  <span className="text-[10px] font-bold text-slate-500 tabular-nums">
                    {count > 0 ? count : ''}
                  </span>
                  <div className="flex h-16 w-full items-end justify-center">
                    <div
                      className={`w-full max-w-[28px] rounded-t-lg transition-all duration-500 ${
                        count === 0
                          ? 'bg-slate-100'
                          : metGoal
                            ? 'bg-emerald-500'
                            : 'bg-indigo-500'
                      }`}
                      style={{ height: `${heightPct}%` }}
                      title={`${day.key}: ${count}問`}
                    />
                  </div>
                  <span
                    className={`text-[11px] font-bold ${
                      day.label === '今日' ? 'text-indigo-700' : 'text-slate-400'
                    }`}
                  >
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Weak Points & Bookmarks Actionable Cards */}
      <section className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <div className="flex flex-col justify-between rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50/80 to-white p-5 shadow-xs">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-extrabold text-amber-800">
                <RotateCcw className="h-3.5 w-3.5" />
                苦手問題キュー
              </span>
              <span className="text-2xl font-extrabold text-amber-900 tabular-nums">
                {isLoaded ? weakQuestionIds.length : 0}
                <span className="ml-0.5 text-xs font-bold text-amber-700">問</span>
              </span>
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-slate-600">
              直近で不正解だった問題や正答率60%未満の問題が自動で蓄積されます。復習して正解するとキューから卒業できます。
            </p>
          </div>

          <div className="mt-4">
            <Link
              href="/study?mode=weak&autostart=1"
              className="inline-flex min-h-[46px] w-full items-center justify-center gap-1.5 rounded-2xl bg-amber-600 px-4 text-xs font-extrabold text-white shadow-2xs transition hover:bg-amber-700 active:scale-[0.98]"
            >
              <Zap className="h-4 w-4" />
              <span>苦手問題を一気に復習</span>
            </Link>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-3xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/70 to-white p-5 shadow-xs">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-extrabold text-indigo-800">
                <Bookmark className="h-3.5 w-3.5 fill-indigo-600" />
                ブックマーク問題
              </span>
              <span className="text-2xl font-extrabold text-indigo-950 tabular-nums">
                {isLoaded ? bookmarkedQuestionIds.length : 0}
                <span className="ml-0.5 text-xs font-bold text-indigo-700">問</span>
              </span>
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-slate-600">
              演習や模擬テストで保存した重要問題・試験直前に見返したい問題をまとめて集中チェックできます。
            </p>
          </div>

          <div className="mt-4">
            <Link
              href="/study?mode=bookmark&autostart=1"
              className="inline-flex min-h-[46px] w-full items-center justify-center gap-1.5 rounded-2xl bg-indigo-600 px-4 text-xs font-extrabold text-white shadow-2xs transition hover:bg-indigo-700 active:scale-[0.98]"
            >
              <Bookmark className="h-4 w-4" />
              <span>ブックマーク問題を復習</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Category Accuracy Report (Grouped by Track) */}
      <section className="space-y-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 sm:text-lg">
              分野別正答率レポート
            </h2>
            <p className="text-xs text-slate-500">
              80%以上（緑）・60〜79%（黄）・60%未満（赤）で弱点分野が一目で分かります
            </p>
          </div>

          {activeExam.tracks.length > 1 ? (
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedTrackId('all')}
                className={`min-h-[34px] rounded-xl px-3 text-xs font-bold transition ${
                  effectiveTrackFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                すべて
              </button>
              {activeExam.tracks.map((track) => (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => setSelectedTrackId(track.id)}
                  className={`min-h-[34px] rounded-xl px-3 text-xs font-bold transition ${
                    effectiveTrackFilter === track.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  {track.shortName}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-5">
          {visibleTracks.map((track) => {
            const catStats = getCategoryStats(activeExam.id, track.id);
            const trackMastery = trackMasteries.find((m) => m.trackId === track.id);
            const style = getTrackColorStyle(track.color);

            if (catStats.length === 0) return null;

            return (
              <div
                key={track.id}
                className="rounded-2xl border border-slate-200/70 bg-slate-50/60 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200/70">
                  <div className="flex items-center gap-2">
                    <TrackBadge label={track.shortName} color={track.color} size="xs" />
                    <h3 className="text-sm font-extrabold text-slate-900">
                      {track.name}
                    </h3>
                  </div>
                  <div className="text-xs font-bold text-slate-600 tabular-nums">
                    習得 {isLoaded ? (trackMastery?.masteryRate ?? 0) : 0}%・正答率{' '}
                    <span className={style.accentClass}>
                      {isLoaded && (trackMastery?.attemptedQuestions ?? 0) > 0
                        ? `${trackMastery?.accuracy}%`
                        : '--'}
                    </span>
                  </div>
                </div>

                <div className="mt-3 space-y-2.5">
                  {catStats.map((cat) => {
                    const attempted = isLoaded ? cat.attemptedQuestions : 0;
                    const accuracy = isLoaded ? cat.accuracy : 0;
                    const barClass =
                      attempted === 0
                        ? 'bg-slate-300'
                        : accuracy >= 80
                          ? 'bg-emerald-500'
                          : accuracy >= 60
                            ? 'bg-amber-500'
                            : 'bg-rose-500';
                    const scoreTextClass =
                      attempted === 0
                        ? 'text-slate-400'
                        : accuracy >= 80
                          ? 'text-emerald-700'
                          : accuracy >= 60
                            ? 'text-amber-700'
                            : 'text-rose-700';

                    return (
                      <div
                        key={`${track.id}-${cat.category}`}
                        className="flex flex-col gap-2 rounded-xl bg-white p-3 shadow-2xs sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-xs font-extrabold text-slate-900 sm:text-sm">
                              {cat.category}
                            </span>
                            <span
                              className={`shrink-0 text-xs font-extrabold tabular-nums ${scoreTextClass}`}
                            >
                              {attempted > 0 ? `${accuracy}%` : '未学習'}
                            </span>
                          </div>
                          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${barClass}`}
                              style={{ width: `${attempted > 0 ? accuracy : 0}%` }}
                            />
                          </div>
                          <div className="mt-1 text-[11px] font-medium text-slate-400 tabular-nums">
                            解答済 {attempted}/{cat.totalQuestions}問・習得{' '}
                            {isLoaded ? cat.masteredQuestions : 0}問
                          </div>
                        </div>

                        <Link
                          href={`/study?mode=category&track=${encodeURIComponent(track.id)}&category=${encodeURIComponent(cat.category)}&autostart=1`}
                          className="inline-flex h-9 shrink-0 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                        >
                          <span>復習する</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Mock Exam History */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 sm:text-lg">
              模擬テスト履歴
            </h2>
            <p className="text-xs text-slate-500">
              受験した模擬テストのスコア・合否・所要時間の記録
            </p>
          </div>
          <Link
            href="/mock-exam"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
          >
            模試一覧へ →
          </Link>
        </div>

        {!isLoaded || activeExamMockResults.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center">
            <Award className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-xs font-bold text-slate-600">
              まだ模擬テストの受験履歴がありません
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              ハーフ模試（25分〜）から気軽に現在の実力を測ってみましょう。
            </p>
            <Link
              href="/mock-exam"
              className="mt-3.5 inline-flex h-10 items-center gap-1.5 rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white transition hover:bg-indigo-700"
            >
              <span>模擬テストに挑戦する</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-2.5">
            {activeExamMockResults.map((res) => (
              <div
                key={res.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/60 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                        res.passed
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {res.passed ? (
                        <Trophy className="h-3 w-3" />
                      ) : (
                        <Target className="h-3 w-3" />
                      )}
                      {res.passed ? '合格ライン到達' : '不合格'}
                    </span>
                    <TrackBadge
                      label={res.gradeLabel}
                      color={res.gradeLabel.includes('3') ? 'emerald' : 'indigo'}
                      size="xs"
                    />
                    <span className="rounded bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200">
                      {res.mode === 'full' ? '本番' : 'ハーフ'}
                    </span>
                    <span className="text-[11px] text-slate-400 tabular-nums">
                      {formatDateTime(res.completedAt)}
                    </span>
                  </div>

                  <div className="truncate text-sm font-extrabold text-slate-900">
                    {res.examTitle}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-slate-500 tabular-nums">
                    <span>
                      正答 {res.correctCount}/{res.totalQuestions}問
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimer(res.durationSeconds)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <div className="text-right tabular-nums">
                    <div
                      className={`text-xl font-extrabold ${
                        res.passed ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {res.score}
                      <span className="text-xs font-semibold text-slate-400">
                        /{res.totalPoints}点
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/mock-exam/${res.mockExamId}`}
                    className="inline-flex h-10 shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>再受験</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Learning Data Management */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6">
        <h2 className="text-base font-extrabold text-slate-900">学習データ管理</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          学習進捗はお使いのブラウザ（localStorage）に自動保存されます。JSON形式でバックアップを作成できます。
        </p>

        {exportMessage ? (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{exportMessage}</span>
          </div>
        ) : null}

        {resetDoneMessage ? (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2.5 text-xs font-bold text-indigo-800">
            <CheckCircle2 className="h-4 w-4 text-indigo-600" />
            <span>{resetDoneMessage}</span>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportJson}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-bold text-slate-800 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 active:scale-95"
          >
            <Download className="h-4 w-4" />
            <span>JSONバックアップを保存</span>
          </button>

          {resetConfirmMode === 'none' ? (
            <>
              <button
                type="button"
                onClick={() => setResetConfirmMode('exam')}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-4 text-xs font-bold text-rose-600 transition hover:bg-rose-50 active:scale-95"
              >
                <Trash2 className="h-4 w-4" />
                <span>{activeExam.shortName}の進捗をリセット</span>
              </button>
              <button
                type="button"
                onClick={() => setResetConfirmMode('all')}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 active:scale-95"
              >
                <span>全データを初期化</span>
              </button>
            </>
          ) : null}
        </div>

        {/* Two-step Confirmed Reset Panel */}
        {resetConfirmMode !== 'none' ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50/80 p-4">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-extrabold text-rose-900">
                  {resetConfirmMode === 'exam'
                    ? `${activeExam.name}の学習データを本当にリセットしますか？`
                    : 'すべての学習データ（XP・連続記録・模試履歴含む）を初期化しますか？'}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-rose-800/80">
                  この操作は取り消せません。必要に応じて先に「JSONバックアップを保存」してください。
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setResetConfirmMode('none')}
                    className="inline-flex h-10 items-center rounded-xl border border-slate-300 bg-white px-4 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmReset}
                    className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-rose-600 px-4 text-xs font-extrabold text-white transition hover:bg-rose-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>確認してリセットを実行</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
