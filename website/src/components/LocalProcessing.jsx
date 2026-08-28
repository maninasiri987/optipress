import { Server, Zap, Cpu, CheckCircle2, ShieldCheck, ChevronDown } from 'lucide-react'

const steps = [
  { icon: Server, color: 'text-accent-400', bg: 'bg-ink-800/50', border: 'border-ink-700/40', label: 'هاست شما' },
  { icon: Zap, color: 'text-brand-400', bg: 'bg-brand-600/15', border: 'border-brand-500/25', label: 'OptiPress' },
  { icon: Cpu, color: 'text-orange-400', bg: 'bg-ink-800/50', border: 'border-ink-700/40', label: 'موتور پردازش تصویر (GD / Imagick)' },
  { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-600/10', border: 'border-green-500/20', label: 'تصاویر بهینه‌شده' },
]

export default function LocalProcessing() {
  return (
    <section className="relative py-20 lg:py-28 bg-ink-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 reveal">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">تصاویر شما روی هاست خودتان پردازش می‌شوند.</h2>
          <p className="text-lg text-ink-400 max-w-2xl mx-auto">OptiPress برای پردازش تصاویر به سرویس ابری خارجی وابسته نیست و عملیات بهینه‌سازی را با قابلیت‌های موجود روی سرور شما انجام می‌دهد.</p>
        </div>
        <div className="reveal-scale relative max-w-2xl mx-auto">
          <div className="absolute -inset-0.5 bg-gradient-to-b from-green-600/10 via-transparent to-brand-600/10 rounded-3xl blur-lg" />
          <div className="relative bg-ink-900/70 border border-ink-800/50 rounded-2xl p-8">
            <div className="flex flex-col items-center gap-0">
              {steps.map((step, i) => (
                <div key={i} className="contents">
                  <div className={`flex items-center gap-3 ${step.bg} rounded-xl px-5 py-3 border ${step.border}`}>
                    <step.icon className={`w-5 h-5 ${step.color}`} />
                    <span className="text-sm font-semibold text-white">{step.label}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="flex justify-center py-1"><ChevronDown className="w-4 h-4 text-brand-500/40" /></div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 pt-5 border-t border-ink-800/60 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span className="text-xs text-ink-400">هیچ تصویری به سرور خارجی ارسال نمی‌شود — پردازش ۱۰۰٪ محلی</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
