// Matching helpers for api/recently-played.ts. The underscore keeps Vercel from
// deploying this file as a function of its own.

/** Lower case, without accents, brackets or "feat." credits, for loose matching. */
export const plain = (s: string) =>
  s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\(.*?\)|\[.*?\]|feat\..*$/gi, '')
    .replace(/[^a-z0-9]+/gi, ' ')
    .trim()
    .toLowerCase()

export type ItunesSong = { trackName: string; artistName: string; previewUrl?: string }

/** Remixes, live takes and the like: only a match when the Spotify title is one too. */
const VARIANT = /\b(remix|version|live|acoustic|sped|slowed|instrumental|karaoke|demo|edit|mix)\b/i

/** How well an Apple result matches the Spotify song; 0 is no match. */
export function score(r: ItunesSong, title: string, artist: string): number {
  if (!r.previewUrl) return 0
  const a = plain(artist)
  // An empty name would be "contained" in every other name.
  if (!a) return 0
  const ra = plain(r.artistName)
  if (!ra) return 0
  if (!(ra.includes(a) || a.includes(ra))) return 0
  const t = plain(title)
  if (!t) return 0
  const rt = plain(r.trackName)
  if (!rt.includes(t)) return 0
  // Same title exactly, then the same once brackets are dropped, then contained.
  let s = r.trackName.toLowerCase() === title.toLowerCase() ? 4 : rt === t ? 3 : 1
  if (VARIANT.test(r.trackName) && !VARIANT.test(title)) s -= 2
  if (ra === a) s += 0.5
  return Math.max(s, 0.1)
}
