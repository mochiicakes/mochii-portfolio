import { Fragment, type CSSProperties, type ReactNode, type Ref } from 'react'
import { content } from '../../content'
import { hasPlaceholder } from '../../lib/placeholder'
import { ExternalLink } from './ExternalLink'

/** Drawn on a 16 × 16 grid. */
const ICONS = {
  email:
    'M1.5 2.5h13a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1zm.6 1.4L8 8.5l5.9-4.6zM1.9 5.1v7h12.2v-7L8 9.9z',
  linkedin:
    'M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193V6.169h-2.4c.03.678 0 7.225 0 7.225z',
  github:
    'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z',
  roles:
    'M5 3V2a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 11 2v1h3.5A1.5 1.5 0 0 1 16 4.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 13.5v-9A1.5 1.5 0 0 1 1.5 3zm1.2 0h3.6V2a.3.3 0 0 0-.3-.3h-3a.3.3 0 0 0-.3.3z',
  where:
    'M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm0 1.3c.8 0 1.9 1.5 2.3 4H5.7c.4-2.5 1.5-4 2.3-4zM5.6 1.7A9 9 0 0 0 4.4 5.3H1.9a6.7 6.7 0 0 1 3.7-3.6zm4.8 0a6.7 6.7 0 0 1 3.7 3.6h-2.5a9 9 0 0 0-1.2-3.6zM1.5 6.6h2.7a14 14 0 0 0 0 2.8H1.5a6.7 6.7 0 0 1 0-2.8zm4 0h5a13 13 0 0 1 0 2.8h-5a13 13 0 0 1 0-2.8zm6.3 0h2.7a6.7 6.7 0 0 1 0 2.8h-2.7a14 14 0 0 0 0-2.8zM1.9 10.7h2.5a9 9 0 0 0 1.2 3.6 6.7 6.7 0 0 1-3.7-3.6zm3.8 0h4.6c-.4 2.5-1.5 4-2.3 4s-1.9-1.5-2.3-4zm5.9 0h2.5a6.7 6.7 0 0 1-3.7 3.6 9 9 0 0 0 1.2-3.6z',
  type: 'M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm0 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zM7.2 3.5v5l3.9 2.3.8-1.3-3.1-1.8V3.5z',
}
type Icon = keyof typeof ICONS

type Line = { indent: number; icon?: Icon; code: ReactNode }

/** Syntax only: it is drawn, but not read out. */
const P = ({ children }: { children: ReactNode }) => <span aria-hidden="true">{children}</span>
const Keyword = ({ children }: { children: ReactNode }) => (
  <span className="code-keyword" aria-hidden="true">
    {children}
  </span>
)
const Method = ({ name }: { name: string }) => (
  <>
    <Keyword>def</Keyword> <span className="code-name">{name}</span>
    <P>(self):</P>
  </>
)
const Key = ({ name }: { name: string }) => (
  <>
    <span className="code-string">
      <P>&quot;</P>
      {name}
      <P>&quot;</P>
    </span>
    <P>:</P>{' '}
  </>
)
const Value = ({ children }: { children: ReactNode }) => (
  <span className="code-string">
    <P>&quot;</P>
    {children}
    <P>&quot;</P>
  </span>
)
const Return = () => (
  <>
    <Keyword>return</Keyword> <P>{'{'}</P>
  </>
)

/**
 * The contact card, written as a class open in an editor. The name is selected,
 * with the cursor on its last letter; links are the strings themselves. The
 * status line says what was copied.
 */
export function ContactCode({
  emailRef,
  onCopy,
  message,
}: {
  emailRef: Ref<HTMLSpanElement>
  onCopy: () => void
  message: string
}) {
  const c = content.contact
  const { code } = c
  const lines: Line[] = [
    {
      indent: 0,
      code: (
        <>
          <Keyword>class</Keyword>{' '}
          <span className="code-selected">
            {code.name.slice(0, -1)}
            <span className="code-cursor">{code.name.slice(-1)}</span>
          </span>
          <P>(</P>
          {code.bases.map((b, i) => (
            <Fragment key={b}>
              {i > 0 && ', '}
              {b}
            </Fragment>
          ))}
          <P>):</P>
        </>
      ),
    },
    { indent: 1, code: <Method name={code.info} /> },
    { indent: 2, code: <Return /> },
    {
      indent: 3,
      icon: 'email',
      code: (
        <>
          <Key name="email" />
          <Value>
            <span ref={emailRef}>{c.email}</span>
          </Value>
          <P>,</P>{' '}
          <button type="button" className="code-copy needs-js" onClick={onCopy}>
            {c.copy}
          </button>
        </>
      ),
    },
    ...c.links.map((l): Line => ({
      indent: 3,
      icon: l.icon,
      code: (
        <>
          <Key name={l.icon} />
          <Value>{hasPlaceholder(l.href) ? l.text : <ExternalLink href={l.href}>{l.text}</ExternalLink>}</Value>
          <P>,</P>
        </>
      ),
    })),
    { indent: 2, code: <P>{'}'}</P> },
    { indent: 1, code: <Method name={code.open} /> },
    { indent: 2, code: <Return /> },
    {
      indent: 3,
      icon: 'roles',
      code: (
        <>
          <Key name="roles" />
          <P>[</P>
        </>
      ),
    },
    ...c.openTo.roles.map((role): Line => ({
      indent: 4,
      code: (
        <>
          <Value>{role}</Value>
          <P>,</P>
        </>
      ),
    })),
    { indent: 3, code: <P>],</P> },
    {
      indent: 3,
      icon: 'type',
      code: (
        <>
          <Key name="type" />
          <P>[</P>
          {c.openTo.type.map((t, i) => (
            <Fragment key={t}>
              {i > 0 && <P>, </P>}
              <Value>{t}</Value>
            </Fragment>
          ))}
          <P>],</P>
        </>
      ),
    },
    {
      indent: 3,
      icon: 'where',
      code: (
        <>
          <Key name="where" />
          <Value>{c.openTo.where}</Value>
          <P>,</P>
        </>
      ),
    },
    { indent: 2, code: <P>{'}'}</P> },
  ]

  return (
    <div className="code pane">
      <p className="sr-only">{code.hello}</p>
      <ol className="code-lines">
        {lines.map((line, i) => (
          <li key={i} style={{ '--indent': line.indent } as CSSProperties}>
            <span className="code-sign" aria-hidden="true">
              {line.icon && (
                <svg viewBox="0 0 16 16" fillRule="evenodd">
                  <path d={ICONS[line.icon]} />
                </svg>
              )}
            </span>
            <span className="code-number" aria-hidden="true">
              {i + 1}
            </span>
            <span className="code-text">{line.code}</span>
          </li>
        ))}
      </ol>
      <div className="code-status">
        <span aria-hidden={message ? true : undefined} className="code-mode">
          {message || <P>-- VISUAL --</P>}
        </span>
        <span aria-hidden="true">1,{'class '.length + code.name.length}</span>
        <span aria-hidden="true">All</span>
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {message}
      </p>
    </div>
  )
}
