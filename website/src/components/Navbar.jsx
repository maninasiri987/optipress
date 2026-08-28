import { useState, useEffect, useRef } from 'react'
import { ShoppingCart, Menu } from 'lucide-react'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navbarRef = useRef(null)
  const menuRef = useRef(null)
  const linesRef = useRef([])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (scrolled) {
      navbarRef.current?.classList.add('bg-ink-950/90', 'backdrop-blur-xl', 'shadow-lg', 'shadow-black/20', 'border-b', 'border-ink-800/30')
    } else {
      navbarRef.current?.classList.remove('bg-ink-950/90', 'backdrop-blur-xl', 'shadow-lg', 'shadow-black/20', 'border-b', 'border-ink-800/30')
    }
  }, [scrolled])

  useEffect(() => {
    if (menuOpen) {
      navbarRef.current?.classList.add('bg-ink-950/90', 'backdrop-blur-xl', 'shadow-lg', 'shadow-black/20', 'border-b', 'border-ink-800/30')
      if (menuRef.current) {
        menuRef.current.style.display = 'block'
        menuRef.current.style.background = 'rgba(5,3,16,0.98)'
        menuRef.current.style.backdropFilter = 'blur(20px)'
        menuRef.current.style.borderTop = '1px solid rgba(30,27,41,0.4)'
        menuRef.current.offsetHeight
        menuRef.current.style.maxHeight = menuRef.current.scrollHeight + 100 + 'px'
        menuRef.current.style.opacity = '1'
      }
      linesRef.current[0].style.transform = 'rotate(45deg)'
      linesRef.current[1].style.transform = 'scaleX(0)'
      linesRef.current[2].style.transform = 'rotate(-45deg)'
    } else {
      linesRef.current[0].style.transform = ''
      linesRef.current[1].style.transform = ''
      linesRef.current[2].style.transform = ''
      if (menuRef.current) {
        menuRef.current.style.maxHeight = '0'
        menuRef.current.style.opacity = '0'
        setTimeout(() => {
          if (!menuOpen) {
            menuRef.current.style.display = 'none'
            if (window.scrollY <= 50) {
              navbarRef.current?.classList.remove('bg-ink-950/90', 'backdrop-blur-xl', 'shadow-lg', 'shadow-black/20', 'border-b', 'border-ink-800/30')
            }
          }
        }, 350)
      }
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  const navLinks = [
    { href: '#features', label: 'امکانات' },
    { href: '#how-it-works', label: 'نحوه کار' },
    { href: '#woocommerce', label: 'WooCommerce' },
    { href: '#faq', label: 'سوالات متداول' },
  ]

  const scrollTo = (e, href) => {
    e.preventDefault()
    closeMenu()
    const el = document.querySelector(href)
    if (el) {
      const offset = navbarRef.current?.offsetHeight + 16
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' })
    }
  }

  return (
    <nav ref={navbarRef} className="fixed top-0 inset-x-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <a href="#" className="flex items-center gap-2.5 shrink-0">
            <img src="/logo.webp" alt="OptiPress" className="h-8 w-8 lg:h-9 lg:w-9 brightness-0 invert" width="36" height="36" />
            <span className="text-lg lg:text-xl font-bold text-white">OptiPress</span>
          </a>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <a key={link.href} href={link.href} onClick={e => scrollTo(e, link.href)} className="px-4 py-2 text-sm text-ink-300 hover:text-white rounded-lg transition-colors">{link.label}</a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <a href="https://www.zhaket.com/" target="_blank" rel="noopener" className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-brand-600/25 hover:shadow-brand-500/40 hover:-translate-y-0.5">
              <ShoppingCart className="w-4 h-4" />خرید OptiPress
            </a>
          </div>

          <button type="button" className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-lg text-ink-300 hover:text-white hover:bg-ink-800/60 transition-colors" onClick={() => setMenuOpen(!menuOpen)} aria-label="باز کردن منو" aria-expanded={menuOpen}>
            <span ref={el => linesRef.current[0] = el} className="hamburger-line absolute w-5 h-[2px] bg-current rounded-full" />
            <span ref={el => linesRef.current[1] = el} className="hamburger-line absolute w-5 h-[2px] bg-current rounded-full" />
            <span ref={el => linesRef.current[2] = el} className="hamburger-line absolute w-5 h-[2px] bg-current rounded-full" />
          </button>
        </div>
      </div>

      <div ref={menuRef} id="mobile-menu" className="lg:hidden">
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
          {navLinks.map(link => (
            <a key={link.href} href={link.href} onClick={e => scrollTo(e, link.href)} className="block px-4 py-3 text-ink-200 hover:text-white hover:bg-ink-800/60 rounded-xl transition-colors text-sm">{link.label}</a>
          ))}
          <div className="pt-3">
            <a href="https://www.zhaket.com/" target="_blank" rel="noopener" className="flex items-center justify-center gap-2 w-full bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-all">
              <ShoppingCart className="w-4 h-4" />خرید OptiPress
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}
