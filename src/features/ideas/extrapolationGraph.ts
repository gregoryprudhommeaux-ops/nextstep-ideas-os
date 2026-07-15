import type { ExtrapolationTriage, Idea, IdeaExtrapolation } from '../../types/domain'

export type ExtrapolationNodeKind = 'source' | 'complement' | 'portfolio_link' | 'portfolio_idea'

export type ExtrapolationEdgeKind = 'extension' | 'portfolio_bridge' | 'converted'

export type ExtrapolationGraphNode = {
  id: string
  kind: ExtrapolationNodeKind
  label: string
  ideaId?: string
  proposalId?: string
  triage?: ExtrapolationTriage
  status?: 'open' | 'converted' | 'dismissed'
}

export type ExtrapolationGraphEdge = {
  id: string
  source: string
  target: string
  kind: ExtrapolationEdgeKind
}

export type ExtrapolationGraph = {
  nodes: ExtrapolationGraphNode[]
  edges: ExtrapolationGraphEdge[]
}

export const extrapolationEdgeMeta: Record<
  ExtrapolationEdgeKind,
  { label: string; stroke: string; dash?: string }
> = {
  extension: { label: 'Extension du noyau', stroke: 'var(--color-primary)' },
  portfolio_bridge: { label: 'Lien portfolio', stroke: '#6366f1', dash: '5 3' },
  converted: { label: 'Idée créée', stroke: '#0d9488', dash: '2 2' },
}

export function extrapolationNodeRadius(kind: ExtrapolationNodeKind, connectionCount: number): number {
  if (kind === 'source') return 22
  if (kind === 'portfolio_idea') return 12 + Math.min(connectionCount, 3)
  return 14 + Math.min(connectionCount, 4)
}

export function buildExtrapolationGraph(
  idea: Idea,
  extrapolation: IdeaExtrapolation,
  ideas: Idea[]
): ExtrapolationGraph {
  const nodes: ExtrapolationGraphNode[] = []
  const edges: ExtrapolationGraphEdge[] = []
  const nodeIds = new Set<string>()
  const ideaById = new Map(ideas.map((i) => [i.id, i]))

  const addNode = (node: ExtrapolationGraphNode) => {
    if (nodeIds.has(node.id)) return
    nodeIds.add(node.id)
    nodes.push(node)
  }

  const addEdge = (edge: ExtrapolationGraphEdge) => {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) return
    if (edge.source === edge.target) return
    edges.push(edge)
  }

  addNode({
    id: idea.id,
    kind: 'source',
    label: idea.title,
    ideaId: idea.id,
  })

  const visible = (status: 'open' | 'converted' | 'dismissed') => status !== 'dismissed'

  for (const p of extrapolation.complementProposals) {
    if (!visible(p.status)) continue
    const nodeId = `comp:${p.id}`
    addNode({
      id: nodeId,
      kind: 'complement',
      label: p.title,
      proposalId: p.id,
      triage: p.triage,
      status: p.status,
    })
    addEdge({
      id: `ext-${p.id}`,
      source: idea.id,
      target: nodeId,
      kind: 'extension',
    })
    if (p.resultIdeaId && ideaById.has(p.resultIdeaId)) {
      addNode({
        id: p.resultIdeaId,
        kind: 'portfolio_idea',
        label: ideaById.get(p.resultIdeaId)!.title,
        ideaId: p.resultIdeaId,
      })
      addEdge({
        id: `conv-comp-${p.id}`,
        source: nodeId,
        target: p.resultIdeaId,
        kind: 'converted',
      })
    }
  }

  for (const p of extrapolation.portfolioLinkProposals) {
    if (!visible(p.status)) continue
    const nodeId = `plink:${p.id}`
    addNode({
      id: nodeId,
      kind: 'portfolio_link',
      label: p.title,
      proposalId: p.id,
      triage: p.triage,
      status: p.status,
    })
    addEdge({
      id: `pl-${p.id}`,
      source: idea.id,
      target: nodeId,
      kind: 'extension',
    })

    for (const relatedId of p.relatedIdeaIds ?? []) {
      const related = ideaById.get(relatedId)
      if (!related) continue
      addNode({
        id: relatedId,
        kind: 'portfolio_idea',
        label: related.title,
        ideaId: relatedId,
      })
      addEdge({
        id: `bridge-${p.id}-${relatedId}`,
        source: nodeId,
        target: relatedId,
        kind: 'portfolio_bridge',
      })
    }

    if (p.resultIdeaId && ideaById.has(p.resultIdeaId)) {
      addNode({
        id: p.resultIdeaId,
        kind: 'portfolio_idea',
        label: ideaById.get(p.resultIdeaId)!.title,
        ideaId: p.resultIdeaId,
      })
      addEdge({
        id: `conv-plink-${p.id}`,
        source: nodeId,
        target: p.resultIdeaId,
        kind: 'converted',
      })
    }
  }

  return { nodes, edges }
}
