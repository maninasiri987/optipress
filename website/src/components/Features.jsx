import { Sparkles, Image, Zap, Moon, Layers, ShieldCheck, BarChart3, Server } from 'lucide-react'

const features = [
  { icon: Sparkles, color: 'text-brand-400', bg: 'bg-brand-600/15', border: 'border-brand-500/20', title: 'بهینه‌سازی هوشمند', desc: 'کاهش حجم تصاویر با حفظ تعادل مناسب بین کیفیت و حجم فایل.' },
  { icon: Image, color: 'text-accent-400', bg: 'bg-accent-500/15', border: 'border-accent-500/20', title: 'WebP و AVIF', desc: 'استفاده از فرمت‌های مدرن برای تصاویر بهینه‌تر.' },
  { icon: Zap, color: 'text-green-400', bg: 'bg-green-600/15', border: 'border-green-500/20', title: 'بهینه‌سازی خودکار', desc: 'تصاویر جدید پس از آپلود به‌صورت خودکار شناسایی و وارد صف پردازش می‌شوند.' },
  { icon: Moon, color: 'text-indigo-400', bg: 'bg-indigo-600/15', border: 'border-indigo-500/20', title: 'زمان‌بندی شبانه', desc: 'پردازش تصاویر را برای ساعات کم‌ترافیک برنامه‌ریزی کنید.' },
  { icon: Layers, color: 'text-orange-400', bg: 'bg-orange-600/15', border: 'border-orange-500/20', title: 'پردازش دسته‌ای', desc: 'تعداد زیادی تصویر را با سیستم Queue و Batch Processing مدیریت کنید.' },
  { icon: ShieldCheck, color: 'text-cyan-400', bg: 'bg-cyan-600/15', border: 'border-cyan-500/20', title: 'Backup و Restore', desc: 'امکان نگهداری نسخه اصلی و بازگردانی تصاویر در صورت نیاز.' },
  { icon: BarChart3, color: 'text-pink-400', bg: 'bg-pink-600/15', border: 'border-pink-500/20', title: 'آمار و گزارش', desc: 'میزان کاهش حجم و فضای ذخیره‌شده را مشاهده کنید.' },
  { icon: Server, color: 'text-teal-400', bg: 'bg-teal-600/15', border: 'border-teal-500/20', title: 'سازگاری با هاست', desc: 'قابلیت‌های موجود روی سرور مانند GD و Imagick را بررسی کنید.' },
]

export default function Features() {
  return (
    <section id="features" className="relative py-20 lg:py-28 bg-ink-950">
      <div className="absolute inset-0 gradient-radial-dark opacity-40" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 reveal">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">همه‌چیز برای یک سایت سریع‌تر</h2>
          <p className="text-lg text-ink-400 max-w-xl mx-auto">ابزارهایی که برای بهینه‌سازی تصاویر وردپرس نیاز دارید، همه در یک پلاگین.</p>
        </div>
        <div className="reveal-stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <div key={i} className="group bg-ink-900/50 border border-ink-800/50 rounded-2xl p-6 card-hover">
              <div className={`w-11 h-11 rounded-xl ${f.bg} border ${f.border} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <h3 className="font-bold text-white mb-1.5">{f.title}</h3>
              <p className="text-xs text-ink-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
