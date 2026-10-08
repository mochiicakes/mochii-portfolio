// The watercolour background, and the brush-mark helpers shared with the
// paper reveal (lib/paper.ts) and the koi wakes (lib/wake.ts).
//
// The background is painted in full, at once, before anyone sees it: broad
// calligraphic washes in three layers. It sits under the white paper, and the
// visitor's brush only ever wears holes in the paper, so their strokes are
// never part of the background itself.
//
// How a wash becomes watercolour:
//   1. The wash is drawn as one solid shape on an offscreen "wet" layer. Its
//      width follows a calligraphy nib: thick across the nib angle, thin along it.
//   2. The wet layer then dries into the background:
//        - granulation: the shape is mottled with a pigment-grain mask
//        - the body is laid down softly blurred and translucent, with `multiply`,
//          so overlapping washes deepen like real layers
//        - a darker rim is drawn just inside the edge, where pigment collects
//          as a wash dries
//        - now and then a bloom: a pale centre with a dark tide line

export type RGB = readonly [number, number, number]

/** Pigments sampled from the water references, weighted by how often they load. */
const PIGMENTS: { rgb: RGB; weight: number }[] = [
  { rgb: [86, 174, 222], weight: 5 }, // clear blue
  { rgb: [61, 143, 208], weight: 3 }, // deeper blue
  { rgb: [118, 155, 200], weight: 2 }, // lavender blue
  { rgb: [39, 115, 151], weight: 1.4 }, // deep teal, the darkest pools
  { rgb: [181, 218, 227], weight: 0.8 }, // pale aqua
  // No lilac or pink: a stroke that drew them left a pink band across the blue.
]

/** The broad nib's angle, shared with the paper brush. */
export const NIB = (-38 * Math.PI) / 180

function pick(): RGB {
  const total = PIGMENTS.reduce((s, p) => s + p.weight, 0)
  let r = Math.random() * total
  for (const p of PIGMENTS) {
    r -= p.weight
    if (r <= 0) return p.rgb
  }
  return PIGMENTS[0].rgb
}

