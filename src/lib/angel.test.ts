import { describe, expect, it } from 'vitest'
import { newAngel, poseAngel, resizeAngel, updateAngel, type Angel, type AngelInput } from './angel'
import { wrap } from './swim'

const W = 1440
const H = 900
const DT = 1 / 60

const angelAt = (x: number, y: number, eaten = false) => {
  const a = newAngel(W, H, 's', eaten)
  poseAngel(a, x, y)
  return a
}
const none = (): AngelInput => ({ x: 0, y: 0, at: -1e9, has: false, tap: false })
/** A pointer that keeps moving, so it never goes idle. */
const live = (x: number, y: number): AngelInput => ({ x, y, at: 1e9, has: true, tap: false })

/** Runs for some seconds, from `from` ms. */
function run(a: Angel, input: AngelInput, seconds: number, from = 0, each?: (t: number) => void) {
  for (let i = 1; i <= Math.round(seconds * 60); i++) {
    updateAngel(a, input, DT, from + (i * 1000) / 60)
    each?.(i / 60)
  }
}

function numbers(v: unknown): number[] {
  if (typeof v === 'number') return [v]
  return v && typeof v === 'object' ? Object.values(v).flatMap(numbers) : []
}

/** An angel about to bite the heart above it. */
function biting() {
  const a = angelAt(700, 500)
  a.heart = { state: 'free', x: 700, y: 400, shown: true }
  let frames = 0
  while (a.mode !== 'eat' && frames++ < 600) updateAngel(a, none(), DT, frames * 16)
  return a
}

describe('size', () => {
  it('is a share of the smaller side, never under 64 px or over 224', () => {
    expect(angelAt(0, 0).L).toBeCloseTo(108)
    expect(newAngel(390, 844, 's', false).L).toBe(64)
    expect(newAngel(4000, 4000, 's', false).L).toBe(224)
  })

  it('changes with the window', () => {
    const a = angelAt(700, 400)
    resizeAngel(a, 1440, 1000, 's')
    expect(a.L).toBeCloseTo(120)
    expect(a.seg).toBeCloseTo(a.L / 20)
  })
})

describe('swimming', () => {
  it('hovers head-up, close to where it was, with no pointer', () => {
    const a = angelAt(700, 450)
    run(a, none(), 10)
    expect(a.mode).toBe('hover')
    expect(Math.abs(wrap(a.angle + Math.PI / 2))).toBeLessThan(0.05)
    expect(Math.hypot(a.x - 700, a.y - 450)).toBeLessThan(200)
  })

  it('swims back in when it hovers too near an edge', () => {
    const a = angelAt(-200, 450)
    run(a, none(), 12)
    expect(a.x).toBeGreaterThan(0)
  })

  it('chases a far pointer, then circles it', () => {
    const a = angelAt(200, 450)
    const seen: string[] = []
    run(a, live(1200, 450), 6, 0, () => {
      if (seen.at(-1) !== a.mode) seen.push(a.mode)
    })
    expect(seen[0]).toBe('chase')
    expect(seen).toContain('circle')
    expect(Math.hypot(a.x - 1200, a.y - 450)).toBeLessThan(200)
  })

  it('hovers once the mouse has been still for 1.6 s', () => {
    const a = angelAt(200, 450)
    const input = { ...live(1200, 450), at: 0 }
    run(a, input, 1.5)
    expect(a.mode).toBe('chase')
    run(a, input, 0.3, 1500)
    expect(a.mode).toBe('hover')
  })

  it('keeps circling a tap for as long as there is no other', () => {
    const a = angelAt(200, 450)
    const input = { ...live(1200, 450), at: 0, tap: true }
    run(a, input, 10)
    let far = 0
    run(a, input, 5, 10000, () => {
      expect(['circle', 'chase']).toContain(a.mode)
      far = Math.max(far, Math.hypot(a.x - 1200, a.y - 450))
    })
    expect(far).toBeLessThan(220)
  })
})

describe('the heart', () => {
  it('does not lure while it is off screen', () => {
    const a = angelAt(700, 450)
    a.heart = { state: 'free', x: 700, y: 420, shown: false }
    run(a, live(700, 420), 5)
    expect(a.heart.state).toBe('free')
  })

  it('lures when the pointer is near it', () => {
    const a = angelAt(200, 450)
    a.heart = { state: 'free', x: 1200, y: 450, shown: true }
    updateAngel(a, live(1200, 560), DT, 0)
    expect(a.mode).toBe('approach')
  })

  it('leaves the angel alone when pointer and angel are both far from it', () => {
    const a = angelAt(200, 450)
    a.heart = { state: 'free', x: 1200, y: 450, shown: true }
    updateAngel(a, live(300, 450), DT, 0)
    expect(a.mode).toBe('chase')
  })

  it('is eaten in 1.45 s: reach, curl, pull, swallow, then carried with a flutter', () => {
    const a = biting()
    expect(a.mode).toBe('eat')
    expect(a.heart.state).toBe('eat')
    run(a, none(), 0.4)
    expect(a.cones).toBe(1)
    run(a, none(), 0.22)
    expect(a.grab).toBe(1)
    run(a, none(), 0.6)
    expect(a.cones).toBe(0)
    expect(a.bulgeA).toBeGreaterThan(0)
    expect(a.heart.state).toBe('eat')
    run(a, none(), 0.3)
    expect(a.heart.state).toBe('carried')
    expect(a.joy).toBeGreaterThan(1)
    expect([a.cones, a.grab, a.bulgeA]).toEqual([0, 0, 0])
    run(a, none(), 1.3)
    expect(a.joy).toBe(0)
  })

  it('is reached from anywhere the pointer leads it', () => {
    for (const [x, y] of [
      [100, 100],
      [1300, 200],
      [720, 860],
    ]) {
      const a = angelAt(x, y)
      a.heart = { state: 'free', x: 720, y: 825, shown: true }
      run(a, live(720, 800), 12)
      expect(a.heart.state).toBe('carried')
    }
  })

  it('is eaten only once', () => {
    const a = angelAt(700, 450, true)
    a.heart.shown = true
    a.heart.x = 700
    a.heart.y = 420
    run(a, live(700, 420), 5, 0, () => expect(a.mode).not.toBe('eat'))
    expect(a.heart.state).toBe('carried')
  })
})

describe('every frame', () => {
  it('keeps every value finite and the spine evenly spaced, at any frame rate', () => {
    for (const dt of [1 / 240, 1 / 60, 0.05]) {
      const a = angelAt(700, 450)
      a.heart = { state: 'free', x: 720, y: 700, shown: true }
      for (let i = 0; i < 2000; i++) {
        updateAngel(a, live(720 + Math.cos(i / 20) * 600, 450 + Math.sin(i / 13) * 400), dt, i * dt * 1000)
      }
      expect(numbers(a).every(Number.isFinite)).toBe(true)
      for (let i = 1; i < a.spine.length; i++) {
        const gap = Math.hypot(a.spine[i].x - a.spine[i - 1].x, a.spine[i].y - a.spine[i - 1].y)
        expect(gap).toBeCloseTo(a.seg, 6)
      }
    }
  })
})
