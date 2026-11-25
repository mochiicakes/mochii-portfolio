import { useEffect, useRef, useState } from 'react'
import { content } from '../content'
import { ScreenFoot } from './ScreenFoot'
import { ContactCode } from './ui/ContactCode'
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
  const [message, setMessage] = useState('')
  const timer = useRef(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const onCopy = async () => {
    const ok = await copyText(c.email, emailRef.current)
    setMessage(ok ? c.copied : c.copyFailed)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setMessage(''), 2400)
  }

  return (
    <section id="contact" className="contact" data-screen aria-labelledby="contact-title">
      <h2 id="contact-title" className="contact-title">
        {c.title}
      </h2>
      <div className="contact-board">
        <div className="code-stack">
          <ContactCode emailRef={emailRef} onCopy={onCopy} message={message} />
        </div>
        <figure className="polaroid">
          <div className="polaroid-frame pane">
            <Thumb src={c.selfie.src} alt={c.selfie.alt} label={content.hero.firstName} className="polaroid-photo" />
            <figcaption className="polaroid-caption">{c.selfie.caption}</figcaption>
          </div>
        </figure>
      </div>
      <ScreenFoot />
    </section>
  )
}
