import { describe, expect, it } from 'vitest'
import { largestFit, MAX_FIT, maxFit, MIN_FIT } from './fit'

describe('largestFit', () => {
  it('leaves a screen that already fits alone', () => {
    expect(largestFit(() => true)).toBe(1)
  })

  it('finds the largest scale that fits, and never one that does not', () => {
    const s = largestFit((x) => 1000 * x <= 850)
    expect(s).toBeLessThanOrEqual(0.85)
    expect(s).toBeGreaterThan(0.84)
  })

  it('never goes below the smallest readable scale', () => {
    expect(largestFit((x) => 5000 * x <= 800)).toBe(MIN_FIT)
  })

  it('grows to fill a big window, up to the limit given', () => {
    expect(largestFit(() => true, MIN_FIT, 1.6)).toBe(1.6)
    const s = largestFit((x) => 800 * x <= 1000, MIN_FIT, 1.6)
    expect(s).toBeLessThanOrEqual(1.25)
    expect(s).toBeGreaterThan(1.23)
  })
})

describe('maxFit', () => {
  it('is 1 on a small laptop', () => {
    expect(maxFit(1366, 650)).toBe(1)
    expect(maxFit(1280, 720)).toBe(1)
    expect(maxFit(1024, 768)).toBe(1)
    expect(maxFit(1440, 810)).toBe(1)
  })

  it('follows whichever side of the window is tighter', () => {
    expect(maxFit(1536, 960)).toBeCloseTo(960 / 820)
    expect(maxFit(1920, 1080)).toBeCloseTo(1080 / 820)
    expect(maxFit(1400, 1300)).toBeCloseTo(1400 / 1290)
  })

  it('stops growing on a very big screen', () => {
    expect(maxFit(2551, 1339)).toBe(MAX_FIT)
    expect(maxFit(3840, 2160)).toBe(MAX_FIT)
  })
})
