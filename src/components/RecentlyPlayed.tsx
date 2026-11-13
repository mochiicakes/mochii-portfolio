import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { content } from '../content'
import { modeStore } from '../lib/htmlState'
import type { PlayedTrack } from '../types'
import { ExternalLink } from './ui/ExternalLink'

const r = content.recentlyPlayed
const SKELETONS = 5
/** Cards shown either side of the focused one. */
const REACH = 2
/** Px a swipe must travel to turn to the next song. */
const SWIPE = 40
// Previews are loud: 0.6, less 30%, less another 25%, then less 15%.
const VOLUME = 0.27
const FADE = 280 // ms

function ago(iso: string): string {
  const min = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (min < 2) return r.ago.now
  if (min < 60) return r.ago.minutes.replace('{n}', String(min))
  if (min < 48 * 60) return r.ago.hours.replace('{n}', String(Math.round(min / 60)))
  return r.ago.days.replace('{n}', String(Math.round(min / 1440)))
}

/** Song `i`'s place relative to the front one, the short way round the loop. */
function offset(i: number, front: number, n: number): number {
  const d = (((i - front) % n) + n) % n
  return d > n / 2 ? d - n : d
}

/** Touch screens and other devices with no hover. */
const noHover = {
  subscribe(cb: () => void) {
    const mq = window.matchMedia('(hover: none)')
    mq.addEventListener('change', cb)
    return () => mq.removeEventListener('change', cb)
  },
  get: () => window.matchMedia('(hover: none)').matches,
  getServer: () => false,
}

/**
 * The songs Michaella played last on Spotify, live (api/recently-played.ts),
 * as a coverflow of glass cards: the focused song in front, two either side
 * turned away, and the playing (or focused) album's colours glowing behind.
 * The songs run in a loop, with no first or last: arrows, the arrow keys or a
 * swipe go round and round.
 *
 * Sound only ever starts from the visitor: browsers block anything else, and
 * music out of nowhere is unwelcome. Pressing play listens through, like a
 * small radio: moving to another song plays it, and each preview leads on to
 * the next, round the loop. With a mouse, hovering a song also plays a quick taste of it (not
 * while listening through). On touch screens the front cover is the play
 * button and an "Open in Spotify" link sits under it; tapping a side card
 * brings it to the front. Sound fades out when the screen scrolls out of view.
 *
 * Only fetched in casual mode, as the screen comes near; the pre-rendered page
 * shows empty glass cards in its place.
 */
