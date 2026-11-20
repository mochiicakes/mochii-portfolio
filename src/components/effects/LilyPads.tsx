import { useEffect, useState, type CSSProperties } from 'react'

/**
 * A lotus on a pad. `x` is measured inward from the pad's inner edge (the side
 * facing the content, which always shows) and `y` from its top, both as a share
 * of the pad's width. `px` is its width on a full-size pad; it scales with it.
 */
type Lotus = { x: number; y: number; px: number; turn?: number }

type Pad = {
  side: 'left' | 'right'
  /**
   * Down the page, in screen heights from the top (the cover is screen 0).
   * Every page spaces its pads the same; a short page shows the first few.
   */
  at: number
  /** Diameter in px at full size; scaled down on smaller windows. */
  size: number
  art: 'a' | 'b' | 'c'
  /** Resting angle, deg. */
  turn: number
  /** Seconds for one drift; each pad has its own so they never move in step. */
  drift: number
  lotus?: Lotus[]
  /** Beside the Automations section, which is wider than the page column on big screens. */
  wide?: boolean
  /** Anchored to the foot of the page, so the last screen always has this pad. */
  foot?: boolean
}

// Big pads, alternating sides, each a little different. Art: public/lily/.
const PADS: Pad[] = [
  {
    side: 'left',
    at: 1.11,
    size: 820,
    art: 'a',
    turn: 25,
    drift: 19,
    lotus: [
      { x: 0.08, y: 0.24, px: 190 },
      { x: 0.2, y: 0.5, px: 110, turn: 40 },
    ],
  },
  { side: 'right', at: 1.63, size: 720, art: 'b', turn: 200, drift: 23 },
  { side: 'left', at: 2.37, size: 480, art: 'c', turn: 290, drift: 17, lotus: [{ x: 0.08, y: 0.32, px: 150 }] },
  {
    side: 'right',
    at: 2.96,
    size: 860,
    art: 'a',
    turn: 140,
    drift: 26,
    lotus: [
      { x: 0.08, y: 0.26, px: 200 },
      { x: 0.06, y: 0.54, px: 120, turn: 70 },
    ],
  },
  { side: 'left', at: 3.7, size: 740, art: 'b', turn: 70, drift: 21 },
  { side: 'right', at: 4.44, size: 500, art: 'c', turn: 320, drift: 18, lotus: [{ x: 0.07, y: 0.34, px: 150 }] },
  { side: 'left', at: 5.03, size: 560, art: 'c', turn: 160, drift: 24, lotus: [{ x: 0.08, y: 0.3, px: 140 }], wide: true },
  { side: 'right', at: 5.77, size: 760, art: 'b', turn: 40, drift: 22 },
  { side: 'left', at: 6.44, size: 520, art: 'a', turn: 230, drift: 16, lotus: [{ x: 0.07, y: 0.36, px: 160 }] },
  { side: 'right', at: 6.96, size: 660, art: 'a', turn: 100, drift: 20, lotus: [{ x: 0.08, y: 0.26, px: 180 }], foot: true },
]

type Petal = {
  side: 'left' | 'right'
  /** Screen heights from the top, like a pad's `at`. */
  at: number
  /** Instead of `at`: px up from the end of the page, for a drift by the footer on every page. */
  fromEnd?: number
  x: number
  px: number
  turn: number
  drift: number
  lag: number
}

/** A small seeded random, so the server render and the browser agree. */
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Cherry blossom petals scattered over the open water beside the content, in
 * loose drifts of one to three. `x` is a share of the room beside the content.
 */
const PETALS: Petal[] = (() => {
  const rand = seeded(20261114)
  const out: Petal[] = []
  for (const side of ['left', 'right'] as const) {
    for (let i = 0; i < 13; i++) {
      const at = 0.9 + (6.35 * (i + rand())) / 13
      const x = 0.08 + rand() * 0.84
      const n = 1 + Math.floor(rand() * 3)
      for (let j = 0; j < n; j++) {
        out.push({
          side,
          at: at + (j ? (rand() - 0.5) * 0.09 : 0),
          x: Math.min(0.96, Math.max(0.02, x + (j ? (rand() - 0.5) * 0.25 : 0))),
          px: Math.round(22 + rand() * 20),
          turn: Math.round(rand() * 360),
          drift: Math.round(9 + rand() * 8),
          lag: -Math.round(rand() * 16),
        })
      }
    }
  }
  // A hand-placed drift low on the left, by the footer, where the scatter leaves bare water.
  out.push(
    { side: 'left', at: 0, fromEnd: 294, x: 0.22, px: 34, turn: 40, drift: 13, lag: -3 },
    { side: 'left', at: 0, fromEnd: 247, x: 0.36, px: 26, turn: 200, drift: 11, lag: -9 },
    { side: 'left', at: 0, fromEnd: 187, x: 0.58, px: 38, turn: 300, drift: 15, lag: -5 },
    { side: 'left', at: 0, fromEnd: 127, x: 0.3, px: 24, turn: 120, drift: 12, lag: -12 },
  )
  return out
})()

