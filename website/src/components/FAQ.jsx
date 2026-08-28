import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  { q: 'آیا OptiPress با WooCommerce سازگار است؟', a: 'بله. OptiPress به‌طور کامل با WooCommerce سازگار است و تصاویر محصولات، گالری و Thumbnail‌ها را بهینه‌سازی می‌کند.' },
  { q: 'آیا تصاویر برای پردازش به سرویس دیگری ارسال می‌شوند؟', a: 'خیر. تمام پردازش‌ها به‌صورت کاملاً محلی روی هاست شما انجام می‌شوند و هیچ تصویری به سرور خارجی ارسال نمی‌گردد.' },
  { q: 'آیا WebP و AVIF پشتیبانی می‌شوند؟', a: 'بله. OptiPress از فرمت‌های مدرن WebP و AVIF پشتیبانی می‌کند و می‌تواند تصاویر را به این فرمت‌ها تبدیل کند.' },
  { q: 'آیا می‌توانم زمان بهینه‌سازی را مشخص کنم؟', a: 'بله. با قابلیت زمان‌بندی شبانه می‌توانید بازه زمانی مناسب برای پردازش تصاویر را تعیین کنید تا ترافیک سایت تحت تأثیر قرار نگیرد.' },
  { q: 'اگر Imagick روی هاست من نصب نباشد چه می‌شود؟', a: 'OptiPress قابلیت‌های موجود روی سرور را بررسی می‌کند. اگر Imagick نصب نباشد، از GD Library استفاده می‌شود. همچنین وضعیت موتورهای پردازش در داشبورد قابل مشاهده است.' },
  { q: 'آیا امکان بازگردانی تصاویر وجود دارد؟', a: 'بله. OptiPress قبل از بهینه‌سازی از تصویر اصلی بک‌آپ تهیه می‌کند و شما در هر زمان می‌توانید تصویر را به نسخه اصلی بازگردانید.' },
]

function FAQItem({ faq, isOpen, onToggle }) {
  const contentRef = useRef(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight)
    }
  }, [isOpen])

  return (
    <div className="faq-item bg-ink-900/60 border border-ink-800/50 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-right hover:bg-ink-800/30 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-semibold text-white">{faq.q}</span>
        <ChevronDown
          className="w-4 h-4 text-ink-400 shrink-0 transition-transform duration-300"
          style={{ transform: isOpen ? 'rotate(180deg)' : '' }}
        />
      </button>
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-350 ease-in-out"
        style={{
          maxHeight: isOpen ? height + 20 + 'px' : '0',
          opacity: isOpen ? 1 : 0,
          paddingTop: isOpen ? '' : '0',
          paddingBottom: isOpen ? '' : '0',
        }}
      >
        <div className="px-5 pb-4 text-sm text-ink-400 leading-relaxed">{faq.a}</div>
      </div>
    </div>
  )
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section id="faq" className="relative py-20 lg:py-28 bg-ink-900/40">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 reveal">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">سوالات متداول</h2>
          <p className="text-lg text-ink-400">پاسخ سوالات رایج شما.</p>
        </div>
        <div className="reveal space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem key={i} faq={faq} isOpen={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? null : i)} />
          ))}
        </div>
      </div>
    </section>
  )
}
