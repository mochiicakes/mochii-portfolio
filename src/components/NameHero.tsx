import type { CSSProperties } from 'react'
import { content } from '../content'
import { Star, Underline, type StarTone } from './ui/Ornaments'

// Stars that drift over the paint once it is down (the image's butter, sky and milk).
const STARS: { x: string; y: string; s: number; tone: StarTone; d: number }[] = [
  { x: '9%', y: '16%', s: 30, tone: 'sky', d: 0.1 },
  { x: '86%', y: '12%', s: 22, tone: 'butter', d: 0.4 },
  { x: '80%', y: '64%', s: 34, tone: 'milk', d: 0.6 },
  { x: '14%', y: '72%', s: 26, tone: 'butter', d: 0.3 },
  { x: '92%', y: '40%', s: 18, tone: 'milk', d: 0.8 },
  { x: '5%', y: '42%', s: 20, tone: 'milk', d: 0.5 },
  { x: '68%', y: '86%', s: 22, tone: 'sky', d: 0.7 },
]

/**
 * The name. Every word here is printed in paper colour, so on bare paper the
 * section reads as empty; painting behind it brings it out.
 */
export function NameHero() {
  const h = content.hero
  const t = content.tagline
  return (
    <section id="top" className="hero" aria-labelledby="hero-name">
      {STARS.map((s, i) => (
        <Star
          key={i}
          tone={s.tone}
          className="hero-star"
          style={{ left: s.x, top: s.y, width: s.s, height: s.s, '--d': `${s.d}s` } as CSSProperties}
        />
      ))}
      <div className="hero-inner">
        <p className="caps hero-role">{h.role}</p>
        <h1 id="hero-name" className="hero-name">
          {h.name}
        </h1>
        <Underline className="hero-underline" />
        <p className="caps hero-tagline">
          <span>{t.line1}</span>
          <span>{t.line2}</span>
        </p>
        <p className="hero-support">{t.supporting}</p>
        <div className="hero-actions">
          <a className="btn btn-koi" href={h.primaryCta.href}>
            {h.primaryCta.label}
          </a>
          <a className="btn btn-line" href={h.cvCta.href} download>
            {h.cvCta.label}
          </a>
        </div>
      </div>
      <a className="scroll-cue" href="#work" aria-label="Scroll to the work">
        <span />
      </a>
    </section>
  )
}
