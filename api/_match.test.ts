import { describe, expect, it } from 'vitest'
import { plain, score } from './_match.js'

describe('plain', () => {
  it('strips brackets, accents and feat. credits', () => {
    expect(plain('Café (Interlude) feat. X')).toBe('cafe')
    expect(plain('(Interlude)')).toBe('')
  })
})

describe('score', () => {
  it('returns 0 when the Spotify artist is empty', () => {
    expect(score({ trackName: 'Song', artistName: 'Anyone', previewUrl: 'u' }, 'Song', '')).toBe(0)
  })

  it('returns 0 when the title is bracket-only', () => {
    expect(score({ trackName: 'Other', artistName: 'Artist', previewUrl: 'u' }, '(Interlude)', 'Artist')).toBe(0)
  })

  it('returns 0 when the Apple artistName plains to empty', () => {
    expect(score({ trackName: 'Song', artistName: '(Anyone)', previewUrl: 'u' }, 'Song', 'Artist')).toBe(0)
  })

  it('scores an exact title and artist match highest', () => {
    expect(score({ trackName: 'Song', artistName: 'Artist', previewUrl: 'u' }, 'Song', 'Artist')).toBe(4.5)
  })

  it('ranks the original above a remix when Spotify has the original', () => {
    const original = score({ trackName: 'Song', artistName: 'Artist', previewUrl: 'u' }, 'Song', 'Artist')
    const remix = score({ trackName: 'Song (Remix)', artistName: 'Artist', previewUrl: 'u' }, 'Song', 'Artist')
    expect(original).toBe(4.5)
    expect(remix).toBe(1.5)
    expect(original).toBeGreaterThan(remix)
  })

  it('returns 0 without a previewUrl', () => {
    expect(score({ trackName: 'Song', artistName: 'Artist' }, 'Song', 'Artist')).toBe(0)
  })
})
