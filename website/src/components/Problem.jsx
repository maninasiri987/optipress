import { Clock, HardDrive, Frown } from 'lucide-react'

const cards = [
  { icon: Clock, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', title: 'بارگذاری کند', desc: 'صفحاتی که تصاویر سنگین دارند، زمان بیشتری برای بارگذاری نیاز دارند و کاربران منتظر می‌مانند.' },
  { icon: HardDrive, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', title: 'مصرف بیشتر فضا', desc: 'حجم بالای تصاویر فضای هاست را اشغال می‌کند و هزینه‌های میزبانی را افزایش می‌دهد.' },
  { icon: Frown, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', title: 'تجربه کاربری ضعیف‌تر', desc: 'سایت کند، بازدیدکنندگان را خسته می‌کند و نرخ بازدید صفحات را کاهش می‌دهد.' },
]

export default function Problem() {
  return (
    <section id="problem" className="relative py-20 lg:py-28 bg-ink-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 reveal">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">تصاویر سنگین، سرعت سایت را می‌گیرند.</h2>
          <p className="text-lg text-ink-400 max-w-2xl mx-auto">تصاویر با حجم بالا می‌توانند زمان بارگذاری صفحات، مصرف فضای هاست و تجربه کاربران را تحت تأثیر قرار دهند.</p>
        </div>
        <div className="reveal-stagger grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <div key={i} className="group relative bg-ink-900/60 border border-ink-800/60 rounded-2xl p-7 card-hover">
              <div className={`w-12 h-12 rounded-xl ${card.bg} border ${card.border} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
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
