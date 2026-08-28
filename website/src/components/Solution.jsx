import { ScanSearch, ListOrdered, Cpu, CheckCircle2, ChevronLeft } from 'lucide-react'

const steps = [
  { icon: ScanSearch, label: 'اسکن تصاویر', color: 'brand' },
  { icon: ListOrdered, label: 'صف پردازش', color: 'brand' },
  { icon: Cpu, label: 'بهینه‌سازی', color: 'brand' },
  { icon: CheckCircle2, label: 'نتیجه', color: 'green' },
]

export default function Solution() {
  return (
    <section className="relative py-20 lg:py-28 bg-ink-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 reveal">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">OptiPress برای همین ساخته شده است.</h2>
          <p className="text-lg text-ink-400 max-w-2xl mx-auto">بهینه‌سازی تصاویر نباید یک کار دستی و تکراری باشد. OptiPress تصاویر شما را اسکن می‌کند، آن‌ها را وارد صف پردازش می‌کند و بر اساس تنظیمات شما بهینه‌سازی را انجام می‌دهد.</p>
        </div>
        <div className="reveal max-w-3xl mx-auto">
          {/* Mobile: 2x2 Grid */}
          <div className="grid grid-cols-2 gap-4 sm:hidden">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center bg-ink-900/50 border border-ink-800/50 rounded-2xl p-4">
                <div className={`w-12 h-12 rounded-xl ${step.color === 'green' ? 'bg-green-600/15 border border-green-500/25' : 'bg-brand-600/15 border border-brand-500/25'} flex items-center justify-center mb-2`}>
                  <step.icon className={`w-5 h-5 ${step.color === 'green' ? 'text-green-400' : 'text-brand-400'}`} />
                </div>
                <span className="text-xs font-semibold text-white">{step.label}</span>
              </div>
            ))}
          </div>
          {/* Desktop: Horizontal flow with numbered steps */}
          <div className="hidden sm:flex items-center justify-center gap-3">
            {steps.map((step, i) => (
              <div key={i} className="contents">
                <div className="flex flex-col items-center text-center w-28">
                  <div className={`relative w-14 h-14 rounded-2xl ${step.color === 'green' ? 'bg-green-600/15 border border-green-500/25' : 'bg-brand-600/15 border border-brand-500/25'} flex items-center justify-center mb-2.5`}>
                    <step.icon className={`w-6 h-6 ${step.color === 'green' ? 'text-green-400' : 'text-brand-400'}`} />
                    <span className={`absolute -top-1.5 -left-1.5 w-5 h-5 ${step.color === 'green' ? 'bg-green-600' : 'bg-brand-600'} text-white text-[9px] font-bold rounded-full flex items-center justify-center`}>{i + 1}</span>
                  </div>
                  <span className="text-xs font-semibold text-white">{step.label}</span>
                </div>
                {i < steps.length - 1 && <ChevronLeft className="w-4 h-4 text-brand-500/40" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
