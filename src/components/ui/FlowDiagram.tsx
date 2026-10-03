import { useEffect, useId, useRef } from 'react'
import { useReducedMotion } from '../../lib/useReducedMotion'

const VW = 320
const VH = 200
const PAD_X = 16
const GAP = 16
const NODE_H = 44
const DOT_MS = 2200

type Node = { x: number; y: number; w: number; label: string[] }

/** Snake layout: first half left to right, second half back right to left. */
function layout(labels: string[]): Node[] {
  const top = Math.ceil(labels.length / 2)
  const w = (VW - PAD_X * 2 - GAP * (top - 1)) / top
  const rows = labels.length > top ? [56, 144] : [VH / 2]
  return labels.map((label, i) => {
    const row = i < top ? 0 : 1
    const col = i < top ? i : top - 1 - (i - top)
    return { x: PAD_X + col * (w + GAP) + w / 2, y: rows[row], w, label: splitLabel(label) }
  })
}

/** Two balanced lines for long labels. */
function splitLabel(label: string): string[] {
  const words = label.split(' ')
  if (label.length <= 10 || words.length < 2) return [label]
  let best = 1
  let bestDiff = Infinity
  for (let i = 1; i < words.length; i++) {
    const diff = Math.abs(words.slice(0, i).join(' ').length - words.slice(i).join(' ').length)
    if (diff < bestDiff) {
      bestDiff = diff
      best = i
    }
  }
  return [words.slice(0, best).join(' '), words.slice(best).join(' ')]
}

/** Arrow from the edge of node a to the edge of node b. */
function edge(a: Node, b: Node) {
  if (a.y === b.y) {
    const dir = Math.sign(b.x - a.x)
    return { x1: a.x + (dir * a.w) / 2 + dir * 2, y1: a.y, x2: b.x - (dir * b.w) / 2 - dir * 4, y2: b.y }
  }
  return { x1: a.x, y1: a.y + NODE_H / 2 + 2, x2: b.x, y2: b.y - NODE_H / 2 - 4 }
}

/**
 * A drawn workflow (rounded nodes joined by arrows). When it scrolls into
 * view, a glowing dot travels once from the first node to the last.
 */
export function FlowDiagram({ nodes }: { nodes: string[] }) {
  const uid = useId().replace(/:/g, '')
  const svgRef = useRef<SVGSVGElement>(null)
  const dotRef = useRef<SVGGElement>(null)
  const reduced = useReducedMotion()
  const placed = layout(nodes)

  useEffect(() => {
    const svg = svgRef.current
    const dot = dotRef.current
    if (reduced || !svg || !dot) return
    const pts = layout(nodes).map((n) => [n.x, n.y] as const)
    const segs = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]))
    const total = segs.reduce((a, b) => a + b, 0)
    let raf = 0

    const run = () => {
      const start = performance.now()
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / DOT_MS)
        const eased = p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2
        let d = eased * total
        let i = 0
        while (i < segs.length - 1 && d > segs[i]) d -= segs[i++]
        const f = segs[i] ? d / segs[i] : 0
        const x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f
        const y = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f
        dot.setAttribute('transform', `translate(${x} ${y})`)
        dot.style.opacity = p < 1 ? '1' : '0'
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect()
          run()
        }
      },
      { threshold: 0.6 },
    )
    io.observe(svg)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      dot.style.opacity = '0'
    }
  }, [nodes, reduced])

  return (
    <div className="thumb thumb-flow">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VW} ${VH}`}
        role="img"
        aria-labelledby={`${uid}-t`}
        preserveAspectRatio="xMidYMid meet"
      >
        <title id={`${uid}-t`}>{`Workflow diagram: ${nodes.join(' → ')}`}</title>
        <defs>
          <marker id={`${uid}-a`} viewBox="0 0 8 8" refX="6" refY="4" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 L8 4 L0 8 z" className="flow-head" />
          </marker>
          <radialGradient id={`${uid}-g`}>
            <stop offset="0" className="flow-glow" stopOpacity="0.9" />
            <stop offset="1" className="flow-glow" stopOpacity="0" />
          </radialGradient>
        </defs>
        {placed.slice(1).map((n, i) => {
          const e = edge(placed[i], n)
          return <line key={i} {...e} className="flow-edge" markerEnd={`url(#${uid}-a)`} />
        })}
        {placed.map((n, i) => (
          <g key={i} className="flow-node">
            <rect x={n.x - n.w / 2} y={n.y - NODE_H / 2} width={n.w} height={NODE_H} rx={12} />
            <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central">
              {n.label.length === 1 ? (
                n.label[0]
              ) : (
                <>
                  <tspan x={n.x} dy="-0.6em">
                    {n.label[0]}
                  </tspan>
                  <tspan x={n.x} dy="1.2em">
                    {n.label[1]}
                  </tspan>
                </>
              )}
            </text>
          </g>
        ))}
        <g ref={dotRef} className="flow-dot" style={{ opacity: 0 }}>
          <circle r={12} fill={`url(#${uid}-g)`} />
          <circle r={3.5} className="flow-core" />
        </g>
      </svg>
    </div>
  )
}
