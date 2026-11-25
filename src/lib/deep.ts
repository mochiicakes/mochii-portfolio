// The dark over the page, and the light that opens it.
//
// Layers, top to bottom: the prompt, the glow (trail, plankton and specks), the
// dark water, then the page. Dragging wears soft, round holes in the dark, so
// the page shows through, and stirs up plankton that glows, drifts and fades.
// Past the threshold the light spreads from the visitor's own strokes until the
// dark is gone, and both canvases are removed with it.

const COLS = 24
const ROWS = 14
const SPRITE = 128
/** How much dark one stamp of a stroke clears; overlaps build to a clear hole. */
const STROKE_ALPHA = 0.34
const MAX_PLANKTON = 420
const MAX_TRAIL = 140
const TRAIL_MS = 1100
const SPECKS = 46

/** Which parts of the window have been lit, on a coarse grid. */
export class Coverage {
  private cells = new Uint8Array(COLS * ROWS)
  private lit = 0

  /** Lights every cell whose middle is within `r` of (x, y), in a window of w × h. */
  mark(x: number, y: number, r: number, w: number, h: number) {
    const cw = w / COLS
    const ch = h / ROWS
    const c0 = Math.max(0, Math.floor((x - r) / cw))
    const c1 = Math.min(COLS - 1, Math.floor((x + r) / cw))
    const r0 = Math.max(0, Math.floor((y - r) / ch))
    const r1 = Math.min(ROWS - 1, Math.floor((y + r) / ch))
    for (let row = r0; row <= r1; row++) {
      for (let col = c0; col <= c1; col++) {
        const k = row * COLS + col
        if (this.cells[k]) continue
        if (Math.hypot((col + 0.5) * cw - x, (row + 0.5) * ch - y) <= r) {
          this.cells[k] = 1
          this.lit++
        }
      }
    }
  }

  get share() {
    return this.lit / this.cells.length
  }

  /** The middles of the lit cells, as shares of the window. */
  sources(): [number, number][] {
    const out: [number, number][] = []
    this.cells.forEach((on, k) => {
      if (on) out.push([((k % COLS) + 0.5) / COLS, (Math.floor(k / COLS) + 0.5) / ROWS])
    })
    return out
  }
}

/**
 * Where the light goes when the rest of the dark opens: a grid of points,
 * nearest the strokes first. With no strokes it spreads from the middle.
 */
export function spread(sources: [number, number][], w: number, h: number, cell: number, random = Math.random) {
  const from = sources.length ? sources.map(([x, y]) => [x * w, y * h]) : [[w / 2, h / 2]]
  const points: { x: number; y: number; far: number }[] = []
  for (let y = cell * 0.4; y < h + cell * 0.5; y += cell) {
    for (let x = cell * 0.4; x < w + cell * 0.5; x += cell) {
      const px = x + (random() - 0.5) * cell * 0.5
      const py = y + (random() - 0.5) * cell * 0.5
      const near = Math.min(...from.map(([sx, sy]) => Math.hypot(px - sx, py - sy)))
      points.push({ x: px, y: py, far: near + random() * cell * 0.6 })
    }
  }
  return points.sort((a, b) => a.far - b.far)
}

type Options = {
  /** Reduced motion: no glow, specks or plankton. */
  still?: boolean
  onProgress?: (share: number) => void
  onThreshold?: () => void
  threshold?: number
}

type Trail = { x: number; y: number; r: number; born: number }
type Plankton = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  born: number
  life: number
  phase: number
}
type Speck = { x: number; y: number; size: number; phase: number; rate: number }

