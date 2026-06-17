import type { Idea, SynergyLink, SynergyStrength } from '../../types/domain'

export const strengthOrder: Record<SynergyStrength, number> = {
  strong: 4,
  medium: 3,
  weak: 2,
  conflict: 1,
}

export const strengthLabels: Record<SynergyStrength, string> = {
  strong: 'Strong',
  medium: 'Medium',
  weak: 'Weak',
  conflict: 'Conflict',
}

export function getLinksForIdea(links: SynergyLink[], ideaId: string): SynergyLink[] {
  return links.filter((l) => l.sourceIdeaId === ideaId || l.targetIdeaId === ideaId)
}

export function getPartnerId(link: SynergyLink, ideaId: string): string {
  return link.sourceIdeaId === ideaId ? link.targetIdeaId : link.sourceIdeaId
}

export function countConnections(links: SynergyLink[], ideaId: string): number {
  return getLinksForIdea(links, ideaId).length
}

export function getMostConnectedIdeas(ideas: Idea[], links: SynergyLink[], limit = 5) {
  return [...ideas]
    .map((idea) => ({ idea, count: countConnections(links, idea.id) }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

export function filterLinksByStrength(links: SynergyLink[], strength: SynergyStrength | 'all') {
  if (strength === 'all') return links
  return links.filter((l) => l.synergyStrength === strength)
}

export function sortLinksByScore(links: SynergyLink[]) {
  return [...links].sort((a, b) => b.totalSynergyScore - a.totalSynergyScore)
}
