import { useId, type CSSProperties, type ReactNode, type Ref } from 'react'

// Hand-drawn SVG ornaments. All decorative: aria-hidden.

export type KoiPattern = 'kohaku' | 'ogon'

/**
 * A koi seen from above, facing right, in a 120 × 48 box with its centre of
 * mass at (60, 24). The tail joins the body at (38, 24). Its two paths can be
 * re-bent each frame through `tailRef` and `veinsRef`, and the fins turned
 * through `finTopRef` and `finBottomRef`.
 */
export function KoiShape({
  pattern = 'kohaku',
  tailRef,
  veinsRef,
  finTopRef,
  finBottomRef,
}: {
  pattern?: KoiPattern
  tailRef?: Ref<SVGPathElement>
  veinsRef?: Ref<SVGPathElement>
  finTopRef?: Ref<SVGGElement>
  finBottomRef?: Ref<SVGGElement>
}) {
  const id = useId().replace(/:/g, '')
  const gold = pattern === 'ogon'
  const fin = gold ? '#ffe9a8' : '#fff4ea'
  return (
    <g className="koi-shape">
      <defs>
        <clipPath id={`${id}-body`}>
          <path d={BODY} />
        </clipPath>
        <radialGradient id={`${id}-sheen`} cx="0.65" cy="0.4" r="0.7">
          <stop offset="0" stopColor={gold ? '#fff3c4' : '#fffdf8'} />
          <stop offset="1" stopColor={gold ? '#f0b83c' : '#f3e6da'} />
        </radialGradient>
      </defs>
      <g className="koi-tail">
        <path ref={tailRef} d={KOI_TAIL} fill={gold ? '#ffe9a8' : '#ffb59e'} fillOpacity="0.7" />
        <path
          ref={veinsRef}
          d={KOI_TAIL_VEINS}
          fill="none"
          stroke={gold ? '#e8a531' : '#f08a4b'}
          strokeOpacity="0.45"
          strokeWidth="0.8"
        />
      </g>
      <g ref={finTopRef}>
        <path d={FIN_TOP} fill={fin} fillOpacity="0.85" />
      </g>
      <g ref={finBottomRef}>
        <path d={FIN_BOTTOM} fill={fin} fillOpacity="0.85" />
      </g>
      <path d={BODY} fill={`url(#${id}-sheen)`} />
      <g clipPath={`url(#${id}-body)`}>{PATTERNS[pattern]}</g>
      <circle cx="101" cy="18.5" r="1.6" fill="#1b2433" />
      <circle cx="101" cy="29.5" r="1.6" fill="#1b2433" />
    </g>
  )
}

const BODY =
  'M114 24C114 15.5 104 10 88 10.5C70 11 52 15.5 36 20.5C32.5 21.8 32.5 26.2 36 27.5C52 32.5 70 37 88 37.5C104 38 114 32.5 114 24Z'
// A long, flowing fancy-goldfish tail, reaching well behind the body.
// Absolute M/C/Z commands only: CursorKoi bends these point by point.
export const KOI_TAIL =
  'M38 24C26 12 8 -1 -24 -6C-9 5 -5 13 -12 20C-3 22 -3 26 -12 28C-5 35 -9 43 -24 54C8 49 26 36 38 24Z'
export const KOI_TAIL_VEINS = 'M36 24C22 15 4 4 -18 -2M36 24C20 21 2 18 -8 20M36 24C20 27 2 30 -8 28M36 24C22 33 4 44 -18 50'
const FIN_TOP = 'M84 13C79 5 71 1 63 2C67 6 72 10 76 14Z'
const FIN_BOTTOM = 'M84 35C79 43 71 47 63 46C67 42 72 38 76 34Z'

const PATTERNS: Record<KoiPattern, ReactNode> = {
  kohaku: (
    <>
      <ellipse cx="98" cy="22" rx="12" ry="10" fill="#f7503e" />
      <ellipse cx="70" cy="19" rx="16" ry="9" fill="#f7503e" />
      <ellipse cx="52" cy="28" rx="12" ry="7" fill="#ff7a4a" />
    </>
  ),
  ogon: <ellipse cx="80" cy="24" rx="30" ry="5" fill="#fff8e0" fillOpacity="0.55" />,
}

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
