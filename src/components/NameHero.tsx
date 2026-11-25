import { useCallback, useState } from 'react'
import { content } from '../content'
import { useImageFallback } from '../lib/useImageFallback'
import { Drip, DripToggle } from './Drip'

/**
 * The opening: the portrait in the middle, a glass card with who she is at the
 * top left, the name stacked in the pixel face at the right with the tagline
 * under it, and the buttons at the lower right. Phones stack the same pieces.
 */
export function NameHero() {
  const h = content.hero
  const t = content.tagline
  const { failed, ref, onError } = useImageFallback(h.portrait.src)
  const portrait = !failed
  const [drip, setDrip] = useState(false)
  const closeDrip = useCallback(() => setDrip(false), [])
  return (
    <section id="top" className="hero" data-screen aria-labelledby="hero-name" data-portrait={portrait || undefined}>
      <div className="hero-block hero-card">
        <p className="hero-card-role">{h.role}</p>
        <p className="hero-card-text">{t.supporting}</p>
        <a className="ring-link" href="#work" aria-label={h.more}>
          <span aria-hidden="true">↓</span>
        </a>
      </div>

      <h1 id="hero-name" className="hero-name">
        <span className="hero-first">{h.firstName}</span> <span className="hero-last">{h.lastName}</span>
      </h1>

      {portrait && (
        <div className="hero-figure">
          <img
            ref={ref}
            className="hero-portrait"
            src={h.portrait.src}
            alt={h.portrait.alt}
            width={h.portrait.width}
            height={h.portrait.height}
            decoding="async"
            fetchPriority="high"
            draggable={false}
            onError={onError}
          />
        </div>
      )}

      <p className="hero-block hero-tr">
        <span>{t.line1}</span>
        <span>{t.line2}</span>
      </p>

      <div className="hero-block hero-br">
        <a className="btn btn-koi" href={h.primaryCta.href}>
          {h.primaryCta.label}
        </a>
        <DripToggle open={drip} onToggle={() => setDrip((o) => !o)} />
      </div>

      <Drip open={drip} onClose={closeDrip} />
    </section>
  )
}
