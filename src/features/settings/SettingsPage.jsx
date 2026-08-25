import React, { useEffect, useState } from 'react';
import { Settings2, Loader2, CheckCircle2, Info } from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useApi } from '../../hooks/useApi';
import { api } from '../../api/client';

const DAYS = [
  { id: 'sat', label: 'شنبه' },
  { id: 'sun', label: 'یکشنبه' },
  { id: 'mon', label: 'دوشنبه' },
  { id: 'tue', label: 'سه‌شنبه' },
  { id: 'wed', label: 'چهارشنبه' },
  { id: 'thu', label: 'پنجشنبه' },
  { id: 'fri', label: 'جمعه' },
];

const EMPTY = {
  automation_mode: 'automatic',
  quality: 82,
  batch_size: 20,
  backup_enabled: true,
  convert_to: 'webp',
  schedule_start: '01:00',
  schedule_end: '05:00',
  schedule_days: ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'],
};

function Section({ title, children }) {
  return (
    <div className="space-y-4">
      <h3 className="border-b border-ink-100 pb-2 text-sm font-semibold text-ink-800">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-ink-700">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
    </div>
  );
}

export function SettingsPage() {
  const { data, loading, refresh } = useApi(api.getSettings);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (data) setForm({ ...EMPTY, ...data });
  }, [data]);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const toggleDay = (id) => {
    setForm((f) => {
      const days = f.schedule_days || [];
      return {
        ...f,
        schedule_days: days.includes(id) ? days.filter((d) => d !== id) : [...days, id],
      };
    });
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await api.updateSettings(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center gap-2 text-ink-500">
        <Loader2 size={18} className="animate-spin" />
        بارگذاری تنظیمات…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink-900">تنظیمات</h1>
        <p className="mt-1 text-sm text-ink-500">
          تنظیمات بهینه‌سازی، زمان‌بندی و بازیابت را مدیریت کنید.
        </p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 size={16} /> تنظیمات ذخیره شد.
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <Card>
        <CardBody className="space-y-6">
          <Section title="عمومی">
            <Field label="حالت بهینه‌سازی" hint="فوری: پس از آپلود جدید · خودکار: طبق زمان‌بندی · دستی: فقط با شروع دستی">
              <select
                value={form.automation_mode}
                onChange={(e) => update('automation_mode', e.target.value)}
                className="w-full rounded-xl border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              >
                <option value="automatic">خودکار</option>
                <option value="immediate">فوری</option>
                <option value="manual">دستی</option>
              </select>
            </Field>
            <Field label="فعال‌سازی پشتیبان‌گیری" hint="نسخه اصلی پیش از جایگزینی ذخیره می‌شود.">
              <label className="inline-flex items-center gap-2 text-sm text-ink-700">
                <input
                  type="checkbox"
                  checked={!!form.backup_enabled}
                  onChange={(e) => update('backup_enabled', e.target.checked)}
                  className="h-4 w-4 rounded border-ink-300 text-brand-600"
                />
                ذخیره نسخه پشتیبان از تصاویر اصلی
              </label>
            </Field>
          </Section>

          <Section title="بهینه‌سازی">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="کیفیت خروجی" hint="۱۰ تا ۱۰۰ — مقدار پیشنهادی ۸۲">
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={form.quality}
                  onChange={(e) => update('quality', Number(e.target.value))}
                  className="w-full rounded-xl border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </Field>
              <Field label="اندازه دسته (batch)" hint="تعداد تصاویر در هر اجرای WP-Cron">
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={form.batch_size}
                  onChange={(e) => update('batch_size', Number(e.target.value))}
                  className="w-full rounded-xl border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </Field>
            </div>
            <Field label="تبدیل فرمت" hint="تعیین فرمت خروجی پس از بهینه‌سازی.">
              <select
                value={form.convert_to}
                onChange={(e) => update('convert_to', e.target.value)}
                className="w-full rounded-xl border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              >
                <option value="original">بدون تغییر فرمت</option>
                <option value="webp">WebP</option>
                <option value="avif">AVIF</option>
              </select>
            </Field>
          </Section>

          <Section title="زمان‌بندی (حالت خودکار)">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="شروع زمان‌بندی">
                <input
                  type="time"
                  value={form.schedule_start}
                  onChange={(e) => update('schedule_start', e.target.value)}
                  className="w-full rounded-xl border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </Field>
              <Field label="پایان زمان‌بندی">
                <input
                  type="time"
                  value={form.schedule_end}
                  onChange={(e) => update('schedule_end', e.target.value)}
                  className="w-full rounded-xl border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </Field>
            </div>
            <Field label="روزهای اجرا">
              <div className="flex flex-wrap gap-2">
                {DAYS.map((d) => {
                  const on = (form.schedule_days || []).includes(d.id);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => toggleDay(d.id)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                        on ? 'bg-brand-600 text-white' : 'border border-ink-300 text-ink-600'
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </Field>
          </Section>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              disabled={saving}
              onClick={save}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Settings2 size={16} />}
              {saving ? 'در حال ذخیره…' : 'ذخیره تنظیمات'}
            </button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
