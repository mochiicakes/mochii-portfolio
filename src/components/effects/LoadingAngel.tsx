import { useEffect, useRef } from 'react'
import { AngelPainter, newAngel, poseAngel, resizeAngel, updateAngel, type AngelInput } from '../../lib/angel'
import { heartEaten } from '../../lib/htmlState'

const SIZE = 'm'
/** The angel's middle, down the window. Its line sits under it (.loading-line). */
const MIDDLE = 0.44

/**
 * The loading screen: the sea angel floating in the dark, over a line about what
 * is being prepared. It fades out once `done`. Still under reduced motion.
 */
export function LoadingAngel({ line, done, still }: { line: string; done: boolean; still: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || document.documentElement.classList.contains('revealed')) return
    let painter: AngelPainter
    try {
      painter = new AngelPainter()
    } catch {
      return
    }
    const angel = newAngel(window.innerWidth, window.innerHeight, SIZE, heartEaten())
    const input: AngelInput = { x: 0, y: 0, at: -1e9, has: false, tap: false }
    const place = (t: number) => ({
      x: angel.W / 2 + Math.sin(t * 0.5) * angel.L * 0.04,
      y: angel.H * MIDDLE - angel.L / 2 + Math.sin(t * 0.9) * angel.L * 0.06,
    })
    let raf = 0
    let last = 0

    const draw = (now: number) => {
      ctx.clearRect(0, 0, angel.W, angel.H)
      painter.draw(ctx, angel, now)
    }
    const size = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.round(window.innerWidth * dpr)
      canvas.height = Math.round(window.innerHeight * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      resizeAngel(angel, window.innerWidth, window.innerHeight, SIZE)
      const at = place(last / 1000)
      poseAngel(angel, at.x, at.y)
      draw(last)
    }
    const frame = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60
      last = now
      // It swims as it does in the page, then the whole of it is brought back to
      // the middle, so the body keeps its own movement but never drifts away.
      updateAngel(angel, input, dt, now)
      const at = place(now / 1000)
      const dx = at.x - angel.x
      const dy = at.y - angel.y
      angel.x += dx
      angel.y += dy
      for (const p of angel.spine) {
        p.x += dx
        p.y += dy
      }
      draw(now)
      raf = requestAnimationFrame(frame)
    }
    size()
    window.addEventListener('resize', size)
    if (!still) raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', size)
    }
  }, [still])

  return (
    <div className="loading" data-done={done || undefined}>
      <canvas ref={ref} aria-hidden="true" />
      <p className="loading-line" role="status">
        {/* Keyed, so each line fades in. */}
        <span key={line}>{line}</span>
      </p>
    </div>
  )
}
