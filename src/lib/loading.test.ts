import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { content } from '../content'
import { images, markReady, prepare, whenReady } from './loading'

const LIMITS = { minMs: 900, capMs: 10_000 }
const after = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

beforeEach(() => {
  vi.useFakeTimers()
})
afterEach(() => {
  vi.useRealTimers()
})

/** Runs the steps, and keeps what was shown and when it was over. */
function run(steps: { line: string; done: Promise<unknown> }[]) {
  const start = Date.now()
  const shown: [string, number][] = []
  const result = { shown, over: -1 }
  void prepare(steps, (line) => shown.push([line, Date.now() - start]), LIMITS).then(() => {
    result.over = Date.now() - start
  })
  return result
}

describe('prepare', () => {
  it('shows every line in order, each long enough to read', async () => {
    const r = run(['a', 'b', 'c'].map((line) => ({ line, done: Promise.resolve() })))
    await vi.advanceTimersByTimeAsync(5000)
    expect(r.shown).toEqual([
      ['a', 0],
      ['b', 900],
      ['c', 1800],
    ])
    expect(r.over).toBe(2700)
  })

  it('holds a line until its step is done', async () => {
    const r = run([
      { line: 'slow', done: after(4000) },
      { line: 'next', done: Promise.resolve() },
    ])
    await vi.advanceTimersByTimeAsync(3999)
    expect(r.shown).toHaveLength(1)
    await vi.advanceTimersByTimeAsync(2000)
    expect(r.shown[1]).toEqual(['next', 4000])
    expect(r.over).toBe(4900)
  })

  it('carries on when a step fails', async () => {
    const r = run([
      { line: 'broken', done: Promise.reject(new Error('no')) },
      { line: 'next', done: Promise.resolve() },
    ])
    await vi.advanceTimersByTimeAsync(5000)
    expect(r.over).toBe(1800)
  })

  it('never takes longer than the cap', async () => {
    const r = run([
      { line: 'never', done: new Promise(() => {}) },
      { line: 'unreached', done: new Promise(() => {}) },
    ])
    await vi.advanceTimersByTimeAsync(20_000)
    expect(r.shown).toEqual([['never', 0]])
    expect(r.over).toBe(10_000)
  })
})

describe('whenReady', () => {
  it('waits for the mark', async () => {
    let ready = false
    void whenReady('flowers').then(() => {
      ready = true
    })
    await vi.advanceTimersByTimeAsync(10)
    expect(ready).toBe(false)
    markReady('flowers')
    await vi.advanceTimersByTimeAsync(0)
    expect(ready).toBe(true)
  })
})

describe('images', () => {
  it('finds each image once, however deep, and nothing else', () => {
    const value = {
      a: '/x.webp',
      b: [{ c: '/y.png' }, '/x.webp'],
      d: 'https://z.com/z.webp',
      e: '/page',
      f: null,
      g: 3,
    }
    expect(images(value)).toEqual(['/x.webp', '/y.png'])
  })

  it("finds the site's photos", () => {
    const found = images(content)
    expect(found).toContain(content.hero.portrait.src)
    expect(found).toContain(content.contact.selfie.src)
    for (const p of content.projects) expect(found).toContain(p.thumbnail)
  })
})
