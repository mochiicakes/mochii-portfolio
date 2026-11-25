// Blooms: drifting, see-through sea creatures that light the dark water. Each
// is drawn once, in added light, onto its own small canvas and never redrawn;
// CSS does the swaying.
//   - membranes: sheets of fine veins, faint across the middle, bright at the rim
//   - a warm white core of soft lobes
//   - tendrils: bundles of strands that part, cross and fade as they trail away

type Pt = { x: number; y: number }

export type BloomSpec = {
  seed: number
  /** Membrane length, in px of a 900 px square. */
  r: number
  membranes: number
  /** Which way it faces, radians. */
  turn: number
  tendrils: number
  /** How far round the membranes spread, radians: a full turn faces you, less is seen from the side. */
  arc?: number
  /** Membrane width against its length: 1 is broad, less is narrow and feathery. */
  width?: number
}

/** The canvas is this many px square, before scaling. */
export const BLOOM_BOX = 900

/** Every colour on a bloom, as `r,g,b`. */
export type BloomPalette = {
  /** The membranes, from the core out to the rim. */
  root: string
  inner: string
  outer: string
  rim: string
  fold: string
  rimGlow: string
  /** Light in the water round it. */
  halo: string
  /** Tendrils: the strand, the light running along it, and what it fades to at the tip. */
  strand: string
  glint: string
  tip: string
  thread: string
  coreGlow: string
  /** The core's lobes, taken in turn, and how strong they are. */
  lobes: string[]
  lobe: number
}

/** The theme: steel blue, pale ice, warm white light. */
const ICE: BloomPalette = {
  root: '255,240,218',
  inner: '178,206,232',
  outer: '96,146,205',
  rim: '150,196,240',
  fold: '190,220,250',
  rimGlow: '110,170,240',
  halo: '52,104,176',
  strand: '52,104,206',
  glint: '196,220,248',
  tip: '52,104,206',
  thread: '250,238,220',
  coreGlow: '226,214,194',
  lobes: ['255,240,220'],
  lobe: 1,
}

/** The sea angel's first colours: blue-violet, orange and pink. See docs/style-options.md. */
const CORAL: BloomPalette = {
  root: '255,120,190',
  inner: '176,132,255',
  outer: '98,112,240',
  rim: '158,180,255',
  fold: '196,190,255',
  rimGlow: '125,140,255',
  halo: '70,70,200',
  strand: '84,92,236',
  glint: '200,180,255',
  tip: '255,135,75',
  thread: '255,150,205',
  coreGlow: '255,104,84',
  lobes: ['255,120,50', '255,170,64', '255,84,140'],
  lobe: 1.15,
}

export const BLOOM_PALETTES = { ice: ICE, coral: CORAL }
export type BloomPaletteName = keyof typeof BLOOM_PALETTES

const TAU = Math.PI * 2

