import type {
  ExamId,
  ExamPlugin,
  ExamToolId,
  ExamTrack,
  MockExam,
  Question,
  ReferenceItem,
  TrackId,
} from '@/types/exam';
import { bokiExamPlugin } from './boki';
import { shindanshiExamPlugin } from './shindanshi';

export const DEFAULT_EXAM_ID: ExamId = 'boki';

export const EXAM_REGISTRY: ExamPlugin[] = [bokiExamPlugin, shindanshiExamPlugin];

const examMap = new Map<ExamId, ExamPlugin>(EXAM_REGISTRY.map((exam) => [exam.id, exam]));

const allQuestionsFlat: Question[] = EXAM_REGISTRY.flatMap((exam) => exam.questions);
const questionByIdMap = new Map<string, Question>(allQuestionsFlat.map((q) => [q.id, q]));

const allMockExamsFlat: MockExam[] = EXAM_REGISTRY.flatMap((exam) => exam.mockExams);
const mockExamByIdMap = new Map<string, MockExam>(allMockExamsFlat.map((m) => [m.id, m]));

export function getAllExams(): ExamPlugin[] {
  return EXAM_REGISTRY;
}

export function getExam(examId?: ExamId): ExamPlugin | undefined {
  if (!examId) return undefined;
  return examMap.get(examId);
}

export function getDefaultExam(): ExamPlugin {
  return examMap.get(DEFAULT_EXAM_ID) ?? EXAM_REGISTRY[0];
}

export function getActiveOrDefaultExam(examId?: ExamId): ExamPlugin {
  return (examId ? examMap.get(examId) : undefined) ?? getDefaultExam();
}

export function getAllQuestions(examId?: ExamId): Question[] {
  if (!examId) return allQuestionsFlat;
  return examMap.get(examId)?.questions ?? [];
}

export function getQuestionById(id: string, examId?: ExamId): Question | undefined {
  const found = questionByIdMap.get(id);
  if (!found) return undefined;
  if (examId && found.examId !== examId) return undefined;
  return found;
}

export function getQuestionsByTrack(examId: ExamId, trackId: TrackId): Question[] {
  const exam = examMap.get(examId);
  if (!exam) return [];
  return exam.questions.filter((q) => q.trackId === trackId);
}

export function getCategoriesByTrack(examId: ExamId, trackId: TrackId): string[] {
  const questions = getQuestionsByTrack(examId, trackId);
  const seen = new Set<string>();
  for (const q of questions) {
    seen.add(q.category);
  }
  if (seen.size > 0) {
    return Array.from(seen);
  }
  const track = getTrackById(examId, trackId);
  return track?.categories ?? [];
}

export function getTrackById(examId: ExamId, trackId: TrackId): ExamTrack | undefined {
  const exam = examMap.get(examId);
  if (!exam) return undefined;
  return exam.tracks.find((t) => t.id === trackId);
}

export function getMockExamsByExam(examId: ExamId): MockExam[] {
  return examMap.get(examId)?.mockExams ?? [];
}

export function getMockExamById(mockExamId: string, examId?: ExamId): MockExam | undefined {
  const found = mockExamByIdMap.get(mockExamId);
  if (!found) return undefined;
  if (examId && found.examId !== examId) return undefined;
  return found;
}

export function getReferencesByExam(examId: ExamId): ReferenceItem[] {
  return examMap.get(examId)?.references ?? [];
}

export function examHasTool(examId: ExamId, toolId: ExamToolId): boolean {
  const exam = examMap.get(examId);
  return exam ? exam.tools.includes(toolId) : false;
}