/**
 * Big lily pads floating down both sides of the page, in the room beside the
 * content column, with lotus flowers and cherry blossom petals on the open
 * water. Each pad drifts, sways and turns slowly on its own clock, over a soft
 * shadow and the odd ripple. The layer scrolls with the page and sits above
 * the koi, so the koi swim under the pads but over the content.
 */
/** Where each pad and petal sits on the page showing now, in px; null hides it. */
type Layout = { pads: (number | null)[]; petals: (number | null)[] }

/**
 * Lays the pads out for the page showing. The main page spends its first
 * screen on the cover; Contact has none, so its pads start at the top. No pad
 * may run past the page's end, where it would be cut off: one that would is
 * moved up to fit. A pad that would then pile onto the one above it on the same
 * side is left out, so a short page shows its first few pads, spaced as usual.
 * The foot pad always shows; if it collides, the pad above gives way instead.
 */
function layout(): Layout {
  const vh = window.innerHeight
  const vw = window.innerWidth
  const end = document.documentElement.scrollHeight
  const contact = document.documentElement.dataset.page === 'contact'
  const shift = contact ? 0.9 : 0
  const start = contact ? 80 : vh + 40
  const pads: (number | null)[] = PADS.map(() => null)
  // The last pad shown on each side, by index into PADS.
  const last: Record<Pad['side'], number | null> = { left: null, right: null }
  const sizeOf = (p: Pad) => Math.min(p.size, vw * 0.46)
  PADS.forEach((p, i) => {
    const size = sizeOf(p)
    const fit = end - size - 24
    const top = p.foot ? fit : Math.min(Math.max(start, (p.at - shift) * vh), fit)
    if (top < start - 1 && !p.foot) return
    const prev = last[p.side]
    // Allow a little overlap (pads crowd in a real pond), not a pile.
    if (prev !== null && top < (pads[prev] as number) + sizeOf(PADS[prev]) * 0.82) {
      if (!p.foot) return
      pads[prev] = null
    }
    pads[i] = top
    last[p.side] = i
  })
  const petals = PETALS.map((p) => {
    // On Contact, petals keep clear of the top bar's MG mark.
    const top = p.fromEnd !== undefined ? end - p.fromEnd : Math.max(contact ? 130 : start - 20, (p.at - shift) * vh)
    return top > end - p.px - 12 ? null : top
  })
  return { pads, petals }
}

export function LilyPads() {
  // The server can't measure, so it renders every pad at its place on the
  // main page; the browser then lays them out for the page actually showing.
  const [placed, setPlaced] = useState<Layout | null>(null)
  useEffect(() => {
    let raf = 0
    const update = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setPlaced(layout()))
    }
    update()
    // The page's height changes with the mode, the page and the window.
    const resize = new ResizeObserver(update)
    resize.observe(document.body)
    const attrs = new MutationObserver(update)
    attrs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-page', 'data-mode'] })
    window.addEventListener('resize', update)
    return () => {
      cancelAnimationFrame(raf)
      resize.disconnect()
      attrs.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [])
  const top = (px: number | null | undefined): Record<string, string> =>
    px === undefined ? {} : px === null ? { display: 'none' } : { '--top': `${Math.round(px)}px` }

  return (
    <div className="lily-pads" aria-hidden="true">
      {PETALS.map((p, i) => (
        <img
          key={`p${i}`}
          className={`lily-petal lily-petal-${p.side}`}
          src="/lily/petal.svg"
          alt=""
          draggable={false}
          style={
            {
              '--at': p.at,
              ...top(placed?.petals[i]),
              '--x': p.x,
              '--px': `${p.px}px`,
              '--spin': `${p.turn}deg`,
              '--drift': `${p.drift}s`,
              '--lag': `${p.lag}s`,
            } as CSSProperties
          }
        />
      ))}
      {PADS.map((p, i) => (
        <div
          key={i}
          className={`lily lily-${p.side}${p.wide ? ' lily-wide' : ''}`}
          style={
            {
              '--at': p.at,
              ...top(placed?.pads[i]),
              '--size': `${p.size}px`,
              '--turn': `${p.turn}deg`,
              '--drift': `${p.drift}s`,
              '--delay': `${-(i * 3.7) % p.drift}s`,
            } as CSSProperties
          }
        >
          <span className="lily-ripple" />
          <span className="lily-shadow" />
          <span className="lily-float">
            <img className="lily-pad" src={`/lily/pad-${p.art}.svg`} alt="" draggable={false} />
            {p.lotus?.map((l, j) => (
              <img
                key={j}
                className="lily-lotus"
                src="/lily/lotus.svg"
                alt=""
                draggable={false}
                style={
                  {
                    '--x': l.x,
                    '--y': l.y,
                    '--f': l.px / p.size,
                    '--spin': `${l.turn ?? 0}deg`,
                    '--lag': `${-(i + j) * 2.3}s`,
                  } as CSSProperties
                }
              />
            ))}
          </span>
        </div>
      ))}
    </div>
  )
}
