import { describe, expect, it } from 'vitest'
import { ANGEL_SWIM, clamp, ease, KOI_SWIM, move, steer, wrap, type Swimmer } from './swim'

const swimmer = (over: Partial<Swimmer> = {}): Swimmer => ({ x: 0, y: 0, angle: 0, av: 0, speed: 0, ...over })

/** The koi's steering before it was shared, word for word. */
function oldKoi(f: Swimmer, tx: number, ty: number, dt: number, opts: { turn: number; top: number; idle: number }) {
  const k = dt * 60
  const dx = tx - f.x
  const dy = ty - f.y
  const dist = Math.hypot(dx, dy)
  const maxAv = opts.turn * 60
  let wantAv: number
  if (dist < opts.idle) {
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
}

describe('ease', () => {
  it('covers the same ground in a second at 60 and 144 Hz', () => {
    const run = (hz: number) => {
      let v = 0
      for (let i = 0; i < hz; i++) v = ease(v, 10, 3, 1 / hz)
      return v
    }
    expect(run(60)).toBeCloseTo(run(144), 9)
  })
})

describe('wrap', () => {
  it('brings angles past half a turn back the short way', () => {
    expect(wrap(Math.PI + 0.1)).toBeCloseTo(-Math.PI + 0.1)
    expect(wrap(-Math.PI - 0.1)).toBeCloseTo(Math.PI - 0.1)
    expect(wrap(0.5)).toBeCloseTo(0.5)
  })
})

describe('steer', () => {
  it('never turns faster than its limit', () => {
    const s = swimmer({ angle: Math.PI })
    for (let i = 0; i < 300; i++) {
      steer(s, 500, 1, 1 / 60, ANGEL_SWIM, { turn: 0.08, top: 7, idle: 0 })
      move(s, 1)
      expect(Math.abs(s.av)).toBeLessThanOrEqual(0.08 * 60 + 1e-9)
    }
  })

  it('circles when it is within idle, carrying on the way it was turning', () => {
    const s = swimmer({ x: 10, av: -0.5, speed: 1.2 })
    for (let i = 0; i < 120; i++) steer(s, 0, 0, 1 / 60, ANGEL_SWIM, { turn: 0.08, top: 7, idle: 90 })
    expect(s.av).toBeCloseTo(-2, 3)
    expect(s.speed).toBeCloseTo(1.2, 3)
  })

  it('does not move the swimmer, and returns the distance', () => {
    const s = swimmer()
    expect(steer(s, 3, 4, 1 / 60, ANGEL_SWIM, { turn: 0.08, top: 7, idle: 0 })).toBe(5)
    expect([s.x, s.y]).toEqual([0, 0])
  })

  it('swims the koi exactly as it did before the steering was shared', () => {
    const a = swimmer({ x: 400, y: 300, angle: 1 })
    const b = { ...a }
    const opts = { turn: 0.09, top: 11, idle: 70 }
    for (let i = 0; i < 900; i++) {
      const tx = 400 + Math.cos(i / 60) * 300
      const ty = 300 + Math.sin(i / 37) * 200
      const dt = i % 3 ? 1 / 60 : 1 / 144
      steer(a, tx, ty, dt, KOI_SWIM, opts)
      move(a, dt * 60)
      oldKoi(b, tx, ty, dt, opts)
    }
    expect(a.x).toBeCloseTo(b.x, 6)
    expect(a.y).toBeCloseTo(b.y, 6)
    expect(a.speed).toBeCloseTo(b.speed, 9)
  })
})
