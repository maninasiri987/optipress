import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Square,
  Zap,
  Loader2,
  ArchiveRestore,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useApi } from '../../hooks/useApi';
import { api } from '../../api/client';
import { formatNumber, formatBytes, formatPercent } from '../../lib/format';

const STATUS_META = {
  pending: { label: 'در صف', tone: 'brand' },
  processing: { label: 'در حال پردازش', tone: 'amber' },
  completed: { label: 'انجام‌شده', tone: 'green' },
  failed: { label: 'ناموفق', tone: 'rose' },
  skipped: { label: 'رد شده', tone: 'neutral' },
};

const CONTROL_META = {
  running: { label: 'در حال اجرا', tone: 'green' },
  paused: { label: 'مکث‌شده', tone: 'amber' },
  stopped: { label: 'متوقف', tone: 'neutral' },
};

function ControlBar({ control, busy, onAction }) {
  const meta = CONTROL_META[control] || CONTROL_META.stopped;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge tone={meta.tone}>{meta.label}</Badge>
      <button
        type="button"
        disabled={busy}
        onClick={() => onAction('start')}
        className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        <Play size={14} /> شروع
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => onAction('pause')}
        className="inline-flex items-center gap-1.5 rounded-lg border border-ink-300 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-100 disabled:opacity-60"
      >
        <Pause size={14} /> مکث
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => onAction('resume')}
        className="inline-flex items-center gap-1.5 rounded-lg border border-ink-300 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-100 disabled:opacity-60"
      >
        <RotateCcw size={14} /> ادامه
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => onAction('stop')}
        className="inline-flex items-center gap-1.5 rounded-lg border border-ink-300 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-100 disabled:opacity-60"
      >
        <Square size={14} /> توقف
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => onAction('retry')}
        className="inline-flex items-center gap-1.5 rounded-lg border border-ink-300 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-100 disabled:opacity-60"
      >
        <RefreshCw size={14} /> تلاش مجدد
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => onAction('process')}
        className="inline-flex items-center gap-1.5 rounded-lg bg-ink-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-ink-800 disabled:opacity-60"
      >
        {busy ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
        پردازش دسته فعلی
      </button>
    </div>
  );
}

