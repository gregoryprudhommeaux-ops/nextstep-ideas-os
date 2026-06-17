import type { FounderProfile, Idea, UmbrellaGroup } from '../../../types/domain'

export function buildPortfolioContext(ideas: Idea[], umbrellas: UmbrellaGroup[]): string {
  if (ideas.length === 0) return 'Portfolio vide — aucune idée existante.'

  const lines = ideas.map((i) => {
    const parts = [`- id:${i.id}`, `titre:"${i.title}"`, `statut:${i.status}`]
    if (i.oneLiner) parts.push(`pitch:"${i.oneLiner}"`)
    if (i.portfolioRole) parts.push(`rôle:${i.portfolioRole}`)
    if (i.parentIdeaId) parts.push(`parent:${i.parentIdeaId}`)
    return parts.join(' | ')
  })

  const umbrellaLines =
    umbrellas.length > 0
      ? umbrellas.map((u) => `- umbrella:${u.id} "${u.name}" → idées: ${u.ideaIds.join(', ')}`)
      : []

  return `IDÉES EXISTANTES:\n${lines.join('\n')}${umbrellaLines.length ? `\n\nUMBRELLAS:\n${umbrellaLines.join('\n')}` : ''}`
}

export function buildFounderContext(profile: FounderProfile | null): string {
  if (!profile) return 'Profil fondateur non renseigné.'

  return `PROFIL FONDATEUR:
${profile.linkedinUrl ? `LinkedIn: ${profile.linkedinUrl}` : ''}
Qui je suis: ${profile.whoIAmRaw}
Ce que je veux: ${profile.whatIWantRaw}
Comment je fonctionne: ${profile.howIWorkRaw}`
}

export const JSON_ONLY_RULE =
  'Réponds UNIQUEMENT avec un objet JSON valide, sans markdown ni texte autour.'
