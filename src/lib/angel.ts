// The sea angel: a chibi Clione that follows the pointer and eats a glowing
// heart. Ported from the approved prototype; the numbers are the design, so
// change them only with a new one to match.
//
// The state and `updateAngel` need no canvas. `AngelPainter` does the drawing:
//   - the spine is N points following the head, so the soft body bends along
//     its own path
//   - the body is one continuous outline round that spine (half-widths in WD)
//   - the halo is painted small with a shadow-only blur and scaled up, so it
//     has no hard edge to pixelate
//   - wings and tentacles are clipped to outside the body, so they grow out of
//     it with no seam
// Nothing here touches `document` until a painter is made: the page is
// pre-rendered.
import { ANGEL_SWIM, clamp, ease, move, steer, wrap, type SteerOpts, type Swimmer } from './swim'

const TAU = Math.PI * 2
/** Seconds into the eating: carried off at the end. */
const EAT_END = 1.45
/** The happy flutter after eating, in seconds. */
const JOY = 1.2

const lerp = (a: number, b: number, u: number) => a + (b - a) * u
const smooth = (u: number) => u * u * (3 - 2 * u)

type Pt = { x: number; y: number }

/** Spine segments, head (0) to tail (N). */
const N = 20
// Body half-width along the spine, tail (0) to head (1), for a 96 px animal:
// tapering sack, neck, round head.
// prettier-ignore
const S = [0, .031, .056, .106, .156, .231, .306, .406, .481, .556, .68, .775, .81, .84, .875, .91, .95, .975, 1]
// prettier-ignore
const WD = [.6, 3.75, 5.85, 8.7, 11.1, 13.8, 15.6, 17.85, 18, 16.65, 14.4, 11.5, 10.2, 13.8, 15.8, 15.4, 13.4, 11.6, 10.6]

function profile(s: number) {
  for (let j = 1; j < S.length; j++) {
    if (s <= S[j]) {
      const u = (s - S[j - 1]) / (S[j] - S[j - 1])
      return WD[j - 1] + (WD[j] - WD[j - 1]) * smooth(u)
    }
  }
  return WD[WD.length - 1]
}

/** Body length as a share of the window's smaller side. */
export const SIZES = { s: 0.15, m: 0.22, l: 0.3 }
/** The whole animal, and its heart, against the prototype's size. */
const SCALE = 0.8
export type AngelSize = keyof typeof SIZES

export type AngelMode = 'hover' | 'chase' | 'circle' | 'approach' | 'eat'

export type Angel = Swimmer & {
  /** The window. */
  W: number
  H: number
  /** Body length, spine segment length, and scale against the 96 px animal. */
  L: number
  seg: number
  sc: number
  mode: AngelMode
  /** Wing beat: phase accumulates, so a change of pace never jumps the wings. */
  phase: number
  omega: number
  pace: number
  /** Seconds since the bite. */
  eatT: number
  /** How far the tentacles reach, how far out they are, how tightly they curl. */
  reach: number
  cones: number
  grab: number
  /** The swelling as the heart goes down: where it is, and how big. */
  bulgeS: number
  bulgeA: number
  /** Seconds left of the flutter after eating. */
  joy: number
  spine: Pt[]
  /** `x`, `y`: where it waits. `shown`: whether that spot is on screen. */
  heart: { state: 'free' | 'eat' | 'carried'; x: number; y: number; shown: boolean }
}

export type AngelInput = {
  x: number
  y: number
  /** When the pointer last moved, on the same clock as `now`. */
  at: number
  /** There has been a pointer. */
  has: boolean
  /** The target is a tap: it never goes idle, so the angel keeps circling it. */
  tap: boolean
}

function resetSpine(a: Angel) {
  a.spine = []
  for (let i = 0; i <= N; i++) {
    a.spine.push({ x: a.x - Math.cos(a.angle) * i * a.seg, y: a.y - Math.sin(a.angle) * i * a.seg })
  }
}

/** Fits the angel to the window. */
export function resizeAngel(a: Angel, W: number, H: number, size: AngelSize) {
  a.W = W
  a.H = H
  a.L = clamp(Math.min(W, H) * SIZES[size], 80, 280) * SCALE
  a.seg = a.L / N
  a.sc = a.L / 96
}

export function newAngel(W: number, H: number, size: AngelSize, eaten: boolean): Angel {
  const a: Angel = {
    // The right margin, beside the content: until there is a pointer it hovers
    // where it starts, and must not cover anything to read.
    x: W - 130,
    y: H * 0.6,
    angle: -Math.PI / 2,
    av: 0,
    speed: 0,
    W,
    H,
    L: 96,
    seg: 6,
    sc: 1,
    mode: 'hover',
    phase: 0,
    omega: 8,
    pace: 0,
    eatT: 0,
    reach: 30,
    cones: 0,
    grab: 0,
    bulgeS: 0,
    bulgeA: 0,
    joy: 0,
    spine: [],
    heart: { state: eaten ? 'carried' : 'free', x: 0, y: 0, shown: false },
  }
  resizeAngel(a, W, H, size)
  resetSpine(a)
  return a
}

