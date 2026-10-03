import { useEffect, useRef, useState } from 'react'
import { content } from '../../content'
import { markRevealed } from '../../lib/htmlState'
import { WatercolorGround } from '../../lib/paint'
import { useReducedMotion } from '../../lib/useReducedMotion'

const FILL_MS = 1800

/**
 * The page's ground. It starts as bare paper with the text printed in paper
 * colour, so nothing reads. The visitor paints watercolour behind the text and
 * the words appear. Past the threshold, broad washes cover the rest and the
 * page opens. Arriving by #link, the ground is painted at once.
 */
export function PaintedGround() {
  const reduced = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wetRef = useRef<HTMLCanvasElement>(null)
  const promptRef = useRef<HTMLDivElement>(null)
  const openRef = useRef<(x: number, y: number) => void>(() => {})
  const [prompting, setPrompting] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    const wet = wetRef.current
    if (!canvas || !wet) return
    let painter: WatercolorGround
    try {
      painter = new WatercolorGround(canvas, wet, {
        onProgress: (p) => promptRef.current?.style.setProperty('--progress', p.toFixed(3)),
        onThreshold: () => openRef.current(0, 0),
      })
    } catch {
      // No canvas: CSS shows the flat paint colour instead.
      document.documentElement.classList.add('revealed', 'no-paint')
      return
    }
    canvas.dataset.ready = ''

    let opened = false
    openRef.current = () => {
      if (opened) return
      opened = true
      setPrompting(false)
      // The page opens as the last passes go on.
      markRevealed()
      if (reduced) painter.fillNow()
      else void painter.fill(FILL_MS)
    }

    if (document.documentElement.classList.contains('revealed')) {
      opened = true
      painter.fillNow()
      return () => painter.destroy()
    }

    painter.listen()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !(e.target instanceof HTMLButtonElement)) openRef.current(0, 0)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      painter.destroy()
      window.removeEventListener('keydown', onKey)
    }
  }, [reduced])

  const t = content.gate
  return (
    <>
      <canvas ref={canvasRef} className="ground" aria-hidden="true" />
      {/* The stroke still being painted, shown wet until it dries into the ground. */}
      <canvas ref={wetRef} className="ground ground-wet" aria-hidden="true" />
      {prompting && (
        <div ref={promptRef} className="prompt">
          <p className="prompt-text">{t.prompt}</p>
          <p className="prompt-hint">{t.hint}</p>
          <button type="button" className="prompt-skip" onClick={() => openRef.current(0, 0)}>
            {t.skip}
          </button>
        </div>
      )}
    </>
  )
}
