import { describe, expect, it } from 'vitest'
import { Coverage, spread } from './deep'

describe('Coverage', () => {
  it('starts dark, and lights only what is near', () => {
    const c = new Coverage()
    expect(c.share).toBe(0)
    c.mark(150, 150, 60, 2400, 1400)
    expect(c.share).toBeGreaterThan(0)
    expect(c.share).toBeLessThan(0.02)
    for (const [x, y] of c.sources()) expect(Math.hypot(x * 2400 - 150, y * 1400 - 150)).toBeLessThanOrEqual(60)
  })

  it('counts a place once, however often it is lit', () => {
    const c = new Coverage()
    c.mark(500, 500, 120, 2400, 1400)
    const once = c.share
    c.mark(500, 500, 120, 2400, 1400)
    expect(c.share).toBe(once)
  })

  it('is fully lit by a light as big as the window, and takes one off its edge', () => {
    const c = new Coverage()
    c.mark(-500, -500, 100, 1440, 900)
    expect(c.share).toBe(0)
    c.mark(720, 450, 2000, 1440, 900)
    expect(c.share).toBe(1)
  })
})

describe('spread', () => {
  const half = () => 0.5

  it('covers the whole window', () => {
    const points = spread([], 1440, 900, 160, half)
    for (const [x, y] of [
      [0, 0],
      [1440, 0],
      [0, 900],
      [1440, 900],
      [720, 450],
    ]) {
      expect(Math.min(...points.map((p) => Math.hypot(p.x - x, p.y - y)))).toBeLessThan(160 * 1.3)
    }
  })

  it('starts beside the strokes, or in the middle without any', () => {
    const corner = spread([[0, 0]], 1440, 900, 160, half)[0]
    expect(Math.hypot(corner.x, corner.y)).toBeLessThan(160)
    const middle = spread([], 1440, 900, 160, half)[0]
    expect(Math.hypot(middle.x - 720, middle.y - 450)).toBeLessThan(160)
  })
})
