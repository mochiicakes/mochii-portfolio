import { useEffect, useRef, useSyncExternalStore, type RefObject } from 'react'
import { revealStore } from '../../lib/htmlState'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { ageWake, makeInk, newWakePt, WakeCanvas, wakeSpacing, type WakeInk, type WakePt } from '../../lib/wake'
import { KOI_TAIL, KOI_TAIL_VEINS, KoiShape } from '../ui/Ornaments'

const SCALE = 0.56 // the 120-unit koi drawn at about 67 px
const MEET = 110 // px between the two koi that counts as meeting
const BACK = 84 * SCALE // px from the koi's centre to where its wake is laid
// The tail, in the koi's own 120 × 48 units: it joins the body at (38, 24)
// and reaches back to x = -24.
const TAIL_X = 38
const TAIL_Y = 24
const TAIL_LEN = 62
const SPINE = 16 // samples along the tail's spine

type Fish = {
  x: number
  y: number
  angle: number
  /** Turning speed, rad/s. Eased, so turns start and end smoothly. */
  av: number
  /** px per 60 Hz frame (the units the steering was tuned in). */
  speed: number
  /** Tail beat: phase accumulates, so a change of pace never jumps the tail. */
  phase: number
  omega: number
  amp: number
  /** The tail's curve into a turn, following the path the body just swam. */
  bend: number
  trail: WakePt[]
}

type Els = {
  body: SVGGElement
  tail: SVGPathElement
  veins: SVGPathElement
  finTop: SVGGElement
  finBottom: SVGGElement
}

type Shape = { ops: { c: string; n: number }[]; xy: number[] }

/** Splits an absolute M/C/Z path into commands and a flat list of coordinates. */
function parse(d: string): Shape {
  const ops: Shape['ops'] = []
  const xy: number[] = []
  for (const m of d.matchAll(/([MCZ])([^MCZ]*)/g)) {
    const vals = m[2].trim() ? m[2].trim().split(/[\s,]+/).map(Number) : []
    ops.push({ c: m[1], n: vals.length / 2 })
    xy.push(...vals)
  }
  return { ops, xy }
}

const TAIL_SHAPE = parse(KOI_TAIL)
const VEIN_SHAPE = parse(KOI_TAIL_VEINS)

const fish = (x: number, y: number, angle: number): Fish => ({
  x,
  y,
  angle,
  av: 0,
  speed: 0,
  phase: Math.random() * 6,
  omega: 5,
  amp: 0.4,
  bend: 0,
  trail: [],
})

/** Eases `a` toward `b` at `rate` per second, the same at any frame rate. */
const ease = (a: number, b: number, rate: number, dt: number) => a + (b - a) * (1 - Math.exp(-rate * dt))
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

/**
 * Steer toward a target the way a fish swims: turn smoothly up to a limited
 * rate, ease the speed, and circle lazily when the target is close. Rates are
 * per 60 Hz frame, scaled by `dt`, so it swims the same on any screen.
 */
function steer(
  f: Fish,
  tx: number,
  ty: number,
  dt: number,
  now: number,
  opts: { turn: number; top: number; idle: number; wake: boolean },
) {
  const k = dt * 60
  const dx = tx - f.x
  const dy = ty - f.y
  const dist = Math.hypot(dx, dy)
  const maxAv = opts.turn * 60
  let wantAv: number
  if (dist < opts.idle) {
    // Close enough: a lazy circle, carrying on the way it was already turning.
    wantAv = Math.sign(f.av || 1) * Math.min(maxAv, 2.4)
  } else {
    const err = Math.atan2(Math.sin(Math.atan2(dy, dx) - f.angle), Math.cos(Math.atan2(dy, dx) - f.angle))
    wantAv = clamp(err * 7, -maxAv, maxAv)
  }
  f.av = ease(f.av, wantAv, 9, dt)
  f.angle += f.av * dt
  const want = dist < opts.idle ? 1.4 : Math.min(opts.top, 1.2 + dist * 0.05)
  f.speed += (want - f.speed) * (1 - Math.pow(1 - 0.07, k))
  f.x += Math.cos(f.angle) * f.speed * k
  f.y += Math.sin(f.angle) * f.speed * k

  // Tail: beat faster and wider with pace, eased so it never snaps.
  const pace = Math.min(f.speed, 11)
  f.omega = ease(f.omega, Math.PI * 2 * (0.7 + pace * 0.09), 3, dt)
  f.amp = ease(f.amp, 0.4 + pace * 0.028, 3, dt)
  f.phase += f.omega * dt
  // On a curve the tail trails along the arc behind: angle ≈ length / radius.
  const tailPx = TAIL_LEN * SCALE
  f.bend = ease(f.bend, -clamp((tailPx * f.av) / Math.max(f.speed * 60, 60), -0.9, 0.9), 6, dt)

  if (opts.wake) {
    const w = 10 + f.speed * 3.4
    const bx = f.x - Math.cos(f.angle) * BACK
    const by = f.y - Math.sin(f.angle) * BACK
    const last = f.trail.at(0)
    if (!last || Math.hypot(bx - last.x, by - last.y) >= wakeSpacing(w)) f.trail.unshift(newWakePt(bx, by, w, now))
  }
  ageWake(f.trail, now)
}