export function RecentlyPlayed() {
  const mode = useSyncExternalStore(modeStore.subscribe, modeStore.get, modeStore.getServer)
  const touch = useSyncExternalStore(noHover.subscribe, noHover.get, noHover.getServer)
  const root = useRef<HTMLDivElement>(null)
  const [tracks, setTracks] = useState<PlayedTrack[] | null>(null)
  // The front song, and where it was before the last move (see `wrapped`).
  const [pos, setPos] = useState({ at: 0, from: 0 })
  const focus = pos.at
  const setFocus = useCallback((at: number) => setPos((p) => ({ at, from: p.at })), [])
  const [playing, setPlaying] = useState<string | null>(null)
  const [radio, setRadio] = useState(false)
  const [hint, setHint] = useState(false)
  const swipe = useRef<number | null>(null)
  const audio = useRef<HTMLAudioElement | null>(null)
  const fade = useRef(0)
  // Read from audio callbacks, which outlive the render they were made in.
  const live = useRef({ tracks: [] as PlayedTrack[], focus: 0, radio: false })
  useEffect(() => {
    live.current = { tracks: tracks ?? [], focus, radio }
  }, [tracks, focus, radio])

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
          .then((data) => {
            const list = data.tracks ?? []
            setTracks(list)
            // The most recent song in front; the loop puts others on both sides.
            setPos({ at: 0, from: 0 })
          })
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
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / FADE)
      a.volume = Math.min(1, Math.max(0, from + (to - from) * t))
      if (t < 1) fade.current = requestAnimationFrame(tick)
      else done?.()
    }
    fade.current = requestAnimationFrame(tick)
  }, [])

  const stop = useCallback(() => {
    ramp(0, () => audio.current?.pause())
  }, [ramp])

  /** Stops listening through, and the sound with it. */
  const stopRadio = useCallback(() => {
    setRadio(false)
    stop()
  }, [stop])

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
        (err: unknown) => {
          // Another song took over before this one started: nothing to undo.
          if (!(err instanceof DOMException) || err.name !== 'NotAllowedError') return
          // Browsers only allow sound after the visitor has clicked the page.
          setPlaying((id) => (id === t.id ? null : id))
          setRadio(false)
          setHint(true)
        },
      )
    },
    [ramp],
  )

  /** Brings song `i` to the front; while listening through, plays it. */
  const goTo = useCallback(
    (i: number) => {
      const list = live.current.tracks
      if (!list.length) return
      const j = ((i % list.length) + list.length) % list.length
      setFocus(j)
      if (live.current.radio) {
        if (list[j].preview) play(list[j])
        else stop()
      }
    },
    [play, stop, setFocus],
  )

  /** Starts listening through from song `i`. */
  const listen = (i: number) => {
    const t = tracks?.[i]
    if (!t?.preview) return
    live.current.radio = true
    setRadio(true)
    setFocus(i)
    play(t)
  }

  // Each preview leads on to the next song that has one, round the loop.
  useEffect(() => {
    const a = audio.current
    if (!a) return
    a.onended = () => {
      if (!live.current.radio) return
      const { tracks: list, focus: at } = live.current
      const n = list.length
      const ahead = Array.from({ length: n - 1 }, (_, k) => (at + 1 + k) % n).find((k) => list[k].preview)
      if (ahead === undefined) setRadio(false)
      else goTo(ahead)
    }
  }, [goTo, playing])

  // Fade out when the screen scrolls out of view (or casual mode hides it).
  // Scrolling back does not start it again.
  useEffect(() => {
    const el = root.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => !e.isIntersecting)) stopRadio()
      },
      { threshold: 0.25 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [stopRadio])

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

  // A quick taste on hover (mouse only), unless listening through.
  const hover = (t: PlayedTrack) => (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && !radio) play(t)
  }
  const leave = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && !radio) stop()
  }

  const n = tracks?.length ?? 0
  const centre = tracks ? focus : Math.floor(SKELETONS / 2)
  const list = tracks ?? Array.from({ length: SKELETONS }, () => null)
  const glow = (tracks?.find((t) => t.id === playing) ?? tracks?.[focus])?.art ?? null

  return (
    <div ref={root} className="songs-wrap" aria-busy={tracks === null || undefined}>
      {tracks !== null && tracks.length === 0 ? (
        <p className="songs-empty">{r.empty}</p>
      ) : (
        <>
          <div
            className="flow"
            data-touch={touch || undefined}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') goTo(focus - 1)
              else if (e.key === 'ArrowRight') goTo(focus + 1)
            }}
            onPointerDown={(e) => {
              if (e.pointerType !== 'mouse') swipe.current = e.clientX
            }}
            onPointerUp={(e) => {
              const from = swipe.current
              swipe.current = null
              if (from === null) return
              const dx = e.clientX - from
              if (Math.abs(dx) > SWIPE) goTo(focus + (dx < 0 ? 1 : -1))
            }}
          >
            {/* The playing (or front) album's colours, blurred into a glow behind the cards. */}
            <span className="flow-glow" aria-hidden="true">
              {glow && <img key={glow} src={glow} alt="" draggable={false} />}
            </span>
            <ul className="flow-stage">
              {list.map((t, i) => {
                const d = tracks ? offset(i, centre, n) : i - centre
                const far = Math.abs(d) > REACH
                // A card that just went round the loop jumps to its new side
                // instead of sliding across the front.
                const wrapped = tracks !== null && Math.abs(d - offset(i, pos.from, n)) > 1
                const style = { '--d': d, '--ad': Math.abs(d) } as React.CSSProperties
                if (!t) {
                  return (
                    <li key={i} className="flow-card flow-skeleton" style={style} aria-hidden="true">
                      <span className="flow-art" />
                      <span className="flow-artist" />
                      <span className="flow-title" />
                    </li>
                  )
                }
                const front = d === 0
                const on = playing === t.id
                const art = t.art && <img src={t.art} alt="" loading="lazy" decoding="async" draggable={false} />
                const text = (
                  <>
                    <span className="flow-artist">{t.artists}</span>
                    <span className="flow-title">{t.title}</span>
                    <span className="flow-meta">
                      <span className="song-eq" aria-hidden="true">
                        <span />
                        <span />
                        <span />
                      </span>
                      {t.preview ? ago(t.playedAt) : `${ago(t.playedAt)} · ${r.noPreview}`}
                    </span>
                  </>
                )
                const toggle = () => (on && radio ? stopRadio() : listen(i))
                return (
                  <li
                    key={t.id}
                    className="flow-card"
                    style={style}
                    data-focus={front || undefined}
                    data-far={far || undefined}
                    data-wrap={wrapped || undefined}
                    data-playing={on || undefined}
                    inert={far}
                    onPointerEnter={hover(t)}
                    onPointerLeave={leave}
                  >
                    {touch ? (
                      // Touch: the front cover plays; a side card comes to the front.
                      <div className="flow-link" onClick={front ? undefined : () => goTo(i)}>
                        {front && t.preview ? (
                          <button
                            type="button"
                            className="flow-art flow-cover"
                            aria-label={`${on && radio ? r.pause : r.play}: ${t.title}`}
                            aria-pressed={on && radio}
                            onClick={toggle}
                          >
                            {art}
                            <span className="flow-play" aria-hidden="true">
                              {on && radio ? '❚❚' : '▶'}
                            </span>
                          </button>
                        ) : (
                          <span className="flow-art">{art}</span>
                        )}
                        {text}
                        {front && (
                          <ExternalLink href={t.url} className="flow-open">
                            {r.open} ↗
                          </ExternalLink>
                        )}
                      </div>
                    ) : (
                      <>
                        <ExternalLink href={t.url} className="flow-link">
                          <span className="flow-art">{art}</span>
                          {text}
                        </ExternalLink>
                        {t.preview && (
                          <button
                            type="button"
                            className="flow-play"
                            aria-label={`${on && radio ? r.pause : r.play}: ${t.title}`}
                            aria-pressed={on && radio}
                            onClick={toggle}
                          >
                            <span aria-hidden="true">{on && radio ? '❚❚' : '▶'}</span>
                          </button>
                        )}
                      </>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
          {tracks && n > 1 && (
            <div className="fan-nav flow-nav needs-js">
              <button type="button" onClick={() => goTo(focus - 1)} aria-label="Previous song">
                <span aria-hidden="true">‹</span>
              </button>
              <span className="fan-count" aria-hidden="true">
                {focus + 1} / {n}
              </span>
              <button type="button" onClick={() => goTo(focus + 1)} aria-label="Next song">
                <span aria-hidden="true">›</span>
              </button>
            </div>
          )}
        </>
      )}
      {hint && (
        <p className="songs-foot">
          <span className="songs-hint">{r.soundHint}</span>
        </p>
      )}
    </div>
  )
}
