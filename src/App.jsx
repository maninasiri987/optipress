import React, { useEffect, useState } from 'react';
import { LayoutDashboard, ScanLine, ListChecks, BarChart3, Package, Settings2 } from 'lucide-react';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { ScannerPage } from './features/scanner/ScannerPage';
import { QueuePage } from './features/queue/QueuePage';
import { ReportsPage } from './features/reports/ReportsPage';
import { WooCommercePage } from './features/woocommerce/WooCommercePage';
import { SettingsPage } from './features/settings/SettingsPage';
import { api } from './api/client';

const NAV = [
  { id: 'dashboard', label: 'داشبورد', icon: LayoutDashboard },
  { id: 'scanner', label: 'اسکنر', icon: ScanLine },
  { id: 'queue', label: 'صف بهینه‌سازی', icon: ListChecks },
  { id: 'reports', label: 'گزارش‌ها', icon: BarChart3 },
  { id: 'woocommerce', label: 'ووکامرس', icon: Package },
  { id: 'settings', label: 'تنظیمات', icon: Settings2 },
];

function applyTheme(theme) {
  const root = document.getElementById('optipress-root');
  if (root) {
    root.classList.toggle('dark', theme === 'dark');
  }
}

export default function App() {
  const [active, setActive] = useState('dashboard');

  useEffect(() => {
    let activeReq = true;
    api.getSettings()
      .then((s) => { if (activeReq && s?.theme) applyTheme(s.theme); })
      .catch(() => {});

    const onTheme = (e) => applyTheme(e.detail || 'light');
    window.addEventListener('optipress:theme', onTheme);
    return () => {
      activeReq = false;
      window.removeEventListener('optipress:theme', onTheme);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-ink-50">
      {/* Fixed right sidebar (RTL). */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-l border-ink-200 bg-white md:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          {iconUrl ? (
            <img src={iconUrl} alt="OptiPress" className="h-9 w-9 rounded-xl" />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <LayoutDashboard size={18} />
            </span>
          )}
          <span className="text-lg font-bold text-ink-900">OptiPress</span>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-ink-600 hover:bg-ink-100'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="px-5 py-4 text-xs text-ink-400">
          نسخه ۱٫۰٫۰ — پردازش محلی
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto op-scroll">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          {active === 'dashboard' && <DashboardPage />}
          {active === 'scanner' && <ScannerPage />}
          {active === 'queue' && <QueuePage />}
          {active === 'reports' && <ReportsPage />}
          {active === 'woocommerce' && <WooCommercePage />}
          {active === 'settings' && <SettingsPage />}
        </div>
      </main>
    </div>
  );
}
