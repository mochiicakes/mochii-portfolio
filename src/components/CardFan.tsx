import { useId, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import { hasPlaceholder } from '../lib/placeholder'
import { useImageFallback } from '../lib/useImageFallback'
import { ExternalLink } from './ui/ExternalLink'
import { Star } from './ui/Ornaments'
import { Rich } from './ui/Rich'

export type FanCard = {
  id: string
  group: string
  groupLabel: string
  title: string
  meta?: string
  detail: string
  image: string
  link?: { href: string; label: string; soon: string }
}

type Props = {
  label: string
  ring: string
  cards: FanCard[]
  /** Jump buttons above the fan, one per group. */
  groups?: { id: string; label: string }[]
}

/** A card's picture, or a painted stand-in until the photo exists. */
function Face({ card, tone }: { card: FanCard; tone: number }) {
  const { failed, ref, onError } = useImageFallback(card.image)
  return (
    <span className={`fan-face tone-${tone % 4}`}>
      <span className="fan-face-art" aria-hidden="true">
        <Star tone={(["butter", "sky", "milk"] as const)[tone % 3]} className="fan-face-star" />
        <span className="fan-face-word">
          <Rich text={card.title} />
        </span>
      </span>
      {!failed && (
        <img
          ref={ref}
          src={card.image}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={onError}
        />
      )}
      <span className="fan-face-tag">{card.groupLabel}</span>
    </span>
  )
}

/** Pixels of drag that turn the fan by one card (about one step at the card tops). */
const PX_PER_CARD = 170
/** Movement under this many pixels is a click, not a drag. */
const CLICK_SLOP = 6

const mod = (a: number, n: number) => ((a % n) + n) % n
/** The shortest way round the loop from 0 to `a`: a value in [-n/2, n/2). */
const wrap = (a: number, n: number) => mod(a + n / 2, n) - n / 2

/**
 * Cards fanned on an arc above a dial, after the reference pin. The fan is a
 * loop: past the last card comes the first again, so there are always cards on
 * both sides. The selected card's story sits below the dial. Turn the fan by
 * clicking a card, dragging (the cards follow the pointer), the arrow keys, or
 * the arrow buttons.
 */
export function CardFan({ label, ring, cards, groups }: Props) {
  const id = useId().replace(/:/g, '')
  const n = cards.length
  // Unbounded position along the loop: whole at rest, fractional mid-drag.
  // Start in the middle, so the pre-rendered fan opens full on both sides.
  // `prev` is where the fan was before the last move, to spot cards that wrap round.
  const [{ pos, prev }, setTurn] = useState(() => ({ pos: Math.floor(n / 2), prev: Math.floor(n / 2) }))
  const setPos = (to: number | ((p: number) => number)) =>
    setTurn((s) => ({ prev: s.pos, pos: typeof to === 'function' ? to(s.pos) : to }))
  const [dragging, setDragging] = useState(false)
  const drag = useRef<{ id: number; x: number; start: number; moved: boolean; t: number; p: number; v: number } | null>(
    null,
  )
  const dragged = useRef(false)
  const active = mod(Math.round(pos), n)
  const card = cards.at(active)!
  // Cards further out than this fade away, so wrapping happens out of sight.
  const visible = Math.min(3, n / 2 - 0.5)

  /** Turn to card `i` the short way round. */
  const goTo = (i: number) => setPos((p) => Math.round(p) + wrap(i - Math.round(p), n))
  const step = (d: number) => setPos((p) => Math.round(p) + d)

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') step(1)
    else if (e.key === 'ArrowLeft') step(-1)
    else if (e.key === 'Home') goTo(0)
    else if (e.key === 'End') goTo(n - 1)
    else return
    e.preventDefault()
  }
  const onDown = (e: PointerEvent) => {
    if (e.button !== 0) return
    const p = Math.round(pos)
    drag.current = { id: e.pointerId, x: e.clientX, start: p, moved: false, t: e.timeStamp, p, v: 0 }
    dragged.current = false
  }
  const onMove = (e: PointerEvent) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    const dx = e.clientX - d.x
    if (!d.moved) {
      if (Math.abs(dx) < CLICK_SLOP) return
      // Now it is a drag: keep the pointer, and let the cards follow it.
      d.moved = true
      dragged.current = true
      e.currentTarget.setPointerCapture(e.pointerId)
      setDragging(true)
    }
    const p = d.start - dx / PX_PER_CARD
    const dt = Math.max(1, e.timeStamp - d.t)
    // Velocity in cards per ms, smoothed so the fling follows the last moments.
    d.v = d.v * 0.6 + ((p - d.p) / dt) * 0.4
    d.t = e.timeStamp
    d.p = p
    setPos(p)
  }
  const onUp = (e: PointerEvent) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    drag.current = null
    if (!d.moved) return
    setDragging(false)
    // Settle on the nearest card, carried a little further by a fling.
    const fling = Math.max(-2, Math.min(2, d.v * 150))
    setPos(Math.round(d.p + fling))
  }
  const onCancel = () => {
    const d = drag.current
    drag.current = null
    setDragging(false)
    if (d?.moved) setPos(Math.round(d.p))
  }

  return (
    <section className="fan" aria-roledescription="carousel" aria-label={label}>
      {groups && (
        <div className="fan-groups" role="group" aria-label={label}>
          {groups.map((g) => (
            <button
              key={g.id}
              type="button"
              aria-pressed={card.group === g.id}
              onClick={() => {
                // The nearest card in the group, whichever way round is shorter.
                const here = Math.round(pos)
                let best = -1
                cards.forEach((c, i) => {
                  if (c.group !== g.id) return
                  if (best < 0 || Math.abs(wrap(i - here, n)) < Math.abs(wrap(best - here, n))) best = i
                })
                if (best >= 0) goTo(best)
              }}
            >
              {g.label}
            </button>
          ))}
        </div>
      )}

      <div
        className="fan-stage"
        tabIndex={0}
        aria-label={`${label}: use the arrow keys to turn the cards`}
        data-dragging={dragging || undefined}
        onKeyDown={onKey}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onCancel}
      >
        <div className="fan-dial" aria-hidden="true">
          <svg viewBox="0 0 200 200" className="fan-ring">
            <defs>
              <path id={`${id}-ring`} d="M100 100m-90 0a90 90 0 1 1 180 0a90 90 0 1 1 -180 0" />
            </defs>
            <circle cx="100" cy="100" r="97" className="fan-ring-line" />
            <circle cx="100" cy="100" r="62" className="fan-ring-dash" />
            <text>
              <textPath href={`#${id}-ring`} startOffset="0">
                {`${ring} · ${card.groupLabel} · ${ring} · ${card.groupLabel} · `}
              </textPath>
            </text>
          </svg>
          <span className="fan-pointer">
            <span className="fan-pointer-mark" />
            {card.groupLabel}
          </span>
        </div>

        {cards.map((c, i) => {
          const o = wrap(i - pos, n)
          const far = Math.abs(o)
          // Fade out over the half card past the visible edge.
          const shown = Math.max(0, Math.min(1, (visible + 0.5 - far) / 0.5))
          // A card that just wrapped round jumps to its new side without
          // sweeping across the arc.
          const wrapped = Math.abs(o - wrap(i - prev, n)) > n / 2
          return (
            <button
              key={c.id}
              type="button"
              className="fan-card"
              tabIndex={-1}
              data-wrap={wrapped || undefined}
              aria-hidden={shown === 0 || undefined}
              aria-label={`${c.groupLabel}: ${c.title.replace(/[[\]]/g, '')}`}
              aria-current={i === active || undefined}
              style={
                {
                  '--o': o,
                  '--lift': `${(-26 * Math.max(0, 1 - far)).toFixed(1)}px`,
                  zIndex: 50 - Math.round(far * 10),
                  opacity: shown * (1 - far * 0.08),
                } as CSSProperties
              }
              onClick={() => {
                if (!dragged.current) goTo(i)
              }}
            >
              <Face card={c} tone={i} />
            </button>
          )
        })}
      </div>

      <div className="fan-nav needs-js">
        <button type="button" onClick={() => step(-1)} aria-label="Previous card">
          <span aria-hidden="true">‹</span>
        </button>
        <span className="fan-count" aria-hidden="true">
          {active + 1} / {n}
        </span>
        <button type="button" onClick={() => step(1)} aria-label="Next card">
          <span aria-hidden="true">›</span>
        </button>
      </div>

      <div className="fan-detail pane" aria-live="polite">
        <h3 className="fan-title">
          <Rich text={card.title} />
        </h3>
        {card.meta && <p className="fan-meta">{card.meta}</p>}
        <p className="fan-text">
          <Rich text={card.detail} />
        </p>
        {card.link &&
          (hasPlaceholder(card.link.href) ? (
            <p className="fan-soon">{card.link.soon}</p>
          ) : (
            <ExternalLink href={card.link.href} className="btn btn-koi">
              {card.link.label}
            </ExternalLink>
          ))}
      </div>
    </section>
  )
}
