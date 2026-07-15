import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Idea } from '../../types/domain'
import {
  useAppStore,
  EMPTY_SYNERGY_LINKS,
  EMPTY_UMBRELLA_GROUPS,
  EMPTY_SHARED_BASES,
  useIdeaScore,
} from '../../app/store'
import { cn } from '../../lib/cn'
import {
  buildPortfolioGraph,
  buildSynergyGraph,
  graphEdgeMeta,
  graphNodeRadius,
  type GraphEdgeKind,
  type PortfolioGraph,
  type PortfolioGraphNode,
} from './portfolioGraph'

type SimNode = PortfolioGraphNode & {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  fixed?: boolean
}

type Props = {
  ideas: Idea[]
  className?: string
  mode?: 'portfolio' | 'synergy'
  showEdgeFilters?: boolean
  focusIdeaId?: string | null
  onSelectIdeaId?: (id: string | null) => void
  graphHeight?: string
}

function useSimNodes(graph: PortfolioGraph, width: number, height: number) {
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
    nodesRef.current = graph.nodes.map((n, i) => {
      const existing = prev.get(n.id)
      const angle = (i / Math.max(graph.nodes.length, 1)) * Math.PI * 2
      const r = graphNodeRadius(n.kind, connectionCount.get(n.id) ?? 0)
      return {
        ...n,
        r,
        x: existing?.x ?? width / 2 + Math.cos(angle) * 120,
        y: existing?.y ?? height / 2 + Math.sin(angle) * 120,
        vx: existing?.vx ?? 0,
        vy: existing?.vy ?? 0,
        fixed: false,
      }
    })
    bump()
  }, [graph, width, height])

  React.useEffect(() => {
    if (width <= 0 || height <= 0 || nodesRef.current.length === 0) return

    let ticks = 0
    const maxTicks = 360

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
          const repulse = 4200 / (dist * dist)
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
        const ideal = edge.kind === 'synergy' ? 140 : edge.kind === 'extension' ? 100 : 90
        const pull = (dist - ideal) * 0.035
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

      const cx = width / 2
      const cy = height / 2
      for (const n of nodes) {
        if (n.fixed) continue
        n.vx += (cx - n.x) * 0.002
        n.vy += (cy - n.y) * 0.002
        n.vx *= 0.86
        n.vy *= 0.86
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

function GraphNodeDot({
  node,
  selected,
  onPointerDown,
  onDoubleClick,
  onEnter,
  onLeave,
}: {
  node: SimNode
  selected: boolean
  onPointerDown: (e: React.PointerEvent) => void
  onDoubleClick?: () => void
  onEnter: () => void
  onLeave: () => void
}) {
  const score = useIdeaScore(node.ideaId ?? '')
  const fill =
    node.kind === 'umbrella' ? '#6366f1' : node.kind === 'sharedBase' ? '#0d9488' : 'var(--color-primary)'

  return (
    <g
      transform={`translate(${node.x},${node.y})`}
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      className={node.kind === 'idea' ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'}
    >
      {selected ? (
        <circle r={node.r + 6} fill="none" stroke="var(--color-primary)" strokeWidth={2} opacity={0.45} />
      ) : null}
      <circle r={node.r} fill={fill} opacity={node.kind === 'idea' ? 0.92 : 0.75} />
      {node.kind === 'idea' ? (
        <text
          y={node.r + 14}
          textAnchor="middle"
          className="fill-midnight text-[10px] font-medium"
          style={{ pointerEvents: 'none' }}
        >
          {node.label.length > 28 ? `${node.label.slice(0, 26)}…` : node.label}
        </text>
      ) : null}
      {node.kind === 'idea' && score ? (
        <text
          y={4}
          textAnchor="middle"
          className="fill-midnight text-[9px] font-bold"
          style={{ pointerEvents: 'none' }}
        >
          {Math.round(score.weightedScore)}
        </text>
      ) : null}
    </g>
  )
}

export function IdeaPortfolioGraph({
  ideas,
  className,
  mode = 'portfolio',
  showEdgeFilters = true,
  focusIdeaId = null,
  onSelectIdeaId,
  graphHeight = 'min(72vh, 640px)',
}: Props) {
  const navigate = useNavigate()
  const synergyLinks = useAppStore((s) => s.data?.synergyLinks ?? EMPTY_SYNERGY_LINKS)
  const umbrellaGroups = useAppStore((s) => s.data?.umbrellaGroups ?? EMPTY_UMBRELLA_GROUPS)
  const sharedBases = useAppStore((s) => s.data?.sharedBases ?? EMPTY_SHARED_BASES)

  const containerRef = React.useRef<HTMLDivElement>(null)
  const [size, setSize] = React.useState({ width: 800, height: 520 })
  const [hoveredId, setHoveredId] = React.useState<string | null>(null)
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [enabledKinds, setEnabledKinds] = React.useState<Set<GraphEdgeKind>>(() =>
    mode === 'synergy'
      ? new Set(['synergy'])
      : new Set(['synergy', 'extension', 'umbrella', 'sharedBase'])
  )
  const dragRef = React.useRef<{ id: string } | null>(null)

  const visibleIds = React.useMemo(() => new Set(ideas.map((i) => i.id)), [ideas])

  const graph = React.useMemo(
    () =>
      mode === 'synergy'
        ? buildSynergyGraph(ideas, synergyLinks, visibleIds)
        : buildPortfolioGraph(ideas, synergyLinks, umbrellaGroups, sharedBases, visibleIds),
    [ideas, synergyLinks, umbrellaGroups, sharedBases, visibleIds, mode]
  )

  const filteredEdges = React.useMemo(() => {
    let edges = graph.edges.filter((e) => enabledKinds.has(e.kind))
    if (focusIdeaId) {
      edges = edges.filter((e) => e.source === focusIdeaId || e.target === focusIdeaId)
    }
    return edges
  }, [graph.edges, enabledKinds, focusIdeaId])

  const simGraph = React.useMemo(
    () => ({ nodes: graph.nodes, edges: filteredEdges }),
    [graph.nodes, filteredEdges]
  )

  const nodesRef = useSimNodes(simGraph, size.width, size.height)

  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ width: Math.max(320, width), height: Math.max(400, height) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const openIdeaId = (node: PortfolioGraphNode) =>
    node.kind === 'idea' ? node.ideaId ?? node.id : node.ideaId

  const handleOpenNode = (node: PortfolioGraphNode) => {
    const ideaId = openIdeaId(node)
    if (ideaId && ideas.some((i) => i.id === ideaId)) {
      navigate(`/app/ideas/${ideaId}`)
    }
  }

  const handlePointerDown = (node: SimNode, e: React.PointerEvent) => {
    e.stopPropagation()
    const n = nodesRef.current.find((x) => x.id === node.id)
    if (!n) return
    n.fixed = true
    dragRef.current = { id: n.id }
    setSelectedId(n.id)
    onSelectIdeaId?.(n.kind === 'idea' ? n.id : null)
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
    if (n) n.fixed = false
    dragRef.current = null
  }

  const hovered = hoveredId ? nodesRef.current.find((n) => n.id === hoveredId) : null
  const selectedNode = selectedId ? graph.nodes.find((n) => n.id === selectedId) : null

  const toggleKind = (kind: GraphEdgeKind) => {
    setEnabledKinds((prev) => {
      const next = new Set(prev)
      if (next.has(kind)) next.delete(kind)
      else next.add(kind)
      return next
    })
  }

  if (graph.nodes.length === 0) return null

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-wrap items-center gap-2">
        {showEdgeFilters
          ? (Object.keys(graphEdgeMeta) as GraphEdgeKind[]).map((kind) => (
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
              style={{ backgroundColor: graphEdgeMeta[kind].stroke }}
            />
            {graphEdgeMeta[kind].label}
          </button>
        ))
          : null}
        {mode === 'synergy' ? (
          <span className="text-micro text-tertiary/55">
            Épaisseur ∝ score · double-clic pour ouvrir une fiche
          </span>
        ) : null}
      </div>

      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-[--radius-card] border border-alternate/60 bg-[radial-gradient(circle_at_center,var(--color-mineral)_0%,var(--color-background)_70%)]"
        style={{ height: graphHeight }}
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
              const meta = graphEdgeMeta[edge.kind]
              const highlighted =
                hoveredId === edge.source ||
                hoveredId === edge.target ||
                selectedId === edge.source ||
                selectedId === edge.target ||
                focusIdeaId === edge.source ||
                focusIdeaId === edge.target
              return (
                <line
                  key={edge.id}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={meta.stroke}
                  strokeWidth={edge.kind === 'synergy' ? 1 + (edge.strength ?? 5) * 0.15 : 1.5}
                  strokeDasharray={meta.dash}
                  opacity={highlighted ? 0.85 : 0.35}
                />
              )
            })}
          </g>
          <g>
            {nodesRef.current.map((node) => (
              <GraphNodeDot
                key={node.id}
                node={node}
                selected={selectedId === node.id || hoveredId === node.id}
                onPointerDown={(e) => handlePointerDown(node, e)}
                onDoubleClick={() => handleOpenNode(node)}
                onEnter={() => setHoveredId(node.id)}
                onLeave={() => setHoveredId((id) => (id === node.id ? null : id))}
              />
            ))}
          </g>
        </svg>

        {(hovered || selectedNode) ? (
          <div className="pointer-events-none absolute bottom-3 left-3 max-w-xs rounded-[--radius-sharp] border border-alternate/60 bg-background/95 px-3 py-2 text-xs shadow-sm backdrop-blur-sm">
            <div className="font-semibold text-midnight">{(hovered ?? selectedNode)?.label}</div>
            <div className="mt-1 text-tertiary/65">
              {(hovered ?? selectedNode)?.kind === 'idea'
                ? 'Double-clic ou bouton pour ouvrir la fiche'
                : (hovered ?? selectedNode)?.kind === 'umbrella'
                  ? 'Umbrella — regroupement'
                  : 'Socle mutualisé'}
            </div>
          </div>
        ) : null}

        {selectedNode && openIdeaId(selectedNode) && ideas.some((i) => i.id === openIdeaId(selectedNode)) ? (
          <div className="absolute right-3 top-3">
            <Link
              to={`/app/ideas/${openIdeaId(selectedNode)}`}
              className="rounded-[--radius-sharp] border border-primary/40 bg-primary/15 px-3 py-1.5 text-xs font-semibold text-midnight hover:bg-primary/25"
            >
              Ouvrir la fiche →
            </Link>
          </div>
        ) : null}
      </div>

      <p className="text-xs text-tertiary/55">
        {mode === 'synergy'
          ? 'Les nœuds isolés n’ont pas encore de lien Synergy — relie-les ou lance une analyse globale Steven.'
          : 'Glisse les nœuds pour réorganiser. Les liens reflètent synergies, extensions, umbrellas et socles — comme un graphe Obsidian de ton écosystème.'}
      </p>
    </div>
  )
}
