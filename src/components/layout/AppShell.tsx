'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  BookOpen,
  Calculator,
  Check,
  ChevronDown,
  ClipboardCheck,
  Flame,
  GraduationCap,
  Home,
  PenTool,
} from 'lucide-react';
import { useExamStore } from '@/lib/storage';
import { CalculatorModal } from '@/components/ui/CalculatorModal';

interface CalculatorContextValue {
  isOpen: boolean;
  openCalculator: () => void;
  closeCalculator: () => void;
}

const CalculatorContext = createContext<CalculatorContextValue>({
  isOpen: false,
  openCalculator: () => {},
  closeCalculator: () => {},
});

export function useCalculator() {
  return useContext(CalculatorContext);
}

interface NavItem {
  href: string;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  matchPrefix?: string;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { activeExam, allExams, setActiveExamId, effectiveStreak, isLoaded } =
    useExamStore();
  const [calcOpen, setCalcOpen] = useState(false);
  const [examMenuOpen, setExamMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const hasCalculator = activeExam.tools.includes('calculator');

  useEffect(() => {
    if (!examMenuOpen) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setExamMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [examMenuOpen]);

  const navItems: NavItem[] = [
    { href: '/', label: 'ホーム', shortLabel: 'ホーム', icon: Home },
    {
      href: '/study',
      label: 'スキマ学習',
      shortLabel: '学習',
      icon: PenTool,
      matchPrefix: '/study',
    },
    {
      href: '/mock-exam',
      label: '模擬テスト',
      shortLabel: '模試',
      icon: ClipboardCheck,
      matchPrefix: '/mock-exam',
    },
    {
      href: '/dictionary',
      label: activeExam.referenceTitle,
      shortLabel: activeExam.id === 'boki' ? '科目辞典' : '用語辞典',
      icon: BookOpen,
      matchPrefix: '/dictionary',
    },
    {
      href: '/stats',
      label: '学習成績',
      shortLabel: '成績',
      icon: BarChart3,
      matchPrefix: '/stats',
    },
  ];

  const isNavActive = (item: NavItem) => {
    if (item.href === '/') return pathname === '/';
    return pathname === item.href || (item.matchPrefix ? pathname.startsWith(item.matchPrefix) : false);
  };

  return (
    <CalculatorContext.Provider
      value={{
        isOpen: calcOpen,
        openCalculator: () => setCalcOpen(true),
        closeCalculator: () => setCalcOpen(false),
      }}
    >
      <div className="min-h-dvh flex flex-col bg-slate-50 text-slate-900">
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-3 sm:h-16 sm:px-6">
            {/* Brand + Exam Switcher */}
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <Link
                href="/"
                className="flex shrink-0 items-center gap-2 rounded-xl py-1 pr-1 transition hover:opacity-85"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                  <GraduationCap className="h-4.5 w-4.5" />
                </span>
                <span className="hidden text-sm font-extrabold tracking-tight text-slate-900 sm:inline">
                  シカクマスター
                </span>
              </Link>

              {/* Exam Switcher Pill */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setExamMenuOpen((open) => !open)}
                  aria-expanded={examMenuOpen}
                  aria-haspopup="listbox"
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-800 shadow-2xs transition hover:border-indigo-300 hover:bg-indigo-50/60"
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      activeExam.status === 'active'
                        ? 'bg-emerald-500'
                        : 'bg-teal-500'
                    }`}
                  />
                  <span className="max-w-[120px] truncate sm:max-w-[160px]">
                    {activeExam.shortName}
                  </span>
                  {activeExam.status === 'coming-soon' ? (
                    <span className="hidden rounded bg-teal-100 px-1 py-0.5 text-[10px] font-semibold text-teal-700 sm:inline">
                      Preview
                    </span>
                  ) : null}
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
                      examMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {examMenuOpen ? (
                  <div
                    role="listbox"
                    aria-label="資格コースを切り替え"
                    className="absolute left-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl sm:w-80"
                  >
                    <div className="px-2.5 py-1.5 text-[11px] font-bold tracking-wide text-slate-400">
                      資格コース切替（拡張プラットフォーム）
                    </div>
                    <div className="mt-1 space-y-1">
                      {allExams.map((exam) => {
                        const selected = exam.id === activeExam.id;
                        return (
                          <button
                            key={exam.id}
                            type="button"
                            role="option"
                            aria-selected={selected}
                            onClick={() => {
                              setActiveExamId(exam.id);
                              setExamMenuOpen(false);
                            }}
                            className={`flex w-full items-start justify-between gap-2 rounded-xl p-2.5 text-left transition ${
                              selected
                                ? 'bg-indigo-50/90 text-indigo-950 ring-1 ring-indigo-200'
                                : 'hover:bg-slate-50 text-slate-800'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-xs font-bold">
                                  {exam.name}
                                </span>
                                {exam.status === 'active' ? (
                                  <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                                    公開中
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-teal-100 px-1.5 py-0.5 text-[10px] font-bold text-teal-700">
                                    近日公開・拡張対応
                                  </span>
                                )}
                              </div>
                              <p className="mt-0.5 text-[11px] leading-snug text-slate-500">
                                {exam.tagline}
                              </p>
                            </div>
                            {selected ? (
                              <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav
              aria-label="メインナビゲーション"
              className="hidden items-center gap-1 md:flex"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isNavActive(item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition ${
                      active
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.shortLabel}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Utility Actions */}
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              {isLoaded && effectiveStreak > 0 ? (
                <Link
                  href="/stats"
                  className="inline-flex h-9 items-center gap-1 rounded-full bg-amber-50 px-2.5 text-xs font-bold text-amber-700 border border-amber-200/80 tabular-nums"
                  title="連続学習日数"
                >
                  <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  <span>{effectiveStreak}日</span>
                </Link>
              ) : null}

              {hasCalculator ? (
                <button
                  type="button"
                  onClick={() => setCalcOpen(true)}
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 active:scale-95"
                  aria-label="簿記電卓を開く"
                >
                  <Calculator className="h-4 w-4 text-indigo-600" />
                  <span>電卓</span>
                </button>
              ) : null}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-5 pb-24 sm:px-6 md:pb-12">
          {children}
        </main>

        {/* Mobile Sticky Bottom Navigation (Safe Area Aware) */}
        <nav
          aria-label="モバイルナビゲーション"
          className="fixed right-0 bottom-0 left-0 z-30 border-t border-slate-200/90 bg-white/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] md:hidden"
        >
          <div className="mx-auto grid max-w-lg grid-cols-5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isNavActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 py-1.5 transition ${
                    active
                      ? 'text-indigo-600'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span
                    className={`flex h-7 w-11 items-center justify-center rounded-full transition ${
                      active ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-[10px] font-bold leading-none">
                    {item.shortLabel}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Global Bookkeeping Calculator Modal */}
        <CalculatorModal isOpen={calcOpen} onClose={() => setCalcOpen(false)} />
      </div>
    </CalculatorContext.Provider>
  );
}
