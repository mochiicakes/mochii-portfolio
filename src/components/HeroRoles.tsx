import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { content } from '../content'
import { revealStore } from '../lib/htmlState'
import { takeTurns } from '../lib/turns'
import { useReducedMotion } from '../lib/useReducedMotion'

/** Long enough to read a role. */
const TURN_MS = 7000

/**
 * The opening card: the roles fade from one to the next in the same place, so
 * the glass never changes size. They wait while the pointer or the keyboard is
 * on the card, or the card is out of sight. Picking a dot ends the fading.
 */
export function HeroRoles() {
  const { roles, rolesLabel, more } = content.hero
  const revealed = useSyncExternalStore(revealStore.subscribe, revealStore.get, revealStore.getServer)
  const reduced = useReducedMotion()
  const [active, setActive] = useState(0)
  const [picked, setPicked] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const card = ref.current
    if (!card || !revealed || reduced || picked) return
    const turns = takeTurns(roles.length, TURN_MS, setActive)

    // A finger leaves no pointer behind, so only a mouse or pen holds it.
    const onEnter = (e: PointerEvent) => turns.hold('pointer', e.pointerType !== 'touch')
    const onLeave = () => turns.hold('pointer', false)
    const onFocus = () => turns.hold('focus', true)
    const onBlur = () => turns.hold('focus', false)
    const onVisibility = () => turns.hold('hidden', document.hidden)
    const io = new IntersectionObserver(([entry]) => turns.hold('away', !entry.isIntersecting), { threshold: 0.3 })
    io.observe(card)
    card.addEventListener('pointerenter', onEnter)
    card.addEventListener('pointerleave', onLeave)
    card.addEventListener('focusin', onFocus)
    card.addEventListener('focusout', onBlur)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      turns.stop()
      io.disconnect()
      card.removeEventListener('pointerenter', onEnter)
      card.removeEventListener('pointerleave', onLeave)
      card.removeEventListener('focusin', onFocus)
      card.removeEventListener('focusout', onBlur)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [revealed, reduced, picked, roles.length])

  return (
    <div ref={ref} className="hero-block hero-card">
      <div className="hero-roles">
        {roles.map((r, i) => (
          <div key={r.title} className="hero-role" data-on={i === active || undefined}>
            <p className="hero-card-role">{r.title}</p>
            <p className="hero-card-text">{r.text}</p>
            <p className="hero-card-note">{r.note}</p>
          </div>
        ))}
      </div>
      <div className="hero-card-foot">
        <div className="hero-dots needs-js" role="group" aria-label={rolesLabel}>
          {roles.map((r, i) => (
            <button
              key={r.title}
              type="button"
              aria-label={r.title}
              aria-pressed={i === active}
              onClick={() => {
                setPicked(true)
                setActive(i)
              }}
            />
          ))}
        </div>
        <a className="ring-link" href="#work" aria-label={more}>
          <span aria-hidden="true">↓</span>
        </a>
      </div>
    </div>
  )
}
