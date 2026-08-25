import React from 'react';
import {
  Images,
  CheckCircle2,
  Clock,
  Percent,
} from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { useApi } from '../../hooks/useApi';
import { api } from '../../api/client';
import { formatNumber, formatBytes, formatPercent } from '../../lib/format';

export function StatsCards() {
  const { data, loading } = useApi(api.getStats);

  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl border border-ink-200 bg-white"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        label="کل تصاویر"
        value={formatNumber(data.total)}
        icon={Images}
        tone="ink"
      />
      <StatCard
        label="بهینه‌شده"
        value={formatNumber(data.completed)}
        icon={CheckCircle2}
        tone="green"
      />
      <StatCard
        label="در صف"
        value={formatNumber(
          (Number(data.pending) || 0) + (Number(data.processing) || 0)
        )}
        icon={Clock}
        tone="brand"
      />
    </div>
  );
}