/** Holds the angel still, upright, with the top of its head at (x, y). */
export function poseAngel(a: Angel, x: number, y: number) {
  a.x = x
  a.y = y
  a.angle = -Math.PI / 2
  resetSpine(a)
}

// Follow-the-leader spine with some stiffness, so the soft body bends along its own path.
function follow(a: Angel) {
  const sp = a.spine
  sp[0].x = a.x
  sp[0].y = a.y
  for (let i = 1; i <= N; i++) {
    const p = sp[i - 1]
    const q = sp[i]
    let dx = q.x - p.x
    let dy = q.y - p.y
    const dl = Math.hypot(dx, dy) || 1
    dx /= dl
    dy /= dl
    if (i > 1) {
      const pp = sp[i - 2]
      const ux = p.x - pp.x
      const uy = p.y - pp.y
      const ul = Math.hypot(ux, uy) || 1
      dx = dx * 0.72 + (ux / ul) * 0.28
      dy = dy * 0.72 + (uy / ul) * 0.28
    }
    const l = Math.hypot(dx, dy) || 1
    q.x = p.x + (dx / l) * a.seg
    q.y = p.y + (dy / l) * a.seg
  }
}

function eat(a: Angel, dt: number) {
  a.eatT += dt
  const e = a.eatT
  a.speed = ease(a.speed, 0, 8, dt)
  // Reach (0-.35 s), curl around the heart (.35-.6), pull it in and shrink back
  // into the head (.65-1.15), swallow (to 1.45).
  if (e < 0.35) a.cones = lerp(a.cones, 1, smooth(e / 0.35))
  else a.cones = e < 0.65 ? 1 : Math.max(0, 1 - smooth(clamp((e - 0.65) / 0.5, 0, 1)))
  a.grab = clamp((e - 0.35) / 0.25, 0, 1)
  const u = clamp((e - 1) / 0.45, 0, 1)
  a.bulgeS = lerp(0.97, 0.55, smooth(u))
  a.bulgeA = e > 1 ? 3.6 * a.sc * Math.sin(Math.PI * u) : 0
  if (e > EAT_END) {
    a.heart.state = 'carried'
    a.mode = 'chase'
    a.cones = 0
    a.grab = 0
    a.bulgeA = 0
    a.joy = JOY
  }
}

/** One frame: `dt` in seconds, `now` in ms. */
export function updateAngel(a: Angel, input: AngelInput, dt: number, now: number) {
  const k = dt * 60
  const { L, W, H, sc, heart } = a
  const idleFor = input.tap ? 0 : (now - input.at) / 1000
  const top = 4.5 + L * 0.02
  const near = 50 + L * 0.3
  const go = (x: number, y: number, opts: SteerOpts) => steer(a, x, y, dt, ANGEL_SWIM, opts)

  if (a.mode === 'eat') {
    eat(a, dt)
    move(a, k)
  } else {
    const lure =
      heart.state === 'free' &&
      heart.shown &&
      ((input.has && idleFor < 3 && Math.hypot(input.x - heart.x, input.y - heart.y) < 160) ||
        Math.hypot(a.x - heart.x, a.y - heart.y) < L * 1.1)
    if (lure) {
      a.mode = 'approach'
      const d = go(heart.x, heart.y, { top: top * 0.85, idle: 0, turn: 0.09 })
      move(a, k)
      a.reach = L * 0.45
      a.cones = ease(a.cones, clamp(1 - (d - 34 * sc) / (80 * sc), 0, 1) * 0.4, 6, dt)
      a.grab = 0
      if (d < 34 * sc) {
        a.mode = 'eat'
        a.eatT = 0
        heart.state = 'eat'
        a.reach = clamp(d + 14 * sc, L * 0.4, L * 0.55)
      }
    } else {
      a.cones = ease(a.cones, 0, 6, dt)
      if (!input.has || idleFor > 1.6) {
        // Hover: head up, each wing beat lifting it against a slow sink.
        a.mode = 'hover'
        const m = L * 0.8
        const out = a.x < m || a.x > W - m || a.y < m + 60 || a.y > H - m - 40
        if (out) go(W / 2, H * 0.45, { top: 2, idle: 0, turn: 0.05 })
        else {
          a.av = ease(a.av, clamp(wrap(-Math.PI / 2 - a.angle) * 2.5, -1.4, 1.4), 4, dt)
          a.angle += a.av * dt
          a.speed = ease(a.speed, (0.34 + 0.3 * Math.sin(a.phase)) * sc, 6, dt)
        }
        move(a, k)
        const sink = 0.3 * sc * k
        a.y += sink
        for (const p of a.spine) p.y += sink
      } else {
        const d = go(input.x, input.y, { top, idle: near, turn: 0.08 })
        a.mode = d < near ? 'circle' : 'chase'
        move(a, k)
      }
    }
  }

  // Both wings row together: slow, wide strokes when hovering; fast strokes swept back when chasing.
  a.pace = ease(a.pace, a.mode === 'eat' ? 0.15 : clamp(a.speed / top, 0, 1), 3, dt)
  // A happy flutter for a moment after eating.
  if (a.joy > 0) a.joy = Math.max(0, a.joy - dt)
  a.omega = ease(a.omega, TAU * (1.4 + 2.6 * a.pace + (a.joy > 0 ? 3.2 * a.joy : 0)), a.joy > 0 ? 8 : 3, dt)
  a.phase += a.omega * dt
  follow(a)
}