export function QueuePage() {
  const [filter, setFilter] = useState('');
  const [busy, setBusy] = useState(false);
  const [restoring, setRestoring] = useState(null);
  const [toast, setToast] = useState(null);
  const { data, loading, refresh } = useApi(() => api.getQueue({ status: filter, limit: 50 }));

  const flash = (msg, tone = 'green') => {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAction = async (action) => {
    setBusy(true);
    try {
      let fn;
      if (action === 'start') fn = api.queueStart;
      else if (action === 'pause') fn = api.queuePause;
      else if (action === 'resume') fn = api.queueResume;
      else if (action === 'stop') fn = api.queueStop;
      else if (action === 'retry') fn = api.queueRetry;
      else fn = api.queueProcess;
      const res = await fn();
      if (res.summary && typeof res.summary.processed !== 'undefined') {
        flash(
          `دسته پردازش شد: ${formatNumber(res.summary.processed)} مورد، ` +
            `${formatNumber(res.summary.failed)} ناموفق.`
        );
      } else {
        flash('وضعیت صف به‌روزرسانی شد.');
      }
    } catch (e) {
      flash(e.message, 'rose');
    } finally {
      setBusy(false);
      refresh();
    }
  };

  const handleRestore = async (attachmentId) => {
    setRestoring(attachmentId);
    try {
      const res = await api.backupRestore(attachmentId);
      flash(res.message || (res.success ? 'بازیابی شد.' : 'عملیات ناموفق.'), res.success ? 'green' : 'rose');
    } catch (e) {
      flash(e.message, 'rose');
    } finally {
      setRestoring(null);
    }
  };

  const stats = data?.stats || {};
  const completed = Number(stats.completed) || 0;
  const total = Number(stats.total) || 0;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink-900">صف بهینه‌سازی</h1>
        <p className="mt-1 text-sm text-ink-500">
          مدیریت دسته‌ها، کنترل اجرا و بازیابی نسخه پشتیبان در صورت نیاز.
        </p>
      </div>

      {toast && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            toast.tone === 'rose'
              ? 'border-rose-200 bg-rose-50 text-rose-700'
              : 'border-green-200 bg-green-50 text-green-700'
          }`}
        >
          {toast.msg}
        </div>
      )}

      <Card>
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <ControlBar control={data?.control?.status} busy={busy} onAction={handleAction} />
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
            <div className="h-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-ink-50 px-3 py-2">
              <p className="text-xs text-ink-500">کل</p>
              <p className="text-base font-bold text-ink-900">{formatNumber(total)}</p>
            </div>
            <div className="rounded-xl bg-green-50 px-3 py-2">
              <p className="text-xs text-green-600">انجام‌شده</p>
              <p className="text-base font-bold text-green-700">{formatNumber(completed)}</p>
            </div>
            <div className="rounded-xl bg-brand-50 px-3 py-2">
              <p className="text-xs text-brand-600">آزاد شده</p>
              <p className="text-base font-bold text-brand-700">{formatBytes(stats.saved_total)}</p>
            </div>
            <div className="rounded-xl bg-ink-50 px-3 py-2">
              <p className="text-xs text-ink-500">میانگین کاهش</p>
              <p className="text-base font-bold text-ink-900">{formatPercent(stats.average_reduction)}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter('')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                filter === '' ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-100'
              }`}
            >
              همه
            </button>
            {Object.entries(STATUS_META).map(([key, m]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                  filter === key ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-100'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="h-40 animate-pulse rounded-xl bg-ink-50" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-ink-200 text-xs text-ink-500">
                    <th className="px-2 py-2">تصویر</th>
                    <th className="px-2 py-2">وضعیت</th>
                    <th className="px-2 py-2">حجم اولیه</th>
                    <th className="px-2 py-2">بهینه‌شده</th>
                    <th className="px-2 py-2">صرفه‌جویی</th>
                    <th className="px-2 py-2">تلاش</th>
                    <th className="px-2 py-2">بازیابی</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.items?.length ? (
                    data.items.map((it) => {
                      const sm = STATUS_META[it.status] || STATUS_META.pending;
                      const saved = Number(it.saved_bytes) || 0;
                      const ratio = Number(it.source_size)
                        ? Math.round((saved / Number(it.source_size)) * 100)
                        : 0;
                      return (
                        <tr key={it.id} className="border-b border-ink-100">
                          <td className="max-w-xs truncate px-2 py-2 text-ink-800" title={it.title || it.source_path}>
                            {it.title || it.source_path}
                          </td>
                          <td className="px-2 py-2">
                            <Badge tone={sm.tone}>{sm.label}</Badge>
                          </td>
                          <td className="px-2 py-2 text-ink-600">{formatBytes(it.source_size)}</td>
                          <td className="px-2 py-2 text-ink-600">
                            {Number(it.optimized_size) ? formatBytes(it.optimized_size) : '—'}
                          </td>
                          <td className="px-2 py-2 text-green-700">
                            {saved ? `${formatBytes(saved)} (${formatPercent(ratio)})` : '—'}
                          </td>
                          <td className="px-2 py-2 text-ink-500">{formatNumber(it.attempts)}</td>
                          <td className="px-2 py-2">
                            <button
                              type="button"
                              disabled={restoring === it.attachment_id}
                              onClick={() => handleRestore(it.attachment_id)}
                              className="inline-flex items-center gap-1 text-xs text-ink-500 hover:text-brand-600 disabled:opacity-50"
                              title="بازیابی نسخه اصلی"
                            >
                              {restoring === it.attachment_id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <ArchiveRestore size={14} />
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-2 py-8 text-center text-ink-400">
                        موردی در صف یافت نشد.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
