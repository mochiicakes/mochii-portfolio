import { useEffect, useRef, useState } from 'react'
import { content } from '../content'
import { hasPlaceholder } from '../lib/placeholder'
import { ExternalLink } from './ui/ExternalLink'
import { Rich } from './ui/Rich'

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
    <section id="contact" className="contact" aria-labelledby="contact-title">
      <div className="contact-inner pane">
        <h2 id="contact-title" className="contact-title">
          {c.title}
        </h2>
        <p className="contact-open">
          <Rich text={c.openTo} />
        </p>
        <p className="email-row">
          <span ref={emailRef} className="email">
            {c.email}
          </span>
          <button type="button" className="btn btn-small needs-js" onClick={onCopy}>
            {c.copy}
          </button>
        </p>
        <ul className="contact-links">
          {c.links.map((l) => (
            <li key={l.label}>
              {hasPlaceholder(l.href) ? (
                <span className="contact-pending">
                  {l.label}: <Rich text={l.href} />
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
      </div>
      {/* Where the second koi waits. */}
      <div id="koi-home" className="koi-home" aria-hidden="true" />
    </section>
  )
}
