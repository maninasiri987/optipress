import { Check } from 'lucide-react'

const steps = [
  { num: '۱', title: 'اسکن تصاویر', desc: 'تصاویر موجود در کتابخانه رسانه شناسایی می‌شوند.' },
  { num: '۲', title: 'انتخاب تنظیمات', desc: 'کیفیت، فرمت خروجی و رفتار بهینه‌سازی را تنظیم کنید.' },
  { num: '۳', title: 'ورود به صف', desc: 'تصاویر وارد صف پردازش می‌شوند.' },
  { num: '۴', title: 'پردازش', desc: 'OptiPress تصاویر را بهینه می‌کند.' },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-20 lg:py-28 bg-ink-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 reveal">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">OptiPress چطور کار می‌کند؟</h2>
          <p className="text-lg text-ink-400 max-w-xl mx-auto">پنج مرحله ساده تا سایت سریع‌تر.</p>
        </div>
        <div className="reveal-stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="relative text-center">
              <div className="w-12 h-12 rounded-full bg-brand-600 text-white flex items-center justify-center text-lg font-bold mx-auto mb-4 shadow-lg shadow-brand-600/30">{step.num}</div>
              <h3 className="font-bold text-white mb-1.5">{step.title}</h3>
              <p className="text-xs text-ink-400 leading-relaxed">{step.desc}</p>
              {i < steps.length - 1 && <div className="hidden lg:block absolute top-6 -left-3 w-6 h-px bg-ink-700/50" />}
            </div>
          ))}
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-600/30"><Check className="w-5 h-5" /></div>
            <h3 className="font-bold text-white mb-1.5">مشاهده نتیجه</h3>
            <p className="text-xs text-ink-400 leading-relaxed">آمار بهینه‌سازی را در داشبورد ببینید.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
