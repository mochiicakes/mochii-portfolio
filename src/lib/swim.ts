// How a creature swims: shared steering, with each creature's own tuning.

export type Swimmer = {
  x: number
  y: number
  angle: number
  /** Turning speed, rad/s. Eased, so turns start and end smoothly. */
  av: number
  /** px per 60 Hz frame (the units the steering was tuned in). */
  speed: number
}

/** The feel of one creature. Rates are per second. */
export type Tuning = {
  /** How hard it turns for how far off course it is. */
  gain: number
  /** Turning speed of the lazy circle, rad/s. */
  circle: number
  /** How fast the turning speed eases. */
  turnEase: number
  /** Swimming speed: `base` plus `slope` per px to the target, up to the top speed. */
  base: number
  slope: number
  /** Speed while circling. */
  idleSpeed: number
  /** How fast the swimming speed eases. */
  speedEase: number
}

export type SteerOpts = {
  /** Top turning speed, rad per 60 Hz frame. */
  turn: number
  top: number
  /** Within this many px it circles instead of heading for the target. */
  idle: number
}

export const ANGEL_SWIM: Tuning = {
  gain: 6,
  circle: 2,
  turnEase: 8,
  base: 1,
  slope: 0.04,
  idleSpeed: 1.2,
  speedEase: 4,
}

/** Eases `a` toward `b` at `rate` per second, the same at any frame rate. */
export const ease = (a: number, b: number, rate: number, dt: number) => a + (b - a) * (1 - Math.exp(-rate * dt))
export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
/** The same angle, between -π and π. */
export const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))

/**
 * Steer toward a target the way a fish swims: turn smoothly up to a limited
 * rate, ease the speed, and circle lazily when the target is close. Returns the
 * distance to the target. It does not move the swimmer: see `move`.
 */
export function steer(s: Swimmer, x: number, y: number, dt: number, t: Tuning, opts: SteerOpts): number {
  const dx = x - s.x
  const dy = y - s.y
  const dist = Math.hypot(dx, dy)
  const maxAv = opts.turn * 60
  const near = dist < opts.idle
  // Close enough: a lazy circle, carrying on the way it was already turning.
  const wantAv = near
    ? Math.sign(s.av || 1) * Math.min(maxAv, t.circle)
    : clamp(wrap(Math.atan2(dy, dx) - s.angle) * t.gain, -maxAv, maxAv)
  s.av = ease(s.av, wantAv, t.turnEase, dt)
  s.angle += s.av * dt
  s.speed = ease(s.speed, near ? t.idleSpeed : Math.min(opts.top, t.base + dist * t.slope), t.speedEase, dt)
  return dist
}

/** Swims forward for `k` 60 Hz frames. */
export function move(s: Swimmer, k: number) {
  s.x += Math.cos(s.angle) * s.speed * k
  s.y += Math.sin(s.angle) * s.speed * k
}
