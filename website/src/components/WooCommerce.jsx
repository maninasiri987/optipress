import { ShoppingBag, Package, Image, Images, Grid3x3, CheckCircle2, ChevronLeft } from 'lucide-react'

const productImages = [
  { icon: Image, label: 'تصویر اصلی', savings: '۴۵۰ KB → ۱۲۰ KB' },
  { icon: Images, label: 'گالری', savings: '۴ تصویر' },
  { icon: Grid3x3, label: 'Thumbnail', savings: '۸۰ KB → ۲۵ KB' },
]

export default function WooCommerce() {
  return (
    <section id="woocommerce" className="relative py-20 lg:py-28 bg-ink-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="reveal order-2 lg:order-1">
            <div className="bg-ink-900/70 border border-ink-800/50 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-lg bg-purple-600/20 flex items-center justify-center"><ShoppingBag className="w-3.5 h-3.5 text-purple-400" /></div>
                <span className="text-xs font-semibold text-ink-300">بهینه‌سازی تصاویر محصولات</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-ink-800/50 rounded-xl p-3 border border-ink-700/30">
                  <div className="w-12 h-12 rounded-lg bg-brand-600/20 flex items-center justify-center shrink-0"><Package className="w-5 h-5 text-brand-400" /></div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-white block truncate">محصول</span>
                    <span className="text-[10px] text-ink-400">تصویر اصلی + گالری + Thumbnail</span>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-ink-500 shrink-0" />
                </div>
                <div className="flex justify-center"><div className="w-px h-4 bg-brand-600/30" /></div>
                <div className="grid grid-cols-3 gap-2">
                  {productImages.map((img, i) => (
                    <div key={i} className="bg-ink-800/50 rounded-lg p-2 border border-ink-700/30 text-center">
                      <img.icon className="w-5 h-5 text-ink-400 mx-auto mb-1" />
                      <span className="text-[9px] text-ink-400 block">{img.label}</span>
                      <span className="text-[8px] text-brand-400 block mt-0.5">{img.savings}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center"><div className="w-px h-4 bg-brand-600/30" /></div>
                <div className="bg-green-600/10 rounded-xl p-3 border border-green-500/20 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-600/15 flex items-center justify-center shrink-0"><CheckCircle2 className="w-5 h-5 text-green-400" /></div>
                  <div>
                    <span className="text-xs font-semibold text-green-300 block">بهینه‌سازی کامل شد</span>
                    <span className="text-[10px] text-green-400/70">صرفه‌جویی ۷۲٪ در حجم تصاویر محصول</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="reveal order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 bg-purple-600/10 border border-purple-500/20 rounded-full px-3 py-1 mb-5">
              <ShoppingBag className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs font-medium text-purple-300">پشتیبانی از WooCommerce</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">برای فروشگاه‌های WooCommerce هم آماده است.</h2>
            <p className="text-lg text-ink-400 leading-relaxed">تصاویر محصولات بخش بزرگی از حجم یک فروشگاه اینترنتی را تشکیل می‌دهند. OptiPress مدیریت و بهینه‌سازی تصاویر فروشگاه را ساده‌تر می‌کند.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
