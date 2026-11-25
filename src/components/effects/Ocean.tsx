import { useCallback, useEffect, useRef, useSyncExternalStore, type CSSProperties } from 'react'
import { drawBloom, type BloomPaletteName, type BloomSpec } from '../../lib/bloom'
import { depthAt } from '../../lib/depth'
import { markReady } from '../../lib/loading'
import { useReducedMotion } from '../../lib/useReducedMotion'
import LightRays from './LightRays'

const COARSE = '(pointer: coarse)'
const coarse = {
  subscribe: () => () => {},
  get: () => window.matchMedia(COARSE).matches,
  getServer: () => false,
}

/** Bubbles: where across, size (px), seconds to rise, and a head start. */
const BUBBLES = [
  [6, 5, 26, 3],
  [17, 3, 34, 19],
  [28, 7, 30, 11],
  [41, 3, 38, 27],
  [57, 4, 28, 8],
  [66, 6, 33, 22],
  [78, 3, 36, 15],
  [87, 5, 25, 5],
  [95, 4, 31, 25],
] as const

type Layer = 'near' | 'mid' | 'far'
type Bloom = {
  layer: Layer
  /** Where across (vw) and down (vh, over the layer's whole travel). */
  x: number
  y: number
  /** Against the 900 px drawing. */
  size: number
  /** Left out on touch screens. */
  small?: boolean
  touchAt?: [number, number]
  spec: BloomSpec
}

/** Kinds of bloom: wide open, seen from the side, feathery, and a closed bud. */
const open = (seed: number, turn: number, membranes = 5): BloomSpec => ({ seed, r: 210, membranes, turn, tendrils: 5 })
const side = (seed: number, turn: number): BloomSpec => ({ seed, r: 235, membranes: 5, turn, tendrils: 6, arc: 2.5 })
const feather = (seed: number, turn: number): BloomSpec => ({
  seed,
  r: 205,
  membranes: 11,
  turn,
  tendrils: 5,
  width: 0.42,
})
const bud = (seed: number, turn: number): BloomSpec => ({
  seed,
  r: 250,
  membranes: 4,
  turn,
  tendrils: 5,
  arc: 1.15,
  width: 0.8,
})

/**
 * The blooms, in three layers. Near ones are huge, soft and cut by the window's
 * edges; far ones are small and dim. Nearer layers travel further as the page
 * goes down, which is what makes the water deep.
 */
const BLOOMS: Bloom[] = [
  // Near: in front, out of focus.
  { layer: 'near', x: -3, y: 88, size: 2, touchAt: [-14, 78], spec: side(4, -0.7) },
  { layer: 'near', x: 106, y: 152, size: 2.3, spec: open(31, -2.4) },
  { layer: 'near', x: -6, y: 226, size: 2.1, small: true, spec: feather(52, 0.4) },
  { layer: 'near', x: 104, y: 305, size: 2.2, spec: side(64, 3.4) },

  // Middle: in focus.
  { layer: 'mid', x: 27.5, y: 24, size: 0.96, touchAt: [96, 46], spec: open(11, -1.9) },
  { layer: 'mid', x: 79, y: 82, size: 0.74, small: true, spec: feather(8, 2.4) },
  { layer: 'mid', x: 12, y: 128, size: 0.86, spec: bud(27, -1.1) },
  { layer: 'mid', x: 84, y: 186, size: 0.66, small: true, spec: side(17, -2.2) },
  { layer: 'mid', x: 15, y: 222, size: 0.95, small: true, spec: open(42, 2.9, 6) },

  // Far: smaller and smaller, fading into the dark.
  { layer: 'far', x: 72, y: 11, size: 0.42, touchAt: [10, 26], spec: open(23, 0.4, 4) },
  { layer: 'far', x: 64, y: 58, size: 0.26, spec: bud(35, -1.8) },
  { layer: 'far', x: 95, y: 62, size: 0.19, small: true, spec: feather(71, 1) },
  { layer: 'far', x: 22, y: 60, size: 0.2, spec: side(83, -2.6) },
  { layer: 'far', x: 46, y: 88, size: 0.14, small: true, spec: open(19, 1.2) },
  { layer: 'far', x: 5, y: 33, size: 0.15, small: true, spec: bud(90, -0.6) },
  { layer: 'far', x: 88, y: 104, size: 0.3, spec: open(58, -0.9, 6) },
  { layer: 'far', x: 30, y: 122, size: 0.24, spec: feather(66, 2) },
  { layer: 'far', x: 70, y: 138, size: 0.17, small: true, spec: side(77, 0.6) },
]