/**
 * Bends a tail path along a spine carrying a travelling wave: the base stays
 * on the body, each point further back lags the beat and swings wider, and the
 * whole tail curves into a turn.
 */
function bend(shape: Shape, f: Fish) {
  const px = new Array<number>(SPINE + 1)
  const py = new Array<number>(SPINE + 1)
  const th = new Array<number>(SPINE + 1)
  const angle = (s: number) => f.amp * Math.sin(f.phase - 2.4 * s) * Math.pow(s, 1.3) + f.bend * s
  px[0] = TAIL_X
  py[0] = TAIL_Y
  th[0] = 0
  const ds = 1 / SPINE
  for (let i = 0; i < SPINE; i++) {
    const a = angle((i + 0.5) * ds)
    px[i + 1] = px[i] - Math.cos(a) * TAIL_LEN * ds
    py[i + 1] = py[i] - Math.sin(a) * TAIL_LEN * ds
    th[i + 1] = angle((i + 1) * ds)
  }
  let d = ''
  let j = 0
  for (const op of shape.ops) {
    d += op.c
    for (let n = 0; n < op.n; n++, j += 2) {
      const x = shape.xy[j]
      const y = shape.xy[j + 1]
      const s = clamp((TAIL_X - x) / TAIL_LEN, 0, 1) * SPINE
      const i = Math.min(SPINE - 1, Math.floor(s))
      const t = s - i
      const sx = px[i] + (px[i + 1] - px[i]) * t
      const sy = py[i] + (py[i + 1] - py[i]) * t
      const a = th[i] + (th[i + 1] - th[i]) * t
      const off = y - TAIL_Y
      d += `${n ? ' ' : ''}${(sx - Math.sin(a) * off).toFixed(1)} ${(sy + Math.cos(a) * off).toFixed(1)}`
    }
  }
  return d
}

function paint(f: Fish, el: Els) {
  el.tail.setAttribute('d', bend(TAIL_SHAPE, f))
  el.veins.setAttribute('d', bend(VEIN_SHAPE, f))
  // The body yaws a little against the tail beat, as a swimming fish does.
  const yaw = Math.sin(f.phase + Math.PI) * 2.5 * (f.amp / 0.5)
  const deg = (f.angle * 180) / Math.PI + yaw
  el.body.setAttribute(
    'transform',
    `translate(${f.x.toFixed(1)} ${f.y.toFixed(1)}) rotate(${deg.toFixed(1)}) scale(${SCALE}) translate(-60 -24)`,
  )
  // Pectoral fins paddle when slow and fold back when fast.
  const fast = Math.min(1, f.speed / 8)
  const fin = -fast * 14 + Math.sin(f.phase * 0.5) * 6 * (1 - fast)
  el.finTop.setAttribute('transform', `rotate(${fin.toFixed(1)} 80 13.5)`)
  el.finBottom.setAttribute('transform', `rotate(${(-fin).toFixed(1)} 80 34.5)`)
}

type Refs = { [K in keyof Els]: RefObject<Els[K] | null> }

/** The live elements of one koi, once they are all mounted. */
function resolve(r: Refs): Els | null {
  const { body, tail, veins, finTop, finBottom } = r
  if (!body.current || !tail.current || !veins.current || !finTop.current || !finBottom.current) return null
  return { body: body.current, tail: tail.current, veins: veins.current, finTop: finTop.current, finBottom: finBottom.current }
}

/**
 * Your koi follows the cursor, leaving a watercolour wake. A second, golden
 * koi waits at the lower left of the open page's last screen (.koi-home). When yours swims close, the
 * two meet: from then on the golden one follows yours closely, circling it so
 * their wakes braid. Fine pointers only; off under reduced motion.
 */
