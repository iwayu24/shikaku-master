'use client';

import Link from 'next/link';
import { useExamStore } from '@/lib/storage';
import { ComingSoonBanner, ProgressRing, TrackBadge } from '@/components/ui/CommonUI';

export default function HomePage() {
  const { activeExam, setActiveExamId, getOverallMastery, getTrackMastery } =
    useExamStore();
  const overall = getOverallMastery();
  const tracks = getTrackMastery();

  return (
    <div className="space-y-6">
      {activeExam.status === 'coming-soon' ? (
        <ComingSoonBanner
          examName={activeExam.name}
          onSwitchToBoki={() => setActiveExamId('boki')}
        />
      ) : null}

      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold tracking-wide text-indigo-600">
              SHIKAKU MASTER
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
              {activeExam.name}
            </h1>
            <p className="mt-2 text-sm text-slate-600">{activeExam.tagline}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/study"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white shadow-xs transition hover:bg-indigo-700"
              >
                スキマ学習をはじめる
              </Link>
              <Link
                href="/mock-exam"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                模擬テスト
              </Link>
            </div>
          </div>
          <ProgressRing
            value={overall.masteryRate}
            size={96}
            sublabel="習得率"
          />
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {tracks.map((track) => (
          <div
            key={track.trackId}
            className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs"
          >
            <TrackBadge label={track.shortName} color={track.color} />
            <h2 className="mt-2 text-sm font-bold text-slate-900">
              {track.trackName}
            </h2>
            <p className="mt-1 text-xs text-slate-500 tabular-nums">
              {track.masteredQuestions} / {track.totalQuestions} 問 習得
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
