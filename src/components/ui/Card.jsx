import React from 'react';

export function Card({ className = '', children }) {
  return (
    <div
      className={`rounded-2xl border border-ink-200 bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, icon: Icon, action }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-ink-100 px-5 py-4">
      <div className="flex items-center gap-3">
        {Icon ? (
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Icon size={18} />
          </span>
        ) : null}
        <div>
          <h3 className="text-sm font-semibold text-ink-800">{title}</h3>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-ink-500">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

export function CardBody({ className = '', children }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
}
