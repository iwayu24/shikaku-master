'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  DEFAULT_EXAM_ID,
  getActiveOrDefaultExam,
  getAllExams,
  getCategoriesByTrack,
  getQuestionById,
  getQuestionsByTrack,
} from '@/exams/registry';
import type {
  AnswerRecord,
  CategoryStat,
  ExamId,
  ExamPlugin,
  MockExamResult,
  TrackId,
  TrackMastery,
  UserProgress,
} from '@/types/exam';

const STORAGE_KEY = 'shikaku_master_progress_v1';

function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getYesterdayDateKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getLocalDateKey(d);
}

function createInitialProgress(): UserProgress {
  return {
    activeExamId: DEFAULT_EXAM_ID,
    answers: {},
    bookmarks: [],
    mockExamResults: [],
    streakDays: 0,
    longestStreak: 0,
    lastStudyDate: null,
    todayCount: 0,
    todayDate: null,
    dailyGoal: 5,
    xp: 0,
    studyHistory: {},
  };
}

function sanitizeProgress(raw: unknown): UserProgress {
  const base = createInitialProgress();
  if (!raw || typeof raw !== 'object') return base;
  const obj = raw as Partial<UserProgress>;

  return {
    activeExamId:
      typeof obj.activeExamId === 'string' && obj.activeExamId.length > 0
        ? obj.activeExamId
        : base.activeExamId,
    answers: obj.answers && typeof obj.answers === 'object' ? obj.answers : {},
    bookmarks: Array.isArray(obj.bookmarks)
      ? obj.bookmarks.filter((id): id is string => typeof id === 'string')
      : [],
    mockExamResults: Array.isArray(obj.mockExamResults) ? obj.mockExamResults : [],
    streakDays: typeof obj.streakDays === 'number' && obj.streakDays >= 0 ? obj.streakDays : 0,
    longestStreak:
      typeof obj.longestStreak === 'number' && obj.longestStreak >= 0 ? obj.longestStreak : 0,
    lastStudyDate: typeof obj.lastStudyDate === 'string' ? obj.lastStudyDate : null,
    todayCount: typeof obj.todayCount === 'number' && obj.todayCount >= 0 ? obj.todayCount : 0,
    todayDate: typeof obj.todayDate === 'string' ? obj.todayDate : null,
    dailyGoal:
      typeof obj.dailyGoal === 'number' && obj.dailyGoal >= 1 && obj.dailyGoal <= 100
        ? Math.round(obj.dailyGoal)
        : 5,
    xp: typeof obj.xp === 'number' && obj.xp >= 0 ? obj.xp : 0,
    studyHistory:
      obj.studyHistory && typeof obj.studyHistory === 'object' ? obj.studyHistory : {},
  };
}

export interface OverallMastery {
  totalQuestions: number;
  attemptedQuestions: number;
  masteredQuestions: number;
  accuracy: number;
  masteryRate: number;
}

export interface ExamStoreContextValue {
  isLoaded: boolean;
  progress: UserProgress;
  activeExamId: ExamId;
  activeExam: ExamPlugin;
  allExams: ExamPlugin[];
  todayCount: number;
  effectiveStreak: number;
  weakQuestionIds: string[];
  bookmarkedQuestionIds: string[];
  activeExamMockResults: MockExamResult[];
  setActiveExamId: (examId: ExamId) => void;
  recordAnswer: (
    questionId: string,
    isCorrect: boolean,
    timeSpentSeconds?: number
  ) => void;
  toggleBookmark: (questionId: string) => void;
  isBookmarked: (questionId: string) => boolean;
  getAnswerRecord: (questionId: string) => AnswerRecord | undefined;
  saveMockExamResult: (
    result: Omit<MockExamResult, 'id' | 'completedAt'> & {
      id?: string;
      completedAt?: string;
    }
  ) => MockExamResult;
  updateDailyGoal: (goal: number) => void;
  resetProgress: (examId?: ExamId) => void;
  getTrackMastery: (examId?: ExamId) => TrackMastery[];
  getCategoryStats: (examId?: ExamId, trackId?: TrackId) => CategoryStat[];
  getOverallMastery: (examId?: ExamId) => OverallMastery;
}

