import React from 'react';
import { BarChart3, Gauge, TrendingDown, Archive, Loader2 } from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { useApi } from '../../hooks/useApi';
import { api } from '../../api/client';
import { formatNumber, formatBytes, formatPercent } from '../../lib/format';

function ScoreGauge({ score }) {
  const s = Number(score) || 0;
  const tone = s >= 80 ? '#16a34a' : s >= 50 ? '#f59e0b' : '#e11d48';
  return (
    <div className="flex items-center gap-5">
      <div className="relative h-28 w-28 shrink-0">
        <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3.5" />
          <circle
            cx="18"
            cy="18"
            r="15.9"
            fill="none"
            stroke={tone}
            strokeWidth="3.5"
            strokeDasharray={`${s} 100`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-ink-900">{formatNumber(s)}</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-ink-800">امتیاز بهینه‌سازی OptiPress</p>
        <p className="mt-1 text-xs text-ink-500">
          بر اساس پوشش کتابخانه، کاهش حجم، فرمت‌های مدرن و قابلیت اتکا محاسبه می‌شود.
        </p>
      </div>
    </div>
  );
}

export function ReportsPage() {
  const { data, loading } = useApi(api.getReports);

  if (loading || !data) {
    return (
      <div className="flex items-center gap-2 text-ink-500">
        <Loader2 size={18} className="animate-spin" />
        بارگذاری گزارش‌ها…
      </div>
    );
  }

  const stats = data.stats || {};
  const breakdown = data.breakdown || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink-900">گزارش‌های بهینه‌سازی</h1>
        <p className="mt-1 text-sm text-ink-500">
          خلاصه عملکرد، امتیاز کلی و جزئیات صرفه‌جویی بر اساس فرمت تصویر.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="کل تصاویر" value={formatNumber(stats.total)} icon={BarChart3} tone="ink" />
        <StatCard label="فضای آزادشده" value={formatBytes(stats.saved_total)} icon={Archive} tone="green" />
        <StatCard label="میانگین کاهش" value={formatPercent(stats.average_reduction)} icon={TrendingDown} tone="amber" />
        <StatCard label="امتیاز کلی" value={formatNumber(data.score)} icon={Gauge} tone="brand" />
      </div>

      <Card>
        <CardBody>
          <ScoreGauge score={data.score} />
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-3">
          <h2 className="text-sm font-semibold text-ink-800">جزئیات بر اساس فرمت</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-ink-200 text-xs text-ink-500">
                  <th className="px-2 py-2">فرمت</th>
                  <th className="px-2 py-2">تعداد</th>
                  <th className="px-2 py-2">حجم اولیه</th>
                  <th className="px-2 py-2">بهینه‌شده</th>
                  <th className="px-2 py-2">صرفه‌جویی</th>
                  <th className="px-2 py-2">درصد</th>
                </tr>
              </thead>
              <tbody>
                {breakdown.length ? (
                  breakdown.map((b) => (
                    <tr key={b.mime} className="border-b border-ink-100">
                      <td className="px-2 py-2 font-medium text-ink-800">{b.format}</td>
                      <td className="px-2 py-2 text-ink-600">{formatNumber(b.count)}</td>
                      <td className="px-2 py-2 text-ink-600">{formatBytes(b.original_size)}</td>
                      <td className="px-2 py-2 text-ink-600">{formatBytes(b.optimized_size)}</td>
                      <td className="px-2 py-2 text-green-700">{formatBytes(b.saved_bytes)}</td>
                      <td className="px-2 py-2 text-green-700">{formatPercent(b.ratio)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-2 py-8 text-center text-ink-400">
                      هنوز داده‌ای برای گزارش وجود ندارد.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
