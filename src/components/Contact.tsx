import { useEffect, useRef, useState } from 'react'
import { content } from '../content'
import { hasPlaceholder } from '../lib/placeholder'
import { ExternalLink } from './ui/ExternalLink'
import { ScreenFoot } from './ScreenFoot'
import { Rich } from './ui/Rich'
import { Thumb } from './ui/Thumb'

async function copyText(text: string, fallbackEl: HTMLElement | null): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Older browsers and insecure origins: select the text and use execCommand.
    if (!fallbackEl) return false
    const range = document.createRange()
    range.selectNodeContents(fallbackEl)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)
    try {
      return document.execCommand('copy')
    } catch {
      return false
    }
  }
}

export function Contact() {
  const c = content.contact
  const emailRef = useRef<HTMLSpanElement>(null)
  const [toast, setToast] = useState('')
  const timer = useRef(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const onCopy = async () => {
    const ok = await copyText(c.email, emailRef.current)
    setToast(ok ? c.copied : c.copyFailed)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setToast(''), 2400)
  }

  return (
    <section id="contact" className="contact" data-screen aria-labelledby="contact-title">
      <h2 id="contact-title" className="contact-title">
        {c.title}
      </h2>
      <div className="contact-board">
        <div className="note-stack">
          <div className="note">
            <span className="pin" aria-hidden="true" />
            <p className="note-line">
              <span className="note-typed">{c.note.hello}</span> <span className="note-hand">{c.note.name}</span>
            </p>
            <p className="note-line">
              <span className="note-typed">{c.note.am}</span> <span className="note-hand">{c.note.role}</span>
            </p>
            <p className="note-line">
              <span className="note-typed">{c.note.open}</span>{' '}
              <span className="note-fill">
                <Rich text={c.openTo} />
              </span>
            </p>
            <p className="note-line">
              <span className="note-typed">{c.note.write}</span>{' '}
              <span ref={emailRef} className="note-fill email">
                {c.email}
              </span>{' '}
              <button type="button" className="note-copy needs-js" onClick={onCopy}>
                {c.copy}
              </button>
            </p>
          </div>
        </div>
        <figure className="polaroid">
          <div className="polaroid-frame">
            <span className="pin" aria-hidden="true" />
            <Thumb src={c.selfie.src} alt={c.selfie.alt} label={c.note.name} className="polaroid-photo" />
            <figcaption className="polaroid-caption">{c.selfie.caption}</figcaption>
          </div>
        </figure>
      </div>
      <ul className="contact-links">
        {c.links.map((l) => (
          <li key={l.label}>
            {hasPlaceholder(l.href) ? (
              <span className="btn btn-pending" title="Link coming soon">
                {l.label}
              </span>
            ) : (
              <ExternalLink href={l.href} className="btn btn-line">
                {l.label}
              </ExternalLink>
            )}
          </li>
        ))}
        <li>
          <a className="btn btn-koi" href={c.cv.href} download>
            {c.cv.label}
          </a>
        </li>
      </ul>
      <p className={toast ? 'toast is-shown' : 'toast'} role="status" aria-live="polite">
        {toast}
      </p>
      <ScreenFoot />
    </section>
  )
}