const ExamStoreContext = createContext<ExamStoreContextValue | null>(null);

export function ExamStoreProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<UserProgress>(createInitialProgress);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setProgress(sanitizeProgress(JSON.parse(saved)));
      }
    } catch {
      // Ignore storage read/parse errors in restricted environments
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore storage quota errors
    }
  }, [progress, isLoaded]);

  const allExams = useMemo(() => getAllExams(), []);
  const activeExam = useMemo(
    () => getActiveOrDefaultExam(progress.activeExamId),
    [progress.activeExamId]
  );

  const setActiveExamId = useCallback((examId: ExamId) => {
    const resolved = getActiveOrDefaultExam(examId);
    setProgress((prev) => ({
      ...prev,
      activeExamId: resolved.id,
    }));
  }, []);

  const recordAnswer = useCallback(
    (questionId: string, isCorrect: boolean, timeSpentSeconds?: number) => {
      const question = getQuestionById(questionId);
      const now = new Date();
      const today = getLocalDateKey(now);
      const yesterday = getYesterdayDateKey();

      setProgress((prev) => {
        const existing = prev.answers[questionId];
        const prevWasMastered = existing ? existing.lastCorrect : false;

        const nextRecord: AnswerRecord = {
          questionId,
          examId: question?.examId ?? existing?.examId ?? prev.activeExamId,
          trackId: question?.trackId ?? existing?.trackId ?? 'unknown',
          attempts: (existing?.attempts ?? 0) + 1,
          correctCount: (existing?.correctCount ?? 0) + (isCorrect ? 1 : 0),
          lastCorrect: isCorrect,
          lastAnsweredAt: now.toISOString(),
          timeSpentSeconds,
        };

        let nextStreak = prev.streakDays;
        if (prev.lastStudyDate === today) {
          nextStreak = Math.max(1, prev.streakDays);
        } else if (prev.lastStudyDate === yesterday) {
          nextStreak = prev.streakDays + 1;
        } else {
          nextStreak = 1;
        }

        const nextTodayCount = prev.todayDate === today ? prev.todayCount + 1 : 1;
        const earnedXp = isCorrect ? (prevWasMastered ? 15 : 25) : 5;

        return {
          ...prev,
          answers: {
            ...prev.answers,
            [questionId]: nextRecord,
          },
          streakDays: nextStreak,
          longestStreak: Math.max(prev.longestStreak, nextStreak),
          lastStudyDate: today,
          todayDate: today,
          todayCount: nextTodayCount,
          xp: prev.xp + earnedXp,
          studyHistory: {
            ...prev.studyHistory,
            [today]: (prev.studyHistory[today] ?? 0) + 1,
          },
        };
      });
    },
    []
  );

  const toggleBookmark = useCallback((questionId: string) => {
    setProgress((prev) => {
      const exists = prev.bookmarks.includes(questionId);
      return {
        ...prev,
        bookmarks: exists
          ? prev.bookmarks.filter((id) => id !== questionId)
          : [questionId, ...prev.bookmarks],
      };
    });
  }, []);

  const isBookmarked = useCallback(
    (questionId: string) => progress.bookmarks.includes(questionId),
    [progress.bookmarks]
  );

  const getAnswerRecord = useCallback(
    (questionId: string) => progress.answers[questionId],
    [progress.answers]
  );

  const saveMockExamResult = useCallback(
    (
      result: Omit<MockExamResult, 'id' | 'completedAt'> & {
        id?: string;
        completedAt?: string;
      }
    ): MockExamResult => {
      const now = new Date();
      const today = getLocalDateKey(now);
      const yesterday = getYesterdayDateKey();

      const fullResult: MockExamResult = {
        ...result,
        id:
          result.id ??
          `mock-${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
        completedAt: result.completedAt ?? now.toISOString(),
      };

      setProgress((prev) => {
        let nextStreak = prev.streakDays;
        if (prev.lastStudyDate === today) {
          nextStreak = Math.max(1, prev.streakDays);
        } else if (prev.lastStudyDate === yesterday) {
          nextStreak = prev.streakDays + 1;
        } else {
          nextStreak = 1;
        }

        const bonusXp = fullResult.passed ? 120 : 50;

        return {
          ...prev,
          mockExamResults: [fullResult, ...prev.mockExamResults].slice(0, 50),
          streakDays: nextStreak,
          longestStreak: Math.max(prev.longestStreak, nextStreak),
          lastStudyDate: today,
          xp: prev.xp + bonusXp,
        };
      });

      return fullResult;
    },
    []
  );

  const updateDailyGoal = useCallback((goal: number) => {
    const clamped = Math.max(1, Math.min(50, Math.round(goal)));
    setProgress((prev) => ({
      ...prev,
      dailyGoal: clamped,
    }));
  }, []);

  const resetProgress = useCallback((examId?: ExamId) => {
    if (!examId) {
      setProgress((prev) => ({
        ...createInitialProgress(),
        activeExamId: prev.activeExamId,
      }));
      return;
    }

    const exam = getActiveOrDefaultExam(examId);
    const examQuestionIds = new Set(exam.questions.map((q) => q.id));

    setProgress((prev) => {
      const nextAnswers: Record<string, AnswerRecord> = {};
      for (const [qid, rec] of Object.entries(prev.answers)) {
        if (rec.examId !== examId && !examQuestionIds.has(qid)) {
          nextAnswers[qid] = rec;
        }
      }
      return {
        ...prev,
        answers: nextAnswers,
        bookmarks: prev.bookmarks.filter((qid) => !examQuestionIds.has(qid)),
        mockExamResults: prev.mockExamResults.filter((r) => r.examId !== examId),
      };
    });
  }, []);

  const todayKey = isLoaded ? getLocalDateKey() : null;
  const yesterdayKey = isLoaded ? getYesterdayDateKey() : null;

  const todayCount =
    todayKey && progress.todayDate === todayKey ? progress.todayCount : 0;

  const effectiveStreak =
    todayKey &&
    (progress.lastStudyDate === todayKey || progress.lastStudyDate === yesterdayKey)
      ? progress.streakDays
      : 0;

  const activeExamQuestionIdSet = useMemo(
    () => new Set(activeExam.questions.map((q) => q.id)),
    [activeExam]
  );

  const weakQuestionIds = useMemo(() => {
    return Object.values(progress.answers)
      .filter(
        (rec) =>
          activeExamQuestionIdSet.has(rec.questionId) &&
          (!rec.lastCorrect ||
            (rec.attempts > 0 && rec.correctCount / rec.attempts < 0.6))
      )
      .sort((a, b) => b.lastAnsweredAt.localeCompare(a.lastAnsweredAt))
      .map((rec) => rec.questionId);
  }, [progress.answers, activeExamQuestionIdSet]);

  const bookmarkedQuestionIds = useMemo(
    () => progress.bookmarks.filter((id) => activeExamQuestionIdSet.has(id)),
    [progress.bookmarks, activeExamQuestionIdSet]
  );

  const activeExamMockResults = useMemo(
    () =>
      progress.mockExamResults
        .filter((r) => r.examId === activeExam.id)
        .sort((a, b) => b.completedAt.localeCompare(a.completedAt)),
    [progress.mockExamResults, activeExam.id]
  );

  const getTrackMastery = useCallback(
    (examId?: ExamId): TrackMastery[] => {
      const exam = getActiveOrDefaultExam(examId ?? activeExam.id);
      return exam.tracks.map((track) => {
        const trackQuestions = getQuestionsByTrack(exam.id, track.id);
        let attempted = 0;
        let mastered = 0;
        let totalAttempts = 0;
        let totalCorrect = 0;

        for (const q of trackQuestions) {
          const rec = progress.answers[q.id];
          if (rec && rec.attempts > 0) {
            attempted += 1;
            totalAttempts += rec.attempts;
            totalCorrect += rec.correctCount;
            if (rec.lastCorrect) {
              mastered += 1;
            }
          }
        }

        const total = trackQuestions.length;
        return {
          examId: exam.id,
          trackId: track.id,
          trackName: track.name,
          shortName: track.shortName,
          color: track.color,
          hexColor: track.hexColor,
          totalQuestions: total,
          attemptedQuestions: attempted,
          masteredQuestions: mastered,
          accuracy: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0,
          masteryRate: total > 0 ? Math.round((mastered / total) * 100) : 0,
        };
      });
    },
    [activeExam.id, progress.answers]
  );

  const getCategoryStats = useCallback(
    (examId?: ExamId, trackId?: TrackId): CategoryStat[] => {
      const exam = getActiveOrDefaultExam(examId ?? activeExam.id);
      const tracks = trackId
        ? exam.tracks.filter((t) => t.id === trackId)
        : exam.tracks;

      const results: CategoryStat[] = [];

      for (const track of tracks) {
        const trackQuestions = getQuestionsByTrack(exam.id, track.id);
        const categories = getCategoriesByTrack(exam.id, track.id);

        for (const category of categories) {
          const catQuestions = trackQuestions.filter((q) => q.category === category);
          if (catQuestions.length === 0) continue;

          let attempted = 0;
          let mastered = 0;
          let totalAttempts = 0;
          let totalCorrect = 0;

          for (const q of catQuestions) {
            const rec = progress.answers[q.id];
            if (rec && rec.attempts > 0) {
              attempted += 1;
              totalAttempts += rec.attempts;
              totalCorrect += rec.correctCount;
              if (rec.lastCorrect) {
                mastered += 1;
              }
            }
          }

          results.push({
            examId: exam.id,
            trackId: track.id,
            category,
            totalQuestions: catQuestions.length,
            attemptedQuestions: attempted,
            masteredQuestions: mastered,
            accuracy:
              totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0,
            masteryRate: Math.round((mastered / catQuestions.length) * 100),
          });
        }
      }

      return results;
    },
    [activeExam.id, progress.answers]
  );

  const getOverallMastery = useCallback(
    (examId?: ExamId): OverallMastery => {
      const exam = getActiveOrDefaultExam(examId ?? activeExam.id);
      const total = exam.questions.length;
      let attempted = 0;
      let mastered = 0;
      let totalAttempts = 0;
      let totalCorrect = 0;

      for (const q of exam.questions) {
        const rec = progress.answers[q.id];
        if (rec && rec.attempts > 0) {
          attempted += 1;
          totalAttempts += rec.attempts;
          totalCorrect += rec.correctCount;
          if (rec.lastCorrect) {
            mastered += 1;
          }
        }
      }

      return {
        totalQuestions: total,
        attemptedQuestions: attempted,
        masteredQuestions: mastered,
        accuracy: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0,
        masteryRate: total > 0 ? Math.round((mastered / total) * 100) : 0,
      };
    },
    [activeExam.id, progress.answers]
  );

  const value = useMemo<ExamStoreContextValue>(
    () => ({
      isLoaded,
      progress,
      activeExamId: activeExam.id,
      activeExam,
      allExams,
      todayCount,
      effectiveStreak,
      weakQuestionIds,
      bookmarkedQuestionIds,
      activeExamMockResults,
      setActiveExamId,
      recordAnswer,
      toggleBookmark,
      isBookmarked,
      getAnswerRecord,
      saveMockExamResult,
      updateDailyGoal,
      resetProgress,
      getTrackMastery,
      getCategoryStats,
      getOverallMastery,
    }),
    [
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
      recordAnswer,
      toggleBookmark,
      isBookmarked,
      getAnswerRecord,
      saveMockExamResult,
      updateDailyGoal,
      resetProgress,
      getTrackMastery,
      getCategoryStats,
      getOverallMastery,
    ]
  );

  return React.createElement(ExamStoreContext.Provider, { value }, children);
}

export function useExamStore(): ExamStoreContextValue {
  const ctx = useContext(ExamStoreContext);
  if (!ctx) {
    throw new Error('useExamStore must be used within an ExamStoreProvider');
  }
  return ctx;
}

/** Convenience alias for Boki components */
export const BokiStoreProvider = ExamStoreProvider;
export const useBokiStore = useExamStore;