// --- Drawing ---------------------------------------------------------------

type Ctx = CanvasRenderingContext2D

/** Every colour on the animal. Triples are `r,g,b`; stops are `r,g,b,a`. */
export type AngelPalette = {
  /** The jelly: its edges, its middle, and how solid it is. */
  edge: string
  middle: string
  body: number
  wingTip: string
  halo: string
  speck: [string, string]
  /** Each organ, centre to rim. */
  head: string[]
  column: string[]
  stomach: string[]
  stomachFull: string[]
  tail: string[]
  /** Halo light behind the head and the stomach, empty and full. */
  headHalo: string[]
  stomachHalo: string[]
  fullHalo: string[]
  /** Glows stamped in added light: down the neck, the organs, the stomach. */
  neckGlow: string
  organGlow: string
  stomachGlow: string
  tentacle: string
  heartGlow: string
  heart: [string, string, string]
}

/** The first look: blue-violet jelly, orange organs, a pink heart. See docs/style-options.md. */
const CORAL: AngelPalette = {
  edge: '158,180,255',
  middle: '98,112,226',
  body: 0.86,
  wingTip: '185,210,255',
  halo: '125,175,255',
  speck: ['235,238,255', '220,226,255'],
  head: ['255,150,90,1', '255,90,90,.7', '255,90,140,0'],
  column: ['255,200,230,.9', '255,140,200,.55', '255,120,190,0'],
  stomach: ['255,214,110,1', '255,160,50,.7', '255,130,40,0'],
  stomachFull: ['255,150,200,.45', '255,120,190,0'],
  tail: ['255,170,110,.85', '255,120,80,0'],
  headHalo: ['255,140,120,.9', '255,120,170,0'],
  stomachHalo: ['255,190,90,.9', '255,160,60,0'],
  fullHalo: ['255,120,190,.8', '255,120,190,0'],
  neckGlow: '255,92,158',
  organGlow: '255,120,40',
  stomachGlow: '255,140,55',
  tentacle: '255,135,75',
  heartGlow: '255,92,158',
  heart: ['#ffd0e2', '#ff76ad', '#e23d82'],
}

/** The site's look: the blooms' steel blue, pale ice and warm white light. */
const ICE: AngelPalette = {
  edge: '166,206,238',
  middle: '58,100,154',
  body: 0.78,
  wingTip: '190,224,246',
  halo: '104,160,220',
  speck: ['244,250,252', '206,230,244'],
  head: ['250,232,204,.8', '206,208,206,.4', '140,186,224,0'],
  column: ['226,238,246,.6', '166,206,234,.32', '120,172,220,0'],
  stomach: ['246,224,188,.85', '218,202,176,.42', '160,184,204,0'],
  stomachFull: ['150,200,224,.3', '120,180,214,0'],
  tail: ['214,232,244,.6', '130,180,224,0'],
  headHalo: ['176,192,206,.5', '130,176,220,0'],
  stomachHalo: ['204,194,176,.5', '150,180,208,0'],
  fullHalo: ['130,190,218,.55', '110,170,210,0'],
  neckGlow: '46,86,126',
  organGlow: '112,98,74',
  stomachGlow: '118,100,72',
  tentacle: '214,234,246',
  heartGlow: '56,112,142',
  heart: ['#f2fcff', '#a5d9ec', '#3f86b0'],
}

export const PALETTES = { coral: CORAL, ice: ICE }
export type PaletteName = keyof typeof PALETTES

const rgba = (stops: string[]) => stops.map((c) => `rgba(${c})`)
/** The body at one spine point: position, heading, normal, half-width, rotation. */
type Frame = { p: Pt; d: Pt; n: Pt; w: number; r: number }
type Wing = { f0: Pt; tip: Pt; Lp: Pt[]; Tp: Pt[]; root: Pt }
type Tentacle = { pts: (Pt & { a: number })[]; w0: number; w1: number; tip: Pt }

