// The white paper over the page, and the brush that wears through it.
//
// Layers, top to bottom: the prompt, this paper, then the page (text, cards)
// over the finished watercolour background, which is painted in full before
// anyone sees it (lib/paint.ts). Painting doesn't add colour: each brush mark
// splats a watercolour-shaped hole in the paper, so the background and page
// show through. Past the threshold, big splats clear the rest of the paper and
// it is removed, taking every stroke with it. Nothing the visitor painted stays
// in the page.
//
// A mark is a stamp of a watercolour sprite (grainy blob, stronger rim) drawn
// with `destination-out`. Stamps are squashed into an ellipse held at the nib
// angle, so sweeping the brush gives calligraphy for free: wide across the nib,
// a hairline along it. Overlapping stamps wear the paper through unevenly, the
// way layered washes build up, and the odd droplet flies off a fast stroke.

import { NIB, washSprite } from './paint'

const COLS = 24
const ROWS = 14
const SPRITE = 160
const VARIANTS = 6
/** How much paper one stroke stamp wears away; overlaps build to a clear hole. */
const STROKE_ALPHA = 0.55
const INK: readonly [number, number, number] = [0, 0, 0]

type Options = {
  onProgress?: (share: number) => void
  onThreshold?: () => void
  threshold?: number
}

export class PaperMask {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private sprites: HTMLCanvasElement[] = []
  private opts: Options
  private threshold: number
  private paper: string
  private dpr = 1
  private w = 0
  private h = 0
  private cells = new Uint8Array(COLS * ROWS)
  private painted = 0
  private listening = false
  /** The brush is on the paper: a button, finger or pen is held down. */
  private down = false
  private smooth: { x: number; y: number; t: number; pace: number } | null = null
  private lastStamp: { x: number; y: number } | null = null
  /** Stamps since this stroke began, for the tapered start. */
  private age = 0
  private raf = 0
  private teardown: () => void = () => {}

  constructor(canvas: HTMLCanvasElement, opts: Options = {}) {
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D is not available')
    this.canvas = canvas
    this.ctx = ctx
    this.opts = opts
    this.threshold = opts.threshold ?? 0.32
    this.paper = getComputedStyle(document.documentElement).getPropertyValue('--paper').trim() || '#fcfdfd'
    for (let i = 0; i < VARIANTS; i++) this.sprites.push(washSprite(INK, INK, 1, 1, SPRITE))
    this.size()
    canvas.dataset.ready = ''

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
  }

  destroy() {
    cancelAnimationFrame(this.raf)
    this.teardown()
    this.teardown = () => {}
  }

  listen() {
    this.listening = true
  }

