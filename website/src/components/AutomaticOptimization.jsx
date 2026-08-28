import { Upload, ScanEye, ListPlus, Cpu, CheckCircle, ChevronDown } from 'lucide-react'

const steps = [
  { icon: Upload, color: 'text-brand-400', bg: 'bg-brand-600/15', border: 'border-brand-500/20', title: 'آپلود تصویر', desc: 'از کتابخانه رسانه وردپرس' },
  { icon: ScanEye, color: 'text-green-400', bg: 'bg-green-600/15', border: 'border-green-500/20', title: 'تشخیص خودکار', desc: 'شناسایی تصویر جدید و بررسی وضعیت' },
  { icon: ListPlus, color: 'text-accent-400', bg: 'bg-accent-600/15', border: 'border-accent-500/20', title: 'افزودن به صف', desc: 'وارد شدن به صف پردازش اولویت‌بندی‌شده' },
  { icon: Cpu, color: 'text-orange-400', bg: 'bg-orange-600/15', border: 'border-orange-500/20', title: 'پردازش', desc: 'بهینه‌سازی با موتور GD یا Imagick' },
  { icon: CheckCircle, color: 'text-brand-400', bg: 'bg-brand-600/15', border: 'border-brand-500/20', title: 'بهینه‌سازی', desc: 'ذخیره فایل بهینه و بک‌آپ خودکار' },
]

export default function AutomaticOptimization() {
  return (
    <section className="relative py-20 lg:py-28 bg-ink-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 reveal">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">دیگر لازم نیست هر تصویر را دستی بهینه کنید.</h2>
          <p className="text-lg text-ink-400 max-w-2xl mx-auto">تصاویر جدید پس از آپلود شناسایی می‌شوند و به صف بهینه‌سازی اضافه می‌شوند تا در زمان مناسب پردازش شوند.</p>
        </div>
        <div className="reveal flex flex-col items-center gap-0 max-w-lg mx-auto">
          {steps.map((step, i) => (
            <div key={i} className="contents">
              <div className="flex items-center gap-3 w-full bg-ink-900/60 border border-ink-800/50 rounded-xl p-4">
                <div className={`w-10 h-10 rounded-lg ${step.bg} border ${step.border} flex items-center justify-center shrink-0`}>
                  <step.icon className={`w-5 h-5 ${step.color}`} />
                </div>
                <div>
                  <span className="text-sm font-semibold text-white">{step.title}</span>
                  <span className="block text-[11px] text-ink-400">{step.desc}</span>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="flex justify-center py-1"><ChevronDown className="w-4 h-4 text-brand-500/40" /></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