// A blobby heart: the classic heart curve blended 40% toward a circle, so the
// lobes puff out and the point is rounded.
const HEART = Array.from({ length: 64 }, (_, i) => {
  const t = (i / 64) * TAU
  const hx = (16 * Math.sin(t) ** 3) / 32
  const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 32
  const cx = Math.sin(t) * 0.5
  const cy = -Math.cos(t) * 0.47 + 0.04
  return [lerp(hx, cx, 0.4) * 1.08, lerp(hy, cy, 0.4)] as const
})

// The same specks every time, so the animal keeps its markings.
let seed = 7
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
const SPECKS = Array.from({ length: 190 }, () => {
  const e = rnd()
  return {
    s: 0.04 + rnd() * 0.9,
    o: e < 0.45 ? (rnd() < 0.5 ? -1 : 1) * (0.6 + rnd() * 0.35) : (rnd() * 2 - 1) * 0.6,
    r: 0.35 + rnd() * 0.75,
    a: 0.3 + rnd() * 0.55,
  }
})
const WING_SPECKS = Array.from({ length: 30 }, () => ({
  u: 0.05 + rnd() * 0.85,
  f: 0.15 + rnd() * 0.7,
  r: 0.35 + rnd() * 0.6,
  a: 0.25 + rnd() * 0.45,
}))

function canvas2d(size: number): [HTMLCanvasElement, Ctx] {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D is not available')
  return [c, ctx]
}

function radial(size: number, stops: [number, string][]) {
  const [c, x] = canvas2d(size)
  const h = size / 2
  const g = x.createRadialGradient(h, h, 0, h, h, h)
  for (const [at, color] of stops) g.addColorStop(at, color)
  x.fillStyle = g
  x.fillRect(0, 0, size, size)
  return c
}

/** A glow, made once and stamped with 'lighter'. */
const glow = (rgb: string, size: number) =>
  radial(size, [
    [0, `rgba(${rgb},1)`],
    [0.22, `rgba(${rgb},.5)`],
    [0.6, `rgba(${rgb},.12)`],
    [1, `rgba(${rgb},0)`],
  ])

/** A point `u` along the heading and `v` across it. */
const at = (f: Frame, u: number, v: number): Pt => ({
  x: f.p.x + f.d.x * u + f.n.x * v,
  y: f.p.y + f.d.y * u + f.n.y * v,
})

function frameAt(a: Angel, i: number): Frame {
  const p = a.spine[Math.max(0, i - 1)]
  const q = a.spine[Math.min(N, i + 1)]
  let dx = p.x - q.x
  let dy = p.y - q.y
  const l = Math.hypot(dx, dy) || 1
  dx /= l
  dy /= l
  const s = 1 - i / N
  return {
    p: a.spine[i],
    d: { x: dx, y: dy },
    n: { x: -dy, y: dx },
    w: profile(s) * a.sc + a.bulgeA * Math.exp(-(((s - a.bulgeS) / 0.07) ** 2)),
    r: Math.atan2(dy, dx),
  }
}

/** A point on the body by position along it (s: 0 tail, 1 head top) and across it (o: -1 to 1). */
function pos(F: Frame[], s: number, o: number): Pt {
  const i = clamp((1 - s) * N, 0, N - 0.001)
  const i0 = Math.floor(i)
  const u = i - i0
  const p = at(F[i0], 0, F[i0].w * o)
  const q = at(F[i0 + 1], 0, F[i0 + 1].w * o)
  return { x: lerp(p.x, q.x, u), y: lerp(p.y, q.y, u) }
}

const nearest = (F: Frame[], s: number) => F[clamp(Math.round((1 - s) * N), 0, N)]

/** A smooth line through the points. */
function trace(ctx: Ctx, pts: Pt[]) {
  ctx.lineTo(pts[0].x, pts[0].y)
  for (let j = 1; j < pts.length - 1; j++) {
    const p = pts[j]
    const q = pts[j + 1]
    ctx.quadraticCurveTo(p.x, p.y, (p.x + q.x) / 2, (p.y + q.y) / 2)
  }
  const z = pts[pts.length - 1]
  ctx.lineTo(z.x, z.y)
}

