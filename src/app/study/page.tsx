'use client';

import { useExamStore } from '@/lib/storage';
import { ComingSoonBanner } from '@/components/ui/CommonUI';

export default function StudyPage() {
  const { activeExam, setActiveExamId } = useExamStore();

  return (
    <div className="space-y-4">
      {activeExam.status === 'coming-soon' ? (
        <ComingSoonBanner
          examName={activeExam.name}
          onSwitchToBoki={() => setActiveExamId('boki')}
        />
      ) : null}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <h1 className="text-xl font-extrabold text-slate-900">スキマ学習</h1>
        <p className="mt-1 text-sm text-slate-600">
          {activeExam.name}（収録問題数: {activeExam.questions.length}問）
        </p>
      </div>
    </div>
  );
}
