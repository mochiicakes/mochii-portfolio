import { describe, expect, it } from 'vitest'
import { depthAt } from './depth'

describe('depthAt', () => {
  it('is 0 at the top and 1 at the bottom of a long page', () => {
    expect(depthAt(0, 9000, 900)).toBe(0)
    expect(depthAt(8100, 9000, 900)).toBe(1)
    expect(depthAt(4050, 9000, 900)).toBeCloseTo(0.5)
  })

  it('never leaves 0 to 1, even when the page is pulled past its ends', () => {
    expect(depthAt(-80, 9000, 900)).toBe(0)
    expect(depthAt(9999, 9000, 900)).toBe(1)
  })

  it('keeps a short page near the surface', () => {
    expect(depthAt(100, 1000, 900)).toBeLessThan(0.1)
  })

  it('is 0 on a page that does not scroll', () => {
    expect(depthAt(0, 900, 900)).toBe(0)
    expect(depthAt(50, 800, 900)).toBe(0)
  })
})
