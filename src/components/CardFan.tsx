import { useId, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import { hasPlaceholder } from '../lib/placeholder'
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
  const [failed, setFailed] = useState(false)
  const attach = (img: HTMLImageElement | null) => {
    if (img && img.complete && img.naturalWidth === 0) setFailed(true)
  }
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
          ref={attach}
          src={card.image}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={() => setFailed(true)}
        />
      )}
      <span className="fan-face-tag">{card.groupLabel}</span>
    </span>
  )
}

/**
 * Cards fanned on an arc above a dial, after the reference pin. The card under
 * the pointer is the selected one; its story sits below the dial. Turn the fan
 * by clicking a card, dragging, the arrow keys, or the arrow buttons.
 */
export function CardFan({ label, ring, cards, groups }: Props) {
  const id = useId().replace(/:/g, '')
  // Start in the middle, so the fan opens full on both sides.
  const [active, setActive] = useState(Math.floor(cards.length / 2))
  const drag = useRef<{ x: number } | null>(null)
  const dragged = useRef(false)
  const card = cards.at(active)!
  const go = (i: number) => setActive(Math.max(0, Math.min(cards.length - 1, i)))

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') go(active + 1)
    else if (e.key === 'ArrowLeft') go(active - 1)
    else if (e.key === 'Home') go(0)
    else if (e.key === 'End') go(cards.length - 1)
    else return
    e.preventDefault()
  }
  const onDown = (e: PointerEvent) => {
    drag.current = { x: e.clientX }
    dragged.current = false
  }
  const onUp = (e: PointerEvent) => {
    const d = drag.current
    drag.current = null
    if (!d) return
    const dx = e.clientX - d.x
    if (Math.abs(dx) < 30) return
    dragged.current = true
    go(active - (Math.round(dx / 90) || Math.sign(dx)))
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
              onClick={() => go(cards.findIndex((c) => c.group === g.id))}
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
        onKeyDown={onKey}
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={() => (drag.current = null)}
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
          const o = i - active
          const far = Math.abs(o)
          return (
            <button
              key={c.id}
              type="button"
              className="fan-card"
              tabIndex={-1}
              aria-hidden={far > 3 || undefined}
              aria-label={`${c.groupLabel}: ${c.title.replace(/[[\]]/g, '')}`}
              aria-current={o === 0 || undefined}
              style={
                {
                  '--o': o,
                  '--lift': o === 0 ? '-26px' : '0px',
                  zIndex: 50 - far,
                  opacity: far > 3 ? 0 : 1 - far * 0.08,
                } as CSSProperties
              }
              onClick={() => {
                if (!dragged.current) go(i)
              }}
            >
              <Face card={c} tone={i} />
            </button>
          )
        })}
      </div>

      <div className="fan-nav needs-js">
        <button type="button" onClick={() => go(active - 1)} disabled={active === 0} aria-label="Previous card">
          <span aria-hidden="true">‹</span>
        </button>
        <span className="fan-count" aria-hidden="true">
          {active + 1} / {cards.length}
        </span>
        <button
          type="button"
          onClick={() => go(active + 1)}
          disabled={active === cards.length - 1}
          aria-label="Next card"
        >
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
