import React from 'react';
import { TrendingDown, Archive, FileDown } from 'lucide-react';
import { Card, CardBody } from '../ui/Card';
import { useApi } from '../../hooks/useApi';
import { api } from '../../api/client';
import { formatBytes, formatPercent } from '../../lib/format';

function Donut({ value, color }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#e2e8f0" strokeWidth="4" />
          <circle
            cx="18"
            cy="18"
            r="15.9155"
            fill="none"
            stroke={color}
            strokeWidth="4"
            className="op-donut-value"
            strokeDasharray={`${v} 100`}
            strokeLinecap="round"
          />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-ink-900">{formatPercent(v)}</span>
        <span className="text-[10px] text-ink-400">کاهش</span>
      </div>
    </div>
  );
}

export function ReductionDonut() {
  const { data, loading } = useApi(api.getStats);

  if (loading || !data) {
    return (
      <Card>
        <CardBody>
          <div className="h-32 animate-pulse rounded-2xl bg-ink-100" />
        </CardBody>
      </Card>
    );
  }

  const reduction = Number(data.average_reduction) || 0;
  const original = Number(data.original_total) || 0;
  const optimized = Number(data.optimized_total) || 0;
  const saved = Number(data.saved_total) || 0;

  const savedPct = original > 0 ? (saved / original) * 100 : 0;
  const optimizedPct = original > 0 ? (optimized / original) * 100 : 0;
  const color = reduction >= 50 ? '#16a34a' : reduction >= 25 ? '#f59e0b' : '#3563f6';

  return (
    <Card className="op-anim">
      <CardBody>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Donut value={reduction} color={color} />

          <div className="flex-1 space-y-4">
            <div>
              <p className="text-sm font-semibold text-ink-800">میانگین کاهش حجم</p>
              <p className="mt-1 text-xs text-ink-500">
                میانگین صرفه‌جویی حجم روی تصاویر بهینه‌شده، محاسبه‌شده از داده‌های واقعی.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-1.5 text-ink-600">
                  <Archive size={14} className="text-ink-400" /> حجم اولیه
                </span>
                <span className="op-numeric font-medium text-ink-800">{formatBytes(original)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-1.5 text-ink-600">
                  <TrendingDown size={14} className="text-ink-400" /> بهینه‌شده
                </span>
                <span className="op-numeric font-medium text-ink-800">{formatBytes(optimized)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-1.5 text-green-700">
                  <FileDown size={14} /> صرفه‌جویی
                </span>
                <span className="op-numeric font-semibold text-green-700">{formatBytes(saved)}</span>
              </div>
            </div>

            <div className="flex h-2.5 overflow-hidden rounded-full bg-ink-100">
              <div className="bg-green-500" style={{ width: `${savedPct}%` }} />
              <div className="bg-ink-300" style={{ width: `${optimizedPct}%` }} />
            </div>
            <p className="text-[11px] text-ink-400">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500 align-middle" /> صرفه‌جویی
              <span className="ms-3 inline-block h-2 w-2 rounded-full bg-ink-300 align-middle" /> حجم بهینه‌شده
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
