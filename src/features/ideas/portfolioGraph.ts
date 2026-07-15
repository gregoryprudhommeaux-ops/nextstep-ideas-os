import type { Idea, SharedBase, SynergyLink, UmbrellaGroup } from '../../types/domain'

export type GraphNodeKind = 'idea' | 'umbrella' | 'sharedBase'

export type GraphEdgeKind = 'synergy' | 'extension' | 'umbrella' | 'sharedBase'

export type PortfolioGraphNode = {
  id: string
  kind: GraphNodeKind
  label: string
  ideaId?: string
  score?: number
  category?: Idea['category']
}

export type PortfolioGraphEdge = {
  id: string
  source: string
  target: string
  kind: GraphEdgeKind
  strength?: number
  label?: string
}

export type PortfolioGraph = {
  nodes: PortfolioGraphNode[]
  edges: PortfolioGraphEdge[]
}

export const graphEdgeMeta: Record<
  GraphEdgeKind,
  { label: string; stroke: string; dash?: string }
> = {
  synergy: { label: 'Synergie', stroke: 'var(--color-primary)' },
  extension: { label: 'Extension', stroke: 'var(--color-tertiary)', dash: '4 3' },
  umbrella: { label: 'Umbrella', stroke: '#6366f1' },
  sharedBase: { label: 'Socle mutualisé', stroke: '#0d9488' },
}

export function buildPortfolioGraph(
  ideas: Idea[],
  synergyLinks: SynergyLink[],
  umbrellaGroups: UmbrellaGroup[],
  sharedBases: SharedBase[],
  visibleIds: Set<string>
): PortfolioGraph {
  const nodes: PortfolioGraphNode[] = []
  const edges: PortfolioGraphEdge[] = []
  const nodeIds = new Set<string>()

  const addNode = (node: PortfolioGraphNode) => {
    if (nodeIds.has(node.id)) return
    nodeIds.add(node.id)
    nodes.push(node)
  }

  const addEdge = (edge: PortfolioGraphEdge) => {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) return
    if (edge.source === edge.target) return
    edges.push(edge)
  }

  for (const idea of ideas) {
    if (!visibleIds.has(idea.id)) continue
    addNode({
      id: idea.id,
      kind: 'idea',
      label: idea.title,
      ideaId: idea.id,
      category: idea.category,
    })
  }

  for (const link of synergyLinks) {
    if (!visibleIds.has(link.sourceIdeaId) || !visibleIds.has(link.targetIdeaId)) continue
    addEdge({
      id: `syn-${link.id}`,
      source: link.sourceIdeaId,
      target: link.targetIdeaId,
      kind: 'synergy',
      strength: link.totalSynergyScore,
      label: link.notes,
    })
  }

  for (const idea of ideas) {
    if (!visibleIds.has(idea.id)) continue
    if (idea.parentIdeaId && visibleIds.has(idea.parentIdeaId)) {
      addEdge({
        id: `ext-${idea.id}`,
        source: idea.id,
        target: idea.parentIdeaId,
        kind: 'extension',
      })
    }
  }

  for (const group of umbrellaGroups) {
    const memberIds = group.ideaIds.filter((id) => visibleIds.has(id))
    if (memberIds.length < 2) continue
    const hubId = `umbrella:${group.id}`
    addNode({ id: hubId, kind: 'umbrella', label: group.name })
    for (const ideaId of memberIds) {
      addEdge({
        id: `umb-${group.id}-${ideaId}`,
        source: ideaId,
        target: hubId,
        kind: 'umbrella',
      })
    }
  }

  for (const base of sharedBases) {
    const memberIds = base.ideaIds.filter((id) => visibleIds.has(id))
    if (memberIds.length < 2) continue
    const hubId = `base:${base.id}`
    addNode({ id: hubId, kind: 'sharedBase', label: base.name })
    for (const ideaId of memberIds) {
      addEdge({
        id: `base-${base.id}-${ideaId}`,
        source: ideaId,
        target: hubId,
        kind: 'sharedBase',
      })
    }
  }

  return { nodes, edges }
}

/** Ideas + synergy edges only — for the Synergy map page. */
export function buildSynergyGraph(
  ideas: Idea[],
  synergyLinks: SynergyLink[],
  visibleIds: Set<string>
): PortfolioGraph {
  const nodes: PortfolioGraphNode[] = []
  const edges: PortfolioGraphEdge[] = []
  const nodeIds = new Set<string>()

  for (const idea of ideas) {
    if (!visibleIds.has(idea.id)) continue
    nodeIds.add(idea.id)
    nodes.push({
      id: idea.id,
      kind: 'idea',
      label: idea.title,
      ideaId: idea.id,
      category: idea.category,
    })
  }

  for (const link of synergyLinks) {
    if (!visibleIds.has(link.sourceIdeaId) || !visibleIds.has(link.targetIdeaId)) continue
    if (!nodeIds.has(link.sourceIdeaId) || !nodeIds.has(link.targetIdeaId)) continue
    edges.push({
      id: `syn-${link.id}`,
      source: link.sourceIdeaId,
      target: link.targetIdeaId,
      kind: 'synergy',
      strength: link.totalSynergyScore,
      label: link.notes,
    })
  }

  return { nodes, edges }
}

export function graphNodeRadius(kind: GraphNodeKind, connectionCount: number): number {
  if (kind === 'umbrella' || kind === 'sharedBase') return 10 + Math.min(connectionCount, 4)
  return 14 + Math.min(connectionCount, 6) * 1.5
}
