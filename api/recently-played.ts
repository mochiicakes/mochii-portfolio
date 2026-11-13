// GET /api/recently-played: the songs Michaella played last on Spotify, for the
// "Recently played" screen in casual mode. A Vercel function; in `npm run dev`
// the plugin in vite.config.ts serves it.
//
// Spotify no longer gives new apps 30-second previews, so each song's preview
// comes from Apple's public iTunes catalogue, matched by title and artist.
//
// Env: SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN (see
// `npm run spotify:token`), and optionally SPOTIFY_HIDE: comma-separated track
// or artist ids to keep off the page.

import type { PlayedTrack as Track } from '../src/types.ts'

export type RecentlyPlayed = { tracks: Track[]; reason?: string }

const SHOW = 8

type SpotifyArtist = { id: string; name: string }
type SpotifyItem = {
  played_at: string
  track: {
    id: string
    name: string
    artists: SpotifyArtist[]
    album: { name: string; images: { url: string; width: number | null }[] }
    external_urls: { spotify: string }
  }
}

const json = (body: RecentlyPlayed, cache: string) =>
  new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': cache },
  })

async function accessToken(): Promise<string> {
  const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret, SPOTIFY_REFRESH_TOKEN: refresh } = process.env
  if (!id || !secret || !refresh) throw new Error('Spotify is not set up (missing env vars)')
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refresh }),
  })
  if (!res.ok) throw new Error(`Spotify token: ${res.status}`)
  return ((await res.json()) as { access_token: string }).access_token
}

/** Lower case, without accents, brackets or "feat." credits, for loose matching. */
const plain = (s: string) =>
  s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\(.*?\)|\[.*?\]|feat\..*$/gi, '')
    .replace(/[^a-z0-9]+/gi, ' ')
    .trim()
    .toLowerCase()

type ItunesSong = { trackName: string; artistName: string; previewUrl?: string }

/** Remixes, live takes and the like: only a match when the Spotify title is one too. */
const VARIANT = /\b(remix|version|live|acoustic|sped|slowed|instrumental|karaoke|demo|edit|mix)\b/i

/** How well an Apple result matches the Spotify song; 0 is no match. */
function score(r: ItunesSong, title: string, artist: string): number {
  if (!r.previewUrl) return 0
  const a = plain(artist)
  const ra = plain(r.artistName)
  if (!(ra.includes(a) || a.includes(ra))) return 0
  const t = plain(title)
  const rt = plain(r.trackName)
  if (!rt.includes(t)) return 0
  // Same title exactly, then the same once brackets are dropped, then contained.
  let s = r.trackName.toLowerCase() === title.toLowerCase() ? 4 : rt === t ? 3 : 1
  if (VARIANT.test(r.trackName) && !VARIANT.test(title)) s -= 2
  if (ra === a) s += 0.5
  return Math.max(s, 0.1)
}

/** Apple's 30-second preview for a song, matched on artist and title. */
async function preview(title: string, artist: string): Promise<string | null> {
  try {
    const q = new URLSearchParams({ term: `${title} ${artist}`, entity: 'song', limit: '10', media: 'music' })
    const res = await fetch(`https://itunes.apple.com/search?${q}`)
    if (!res.ok) return null
    const { results } = (await res.json()) as { results: ItunesSong[] }
    const best = results
      .map((r) => ({ r, s: score(r, title, artist) }))
      .filter((x) => x.s > 0)
      .sort((x, y) => y.s - x.s)[0]
    return best?.r.previewUrl ?? null
  } catch {
    return null
  }
}

export async function GET(): Promise<Response> {
  try {
    const token = await accessToken()
    const res = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=30', {
      headers: { authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error(`Spotify recently played: ${res.status}`)
    const { items } = (await res.json()) as { items: SpotifyItem[] }

    const hide = new Set((process.env.SPOTIFY_HIDE ?? '').split(',').map((s) => s.trim()).filter(Boolean))
    const seen = new Set<string>()
    const picked = items.filter(({ track }) => {
      if (!track || seen.has(track.id) || hide.has(track.id) || track.artists.some((a) => hide.has(a.id))) return false
      seen.add(track.id)
      return true
    }).slice(0, SHOW)

    const tracks = await Promise.all(
      picked.map(async ({ track, played_at }): Promise<Track> => {
        const images = [...track.album.images].sort((x, y) => (y.width ?? 0) - (x.width ?? 0))
        return {
          id: track.id,
          title: track.name,
          artists: track.artists.map((a) => a.name).join(', '),
          album: track.album.name,
          art: images[0]?.url ?? null,
          url: track.external_urls.spotify,
          playedAt: played_at,
          preview: await preview(track.name, track.artists[0]?.name ?? ''),
        }
      }),
    )
    // Fresh for five minutes at the edge, then served stale while it refreshes.
    return json({ tracks }, 'public, s-maxage=300, stale-while-revalidate=3600')
  } catch (e) {
    // The page shows a quiet empty state rather than an error.
    return json({ tracks: [], reason: e instanceof Error ? e.message : 'unknown' }, 'public, s-maxage=60')
  }
}
