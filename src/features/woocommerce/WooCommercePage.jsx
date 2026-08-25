import React, { useState } from 'react';
import { Package, ScanLine, CheckCircle2, Loader2, Info } from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../api/client';
import { formatNumber } from '../../lib/format';

export function WooCommercePage() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const wcActive = typeof window !== 'undefined' && window.optipressSettings?.woocommerce;

  const rescan = async () => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      setResult(await api.scan({ scope: 'product_images' }));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink-900">پشتیبانی ووکامرس</h1>
        <p className="mt-1 text-sm text-ink-500">
          تصاویر شاخص و گالری محصولات به‌طور خودکار شناسایی و بهینه می‌شوند.
        </p>
      </div>

      <div className="flex items-center gap-2">
        {wcActive ? (
          <Badge tone="green">ووکامرس فعال است</Badge>
        ) : (
          <Badge tone="neutral">ووکامرس یافت نشد</Badge>
        )}
      </div>

      <Card>
        <CardBody className="space-y-4">
          <div className="flex items-start gap-3">
            <Info size={20} className="mt-0.5 text-brand-500" />
            <div className="text-sm text-ink-600">
              <p>
                هنگام آپلود تصویر جدید برای محصول، OptiPress آن را به صف اضافه می‌کند. در حالت
                «فوری» بهینه‌سازی بلافاصله پس از آپلود انجام می‌شود و در حالت «خودکار» طبق
                زمان‌بندی اجرا می‌گردد.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={busy || !wcActive}
              onClick={rescan}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : <ScanLine size={16} />}
              {busy ? 'در حال اسکن…' : 'اسکن تصاویر محصولات'}
            </button>
            {!wcActive && (
              <span className="text-xs text-ink-400">
                برای استفاده از این بخش، افزونه ووکامرس را فعال کنید.
              </span>
            )}
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {result && (
            <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
              <CheckCircle2 size={16} />
              {formatNumber(result.enqueued)} تصویر محصول به صف اضافه شد
              (از {formatNumber(result.scanned)} بررسی‌شده).
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="flex items-center gap-3">
            <Package size={20} className="text-ink-400" />
            <p className="text-sm text-ink-500">
              پس از بهینه‌سازی، فیلتر اختصاصی «تصاویر بهینه‌شده» در کتابخانه رسانه نمایش داده
              می‌شود تا وضعیت هر محصول به‌راحتی پیگیری گردد.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
