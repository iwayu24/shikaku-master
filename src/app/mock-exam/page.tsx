'use client';

import { useExamStore } from '@/lib/storage';
import { ComingSoonBanner } from '@/components/ui/CommonUI';

export default function MockExamListPage() {
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
        <h1 className="text-xl font-extrabold text-slate-900">模擬テスト</h1>
        <p className="mt-1 text-sm text-slate-600">
          {activeExam.name}（収録模試数: {activeExam.mockExams.length}回）
        </p>
      </div>
    </div>
  );
}
