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

export function buildExistingSynergiesContext(
  ideas: Idea[],
  links: { sourceIdeaId: string; targetIdeaId: string; totalSynergyScore: number; notes?: string }[]
): string {
  if (links.length === 0) return 'LIENS SYNERGY EXISTANTS: aucun.'

  const title = (id: string) => ideas.find((i) => i.id === id)?.title ?? id
  const lines = links.map(
    (l) =>
      `- ${l.sourceIdeaId} ↔ ${l.targetIdeaId} ("${title(l.sourceIdeaId)}" ↔ "${title(l.targetIdeaId)}") score ${l.totalSynergyScore}${l.notes ? ` — ${l.notes}` : ''}`
  )
  return `LIENS SYNERGY EXISTANTS (ne pas reproposer):\n${lines.join('\n')}`
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

/** Injected into prose-heavy task prompts (Steven system prompt also carries the full doctrine). */
export const ANTI_SLOP_PROSE_RULE = `PROSE ANTI-AI-SLOP (FR · EN · ES) — obligatoire pour tout texte humain :
- Personne identifiable, pas « bien écrit IA » uniforme. Pas d'invention de faits/citations/métriques.
- Interdit : accroches creuses, jargon vide (révolutionner / game-changing / llevar al siguiente nivel), transitions scolaires en série, closes morales.
- Survey-hook hard OU soft : « je vois beaucoup / on me dit souvent » ET soft (*phrase que j'entends souvent / I often hear / frase que escucho*, *en creusant / digging a bit*, triade même X·Y·Z, *moins de X plus de Y*).
- Polished residual (encore du slop après purge) : *même/same/mismo ×3* inline ; arc clean thèse→préférence→communauté→teaser « nouveau format »→CTA ; zéro aspérité terrain. Un seul critère asymétrique + friction OK.
- Syntaxe : — rare (max 1/paragraphe) ; zéro « pas X mais Y » empilés ; pas de triplets rythmiques ; densité irrégulière.
- Verbes nets, mots courants, hedges naturels, closes ouvertes. ES : ne pas mélanger Mexique et Espagne.
- Doctrine = /anti-linkedin-slop 2026-07-15 (k) (même barre que Charles / Lucy).`
