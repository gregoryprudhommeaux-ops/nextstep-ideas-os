import type { Idea, SynergyLink, UmbrellaGroup } from '../../types/domain'

export type ExtensionGroup = {
  parentId: string
  parentTitle: string
  extensions: Idea[]
}

export function groupExtensions(ideas: Idea[]): ExtensionGroup[] {
  const byParent = new Map<string, Idea[]>()
  for (const idea of ideas) {
    if (!idea.parentIdeaId) continue
    const list = byParent.get(idea.parentIdeaId) ?? []
    list.push(idea)
    byParent.set(idea.parentIdeaId, list)
  }

  return [...byParent.entries()].map(([parentId, extensions]) => ({
    parentId,
    parentTitle: ideas.find((i) => i.id === parentId)?.title ?? parentId,
    extensions,
  }))
}

export function getStandaloneIdeas(ideas: Idea[]): Idea[] {
  return ideas.filter((i) => !i.parentIdeaId && i.portfolioRole !== 'extension')
}

export function synergyPairExists(
  links: SynergyLink[],
  sourceIdeaId: string,
  targetIdeaId: string
): boolean {
  return links.some(
    (l) =>
      (l.sourceIdeaId === sourceIdeaId && l.targetIdeaId === targetIdeaId) ||
      (l.sourceIdeaId === targetIdeaId && l.targetIdeaId === sourceIdeaId)
  )
}

export function ideaTitleById(ideas: Idea[], id: string): string {
  return ideas.find((i) => i.id === id)?.title ?? id
}

export function umbrellasForIdea(umbrellas: UmbrellaGroup[], ideaId: string): UmbrellaGroup[] {
  return umbrellas.filter((u) => u.ideaIds.includes(ideaId))
}