  /** Sizes the canvas to the window, keeping any holes already worn through. */
  private size() {
    const { canvas, ctx } = this
    const had = canvas.width > 0 && this.w > 0
    let old: HTMLCanvasElement | null = null
    if (had) {
      old = document.createElement('canvas')
      old.width = canvas.width
      old.height = canvas.height
      old.getContext('2d')?.drawImage(canvas, 0, 0)
    }
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    this.w = window.innerWidth
    this.h = window.innerHeight
    canvas.width = Math.round(this.w * this.dpr)
    canvas.height = Math.round(this.h * this.dpr)
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    if (old) {
      ctx.globalCompositeOperation = 'copy'
      ctx.drawImage(old, 0, 0, canvas.width, canvas.height)
      ctx.globalCompositeOperation = 'source-over'
    } else {
      ctx.fillStyle = this.paper
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
  }

  private brush() {
    return Math.max(70, Math.min(this.w, this.h) * 0.16)
  }

  /** Wears one sprite-shaped patch out of the paper. */
  private stamp(x: number, y: number, major: number, minor: number, rot: number, alpha: number) {
    const { ctx, dpr } = this
    const sx = (major / (SPRITE * 0.72)) * dpr
    const sy = (minor / (SPRITE * 0.72)) * dpr
    const cos = Math.cos(rot)
    const sin = Math.sin(rot)
    ctx.setTransform(cos * sx, sin * sx, -sin * sy, cos * sy, x * dpr, y * dpr)
    ctx.globalCompositeOperation = 'destination-out'
    ctx.globalAlpha = alpha
    ctx.drawImage(this.sprites[Math.floor(Math.random() * VARIANTS)], -SPRITE / 2, -SPRITE / 2)
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
  }

  /** A loose drop flicked off the brush. */
  private droplet(x: number, y: number, size: number) {
    this.stamp(x, y, size, size * (0.8 + Math.random() * 0.4), Math.random() * 6.3, 0.9)
  }

  /** The brush touches the paper: a new stroke, starting with a dab. */
  private press(e: PointerEvent) {
    if (!this.listening || e.button !== 0) return
    // Leave the Enter button and other controls clickable.
    if (e.target instanceof Element && e.target.closest('button, a, input, label')) return
    e.preventDefault()
    this.down = true
    this.age = 0
    this.smooth = { x: e.clientX, y: e.clientY, t: performance.now(), pace: 1 }
    this.lastStamp = { x: e.clientX, y: e.clientY }
    // A single press leaves a mark, like a click in Paint.
    const b = this.brush()
    this.stamp(e.clientX, e.clientY, b * 0.5, b * 0.42, Math.random() * 6.3, 0.85)
    this.mark(e.clientX, e.clientY, b * 0.25)
    this.progress()
  }

  private release() {
    this.down = false
    this.smooth = null
    this.lastStamp = null
  }

  private move(e: PointerEvent) {
    // Paint only while the button (or finger, or pen) is held down.
    if (!this.down || !this.listening) return
    if (!(e.buttons & 1)) {
      this.release()
      return
    }
    const s = this.smooth
    const last = this.lastStamp
    if (!s || !last) return
    const now = performance.now()
    // Smooth the hand's jitter; ease the pace so width never jumps.
    const nx = s.x + (e.clientX - s.x) * 0.45
    const ny = s.y + (e.clientY - s.y) * 0.45
    const speed = Math.hypot(nx - s.x, ny - s.y) / Math.max(8, now - s.t)
    const pace = s.pace + (Math.max(0.35, Math.min(1.25, 1.3 - speed * 0.3)) - s.pace) * 0.3
    this.smooth = { x: nx, y: ny, t: now, pace }

    // Stamp evenly from the last stamp to here, so speed doesn't change density.
    const b = this.brush()
    const dist = Math.hypot(nx - last.x, ny - last.y)
    let done = 0
    for (;;) {
      const ramp = Math.min(1, this.age / 8 + 0.25)
      const major = b * pace * ramp
      const minor = Math.max(8, major * 0.3)
      const spacing = Math.max(2, minor * 0.3)
      if (done + spacing > dist) break
      done += spacing
      const f = done / dist
      const x = last.x + (nx - last.x) * f
      const y = last.y + (ny - last.y) * f
      const jitter = 1 + (Math.random() - 0.5) * 0.16
      this.stamp(x, y, major * jitter, minor * jitter, NIB + (Math.random() - 0.5) * 0.24, STROKE_ALPHA)
      this.mark(x, y, major * 0.45)
      this.age++
      this.lastStamp = { x, y }
      // A fast stroke flicks the odd drop off the brush.
      if (Math.random() < 0.02 + speed * 0.03) {
        const along = (Math.random() - 0.5) * major * 1.4
        const across = (Math.random() - 0.5) * minor * 5
        this.droplet(
          x + Math.cos(NIB) * along - Math.sin(NIB) * across,
          y + Math.sin(NIB) * along + Math.cos(NIB) * across,
          b * (0.05 + Math.random() * 0.09),
        )
      }
    }
    this.progress()
  }

  private progress() {
    const share = this.painted / this.cells.length
    this.opts.onProgress?.(Math.min(1, share / this.threshold))
    if (share >= this.threshold) {
      this.listening = false
      this.release()
      this.opts.onThreshold?.()
    }
  }

  /**
   * Splats the rest of the paper away over `ms`, then fades what little is
   * left. Resolves once the paper is gone.
   */
  reveal(ms: number): Promise<void> {
    this.listening = false
    this.release()
    const { canvas } = this
    if (ms <= 0) {
      this.ctx.clearRect(0, 0, canvas.width, canvas.height)
      return Promise.resolve()
    }
    // A coarse grid of big splats, jittered and thrown in a random order.
    const cell = Math.max(this.w, this.h) / 7
    const splats: { x: number; y: number; r: number }[] = []
    for (let y = cell * 0.4; y < this.h + cell * 0.5; y += cell) {
      for (let x = cell * 0.4; x < this.w + cell * 0.5; x += cell) {
        splats.push({
          x: x + (Math.random() - 0.5) * cell * 0.6,
          y: y + (Math.random() - 0.5) * cell * 0.6,
          r: cell * (0.85 + Math.random() * 0.4),
        })
      }
    }
    for (let i = splats.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[splats[i], splats[j]] = [splats[j], splats[i]]
    }
    return new Promise((resolve) => {
      const start = performance.now()
      let done = 0
      const tick = (now: number) => {
        // Ease in: a few splats first, then a rush.
        const f = Math.min(1, (now - start) / ms)
        const due = Math.ceil(f * f * splats.length)
        while (done < due) {
          const s = splats[done++]
          const d = s.r * 2
          this.stamp(s.x, s.y, d, d * (0.8 + Math.random() * 0.3), Math.random() * 6.3, 1)
          // Each splat throws a few drops.
          const drops = 2 + Math.floor(Math.random() * 4)
          for (let k = 0; k < drops; k++) {
            const a = Math.random() * Math.PI * 2
            const dr = s.r * (1.05 + Math.random() * 0.5)
            this.droplet(s.x + Math.cos(a) * dr, s.y + Math.sin(a) * dr, s.r * (0.08 + Math.random() * 0.14))
          }
        }
        if (done < splats.length) {
          this.raf = requestAnimationFrame(tick)
          return
        }
        // Grain leaves flecks of paper behind; they fade away.
        canvas.style.transition = 'opacity 0.5s'
        canvas.style.opacity = '0'
        window.setTimeout(resolve, 500)
      }
      this.raf = requestAnimationFrame(tick)
    })
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