// One outline: tail, pear body, shoulders, neck, round head, two short cat ears
// and a gently domed top. Added to the current path; the caller begins it.
function bodyOutline(ctx: Ctx, F: Frame[], sc: number) {
  const Lp = F.map((f) => at(f, 0, f.w)).reverse()
  const Rp = F.map((f) => at(f, 0, -f.w))
  const h = F[0]
  const P = (u: number, v: number) => at(h, u, v)
  ctx.moveTo(Lp[0].x, Lp[0].y)
  trace(ctx, Lp)
  // Ears as in the drawing: short stubs, straight outer edge, rounded tip, the head top flat between them.
  const ear = (o: number) => ({
    a: P(4.4 * sc, o * h.w),
    c: P(6.9 * sc, o * (h.w - 0.4 * sc)),
    b: P(5 * sc, o * (h.w - 3.4 * sc)),
    c2: P(1.4 * sc, o * (h.w - 5.6 * sc)),
    ib: P(0.3 * sc, o * 4.6 * sc),
  })
  const l = ear(1)
  const r = ear(-1)
  const top = P(sc, 0)
  ctx.lineTo(l.a.x, l.a.y)
  ctx.quadraticCurveTo(l.c.x, l.c.y, l.b.x, l.b.y)
  ctx.quadraticCurveTo(l.c2.x, l.c2.y, l.ib.x, l.ib.y)
  ctx.quadraticCurveTo(top.x, top.y, r.ib.x, r.ib.y)
  ctx.quadraticCurveTo(r.c2.x, r.c2.y, r.b.x, r.b.y)
  ctx.quadraticCurveTo(r.c.x, r.c.y, r.a.x, r.a.y)
  ctx.lineTo(Rp[0].x, Rp[0].y)
  trace(ctx, Rp)
  ctx.closePath()
}

function bodyPath(ctx: Ctx, F: Frame[], sc: number) {
  ctx.beginPath()
  bodyOutline(ctx, F, sc)
}

// A wing: a soft membrane, not a rigid one. Each slice along the span follows
// the stroke a little later than the one before, so a wave rolls out to the
// tip, and the trailing edge ripples on its own.
function wing(a: Angel, f: Frame, o: number): Wing {
  const { sc, pace, phase: ph } = a
  const n = 12
  const span = 34 * sc + f.w * 0.45
  const base = Math.atan2(f.n.y * o, f.n.x * o)
  const stroke = (q: number) => -0.22 - 0.55 * pace + (0.42 - 0.1 * pace) * Math.sin(q)
  const calm = 1 - 0.5 * pace
  // The root starts deep inside the body, so no part of its edge can swing out past the outline.
  let p = at(f, 2 * sc, o * f.w * 0.3)
  const Lp: Pt[] = []
  const Tp: Pt[] = []
  for (let j = 0; j <= n; j++) {
    const u = j / n
    const curl = (0.25 + 0.2 * Math.sin(ph + 0.6)) * u * u
    const hd = base - o * (stroke(ph - 1.4 * u) + curl)
    if (j) p = { x: p.x + (Math.cos(hd) * span) / n, y: p.y + (Math.sin(hd) * span) / n }
    const fx = Math.sin(hd) * o
    const fy = -Math.cos(hd) * o
    // Leaf shape: broad near the body, both edges bowed, the lower one more, to a pointed tip.
    const t = Math.max(0, (u - 0.3) / 0.7)
    const c = (u < 0.3 ? 0.12 + 0.88 * Math.sin(((u / 0.3) * Math.PI) / 2) : Math.pow(1 - t * t, 0.85)) * 12
    const rip = Math.sin(ph * 1.3 - u * 7 + o) * 1.4 * u * calm * (c / 12)
    const front = (0.75 * c + Math.sin(ph - u * 5) * 0.5 * u * calm * (c / 12)) * sc
    const back = (1.05 * c + rip) * sc
    Lp.push({ x: p.x + fx * front, y: p.y + fy * front })
    Tp.push({ x: p.x - fx * back, y: p.y - fy * back })
  }
  return { f0: Lp[0], tip: Lp[n], Lp, Tp, root: f.p }
}

function wingPath(ctx: Ctx, w: Wing) {
  ctx.beginPath()
  ctx.moveTo(w.Lp[0].x, w.Lp[0].y)
  trace(ctx, w.Lp)
  const T = w.Tp.slice().reverse()
  ctx.lineTo(T[0].x, T[0].y)
  trace(ctx, T)
  ctx.lineTo(w.root.x, w.root.y)
  ctx.closePath()
}

