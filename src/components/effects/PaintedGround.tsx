import { useEffect, useRef, useState } from 'react'
import { content } from '../../content'
import { markRevealed } from '../../lib/htmlState'
import { WatercolorGround } from '../../lib/paint'
import { PaperMask } from '../../lib/paper'
import { useReducedMotion } from '../../lib/useReducedMotion'

const REVEAL_MS = 1300

/**
 * The page's ground, in three layers: the prompt on top, then white paper,
 * then the page over a watercolour background that is painted in full before
 * anyone sees it. Painting splats holes in the paper; past the threshold the
 * rest is splatted away and the paper removed, so none of the visitor's
 * strokes stay in the page. Arriving by #link, there is no paper at all.
 */
export function PaintedGround() {
  const reduced = useReducedMotion()
  const groundRef = useRef<HTMLCanvasElement>(null)
  const paperRef = useRef<HTMLCanvasElement>(null)
  const promptRef = useRef<HTMLDivElement>(null)
  const openRef = useRef<() => void>(() => {})
  const [prompting, setPrompting] = useState(true)
  const [paperGone, setPaperGone] = useState(false)

  useEffect(() => {
    const ground = groundRef.current
    if (!ground) return
    let bg: WatercolorGround
    try {
      bg = new WatercolorGround(ground)
    } catch {
      // No canvas: CSS shows the flat paint colour instead.
      document.documentElement.classList.add('revealed', 'no-paint')
      return
    }
    ground.dataset.ready = ''

    const sheet = paperRef.current
    // Arrived by #link (or already open): CSS keeps the paper hidden.
    if (!sheet || document.documentElement.classList.contains('revealed')) return () => bg.destroy()

    let paper: PaperMask
    try {
      paper = new PaperMask(sheet, {
        onProgress: (p) => promptRef.current?.style.setProperty('--progress', p.toFixed(3)),
        onThreshold: () => openRef.current(),
      })
    } catch {
      markRevealed()
      return () => bg.destroy()
    }

    let opened = false
    openRef.current = () => {
      if (opened) return
      opened = true
      setPrompting(false)
      // Keep the paper on screen while it is splatted away.
      sheet.dataset.revealing = ''
      markRevealed()
      void paper.reveal(reduced ? 0 : REVEAL_MS).then(() => {
        paper.destroy()
        setPaperGone(true)
      })
    }

    paper.listen()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !(e.target instanceof HTMLButtonElement)) openRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      bg.destroy()
      paper.destroy()
      window.removeEventListener('keydown', onKey)
    }
  }, [reduced])

  const t = content.gate
  return (
    <>
      {/* The finished background, under everything. */}
      <canvas ref={groundRef} className="ground" aria-hidden="true" />
      {/* The paper over the page, worn through by the brush. */}
      {!paperGone && <canvas ref={paperRef} className="paper" aria-hidden="true" />}
      {prompting && (
        <div ref={promptRef} className="prompt">
          <p className="prompt-text">{t.prompt}</p>
          <p className="prompt-hint">{t.hint}</p>
          <button type="button" className="prompt-skip" onClick={() => openRef.current()}>
            {t.skip}
          </button>
        </div>
      )}
    </>
  )
}
