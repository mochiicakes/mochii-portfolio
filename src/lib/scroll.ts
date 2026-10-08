import Lenis, { type VirtualScrollData } from 'lenis'

// Smooth scrolling with Lenis. Lenis drives native scroll, so position: sticky,
// IntersectionObserver and keyboard scrolling keep working.
//
// The page is a stack of screens ([data-screen]), one per topic. With a mouse
// wheel, one flick turns one screen. A screen taller than the window scrolls
// normally until its edge, and the next flick turns the page. Touch and the
// keyboard scroll freely.
let lenis: Lenis | null = null

/** How long a turn takes, in seconds. */
const TURN = 0.9
/**
 * Wheel events closer together than this are one gesture (a spin of the wheel,
 * or trackpad momentum), which turns one screen.
 */
const GESTURE_GAP = 350
/** After a turn, wheel input rests this long (ms) before it can turn again. */
const SETTLE = 250
/** Ignore wheel noise smaller than this. */
const MIN_DELTA = 3

let turning = false
let lastWheel = 0
/** The gesture that started the last turn: the rest of it is ignored. */
let spent = false

type Span = { el: HTMLElement; top: number; bottom: number }

/** The screens that are showing, top to bottom, in page coordinates. */
function screens(): Span[] {
  const y = window.scrollY
  return [...document.querySelectorAll<HTMLElement>('[data-screen]')]
    .map((el) => {
      const r = el.getBoundingClientRect()
      return { el, top: Math.round(r.top + y), bottom: Math.round(r.bottom + y) }
    })
    .filter((s) => s.bottom > s.top)
    .sort((a, b) => a.top - b.top)
}

function turnTo(y: number) {
  if (!lenis) return
  turning = true
  lenis.scrollTo(y, {
    duration: TURN,
    lock: true,
    force: true,
    onComplete: () => {
      setTimeout(() => {
        turning = false
      }, SETTLE)
    },
  })
}

/**
 * Lenis's wheel hook. Returning false makes Lenis ignore the event but does not
 * cancel it, so the event is cancelled here, or the browser would still scroll
 * natively.
 */
function onWheel(data: VirtualScrollData): boolean {
  const go = decide(data)
  if (!go && data.event.cancelable) data.event.preventDefault()
  return go
}

function decide({ deltaY, event }: VirtualScrollData): boolean {
  if (event.type !== 'wheel' || !lenis) return true
  const now = performance.now()
  const newGesture = now - lastWheel > GESTURE_GAP
  lastWheel = now
  if (newGesture) spent = false
  // Mid-turn, or the tail of the gesture that started it: swallow.
  if (turning || spent) return false
  if (Math.abs(deltaY) < MIN_DELTA) return true

  const list = screens()
  if (list.length === 0) return true
  // Where Lenis is heading, not where its animation has reached.
  const y = lenis.targetScroll
  const vh = window.innerHeight
  // The screen at the top of the window.
  let i = list.findLastIndex((s) => s.top <= y + 2)
  if (i < 0) i = 0
  const cur = list[i]

  if (deltaY > 0) {
    // More of this screen below: scroll, but stop at its end.
    if (y + vh < cur.bottom - 2) {
      if (y + vh + deltaY > cur.bottom) {
        spent = true
        lenis.scrollTo(cur.bottom - vh, { duration: 0.4 })
        return false
      }
      return true
    }
    const next = list[i + 1]
    // Past the last screen (the footer): scroll normally.
    if (!next) return true
    spent = true
    turnTo(next.top)
    return false
  }

  // Up: more of this screen above, so scroll, but stop at its start.
  if (y > cur.top + 2) {
    if (y + deltaY < cur.top) {
      spent = true
      lenis.scrollTo(cur.top, { duration: 0.4 })
      return false
    }
    return true
  }
  const prev = list[i - 1]
  if (!prev) return true
  spent = true
  turnTo(prev.top)
  return false
}

export function startSmoothScroll() {
  lenis ??= new Lenis({ autoRaf: true, lerp: 0.085, wheelMultiplier: 0.9, virtualScroll: onWheel })
  return lenis
}

export function stopSmoothScroll() {
  lenis?.destroy()
  lenis = null
  turning = false
}

export function lockScroll(locked: boolean) {
  if (locked) lenis?.stop()
  else lenis?.start()
}

const NAV_OFFSET = 96

/**
 * Scroll to an element. A screen, or something near the top of one, lands with
 * its screen filling the window; anything further down lands under the top bar.
 */
export function scrollToElement(el: HTMLElement, reduced: boolean) {
  // A screen, the screen around el, or (for a wrapper like #work) its first showing screen.
  const screen =
    el.closest<HTMLElement>('[data-screen]') ??
    [...el.querySelectorAll<HTMLElement>('[data-screen]')].find((s) => s.getClientRects().length > 0) ??
    null
  const within = screen ? el.getBoundingClientRect().top - screen.getBoundingClientRect().top : 0
  const toScreen = screen && within < window.innerHeight * 0.6
  const target = toScreen ? screen : el
  const offset = toScreen ? 0 : -NAV_OFFSET
  if (lenis) lenis.scrollTo(target, { offset, duration: 1.2 })
  else {
    const y = target.getBoundingClientRect().top + window.scrollY + offset
    window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' })
  }
}
