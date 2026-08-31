export default function Footer() {
  const scrollTo = (e, href) => {
    e.preventDefault()
    const el = document.querySelector(href)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <footer className="bg-ink-900/60 border-t border-ink-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <a href="#" className="flex items-center gap-2.5 mb-4">
              <img src="/optipress/logo.webp" alt="OptiPress" className="h-8 w-8 brightness-0 invert" width="32" height="32" />
              <span className="text-lg font-bold text-white">OptiPress</span>
            </a>
            <p className="text-sm text-ink-400 leading-relaxed">افزونه حرفه‌ای بهینه‌سازی تصاویر وردپرس.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">لینک‌ها</h4>
            <ul className="space-y-2.5">
              <li><a href="#features" onClick={e => scrollTo(e, '#features')} className="text-sm text-ink-400 hover:text-white transition-colors">امکانات</a></li>
              <li><a href="#how-it-works" onClick={e => scrollTo(e, '#how-it-works')} className="text-sm text-ink-400 hover:text-white transition-colors">نحوه کار</a></li>
              <li><a href="#faq" onClick={e => scrollTo(e, '#faq')} className="text-sm text-ink-400 hover:text-white transition-colors">سوالات متداول</a></li>
              <li><a href="/optipress/Help.html" className="text-sm text-ink-400 hover:text-white transition-colors">مستندات</a></li>
              <li><a href="https://www.zhaket.com/" target="_blank" rel="noopener" className="text-sm text-ink-400 hover:text-white transition-colors">خرید از ژاکت</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">محصول</h4>
            <ul className="space-y-2.5">
              <li><a href="https://www.zhaket.com/" target="_blank" rel="noopener" className="text-sm text-ink-400 hover:text-white transition-colors">خرید OptiPress</a></li>
              <li><a href="#features" onClick={e => scrollTo(e, '#features')} className="text-sm text-ink-400 hover:text-white transition-colors">ویژگی‌ها</a></li>
              <li><a href="#woocommerce" onClick={e => scrollTo(e, '#woocommerce')} className="text-sm text-ink-400 hover:text-white transition-colors">WooCommerce</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-ink-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ink-500">&copy; ۲۰۲۶ OptiPress. تمامی حقوق محفوظ است.</p>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" /></span>
            <span className="text-xs text-ink-500">نسخه ۱٫۰</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
