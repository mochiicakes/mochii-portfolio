import { useEffect, useRef, useSyncExternalStore } from 'react'
import { revealStore } from '../../lib/htmlState'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { KoiShape } from '../ui/Ornaments'

const SCALE = 0.56 // the 120-unit koi drawn at about 67 px
const TRAIL = 66
const MEET = 110 // px between the two koi that counts as meeting

type Pt = { x: number; y: number; w: number }

type Fish = {
  x: number
  y: number
  angle: number
  speed: number
  trail: Pt[]
}

type Els = { ink: SVGPathElement; core: SVGPathElement; body: SVGGElement; tail: SVGGElement }

/**
 * Steer toward a target the way a fish swims: turn at a limited rate, ease the
 * speed, and circle lazily when the target is close.
 */
function steer(f: Fish, tx: number, ty: number, opts: { turn: number; top: number; idle: number }) {
  const dx = tx - f.x
  const dy = ty - f.y
  const dist = Math.hypot(dx, dy)
  let desired = Math.atan2(dy, dx)
  if (dist < opts.idle) desired = f.angle + 0.05
  const turn = Math.atan2(Math.sin(desired - f.angle), Math.cos(desired - f.angle))
  f.angle += Math.max(-opts.turn, Math.min(opts.turn, turn))
  const want = dist < opts.idle ? 1.4 : Math.min(opts.top, 1.2 + dist * 0.05)
  f.speed += (want - f.speed) * 0.07
  f.x += Math.cos(f.angle) * f.speed
  f.y += Math.sin(f.angle) * f.speed
  const back = 84 * SCALE
  f.trail.unshift({ x: f.x - Math.cos(f.angle) * back, y: f.y - Math.sin(f.angle) * back, w: 10 + f.speed * 3.4 })
  if (f.trail.length > TRAIL) f.trail.length = TRAIL
  if (f.speed < 2 && f.trail.length > 14) f.trail.length -= 1
}

/** The wake: a ribbon whose width follows the speed it was laid at. */
function ribbon(pts: Pt[], k: number, t: number) {
  if (pts.length < 3) return ''
  const left: string[] = []
  const right: string[] = []
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)]
    const b = pts[Math.min(pts.length - 1, i + 1)]
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1
    const nx = -(b.y - a.y) / len
    const ny = (b.x - a.x) / len
    const taper = Math.pow(1 - i / pts.length, 0.7)
    const wobble = 1 + Math.sin(i * 0.8 + t * 0.12) * 0.12
    const hw = (pts[i].w * taper * wobble * k) / 2
    left.push(`${(pts[i].x + nx * hw).toFixed(1)} ${(pts[i].y + ny * hw).toFixed(1)}`)
    right.push(`${(pts[i].x - nx * hw).toFixed(1)} ${(pts[i].y - ny * hw).toFixed(1)}`)
  }
  return `M${left.join('L')}L${right.reverse().join('L')}Z`
}

function paint(f: Fish, el: Els, t: number) {
  el.ink.setAttribute('d', ribbon(f.trail, 1, t))
  el.core.setAttribute('d', ribbon(f.trail, 0.42, t))
  const deg = (f.angle * 180) / Math.PI
  el.body.setAttribute(
    'transform',
    `translate(${f.x.toFixed(1)} ${f.y.toFixed(1)}) rotate(${deg.toFixed(1)}) scale(${SCALE}) translate(-60 -24)`,
  )
  const sway = Math.sin(t * (0.12 + f.speed * 0.025)) * (13 + f.speed * 2)
  el.tail.setAttribute('transform', `rotate(${sway.toFixed(1)} 38 24)`)
}

/**
 * Your koi follows the cursor. A second, golden koi waits at the bottom of the
 * page (#koi-home). When yours swims close, the two meet: from then on the
 * golden one follows yours closely, circling it so their wakes braid.
 * Fine pointers only; off under reduced motion.
 */
