import React, { useState } from 'react';
import { Zap, Loader2, CheckCircle2 } from 'lucide-react';
import { StatsCards } from './StatsCards';
import { CompatibilityPanel } from '../compatibility/CompatibilityPanel';
import { api } from '../../api/client';
import { useApi } from '../../hooks/useApi';
import { Badge } from '../../components/ui/Badge';
import { Card, CardBody } from '../../components/ui/Card';

const MODE_LABELS = {
  automatic: { label: 'خودکار', tone: 'info' },
  immediate: { label: 'فوری', tone: 'green' },
  manual: { label: 'دستی', tone: 'neutral' },
};

function AutomationStatus() {
  const { data } = useApi(api.getSettings);
  const mode = data?.automation_mode || 'automatic';
  const meta = MODE_LABELS[mode] || MODE_LABELS.automatic;

  return (
    <Card>
      <CardBody className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-ink-500">حالت بهینه‌سازی</p>
          <p className="mt-1 text-sm font-semibold text-ink-800">
            تصاویر جدید به‌صورت خودکار شناسایی می‌شوند و در زمان‌بندی تعیین‌شده بهینه
            خواهند شد.
          </p>
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
      <div>
        <h1 className="text-xl font-bold text-ink-900">مرکز بهینه‌سازی تصاویر</h1>
        <p className="mt-1 text-sm text-ink-500">
          آمار واقعی از وضعیت بهینه‌سازی کتابخانه رسانه ووکامرس شما.
        </p>
      </div>

      <StatsCards />

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
              {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
              {done && (
                <p className="mt-2 inline-flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle2 size={14} /> اسکن انجام شد و پردازش آغاز گردید.
                </p>
              )}
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
