import type { ExamPlugin, Question } from '@/types/exam';
import { grade3Questions } from './grade3';
import { grade2CommercialQuestions } from './grade2-commercial';
import { grade2IndustrialQuestions } from './grade2-industrial';
import { accountsDictionary } from './accounts';
import { mockExams } from './mock-exams';

function extractCategories(questions: Question[], fallback: string[]): string[] {
  const seen = new Set<string>();
  for (const q of questions) {
    seen.add(q.category);
  }
  return seen.size > 0 ? Array.from(seen) : fallback;
}

const bokiQuestions: Question[] = [
  ...grade3Questions,
  ...grade2CommercialQuestions,
  ...grade2IndustrialQuestions,
];

export const bokiExamPlugin: ExamPlugin = {
  id: 'boki',
  name: '日商簿記 2級・3級',
  shortName: '日商簿記',
  tagline: 'スキマ時間で仕訳から決算・原価計算まで完全攻略',
  description:
    '日商簿記3級（商業簿記）および2級（商業簿記・工業簿記）の仕訳演習・模擬テスト・勘定科目辞典を収録。',
  status: 'active',
  accentColor: 'indigo',
  tools: ['calculator'],
  referenceTitle: '勘定科目辞典',
  referenceSubtitle: '5要素（資産・負債・純資産・収益・費用）ごとのホームポジションと頻出仕訳を確認',
  tracks: [
    {
      id: '3kyu',
      name: '日商簿記3級',
      shortName: '3級',
      description: '商業簿記の基礎・商品売買・現金預金・固定資産・決算整理',
      color: 'emerald',
      hexColor: '#10B981',
      categories: extractCategories(grade3Questions, [
        '商品売買',
        '現金・預金',
        '手形・債権債務',
        '固定資産',
        '決算整理',
      ]),
    },
    {
      id: '2kyu-shogyo',
      name: '日商簿記2級（商業簿記）',
      shortName: '2級 商業',
      description: '有価証券・リース・外貨建取引・税効果・連結会計など',
      color: 'indigo',
      hexColor: '#4F46E5',
      categories: extractCategories(grade2CommercialQuestions, [
        '有価証券',
        '固定資産・リース',
        '外貨建取引',
        '税効果・純資産',
        '連結会計',
      ]),
    },
    {
      id: '2kyu-kogyo',
      name: '日商簿記2級（工業簿記）',
      shortName: '2級 工業',
      description: '費目別計算・部門別・個別／総合原価・標準原価・CVP分析',
      color: 'sky',
      hexColor: '#0284C7',
      categories: extractCategories(grade2IndustrialQuestions, [
        '費目別計算',
        '個別・部門別原価計算',
        '総合原価計算',
        '標準原価計算',
        '直接原価計算・CVP',
      ]),
    },
  ],
  questions: bokiQuestions,
  mockExams,
  references: accountsDictionary,
};
