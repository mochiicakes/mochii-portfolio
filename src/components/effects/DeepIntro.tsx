import { useEffect, useRef, useState } from 'react'
import { content } from '../../content'
import { DeepMask } from '../../lib/deep'
import { markRevealed } from '../../lib/htmlState'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { Title } from '../ui/Title'

const REVEAL_MS = 1300

/**
 * The way in: the prompt on top, then black water over the finished page.
 * Dragging lights holes in the dark; past the threshold the light spreads over
 * the rest and the dark is removed, so none of the visitor's strokes stay in
 * the page. Arriving by #link, there is no dark at all.
 */
export function DeepIntro() {
  const reduced = useReducedMotion()
  const deepRef = useRef<HTMLDivElement>(null)
  const promptRef = useRef<HTMLDivElement>(null)
  const openRef = useRef<() => void>(() => {})
  const [prompting, setPrompting] = useState(true)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const host = deepRef.current
    // Arrived by #link (or already open): CSS keeps the dark hidden.
    if (!host || document.documentElement.classList.contains('revealed')) return

    let deep: DeepMask
    try {
      deep = new DeepMask(host, {
        still: reduced,
        onProgress: (p) => promptRef.current?.style.setProperty('--progress', p.toFixed(3)),
        onThreshold: () => openRef.current(),
      })
    } catch {
      markRevealed()
      return
    }

    let opened = false
    openRef.current = () => {
      if (opened) return
      opened = true
      setPrompting(false)
      // Keep the dark on screen while the light spreads over it.
      host.dataset.revealing = ''
      markRevealed()
      void deep.reveal(reduced ? 0 : REVEAL_MS).then(() => {
        deep.destroy()
        setGone(true)
      })
    }

    deep.listen()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !(e.target instanceof HTMLButtonElement)) openRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      deep.destroy()
      window.removeEventListener('keydown', onKey)
    }
  }, [reduced])

  const t = content.gate
  return (
    <>
      {/* The dark over the page, opened by the light. */}
      {!gone && <div ref={deepRef} className="deep" aria-hidden="true" />}
      {prompting && (
        <div ref={promptRef} className="prompt">
          <p className="prompt-text">
            <Title text={t.prompt} />
          </p>
          <p className="prompt-hint">{t.hint}</p>
          <button type="button" className="prompt-skip btn" onClick={() => openRef.current()}>
            {t.skip}
          </button>
        </div>
      )}
    </>
  )
}