function random(seed: number) {
  let s = seed * 7919 + 1
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

type Sheet = (u: number, v: number) => Pt

/** A membrane as a surface: `u` across (-1 to 1), `v` along (0 root, 1 tip). */
function membrane(cx: number, cy: number, angle: number, len: number, rnd: () => number, breadth = 1): Sheet {
  const bend = (rnd() - 0.5) * 1.3
  const width = len * (0.3 + rnd() * 0.16) * breadth
  const ripple = len * (0.02 + rnd() * 0.03)
  const waves = 7 + rnd() * 5
  const phase = rnd() * TAU
  const lean = (rnd() - 0.5) * 0.5
  const steps = 32
  const spine: (Pt & { a: number })[] = [{ x: cx, y: cy, a: angle }]
  for (let i = 1; i <= steps; i++) {
    const v = i / steps
    const a = angle + bend * v * v
    const p = spine[i - 1]
    spine.push({ x: p.x + (Math.cos(a) * len) / steps, y: p.y + (Math.sin(a) * len) / steps, a })
  }
  return (u, v) => {
    const f = Math.min(steps - 0.001, v * steps)
    const i = Math.floor(f)
    const t = f - i
    const p = spine[i]
    const q = spine[i + 1]
    const x = p.x + (q.x - p.x) * t
    const y = p.y + (q.y - p.y) * t
    const a = p.a + (q.a - p.a) * t
    const w = width * Math.pow(Math.sin(Math.PI * Math.pow(v, 0.82)), 0.85) * (1 + lean * u)
    // The ripple dies out at the tip, so the two rims meet there instead of crossing.
    const off = u * w + Math.abs(u) ** 3 * ripple * (1 - v ** 5) * Math.sin(v * waves + phase + u)
    return { x: x - Math.sin(a) * off, y: y + Math.cos(a) * off }
  }
}

function line(ctx: CanvasRenderingContext2D, at: (t: number) => Pt, n: number, from = 0, to = 1) {
  ctx.beginPath()
  for (let i = 0; i <= n; i++) {
    const p = at(from + ((to - from) * i) / n)
    if (i) ctx.lineTo(p.x, p.y)
    else ctx.moveTo(p.x, p.y)
  }
}

function drawMembrane(
  ctx: CanvasRenderingContext2D,
  at: Sheet,
  c: Pt,
  len: number,
  light: number,
  rnd: () => number,
  k: BloomPalette,
) {
  const tint = (mid: number, rim: number) => {
    const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, len)
    g.addColorStop(0, `rgba(${k.root},${mid * 0.35})`)
    g.addColorStop(0.3, `rgba(${k.inner},${mid})`)
    g.addColorStop(0.75, `rgba(${k.outer},${mid})`)
    g.addColorStop(1, `rgba(${k.rim},${rim})`)
    return g
  }
  // The sheet itself, barely there.
  ctx.beginPath()
  for (let i = 0; i <= 40; i++) {
    const p = at(-1, i / 40)
    if (i) ctx.lineTo(p.x, p.y)
    else ctx.moveTo(p.x, p.y)
  }
  for (let i = 40; i >= 0; i--) {
    const p = at(1, i / 40)
    ctx.lineTo(p.x, p.y)
  }
  ctx.closePath()
  ctx.fillStyle = tint(0.1 * light, 0.2 * light)
  ctx.fill()
  ctx.save()
  ctx.clip()
  // Veins, gathered toward one side so the sheet looks folded.
  const n = 58
  const fold = (rnd() - 0.5) * 1.1
  for (let j = 0; j <= n; j++) {
    const u = -1 + (2 * j) / n
    const near = Math.exp(-(((u - fold) / 0.34) ** 2))
    const a = (0.05 + 0.12 * near + 0.1 * Math.abs(u) ** 4) * (0.6 + rnd() * 0.8) * light
    ctx.strokeStyle = tint(a, a * 1.6)
    ctx.lineWidth = 0.5 + rnd() * 0.6
    const wander = (rnd() - 0.5) * 0.12
    line(ctx, (t) => at(u + wander * t * t, t), 30, 0.06 + rnd() * 0.16, 0.8 + rnd() * 0.2)
    ctx.stroke()
  }
  // Cross-folds near the tip catch the light.
  for (let j = 0; j < 9; j++) {
    const v = 0.5 + rnd() * 0.45
    ctx.strokeStyle = `rgba(${k.fold},${0.07 * light})`
    ctx.lineWidth = 2 + rnd() * 5
    line(ctx, (t) => at(-1 + 2 * t, v + 0.05 * Math.sin(t * 3 + j)), 16)
    ctx.stroke()
  }
  ctx.restore()
  // The rim.
  for (const u of [-1, 1]) {
    ctx.shadowColor = `rgba(${k.rimGlow},.8)`
    ctx.shadowBlur = 14
    ctx.strokeStyle = tint(0.16 * light, 0.75 * light)
    ctx.lineWidth = 1.3
    line(ctx, (t) => at(u, t), 48, 0.12)
    ctx.stroke()
    ctx.shadowBlur = 0
  }
}

