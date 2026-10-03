// Watercolour calligraphy on paper.
//
// The page starts as bare paper with its text printed in the paper's colour.
// Painting lays wet blue washes behind the text and the words appear.
//
// How a stroke becomes watercolour:
//   1. While the brush moves, the stroke is drawn as one solid shape on a "wet"
//      layer. Its width follows a calligraphy nib: thick across the nib angle,
//      thin along it, thinner when fast, tapered at the start.
//   2. When the brush pauses (or the stroke gets long), the wet layer dries into
//      the paint layer:
//        - granulation: the shape is mottled with a pigment-grain mask
//        - the body is laid down softly blurred and translucent, with `multiply`,
//          so overlapping washes deepen like real layers
//        - a darker rim is drawn just inside the edge, where pigment collects
//          as a wash dries
//        - now and then a bloom: a pale centre with a dark tide line
// A coverage grid decides when enough is painted; then `fill()` lays broad
// calligraphic washes over the rest.

type RGB = readonly [number, number, number]

/** Pigments sampled from the water references, weighted by how often they load. */
const PIGMENTS: { rgb: RGB; weight: number }[] = [
  { rgb: [86, 174, 222], weight: 5 }, // clear blue
  { rgb: [61, 143, 208], weight: 3 }, // deeper blue
  { rgb: [118, 155, 200], weight: 2 }, // lavender blue
  { rgb: [39, 115, 151], weight: 1.4 }, // deep teal, the darkest pools
  { rgb: [181, 218, 227], weight: 0.8 }, // pale aqua
  { rgb: [188, 172, 217], weight: 0.4 }, // iridescent lilac
  { rgb: [229, 194, 236], weight: 0.2 }, // iridescent pink
]

const COLS = 24
const ROWS = 14
const NIB = (-38 * Math.PI) / 180

function pick(): RGB {
  const total = PIGMENTS.reduce((s, p) => s + p.weight, 0)
  let r = Math.random() * total
  for (const p of PIGMENTS) {
    r -= p.weight
    if (r <= 0) return p.rgb
  }
  return PIGMENTS[0].rgb
}

type Pt = { x: number; y: number; w: number }
type Box = { x0: number; y0: number; x1: number; y1: number }

type Options = {
  onProgress?: (share: number) => void
  onThreshold?: () => void
  threshold?: number
}

export class WatercolorGround {
  private paint: HTMLCanvasElement
  private pctx: CanvasRenderingContext2D
  private wet: HTMLCanvasElement
  private wctx: CanvasRenderingContext2D
  private rim = document.createElement('canvas')
  private rctx: CanvasRenderingContext2D
  private grain: CanvasPattern | null = null
  private opts: Options
  private threshold: number
  private dpr = 1
  private w = 0
  private h = 0
  private color: RGB = pick()
  private stroke: Pt[] = []
  private smooth: { x: number; y: number; w: number; t: number } | null = null
  private box: Box | null = null
  private length = 0
  /** Points since this stroke began, for the tapered start. */
  private age = 0
  private lastMove = 0
  private dryTimer = 0
  private cells = new Uint8Array(COLS * ROWS)
  private painted = 0
  private listening = false
  private filled = false
  private raf = 0
  private teardown: () => void

  constructor(paint: HTMLCanvasElement, wet: HTMLCanvasElement, opts: Options = {}) {
    const pctx = paint.getContext('2d')
    const wctx = wet.getContext('2d')
    const rctx = this.rim.getContext('2d')
    if (!pctx || !wctx || !rctx) throw new Error('Canvas 2D is not available')
    this.paint = paint
    this.pctx = pctx
    this.wet = wet
    this.wctx = wctx
    this.rctx = rctx
    this.opts = opts
    this.threshold = opts.threshold ?? 0.32
    this.size()
    this.makeGrain()

    const onMove = (e: PointerEvent) => this.move(e)
    const onUp = () => this.dry()
    const onResize = () => {
      this.size()
      if (this.filled) this.fillNow()
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onMove, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    window.addEventListener('resize', onResize)
    this.teardown = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('resize', onResize)
      window.clearTimeout(this.dryTimer)
    }
  }

