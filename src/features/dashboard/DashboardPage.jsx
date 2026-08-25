import React, { useState } from 'react';
import { Zap, Loader2, CheckCircle2 } from 'lucide-react';
import { StatsCards } from './StatsCards';
import { ReductionDonut } from '../../components/charts/ReductionDonut';
import { CompatibilityPanel } from '../compatibility/CompatibilityPanel';
import { api } from '../../api/client';
import { useApi } from '../../hooks/useApi';
import { Badge } from '../../components/ui/Badge';
import { Card, CardBody } from '../../components/ui/Card';
import { formatNumber } from '../../lib/format';

const MODE_LABELS = {
  automatic: { label: 'خودکار', tone: 'info' },
  immediate: { label: 'فوری', tone: 'green' },
  manual: { label: 'دستی', tone: 'neutral' },
};

function AutomationStatus() {
  const settings = useApi(api.getSettings);
  const stats = useApi(api.getStats);
  const loading = settings.loading || stats.loading;
  const mode = settings.data?.automation_mode || 'automatic';
  const meta = MODE_LABELS[mode] || MODE_LABELS.automatic;

  let detail = 'در حال بارگذاری وضعیت…';
  if (!loading) {
    if (mode === 'manual') {
      const waiting =
        (Number(stats.data?.pending) || 0) + (Number(stats.data?.processing) || 0);
      detail =
        waiting > 0
          ? `${formatNumber(waiting)} تصویر در انتظار بهینه‌سازی است.`
          : 'تصویری در انتظار بهینه‌سازی نیست.';
    } else if (mode === 'immediate') {
      detail = 'تصاویر بلافاصله پس از بارگذاری، به‌صورت خودکار بهینه می‌شوند.';
    } else {
      const next = settings.data?.next_run ? Number(settings.data.next_run) : 0;
      if (next) {
        const when = new Date(next * 1000).toLocaleTimeString('fa-IR', {
          hour: '2-digit',
          minute: '2-digit',
        });
        detail = `بهینه‌سازی خودکار طبق زمان‌بندی در ساعت ${when} آغاز می‌شود.`;
      } else {
        detail = 'بهینه‌سازی خودکار طبق زمان‌بندی تنظیم‌شده اجرا می‌شود.';
      }
    }
  }

  return (
    <Card>
      <CardBody className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-ink-500">حالت بهینه‌سازی</p>
          <p className="mt-1 text-sm font-semibold text-ink-800">{detail}</p>
        </div>
        <Badge tone={meta.tone}>{meta.label}</Badge>
      </CardBody>
    </Card>
  );
}

export function DashboardPage() {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const startNow = async () => {
    setBusy(true);
    setError(null);
    setDone(false);
    try {
      await api.scan({ scope: 'all' });
      await api.queueStart();
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink-900">مرکز بهینه‌سازی تصاویر</h1>
          <p className="mt-1 text-sm text-ink-500">
            آمار واقعی از وضعیت بهینه‌سازی کتابخانه رسانه ووکامرس شما.
          </p>
        </div>
        <button
          type="button"
          onClick={startNow}
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
          {busy ? 'در حال آغاز…' : 'شروع بهینه‌سازی همین حالا'}
        </button>
      </div>

      {(done || error) && (
        <div
          className={`op-toast rounded-xl border px-4 py-3 text-sm ${
            error
              ? 'border-rose-200 bg-rose-50 text-rose-700'
              : 'border-green-200 bg-green-50 text-green-700'
          }`}
        >
          {error ? (
            error
          ) : (
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 size={14} /> اسکن انجام شد و پردازش آغاز گردید.
            </span>
          )}
        </div>
      )}

      <StatsCards />

      <ReductionDonut />

      <AutomationStatus />

      <CompatibilityPanel />

      <Card>
        <CardBody>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-ink-800">
                همین حالا کتابخانه را بهینه کنید
              </p>
              <p className="mt-1 text-xs text-ink-500">
                اسکن، برآورد و بهینه‌سازی گروهی در پس‌زمینه و بدون نیاز به باز بودن
                مرورگر.
              </p>
            </div>
            <button
              type="button"
              onClick={startNow}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
              {busy ? 'در حال آغاز…' : 'شروع بهینه‌سازی'}
            </button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
