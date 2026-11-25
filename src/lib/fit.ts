// One topic, one screen: on wide windows every screen fills the window without
// spilling past it, so nothing is cut off and one turn of the wheel is one
// topic. The layout does most of the work (see "One page" in glass.css); this
// scales a screen's body down when the window is short, and up when it is big.

/** Phones and narrow tablets scroll freely: their screens are as tall as they need. */
const WIDE = '(min-width: 1024px)'
/** Text is never scaled below this; a window shorter than that allows scrolls. */
export const MIN_FIT = 0.72
/** Nor above this, however big the window. */
export const MAX_FIT = 1.6

/** How far a window of this size lets things grow: 1 on a small laptop. */
export function maxFit(width: number, height: number) {
  return Math.max(1, Math.min(MAX_FIT, width / 1290, height / 820))
}

/**
 * The largest scale between `min` and `max` at which `fits` says yes. It
 * searches rather than divides, because text re-wraps as it is scaled.
 */
export function largestFit(fits: (scale: number) => boolean, min = MIN_FIT, max = 1) {
  if (fits(max)) return max
  let lo = min
  let hi = max
  if (!fits(lo)) return min
  for (let i = 0; i < 7; i++) {
    const mid = (lo + hi) / 2
    if (fits(mid)) lo = mid
    else hi = mid
  }
  return lo
}

/** Each fan keeps its smallest scale, so it doesn't resize as its cards turn. */
const fans = new WeakMap<HTMLElement, number>()

function fitScreen(el: HTMLElement) {
  if (el.getClientRects().length === 0) return
  const set = (scale: number) => el.style.setProperty('--fit', scale.toFixed(3))
  const before = el.style.minHeight
  el.style.minHeight = '0'
  const limit = window.innerHeight
  const fan = el.querySelector('.fan') !== null
  let scale = largestFit(
    (s) => {
      set(s)
      return el.offsetHeight <= limit
    },
    MIN_FIT,
    maxFit(window.innerWidth, limit),
  )
  if (fan) {
    scale = Math.min(scale, fans.get(el) ?? MAX_FIT)
    fans.set(el, scale)
  }
  set(scale)
  el.style.minHeight = before
}

/** Keeps every screen fitted until the returned function is called. */
export function fitScreens(): () => void {
  const page = document.getElementById('page')
  if (!page) return () => {}
  const wide = window.matchMedia(WIDE)
  const screens = () => [...page.querySelectorAll<HTMLElement>('.screen, .contact')]
  let dirty = new Set<HTMLElement>()
  let raf = 0

  const run = () => {
    raf = 0
    const list = dirty
    dirty = new Set()
    // Measuring collapses a screen for a moment. On the last one that would
    // shorten the page and pull the scroll up, so the page holds its height.
    const top = window.scrollY
    document.body.style.minHeight = `${document.documentElement.scrollHeight}px`
    for (const el of list) {
      if (wide.matches) fitScreen(el)
      else el.style.removeProperty('--fit')
    }
    document.body.style.minHeight = ''
    if (window.scrollY !== top) window.scrollTo({ top, behavior: 'instant' })
  }
  const queue = (list: HTMLElement[]) => {
    list.forEach((el) => dirty.add(el))
    if (!raf && dirty.size) raf = requestAnimationFrame(run)
  }
  const all = () => queue(screens())
  const fresh = () => {
    // Titles and tabs grow with the window too (--k in glass.css).
    const root = document.documentElement.style
    if (wide.matches) root.setProperty('--k', maxFit(window.innerWidth, window.innerHeight).toFixed(3))
    else root.removeProperty('--k')
    screens().forEach((el) => fans.delete(el))
    all()
  }

  // A tab, a case study, a card or a song changed: refit the screen it is in.
  const inside = new MutationObserver((changes) => {
    const hit = new Set<HTMLElement>()
    for (const c of changes) {
      const node = c.target instanceof Element ? c.target : c.target.parentElement
      const el = node?.closest<HTMLElement>('.screen, .contact')
      if (el) hit.add(el)
    }
    queue([...hit])
  })
  inside.observe(page, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['data-active', 'open'],
  })
  // The mode or page changed: other screens show.
  const root = new MutationObserver(all)
  root.observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode', 'data-page'] })
  window.addEventListener('resize', fresh)
  void document.fonts?.ready.then(fresh)
  fresh()

  return () => {
    cancelAnimationFrame(raf)
    inside.disconnect()
    root.disconnect()
    window.removeEventListener('resize', fresh)
  }
}