// Four tentacles that grow out of the top of the head in its own jelly, orange
// at the tips. They reach, curl in around the heart, then shrink back into the
// head until nothing is left.
function tentacles(a: Angel, h: Frame, now: number): Tentacle[] {
  const { cones, grab, sc } = a
  if (cones < 0.01) return []
  const len = cones * a.reach
  const n = 20
  return [
    [-4.2, -0.5],
    [-1.5, -0.17],
    [1.5, 0.17],
    [4.2, 0.5],
  ].map(([v, lean], k) => {
    let p = at(h, 0.6 * sc, v * sc)
    const ang = Math.atan2(h.d.y, h.d.x) + lean * (1 - grab * 0.55)
    const sway = Math.sin(now / 340 + k * 1.9)
    const curl = -Math.sign(lean) * (grab * (Math.abs(lean) > 0.3 ? 1.3 : 0.6) + sway * 1.25 * (1 - grab * 0.5))
    const wig = 0.75 * (1 - grab * 0.4)
    const pts = [{ x: p.x, y: p.y, a: ang }]
    for (let j = 1; j <= n; j++) {
      const t = j / n
      const aj = ang + curl * t * t + Math.sin(now / 260 + k * 1.7 - t * 7.5) * wig * t * 1.3
      p = { x: p.x + (Math.cos(aj) * len) / n, y: p.y + (Math.sin(aj) * len) / n }
      pts.push({ x: p.x, y: p.y, a: aj })
    }
    return { pts, w0: 4.3 * sc * (0.55 + 0.45 * cones), w1: 1.2 * sc, tip: pts[n] }
  })
}

function tentaclePath(ctx: Ctx, t: Tentacle) {
  const l: Pt[] = []
  const r: Pt[] = []
  const n = t.pts.length - 1
  t.pts.forEach((q, j) => {
    const w = lerp(t.w0, t.w1, j / n)
    const nx = -Math.sin(q.a)
    const ny = Math.cos(q.a)
    l.push({ x: q.x + nx * w, y: q.y + ny * w })
    r.push({ x: q.x - nx * w, y: q.y - ny * w })
  })
  ctx.beginPath()
  ctx.moveTo(l[0].x, l[0].y)
  trace(ctx, l)
  const e = t.pts[n]
  ctx.arc(e.x, e.y, t.w1, e.a + Math.PI / 2, e.a - Math.PI / 2, true)
  r.reverse()
  trace(ctx, r)
  ctx.closePath()
}

/** Where the heart is held between the tentacle tips. */
function grip(T: Tentacle[]): Pt | null {
  if (!T.length) return null
  return { x: T.reduce((s, t) => s + t.tip.x, 0) / T.length, y: T.reduce((s, t) => s + t.tip.y, 0) / T.length }
}

/** A soft radial patch on the body. */
function organ(ctx: Ctx, f: Frame, rx: number, ry: number, stops: string[]) {
  ctx.save()
  ctx.translate(f.p.x, f.p.y)
  ctx.rotate(f.r)
  ctx.scale(1, ry / rx)
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx)
  stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c))
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(0, 0, rx, 0, TAU)
  ctx.fill()
  ctx.restore()
}

function stamp(ctx: Ctx, img: HTMLCanvasElement, x: number, y: number, s: number, alpha: number) {
  ctx.globalAlpha = alpha
  ctx.drawImage(img, x - s / 2, y - s / 2, s, s)
}

/** Draws added light. */
function add(ctx: Ctx, fn: () => void) {
  ctx.globalCompositeOperation = 'lighter'
  fn()
  ctx.globalCompositeOperation = 'source-over'
  ctx.globalAlpha = 1
}

/** One heart size from start to finish. */
const heartSize = (a: Angel) => 17 * a.sc

export class AngelPainter {
  private p: AngelPalette
  private neck: HTMLCanvasElement
  private organs: HTMLCanvasElement
  private belly: HTMLCanvasElement
  private love: HTMLCanvasElement
  private dot: HTMLCanvasElement
  private halo: HTMLCanvasElement
  private haloCtx: Ctx
  /** The side of the square the halo covers, in px. */
  private R = 0

  constructor(palette: PaletteName = 'ice') {
    const p = PALETTES[palette]
    this.p = p
    this.neck = glow(p.neckGlow, 128)
    this.organs = glow(p.organGlow, 96)
    this.belly = glow(p.stomachGlow, 128)
    this.love = glow(p.heartGlow, 128)
    this.dot = radial(16, [
      [0, `rgba(${p.speck[0]},1)`],
      [0.5, `rgba(${p.speck[1]},.7)`],
      [1, `rgba(${p.speck[1]},0)`],
    ])
    ;[this.halo, this.haloCtx] = canvas2d(32)
  }

  /** Draws the waiting heart, then the angel, onto a context in CSS pixels. */
  draw(ctx: Ctx, a: Angel, now: number) {
    const { heart } = a
    if (heart.state === 'free' && heart.shown) this.drawHeart(ctx, heart.x, heart.y, heartSize(a), 0, now, 2.6)
    this.drawAngel(ctx, a, now)
  }

  private fit(L: number) {
    const R = L * 2.4
    if (R === this.R) return
    this.R = R
    this.halo.width = this.halo.height = Math.round(clamp(R / 4, 32, 140))
  }