export function CursorKoi() {
  const revealed = useSyncExternalStore(revealStore.subscribe, revealStore.get, revealStore.getServer)
  const reduced = useReducedMotion()
  const svgRef = useRef<SVGSVGElement>(null)
  const leadInk = useRef<SVGPathElement>(null)
  const leadCore = useRef<SVGPathElement>(null)
  const leadBody = useRef<SVGGElement>(null)
  const leadTail = useRef<SVGGElement>(null)
  const mateInk = useRef<SVGPathElement>(null)
  const mateCore = useRef<SVGPathElement>(null)
  const mateBody = useRef<SVGGElement>(null)
  const mateTail = useRef<SVGGElement>(null)
  const mateRef = useRef<SVGGElement>(null)

  useEffect(() => {
    const svg = svgRef.current
    const mateGroup = mateRef.current
    if (!revealed || reduced || !svg || !mateGroup) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (!leadInk.current || !leadCore.current || !leadBody.current || !leadTail.current) return
    if (!mateInk.current || !mateCore.current || !mateBody.current || !mateTail.current) return
    const leadEl: Els = { ink: leadInk.current, core: leadCore.current, body: leadBody.current, tail: leadTail.current }
    const mateEl: Els = { ink: mateInk.current, core: mateCore.current, body: mateBody.current, tail: mateTail.current }
    const home = document.getElementById('koi-home')

    let tx = window.innerWidth / 2
    let ty = window.innerHeight / 2
    let seen = false
    let met = false
    let mateShown = false
    let phase = 0
    let t = 0
    let raf = 0
    const lead: Fish = { x: tx, y: ty + 120, angle: -Math.PI / 2, speed: 0, trail: [] }
    const mate: Fish = { x: 0, y: 0, angle: Math.PI, speed: 0, trail: [] }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      tx = e.clientX
      ty = e.clientY
      if (!seen) {
        seen = true
        lead.x = tx - 60
        lead.y = ty + 40
        svg.classList.add('is-on')
      }
    }
    const onLeave = () => {
      seen = false
      svg.classList.remove('is-on')
      lead.trail.length = 0
    }

    const frame = () => {
      t++
      steer(lead, tx, ty, { turn: 0.09, top: 11, idle: 70 })
      if (seen) paint(lead, leadEl, t)

      if (met) {
        // Circle the lead koi, close enough that the wakes cross.
        phase += 0.045
        const ox = Math.cos(phase) * 38
        const oy = Math.sin(phase) * 38
        steer(mate, lead.x + ox, lead.y + oy, { turn: 0.14, top: lead.speed + 4, idle: 0 })
        paint(mate, mateEl, t)
      } else if (home) {
        const box = home.getBoundingClientRect()
        const near = box.top < window.innerHeight + 80 && box.bottom > -80
        if (near) {
          const hx = box.left + box.width / 2
          const hy = box.top + box.height / 2
          if (!mateShown) {
            mateShown = true
            mate.x = hx + 70
            mate.y = hy
            mate.trail.length = 0
            mateGroup.classList.add('is-on')
          }
          // Waiting: a slow loop around home.
          phase += 0.012
          steer(mate, hx + Math.cos(phase) * 80, hy + Math.sin(phase) * 36, { turn: 0.05, top: 2.4, idle: 0 })
          paint(mate, mateEl, t)
          if (seen && Math.hypot(mate.x - lead.x, mate.y - lead.y) < MEET) {
            met = true
            svg.classList.add('is-met')
          }
        } else if (mateShown) {
          mateShown = false
          mateGroup.classList.remove('is-on')
        }
      }
      raf = requestAnimationFrame(frame)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      svg.classList.remove('is-on', 'is-met')
      mateGroup.classList.remove('is-on')
    }
  }, [revealed, reduced])

  return (
    <svg ref={svgRef} className="cursor-koi" aria-hidden="true">
      <g ref={mateRef} className="koi-mate">
        <path ref={mateInk} className="wake-ink" />
        <path ref={mateCore} className="wake-core wake-gold" />
        <g ref={mateBody}>
          <KoiShape pattern="ogon" tailRef={mateTail} />
        </g>
      </g>
      <g className="koi-lead">
        <path ref={leadInk} className="wake-ink" />
        <path ref={leadCore} className="wake-core" />
        <g ref={leadBody}>
          <KoiShape pattern="kohaku" tailRef={leadTail} />
        </g>
      </g>
    </svg>
  )
}
