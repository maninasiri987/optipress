import { Sparkles, Image, Zap, ShoppingBag, ArrowDown, ShoppingCart, Lock, HardDrive, TrendingDown, CheckCircle, Check } from 'lucide-react'

export default function Hero() {
  const features = [
    { icon: Image, text: 'WebP و AVIF' },
    { icon: Zap, text: 'بهینه‌سازی خودکار' },
    { icon: ShoppingBag, text: 'پشتیبانی از WooCommerce' },
  ]

  const dashboardStats = [
    { icon: Image, color: 'text-brand-400', label: 'تصاویر', value: '۱٬۴۲۸' },
    { icon: HardDrive, color: 'text-green-400', label: 'فضای ذخیره‌شده', value: '۲.۴ GB' },
    { icon: TrendingDown, color: 'text-accent-400', label: 'میانگین کاهش', value: '۶۸٪' },
    { icon: CheckCircle, color: 'text-brand-400', label: 'وضعیت', isLive: true },
  ]

  const queueItems = [
    { name: 'hero-banner.jpg', progress: 72, status: '۷۲٪', color: 'from-brand-500 to-brand-400', iconColor: 'text-brand-400', bgColor: 'bg-brand-600/20' },
    { name: 'product-photo.png', progress: 0, status: 'در انتظار', color: 'bg-ink-600', iconColor: 'text-ink-400', bgColor: 'bg-ink-700/30' },
    { name: 'slider.webp', progress: 100, status: 'تکمیل شده', color: 'bg-green-500', iconColor: 'text-green-400', bgColor: 'bg-green-600/20', done: true },
  ]

  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      <div className="absolute inset-0 gradient-radial-dark bg-grid" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="reveal inline-flex items-center gap-2 bg-brand-600/10 border border-brand-500/20 rounded-full px-4 py-1.5 mb-8">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span className="text-xs font-medium text-brand-300">افزونه حرفه‌ای وردپرس</span>
        </div>

        <h1 className="reveal text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-tight mb-6">
          تصاویر سبک‌تر، <span className="text-gradient-brand">سایت سریع‌تر.</span>
        </h1>

        <p className="reveal text-lg sm:text-xl text-ink-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          OptiPress تصاویر وردپرس شما را به‌صورت هوشمند، خودکار و مستقیم روی هاستتان بهینه می‌کند.
        </p>

        <div className="reveal flex flex-wrap justify-center gap-3 mb-10">
          {features.map((f, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 bg-ink-800/60 border border-ink-700/50 rounded-lg px-3 py-1.5 text-xs text-ink-200">
              <f.icon className="w-3.5 h-3.5 text-brand-400" />{f.text}
            </span>
          ))}
        </div>

        <div className="reveal flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <a href="https://www.zhaket.com/" target="_blank" rel="noopener" className="inline-flex items-center gap-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-xl shadow-brand-600/30 hover:shadow-brand-500/50 hover:-translate-y-0.5 text-base">
            <ShoppingCart className="w-5 h-5" />خرید OptiPress
          </a>
          <a href="#features" onClick={e => { e.preventDefault(); document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' }) }} className="inline-flex items-center gap-2 bg-ink-800/60 hover:bg-ink-800 border border-ink-700/50 text-ink-200 hover:text-white font-medium px-7 py-3.5 rounded-xl transition-all duration-200 text-base">
            مشاهده امکانات <ArrowDown className="w-4 h-4" />
          </a>
        </div>

        {/* Dashboard Mockup */}
        <div className="reveal-scale relative max-w-4xl mx-auto select-none">
          <div className="absolute -inset-1 bg-gradient-to-b from-brand-600/20 via-brand-500/5 to-transparent rounded-2xl blur-xl" />
          <div className="relative bg-ink-900/80 backdrop-blur-sm border border-ink-700/50 rounded-2xl overflow-hidden shadow-2xl shadow-brand-600/10">
            <div className="flex items-center gap-2 px-4 py-3 bg-ink-800/80 border-b border-ink-700/50">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
              </div>
              <div className="flex-1 text-center">
                <div className="inline-flex items-center gap-1.5 bg-ink-700/50 rounded-lg px-3 py-1 text-[10px] text-ink-400">
                  <Lock className="w-2.5 h-2.5" />optipress.local/wp-admin
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                {dashboardStats.map((stat, i) => (
                  <div key={i} className="bg-ink-800/60 rounded-xl p-3 border border-ink-700/30">
                    <div className="flex items-center gap-2 mb-1">
                      <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                      <span className="text-[10px] text-ink-400">{stat.label}</span>
                    </div>
                    {stat.isLive ? (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" /></span>
                        <span className="text-xs font-medium text-green-400">فعال</span>
                      </div>
                    ) : (
                      <div className="text-xl font-bold text-white counter">{stat.value}</div>
                    )}
                  </div>
                ))}
              </div>
              <div className="bg-ink-800/40 rounded-xl p-4 border border-ink-700/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-ink-300">صف بهینه‌سازی</span>
                  <span className="text-[10px] text-ink-500">در حال پردازش...</span>
                </div>
                <div className="space-y-2.5">
                  {queueItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${item.bgColor} flex items-center justify-center shrink-0`}>
                        {item.done ? <Check className="w-4 h-4 text-green-400" /> : <Image className={`w-4 h-4 ${item.iconColor}`} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] text-ink-300 truncate">{item.name}</span>
                          <span className={`text-[10px] shrink-0 ${item.done ? 'text-green-400' : item.progress === 0 ? 'text-ink-500' : 'text-brand-400'}`}>{item.status}</span>
                        </div>
                        <div className="h-1.5 bg-ink-700/50 rounded-full overflow-hidden">
                          <div className={`progress-fill h-full rounded-full ${item.done ? 'bg-green-500' : item.progress === 0 ? 'bg-ink-600' : 'bg-gradient-to-l from-brand-500 to-brand-400'}`} style={{ '--progress': `${item.progress}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
