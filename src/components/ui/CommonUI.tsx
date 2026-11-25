'use client';

import React from 'react';
import { Sparkles, Star } from 'lucide-react';
import { ELEMENT_META, getTrackColorStyle } from '@/lib/constants';
import type { AccountElement, ExamTrack } from '@/types/exam';

interface ProgressRingProps {
  value: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  sublabel?: string;
  className?: string;
}

export function ProgressRing({
  value,
  size = 84,
  strokeWidth = 7,
  color = '#4F46E5',
  trackColor = '#E2E8F0',
  label,
  sublabel,
  className = '',
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-tight">
        <span className="text-sm font-bold text-slate-900 tabular-nums">
          {label ?? `${clamped}%`}
        </span>
        {sublabel ? (
          <span className="text-[10px] font-medium text-slate-500 mt-0.5">
            {sublabel}
          </span>
        ) : null}
      </div>
    </div>
  );
}

interface ElementBadgeProps {
  element: AccountElement;
  size?: 'xs' | 'sm';
  showHomeSide?: boolean;
  className?: string;
}

export function ElementBadge({
  element,
  size = 'sm',
  showHomeSide = false,
  className = '',
}: ElementBadgeProps) {
  const meta = ELEMENT_META[element];
  const sizeClass =
    size === 'xs' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border font-semibold whitespace-nowrap ${meta.badgeClass} ${sizeClass} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dotClass}`} />
      <span>{meta.label}</span>
      {showHomeSide ? (
        <span className="opacity-75 font-normal">({meta.homeSide === 'debit' ? '借' : '貸'})</span>
      ) : null}
    </span>
  );
}

interface TrackBadgeProps {
  label: string;
  color?: ExamTrack['color'];
  size?: 'xs' | 'sm';
  className?: string;
}

export function TrackBadge({
  label,
  color = 'indigo',
  size = 'sm',
  className = '',
}: TrackBadgeProps) {
  const style = getTrackColorStyle(color);
  const sizeClass =
    size === 'xs' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center rounded-md border font-semibold whitespace-nowrap ${style.badgeClass} ${sizeClass} ${className}`}
    >
      {label}
    </span>
  );
}

export const GradeBadge = TrackBadge;

interface DifficultyStarsProps {
  difficulty: 1 | 2 | 3;
  showLabel?: boolean;
  className?: string;
}

const DIFFICULTY_LABELS: Record<1 | 2 | 3, string> = {
  1: '基礎',
  2: '標準',
  3: '応用',
};

export function DifficultyStars({
  difficulty,
  showLabel = false,
  className = '',
}: DifficultyStarsProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs text-slate-600 ${className}`}
      aria-label={`難易度: ${DIFFICULTY_LABELS[difficulty]}`}
    >
      <span className="inline-flex items-center gap-0.5">
        {[1, 2, 3].map((level) => (
          <Star
            key={level}
            className={`h-3.5 w-3.5 ${
              level <= difficulty
                ? 'fill-amber-400 text-amber-400'
                : 'fill-slate-100 text-slate-300'
            }`}
          />
        ))}
      </span>
      {showLabel ? (
        <span className="font-medium text-slate-500">
          {DIFFICULTY_LABELS[difficulty]}
        </span>
      ) : null}
    </span>
  );
}

interface ComingSoonBannerProps {
  examName: string;
  onSwitchToBoki?: () => void;
}

export function ComingSoonBanner({
  examName,
  onSwitchToBoki,
}: ComingSoonBannerProps) {
  return (
    <div className="rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50 via-white to-indigo-50 p-4 shadow-xs">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                {examName}（拡張プレビュー）
              </span>
              <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[11px] font-semibold text-teal-800">
                近日公開
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              本プラットフォームはプラグイン構造で設計されており、今後ほかの国家資格・検定も追加できます。現在はサンプル問題と用語辞典をプレビュー体験いただけます。
            </p>
          </div>
        </div>
        {onSwitchToBoki ? (
          <button
            type="button"
            onClick={onSwitchToBoki}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 px-4 text-xs font-semibold text-white transition hover:bg-indigo-700 active:scale-[0.98]"
          >
            日商簿記へ戻る
          </button>
        ) : null}
      </div>
    </div>
  );
}
