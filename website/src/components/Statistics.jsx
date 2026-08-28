import { Image, HardDrive, TrendingDown, Database } from 'lucide-react'

const stats = [
  { icon: Image, color: 'text-brand-400', bg: 'bg-brand-600/15', border: 'border-brand-500/20', value: '۱٬۴۲۸', label: 'تصویر بهینه‌شده' },
  { icon: HardDrive, color: 'text-green-400', bg: 'bg-green-600/15', border: 'border-green-500/20', value: '۲.۴ GB', label: 'حجم کاهش‌یافته' },
  { icon: TrendingDown, color: 'text-accent-400', bg: 'bg-accent-600/15', border: 'border-accent-500/20', value: '۶۸٪', label: 'میانگین کاهش حجم' },
  { icon: Database, color: 'text-brand-400', bg: 'bg-brand-600/15', border: 'border-brand-500/20', value: '۲.۴ GB', label: 'فضای ذخیره‌شده' },
]

export default function Statistics() {
  return (
    <section className="relative py-20 lg:py-28 bg-ink-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 reveal">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">نتیجه را با عدد ببینید.</h2>
          <p className="text-lg text-ink-400 max-w-2xl mx-auto">OptiPress میزان تأثیر بهینه‌سازی تصاویر را به‌صورت واضح در اختیار شما قرار می‌دهد.</p>
        </div>
        <div className="reveal-scale relative max-w-4xl mx-auto">
          <div className="absolute -inset-0.5 bg-gradient-to-br from-brand-600/20 via-transparent to-accent-500/10 rounded-3xl blur-lg" />
          <div className="relative bg-ink-900/80 backdrop-blur-sm border border-ink-700/50 rounded-3xl p-6 sm:p-8 lg:p-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((s, i) => (
                <div key={i} className="text-center">
                  <div className={`w-12 h-12 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center mx-auto mb-3`}>
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-white mb-1 counter">{s.value}</div>
                  <div className="text-xs text-ink-400">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-5 border-t border-ink-800/60 text-center">
              <p className="text-[11px] text-ink-500">داده‌های بالا نمونه داشبورد هستند و نتایج واقعی بسته به تصاویر و تنظیمات شما متفاوت خواهد بود.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
