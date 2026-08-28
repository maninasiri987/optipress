import { Moon, CalendarClock } from 'lucide-react'

const timeline = [
  { time: '۰۰:۰۰', active: false },
  { time: '۰۱:۰۰', active: true, label: 'زمان بهینه‌سازی' },
  { time: '۰۲:۰۰', active: true, progress: 65 },
  { time: '۰۳:۰۰', active: true, progress: 85 },
  { time: '۰۴:۰۰', active: true, done: true },
  { time: '۰۵:۰۰', active: false },
  { time: '۰۶:۰۰', active: false },
]

export default function NightScheduler() {
  return (
    <section className="relative py-20 lg:py-28 bg-ink-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="reveal">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">بهینه‌سازی در زمانی که سایت آرام است.</h2>
            <p className="text-lg text-ink-400 mb-6 leading-relaxed">پردازش تعداد زیادی تصویر می‌تواند منابع هاست را مصرف کند. با زمان‌بندی OptiPress، بازه مناسب برای پردازش تصاویر را خودتان انتخاب کنید.</p>
            <div className="flex items-center gap-3 bg-ink-800/50 border border-ink-700/40 rounded-xl p-4 w-fit">
              <Moon className="w-5 h-5 text-brand-400" />
              <span className="text-sm text-ink-200">زمان بهینه‌سازی: <span className="font-bold text-white">۰۱:۰۰ تا ۰۵:۰۰</span></span>
            </div>
          </div>
          <div className="reveal">
            <div className="bg-ink-900/70 border border-ink-800/50 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <CalendarClock className="w-4 h-4 text-brand-400" />
                <span className="text-xs font-semibold text-ink-300">زمان‌بندی پردازش شبانه</span>
              </div>
              <div className="space-y-2">
                {timeline.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-[11px] text-ink-500 w-10 font-mono">{item.time}</span>
                    {item.active ? (
                      <div className={`flex-1 h-8 rounded-lg border flex items-center px-3 ${item.done ? 'bg-brand-600/20 border-brand-500/30' : 'bg-brand-600/20 border-brand-500/30'}`}>
                        {item.progress ? (
                          <div className="flex-1">
                            <div className="h-1 bg-brand-500/40 rounded-full overflow-hidden">
                              <div className="h-full bg-brand-400 rounded-full" style={{ width: `${item.progress}%` }} />
                            </div>
                          </div>
                        ) : item.done ? (
                          <div className="flex-1">
                            <div className="h-1 bg-brand-500/40 rounded-full overflow-hidden">
                              <div className="h-full bg-green-400 rounded-full" style={{ width: '100%' }} />
                            </div>
                          </div>
                        ) : null}
                        <span className={`text-[10px] font-semibold ${item.done ? 'text-green-300' : 'text-brand-300'} mr-2`}>
                          {item.label || (item.done ? 'تکمیل' : 'پردازش')}
                        </span>
                      </div>
                    ) : (
                      <div className="flex-1 h-8 bg-ink-800/40 rounded-lg border border-ink-700/30" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
