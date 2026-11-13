import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { content } from '../content'
import { modeStore } from '../lib/htmlState'
import type { PlayedTrack } from '../types'
import { ExternalLink } from './ui/ExternalLink'

const r = content.recentlyPlayed
const SKELETONS = 8
const VOLUME = 0.6
const FADE = 280 // ms

function ago(iso: string): string {
  const min = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (min < 2) return r.ago.now
  if (min < 60) return r.ago.minutes.replace('{n}', String(min))
  if (min < 48 * 60) return r.ago.hours.replace('{n}', String(Math.round(min / 60)))
  return r.ago.days.replace('{n}', String(Math.round(min / 1440)))
}

/**
 * The songs Michaella played last on Spotify, live (api/recently-played.ts).
 * Hovering a song plays its 30-second preview, faded in and out; clicking it
 * opens the song on Spotify. On touch screens, where there is no hover, each
 * song has a play button instead. Only fetched in casual mode, as the screen
 * comes near; the pre-rendered page shows empty cards in its place.
 */
export function RecentlyPlayed() {
  const mode = useSyncExternalStore(modeStore.subscribe, modeStore.get, modeStore.getServer)
  const root = useRef<HTMLDivElement>(null)
  const [tracks, setTracks] = useState<PlayedTrack[] | null>(null)
  const [playing, setPlaying] = useState<string | null>(null)
  const [hint, setHint] = useState(false)
  const audio = useRef<HTMLAudioElement | null>(null)
  const fade = useRef(0)

  // Fetch once, when casual mode shows and the screen comes near.
  useEffect(() => {
    const el = root.current
    if (mode !== 'casual' || tracks || !el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        io.disconnect()
        fetch('/api/recently-played')
          .then((res) => res.json() as Promise<{ tracks?: PlayedTrack[] }>)
          .then((data) => setTracks(data.tracks ?? []))
          .catch(() => setTracks([]))
      },
      { rootMargin: '600px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [mode, tracks])

  /** Eases the volume to `to`, then calls `done`. */
  const ramp = useCallback((to: number, done?: () => void) => {
    const a = audio.current
    if (!a) return
    cancelAnimationFrame(fade.current)
    const from = a.volume
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / FADE)
      a.volume = from + (to - from) * t
      if (t < 1) fade.current = requestAnimationFrame(step)
      else done?.()
    }
    fade.current = requestAnimationFrame(step)
  }, [])

  const stop = useCallback(() => {
    ramp(0, () => audio.current?.pause())
  }, [ramp])

  const play = useCallback(
    (t: PlayedTrack) => {
      if (!t.preview) return
      const a = (audio.current ??= new Audio())
      if (a.src !== t.preview) {
        a.src = t.preview
        a.currentTime = 0
      }
      a.volume = 0
      // However it stops (faded out, ended, or silenced below), the card stops
      // showing as playing, unless another song has started since.
      a.onpause = () => setPlaying((id) => (id === t.id ? null : id))
      setPlaying(t.id)
      a.play().then(
        () => {
          setHint(false)
          ramp(VOLUME)
        },
        // Browsers only allow sound after the visitor has clicked the page.
        () => {
          setPlaying(null)
          setHint(true)
        },
      )
    },
    [ramp],
  )

  // Silence when leaving casual mode or the page.
  useEffect(() => {
    if (mode === 'casual') return
    cancelAnimationFrame(fade.current)
    audio.current?.pause()
  }, [mode])
  useEffect(
    () => () => {
      cancelAnimationFrame(fade.current)
      audio.current?.pause()
    },
    [],
  )

  const hover = (t: PlayedTrack) => (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') play(t)
  }
  const leave = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') stop()
  }

  return (
    <div ref={root} className="songs-wrap" aria-busy={tracks === null || undefined}>
      {tracks !== null && tracks.length === 0 ? (
        <p className="songs-empty">{r.empty}</p>
      ) : (
        <ul className="songs">
          {(tracks ?? Array.from({ length: SKELETONS }, () => null)).map((t, i) =>
            t ? (
              <li
                key={t.id}
                className="song"
                data-playing={playing === t.id || undefined}
                data-silent={!t.preview || undefined}
                style={{ '--i': i } as React.CSSProperties}
                onPointerEnter={hover(t)}
                onPointerLeave={leave}
              >
                <ExternalLink href={t.url} className="song-link">
                  <span className="song-art">
                    {t.art && <img src={t.art} alt="" loading="lazy" decoding="async" draggable={false} />}
                  </span>
                  <span className="song-title">{t.title}</span>
                  <span className="song-artist">{t.artists}</span>
                  <span className="song-meta">
                    <span className="song-eq" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </span>
                    {t.preview ? ago(t.playedAt) : `${ago(t.playedAt)} · ${r.noPreview}`}
                  </span>
                </ExternalLink>
                {t.preview && (
                  <button
                    type="button"
                    className="song-play"
                    aria-label={`${playing === t.id ? r.pause : r.play}: ${t.title}`}
                    aria-pressed={playing === t.id}
                    onClick={() => (playing === t.id ? stop() : play(t))}
                  >
                    <span aria-hidden="true">{playing === t.id ? '❚❚' : '▶'}</span>
                  </button>
                )}
              </li>
            ) : (
              <li key={i} className="song song-skeleton" aria-hidden="true">
                <span className="song-art" />
                <span className="song-title" />
                <span className="song-artist" />
              </li>
            ),
          )}
        </ul>
      )}
      <p className="songs-foot">
        {hint && <span className="songs-hint">{r.soundHint}</span>}
        <ExternalLink href={r.credit.href} className="songs-credit">
          {r.credit.label}
        </ExternalLink>
      </p>
    </div>
  )
}
