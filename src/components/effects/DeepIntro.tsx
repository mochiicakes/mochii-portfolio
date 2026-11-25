import { useEffect, useRef, useState } from 'react'
import { content } from '../../content'
import { DeepMask } from '../../lib/deep'
import { markRevealed } from '../../lib/htmlState'
import { images, loadFonts, loadImages, markLoadingSeen, prepare, seenLoading, whenReady } from '../../lib/loading'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { Title } from '../ui/Title'
import { LoadingAngel } from './LoadingAngel'

const REVEAL_MS = 1300
/** How long a loading line stays at least, and the last one, the first time they are seen. */
const LINE_MS = 900
const READY_MS = 1200
/** The same, after a reload. */
const READY_AGAIN_MS = 500
/** However slow the connection, loading is over by then. */
const CAP_MS = 10_000

/**
 * The way in: black water over the page. First the sea angel floats in it while
 * everything loads (LoadingAngel); then the prompt shows, over the finished page.
 * Dragging lights holes in the dark; past the threshold the light spreads over
 * the rest and the dark is removed, so none of the visitor's strokes stay in
 * the page. Arriving by #link, there is no dark at all.
 */
export function DeepIntro() {
  const reduced = useReducedMotion()
  const deepRef = useRef<HTMLDivElement>(null)
  const promptRef = useRef<HTMLDivElement>(null)
  const openRef = useRef<() => void>(() => {})
  const { loading } = content.gate
  const [line, setLine] = useState(loading.files)
  const [loaded, setLoaded] = useState(false)
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

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !(e.target instanceof HTMLButtonElement)) openRef.current()
    }

    // Nothing lights, and nothing opens, until everything has loaded.
    let left = false
    let pause = 0
    const seen = seenLoading()
    const show = (text: string) => {
      if (!left) setLine(text)
    }
    void prepare(
      [
        { line: loading.files, done: Promise.all([loadFonts(), loadImages(images(content))]) },
        { line: loading.light, done: whenReady('light') },
        { line: loading.flowers, done: whenReady('flowers') },
      ],
      show,
      { minMs: seen ? 0 : LINE_MS, capMs: CAP_MS },
    ).then(() => {
      show(loading.ready)
      pause = window.setTimeout(
        () => {
          if (left) return
          markLoadingSeen()
          setLoaded(true)
          deep.listen()
          window.addEventListener('keydown', onKey)
        },
        seen ? READY_AGAIN_MS : READY_MS,
      )
    })
    return () => {
      left = true
      window.clearTimeout(pause)
      deep.destroy()
      window.removeEventListener('keydown', onKey)
    }
  }, [reduced, loading])

  const t = content.gate
  return (
    <>
      {/* The dark over the page, opened by the light. */}
      {!gone && <div ref={deepRef} className="deep" aria-hidden="true" />}
      {!gone && <LoadingAngel line={line} done={loaded} still={reduced} />}
      {loaded && prompting && (
        <div ref={promptRef} className="prompt">
          <p className="prompt-text">
            <Title text={t.prompt} />
          </p>
          <div className="prompt-words">
            <p className="prompt-hint">{t.hint}</p>
            <p className="prompt-by">{content.hero.name}</p>
          </div>
          <button type="button" className="prompt-skip btn" onClick={() => openRef.current()}>
            {t.skip}
          </button>
        </div>
      )}
    </>
  )
}
