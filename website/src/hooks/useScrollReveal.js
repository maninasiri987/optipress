import { useEffect } from 'react'

export function useScrollReveal() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      document.querySelectorAll('.reveal, .reveal-fade, .reveal-scale, .reveal-stagger').forEach(el => {
        el.classList.add('is-visible')
      })
      return
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )

    document.querySelectorAll('.reveal, .reveal-fade, .reveal-scale, .reveal-stagger').forEach(el => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])
}
