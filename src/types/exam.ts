export type ExamId = string;

export type TrackId = string;

export type ExamToolId = 'calculator';

export type ExamStatus = 'active' | 'coming-soon';

export type AccountElement = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

export type QuestionType = 'journal' | 'choice';

export interface ExamTrack {
  id: TrackId;
  name: string;
  shortName: string;
  description: string;
  color: 'emerald' | 'indigo' | 'sky' | 'amber' | 'rose' | 'violet' | 'teal';
  hexColor: string;
  categories: string[];
}

export interface JournalLine {
  account: string;
  amount: number;
  element: AccountElement;
  direction: 'increase' | 'decrease';
}

export interface JournalEntryInput {
  account: string;
  amount: number;
}

export interface ContextTable {
  title?: string;
  headers: string[];
  rows: string[][];
}

export interface BoxDiagram {
  title: string;
  unit?: string;
  leftTop: { label: string; value: string };
  leftBottom: { label: string; value: string };
  rightTop: { label: string; value: string };
  rightBottom: { label: string; value: string };
  note?: string;
}

export type ExplanationBlock =
  | {
      type: 'steps';
      title?: string;
      items: string[];
    }
  | {
      type: 'formula';
      title?: string;
      expression: string;
      note?: string;
    }
  | {
      type: 'journal';
      title?: string;
      debit: JournalLine[];
      credit: JournalLine[];
    }
  | {
      type: 'box-diagram';
      diagram: BoxDiagram;
    }
  | {
      type: 'table';
      table: ContextTable;
    }
  | {
      type: 'callout';
      tone: 'tip' | 'warning' | 'info';
      title: string;
      body: string;
    };

export interface QuestionExplanation {
  summary: string;
  steps: string[];
  calculation?: string;
  journalBreakdown?: {
    debit: JournalLine[];
    credit: JournalLine[];
  };
  boxDiagram?: BoxDiagram;
  examTip: string;
  commonMistake: string;
  relatedTerms: string[];
  extraBlocks?: ExplanationBlock[];
}

export interface JournalQuestionSpec {
  debitSlots: number;
  creditSlots: number;
  accountChoices: string[];
  amountChoices: number[];
  correctDebit: JournalEntryInput[];
  correctCredit: JournalEntryInput[];
}

export interface Question {
  id: string;
  examId: ExamId;
  trackId: TrackId;
  category: string;
  type: QuestionType;
  difficulty: 1 | 2 | 3;
  estimatedSeconds: number;
  title: string;
  prompt: string;
  contextTable?: ContextTable;
  journalSpec?: JournalQuestionSpec;
  choices?: string[];
  correctChoiceIndex?: number;
  explanation: QuestionExplanation;
  tags: string[];
}

export interface ReferenceItem {
  id: string;
  examId: ExamId;
  name: string;
  reading: string;
  /** Group key for filtering (e.g. AccountElement for Boki, TrackId for Shindanshi) */
  group: string;
  /** Display label for grade/track badge (e.g. '3級', '2級', '財務・会計') */
  trackLabel: string;
  shortDesc: string;
  detail: string;
  examTrap?: string;
  // Optional Boki-specific fields
  element?: AccountElement;
  homeSide?: 'debit' | 'credit';
  exampleDebit?: string;
  exampleCredit?: string;
  exampleNote?: string;
  // Optional generic exam fields
  formula?: string;
  relatedTerms?: string[];
}

export interface MockExamSection {
  id: string;
  title: string;
  subtitle: string;
  questionIds: string[];
  pointsPerQuestion: number;
}

export interface MockExam {
  id: string;
  examId: ExamId;
  targetTrackIds: TrackId[];
  gradeLabel: string;
  title: string;
  subtitle: string;
  mode: 'full' | 'half';
  durationMinutes: number;
  passingScore: number;
  totalPoints: number;
  sections: MockExamSection[];
}

export interface ExamPlugin {
  id: ExamId;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  status: ExamStatus;
  accentColor: 'indigo' | 'teal' | 'emerald';
  tools: ExamToolId[];
  tracks: ExamTrack[];
  referenceTitle: string;
  referenceSubtitle: string;
  questions: Question[];
  mockExams: MockExam[];
  references: ReferenceItem[];
}

export interface AnswerRecord {
  questionId: string;
  examId: ExamId;
  trackId: TrackId;
  attempts: number;
  correctCount: number;
  lastCorrect: boolean;
  lastAnsweredAt: string;
  timeSpentSeconds?: number;
}

export interface MockExamSectionScore {
  sectionId: string;
  title: string;
  earnedPoints: number;
  maxPoints: number;
  correctCount: number;
  totalCount: number;
}

export interface MockExamResult {
  id: string;
  examId: ExamId;
  mockExamId: string;
  examTitle: string;
  gradeLabel: string;
  targetTrackIds: TrackId[];
  mode: 'full' | 'half';
  completedAt: string;
  score: number;
  totalPoints: number;
  passingScore: number;
  passed: boolean;
  durationSeconds: number;
  correctCount: number;
  totalQuestions: number;
  sectionScores: MockExamSectionScore[];
  wrongQuestionIds: string[];
}

export interface UserProgress {
  activeExamId: ExamId;
  answers: Record<string, AnswerRecord>;
  bookmarks: string[];
  mockExamResults: MockExamResult[];
  streakDays: number;
  longestStreak: number;
  lastStudyDate: string | null;
  todayCount: number;
  todayDate: string | null;
  dailyGoal: number;
  xp: number;
  studyHistory: Record<string, number>;
}

export interface CategoryStat {
  examId: ExamId;
  trackId: TrackId;
  category: string;
  totalQuestions: number;
  attemptedQuestions: number;
  masteredQuestions: number;
  accuracy: number;
  masteryRate: number;
}

export interface TrackMastery {
  examId: ExamId;
  trackId: TrackId;
  trackName: string;
  shortName: string;
  color: ExamTrack['color'];
  hexColor: string;
  totalQuestions: number;
  attemptedQuestions: number;
  masteredQuestions: number;
  accuracy: number;
  masteryRate: number;
}
