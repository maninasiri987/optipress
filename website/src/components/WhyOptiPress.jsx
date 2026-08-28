import { Check } from 'lucide-react'

const reasons = [
  'پردازش روی هاست خودتان',
  'پشتیبانی از WebP و AVIF',
  'بهینه‌سازی خودکار',
  'زمان‌بندی شبانه',
  'Queue و Bulk Processing',
  'پشتیبانی از WooCommerce',
  'Backup و Restore',
  'داشبورد آماری',
]

export default function WhyOptiPress() {
  return (
    <section className="relative py-20 lg:py-28 bg-ink-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 reveal">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">یک ابزار کامل برای مدیریت تصاویر وردپرس.</h2>
          <p className="text-lg text-ink-400 max-w-xl mx-auto">همه قابلیت‌هایی که برای بهینه‌سازی حرفه‌ای تصاویر نیاز دارید.</p>
        </div>
        <div className="reveal-stagger grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {reasons.map((r, i) => (
            <div key={i} className="flex items-center gap-3 bg-ink-900/50 border border-ink-800/50 rounded-xl px-5 py-4">
              <div className="w-6 h-6 rounded-full bg-green-600/20 flex items-center justify-center shrink-0"><Check className="w-3.5 h-3.5 text-green-400" /></div>
              <span className="text-sm text-ink-200">{r}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
