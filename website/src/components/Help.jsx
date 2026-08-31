import { BookOpen, Package, Settings, Sparkles, ListOrdered, Image, Moon, ShoppingCart, ShieldCheck, BarChart3, Server, HelpCircle, MessageCircle } from 'lucide-react'

const tocItems = [
  { href: '#install', num: '۱', label: 'پیش‌نیازها و نصب' },
  { href: '#setup', num: '۲', label: 'تنظیمات اولیه' },
  { href: '#optimize', num: '۳', label: 'بهینه‌سازی تصاویر' },
  { href: '#queue', num: '۴', label: 'صف پردازش و پردازش دسته‌ای' },
  { href: '#formats', num: '۵', label: 'فرمت‌های خروجی (WebP و AVIF)' },
  { href: '#schedule', num: '۶', label: 'زمان‌بندی شبانه' },
  { href: '#woocommerce', num: '۷', label: 'پشتیبانی از WooCommerce' },
  { href: '#backup', num: '۸', label: 'نسخه پشتیبان و بازگردانی' },
  { href: '#dashboard', num: '۹', label: 'داشبورد آماری' },
  { href: '#server', num: '۱۰', label: 'سازگاری با هاست و سرور' },
  { href: '#faq', num: '۱۱', label: 'سوالات متداول' },
  { href: '#support', num: '۱۲', label: 'پشتیبانی و تماس' },
]

const settingsTable = [
  { setting: 'کیفیت بهینه‌سازی', desc: 'درصد کیفیت تصاویر خروجی (پایین‌تر = حجم کمتر)', def: '۸۲٪' },
  { setting: 'فرمت خروجی', desc: 'فرمت تبدیل تصاویر: JPEG, PNG, WebP یا AVIF', def: 'WebP' },
  { setting: 'بهینه‌سازی خودکار', desc: 'فعال‌سازی پردازش خودکار تصاویر جدید پس از آپلود', def: 'فعال' },
  { setting: 'حفظ نسخه اصلی', desc: 'نگهداری فایل اصلی برای امکان بازگردانی', def: 'فعال' },
  { setting: 'حداکثر ابعاد', desc: 'ابعاد بزرگ‌تر از این مقدار قبل از بهینه‌سازی ری‌سایز می‌شوند', def: '۲۵۶۰ پیکسل' },
  { setting: 'زمان‌بندی شبانه', desc: 'بازه زمانی برای پردازش تصاویر در ساعات کم‌ترافیک', def: 'غیرفعال' },
]

const faqItems = [
  { q: 'آیا OptiPress کیفیت تصاویر را خراب می‌کند؟', a: 'خیر. OptiPress با استفاده از الگوریتم‌های هوشمند، تعادل مناسبی بین کیفیت و حجم فایل برقرار می‌کند. شما می‌توانید درصد کیفیت را خودتان تنظیم کنید.' },
  { q: 'آیا تصاویر اصلی حذف می‌شوند؟', a: 'اگر گزینه «حفظ نسخه اصلی» فعال باشد، فایل اصلی نگهداری می‌شود و امکان بازگردانی وجود دارد.' },
  { q: 'آیا افزونه روی سرعت سایت تأثیر منفی دارد؟', a: 'پردازش تصاویر در پس‌زمینه انجام می‌شود و تأثیر مستقیمی روی سرعت بارگذاری صفحات ندارد.' },
  { q: 'آیا OptiPress با افزونه‌های دیگر سازگار است؟', a: 'بله. با اکثر افزونه‌های محبوب وردپرس از جمله WooCommerce، Elementor، WPBakery و افزونه‌های کش سازگار است.' },
  { q: 'فرمت بهتر برای سایت من چیست؟', a: 'برای اکثر سایت‌ها WebP بهترین انتخاب است. اگر مرورگرهای خیلی قدیمی مد نظر نیست، AVIF نتایج بهتری می‌دهد.' },
  { q: 'چگونه می‌توانم حجم کل تصاویر بهینه شده را ببینم؟', a: 'از بخش داشبورد OptiPress می‌توانید آمار کامل شامل تعداد تصاویر، فضای ذخیره شده، و درصد کاهش میانگین را مشاهده کنید.' },
  { q: 'آیا می‌توانم فقط بخشی از تصاویر را بهینه کنم؟', a: 'بله. در بخش اسکن تصاویر می‌توانید تصاویر را بر اساس نوع، حجم، یا وضعیت بهینه‌سازی فیلتر کرده و فقط موارد دلخواه را انتخاب کنید.' },
  { q: 'اگر خطایی در پردازش رخ داد چه کنم؟', a: 'ابتدا وضعیت سرور را از بخش تنظیمات ← وضعیت سرور بررسی کنید. مطمئن شوید GD یا Imagick فعال است و حافظه PHP کافی دارید.' },
]

