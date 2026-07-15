import * as React from 'react'
import { Link } from 'react-router-dom'
import type { Idea, IdeaExtrapolation } from '../../types/domain'
import { cn } from '../../lib/cn'
import { extrapolationTriageLabels } from './extrapolationLabels'
import {
  buildExtrapolationGraph,
  extrapolationEdgeMeta,
  extrapolationNodeRadius,
  type ExtrapolationEdgeKind,
  type ExtrapolationGraph,
  type ExtrapolationGraphNode,
} from './extrapolationGraph'

type SimNode = ExtrapolationGraphNode & {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  fixed?: boolean
}

type Props = {
  idea: Idea
  extrapolation: IdeaExtrapolation
  ideas: Idea[]
  className?: string
}

function nodeFill(kind: ExtrapolationGraphNode['kind'], status?: string): string {
  if (status === 'converted') return '#0d9488'
  if (kind === 'source') return 'var(--color-primary)'
  if (kind === 'complement') return 'var(--color-primary)'
  if (kind === 'portfolio_link') return '#6366f1'
  return 'var(--color-alternate)'
}

function useExtrapolationSim(graph: ExtrapolationGraph, width: number, height: number, sourceId: string) {
  const nodesRef = React.useRef<SimNode[]>([])
  const edgesRef = React.useRef(graph.edges)
  const frameRef = React.useRef(0)
  const [, bump] = React.useReducer((n) => n + 1, 0)

  React.useEffect(() => {
    edgesRef.current = graph.edges
    const connectionCount = new Map<string, number>()
    for (const e of graph.edges) {
      connectionCount.set(e.source, (connectionCount.get(e.source) ?? 0) + 1)
      connectionCount.set(e.target, (connectionCount.get(e.target) ?? 0) + 1)
    }

    const prev = new Map(nodesRef.current.map((n) => [n.id, n]))
    const cx = width / 2
    const cy = height / 2

    nodesRef.current = graph.nodes.map((n, i) => {
      const existing = prev.get(n.id)
      const isSource = n.id === sourceId
      const angle = (i / Math.max(graph.nodes.length, 1)) * Math.PI * 2
      const r = extrapolationNodeRadius(n.kind, connectionCount.get(n.id) ?? 0)
      return {
        ...n,
        r,
        x: isSource ? cx : (existing?.x ?? cx + Math.cos(angle) * 100),
        y: isSource ? cy : (existing?.y ?? cy + Math.sin(angle) * 100),
        vx: existing?.vx ?? 0,
        vy: existing?.vy ?? 0,
        fixed: isSource,
      }
    })
    bump()
  }, [graph, width, height, sourceId])

  React.useEffect(() => {
    if (width <= 0 || height <= 0 || nodesRef.current.length === 0) return

    let ticks = 0
    const maxTicks = 280
    const cx = width / 2
    const cy = height / 2

    const step = () => {
      const nodes = nodesRef.current
      const edges = edgesRef.current
      const nodeById = new Map(nodes.map((n) => [n.id, n]))

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const b = nodes[j]
          let dx = b.x - a.x
          let dy = b.y - a.y
          let dist = Math.hypot(dx, dy)
          if (dist < 1) {
            dist = 1
            dx = 1
            dy = 0
          }
          const repulse = 2800 / (dist * dist)
          const fx = (dx / dist) * repulse
          const fy = (dy / dist) * repulse
          if (!a.fixed) {
            a.vx -= fx
            a.vy -= fy
          }
          if (!b.fixed) {
            b.vx += fx
            b.vy += fy
          }
        }
      }

      for (const edge of edges) {
        const a = nodeById.get(edge.source)
        const b = nodeById.get(edge.target)
        if (!a || !b) continue
        const dx = b.x - a.x
        const dy = b.y - a.y
        const dist = Math.hypot(dx, dy) || 1
        const ideal =
          edge.kind === 'portfolio_bridge' ? 110 : edge.kind === 'converted' ? 85 : 95
        const pull = (dist - ideal) * 0.04
        const fx = (dx / dist) * pull
        const fy = (dy / dist) * pull
        if (!a.fixed) {
          a.vx += fx
          a.vy += fy
        }
        if (!b.fixed) {
          b.vx -= fx
          b.vy -= fy
        }
      }

      for (const n of nodes) {
        if (n.fixed) continue
        n.vx += (cx - n.x) * 0.0015
        n.vy += (cy - n.y) * 0.0015
        n.vx *= 0.84
        n.vy *= 0.84
        n.x += n.vx
        n.y += n.vy
        n.x = Math.max(n.r + 8, Math.min(width - n.r - 8, n.x))
        n.y = Math.max(n.r + 8, Math.min(height - n.r - 8, n.y))
      }

      ticks++
      if (ticks < maxTicks) {
        frameRef.current = requestAnimationFrame(step)
        if (ticks % 3 === 0) bump()
      }
    }

    frameRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frameRef.current)
  }, [graph, width, height])

  return nodesRef
}