/** How finely each layer is drawn: near ones are stretched and blurred a little (glass.css). */
const DETAIL: Record<Layer, number> = { near: 1, mid: 1.1, far: 0.45 }

/** Trying the other palette, on the local site only: add ?flowers=coral to the address. */
function palette(): BloomPaletteName {
  const name = import.meta.env.DEV ? new URLSearchParams(location.search).get('flowers') : null
  return name === 'coral' ? 'coral' : 'ice'
}

/** One bloom, drawn once, a moment after the page opens. */
function BloomCanvas({
  layer,
  x,
  y,
  size,
  spec,
  touchAt,
  touch,
  i,
  onDrawn,
}: Bloom & { touch: boolean; i: number; onDrawn: (i: number) => void }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const timer = window.setTimeout(
      () => {
        if (!ref.current) return
        drawBloom(ref.current, spec, DETAIL[layer] * (touch ? 0.6 : 1), palette())
        onDrawn(i)
      },
      60 + i * 60,
    )
    return () => window.clearTimeout(timer)
  }, [spec, layer, touch, i, onDrawn])
  return (
    <span
      className="ocean-bloom"
      style={
        {
          '--x': `${touch && touchAt ? touchAt[0] : x}vw`,
          '--y': `${touch && touchAt ? touchAt[1] : y}vh`,
          '--size': size,
          '--i': i,
        } as CSSProperties
      }
    >
      <canvas ref={ref} />
    </span>
  )
}

/**
 * The page's ground: ocean, brightest at the surface and darkest at the bottom
 * of the page. Light rays fan down from the top and fade with depth; specks,
 * bubbles and glowing blooms drift in it. Still under reduced motion.
 */
export function Ocean() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const touch = useSyncExternalStore(coarse.subscribe, coarse.get, coarse.getServer)

  // The loading screen waits for the flowers, and for the rays' first frames.
  const drawn = useRef(new Set<number>())
  const onDrawn = useCallback(
    (i: number) => {
      drawn.current.add(i)
      if (drawn.current.size >= BLOOMS.filter((b) => !(touch && b.small)).length) markReady('flowers')
    },
    [touch],
  )
  useEffect(() => {
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => markReady('light'))
    })
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    let raf = 0
    const set = () => {
      raf = 0
      const depth = depthAt(window.scrollY, document.documentElement.scrollHeight, window.innerHeight)
      ref.current?.style.setProperty('--depth', depth.toFixed(3))
    }
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(set)
    }
    set()
    // The page's height changes with the mode, the page and the open tab.
    const ro = new ResizeObserver(queue)
    ro.observe(document.body)
    window.addEventListener('scroll', queue, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('scroll', queue)
    }
  }, [])

  return (
    <div ref={ref} className="ocean" aria-hidden="true">
      <div className="ocean-deep" />
      <div className="ocean-rays">
        <LightRays
          raysColor="#cfe4f4"
          raysSpeed={reduced ? 0 : 0.6}
          lightSpread={0.7}
          rayLength={1.6}
          raySharpness={0.45}
          glow={0.3}
          haze={0.3}
          followMouse={!reduced}
          cursorShadow={false}
          clickPulse={!reduced}
          intro={false}
          maxDevicePixelRatio={touch ? 0.6 : 1}
        />
      </div>
      {(['far', 'mid', 'near'] as const).map((layer) => (
        <div key={layer} className={`ocean-blooms ocean-${layer}`}>
          {BLOOMS.map((b, i) =>
            b.layer !== layer || (touch && b.small) ? null : (
              <BloomCanvas key={b.spec.seed} {...b} touch={touch} i={i} onDrawn={onDrawn} />
            ),
          )}
        </div>
      ))}
      <div className="ocean-snow" />
      <div className="ocean-snow ocean-snow-far" />
      {BUBBLES.map(([x, size, rise, lead]) => (
        <span
          key={x}
          className="ocean-bubble"
          style={{ '--x': `${x}%`, '--s': `${size}px`, '--rise': `${rise}s`, '--lead': `-${lead}s` } as CSSProperties}
        />
      ))}
    </div>
  )
}
