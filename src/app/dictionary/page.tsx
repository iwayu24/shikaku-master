'use client';

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  BookOpen,
  Calculator,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import {
  ComingSoonBanner,
  ElementBadge,
  TrackBadge,
} from '@/components/ui/CommonUI';
import { ACCOUNT_ELEMENTS, ELEMENT_META } from '@/lib/constants';
import { useExamStore } from '@/lib/storage';
import type { AccountElement, ExamTrack, ReferenceItem } from '@/types/exam';

function normalizeQuery(text: string): string {
  return text.trim().toLowerCase();
}

function getTrackBadgeColor(
  trackLabel: string,
  group: string,
  tracks: ExamTrack[]
): ExamTrack['color'] {
  const matchedTrack = tracks.find(
    (t) => t.id === group || t.shortName === trackLabel || t.name === trackLabel
  );
  if (matchedTrack) return matchedTrack.color;
  if (trackLabel.includes('3級')) return 'emerald';
  if (trackLabel.includes('2級')) return 'indigo';
  return 'sky';
}

function DictionaryPageContent() {
  const searchParams = useSearchParams();
  const { activeExam, setActiveExamId } = useExamStore();
  const initialQuery = searchParams.get('q') ?? '';

  const [query, setQuery] = useState<string>(initialQuery);
  const [selectedElement, setSelectedElement] = useState<AccountElement | 'all'>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const prevExamIdRef = useRef<string>(activeExam.id);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  const references = activeExam.references;
  const isElementBased = useMemo(
    () => activeExam.id === 'boki' || references.some((item) => Boolean(item.element)),
    [activeExam.id, references]
  );

  // Sync URL ?q= parameter changes (e.g. clicking related terms from ExplanationPanel)
  const urlQ = searchParams.get('q');
  useEffect(() => {
    if (urlQ !== null) {
      setQuery(urlQ);
      setSelectedElement('all');
      setSelectedGrade('all');
      setSelectedGroup('all');
    }
  }, [urlQ]);

  // Reset filters when user switches exam
  useEffect(() => {
    if (prevExamIdRef.current !== activeExam.id) {
      prevExamIdRef.current = activeExam.id;
      setQuery('');
      setSelectedElement('all');
      setSelectedGrade('all');
      setSelectedGroup('all');
      setExpandedIds({});
    }
  }, [activeExam.id]);

  // Extract unique grade labels for Boki (e.g. '3級', '2級')
  const availableGrades = useMemo(() => {
    const set = new Set<string>();
    for (const item of references) {
      if (item.trackLabel) set.add(item.trackLabel);
    }
    const list = Array.from(set);
    // Keep 3級 before 2級 if present
    return list.sort((a, b) => {
      if (a.includes('3級') && b.includes('2級')) return -1;
      if (a.includes('2級') && b.includes('3級')) return 1;
      return a.localeCompare(b, 'ja');
    });
  }, [references]);

  // Extract unique groups for generic exams (e.g. Shindanshi tracks)
  const availableGroups = useMemo(() => {
    const groupMap = new Map<string, string>();
    for (const item of references) {
      if (!groupMap.has(item.group)) {
        const track = activeExam.tracks.find((t) => t.id === item.group);
        groupMap.set(item.group, track?.shortName ?? item.trackLabel ?? item.group);
      }
    }
    return Array.from(groupMap.entries()).map(([id, label]) => ({ id, label }));
  }, [references, activeExam.tracks]);

  // Element counts for Boki filter chips
  const elementCounts = useMemo(() => {
    const counts: Record<string, number> = { all: references.length };
    for (const el of ACCOUNT_ELEMENTS) counts[el] = 0;
    for (const item of references) {
      if (item.element) {
        counts[item.element] = (counts[item.element] ?? 0) + 1;
      }
    }
    return counts;
  }, [references]);

  // Filtered references
  const filteredItems = useMemo(() => {
    const q = normalizeQuery(query);

    return references.filter((item) => {
      if (isElementBased) {
        if (selectedElement !== 'all' && item.element !== selectedElement) {
          return false;
        }
        if (selectedGrade !== 'all' && item.trackLabel !== selectedGrade) {
          return false;
        }
      } else {
        if (selectedGroup !== 'all' && item.group !== selectedGroup) {
          return false;
        }
      }

      if (!q) return true;

      const haystack = [
        item.name,
        item.reading,
        item.shortDesc,
        item.detail,
        item.examTrap ?? '',
        item.trackLabel,
        ...(item.relatedTerms ?? []),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [
    references,
    query,
    isElementBased,
    selectedElement,
    selectedGrade,
    selectedGroup,
  ]);

  // Auto-expand single result or exact name match when searching
  useEffect(() => {
    const q = normalizeQuery(query);
    if (!q) return;

    if (filteredItems.length === 1) {
      setExpandedIds({ [filteredItems[0].id]: true });
      return;
    }

    const exact = filteredItems.find((item) => normalizeQuery(item.name) === q);
    if (exact) {
      setExpandedIds((prev) => ({ ...prev, [exact.id]: true }));
    }
  }, [query, filteredItems]);

  const hasActiveFilter =
    query.trim().length > 0 ||
    selectedElement !== 'all' ||
    selectedGrade !== 'all' ||
    selectedGroup !== 'all';

  const handleResetFilters = () => {
    setQuery('');
    setSelectedElement('all');
    setSelectedGrade('all');
    setSelectedGroup('all');
  };

  const handleJumpToTerm = (term: string) => {
    setSelectedElement('all');
    setSelectedGrade('all');
    setSelectedGroup('all');
    setQuery(term);

    const exact = references.find(
      (r) =>
        normalizeQuery(r.name) === normalizeQuery(term) ||
        normalizeQuery(r.name).includes(normalizeQuery(term))
    );
    if (exact) {
      setExpandedIds({ [exact.id]: true });
    }
    searchBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const toggleItem = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-indigo-600" />
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
            {activeExam.referenceTitle}
          </h1>
        </div>
        <p className="mt-1 text-xs leading-relaxed font-medium text-slate-500 sm:text-sm">
          {activeExam.referenceSubtitle}
        </p>
      </div>

      {/* Coming Soon Banner for preview exams */}
      {activeExam.status === 'coming-soon' ? (
        <ComingSoonBanner
          examName={activeExam.name}
          onSwitchToBoki={() => setActiveExamId('boki')}
        />
      ) : null}

      {/* Boki 5-Element Home Position Quick Legend */}
      {isElementBased ? (
        <div className="grid grid-cols-1 gap-2 rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs sm:grid-cols-2">
          <div className="flex items-center gap-2.5 rounded-xl bg-blue-50/70 px-3 py-2 border border-blue-100">
            <span className="shrink-0 rounded-md bg-blue-600 px-2 py-0.5 text-[11px] font-extrabold text-white">
              借方（左）
            </span>
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-700">
              <span className="text-[11px] text-slate-500">増加が左：</span>
              <ElementBadge element="asset" size="xs" />
              <ElementBadge element="expense" size="xs" />
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-xl bg-rose-50/65 px-3 py-2 border border-rose-100">
            <span className="shrink-0 rounded-md bg-rose-600 px-2 py-0.5 text-[11px] font-extrabold text-white">
              貸方（右）
            </span>
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-700">
              <span className="text-[11px] text-slate-500">増加が右：</span>
              <ElementBadge element="liability" size="xs" />
              <ElementBadge element="equity" size="xs" />
              <ElementBadge element="revenue" size="xs" />
            </div>
          </div>
        </div>
      ) : null}

      {/* Sticky Search & Filter Bar */}
      <div
        ref={searchBoxRef}
        className="sticky top-14 z-20 -mx-4 space-y-2.5 border-y border-slate-200/80 bg-slate-50/95 px-4 py-3 backdrop-blur-md sm:top-16 sm:-mx-6 sm:px-6"
      >
        {/* Search Input */}
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isElementBased
                ? '勘定科目名・読み・キーワードで検索（例：売掛金、減価償却、リース）'
                : '用語名・読み・キーワードで検索'
            }
            aria-label="辞典を検索"
            className="h-11 w-full rounded-2xl border border-slate-300/90 bg-white pr-10 pl-10 text-sm font-medium text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="検索語をクリア"
              className="absolute top-1/2 right-2.5 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        {/* Filter Chips */}
        {isElementBased ? (
          <div className="space-y-2">
            {/* 5 Elements Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              <button
                type="button"
                onClick={() => setSelectedElement('all')}
                className={`inline-flex h-8 shrink-0 items-center gap-1 rounded-full border px-3 text-xs font-bold transition ${
                  selectedElement === 'all'
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <span>すべて</span>
                <span className="opacity-70 tabular-nums">{elementCounts.all}</span>
              </button>

              {ACCOUNT_ELEMENTS.map((el) => {
                const meta = ELEMENT_META[el];
                const active = selectedElement === el;
                return (
                  <button
                    key={el}
                    type="button"
                    onClick={() => setSelectedElement(el)}
                    className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-bold transition ${
                      active
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${active ? 'bg-white' : meta.dotClass}`}
                    />
                    <span>{meta.label}</span>
                    <span className="text-[11px] opacity-75 tabular-nums">
                      {elementCounts[el] ?? 0}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Grade Filter & Result Count Row */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              {availableGrades.length > 1 ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-400">級：</span>
                  <button
                    type="button"
                    onClick={() => setSelectedGrade('all')}
                    className={`h-7 rounded-lg px-2.5 text-xs font-bold transition ${
                      selectedGrade === 'all'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    すべて
                  </button>
                  {availableGrades.map((grade) => (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => setSelectedGrade(grade)}
                      className={`h-7 rounded-lg px-2.5 text-xs font-bold transition ${
                        selectedGrade === grade
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {grade}
                    </button>
                  ))}
                </div>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 tabular-nums">
                <span>
                  {filteredItems.length}件 / 全{references.length}件
                </span>
                {hasActiveFilter ? (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1 text-indigo-600 hover:underline"
                  >
                    <RotateCcw className="h-3 w-3" />
                    リセット
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          /* Generic Exam Group Tabs */
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              <button
                type="button"
                onClick={() => setSelectedGroup('all')}
                className={`h-8 shrink-0 rounded-full border px-3 text-xs font-bold transition ${
                  selectedGroup === 'all'
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                すべて ({references.length})
              </button>
              {availableGroups.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setSelectedGroup(group.id)}
                  className={`h-8 shrink-0 rounded-full border px-3 text-xs font-bold transition ${
                    selectedGroup === group.id
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {group.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 tabular-nums">
              <span>
                {filteredItems.length}件 / 全{references.length}件
              </span>
              {hasActiveFilter ? (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 text-indigo-600 hover:underline"
                >
                  <RotateCcw className="h-3 w-3" />
                  リセット
                </button>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* Reference Cards List */}
      {filteredItems.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Search className="h-6 w-6" />
          </div>
          <h2 className="mt-3 text-sm font-extrabold text-slate-800">
            一致する項目が見つかりませんでした
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            検索キーワードや要素・級フィルターを変えて再度お試しください。
          </p>
          {hasActiveFilter ? (
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white transition hover:bg-indigo-700"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              フィルターをすべてクリア
            </button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <ReferenceItemCard
              key={item.id}
              item={item}
              tracks={activeExam.tracks}
              expanded={Boolean(expandedIds[item.id])}
              onToggle={() => toggleItem(item.id)}
              onJumpToTerm={handleJumpToTerm}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ReferenceItemCardProps {
  item: ReferenceItem;
  tracks: ExamTrack[];
  expanded: boolean;
  onToggle: () => void;
  onJumpToTerm: (term: string) => void;
}

function ReferenceItemCard({
  item,
  tracks,
  expanded,
  onToggle,
  onJumpToTerm,
}: ReferenceItemCardProps) {
  const badgeColor = getTrackBadgeColor(item.trackLabel, item.group, tracks);

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-white transition ${
        expanded
          ? 'border-indigo-300 shadow-sm ring-1 ring-indigo-100'
          : 'border-slate-200/90 shadow-2xs hover:border-slate-300'
      }`}
    >
      {/* Card Header (Always Visible, Full-Area Tap Target) */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-start justify-between gap-3 p-4 text-left transition hover:bg-slate-50/50 sm:p-5"
      >
        <div className="min-w-0 flex-1 space-y-1.5">
          {/* Top row: Name + Reading */}
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <h2 className="text-base font-extrabold text-slate-900">{item.name}</h2>
            <span className="text-xs font-medium text-slate-400">{item.reading}</span>
          </div>

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-1.5">
            {item.element ? <ElementBadge element={item.element} size="xs" /> : null}

            {item.homeSide ? (
              <span
                className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-bold ${
                  item.homeSide === 'debit'
                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                    : 'border-rose-200 bg-rose-50 text-rose-700'
                }`}
              >
                定位置: {item.homeSide === 'debit' ? '借方（左）' : '貸方（右）'}
              </span>
            ) : null}

            {item.trackLabel ? (
              <TrackBadge label={item.trackLabel} color={badgeColor} size="xs" />
            ) : null}
          </div>

          {/* Short Description */}
          <p className="pt-0.5 text-xs leading-relaxed font-medium text-slate-600 sm:text-sm">
            {item.shortDesc}
          </p>
        </div>

        <span
          className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition ${
            expanded ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'
          }`}
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </span>
      </button>

      {/* Expanded Detail Section */}
      {expanded ? (
        <div className="space-y-4 border-t border-slate-100 bg-slate-50/50 p-4 sm:p-5">
          {/* Detailed Explanation */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-3.5">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-extrabold text-slate-700">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              <span>詳しい解説</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-700">{item.detail}</p>
          </div>

          {/* Formula (for non-Boki or calculation terms) */}
          {item.formula ? (
            <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/50 p-3.5">
              <div className="mb-1.5 flex items-center gap-1.5 text-xs font-extrabold text-indigo-800">
                <Calculator className="h-3.5 w-3.5 text-indigo-600" />
                <span>計算公式</span>
              </div>
              <div className="rounded-lg bg-white px-3 py-2 font-mono text-xs font-bold text-slate-900 tabular-nums border border-indigo-100 sm:text-[13px]">
                {item.formula}
              </div>
            </div>
          ) : null}

          {/* 頻出仕訳例 (Mini 2-Column Journal Table) */}
          {item.exampleDebit || item.exampleCredit ? (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200/80 bg-slate-100/70 px-3.5 py-2 text-xs font-extrabold text-slate-700">
                頻出仕訳例
              </div>
              <div className="grid grid-cols-1 divide-y divide-slate-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                <div className="p-3">
                  <div className="text-[11px] font-extrabold text-blue-700">借方（左）</div>
                  <div className="mt-1 text-sm font-bold text-slate-900 tabular-nums">
                    {item.exampleDebit || '—'}
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-[11px] font-extrabold text-rose-700">貸方（右）</div>
                  <div className="mt-1 text-sm font-bold text-slate-900 tabular-nums">
                    {item.exampleCredit || '—'}
                  </div>
                </div>
              </div>
              {item.exampleNote ? (
                <div className="border-t border-slate-100 bg-slate-50/70 px-3.5 py-2 text-xs font-medium text-slate-600">
                  ※ {item.exampleNote}
                </div>
              ) : null}
            </div>
          ) : null}

          {/* 試験のひっかけポイント */}
          {item.examTrap ? (
            <div className="rounded-xl border border-rose-200/90 bg-rose-50/80 p-3.5">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-extrabold text-rose-800">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                <span>試験のひっかけポイント</span>
              </div>
              <p className="text-xs leading-relaxed font-medium text-rose-950/90 sm:text-[13px]">
                {item.examTrap}
              </p>
            </div>
          ) : null}

          {/* 関連用語 Chips */}
          {item.relatedTerms && item.relatedTerms.length > 0 ? (
            <div>
              <div className="mb-1.5 text-[11px] font-bold text-slate-500">
                関連用語（タップでジャンプ）
              </div>
              <div className="flex flex-wrap gap-1.5">
                {item.relatedTerms.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => onJumpToTerm(term)}
                    className="inline-flex min-h-[32px] items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    <span>{term}</span>
                    <ChevronRight className="h-3 w-3 opacity-60" />
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export default function DictionaryPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <div className="h-8 w-48 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-12 animate-pulse rounded-2xl bg-slate-200" />
          <div className="space-y-3">
            <div className="h-24 animate-pulse rounded-2xl bg-slate-200" />
            <div className="h-24 animate-pulse rounded-2xl bg-slate-200" />
            <div className="h-24 animate-pulse rounded-2xl bg-slate-200" />
          </div>
        </div>
      }
    >
      <DictionaryPageContent />
    </Suspense>
  );
}