/** A soft round light. `core` is how far out it stays near full strength. */
function lightSprite(color: string, core: number) {
  const c = document.createElement('canvas')
  c.width = c.height = SPRITE
  const ctx = c.getContext('2d')
  if (!ctx) return c
  const mid = SPRITE / 2
  const g = ctx.createRadialGradient(mid, mid, 0, mid, mid, mid)
  g.addColorStop(0, `rgb(${color} / 1)`)
  g.addColorStop(core, `rgb(${color} / 0.62)`)
  g.addColorStop(core + (1 - core) * 0.5, `rgb(${color} / 0.16)`)
  g.addColorStop(1, `rgb(${color} / 0)`)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, SPRITE, SPRITE)
  return c
}

function layer(host: HTMLElement) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D is not available')
  host.append(canvas)
  return { canvas, ctx }
}

export class DeepMask {
  private host: HTMLElement
  private dark: ReturnType<typeof layer>
  private glow: ReturnType<typeof layer>
  private hole = lightSprite('0 0 0', 0.45)
  private ice = lightSprite('150 214 240', 0.12)
  private white = lightSprite('226 246 255', 0.2)
  private opts: Options
  private threshold: number
  private coverage = new Coverage()
  private w = 0
  private h = 0
  private listening = false
  /** The light is on the water: a button, finger or pen is held down. */
  private down = false
  private hover: { x: number; y: number } | null = null
  private smooth: { x: number; y: number } | null = null
  private last: { x: number; y: number } | null = null
  private trail: Trail[] = []
  private plankton: Plankton[] = []
  private specks: Speck[] = []
  private opening: {
    points: ReturnType<typeof spread>
    cell: number
    start: number
    ms: number
    done: number
    end: () => void
  } | null = null
  private raf = 0
  private before = 0
  private teardown: () => void = () => {}

