import type { CSSProperties } from 'react'
import { content } from '../content'
import { useImageFallback } from '../lib/useImageFallback'

/**
 * The name, set like a magazine cover: the first name huge behind the
 * portrait, the surname signed at its end, and a small block of text in each
 * corner. Where the portrait covers the first name, the hidden letters are
 * drawn over her as an outline (masked to her silhouette), so the name stays
 * whole. Every word is printed in paper colour, so on bare paper the section
 * reads as empty; painting behind it brings it out.
 */
export function NameHero() {
  const h = content.hero
  const t = content.tagline
  const { failed, ref, onError } = useImageFallback(h.portrait.src)
  const portrait = !failed
  return (
    <section id="top" className="hero" data-screen aria-labelledby="hero-name" data-portrait={portrait || undefined}>
      <p className="hero-block hero-tl caps">{h.role}</p>

      <h1 id="hero-name" className="hero-name">
        <span className="hero-first">{h.firstName}</span> <span className="hero-last">{h.lastName}</span>
      </h1>

      {portrait && (
        <div className="hero-figure" style={{ '--portrait': `url(${h.portrait.src})` } as CSSProperties}>
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
          <span className="hero-overprint" aria-hidden="true">
            <span>
              {[...h.firstName].map((ch, i) => (
                <span key={i} data-cover={h.coverLetters.includes(i) || undefined}>
                  {ch}
                </span>
              ))}
            </span>
          </span>
        </div>
      )}

      <p className="hero-block hero-tr">
        <span>{t.line1}</span>
        <span>{t.line2}</span>
      </p>

      <div className="hero-block hero-bl">
        <p className="hero-block-name">{h.name}</p>
        <p>{t.supporting}</p>
      </div>

      <div className="hero-block hero-br">
        <a className="btn btn-koi" href={h.primaryCta.href}>
          {h.primaryCta.label}
        </a>
        <a className="btn btn-line" href={h.cvCta.href} download>
          {h.cvCta.label}
        </a>
      </div>
    </section>
  )
}
