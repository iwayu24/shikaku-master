'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Check, Copy, Delete, History, Trash2, X } from 'lucide-react';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Operator = '+' | '-' | '×' | '÷';

interface HistoryEntry {
  id: string;
  expression: string;
  result: string;
  numericValue: number;
}

function formatDisplayValue(raw: string): string {
  if (raw === 'Error' || raw === 'NaN' || raw === 'Infinity') return 'Error';
  const isNeg = raw.startsWith('-');
  const unsigned = isNeg ? raw.slice(1) : raw;
  const [intPart, decPart] = unsigned.split('.');
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const sign = isNeg ? '-' : '';
  if (decPart !== undefined) {
    return `${sign}${formattedInt}.${decPart}`;
  }
  return `${sign}${formattedInt}`;
}

function cleanFloat(num: number): string {
  if (!Number.isFinite(num)) return 'Error';
  const rounded = Math.round((num + Number.EPSILON) * 1e10) / 1e10;
  if (Math.abs(rounded) >= 1e13) {
    return rounded.toExponential(4);
  }
  return String(rounded);
}

function compute(left: number, right: number, op: Operator): number {
  switch (op) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '×':
      return left * right;
    case '÷':
      return right === 0 ? NaN : left / right;
  }
}

export function CalculatorModal({ isOpen, onClose }: CalculatorModalProps) {
  const [display, setDisplay] = useState<string>('0');
  const [accumulator, setAccumulator] = useState<number | null>(null);
  const [pendingOp, setPendingOp] = useState<Operator | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);
  const [memory, setMemory] = useState<number>(0);
  const [hasMemory, setHasMemory] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const currentNumber = Number(display);

  const inputDigit = useCallback(
    (digits: string) => {
      if (display === 'Error') {
        setDisplay(digits === '00' ? '0' : digits);
        setWaitingForOperand(false);
        return;
      }
      if (waitingForOperand) {
        setDisplay(digits === '00' ? '0' : digits);
        setWaitingForOperand(false);
        return;
      }
      if (display.replace(/[-.]/g, '').length >= 12) return;
      if (display === '0') {
        setDisplay(digits === '00' ? '0' : digits);
      } else if (display === '-0') {
        setDisplay(digits === '00' ? '-0' : `-${digits}`);
      } else {
        setDisplay(display + digits);
      }
    },
    [display, waitingForOperand]
  );

  const inputDecimal = useCallback(() => {
    if (display === 'Error' || waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(`${display}.`);
    }
  }, [display, waitingForOperand]);

  const handleClearEntry = useCallback(() => {
    setDisplay('0');
    setWaitingForOperand(false);
  }, []);

  const handleAllClear = useCallback(() => {
    setDisplay('0');
    setAccumulator(null);
    setPendingOp(null);
    setWaitingForOperand(false);
  }, []);

  const handleBackspace = useCallback(() => {
    if (display === 'Error' || waitingForOperand) {
      setDisplay('0');
      setWaitingForOperand(false);
      return;
    }
    if (display.length <= 1 || (display.length === 2 && display.startsWith('-'))) {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1));
    }
  }, [display, waitingForOperand]);

  const handleOperator = useCallback(
    (nextOp: Operator) => {
      if (display === 'Error') return;
      const inputValue = Number(display);

      if (accumulator === null) {
        setAccumulator(inputValue);
      } else if (pendingOp && !waitingForOperand) {
        const result = compute(accumulator, inputValue, pendingOp);
        const resultStr = cleanFloat(result);
        if (resultStr === 'Error') {
          setDisplay('Error');
          setAccumulator(null);
          setPendingOp(null);
          setWaitingForOperand(true);
          return;
        }
        setHistory((prev) => [
          {
            id: `${Date.now()}-${Math.random()}`,
            expression: `${formatDisplayValue(cleanFloat(accumulator))} ${pendingOp} ${formatDisplayValue(display)}`,
            result: formatDisplayValue(resultStr),
            numericValue: Number(resultStr),
          },
          ...prev.slice(0, 19),
        ]);
        setDisplay(resultStr);
        setAccumulator(Number(resultStr));
      }

      setPendingOp(nextOp);
      setWaitingForOperand(true);
    },
    [accumulator, display, pendingOp, waitingForOperand]
  );

  const handleEquals = useCallback(() => {
    if (display === 'Error' || accumulator === null || !pendingOp) return;
    const inputValue = Number(display);
    const result = compute(accumulator, inputValue, pendingOp);
    const resultStr = cleanFloat(result);

    if (resultStr === 'Error') {
      setDisplay('Error');
      setAccumulator(null);
      setPendingOp(null);
      setWaitingForOperand(true);
      return;
    }

    setHistory((prev) => [
      {
        id: `${Date.now()}-${Math.random()}`,
        expression: `${formatDisplayValue(cleanFloat(accumulator))} ${pendingOp} ${formatDisplayValue(display)}`,
        result: formatDisplayValue(resultStr),
        numericValue: Number(resultStr),
      },
      ...prev.slice(0, 19),
    ]);

    setDisplay(resultStr);
    setAccumulator(null);
    setPendingOp(null);
    setWaitingForOperand(true);
  }, [accumulator, display, pendingOp]);

  const handlePercent = useCallback(() => {
    if (display === 'Error') return;
    const inputValue = Number(display);
    if (accumulator !== null && (pendingOp === '+' || pendingOp === '-')) {
      const pct = (accumulator * inputValue) / 100;
      setDisplay(cleanFloat(pct));
    } else {
      setDisplay(cleanFloat(inputValue / 100));
    }
    setWaitingForOperand(true);
  }, [accumulator, display, pendingOp]);

  const handleMemoryAdd = useCallback(() => {
    if (!Number.isFinite(currentNumber)) return;
    const next = memory + currentNumber;
    setMemory(next);
    setHasMemory(true);
    setWaitingForOperand(true);
  }, [currentNumber, memory]);

  const handleMemorySub = useCallback(() => {
    if (!Number.isFinite(currentNumber)) return;
    const next = memory - currentNumber;
    setMemory(next);
    setHasMemory(true);
    setWaitingForOperand(true);
  }, [currentNumber, memory]);

  const handleMemoryRecall = useCallback(() => {
    setDisplay(cleanFloat(memory));
    setWaitingForOperand(true);
  }, [memory]);

  const handleMemoryClear = useCallback(() => {
    setMemory(0);
    setHasMemory(false);
  }, []);

  const handleCopy = useCallback(async () => {
    if (display === 'Error') return;
    try {
      await navigator.clipboard.writeText(display);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // Clipboard API unavailable
    }
  }, [display]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        inputDigit(e.key);
      } else if (e.key === '.') {
        e.preventDefault();
        inputDecimal();
      } else if (e.key === '+') {
        e.preventDefault();
        handleOperator('+');
      } else if (e.key === '-') {
        e.preventDefault();
        handleOperator('-');
      } else if (e.key === '*') {
        e.preventDefault();
        handleOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === '%') {
        e.preventDefault();
        handlePercent();
      } else if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleClearEntry();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    isOpen,
    onClose,
    inputDigit,
    inputDecimal,
    handleOperator,
    handleEquals,
    handleBackspace,
    handlePercent,
    handleClearEntry,
  ]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/45 backdrop-blur-[2px] sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="簿記電卓"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900">簿記電卓</span>
            {hasMemory ? (
              <span className="rounded-md bg-indigo-100 px-1.5 py-0.5 text-[11px] font-bold text-indigo-700 tabular-nums">
                M {formatDisplayValue(cleanFloat(memory))}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowHistory((v) => !v)}
              className={`inline-flex h-9 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold transition ${
                showHistory
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-500 hover:bg-slate-200/70'
              }`}
              title="計算履歴の表示切替"
            >
              <History className="h-3.5 w-3.5" />
              履歴
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-800"
              title="数値をコピー"
              aria-label="数値をコピー"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-800"
              aria-label="電卓を閉じる"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* History Tape */}
        {showHistory ? (
          <div className="max-h-24 overflow-y-auto border-b border-slate-100 bg-slate-50/70 px-4 py-2">
            {history.length === 0 ? (
              <p className="text-right text-[11px] text-slate-400">
                計算履歴がここに表示されます（タップで再利用）
              </p>
            ) : (
              <div className="space-y-1">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setHistory([])}
                    className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="h-3 w-3" />
                    履歴クリア
                  </button>
                </div>
                {history.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setDisplay(cleanFloat(item.numericValue));
                      setWaitingForOperand(false);
                    }}
                    className="flex w-full items-baseline justify-between gap-2 rounded-md px-1.5 py-0.5 text-right text-xs transition hover:bg-indigo-50"
                  >
                    <span className="truncate text-slate-500 tabular-nums">
                      {item.expression} =
                    </span>
                    <span className="shrink-0 font-bold text-slate-800 tabular-nums">
                      {item.result}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {/* LCD Display */}
        <div className="bg-slate-900 px-5 py-4 text-right text-white">
          <div className="min-h-[18px] text-xs font-medium text-slate-400 tabular-nums">
            {accumulator !== null && pendingOp
              ? `${formatDisplayValue(cleanFloat(accumulator))} ${pendingOp}`
              : '\u00A0'}
          </div>
          <div className="mt-1 overflow-x-auto text-3xl font-bold tracking-tight tabular-nums">
            {formatDisplayValue(display)}
          </div>
        </div>

        {/* Memory Row */}
        <div className="grid grid-cols-4 gap-1.5 bg-slate-100 px-3 pt-3 pb-1.5">
          {[
            { label: 'MC', onClick: handleMemoryClear, active: false },
            { label: 'MR', onClick: handleMemoryRecall, active: hasMemory },
            { label: 'M-', onClick: handleMemorySub, active: false },
            { label: 'M+', onClick: handleMemoryAdd, active: false },
          ].map((btn) => (
            <button
              key={btn.label}
              type="button"
              onClick={btn.onClick}
              className={`h-10 rounded-xl text-xs font-bold transition active:scale-95 ${
                btn.active
                  ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                  : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Main Keypad */}
        <div className="grid grid-cols-4 gap-2 bg-slate-100 px-3 pt-1.5 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {/* Row 1 */}
          <button
            type="button"
            onClick={handleAllClear}
            className="h-12 rounded-xl bg-rose-50 text-sm font-bold text-rose-700 border border-rose-200 transition hover:bg-rose-100 active:scale-95"
          >
            AC
          </button>
          <button
            type="button"
            onClick={handleClearEntry}
            className="h-12 rounded-xl bg-amber-50 text-sm font-bold text-amber-800 border border-amber-200 transition hover:bg-amber-100 active:scale-95"
          >
            C
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="flex h-12 items-center justify-center rounded-xl bg-slate-200 text-slate-700 transition hover:bg-slate-300/80 active:scale-95"
            aria-label="1文字削除"
          >
            <Delete className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => handleOperator('÷')}
            className={`h-12 rounded-xl text-lg font-bold transition active:scale-95 ${
              pendingOp === '÷' && waitingForOperand
                ? 'bg-indigo-700 text-white'
                : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
            }`}
          >
            ÷
          </button>

          {/* Row 2 */}
          {['7', '8', '9'].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => inputDigit(d)}
              className="h-12 rounded-xl bg-white text-lg font-bold text-slate-900 shadow-2xs border border-slate-200/80 tabular-nums transition hover:bg-slate-50 active:scale-95"
            >
              {d}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleOperator('×')}
            className={`h-12 rounded-xl text-lg font-bold transition active:scale-95 ${
              pendingOp === '×' && waitingForOperand
                ? 'bg-indigo-700 text-white'
                : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
            }`}
          >
            ×
          </button>

          {/* Row 3 */}
          {['4', '5', '6'].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => inputDigit(d)}
              className="h-12 rounded-xl bg-white text-lg font-bold text-slate-900 shadow-2xs border border-slate-200/80 tabular-nums transition hover:bg-slate-50 active:scale-95"
            >
              {d}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleOperator('-')}
            className={`h-12 rounded-xl text-lg font-bold transition active:scale-95 ${
              pendingOp === '-' && waitingForOperand
                ? 'bg-indigo-700 text-white'
                : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
            }`}
          >
            −
          </button>

          {/* Row 4 */}
          {['1', '2', '3'].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => inputDigit(d)}
              className="h-12 rounded-xl bg-white text-lg font-bold text-slate-900 shadow-2xs border border-slate-200/80 tabular-nums transition hover:bg-slate-50 active:scale-95"
            >
              {d}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleOperator('+')}
            className={`h-12 rounded-xl text-lg font-bold transition active:scale-95 ${
              pendingOp === '+' && waitingForOperand
                ? 'bg-indigo-700 text-white'
                : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
            }`}
          >
            +
          </button>

          {/* Row 5 */}
          <button
            type="button"
            onClick={() => inputDigit('0')}
            className="h-12 rounded-xl bg-white text-lg font-bold text-slate-900 shadow-2xs border border-slate-200/80 tabular-nums transition hover:bg-slate-50 active:scale-95"
          >
            0
          </button>
          <button
            type="button"
            onClick={() => inputDigit('00')}
            className="h-12 rounded-xl bg-white text-base font-bold text-slate-900 shadow-2xs border border-slate-200/80 tabular-nums transition hover:bg-slate-50 active:scale-95"
          >
            00
          </button>
          <button
            type="button"
            onClick={inputDecimal}
            className="h-12 rounded-xl bg-white text-lg font-bold text-slate-900 shadow-2xs border border-slate-200/80 transition hover:bg-slate-50 active:scale-95"
          >
            .
          </button>
          <button
            type="button"
            onClick={handlePercent}
            className="h-12 rounded-xl bg-slate-200 text-base font-bold text-slate-800 transition hover:bg-slate-300/80 active:scale-95"
          >
            %
          </button>

          {/* Full-width Equals */}
          <button
            type="button"
            onClick={handleEquals}
            className="col-span-4 h-12 rounded-xl bg-indigo-600 text-lg font-bold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.99]"
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
}
