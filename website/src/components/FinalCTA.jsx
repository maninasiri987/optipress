import { ShoppingCart } from 'lucide-react'

export default function FinalCTA() {
  return (
    <section className="relative py-20 lg:py-28 bg-ink-950 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/8 rounded-full blur-[120px] pointer-events-none" />
      </div>
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="reveal">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 leading-snug">
            وقت آن است تصاویر سایتتان <span className="text-gradient-brand">سبک‌تر</span> شوند.
          </h2>
          <p className="text-lg text-ink-400 mb-10 max-w-xl mx-auto">OptiPress مدیریت و بهینه‌سازی تصاویر وردپرس را به یک فرآیند ساده و خودکار تبدیل می‌کند.</p>
        </div>
        <div className="reveal-scale relative inline-block">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-600/30 via-brand-500/20 to-accent-500/30 rounded-2xl blur-lg" />
          <div className="relative bg-ink-900/80 backdrop-blur-sm border border-brand-500/20 rounded-2xl p-8 sm:p-10">
            <div className="mb-2">
              <span className="text-xs font-semibold text-brand-300 bg-brand-600/15 border border-brand-500/20 rounded-full px-3 py-1">قیمت ویژه انتشار اولیه</span>
            </div>
            <div className="mb-4">
              <span className="text-lg text-ink-500 line-through">۷۹۰٬۰۰۰ تومان</span>
            </div>
            <div className="mb-6">
              <span className="text-4xl sm:text-5xl font-extrabold text-white">۵۹۰٬۰۰۰</span>
              <span className="text-lg text-ink-300 mr-1">تومان</span>
            </div>
            <a href="https://www.zhaket.com/" target="_blank" rel="noopener" className="inline-flex items-center gap-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-10 py-4 rounded-xl transition-all duration-200 shadow-xl shadow-brand-600/30 hover:shadow-brand-500/50 hover:-translate-y-0.5 text-base w-full sm:w-auto justify-center">
              <ShoppingCart className="w-5 h-5" />خرید OptiPress
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
