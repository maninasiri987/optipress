import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Cpu } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useApi } from '../../hooks/useApi';
import { api } from '../../api/client';

export function CompatibilityPanel() {
  const { data, loading, error } = useApi(api.getCompatibility);

  if (loading) {
    return (
      <Card>
        <CardBody>
          <p className="text-sm text-ink-500">در حال بررسی محیط میزبانی…</p>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardBody>
          <p className="text-sm text-rose-600">{error}</p>
        </CardBody>
      </Card>
    );
  }

  const checks = data?.checks || {};
  const order = [
    'wordpress',
    'php',
    'memory',
    'max_exec',
    'gd',
    'imagick',
    'webp',
    'avif',
    'filesystem',
    'upload_writable',
  ];

  return (
    <Card>
      <CardHeader
        title="بررسی سازگاری سیستم"
        subtitle="OptiPress پیش از شروع محیط میزبانی شما را ارزیابی می‌کند."
        icon={Cpu}
        action={
          data?.ok ? (
            <Badge tone="ok">آماده به کار</Badge>
          ) : (
            <Badge tone="error">نیاز به بررسی</Badge>
          )
        }
      />
      <CardBody>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {order.map((key) => {
            const item = checks[key];
            if (!item) return null;
            const Icon = item.ok ? CheckCircle2 : XCircle;
            const tone = item.ok ? 'ok' : 'error';
            return (
              <div
                key={key}
                className="flex flex-col gap-1 rounded-xl border border-ink-100 p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-ink-700">
                    {item.label}
                  </span>
                  <Icon
                    size={16}
                    className={item.ok ? 'text-emerald-500' : 'text-rose-500'}
                  />
                </div>
                <span className="op-numeric text-xs text-ink-500">
                  {item.value}
                </span>
                {!item.ok && item.message ? (
                  <span className="mt-1 text-[11px] leading-snug text-rose-500">
                    {item.message}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-ink-500">
          <AlertTriangle size={14} className="text-brand-500" />
          پردازنده فعال:{' '}
          <Badge tone="info">
            {data?.processor === 'imagick'
              ? 'Imagick'
              : data?.processor === 'gd'
                ? 'GD'
                : 'پشتیبانی نشده'}
          </Badge>
        </div>
      </CardBody>
    </Card>
  );
}
