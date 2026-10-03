import Lenis from 'lenis'

// Smooth scrolling with Lenis. Lenis drives native scroll, so position: sticky,
// IntersectionObserver and keyboard scrolling keep working.
let lenis: Lenis | null = null

export function startSmoothScroll() {
  lenis ??= new Lenis({ autoRaf: true, lerp: 0.085, wheelMultiplier: 0.9 })
  return lenis
}

export function stopSmoothScroll() {
  lenis?.destroy()
  lenis = null
}

export function lockScroll(locked: boolean) {
  if (locked) lenis?.stop()
  else lenis?.start()
}

const NAV_OFFSET = 96

export function scrollToElement(el: HTMLElement, reduced: boolean) {
  if (lenis) lenis.scrollTo(el, { offset: -NAV_OFFSET, duration: 1.4 })
  else {
    const y = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET
    window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' })
  }
}
