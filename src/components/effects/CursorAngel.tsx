import { useEffect, useRef, useSyncExternalStore } from 'react'
import { AngelPainter, newAngel, poseAngel, resizeAngel, updateAngel, type AngelInput } from '../../lib/angel'
import { heartEaten, markHeartEaten, revealStore } from '../../lib/htmlState'
import { useReducedMotion } from '../../lib/useReducedMotion'

const SIZE = 's'
/** A touch that moves further than this (px) is a drag, not a tap. */
const TAP = 12
/** The still angel's tail ends this far above the page's foot, clear of the credits. */
const FOOT = 46

/** Each page's last screen has a home for the heart; the one that is showing. */
const findHome = () =>
  [...document.querySelectorAll<HTMLElement>('.koi-home')].find((h) => h.getClientRects().length > 0)

/**
 * The sea angel follows the pointer, or swims to wherever you tap and circles
 * there. A glowing heart waits at the foot of the open page's last screen
 * (.koi-home); once the angel eats it, it carries it for the rest of the visit.
 * Under reduced motion it rests there, still, with the heart inside.
 */
export function CursorAngel() {
  const revealed = useSyncExternalStore(revealStore.subscribe, revealStore.get, revealStore.getServer)
  const reduced = useReducedMotion()
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!revealed || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let painter: AngelPainter
    try {
      painter = new AngelPainter()
    } catch {
      return
    }

    const angel = newAngel(window.innerWidth, window.innerHeight, SIZE, reduced || heartEaten())
    let raf = 0

    const size = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      // The canvas's own box, not the window: a phone's sliding toolbar changes
      // the window's height, and rebuilding the canvas for that stutters.
      const w = Math.round(canvas.clientWidth * dpr)
      const h = Math.round(canvas.clientHeight * dpr)
      if (canvas.width !== w) canvas.width = w
      if (canvas.height !== h) canvas.height = h
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      resizeAngel(angel, window.innerWidth, window.innerHeight, SIZE)
    }
    const clear = () => ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
    size()
    canvas.classList.add('is-on')

    if (reduced) {
      const draw = () => {
        raf = 0
        clear()
        const box = findHome()?.getBoundingClientRect()
        if (!box || box.top > window.innerHeight + angel.L || box.bottom < -angel.L) return
        poseAngel(angel, box.left + box.width / 2, box.bottom - FOOT - angel.L)
        painter.draw(ctx, angel, 0)
      }
      const redraw = () => {
        if (!raf) raf = requestAnimationFrame(draw)
      }
      const onResize = () => {
        size()
        redraw()
      }
      // The page also moves when the mode, the page or a tab changes its height.
      const ro = new ResizeObserver(redraw)
      ro.observe(document.body)
      const mo = new MutationObserver(redraw)
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode', 'data-page'] })
      window.addEventListener('scroll', redraw, { passive: true })
      window.addEventListener('resize', onResize)
      redraw()
      return () => {
        cancelAnimationFrame(raf)
        ro.disconnect()
        mo.disconnect()
        window.removeEventListener('scroll', redraw)
        window.removeEventListener('resize', onResize)
        clear()
        canvas.classList.remove('is-on')
      }
    }

    const input: AngelInput = { x: angel.x, y: angel.y, at: -1e9, has: false, tap: false }
    const { heart } = angel
    let last = 0

    const frame = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60
      last = now
      // The heart scrolls with the page until the angel takes hold of it.
      if (heart.state === 'free') {
        const box = findHome()?.getBoundingClientRect()
        heart.shown = !!box && box.top < window.innerHeight && box.bottom > 0
        if (box) {
          heart.x = box.left + box.width / 2
          heart.y = box.top + box.height / 2
        }
      }
      const uneaten = heart.state !== 'carried'
      updateAngel(angel, input, dt, now)
      if (uneaten && heart.state === 'carried') markHeartEaten()
      clear()
      painter.draw(ctx, angel, now)
      raf = requestAnimationFrame(frame)
    }

    const target = (e: PointerEvent, tap: boolean) => {
      input.x = e.clientX
      input.y = e.clientY
      input.at = performance.now()
      input.has = true
      input.tap = tap
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') target(e, false)
    }
    // Touch: only a tap counts. A scroll ends in pointercancel, so it has no pointerup.
    let down: { id: number; x: number; y: number } | null = null
    const onDown = (e: PointerEvent) => {
      down = e.pointerType === 'touch' && e.isPrimary ? { id: e.pointerId, x: e.clientX, y: e.clientY } : null
    }
    const onUp = (e: PointerEvent) => {
      if (down?.id === e.pointerId && Math.hypot(e.clientX - down.x, e.clientY - down.y) <= TAP) target(e, true)
      down = null
    }
    const onCancel = () => {
      down = null
    }

    // Capture, so a component that stops its own pointer events can't hide a tap.
    const early = { passive: true, capture: true }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, early)
    window.addEventListener('pointerup', onUp, early)
    window.addEventListener('pointercancel', onCancel, early)
    window.addEventListener('resize', size)
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown, early)
      window.removeEventListener('pointerup', onUp, early)
      window.removeEventListener('pointercancel', onCancel, early)
      window.removeEventListener('resize', size)
      clear()
      canvas.classList.remove('is-on')
    }
  }, [revealed, reduced])

  return <canvas ref={ref} className="cursor-angel" aria-hidden="true" />
}