  private drawHeart(ctx: Ctx, x: number, y: number, size: number, r: number, now: number, spread: number) {
    const s = size * (1 + 0.07 * Math.max(0, Math.sin((now / 1000) * TAU * 1.1)) ** 3)
    add(ctx, () => stamp(ctx, this.love, x, y, s * spread, 0.55))
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(r)
    const wobble = Math.sin(now / 240) * 0.06
    ctx.scale(1 + wobble, 1 - wobble)
    ctx.beginPath()
    HEART.forEach(([hx, hy], i) => (i ? ctx.lineTo(hx * s, hy * s) : ctx.moveTo(hx * s, hy * s)))
    ctx.closePath()
    const g = ctx.createRadialGradient(-s * 0.15, -s * 0.15, 0, 0, 0, s * 0.6)
    g.addColorStop(0, this.p.heart[0])
    g.addColorStop(0.5, this.p.heart[1])
    g.addColorStop(1, this.p.heart[2])
    ctx.fillStyle = g
    ctx.fill()
    ctx.restore()
  }

  // The halo: drawn small and blurred with a shadow only (no hard-edged fill),
  // so scaling it up never shows steps.
  private paintHalo(a: Angel, ox: number, oy: number, F: Frame[], wings: Wing[], T: Tentacle[]) {
    const c = this.haloCtx
    const size = this.halo.width
    const k = size / this.R
    const OFF = 4000
    c.setTransform(1, 0, 0, 1, 0, 0)
    c.clearRect(0, 0, size, size)
    c.setTransform(k, 0, 0, k, (-ox - OFF / k) * k, -oy * k)
    c.shadowOffsetX = OFF
    c.shadowBlur = size * 0.06
    c.shadowColor = `rgba(${this.p.halo},1)`
    c.fillStyle = '#000'
    for (const w of wings) {
      wingPath(c, w)
      c.fill()
    }
    for (const t of T) {
      tentaclePath(c, t)
      c.fill()
    }
    bodyPath(c, F, a.sc)
    c.fill()
    c.shadowOffsetX = 0
    c.shadowBlur = 0
    c.setTransform(k, 0, 0, k, -ox * k, -oy * k)
    const r = a.L * 0.16
    organ(c, nearest(F, 0.89), r, r, rgba(this.p.headHalo))
    organ(c, nearest(F, 0.47), r, r, rgba(a.heart.state === 'carried' ? this.p.fullHalo : this.p.stomachHalo))
  }

