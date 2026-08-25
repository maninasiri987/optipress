import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  Square,
  Loader2,
  ArchiveRestore,
} from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../api/client';
import { formatNumber, formatBytes, formatPercent } from '../../lib/format';

const STATUS_META = {
  pending: { label: 'در صف', tone: 'brand' },
  processing: { label: 'در حال پردازش', tone: 'amber' },
  completed: { label: 'انجام‌شده', tone: 'green' },
  failed: { label: 'ناموفق', tone: 'rose' },
  skipped: { label: 'رد شده', tone: 'neutral' },
};

// Small batches per tick so the table/progress visibly advance item by item.
const LIVE_BATCH = 2;

function ControlBar({ control, busy, onAction }) {
  const running = control === 'running';
  const paused = control === 'paused';

  const primaryLabel = running ? 'مکث' : paused ? 'ادامه' : 'شروع';
  const primaryIcon = running ? <Pause size={16} /> : <Play size={16} />;
  const primaryAction = running ? 'pause' : paused ? 'resume' : 'start';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={() => onAction(primaryAction)}
        className={`inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-md disabled:opacity-60 ${
          running
            ? 'bg-amber-500 hover:bg-amber-600'
            : 'bg-brand-600 hover:bg-brand-700'
        }`}
      >
        {busy ? <Loader2 size={16} className="animate-spin" /> : primaryIcon}
        {primaryLabel}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => onAction('stop')}
        className="inline-flex items-center gap-1.5 rounded-xl border border-ink-300 px-4 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100 disabled:opacity-60"
      >
        <Square size={16} /> توقف
      </button>
    </div>
  );
}

export function QueuePage() {
  const [filter, setFilter] = useState('');
  const [busy, setBusy] = useState(false);
  const [restoring, setRestoring] = useState(null);
  const [toast, setToast] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const dataRef = useRef(null);
  const drivingRef = useRef(false);

  const load = useCallback(async () => {
    try {
      const d = await api.getQueue({ status: filter, limit: 50 });
      setData(d);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { dataRef.current = data; }, [data]);

  const flash = (msg, tone = 'green') => {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAction = async (action) => {
    setBusy(true);
    try {
      let res;
      if (action === 'start') {
        // Nothing queued yet? Scan first so Start has work to do.
        const total = Number(data?.stats?.total) || 0;
        const pending = Number(data?.stats?.pending) || 0;
        if (total === 0 || pending === 0) {
          await api.scan({ scope: 'all' });
        }
        res = await api.queueStart(LIVE_BATCH);
      } else if (action === 'pause') {
        res = await api.queuePause();
      } else if (action === 'resume') {
        res = await api.queueResume();
      } else if (action === 'stop') {
        res = await api.queueStop();
      } else if (action === 'retry') {
        res = await api.queueRetry();
      } else {
        res = await api.queueProcess();
      }
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
      load();
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

  // While the queue is "running": a fast poller keeps the UI mirrored to the
  // server's true state (whatever drives the progress), and a resilient
  // driver keeps claiming small batches until the queue empties.
  const running = data?.control?.status === 'running';

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      load().catch(() => {});
    }, 1200);
    return () => clearInterval(t);
  }, [running, load]);

  useEffect(() => {
    if (!data || !running || drivingRef.current) return;
    drivingRef.current = true;
    let ticks = 0;
    const loop = async () => {
      ticks += 1;
      const cur = dataRef.current;
      const st = cur?.control?.status;
      const pending = Number(cur?.stats?.pending) || 0;
      const processing = Number(cur?.stats?.processing) || 0;
      if (st !== 'running' || pending + processing === 0 || ticks > 500) {
        drivingRef.current = false;
        load().catch(() => {});
        return;
      }
      try {
        await api.queueProcess(LIVE_BATCH);
      } catch (e) {
        // Transient failure (network hiccup, slow request): retry next tick
        // instead of killing the loop.
      }
      setTimeout(loop, 400);
    };
    loop();
    return () => {
      drivingRef.current = false;
    };
  }, [running, filter, load]);

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
          className={`op-toast rounded-xl border px-4 py-3 text-sm ${
            toast.tone === 'rose'
              ? 'border-rose-200 bg-rose-50 text-rose-700'
              : 'border-green-200 bg-green-50 text-green-700'
          }`}
        >
          {toast.msg}
        </div>
      )}

      <Card className="op-anim">
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <ControlBar control={data?.control?.status} busy={busy} onAction={handleAction} />
            {running && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600">
                <Loader2 size={14} className="animate-spin" />
                بهینه‌سازی زنده… {formatNumber(completed)} از {formatNumber(total)}
              </span>
            )}
          </div>
          <div className="op-progress h-2 w-full overflow-hidden rounded-full bg-ink-100">
            <div className="h-full bg-brand-500" style={{ width: `${progress}%` }} />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-ink-50 px-3 py-2">
              <p className="text-xs text-ink-500">کل</p>
              <p className="op-numeric text-xl font-extrabold text-ink-900">{formatNumber(total)}</p>
            </div>
            <div className="rounded-xl bg-green-50 px-3 py-2">
              <p className="text-xs text-green-600">انجام‌شده</p>
              <p className="op-numeric text-xl font-extrabold text-green-700">{formatNumber(completed)}</p>
            </div>
            <div className="rounded-xl bg-brand-50 px-3 py-2">
              <p className="text-xs text-brand-600">آزاد شده</p>
              <p className="op-numeric text-xl font-extrabold text-brand-700">{formatBytes(stats.saved_total)}</p>
            </div>
            <div className="rounded-xl bg-ink-50 px-3 py-2">
              <p className="text-xs text-ink-500">میانگین کاهش</p>
              <p className="op-numeric text-xl font-extrabold text-ink-900">{formatPercent(stats.average_reduction)}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="op-anim">
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
