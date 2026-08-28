import { Archive, RotateCcw, Settings2 } from 'lucide-react'

const cards = [
  { icon: Archive, color: 'text-cyan-400', bg: 'bg-cyan-600/15', border: 'border-cyan-500/20', title: 'Backup', desc: 'نگهداری نسخه اصلی تصاویر قبل از هرگونه تغییر.' },
  { icon: RotateCcw, color: 'text-brand-400', bg: 'bg-brand-600/15', border: 'border-brand-500/20', title: 'Restore', desc: 'بازگردانی تصویر به نسخه اصلی در صورت نیاز.' },
  { icon: Settings2, color: 'text-green-400', bg: 'bg-green-600/15', border: 'border-green-500/20', title: 'Control', desc: 'مدیریت وضعیت پردازش‌ها و بازگردانی یا حذف بک‌آپ‌ها.' },
]

export default function BackupRestore() {
  return (
    <section className="relative py-20 lg:py-28 bg-ink-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 reveal">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">قبل از تغییر، کنترل در اختیار شماست.</h2>
          <p className="text-lg text-ink-400 max-w-xl mx-auto">با اطمینان بهینه‌سازی کنید. نسخه اصلی همیشه قابل بازیابی است.</p>
        </div>
        <div className="reveal-stagger grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <div key={i} className="group bg-ink-900/60 border border-ink-800/50 rounded-2xl p-7 text-center card-hover">
              <div className={`w-14 h-14 rounded-2xl ${card.bg} border ${card.border} flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
              <p className="text-sm text-ink-400 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
