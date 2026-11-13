import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react'
import { content } from '../content'
import { modeStore } from '../lib/htmlState'
import { ExternalLink } from './ui/ExternalLink'
import { Thumb } from './ui/Thumb'

const d = content.hero.drip
// The portrait's size, which the drip box takes the shape of.
const { width: W, height: H } = content.hero.portrait
// How far out the cards sit from the portrait's sides, in % of its width (matches --drip-out in page.css).
const OUT = 62

/** Phones and tablets, where the cards are tickets in an endless row. */
const narrow = {
  subscribe(cb: () => void) {
    const mq = window.matchMedia('(max-width: 1099px)')
    mq.addEventListener('change', cb)
    return () => mq.removeEventListener('change', cb)
  },
  get: () => window.matchMedia('(max-width: 1099px)').matches,
  getServer: () => false,
}

/** The "Cop my drip?" button, under Get in touch. Casual mode only (CSS). */
export function DripToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className="btn btn-line drip-toggle needs-js"
      aria-expanded={open}
      aria-controls="drip"
      onClick={onToggle}
    >
      {open ? d.close : d.label}
    </button>
  )
}

/**
 * What she's wearing in the portrait. On the wide cover, a line runs from each
 * piece out to a card beside her, like a fashion spread. On phones and
 * tablets the cards are 4:3 tickets in a row under the buttons that you can
 * swipe through endlessly: three copies sit side by side, and once scrolling
 * stops outside the middle copy, the row moves back to it by exactly one copy,
 * which looks the same, so the move can't be seen. Each card links to where to
 * buy the piece. Closes on Escape, and when the page leaves casual mode.
 */
export function Drip({ open, onClose }: { open: boolean; onClose: () => void }) {
  const mode = useSyncExternalStore(modeStore.subscribe, modeStore.get, modeStore.getServer)
  const ref = useRef<HTMLDivElement>(null)
  const row = useRef<HTMLUListElement>(null)
  const small = useSyncExternalStore(narrow.subscribe, narrow.get, narrow.getServer)
  const loop = open && small
  const copies = loop ? 3 : 1

  // The width of one copy of the tickets, gaps included.
  const span = () => {
    const items = row.current?.children
    const n = d.items.length
    return items && items.length > n ? (items[n] as HTMLElement).offsetLeft - (items[0] as HTMLElement).offsetLeft : 0
  }
  // Start on the middle copy, so there are tickets to swipe to either way.
  useLayoutEffect(() => {
    if (loop && row.current) row.current.scrollLeft = span()
  }, [loop])
  // Only once scrolling has settled: moving the row mid-swipe fights the
  // swipe and the snapping, and shows as a jump. Settles on `scrollend` and,
  // as a backstop (it is not always fired), 150 ms after the last scroll.
  useEffect(() => {
    const el = row.current
    if (!loop || !el) return
    const settle = () => {
      const s = span()
      const items = el.children
      if (!s || items.length < 2) return
      // Snapped tickets rest a little off whole multiples of the copy width
      // (they are centred), so the middle copy spans half a ticket either way.
      const half = ((items[1] as HTMLElement).offsetLeft - (items[0] as HTMLElement).offsetLeft) / 2
      if (el.scrollLeft < s - half) el.scrollLeft += s
      else if (el.scrollLeft >= 2 * s - half) el.scrollLeft -= s
    }
    let timer = 0
    const onScroll = () => {
      clearTimeout(timer)
      timer = window.setTimeout(settle, 150)
    }
    el.addEventListener('scrollend', settle)
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      clearTimeout(timer)
      el.removeEventListener('scrollend', settle)
      el.removeEventListener('scroll', onScroll)
    }
  }, [loop])
  // Where the `fit` cards go on the wide cover, in % of the portrait's height:
  // the middle of the space above the name (under the top bar) and below it
  // (above the buttons).
  const [fit, setFit] = useState<{ above: number; below: number } | null>(null)

  useLayoutEffect(() => {
    if (!open) return
    const place = () => {
      const rect = (q: string) => document.querySelector(q)?.getBoundingClientRect()
      const box = ref.current?.getBoundingClientRect()
      const bar = rect('.topbar')
      const first = rect('.hero-first')
      const last = rect('.hero-last')
      const buttons = rect('.hero-br')
      if (!box || !bar || !first || !last || !buttons || !window.matchMedia('(min-width: 1100px)').matches) {
        return setFit(null)
      }
      const at = (y: number) => ((y - box.top) / box.height) * 100
      setFit({ above: at((bar.bottom + first.top) / 2), below: at((last.bottom + buttons.top) / 2) })
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [open])
  const cardY = (it: (typeof d.items)[number]) => (it.card.fit && fit ? fit[it.card.fit] : it.card.y)

  useEffect(() => {
    if (open && mode !== 'casual') onClose()
  }, [open, mode, onClose])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <div ref={ref} id="drip" className="drip" data-open={open || undefined} inert={!open}>
      {/* In the portrait's own pixel units (the box has its shape), so lines meet their dots exactly. */}
      <svg className="drip-lines" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        {d.items.map((it, i) => (
          <line
            key={it.id}
            x1={(it.dot.x / 100) * W}
            y1={(it.dot.y / 100) * H}
            x2={((it.card.side === 'left' ? -OUT : 100 + OUT) / 100) * W}
            y2={(cardY(it) / 100) * H}
            pathLength={1}
            style={{ '--i': i } as CSSProperties}
          />
        ))}
      </svg>
      {d.items.map((it, i) => (
        <span
          key={it.id}
          className="drip-dot"
          aria-hidden="true"
          style={{ '--x': `${it.dot.x}%`, '--y': `${it.dot.y}%`, '--i': i } as CSSProperties}
        />
      ))}
      <ul ref={row} className="drip-cards" aria-label={d.heading} >
        {Array.from({ length: copies }, (_, c) => c).flatMap((c) =>
          d.items.map((it, i) => {
            // The copies either side of the middle are only there to scroll into.
            const echo = copies > 1 && c !== 1
            // One card, two looks: a slim row beside the portrait on the wide
            // cover, a ticket (photo stub, then the name and from / get it) on phones.
            const inner = (
              <>
                <span className="drip-head">
                  <span className="drip-name">{it.name}</span>
                </span>
                <Thumb src={it.thumb} alt="" label={it.kind} className="drip-thumb" />
                <span className="drip-foot">
                  <span className="drip-from">
                    <i>{d.labels.from}</i>
                    <b>{it.where}</b>
                  </span>
                  <span className="drip-get">
                    <i>{d.labels.get}</i>
                    <b>{it.href ? `${d.labels.shop} ↗` : d.labels.none}</b>
                  </span>
                </span>
              </>
            )
            return (
              <li
                key={`${c}-${it.id}`}
                className={`drip-card drip-${it.card.side}`}
                style={{ '--y': `${cardY(it)}%`, '--i': i } as CSSProperties}
                aria-hidden={echo || undefined}
                inert={echo}
              >
                {it.href ? (
                  <ExternalLink href={it.href} className="drip-link">
                    {inner}
                  </ExternalLink>
                ) : (
                  <div className="drip-link">{inner}</div>
                )}
              </li>
            )
          })
        )}
      </ul>
    </div>
  )
}
