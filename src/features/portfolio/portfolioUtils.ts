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

export function ideaExists(ideas: Idea[], id: string | undefined): boolean {
  return Boolean(id && ideas.some((i) => i.id === id))
}

/** Map AI portfolio references onto real idea ids (exact id, title, or partial match). */
export function resolveIdeaReferenceId(
  ref: string | undefined,
  ideas: Idea[]
): string | undefined {
  if (!ref?.trim()) return undefined
  const trimmed = ref.trim()
  const exact = ideas.find((i) => i.id === trimmed)
  if (exact) return exact.id

  const lower = trimmed.toLowerCase()
  const byTitle = ideas.find((i) => i.title.toLowerCase() === lower)
  if (byTitle) return byTitle.id

  const partial = ideas.find(
    (i) => i.id.includes(trimmed) || trimmed.includes(i.id) || i.title.toLowerCase().includes(lower)
  )
  return partial?.id
}

export function resolveUmbrellaReferenceId(
  ref: string | undefined,
  groups: UmbrellaGroup[]
): string | undefined {
  if (!ref?.trim()) return undefined
  const trimmed = ref.trim()
  if (groups.some((g) => g.id === trimmed)) return trimmed
  if (trimmed.startsWith('umbrella:')) {
    const id = trimmed.slice('umbrella:'.length)
    if (groups.some((g) => g.id === id)) return id
  }
  const byName = groups.find((g) => g.name.toLowerCase() === trimmed.toLowerCase())
  return byName?.id
}

export function sanitizeIdeasRelations(ideas: Idea[]): Idea[] {
  const ids = new Set(ideas.map((i) => i.id))
  return ideas.map((idea) =>
    idea.parentIdeaId && !ids.has(idea.parentIdeaId) ? { ...idea, parentIdeaId: undefined } : idea
  )
}

export function umbrellasForIdea(umbrellas: UmbrellaGroup[], ideaId: string): UmbrellaGroup[] {
  return umbrellas.filter((u) => u.ideaIds.includes(ideaId))
}