function StepList({ items }) {
  return (
    <ol className="space-y-3 my-4">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 items-start bg-ink-900/50 border border-ink-800/50 rounded-xl px-4 py-3">
          <span className="shrink-0 w-6 h-6 rounded-lg bg-brand-600/15 flex items-center justify-center text-xs font-bold text-brand-400">{i + 1}</span>
          <span className="text-sm text-ink-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: item }} />
        </li>
      ))}
    </ol>
  )
}

function InfoBox({ type, icon, children }) {
  const styles = {
    tip: 'bg-green-600/10 border-green-500/20 text-green-400',
    warning: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    danger: 'bg-red-500/10 border-red-500/20 text-red-400',
  }
  return (
    <div className={`flex gap-3 items-start rounded-xl border px-4 py-3 my-4 text-sm ${styles[type]}`}>
      <span className="shrink-0 mt-0.5">{icon}</span>
      <div className="text-ink-300" dangerouslySetInnerHTML={{ __html: children }} />
    </div>
  )
}

function Section({ id, icon: Icon, iconColor, title, children }) {
  return (
    <section id={id} className="mb-14">
      <div className="flex items-center gap-3 mb-5 pb-3 border-b border-ink-800/50">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>
      {children}
    </section>
  )
}

export default function Help() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header className="relative pt-24 pb-12 text-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-brand-600/10 border border-brand-500/20 rounded-full px-4 py-1.5 mb-6">
            <BookOpen className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-xs font-medium text-brand-300">راهنمای کامل استفاده</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
            راهنمای <span className="bg-gradient-to-l from-brand-400 via-purple-400 to-accent-400 bg-clip-text text-transparent">OptiPress</span>
          </h1>
          <p className="text-lg text-ink-400 max-w-xl mx-auto">
            تمام آنچه برای نصب، تنظیم و استفاده از افزونه بهینه‌ساز تصاویر وردپرس نیاز دارید.
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Table of Contents */}
        <nav className="bg-ink-900/60 border border-ink-800/50 rounded-2xl p-6 mb-12">
          <h2 className="text-sm font-bold text-white mb-4">فهرست مطالب</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {tocItems.map((item) => (
              <a key={item.href} href={item.href} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-ink-400 hover:text-brand-400 hover:bg-ink-800/40 transition-colors">
                <span className="w-5 h-5 rounded-md bg-brand-600/12 flex items-center justify-center text-[10px] font-bold text-brand-400 shrink-0">{item.num}</span>
                {item.label}
              </a>
            ))}
          </div>
        </nav>

        {/* 1. پیش‌نیازها و نصب */}
        <Section id="install" icon={Package} iconColor="bg-brand-600/15 text-brand-400" title="۱. پیش‌نیازها و نصب">
          <h3 className="text-sm font-bold text-white mb-2">پیش‌نیازها</h3>
          <ul className="list-disc list-inside space-y-1.5 text-sm text-ink-300 mb-4">
            <li><strong className="text-white">وردپرس</strong> نسخه ۵٫۸ یا بالاتر</li>
            <li><strong className="text-white">PHP</strong> نسخه ۷٫۴ یا بالاتر (توصیه: PHP 8.x)</li>
            <li><strong className="text-white">یکی از موتورهای پردازش تصویر:</strong> <code className="bg-brand-600/10 border border-brand-500/20 rounded px-1.5 py-0.5 text-xs text-brand-400">GD</code> یا <code className="bg-brand-600/10 border border-brand-500/20 rounded px-1.5 py-0.5 text-xs text-brand-400">Imagick</code></li>
            <li>حداقل <strong className="text-white">۱۲۸ مگابایت</strong> حافظه PHP</li>
          </ul>

          <InfoBox type="tip" icon="💡">
            برای بررسی فعال بودن GD یا Imagick، به مسیر <strong>پیشخوان وردپرس ← ابزارها ← وضعیت سایت</strong> بروید.
          </InfoBox>

          <p className="text-sm text-ink-300 mb-3">
            پس از خرید و دانلود افزونه از <strong className="text-white">ژاکت</strong>، فایل دانلود شده را از حالت فشرده خارج کنید. ساختار پوشه به شکل زیر است:
          </p>

          <div className="direction-ltr text-left bg-ink-900/60 border border-ink-800/50 rounded-xl p-4 my-4 font-mono text-xs text-ink-300 leading-7">
            <div>📦 <strong className="text-white">product/optipress/</strong></div>
            <div>&nbsp;&nbsp;├── <span className="text-brand-400">Documentation/</span></div>
            <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;└── <span className="text-accent-400">Help.html</span> <span className="text-ink-500">← (همین فایل)</span></div>
            <div>&nbsp;&nbsp;├── <span className="text-red-400">Help.pdf</span></div>
            <div>&nbsp;&nbsp;└── <span className="text-green-400">Plugin/</span></div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── <strong className="text-green-400">optipress-1.0.0.zip</strong> <span className="text-ink-500">← فایل افزونه</span></div>
          </div>

          <h3 className="text-sm font-bold text-white mb-2">مراحل نصب</h3>
          <StepList items={[
            'پوشه دانلود شده را از حالت فشرده (<code class="bg-brand-600/10 border border-brand-500/20 rounded px-1 text-xs text-brand-400">.zip</code>) خارج کنید.',
            'فایل افزونه را در پوشه <strong class="text-green-400">Plugin</strong> پیدا کنید: <code class="bg-brand-600/10 border border-brand-500/20 rounded px-1 text-xs text-brand-400">optipress-1.0.0.zip</code>',
            'وارد <strong class="text-white">پیشخوان وردپرس</strong> شوید و به مسیر <strong class="text-white">افزونه‌ها ← افزودن ← بارگذاری افزونه</strong> بروید.',
            'فایل <code class="bg-brand-600/10 border border-brand-500/20 rounded px-1 text-xs text-brand-400">optipress-1.0.0.zip</code> را انتخاب کرده و روی <strong class="text-white">«اکنون نصب کن»</strong> کلیک کنید.',
            'پس از نصب، دکمه <strong class="text-white">«فعال‌سازی»</strong> را بزنید.',
            'منوی <strong class="text-white">OptiPress</strong> در نوار کناری پیشخوان ظاهر می‌شود. روی آن کلیک کنید تا وارد داشبورد شوید.',
          ]} />

          <InfoBox type="warning" icon="⚠️">
            اگر <code className="bg-brand-600/10 border border-brand-500/20 rounded px-1 text-xs text-brand-400">memory_limit</code> هاست شما کمتر از ۱۲۸MB باشد، ممکن است در پردازش تصاویر بزرگ با مشکل مواجه شوید.
          </InfoBox>
        </Section>

        {/* 2. تنظیمات اولیه */}
        <Section id="setup" icon={Settings} iconColor="bg-green-600/15 text-green-400" title="۲. تنظیمات اولیه">
          <p className="text-sm text-ink-300 mb-4">
            پس از فعال‌سازی، به مسیر <strong className="text-white">پیشخوان ← OptiPress ← تنظیمات</strong> بروید و تنظیمات پایه را انجام دهید.
          </p>
          <div className="overflow-x-auto my-4">
            <table className="w-full text-sm border border-ink-800/50 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-brand-600/10 border-b border-ink-800/50">
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-white">تنظیم</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-white">توضیح</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-white">پیش‌فرض</th>
                </tr>
              </thead>
              <tbody>
                {settingsTable.map((row, i) => (
                  <tr key={i} className="border-b border-ink-800/30 last:border-0">
                    <td className="px-4 py-2.5 text-ink-300"><strong className="text-white">{row.setting}</strong></td>
                    <td className="px-4 py-2.5 text-ink-400 text-xs">{row.desc}</td>
                    <td className="px-4 py-2.5 text-ink-300 text-xs whitespace-nowrap">{row.def}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <InfoBox type="tip" icon="💡">
            <strong>نکته:</strong> اگر سایت فروشگاهی دارید، کیفیت ۸۰-۸۵٪ معمولاً بهترین تعادل بین حجم و کیفیت است.
          </InfoBox>
        </Section>

        {/* 3. بهینه‌سازی تصاویر */}
        <Section id="optimize" icon={Sparkles} iconColor="bg-accent-500/15 text-accent-400" title="۳. بهینه‌سازی تصاویر">
          <h3 className="text-sm font-bold text-white mb-2">روش ۱: بهینه‌سازی خودکار</h3>
          <p className="text-sm text-ink-300 mb-4">
            با فعال بودن گزینه <strong className="text-white">«بهینه‌سازی خودکار»</strong>، هر تصویری که آپلود شود به‌صورت خودکار وارد صف پردازش می‌شود.
          </p>
          <h3 className="text-sm font-bold text-white mb-2">روش ۲: اسکن و بهینه‌سازی دستی</h3>
          <StepList items={[
            'به مسیر <strong class="text-white">OptiPress ← داشبورد</strong> بروید.',
            'روی دکمه <strong class="text-white">«اسکن تصاویر»</strong> کلیک کنید.',
            'تصاویر مورد نظر را انتخاب کنید.',
            'دکمه <strong class="text-white">«افزودن به صف»</strong> را بزنید.',
            'پردازش شروع می‌شود. وضعیت هر تصویر در صف قابل مشاهده است.',
          ]} />

          <div className="flex flex-wrap items-center justify-center gap-3 my-6">
            {['🔍 اسکن تصاویر', '📋 افزودن به صف', '⚡ پردازش', '✅ تکمیل'].map((step, i) => (
              <div key={i} className="contents">
                <div className="flex flex-col items-center gap-1.5 bg-ink-900/50 border border-ink-800/50 rounded-xl px-4 py-3 text-center min-w-[100px]">
                  <span className="text-xs font-semibold text-ink-300">{step}</span>
                </div>
                {i < 3 && <span className="text-brand-500/40 text-lg">←</span>}
              </div>
            ))}
          </div>
        </Section>

        {/* 4. صف پردازش */}
        <Section id="queue" icon={ListOrdered} iconColor="bg-brand-600/15 text-brand-400" title="۴. صف پردازش و پردازش دسته‌ای">
          <p className="text-sm text-ink-300 mb-4">
            OptiPress از سیستم <strong className="text-white">Queue (صف)</strong> و <strong className="text-white">Batch Processing (پردازش دسته‌ای)</strong> استفاده می‌کند.
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-sm text-ink-300 mb-4">
            <li>تصاویر یکی پس از دیگری پردازش می‌شوند.</li>
            <li>تعداد محدودی تصویر همزمان پردازش می‌شوند تا منابع هاست تحت فشار قرار نگیرد.</li>
            <li>وضعیت هر تصویر (در انتظار، در حال پردازش، تکمیل شده، خطا) قابل مشاهده است.</li>
          </ul>
          <h3 className="text-sm font-bold text-white mb-2">پردازش دسته‌ای</h3>
          <StepList items={[
            'از بخش <strong class="text-white">اسکن تصاویر</strong>، تصاویر را فیلتر کنید.',
            'تعداد دلخواه را انتخاب کنید.',
            'روی <strong class="text-white">«افزودن همه به صف»</strong> کلیک کنید.',
            'پردازش در پس‌زمینه ادامه می‌یابد و می‌توانید از پیشخوان خارج شوید.',
          ]} />
        </Section>

        {/* 5. فرمت‌های خروجی */}
        <Section id="formats" icon={Image} iconColor="bg-green-600/15 text-green-400" title="۵. فرمت‌های خروجی (WebP و AVIF)">
          <p className="text-sm text-ink-300 mb-4">OptiPress از فرمت‌های مدرن تصویر برای کاهش حجم بدون افت کیفیت پشتیبانی می‌کند:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
            {[
              { icon: '🌐', title: 'WebP', desc: 'فرمت محبوب گوگل با حجم ۲۵-۳۵٪ کمتر از JPEG.' },
              { icon: '🚀', title: 'AVIF', desc: 'جدیدترین فرمت با حجم ۴۰-۵۰٪ کمتر. کیفیت بالاتر.' },
              { icon: '📸', title: 'JPEG', desc: 'بهینه‌سازی حجم بدون تغییر فرمت.' },
              { icon: '🎨', title: 'PNG', desc: 'کاهش حجم PNG بدون افت کیفیت.' },
            ].map((f, i) => (
              <div key={i} className="bg-ink-900/50 border border-ink-800/50 rounded-xl p-4">
                <h4 className="text-sm font-bold text-white mb-1">{f.icon} {f.title}</h4>
                <p className="text-xs text-ink-400">{f.desc}</p>
              </div>
            ))}
          </div>
          <InfoBox type="tip" icon="💡">
            <strong>توصیه:</strong> فرمت <strong>WebP</strong> بهترین انتخاب برای اکثر سایت‌هاست.
          </InfoBox>
        </Section>

        {/* 6. زمان‌بندی شبانه */}
        <Section id="schedule" icon={Moon} iconColor="bg-orange-500/15 text-orange-400" title="۶. زمان‌بندی شبانه">
          <p className="text-sm text-ink-300 mb-4">
            با زمان‌بندی شبانه، پردازش تصاویر را به ساعات کم‌ترافیک موکول کنید.
          </p>
          <StepList items={[
            'به بخش <strong class="text-white">OptiPress ← تنظیمات</strong> بروید.',
            'گزینه <strong class="text-white">«زمان‌بندی شبانه»</strong> را فعال کنید.',
            '<strong class="text-white">ساعت شروع</strong> و <strong class="text-white">ساعت پایان</strong> مورد نظر را تعیین کنید.',
            'تنظیمات را ذخیره کنید.',
          ]} />
          <InfoBox type="tip" icon="💡">
            بهترین بازه معمولاً <strong>ساعت ۱ تا ۵ بامداد</strong> است.
          </InfoBox>
        </Section>

        {/* 7. WooCommerce */}
        <Section id="woocommerce" icon={ShoppingCart} iconColor="bg-brand-600/15 text-brand-400" title="۷. پشتیبانی از WooCommerce">
          <p className="text-sm text-ink-300 mb-3">تصاویری که بهینه می‌شوند:</p>
          <ul className="list-disc list-inside space-y-1.5 text-sm text-ink-300 mb-4">
            <li><strong className="text-white">تصویر اصلی محصول</strong></li>
            <li><strong className="text-white">گالری محصول</strong> — تمام تصاویر آلبوم</li>
            <li><strong className="text-white">تصاویر Thumbnail</strong> — تصاویر کوچک در صفحه دسته‌بندی</li>
          </ul>
          <StepList items={[
            'افزونه WooCommerce باید فعال باشد.',
            'در تنظیمات OptiPress، گزینه <strong class="text-white">«پشتیبانی از WooCommerce»</strong> را فعال کنید.',
            'تصاویر محصولات جدید به‌صورت خودکار بهینه می‌شوند.',
            'برای محصولات قدیمی، از بخش <strong class="text-white">اسکن تصاویر</strong> و فیلتر «تصاویر محصول» استفاده کنید.',
          ]} />
        </Section>

        {/* 8. پشتیبانی و بازگردانی */}
        <Section id="backup" icon={ShieldCheck} iconColor="bg-accent-500/15 text-accent-400" title="۸. نسخه پشتیبان و بازگردانی">
          <p className="text-sm text-ink-300 mb-4">
            در بخش تنظیمات، گزینه <strong className="text-white">«حفظ نسخه اصلی»</strong> را فعال کنید تا فایل اصلی قبل از بهینه‌سازی نگهداری شود.
          </p>
          <h3 className="text-sm font-bold text-white mb-2">بازگردانی تصویر</h3>
          <StepList items={[
            'به صفحه <strong class="text-white">کتابخانه رسانه</strong> وردپرس بروید.',
            'تصویر مورد نظر را پیدا کرده و روی آن کلیک کنید.',
            'گزینه <strong class="text-white">«بازگردانی به نسخه اصلی»</strong> را بزنید.',
          ]} />
          <InfoBox type="danger" icon="🔴">
            <strong>هشدار:</strong> نگهداری نسخه پشتیبان فضای بیشتری روی هاست اشغال می‌کند.
          </InfoBox>
        </Section>

        {/* 9. داشبورد آماری */}
        <Section id="dashboard" icon={BarChart3} iconColor="bg-green-600/15 text-green-400" title="۹. داشبورد آماری">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
            {[
              { icon: '🖼️', title: 'تعداد تصاویر', desc: 'تعداد کل تصاویر بهینه شده.' },
              { icon: '💾', title: 'فضای ذخیره‌شده', desc: 'حجم کل فضای صرفه‌جویی شده.' },
              { icon: '📉', title: 'میانگین کاهش', desc: 'درصد میانگین کاهش حجم.' },
              { icon: '🟢', title: 'وضعیت سیستم', desc: 'آیا بهینه‌سازی خودکار فعال است.' },
            ].map((f, i) => (
              <div key={i} className="bg-ink-900/50 border border-ink-800/50 rounded-xl p-4">
                <h4 className="text-sm font-bold text-white mb-1">{f.icon} {f.title}</h4>
                <p className="text-xs text-ink-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* 10. سازگاری با هاست */}
        <Section id="server" icon={Server} iconColor="bg-orange-500/15 text-orange-400" title="۱۰. سازگاری با هاست و سرور">
          <p className="text-sm text-ink-300 mb-4">
            OptiPress پردازش تصاویر را <strong className="text-white">۱۰۰٪ روی هاست شما</strong> انجام می‌دهد.
          </p>
          <div className="overflow-x-auto my-4">
            <table className="w-full text-sm border border-ink-800/50 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-brand-600/10 border-b border-ink-800/50">
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-white">موتور</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-white">ویژگی</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-white">وضعیت</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-ink-800/30">
                  <td className="px-4 py-2.5 text-ink-300"><strong className="text-white">GD (PHP GD)</strong></td>
                  <td className="px-4 py-2.5 text-ink-400 text-xs">پیش‌فرض اکثر هاست‌ها، سبک و سریع</td>
                  <td className="px-4 py-2.5 text-ink-300 text-xs">معمولاً فعال</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-ink-300"><strong className="text-white">Imagick</strong></td>
                  <td className="px-4 py-2.5 text-ink-400 text-xs">قدرتمندتر، پشتیبانی بهتر از AVIF</td>
                  <td className="px-4 py-2.5 text-ink-300 text-xs">بسته به هاست</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* 11. سوالات متداول */}
        <Section id="faq" icon={HelpCircle} iconColor="bg-red-500/15 text-red-400" title="۱۱. سوالات متداول">
          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <div key={i} className="bg-ink-900/50 border border-ink-800/50 rounded-xl p-4">
                <h4 className="text-sm font-bold text-white mb-2">{item.q}</h4>
                <p className="text-sm text-ink-400 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* 12. پشتیبانی */}
        <Section id="support" icon={MessageCircle} iconColor="bg-green-600/15 text-green-400" title="۱۲. پشتیبانی و تماس">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
            {[
              { icon: '🛒', title: 'ژاکت', desc: 'برای خرید و پشتیبانی فنی از zhaket.com اقدام کنید.' },
              { icon: '📧', title: 'ایمیل', desc: 'سؤالات فنی و گزارش مشکلات را از طریق ایمیل ارسال کنید.' },
              { icon: '📖', title: 'مستندات', desc: 'مستندات کامل در سایت OptiPress در دسترس است.' },
              { icon: '🔄', title: 'به‌روزرسانی', desc: 'نسخه جدید افزونه از ژاکت قابل دانلود است.' },
            ].map((f, i) => (
              <div key={i} className="bg-ink-900/50 border border-ink-800/50 rounded-xl p-4">
                <h4 className="text-sm font-bold text-white mb-1">{f.icon} {f.title}</h4>
                <p className="text-xs text-ink-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}
