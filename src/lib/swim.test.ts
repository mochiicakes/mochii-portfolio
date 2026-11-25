import { describe, expect, it } from 'vitest'
import { ANGEL_SWIM, ease, move, steer, wrap, type Swimmer } from './swim'

const swimmer = (over: Partial<Swimmer> = {}): Swimmer => ({ x: 0, y: 0, angle: 0, av: 0, speed: 0, ...over })

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
})
