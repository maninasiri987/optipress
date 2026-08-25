import React from 'react';
import { formatNumber } from '../../lib/format';

// Hero statistic tile used across the dashboard.
export function StatCard({ label, value, hint, icon: Icon, tone = 'brand' }) {
  const tones = {
    brand: 'bg-brand-50 text-brand-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    ink: 'bg-ink-100 text-ink-600',
  };

  return (
    <div className="op-anim rounded-2xl border border-ink-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-ink-500">{label}</span>
        {Icon ? (
          <span
            className={`stat-icon flex h-9 w-9 items-center justify-center rounded-xl ${tones[tone]}`}
          >
            <Icon size={18} />
          </span>
        ) : null}
      </div>
      <div className="op-numeric mt-3 text-3xl font-extrabold tracking-tight text-ink-900">
        {value}
      </div>
      {hint ? <p className="mt-1 text-xs text-ink-400">{hint}</p> : null}
    </div>
  );
}
