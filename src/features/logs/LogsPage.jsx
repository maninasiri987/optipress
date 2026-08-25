import React, { useState } from 'react';
import { ScrollText, Trash2, Loader2, Terminal } from 'lucide-react';
// The log terminal intentionally stays dark in both light and dark themes, so it
// uses a self-contained dark <div> rather than <Card> (which always forces bg-white).
import { useApi } from '../../hooks/useApi';
import { api } from '../../api/client';

const LEVELS = [
  { id: '', label: 'همه' },
  { id: 'success', label: 'موفق' },
  { id: 'info', label: 'اطلاعات' },
  { id: 'warning', label: 'هشدار' },
  { id: 'error', label: 'خطا' },
];

const LEVEL_META = {
  success: { label: 'موفق', color: 'text-emerald-400' },
  info: { label: 'اطلاعات', color: 'text-sky-400' },
  warning: { label: 'هشدار', color: 'text-amber-400' },
  error: { label: 'خطا', color: 'text-rose-400' },
};

function LogLine({ entry }) {
  const adminUrl =
    (typeof window !== 'undefined' && window.optipressSettings?.adminUrl) || '';
  const meta = LEVEL_META[entry.level] || { label: entry.level || '—', color: 'text-slate-400' };
  const attachmentId = entry.context?.attachment_id;
  const ctxKeys = Object.keys(entry.context || {}).filter(
    (k) => k !== 'attachment_id' && entry.context[k] !== ''
  );

  const tail = [];
  if (attachmentId) tail.push(`پیوست #${attachmentId}`);
  ctxKeys.forEach((k) => tail.push(`${k}=${entry.context[k]}`));

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5" dir="ltr">
      <span className="text-slate-500">[{entry.time}]</span>
      <span className="text-slate-600">-</span>
      <span className={`font-semibold ${meta.color}`}>[{meta.label}]</span>
      <span className="text-slate-200">{entry.message}</span>
      {tail.length > 0 && (
        <span className="text-slate-500">
          {tail.map((t, i) => (
            <span key={i} className="ms-1">
              {attachmentId && i === 0 ? (
                <a className="text-sky-300 underline-offset-2 hover:underline" href={`${adminUrl}post.php?post=${attachmentId}&action=edit`}>
                  {t}
                </a>
              ) : (
                <span>({t})</span>
              )}
            </span>
          ))}
        </span>
      )}
    </div>
  );
}

export function LogsPage() {
  const [level, setLevel] = useState('');
  const [clearing, setClearing] = useState(false);
  const [clearError, setClearError] = useState(null);
  const { loading, error, data, refresh } = useApi(
    () => api.getLogs({ level, limit: 200 }),
    [level]
  );

  const logs = data?.logs || [];
  const count = data?.count || 0;

  const handleClear = () => {
    if (clearing) return;
    setClearing(true);
    api
      .clearLogs()
      .then(() => {
        setClearError(null);
        return refresh();
      })
      .catch((e) => setClearError(e.message || 'پاک‌کردن گزارش‌ها ناموفق بود.'))
      .finally(() => setClearing(false));
  };

  return (
    <div className="op-anim space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-ink-900">لاگ فعالیت‌ها</h2>
          <p className="mt-0.5 text-xs text-ink-500">
            رویدادهای پلاگین به صورت خطی و شبیه ترمینال نمایش داده می‌شوند (بهینه‌سازی، بازیابی، اسکن و …).
          </p>
        </div>
        <button
          type="button"
          onClick={handleClear}
          disabled={clearing}
          className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-600 transition hover:bg-ink-100 disabled:opacity-60"
        >
          {clearing ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
          پاکسازی لاگ
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {LEVELS.map((lv) => {
          const isActive = level === lv.id;
          return (
            <button
              key={lv.id || 'all'}
              type="button"
              onClick={() => setLevel(lv.id)}
              className={`rounded-xl px-3 py-1.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-brand-600 text-white'
                  : 'border border-ink-200 bg-white text-ink-600 hover:bg-ink-100'
              }`}
            >
              {lv.label}
            </button>
          );
        })}
      </div>

      {clearError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
          {clearError}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-ink-800 bg-[#0b1120] shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-white/5 px-4 py-2">
          <div className="flex items-center gap-2 text-slate-300">
            <Terminal size={15} className="text-slate-500" />
            <span className="text-sm font-medium text-slate-200">ترمینال لاگ</span>
            <span className="text-xs text-slate-500">
              — {count > 0 ? `${count} خط` : 'موردی ثبت نشده است'}
            </span>
          </div>
        </div>
        <div className="op-scroll max-h-[60vh] overflow-auto px-4 py-3 font-mono text-[13px] leading-relaxed">
            {loading ? (
              <div className="flex items-center gap-2 text-slate-400">
                <Loader2 size={16} className="animate-spin" /> در حال بارگذاری…
              </div>
            ) : error ? (
              <div className="text-rose-400">{error}</div>
            ) : logs.length === 0 ? (
              <div className="text-slate-500">هنوز رویدادی ثبت نشده است.</div>
            ) : (
              <div className="space-y-1">
                {logs.map((entry, i) => (
                  <LogLine key={i} entry={entry} />
                ))}
              </div>
            )}
          </div>
      </div>
    </div>
  );
}
