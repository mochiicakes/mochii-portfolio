// The koi's wake, painted in watercolour.
//
// A wake is a trail of points left behind the tail. Each frame it is drawn as
// overlapping translucent stamps of small watercolour "brush sprites", the way
// real washes overlap and build up colour. Each sprite is made once, with the
// same treatment as the paint engine (lib/paint.ts):
//   - an irregular, cauliflower-edged outline
//   - mottled with pigment grain
//   - a darker rim just inside the edge, where pigment collects as it dries
//   - a slightly bled, soft edge
// Points expire with time, so the wake fades and dries away behind the fish:
// a slow fish leaves a short wake, a fast one a long wake.

import { washSprite, type RGB } from './paint'

export type WakePt = {
  x: number
  y: number
  /** Width the wake was laid at, from the speed at that moment. */
  w: number
  /** When it was laid, in ms. */
  t: number
  /** A fixed rotation and sprite, so the texture doesn't shimmer. */
  rot: number
  k: number
}

export type WakeInk = {
  /** The pale outer wash: water stirred up by the fish. */
  bloom: HTMLCanvasElement[]
  /** The pigment at the centre of the wake. */
  core: HTMLCanvasElement[]
}

/** How long a point of wake lasts, in ms. */
export const WAKE_LIFE = 1400
const SPRITE = 96
const VARIANTS = 6
const BLOOM_ALPHA = 0.1
const CORE_ALPHA = 0.32

/** A set of brush sprites for one koi: a pale bloom and a pigment core. */
export function makeInk(core: RGB, coreRim: RGB): WakeInk {
  const bloom: HTMLCanvasElement[] = []
  const pigment: HTMLCanvasElement[] = []
  for (let i = 0; i < VARIANTS; i++) {
    bloom.push(washSprite([236, 248, 252], [255, 255, 255], 0.55, 0.9, SPRITE))
    pigment.push(washSprite(core, coreRim, 0.62, 0.85, SPRITE))
  }
  return { bloom, core: pigment }
}

/** Space between stamps for a wake of width `w`, so overlap stays even at any speed. */
export function wakeSpacing(w: number) {
  return Math.max(4, w * 0.18)
}

export function newWakePt(x: number, y: number, w: number, t: number): WakePt {
  return { x, y, w, t, rot: Math.random() * Math.PI * 2, k: Math.floor(Math.random() * VARIANTS) }
}

/** Drops points that have dried away. Points are newest first. */
export function ageWake(pts: WakePt[], now: number) {
  while (pts.length && now - pts[pts.length - 1].t > WAKE_LIFE) pts.pop()
}

export class WakeCanvas {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private dpr = 1

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D is not available')
    this.canvas = canvas
    this.ctx = ctx
    this.size()
  }

  size() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    this.canvas.width = Math.round(window.innerWidth * this.dpr)
    this.canvas.height = Math.round(window.innerHeight * this.dpr)
  }

  clear() {
    const { ctx } = this
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.globalAlpha = 1
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  /** Paints one wake: the pale bloom first, then the pigment core over it. */
  draw(pts: WakePt[], ink: WakeInk, now: number) {
    if (pts.length < 2) return
    this.pass(pts, ink.bloom, now, true)
    this.pass(pts, ink.core, now, false)
    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.ctx.globalAlpha = 1
  }

  private pass(pts: WakePt[], sprites: HTMLCanvasElement[], now: number, bloom: boolean) {
    const { ctx, dpr } = this
    // Oldest first, so the fresh paint sits on top.
    for (let i = pts.length - 1; i >= 0; i--) {
      const p = pts[i]
      const age = Math.min(1, (now - p.t) / WAKE_LIFE)
      const fade = Math.pow(1 - age, 1.4)
      if (fade <= 0.01) continue
      // Water spreads as it settles; the pigment thins and narrows a little.
      const wobble = 1 + Math.sin(i * 0.8 + now * 0.002) * 0.1
      const size = bloom ? p.w * (1 + age * 0.5) * wobble : p.w * 0.45 * (1 - age * 0.25) * wobble
      // The sprite's blob fills about 72% of its box.
      const scale = (size / (SPRITE * 0.72)) * dpr
      const cos = Math.cos(p.rot) * scale
      const sin = Math.sin(p.rot) * scale
      ctx.setTransform(cos, sin, -sin, cos, p.x * dpr, p.y * dpr)
      ctx.globalAlpha = (bloom ? BLOOM_ALPHA : CORE_ALPHA) * fade
      ctx.drawImage(sprites[p.k % sprites.length], -SPRITE / 2, -SPRITE / 2)
    }
  }
}
