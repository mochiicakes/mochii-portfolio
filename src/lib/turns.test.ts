import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { takeTurns } from './turns'

beforeEach(() => {
  vi.useFakeTimers()
})
afterEach(() => {
  vi.useRealTimers()
})

function start(count = 3) {
  const shown: number[] = []
  return { shown, turns: takeTurns(count, 7000, (i) => shown.push(i)) }
}

describe('takeTurns', () => {
  it('moves on in time, and wraps from the last to the first', () => {
    const { shown } = start()
    vi.advanceTimersByTime(6999)
    expect(shown).toEqual([])
    vi.advanceTimersByTime(21_001)
    expect(shown).toEqual([1, 2, 0, 1])
  })

  it('waits while held, then gives the one showing its full time again', () => {
    const { shown, turns } = start()
    vi.advanceTimersByTime(5000)
    turns.hold('pointer', true)
    vi.advanceTimersByTime(60_000)
    expect(shown).toEqual([])
    turns.hold('pointer', false)
    vi.advanceTimersByTime(6999)
    expect(shown).toEqual([])
    vi.advanceTimersByTime(1)
    expect(shown).toEqual([1])
  })

  it('moves only once nothing holds it', () => {
    const { shown, turns } = start()
    turns.hold('pointer', true)
    turns.hold('away', true)
    turns.hold('pointer', false)
    vi.advanceTimersByTime(20_000)
    expect(shown).toEqual([])
    turns.hold('away', false)
    vi.advanceTimersByTime(7000)
    expect(shown).toEqual([1])
  })

  it('does not start its time again when a hold it never had is let go', () => {
    const { shown, turns } = start()
    vi.advanceTimersByTime(6000)
    turns.hold('away', false)
    vi.advanceTimersByTime(1000)
    expect(shown).toEqual([1])
  })

  it('never moves again once stopped', () => {
    const { shown, turns } = start()
    turns.hold('pointer', true)
    turns.stop()
    turns.hold('pointer', false)
    vi.advanceTimersByTime(60_000)
    expect(shown).toEqual([])
  })

  it('has nothing to do with only one', () => {
    const { shown } = start(1)
    vi.advanceTimersByTime(60_000)
    expect(shown).toEqual([])
  })
})
