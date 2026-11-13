import type { CSSProperties } from 'react'

/**
 * A lotus on a pad. `x` is measured inward from the pad's inner edge (the side
 * facing the content, which always shows) and `y` from its top, both as a share
 * of the pad's width. `px` is its width on a full-size pad; it scales with it.
 */
type Lotus = { x: number; y: number; px: number; turn?: number }

type Pad = {
  side: 'left' | 'right'
  /** Down the page, as a share of its height (the cover is always skipped). */
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
}

// Big pads, alternating sides, each a little different. Art: public/lily/.
const PADS: Pad[] = [
  {
    side: 'left',
    at: 0.15,
    size: 820,
    art: 'a',
    turn: 25,
    drift: 19,
    lotus: [
      { x: 0.08, y: 0.24, px: 190 },
      { x: 0.2, y: 0.5, px: 110, turn: 40 },
    ],
  },
  { side: 'right', at: 0.22, size: 720, art: 'b', turn: 200, drift: 23 },
  { side: 'left', at: 0.32, size: 480, art: 'c', turn: 290, drift: 17, lotus: [{ x: 0.08, y: 0.32, px: 150 }] },
  {
    side: 'right',
    at: 0.4,
    size: 860,
    art: 'a',
    turn: 140,
    drift: 26,
    lotus: [
      { x: 0.08, y: 0.26, px: 200 },
      { x: 0.06, y: 0.54, px: 120, turn: 70 },
    ],
  },
  { side: 'left', at: 0.5, size: 740, art: 'b', turn: 70, drift: 21 },
  { side: 'right', at: 0.6, size: 500, art: 'c', turn: 320, drift: 18, lotus: [{ x: 0.07, y: 0.34, px: 150 }] },
  { side: 'left', at: 0.68, size: 560, art: 'c', turn: 160, drift: 24, lotus: [{ x: 0.08, y: 0.3, px: 140 }], wide: true },
  { side: 'right', at: 0.78, size: 760, art: 'b', turn: 40, drift: 22 },
  { side: 'left', at: 0.87, size: 520, art: 'a', turn: 230, drift: 16, lotus: [{ x: 0.07, y: 0.36, px: 160 }] },
  { side: 'right', at: 0.94, size: 660, art: 'a', turn: 100, drift: 20, lotus: [{ x: 0.08, y: 0.26, px: 180 }] },
]

type Petal = { side: 'left' | 'right'; at: number; x: number; px: number; turn: number; drift: number; lag: number }

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
      const at = 0.12 + (0.86 * (i + rand())) / 13
      const x = 0.08 + rand() * 0.84
      const n = 1 + Math.floor(rand() * 3)
      for (let j = 0; j < n; j++) {
        out.push({
          side,
          at: at + (j ? (rand() - 0.5) * 0.012 : 0),
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
    { side: 'left', at: 0.956, x: 0.22, px: 34, turn: 40, drift: 13, lag: -3 },
    { side: 'left', at: 0.963, x: 0.36, px: 26, turn: 200, drift: 11, lag: -9 },
    { side: 'left', at: 0.972, x: 0.58, px: 38, turn: 300, drift: 15, lag: -5 },
    { side: 'left', at: 0.981, x: 0.3, px: 24, turn: 120, drift: 12, lag: -12 },
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
export function LilyPads() {
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
              '--at': `${p.at * 100}%`,
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
              '--at': `${p.at * 100}%`,
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
