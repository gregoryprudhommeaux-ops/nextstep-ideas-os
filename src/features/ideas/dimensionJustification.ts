import type { Idea, ScoreDimension } from '../../types/domain'
import { dimensionMeta } from '../scoring/dimensions'

const IDEA_SCORE_KEYS: ScoreDimension[] = [
  'personalAlignment',
  'freedomFit',
  'remoteFit',
  'scalabilityFit',
  'revenuePotential',
  'speedToValidation',
  'excitementLevel',
  'complexityLevel',
  'ecosystemFit',
  'capitalIntensity',
]

export function getIdeaDimensionScore(idea: Idea | null | undefined, dimension: ScoreDimension): number {
  if (!idea) return 0
  return idea[dimension as keyof Idea] as number
}

export function getStoredDimensionNote(
  idea: Idea | null | undefined,
  dimension: ScoreDimension
): string | null {
  const note = idea?.aiAnalysis?.dimensionNotes?.[dimension]?.trim()
  if (note) return note
  if (dimension === 'personalAlignment') {
    const fit = idea?.aiAnalysis?.founderFitNote?.trim()
    if (fit) return fit
  }
  return null
}

export function getStaticDimensionFallback(
  idea: Idea | null | undefined,
  dimension: ScoreDimension
): string {
  const stored = getStoredDimensionNote(idea, dimension)
  if (stored) return stored

  const score = getIdeaDimensionScore(idea, dimension)
  const meta = dimensionMeta[dimension]
  const tier =
    score >= 8 ? 'élevé' : score >= 6 ? 'solide' : score >= 4 ? 'modéré' : 'faible'

  const hint =
    idea?.scoreSource === 'manual'
      ? 'Score défini manuellement — clique pour demander l’analyse de Steven si une clé API est configurée.'
      : 'Clique pour obtenir l’analyse détaillée de Steven sur ce score.'

  return `Score ${score}/10 (${tier}). ${meta.description} ${hint}`
}

export const STRATEGIC_FIT_DIMENSIONS: ScoreDimension[] = [
  'personalAlignment',
  'freedomFit',
  'remoteFit',
  'scalabilityFit',
  'speedToValidation',
  'revenuePotential',
]

export { IDEA_SCORE_KEYS }
