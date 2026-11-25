import type { CSSProperties } from 'react'

// Hand-drawn SVG ornaments. All decorative: aria-hidden.

export type StarTone = 'butter' | 'sky' | 'milk'

/** A soft five-point star, like the ones floating over the goldfish. */
export function Star({ tone, style, className }: { tone: StarTone; style?: CSSProperties; className?: string }) {
  return (
    <svg
      className={['star', `star-${tone}`, className].filter(Boolean).join(' ')}
      viewBox="0 0 24 24"
      style={style}
      aria-hidden="true"
    >
      <path
        d="M12 2.2l2.7 5.9 6.4.7-4.8 4.3 1.4 6.3L12 16.2l-5.7 3.2 1.4-6.3-4.8-4.3 6.4-.7z"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * The divider between sections: a hairline with a drop of paint running down
 * it. It links to the section below, so it doubles as a scroll cue.
 */
export function Divider({
  to,
  label,
  world,
  className = '',
}: {
  to: string
  label: string
  world?: 'recruiter' | 'casual'
  className?: string
}) {
  return (
    <a className={`divider ${className}`} href={`#${to}`} aria-label={label} data-world={world}>
      <span />
    </a>
  )
}