  private drawAngel(ctx: Ctx, a: Angel, now: number) {
    const { L, sc, heart } = a
    this.fit(L)
    const { R, halo, dot, p } = this
    const edge = `rgb(${p.edge})`
    const middle = `rgb(${p.middle})`
    const F: Frame[] = []
    for (let i = 0; i <= N; i++) F.push(frameAt(a, i))
    const h = F[0]
    const full = heart.state === 'carried'
    const shoulder = nearest(F, 0.69)
    const wings = [1, -1].map((o) => wing(a, shoulder, o))
    const T = tentacles(a, h, now)
    const c = pos(F, 0.55, 0)
    const ox = c.x - R / 2
    const oy = c.y - R / 2
    this.paintHalo(a, ox, oy, F, wings, T)
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    add(ctx, () => {
      ctx.globalAlpha = 0.6
      ctx.drawImage(halo, ox, oy, R, R)
    })

    // The heart on its way in. It is held at the tentacle tips, pulled up to the
    // head, then slides down through the head and neck to the stomach, swelling
    // the body as it passes. Outside, it is drawn first, so the tentacles wrap over it.
    const hf = nearest(F, 0.55)
    const hs = heartSize(a)
    const hr = hf.r + Math.PI / 2
    let inside: (Pt & { r: number }) | null = null
    if (heart.state === 'eat') {
      const e = a.eatT
      const mouth = at(h, 1.5 * sc, 0)
      if (e < 1) {
        const g = grip(T) ?? mouth
        const held = smooth(clamp((e - 0.35) / 0.3, 0, 1)) * 0.6
        const pulled = smooth(clamp((e - 0.65) / 0.35, 0, 1))
        const x = lerp(lerp(heart.x, g.x, held), mouth.x, pulled)
        const y = lerp(lerp(heart.y, g.y, held), mouth.y, pulled)
        this.drawHeart(ctx, x, y, hs, 0, now, 2.6)
      } else {
        const u = smooth(clamp((e - 1) / 0.45, 0, 1))
        inside = { ...pos(F, lerp(0.97, 0.55, u), 0), r: lerp(0, hr, u) }
      }
    }

    // Wings and tentacles at full resolution, kept outside the body so they grow out of it with no seam.
    const m = nearest(F, 0.4)
    const ea = at(m, 0, m.w)
    const eb = at(m, 0, -m.w)
    const jelly = ctx.createLinearGradient(ea.x, ea.y, eb.x, eb.y)
    jelly.addColorStop(0, edge)
    jelly.addColorStop(0.28, middle)
    jelly.addColorStop(0.72, middle)
    jelly.addColorStop(1, edge)
    ctx.save()
    ctx.beginPath()
    ctx.rect(ox - R, oy - R, R * 3, R * 3)
    bodyOutline(ctx, F, sc)
    ctx.clip('evenodd')
    // Thin membranes: more see-through than the body, brightening toward the edge.
    ctx.globalAlpha = 0.66
    for (const w of wings) {
      const g = ctx.createLinearGradient(w.f0.x, w.f0.y, w.tip.x, w.tip.y)
      g.addColorStop(0, middle)
      g.addColorStop(1, `rgb(${p.wingTip})`)
      wingPath(ctx, w)
      ctx.fillStyle = g
      ctx.fill()
    }
    // Specks in the membranes too.
    for (const w of wings) {
      for (const k of WING_SPECKS) {
        const j = Math.floor(k.u * (w.Lp.length - 1))
        const x = lerp(w.Lp[j].x, w.Tp[j].x, k.f)
        const y = lerp(w.Lp[j].y, w.Tp[j].y, k.f)
        stamp(ctx, dot, x, y, k.r * sc * 2, k.a)
      }
    }
    // Same paint as the body at the base, warming to orange only toward the tip.
    ctx.globalAlpha = p.body
    for (const t of T) {
      const b = t.pts[0]
      const g = ctx.createLinearGradient(b.x, b.y, t.tip.x, t.tip.y)
      g.addColorStop(0, `rgba(${p.tentacle},0)`)
      g.addColorStop(0.45, `rgba(${p.tentacle},0)`)
      g.addColorStop(1, `rgba(${p.tentacle},1)`)
      tentaclePath(ctx, t)
      ctx.fillStyle = jelly
      ctx.fill()
      ctx.fillStyle = g
      ctx.fill()
    }
    ctx.restore()

    ctx.globalAlpha = p.body
    bodyPath(ctx, F, sc)
    ctx.fillStyle = jelly
    ctx.fill()
    ctx.globalAlpha = 1

    // Organs, all soft: a red-orange glow in the head fading into a pink column
    // down the neck, the stomach, the tail tip.
    ctx.save()
    bodyPath(ctx, F, sc)
    ctx.clip()
    const hd = nearest(F, 0.89)
    const col = nearest(F, 0.74)
    const st = nearest(F, 0.47)
    const tl = nearest(F, 0.04)
    organ(ctx, col, L * 0.2, col.w * 0.42, rgba(p.column))
    organ(ctx, hd, L * 0.09, hd.w * 0.6, rgba(p.head))
    organ(ctx, st, L * 0.1, st.w * 0.55, rgba(full ? p.stomachFull : p.stomach))
    organ(ctx, tl, L * 0.07, tl.w * 1.8, rgba(p.tail))
    for (const s of SPECKS) {
      const q = pos(F, s.s, s.o)
      stamp(ctx, dot, q.x, q.y, s.r * sc * 2, s.a)
    }
    ctx.globalAlpha = 1
    ctx.restore()

    add(ctx, () => {
      for (const s of [0.9, 0.84, 0.78, 0.72, 0.66, 0.6]) {
        const q = pos(F, s, 0)
        stamp(ctx, this.neck, q.x, q.y, L * (s > 0.8 ? 0.22 : 0.17), s > 0.8 ? 0.35 : 0.28)
      }
      stamp(ctx, this.organs, hd.p.x, hd.p.y, L * 0.22, 0.55)
      if (!full) stamp(ctx, this.belly, st.p.x, st.p.y, L * 0.32, 0.6)
      const t = pos(F, 0.05, 0)
      stamp(ctx, this.organs, t.x, t.y, L * 0.14, 0.6)
      ctx.globalAlpha = 0.1
      ctx.drawImage(halo, ox, oy, R, R)
    })
    if (full) {
      ctx.globalAlpha = 0.92
      this.drawHeart(ctx, hf.p.x, hf.p.y, hs, hr, now, 3.4)
      ctx.globalAlpha = 1
      add(ctx, () => stamp(ctx, this.love, hf.p.x, hf.p.y, L * 0.6, 0.3))
    }
    // After eating: a pink pulse spreads out from the stomach.
    if (a.joy > 0) {
      const j = 1 - a.joy / JOY
      add(ctx, () => {
        stamp(ctx, this.love, hf.p.x, hf.p.y, L * (0.5 + j * 1.6), 0.55 * (1 - j))
        stamp(ctx, this.love, hf.p.x, hf.p.y, L * 0.9, 0.25 * (1 - j))
      })
    }
    if (inside) {
      ctx.globalAlpha = 0.92
      this.drawHeart(ctx, inside.x, inside.y, hs, inside.r, now, 3)
      ctx.globalAlpha = 1
    }
  }
}
