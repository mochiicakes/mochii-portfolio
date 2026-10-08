import { useEffect, useRef } from 'react'
import { Crystal } from '../../lib/crystal'
import { useReducedMotion } from '../../lib/useReducedMotion'

/** Rippling light, glints and glitter over the paint (see lib/crystal.ts). */
export function CrystalLayer() {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    let crystal: Crystal | null = null
    try {
      crystal = new Crystal(canvas, reduced)
      canvas.dataset.on = ''
      // The background is finished from the start and shows wherever the
      // paper is worn through, so the light moves from the start too.
      crystal.run(true)
    } catch {
      // No WebGL: the paint shows without the crystal light.
    }
    return () => crystal?.destroy()
  }, [reduced])

  return <canvas ref={ref} className="crystal" aria-hidden="true" />
}