  constructor(host: HTMLElement, opts: Options = {}) {
    this.host = host
    this.opts = opts
    this.threshold = opts.threshold ?? 0.32
    this.dark = layer(host)
    this.glow = layer(host)
    for (let i = 0; i < SPECKS; i++) {
      this.specks.push({
        x: Math.random(),
        y: Math.random(),
        size: 1 + Math.random() * 2.4,
        phase: Math.random() * 6.3,
        rate: 0.4 + Math.random() * 0.9,
      })
    }
    this.size()
    host.dataset.ready = ''

    const onDown = (e: PointerEvent) => this.press(e)
    const onMove = (e: PointerEvent) => this.move(e)
    const onUp = () => this.release()
    const onResize = () => this.size()
    // Not passive: pressing must not start a text selection or an image drag.
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    window.addEventListener('pointercancel', onUp, { passive: true })
    window.addEventListener('blur', onUp)
    window.addEventListener('resize', onResize)
    this.teardown = () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      window.removeEventListener('blur', onUp)
      window.removeEventListener('resize', onResize)
    }
    if (!opts.still) this.raf = requestAnimationFrame(this.frame)
  }

  destroy() {
    cancelAnimationFrame(this.raf)
    this.teardown()
    this.teardown = () => {}
    this.dark.canvas.remove()
    this.glow.canvas.remove()
  }

  listen() {
    this.listening = true
  }

  /** Sizes both canvases to the window, keeping any holes already opened. */
  private size() {
    const { canvas, ctx } = this.dark
    let old: HTMLCanvasElement | null = null
    if (this.w > 0) {
      old = document.createElement('canvas')
      old.width = canvas.width
      old.height = canvas.height
      old.getContext('2d')?.drawImage(canvas, 0, 0)
    }
    this.w = window.innerWidth
    this.h = window.innerHeight
    for (const c of [canvas, this.glow.canvas]) {
      c.width = this.w
      c.height = this.h
    }
    if (old) {
      ctx.globalCompositeOperation = 'copy'
      ctx.drawImage(old, 0, 0, this.w, this.h)
      ctx.globalCompositeOperation = 'source-over'
      return
    }
    // A little blue at the top, where the surface is, black below.
    const g = ctx.createLinearGradient(0, 0, 0, this.h)
    g.addColorStop(0, '#060d16')
    g.addColorStop(0.45, '#020408')
    g.addColorStop(1, '#010204')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, this.w, this.h)
  }

  private reach() {
    return Math.max(62, Math.min(this.w, this.h) * 0.115)
  }

  /** Opens one soft round patch of the dark. */
  private open(x: number, y: number, r: number, alpha: number) {
    const { ctx } = this.dark
    ctx.globalCompositeOperation = 'destination-out'
    ctx.globalAlpha = alpha
    ctx.drawImage(this.hole, x - r, y - r, r * 2, r * 2)
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
  }

  /** Stirs up plankton round (x, y), carried along by (vx, vy) in px a second. */
  private stir(x: number, y: number, r: number, count: number, vx = 0, vy = 0) {
    if (this.opts.still) return
    const now = performance.now()
    for (let i = 0; i < count && this.plankton.length < MAX_PLANKTON; i++) {
      const a = Math.random() * Math.PI * 2
      const d = Math.sqrt(Math.random()) * r
      const push = 8 + Math.random() * 46
      this.plankton.push({
        x: x + Math.cos(a) * d,
        y: y + Math.sin(a) * d,
        vx: vx * 0.12 + Math.cos(a) * push,
        vy: vy * 0.12 + Math.sin(a) * push,
        size: 1.6 + Math.random() ** 2 * 5,
        born: now,
        life: 1100 + Math.random() * 1900,
        phase: Math.random() * 6.3,
      })
    }
  }

  private leave(x: number, y: number, r: number) {
    if (this.opts.still) return
    this.trail.push({ x, y, r, born: performance.now() })
    if (this.trail.length > MAX_TRAIL) this.trail.shift()
  }

  /** The light touches the water: a single click leaves one glow. */
  private press(e: PointerEvent) {
    if (!this.listening || e.button !== 0) return
    // Leave the Enter button and other controls clickable.
    if (e.target instanceof Element && e.target.closest('button, a, input, label')) return
    e.preventDefault()
    const { clientX: x, clientY: y } = e
    this.down = true
    this.hover = this.smooth = this.last = { x, y }
    const r = this.reach()
    this.open(x, y, r, 0.9)
    this.leave(x, y, r)
    this.stir(x, y, r * 0.6, 14)
    this.coverage.mark(x, y, r * 0.5, this.w, this.h)
    this.progress()
  }

  private release() {
    this.down = false
    this.smooth = this.last = null
  }

  private move(e: PointerEvent) {
    if (!this.listening) return
    this.hover = { x: e.clientX, y: e.clientY }
    if (!this.down) return
    // Lights only while the button (or finger, or pen) is held down.
    if (!(e.buttons & 1)) {
      this.release()
      return
    }
    const s = this.smooth
    const last = this.last
    if (!s || !last) return
    // Smooth the hand's jitter.
    const x = s.x + (e.clientX - s.x) * 0.5
    const y = s.y + (e.clientY - s.y) * 0.5
    this.smooth = { x, y }

    // Stamp evenly from the last stamp to here, so speed doesn't change density.
    const r = this.reach()
    const gap = r * 0.16
    const dist = Math.hypot(x - last.x, y - last.y)
    for (let done = gap; done <= dist; done += gap) {
      const px = last.x + ((x - last.x) * done) / dist
      const py = last.y + ((y - last.y) * done) / dist
      this.open(px, py, r * (0.92 + Math.random() * 0.16), STROKE_ALPHA)
      this.coverage.mark(px, py, r * 0.5, this.w, this.h)
      this.leave(px, py, r * 0.62)
      if (Math.random() < 0.5) this.stir(px, py, r * 0.55, 1, (x - last.x) * 20, (y - last.y) * 20)
      this.last = { x: px, y: py }
    }
    this.progress()
  }

  private progress() {
    const { share } = this.coverage
    this.opts.onProgress?.(Math.min(1, share / this.threshold))
    if (share >= this.threshold) {
      this.listening = false
      this.release()
      this.opts.onThreshold?.()
    }
  }

  /** Spreads the light over the rest of the dark in `ms`. Resolves once it is gone. */
  reveal(ms: number): Promise<void> {
    this.listening = false
    this.release()
    this.hover = null
    if (ms <= 0 || this.opts.still) {
      this.dark.ctx.clearRect(0, 0, this.w, this.h)
      return Promise.resolve()
    }
    const cell = Math.max(this.w, this.h) / 9
    const points = spread(this.coverage.sources(), this.w, this.h, cell)
    return new Promise((resolve) => {
      this.opening = { points, cell, ms, start: performance.now(), done: 0, end: resolve }
    })
  }

  private frame = (now: number) => {
    const dt = Math.min(0.05, (now - (this.before || now)) / 1000)
    this.before = now
    this.step(now)
    this.draw(now, dt)
    this.raf = requestAnimationFrame(this.frame)
  }

  private step(now: number) {
    const o = this.opening
    if (!o || o.done >= o.points.length) return
    // Ease in: a few lights first, then a rush.
    const f = Math.max(0, Math.min(1, (now - o.start) / o.ms))
    const due = Math.ceil(f * f * o.points.length)
    while (o.done < due) {
      const p = o.points[o.done++]
      const r = o.cell * (1.3 + Math.random() * 0.4)
      this.open(p.x, p.y, r, 1)
      this.leave(p.x, p.y, r * 0.6)
      this.stir(p.x, p.y, o.cell * 0.6, 3)
    }
    if (o.done < o.points.length) return
    // The soft edges leave a little haze behind; it fades away.
    this.host.style.transition = 'opacity 0.6s'
    this.host.style.opacity = '0'
    window.setTimeout(o.end, 600)
  }

  private draw(now: number, dt: number) {
    const { ctx } = this.glow
    const t = now / 1000
    ctx.clearRect(0, 0, this.w, this.h)
    ctx.globalCompositeOperation = 'lighter'
    const light = (sprite: HTMLCanvasElement, x: number, y: number, r: number, alpha: number) => {
      ctx.globalAlpha = alpha
      ctx.drawImage(sprite, x - r, y - r, r * 2, r * 2)
    }

    // Specks, adrift: something is down there.
    const rest = this.opening ? 0.4 : 1
    for (const s of this.specks) {
      s.y -= (dt * (6 + s.size * 3)) / this.h
      if (s.y < -0.02) s.y = 1.02
      const x = s.x * this.w + Math.sin(t * 0.3 + s.phase) * 14
      light(this.ice, x, s.y * this.h, s.size * 2.6, (0.22 + 0.22 * Math.sin(t * s.rate + s.phase)) * rest)
    }

    // The light the pointer carries.
    if (this.hover) light(this.ice, this.hover.x, this.hover.y, this.reach() * 1.15, this.down ? 0.4 : 0.26)

    this.trail = this.trail.filter((p) => now - p.born < TRAIL_MS)
    for (const p of this.trail) {
      const left = 1 - Math.max(0, now - p.born) / TRAIL_MS
      light(this.ice, p.x, p.y, p.r * (1.1 - left * 0.2), 0.13 * left * left)
    }

    const drag = Math.exp(-1.7 * dt)
    this.plankton = this.plankton.filter((p) => now - p.born < p.life)
    for (const p of this.plankton) {
      p.vx *= drag
      p.vy = p.vy * drag - 5 * dt
      p.x += (p.vx + Math.sin(t * 1.6 + p.phase) * 7) * dt
      p.y += p.vy * dt
      const age = Math.max(0, now - p.born) / p.life
      const alpha = Math.min(1, age * 8) * (1 - age) * (0.7 + 0.3 * Math.sin(t * 5 + p.phase))
      light(this.ice, p.x, p.y, p.size * 2.8, alpha * 0.55)
      light(this.white, p.x, p.y, p.size * 0.8, alpha)
    }
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
  }
}
