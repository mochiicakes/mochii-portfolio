import type { ReactNode } from 'react'
import { content } from '../../content'
import { ExternalLink } from './ExternalLink'
import { Rich } from './Rich'

export type CardAction =
  | { kind: 'external'; href: string }
  | { kind: 'internal'; href: string }
  | { kind: 'soon' }
  | { kind: 'none' }

type Props = {
  title: string
  media: ReactNode
  /** Beside the title, e.g. a status tag. */
  badge?: ReactNode
  /** Under the title, e.g. a scale line. */
  meta?: ReactNode
  description: string
  stack: string[]
  action: CardAction
}

/**
 * Framed card. With a link, the title link stretches over the whole card, so the
 * card is one click target and one tab stop.
 */
export function Card({ title, media, badge, meta, description, stack, action }: Props) {
  const labels = content.cardLabels
  const linked = action.kind === 'external' || action.kind === 'internal'
  const titleText = <Rich text={title} />
  const titleNode =
    action.kind === 'external' ? (
      <ExternalLink href={action.href} className="card-link">
        {titleText}
      </ExternalLink>
    ) : action.kind === 'internal' ? (
      <a href={action.href} className="card-link">
        {titleText}
      </a>
    ) : (
      titleText
    )

  return (
    <article className={linked ? 'card pane is-linked' : 'card pane'}>
      {media}
      <div className="card-body">
        <div className="card-title-row">
          <h4 className="card-title">{titleNode}</h4>
          {badge}
        </div>
        {meta}
        <p className="card-desc">
          <Rich text={description} />
        </p>
        <p className="card-stack">
          <span className="sr-only">{labels.stack}: </span>
          {stack.map((s, i) => (
            <span key={s}>
              {i > 0 && <span aria-hidden="true"> / </span>}
              <Rich text={s} />
            </span>
          ))}
        </p>
        {action.kind === 'soon' && <p className="card-soon">{labels.comingSoon}</p>}
        {linked && (
          <p className="card-go" aria-hidden="true">
            {action.kind === 'external' ? labels.visit : labels.readCase}
          </p>
        )}
      </div>
    </article>
  )
}
