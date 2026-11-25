'use client';

import { use } from 'react';
import Link from 'next/link';
import { getMockExamById } from '@/exams/registry';

export default function MockExamRunnerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const exam = getMockExamById(id);

  if (!exam) {
    return (
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <h1 className="text-lg font-bold text-slate-900">
          模擬テストが見つかりませんでした
        </h1>
        <Link
          href="/mock-exam"
          className="mt-4 inline-flex h-11 items-center rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white"
        >
          模擬テスト一覧へ戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
      <h1 className="text-xl font-extrabold text-slate-900">{exam.title}</h1>
      <p className="mt-1 text-sm text-slate-600">{exam.subtitle}</p>
    </div>
  );
}