export function ExtrapolationMindMap({ idea, extrapolation, ideas, className }: Props) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [size, setSize] = React.useState({ width: 640, height: 360 })
  const [hoveredId, setHoveredId] = React.useState<string | null>(null)
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [enabledKinds, setEnabledKinds] = React.useState<Set<ExtrapolationEdgeKind>>(
    () => new Set(['extension', 'portfolio_bridge', 'converted'])
  )
  const dragRef = React.useRef<{ id: string } | null>(null)

  const graph = React.useMemo(
    () => buildExtrapolationGraph(idea, extrapolation, ideas),
    [idea, extrapolation, ideas]
  )

  const filteredEdges = React.useMemo(
    () => graph.edges.filter((e) => enabledKinds.has(e.kind)),
    [graph.edges, enabledKinds]
  )

  const simGraph = React.useMemo(
    () => ({ nodes: graph.nodes, edges: filteredEdges }),
    [graph.nodes, filteredEdges]
  )

  const nodesRef = useExtrapolationSim(simGraph, size.width, size.height, idea.id)

  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ width: Math.max(280, width), height: Math.max(280, height) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const handlePointerDown = (node: SimNode, e: React.PointerEvent) => {
    if (node.kind === 'source') return
    e.stopPropagation()
    const n = nodesRef.current.find((x) => x.id === node.id)
    if (!n) return
    n.fixed = true
    dragRef.current = { id: n.id }
    setSelectedId(n.id)
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current
    if (!drag) return
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const n = nodesRef.current.find((x) => x.id === drag.id)
    if (!n) return
    n.x = e.clientX - rect.left
    n.y = e.clientY - rect.top
  }

  const handlePointerUp = () => {
    const drag = dragRef.current
    if (!drag) return
    const n = nodesRef.current.find((x) => x.id === drag.id)
    if (n && n.kind !== 'source') n.fixed = false
    dragRef.current = null
  }

  const hovered = hoveredId ? nodesRef.current.find((n) => n.id === hoveredId) : null
  const selectedNode = selectedId ? graph.nodes.find((n) => n.id === selectedId) : null
  const tooltipNode = hovered ?? selectedNode

  const toggleKind = (kind: ExtrapolationEdgeKind) => {
    setEnabledKinds((prev) => {
      const next = new Set(prev)
      if (next.has(kind)) next.delete(kind)
      else next.add(kind)
      return next
    })
  }

  if (graph.nodes.length <= 1) {
    return (
      <p className={cn('text-xs text-tertiary/55', className)}>
        Pas encore de propositions à cartographier — lance un mode Expand ou Focus.
      </p>
    )
  }

  const kindLegend: { kind: ExtrapolationGraphNode['kind']; label: string; color: string }[] = [
    { kind: 'source', label: 'Idée de base', color: 'var(--color-primary)' },
    { kind: 'complement', label: 'Extension', color: 'var(--color-primary)' },
    { kind: 'portfolio_link', label: 'Lien portfolio', color: '#6366f1' },
    { kind: 'portfolio_idea', label: 'Idée existante', color: 'var(--color-alternate)' },
  ]

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(extrapolationEdgeMeta) as ExtrapolationEdgeKind[]).map((kind) => (
          <button
            key={kind}
            type="button"
            onClick={() => toggleKind(kind)}
            className={cn(
              'rounded-full border px-2.5 py-1 text-micro font-medium transition',
              enabledKinds.has(kind)
                ? 'border-alternate/70 bg-background text-midnight'
                : 'border-alternate/40 bg-mineral/40 text-tertiary/45 line-through'
            )}
          >
            <span
              className="mr-1.5 inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: extrapolationEdgeMeta[kind].stroke }}
            />
            {extrapolationEdgeMeta[kind].label}
          </button>
        ))}
      </div>

      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-[--radius-sharp] border border-alternate/60 bg-[radial-gradient(circle_at_center,var(--color-mineral)_0%,var(--color-background)_75%)]"
        style={{ height: 360 }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <svg width={size.width} height={size.height} className="block touch-none">
          <g>
            {filteredEdges.map((edge) => {
              const a = nodesRef.current.find((n) => n.id === edge.source)
              const b = nodesRef.current.find((n) => n.id === edge.target)
              if (!a || !b) return null
              const meta = extrapolationEdgeMeta[edge.kind]
              const highlighted =
                hoveredId === edge.source ||
                hoveredId === edge.target ||
                selectedId === edge.source ||
                selectedId === edge.target
              return (
                <line
                  key={edge.id}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={meta.stroke}
                  strokeWidth={1.5}
                  strokeDasharray={meta.dash}
                  opacity={highlighted ? 0.9 : 0.4}
                />
              )
            })}
          </g>
          <g>
            {nodesRef.current.map((node) => {
              const fill = nodeFill(node.kind, node.status)
              const isPortfolioIdea = node.kind === 'portfolio_idea'
              const selected = selectedId === node.id || hoveredId === node.id
              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x},${node.y})`}
                  onPointerDown={(e) => handlePointerDown(node, e)}
                  onPointerEnter={() => setHoveredId(node.id)}
                  onPointerLeave={() => setHoveredId((id) => (id === node.id ? null : id))}
                  className={node.kind === 'source' ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}
                >
                  {selected ? (
                    <circle
                      r={node.r + 5}
                      fill="none"
                      stroke="var(--color-primary)"
                      strokeWidth={2}
                      opacity={0.4}
                    />
                  ) : null}
                  <circle
                    r={node.r}
                    fill={isPortfolioIdea ? 'var(--color-background)' : fill}
                    stroke={isPortfolioIdea ? fill : 'none'}
                    strokeWidth={2}
                    opacity={node.triage === 'off_focus' ? 0.45 : node.status === 'converted' ? 0.95 : 0.88}
                  />
                  <text
                    y={node.r + 12}
                    textAnchor="middle"
                    className="fill-midnight text-[9px] font-medium"
                    style={{ pointerEvents: 'none' }}
                  >
                    {node.label.length > 24 ? `${node.label.slice(0, 22)}…` : node.label}
                  </text>
                </g>
              )
            })}
          </g>
        </svg>

        {tooltipNode ? (
          <div className="pointer-events-none absolute bottom-3 left-3 max-w-xs rounded-[--radius-sharp] border border-alternate/60 bg-background/95 px-3 py-2 text-xs shadow-sm backdrop-blur-sm">
            <div className="font-semibold text-midnight">{tooltipNode.label}</div>
            <div className="mt-1 space-y-0.5 text-tertiary/65">
              {tooltipNode.kind === 'source' ? (
                <span>Noyau — point de départ de l&apos;exploration</span>
              ) : tooltipNode.kind === 'complement' ? (
                <span>Extension du noyau</span>
              ) : tooltipNode.kind === 'portfolio_link' ? (
                <span>Pont vers ton portfolio</span>
              ) : (
                <span>Idée déjà dans ton portfolio</span>
              )}
              {tooltipNode.triage ? (
                <div>{extrapolationTriageLabels[tooltipNode.triage]}</div>
              ) : null}
              {tooltipNode.status === 'converted' ? (
                <div className="text-teal-700">Convertie en idée</div>
              ) : null}
            </div>
          </div>
        ) : null}

        {selectedNode?.ideaId && selectedNode.kind !== 'source' ? (
          <div className="absolute right-3 top-3">
            <Link
              to={`/app/ideas/${selectedNode.ideaId}`}
              className="rounded-[--radius-sharp] border border-primary/40 bg-primary/15 px-3 py-1.5 text-xs font-semibold text-midnight hover:bg-primary/25"
            >
              Ouvrir →
            </Link>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3 text-micro text-tertiary/55">
        {kindLegend.map((item) => (
          <span key={item.kind} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}