function drawTendril(
  ctx: CanvasRenderingContext2D,
  start: Pt,
  angle: number,
  length: number,
  rnd: () => number,
  k: BloomPalette,
) {
  const steps = 70
  const a1 = 0.5 + rnd() * 1.1
  const a2 = 0.3 + rnd() * 0.5
  const p1 = rnd() * TAU
  const p2 = rnd() * TAU
  const path: (Pt & { a: number })[] = [{ ...start, a: angle }]
  for (let i = 1; i <= steps; i++) {
    const v = i / steps
    const a = angle + a1 * v * Math.sin(v * 4.2 + p1) + a2 * v * Math.sin(v * 9 + p2)
    const p = path[i - 1]
    path.push({ x: p.x + (Math.cos(a) * length) / steps, y: p.y + (Math.sin(a) * length) / steps, a })
  }
  const strands = 13
  // Butt ends, or each join would show as a bead.
  ctx.lineCap = 'butt'
  for (let n = 0; n < strands; n++) {
    const side = (n / (strands - 1)) * 2 - 1
    const ph = rnd() * TAU
    const bright = 0.35 + rnd() * 0.9
    const at = (v: number): Pt => {
      const f = Math.min(steps - 0.001, v * steps)
      const i = Math.floor(f)
      const t = f - i
      const m = path[i]
      const q = path[i + 1]
      const p = { x: m.x + (q.x - m.x) * t, y: m.y + (q.y - m.y) * t, a: m.a + (q.a - m.a) * t }
      const spread = (1 + 15 * Math.sin(Math.PI * v) * (0.6 + 0.4 * Math.sin(v * 6 + p1))) * side
      const off = spread + 2.5 * Math.sin(v * 8 + ph)
      return { x: p.x - Math.sin(p.a) * off, y: p.y + Math.cos(p.a) * off }
    }
    // In pieces, so light can run along it and die away.
    const parts = 22
    for (let i = 0; i < parts; i++) {
      const v = (i + 0.5) / parts
      const glint = 0.5 + 0.5 * Math.sin(v * 7 + ph)
      const a = Math.min(1, v * 5) * (1 - v) ** 1.1 * (0.17 + 0.4 * glint) * bright
      ctx.strokeStyle = `rgba(${v > 0.5 && glint > 0.45 ? k.tip : glint > 0.8 ? k.glint : k.strand},${a})`
      ctx.lineWidth = 0.5 + (1 - v) * 0.7
      line(ctx, at, 4, i / parts, (i + 1) / parts)
      ctx.stroke()
    }
  }
}

function soft(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rgb: string, a: number) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r)
  g.addColorStop(0, `rgba(${rgb},${a})`)
  g.addColorStop(0.45, `rgba(${rgb},${a * 0.34})`)
  g.addColorStop(1, `rgba(${rgb},0)`)
  ctx.fillStyle = g
  ctx.fillRect(x - r, y - r, r * 2, r * 2)
}

/** Draws a bloom, filling a canvas `scale` × BLOOM_BOX px square. */
export function drawBloom(
  canvas: HTMLCanvasElement,
  spec: BloomSpec,
  scale: number,
  palette: BloomPaletteName = 'ice',
) {
  const k = BLOOM_PALETTES[palette]
  canvas.width = canvas.height = Math.round(BLOOM_BOX * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.scale(scale, scale)
  ctx.globalCompositeOperation = 'lighter'
  ctx.lineCap = 'round'
  const rnd = random(spec.seed)
  const c = { x: BLOOM_BOX / 2, y: BLOOM_BOX / 2 }
  const { r } = spec

  soft(ctx, c.x, c.y, r * 1.7, k.halo, 0.16)
  for (let i = 0; i < spec.tendrils; i++) {
    const a = spec.turn + Math.PI + (i / Math.max(1, spec.tendrils - 1) - 0.5) * 2.9 + (rnd() - 0.5) * 0.4
    drawTendril(ctx, c, a, Math.min(BLOOM_BOX * 0.49, r * (1.9 + rnd() * 0.8)), rnd, k)
  }
  for (let i = 0; i < spec.membranes; i++) {
    const at = spec.arc === undefined ? (i / spec.membranes) * TAU : ((i + 0.5) / spec.membranes - 0.5) * spec.arc
    const a = spec.turn + at + (rnd() - 0.5) * (spec.width && spec.width < 0.7 ? 0.2 : 0.6)
    const len = r * (0.66 + rnd() * 0.34)
    drawMembrane(ctx, membrane(c.x, c.y, a, len, rnd, spec.width), c, len, 0.75 + rnd() * 0.4, rnd, k)
  }
  // Fine threads out of the core.
  for (let i = 0; i < 46; i++) {
    const a = rnd() * TAU
    const len = r * (0.18 + rnd() * 0.4)
    const bend = (rnd() - 0.5) * 0.9
    ctx.strokeStyle = `rgba(${k.thread},${0.04 + rnd() * 0.1})`
    ctx.lineWidth = 0.6
    line(ctx, (t) => ({ x: c.x + Math.cos(a + bend * t) * len * t, y: c.y + Math.sin(a + bend * t) * len * t }), 10)
    ctx.stroke()
  }
  // The core.
  soft(ctx, c.x, c.y, r * 0.8, k.coreGlow, 0.46)
  for (let i = 0; i < 34; i++) {
    const a = rnd() * TAU
    const d = r * 0.24 * Math.sqrt(rnd())
    soft(
      ctx,
      c.x + Math.cos(a) * d,
      c.y + Math.sin(a) * d,
      r * (0.03 + rnd() * 0.07),
      k.lobes[i % k.lobes.length],
      (0.12 + rnd() * 0.16) * k.lobe,
    )
  }
}