  destroy() {
    cancelAnimationFrame(this.raf)
    this.teardown()
  }

  listen() {
    this.listening = true
  }

  private size() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    this.w = window.innerWidth
    this.h = window.innerHeight
    for (const c of [this.paint, this.wet, this.rim]) {
      c.width = Math.round(this.w * this.dpr)
      c.height = Math.round(this.h * this.dpr)
    }
    for (const ctx of [this.pctx, this.wctx, this.rctx]) ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
  }

  /** A tile of pigment grain: mostly solid, with soft lighter flecks. */
  private makeGrain() {
    const g = document.createElement('canvas')
    g.width = g.height = 160
    const ctx = g.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = 'rgba(0,0,0,0.72)'
    ctx.fillRect(0, 0, 160, 160)
    for (let i = 0; i < 1400; i++) {
      ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.3})`
      const r = 0.5 + Math.random() * 2.5
      ctx.beginPath()
      ctx.arc(Math.random() * 160, Math.random() * 160, r, 0, Math.PI * 2)
      ctx.fill()
    }
    this.grain = this.wctx.createPattern(g, 'repeat')
  }

  private brush() {
    return Math.max(70, Math.min(this.w, this.h) * 0.16)
  }

  private move(e: PointerEvent) {
    if (!this.listening || this.filled) return
    if (e.pointerType !== 'mouse' && e.buttons === 0) return
    const now = performance.now()
    // A real pause in the brush (not a slow frame) ends the stroke.
    if (this.lastMove && now - this.lastMove > 450) this.dry()
    this.lastMove = now
    this.addPoint(e.clientX, e.clientY, now)
    window.clearTimeout(this.dryTimer)
    this.dryTimer = window.setTimeout(() => this.dry(), 500)
    // A very long unbroken stroke dries in place and carries on.
    if (this.length > 2400) this.dry(true)

    const share = this.painted / this.cells.length
    this.opts.onProgress?.(Math.min(1, share / this.threshold))
    if (share >= this.threshold) {
      this.listening = false
      this.dry()
      this.opts.onThreshold?.()
    }
  }

  /** Feed one brush position; draws the wet shape between it and the last. */
  private addPoint(x: number, y: number, t: number, widthScale = 1) {
    const s = this.smooth
    if (!s) {
      this.smooth = { x, y, w: 0, t }
      return
    }
    const nx = s.x + (x - s.x) * 0.45
    const ny = s.y + (y - s.y) * 0.45
    const dx = nx - s.x
    const dy = ny - s.y
    const dist = Math.hypot(dx, dy)
    if (dist < 1) return
    const speed = dist / Math.max(8, t - s.t)
    const angle = Math.atan2(dy, dx)
    // Broad nib: wide across its angle, a hairline along it.
    const nib = 0.28 + 0.72 * Math.abs(Math.sin(angle - NIB))
    const pace = Math.max(0.35, Math.min(1.25, 1.3 - speed * 0.3))
    const target = this.brush() * nib * pace * widthScale
    // Taper in over the first few points; ease width so it never jumps.
    const ramp = Math.min(1, this.age / 6 + 0.2)
    this.age++
    const w = s.w + (target * ramp - s.w) * 0.3
    this.smooth = { x: nx, y: ny, w, t }
    const p = { x: nx, y: ny, w }
    const prev = this.stroke.at(-1) ?? { x: s.x, y: s.y, w: s.w }
    this.stroke.push(p)
    this.length += dist
    this.segment(prev, p)
  }

  private segment(a: Pt, b: Pt) {
    const { wctx } = this
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.hypot(dx, dy) || 1
    const nx = -dy / len
    const ny = dx / len
    // A broad nib leaves flat ends, so segments are quads with no round caps.
    // Each quad starts a pixel early so neighbours overlap without seams.
    const ux = dx / len
    const uy = dy / len
    const ax = a.x - ux
    const ay = a.y - uy
    wctx.fillStyle = `rgb(${this.color.join(',')})`
    wctx.beginPath()
    wctx.moveTo(ax + (nx * a.w) / 2, ay + (ny * a.w) / 2)
    wctx.lineTo(b.x + (nx * b.w) / 2, b.y + (ny * b.w) / 2)
    wctx.lineTo(b.x - (nx * b.w) / 2, b.y - (ny * b.w) / 2)
    wctx.lineTo(ax - (nx * a.w) / 2, ay - (ny * a.w) / 2)
    wctx.closePath()
    wctx.fill()

    const r = b.w / 2 + 12
    this.box = this.box
      ? {
          x0: Math.min(this.box.x0, b.x - r),
          y0: Math.min(this.box.y0, b.y - r),
          x1: Math.max(this.box.x1, b.x + r),
          y1: Math.max(this.box.y1, b.y + r),
        }
      : { x0: b.x - r, y0: b.y - r, x1: b.x + r, y1: b.y + r }
    this.mark(b.x, b.y, Math.max(b.w * 0.6, this.brush() * 0.35))
  }

  /** Let the wet stroke dry into the paint. `keepGoing` continues the same stroke. */
  private dry(keepGoing = false, strength = 1) {
    const box = this.box
    if (box) {
      const pad = 24
      const x = Math.max(0, box.x0 - pad)
      const y = Math.max(0, box.y0 - pad)
      const w = Math.min(this.w, box.x1 + pad) - x
      const h = Math.min(this.h, box.y1 + pad) - y
      if (w > 0 && h > 0) this.bake(x, y, w, h, strength)
    }
    this.box = null
    this.length = 0
    const last = this.stroke.at(-1)
    this.stroke = []
    if (keepGoing && last) {
      this.stroke.push(last)
    } else {
      this.smooth = null
      this.age = 0
      this.color = pick()
    }
  }

  private bake(x: number, y: number, w: number, h: number, strength: number) {
    const { pctx, wctx, rctx, wet, rim, dpr } = this
    const sx = x * dpr
    const sy = y * dpr
    const sw = w * dpr
    const sh = h * dpr

    // Granulation: mottle the wet shape before it dries.
    if (this.grain) {
      wctx.save()
      wctx.globalCompositeOperation = 'destination-in'
      wctx.fillStyle = this.grain
      wctx.fillRect(x, y, w, h)
      wctx.restore()
    }

    // The darker rim: the shape minus a blurred copy of itself leaves a band
    // just inside the edge.
    rctx.save()
    rctx.setTransform(1, 0, 0, 1, 0, 0)
    rctx.clearRect(sx, sy, sw, sh)
    rctx.globalCompositeOperation = 'source-over'
    rctx.drawImage(wet, sx, sy, sw, sh, sx, sy, sw, sh)
    rctx.globalCompositeOperation = 'destination-out'
    rctx.filter = `blur(${6 * dpr}px)`
    rctx.drawImage(wet, sx, sy, sw, sh, sx, sy, sw, sh)
    rctx.restore()

    pctx.save()
    pctx.setTransform(1, 0, 0, 1, 0, 0)
    pctx.globalCompositeOperation = 'multiply'
    // Body: soft-edged and translucent, so washes build up in layers.
    pctx.filter = `blur(${2.5 * dpr}px)`
    pctx.globalAlpha = 0.46 * strength
    pctx.drawImage(wet, sx, sy, sw, sh, sx, sy, sw, sh)
    // Rim.
    pctx.filter = `blur(${0.8 * dpr}px)`
    pctx.globalAlpha = 0.6 * strength
    pctx.drawImage(rim, sx, sy, sw, sh, sx, sy, sw, sh)
    pctx.restore()

    if (Math.random() < 0.3) this.bloom(x, y, w, h)

    wctx.save()
    wctx.setTransform(1, 0, 0, 1, 0, 0)
    wctx.clearRect(sx, sy, sw, sh)
    wctx.restore()
  }

  /** An irregular, cauliflower-edged outline around (cx, cy). */
  private blob(cx: number, cy: number, r: number) {
    const { pctx } = this
    const k1 = 3 + Math.floor(Math.random() * 4)
    const k2 = 7 + Math.floor(Math.random() * 6)
    const p1 = Math.random() * 6
    const p2 = Math.random() * 6
    pctx.beginPath()
    for (let i = 0; i <= 48; i++) {
      const a = (i / 48) * Math.PI * 2
      const rr = r * (1 + 0.16 * Math.sin(k1 * a + p1) + 0.07 * Math.sin(k2 * a + p2) + (Math.random() - 0.5) * 0.04)
      const x = cx + Math.cos(a) * rr
      const y = cy + Math.sin(a) * rr
      if (i === 0) pctx.moveTo(x, y)
      else pctx.lineTo(x, y)
    }
    pctx.closePath()
  }

  /** Water dropped into a drying wash: a paler centre and a ragged tide line. */
  private bloom(x: number, y: number, w: number, h: number) {
    const { pctx, dpr } = this
    const bx = x + w * (0.2 + Math.random() * 0.6)
    const by = y + h * (0.2 + Math.random() * 0.6)
    const r = Math.min(w, h) * (0.14 + Math.random() * 0.16)
    if (r < 10) return
    const [R, G, B] = this.color
    pctx.save()
    pctx.filter = `blur(${3 * dpr}px)`
    pctx.globalCompositeOperation = 'destination-out'
    pctx.fillStyle = 'rgba(0,0,0,0.2)'
    this.blob(bx, by, r)
    pctx.fill()
    pctx.filter = `blur(${0.9 * dpr}px)`
    pctx.globalCompositeOperation = 'multiply'
    pctx.strokeStyle = `rgba(${R},${G},${B},0.38)`
    pctx.lineWidth = 2.2
    this.blob(bx, by, r * 1.02)
    pctx.stroke()
    pctx.restore()
  }

  /** One broad, gently waving calligraphic wash across the screen. */
  private wash(y: number, fromLeft: boolean, widthScale: number, color: RGB, strength: number) {
    this.color = color
    this.smooth = null
    this.age = 0
    this.stroke = []
    const steps = 46
    const phase = Math.random() * 6
    const amp = this.h * (0.03 + Math.random() * 0.03)
    for (let i = 0; i <= steps; i++) {
      const f = i / steps
      const x = fromLeft ? -150 + f * (this.w + 300) : this.w + 150 - f * (this.w + 300)
      // Space points evenly in time so width comes from the nib, not speed.
      this.addPoint(x, y + Math.sin(f * 5 + phase) * amp, i * 60, widthScale)
    }
    this.dry(false, strength)
  }

  private plan() {
    const step = this.brush() * 0.75
    const rows: { y: number; scale: number; color: RGB; strength: number }[] = []
    // First layer: a broad, even wash of the clear blue over everything.
    for (let y = -step * 0.4; y < this.h + step; y += step) {
      rows.push({ y, scale: 1.9, color: PIGMENTS[0].rgb, strength: 1 })
    }
    // Second and third layers: mixed pigments, offset, so the blue deepens
    // unevenly, the way layered washes do.
    for (let pass = 0; pass < 2; pass++) {
      for (let y = step * (0.2 + pass * 0.35); y < this.h + step; y += step * 1.25) {
        rows.push({
          y: y + (Math.random() - 0.5) * step * 0.4,
          scale: 1.4 + Math.random() * 0.6,
          color: pick(),
          strength: 0.9,
        })
      }
    }
    return rows
  }

  fill(ms: number): Promise<void> {
    this.listening = false
    this.filled = true
    const rows = this.plan()
    return new Promise((resolve) => {
      const start = performance.now()
      let done = 0
      const tick = (now: number) => {
        const due = Math.min(rows.length, Math.ceil(((now - start) / ms) * rows.length))
        while (done < due) {
          const r = rows.at(done)!
          this.wash(r.y, done % 2 === 0, r.scale, r.color, r.strength)
          done++
        }
        if (done < rows.length) this.raf = requestAnimationFrame(tick)
        else resolve()
      }
      this.raf = requestAnimationFrame(tick)
    })
  }

  fillNow() {
    this.listening = false
    this.filled = true
    this.plan().forEach((r, i) => this.wash(r.y, i % 2 === 0, r.scale, r.color, r.strength))
  }

  private mark(x: number, y: number, r: number) {
    const cw = this.w / COLS
    const ch = this.h / ROWS
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
          this.painted++
        }
      }
    }
  }
}
