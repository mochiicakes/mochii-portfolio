import { afterEach, describe, expect, it, vi } from 'vitest'
import { EATEN_KEY, heartEaten, markHeartEaten } from './htmlState'

afterEach(() => vi.unstubAllGlobals())

describe('the eaten heart', () => {
  it('is remembered once it has been eaten', () => {
    const kept = new Map<string, string>()
    vi.stubGlobal('sessionStorage', {
      getItem: (k: string) => kept.get(k) ?? null,
      setItem: (k: string, v: string) => kept.set(k, v),
    })
    expect(heartEaten()).toBe(false)
    markHeartEaten()
    expect(kept.has(EATEN_KEY)).toBe(true)
    expect(heartEaten()).toBe(true)
  })

  it('is simply uneaten when storage is blocked', () => {
    const blocked = () => {
      throw new Error('blocked')
    }
    vi.stubGlobal('sessionStorage', { getItem: blocked, setItem: blocked })
    expect(() => markHeartEaten()).not.toThrow()
    expect(heartEaten()).toBe(false)
  })
})
