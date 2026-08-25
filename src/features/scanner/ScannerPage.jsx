import React, { useState } from 'react';
import { ScanLine, Loader2, CheckCircle2, Info } from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../api/client';
import { formatNumber } from '../../lib/format';

const SCOPES = [
  { id: 'all', label: 'همه تصاویر' },
  { id: 'unoptimized', label: 'فقط تصاویر بهینه‌نشده' },
  { id: 'above_size', label: 'بزرگ‌تر از حد مشخص‌شده' },
  { id: 'formats', label: 'فرمت‌های خاص' },
  { id: 'product_images', label: 'تصاویر محصولات ووکامرس' },
];

export function ScannerPage() {
  const [scope, setScope] = useState('all');
  const [minSize, setMinSize] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runScan = async () => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const payload = { scope };
      if (scope === 'above_size' && minSize) {
        payload.min_size_mb = Number(minSize);
      }
      const data = await api.scan(payload);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink-900">اسکنر کتابخانه رسانه</h1>
        <p className="mt-1 text-sm text-ink-500">
          تصاویر واجد شرایط را شناسایی و به صف بهینه‌سازی اضافه کنید. پردازش در پس‌زمینه
          و بدون نیاز به باز بودن مرورگر انجام می‌شود.
        </p>
      </div>

      <Card>
        <CardBody className="space-y-5">
          <div>
            <p className="mb-2 text-sm font-medium text-ink-700">محدوده اسکن</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {SCOPES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setScope(s.id)}
                  className={`rounded-xl border px-4 py-3 text-right text-sm transition ${
                    scope === s.id
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {scope === 'above_size' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-700">
                حداقل حجم (مگابایت)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={minSize}
                onChange={(e) => setMinSize(e.target.value)}
                placeholder="مثلاً ۱"
                className="w-40 rounded-xl border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={runScan}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : <ScanLine size={16} />}
              {busy ? 'در حال اسکن…' : 'شروع اسکن'}
            </button>
            {scope !== 'all' && (
              <span className="inline-flex items-center gap-1 text-xs text-ink-400">
                <Info size={14} />
                فقط موارد جدید به صف اضافه می‌شوند.
              </span>
            )}
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-ink-50 px-4 py-3">
                  <p className="text-xs text-ink-500">بررسی‌شده</p>
                  <p className="mt-1 text-lg font-bold text-ink-900">
                    {formatNumber(result.scanned)}
                  </p>
                </div>
                <div className="rounded-xl bg-brand-50 px-4 py-3">
                  <p className="text-xs text-brand-600">به صف اضافه شد</p>
                  <p className="mt-1 text-lg font-bold text-brand-700">
                    {formatNumber(result.enqueued)}
                  </p>
                </div>
                <div className="rounded-xl bg-ink-50 px-4 py-3" title="تصاویری که از قبل بهینه‌سازی شده‌اند یا فرمت آن‌ها پشتیبانی نمی‌شود (مانند WebP/AVIF).">
                  <p className="inline-flex items-center gap-1 text-xs text-ink-500">
                    رد شده
                    <Info size={13} className="text-ink-400" />
                  </p>
                  <p className="mt-1 text-lg font-bold text-ink-900">
                    {formatNumber(result.skipped)}
                  </p>
                </div>
              </div>
              <p className="text-xs text-ink-400">
                تصاویر «رد شده» از قبل بهینه‌سازی شده‌اند یا فرمت آن‌ها (مثل WebP/AVIF)
                نیازی به تبدیل ندارد.
              </p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
