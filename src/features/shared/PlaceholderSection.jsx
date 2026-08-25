import React from 'react';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

// Placeholder section used by the shell until the subsystem is implemented.
export function PlaceholderSection({ title, description, icon: Icon }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink-900">{title}</h1>
        <p className="mt-1 text-sm text-ink-500">{description}</p>
      </div>
      <Card>
        <CardBody className="flex flex-col items-center gap-3 py-12 text-center">
          {Icon ? <Icon size={28} className="text-ink-300" /> : null}
          <p className="text-sm text-ink-500">
            این بخش در ادامه بر اساس معماری تعریف‌شده پیاده‌سازی می‌شود.
          </p>
          <Badge tone="neutral">در حال توسعه</Badge>
        </CardBody>
      </Card>
    </div>
  );
}