export function CursorKoi() {
  const revealed = useSyncExternalStore(revealStore.subscribe, revealStore.get, revealStore.getServer)
  const reduced = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const wakeRef = useRef<HTMLCanvasElement>(null)
  const mateRef = useRef<SVGGElement>(null)
  const leadBody = useRef<SVGGElement>(null)
  const leadTail = useRef<SVGPathElement>(null)
  const leadVeins = useRef<SVGPathElement>(null)
  const leadFinTop = useRef<SVGGElement>(null)
  const leadFinBottom = useRef<SVGGElement>(null)
  const mateBody = useRef<SVGGElement>(null)
  const mateTail = useRef<SVGPathElement>(null)
  const mateVeins = useRef<SVGPathElement>(null)
  const mateFinTop = useRef<SVGGElement>(null)
  const mateFinBottom = useRef<SVGGElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const mateGroup = mateRef.current
    const wakeCanvas = wakeRef.current
    if (!revealed || reduced || !root || !mateGroup || !wakeCanvas) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    const leadEl = resolve({
      body: leadBody,
      tail: leadTail,
      veins: leadVeins,
      finTop: leadFinTop,
      finBottom: leadFinBottom,
    })
    const mateEl = resolve({
      body: mateBody,
      tail: mateTail,
      veins: mateVeins,
      finTop: mateFinTop,
      finBottom: mateFinBottom,
    })
    if (!leadEl || !mateEl) return
    let wake: WakeCanvas
    try {
      wake = new WakeCanvas(wakeCanvas)
    } catch {
      return
    }
    const leadInk: WakeInk = makeInk([247, 80, 62], [186, 38, 24])
    const mateInk: WakeInk = makeInk([251, 226, 140], [226, 160, 48])
    // Each page's last screen has a home; wait at the one that is showing.
    const findHome = () => [...document.querySelectorAll<HTMLElement>('.koi-home')].find((h) => h.getClientRects().length > 0)

    let tx = window.innerWidth / 2
    let ty = window.innerHeight / 2
    let seen = false
    let met = false
    let mateShown = false
    let orbit = 0
    let raf = 0
    let last = 0
    const a = fish(tx, ty + 120, -Math.PI / 2)
    const b = fish(0, 0, Math.PI)

    const frame = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60
      last = now
      steer(a, tx, ty, dt, now, { turn: 0.09, top: 11, idle: 70, wake: seen })
      if (seen) paint(a, leadEl)

      if (met) {
        // Circle the lead koi, close enough that the wakes cross.
        orbit += 2.7 * dt
        steer(b, a.x + Math.cos(orbit) * 38, a.y + Math.sin(orbit) * 38, dt, now, {
          turn: 0.14,
          top: a.speed + 4,
          idle: 0,
          wake: true,
        })
        paint(b, mateEl)
      } else if (findHome()) {
        const box = findHome()!.getBoundingClientRect()
        const near = box.top < window.innerHeight + 80 && box.bottom > -80
        if (near) {
          const hx = box.left + box.width / 2
          const hy = box.top + box.height / 2
          if (!mateShown) {
            mateShown = true
            b.x = hx + 70
            b.y = hy
            b.trail.length = 0
            mateGroup.classList.add('is-on')
          }
          // Waiting: a slow loop around home.
          orbit += 0.72 * dt
          steer(b, hx + Math.cos(orbit) * 80, hy + Math.sin(orbit) * 36, dt, now, {
            turn: 0.05,
            top: 2.4,
            idle: 0,
            wake: true,
          })
          paint(b, mateEl)
          if (seen && Math.hypot(b.x - a.x, b.y - a.y) < MEET) {
            met = true
            root.classList.add('is-met')
          }
        } else if (mateShown) {
          mateShown = false
          b.trail.length = 0
          mateGroup.classList.remove('is-on')
        }
      }

      wake.clear()
      if (mateShown || met) wake.draw(b.trail, mateInk, now)
      wake.draw(a.trail, leadInk, now)

      // Nothing to show once the pointer has gone and the wakes have dried.
      if (!seen && a.trail.length === 0 && b.trail.length === 0) {
        raf = 0
        last = 0
        return
      }
      raf = requestAnimationFrame(frame)
    }
    const start = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      tx = e.clientX
      ty = e.clientY
      if (!seen) {
        seen = true
        a.x = tx - 60
        a.y = ty + 40
        a.trail.length = 0
        root.classList.add('is-on')
      }
      start()
    }
    const onLeave = () => {
      seen = false
      root.classList.remove('is-on')
      a.trail.length = 0
    }
    const onResize = () => wake.size()

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('resize', onResize)
    document.documentElement.addEventListener('pointerleave', onLeave)
    start()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('resize', onResize)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      root.classList.remove('is-on', 'is-met')
      mateGroup.classList.remove('is-on')
      wake.clear()
    }
  }, [revealed, reduced])

  return (
    <div ref={rootRef} className="cursor-koi" aria-hidden="true">
      <canvas ref={wakeRef} className="koi-wake" />
      <svg className="koi-svg">
        <g ref={mateRef} className="koi-mate">
          <g ref={mateBody}>
            <KoiShape
              pattern="ogon"
              tailRef={mateTail}
              veinsRef={mateVeins}
              finTopRef={mateFinTop}
              finBottomRef={mateFinBottom}
            />
          </g>
        </g>
        <g className="koi-lead">
          <g ref={leadBody}>
            <KoiShape
              pattern="kohaku"
              tailRef={leadTail}
              veinsRef={leadVeins}
              finTopRef={leadFinTop}
              finBottomRef={leadFinBottom}
            />
          </g>
        </g>
      </svg>
    </div>
  )
}