/** A tile of pigment grain: mostly solid, with soft lighter flecks. Used as a `destination-in` mask. */
export function grainTile(size = 160) {
  const g = document.createElement('canvas')
  g.width = g.height = size
  const ctx = g.getContext('2d')
  if (!ctx) return g
  ctx.fillStyle = 'rgba(0,0,0,0.72)'
  ctx.fillRect(0, 0, size, size)
  const flecks = Math.round(1400 * (size / 160) ** 2)
  for (let i = 0; i < flecks; i++) {
    ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.3})`
    const r = 0.5 + Math.random() * 2.5
    ctx.beginPath()
    ctx.arc(Math.random() * size, Math.random() * size, r, 0, Math.PI * 2)
    ctx.fill()
  }
  return g
}

/** Traces an irregular, cauliflower-edged outline around (cx, cy) as the current path. */
export function blobPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const k1 = 3 + Math.floor(Math.random() * 4)
  const k2 = 7 + Math.floor(Math.random() * 6)
  const p1 = Math.random() * 6
  const p2 = Math.random() * 6
  ctx.beginPath()
  for (let i = 0; i <= 48; i++) {
    const a = (i / 48) * Math.PI * 2
    const rr = r * (1 + 0.16 * Math.sin(k1 * a + p1) + 0.07 * Math.sin(k2 * a + p2) + (Math.random() - 0.5) * 0.04)
    const x = cx + Math.cos(a) * rr
    const y = cy + Math.sin(a) * rr
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
}

const grains = new Map<number, HTMLCanvasElement>()

/**
 * One watercolour brush mark on a square canvas of `size` px: an irregular
 * blob mottled with grain, with a darker rim just inside its edge and a
 * slightly bled outline. The blob fills about 72% of the canvas.
 */
export function washSprite(body: RGB, rim: RGB, bodyAlpha: number, rimAlpha: number, size = 96) {
  const make = () => {
    const c = document.createElement('canvas')
    c.width = c.height = size
    return c
  }
  const c = make()
  const shape = make()
  const edge = make()
  const ctx = c.getContext('2d')
  const sctx = shape.getContext('2d')
  const ectx = edge.getContext('2d')
  if (!ctx || !sctx || !ectx) return c
  const mid = size / 2

  // The shape, mottled with grain.
  sctx.fillStyle = `rgb(${body.join(',')})`
  blobPath(sctx, mid, mid, size * 0.36)
  sctx.fill()
  let grain = grains.get(size)
  if (!grain) grains.set(size, (grain = grainTile(size)))
  sctx.globalCompositeOperation = 'destination-in'
  sctx.drawImage(grain, 0, 0)

  // The rim: the shape minus a blurred copy of itself, in the rim colour.
  const k = size / 96
  ectx.drawImage(shape, 0, 0)
  ectx.globalCompositeOperation = 'destination-out'
  ectx.filter = `blur(${5 * k}px)`
  ectx.drawImage(shape, 0, 0)
  ectx.filter = 'none'
  ectx.globalCompositeOperation = 'source-in'
  ectx.fillStyle = `rgb(${rim.join(',')})`
  ectx.fillRect(0, 0, size, size)

  // Body with a slightly bled edge, then the rim over it.
  ctx.filter = `blur(${1.5 * k}px)`
  ctx.globalAlpha = bodyAlpha
  ctx.drawImage(shape, 0, 0)
  ctx.filter = `blur(${0.6 * k}px)`
  ctx.globalAlpha = rimAlpha
  ctx.drawImage(edge, 0, 0)
  return c
}

type Pt = { x: number; y: number; w: number }
type Box = { x0: number; y0: number; x1: number; y1: number }

/** Paints the full watercolour background onto `paint`, and repaints it on resize. */
export class WatercolorGround {
  private paint: HTMLCanvasElement
  private pctx: CanvasRenderingContext2D
  private wet = document.createElement('canvas')
  private wctx: CanvasRenderingContext2D
  private rim = document.createElement('canvas')
  private rctx: CanvasRenderingContext2D
  private grain: CanvasPattern | null = null
  private dpr = 1
  private w = 0
  private h = 0
  private color: RGB = pick()
  private stroke: Pt[] = []
  private smooth: { x: number; y: number; w: number; t: number } | null = null
  private box: Box | null = null
  /** Points since this wash began, for the tapered start. */
  private age = 0
  private teardown: () => void

  constructor(paint: HTMLCanvasElement) {
    const pctx = paint.getContext('2d')
    const wctx = this.wet.getContext('2d')
    const rctx = this.rim.getContext('2d')
    if (!pctx || !wctx || !rctx) throw new Error('Canvas 2D is not available')
    this.paint = paint
    this.pctx = pctx
    this.wctx = wctx
    this.rctx = rctx
    this.grain = wctx.createPattern(grainTile(), 'repeat')

    let lastW = window.innerWidth
    const onResize = () => {
      // Phones resize the viewport height as their toolbars slide; only a
      // real change of width is worth repainting for.
      if (window.innerWidth === lastW && window.innerHeight <= this.h) return
      lastW = window.innerWidth
      this.paintAll()
    }
    window.addEventListener('resize', onResize)
    this.teardown = () => window.removeEventListener('resize', onResize)
    this.paintAll()
  }

  destroy() {
    this.teardown()
  }

  /** The whole background, painted at once. */
  paintAll() {
    this.size()
    this.plan().forEach((r, i) => this.wash(r.y, i % 2 === 0, r.scale, r.color, r.strength))
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

  private brush() {
    return Math.max(70, Math.min(this.w, this.h) * 0.16)
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
  }

  /** Let the wet wash dry into the background. */
  private dry(strength = 1) {
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
    this.stroke = []
    this.smooth = null
    this.age = 0
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
    blobPath(pctx, bx, by, r)
    pctx.fill()
    pctx.filter = `blur(${0.9 * dpr}px)`
    pctx.globalCompositeOperation = 'multiply'
    pctx.strokeStyle = `rgba(${R},${G},${B},0.38)`
    pctx.lineWidth = 2.2
    blobPath(pctx, bx, by, r * 1.02)
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
    this.dry(strength)
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
}
