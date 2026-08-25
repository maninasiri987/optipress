import React from 'react';

const TONES = {
  ok: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warn: 'bg-amber-50 text-amber-700 border-amber-200',
  error: 'bg-rose-50 text-rose-700 border-rose-200',
  info: 'bg-brand-50 text-brand-700 border-brand-200',
  neutral: 'bg-ink-100 text-ink-600 border-ink-200',
};

export function Badge({ tone = 'neutral', children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${TONES[tone] || TONES.neutral}`}
    >
      {children}
    </span>
  );
}
