import type { Idea, ScoringProfile } from '../../types/domain'
import { calculateWeightedScore } from './scoring'

export function getProfileFavoredDimensions(profile: ScoringProfile): string[] {
  const weights = profile.weights ?? {}
  const entries = Object.entries(weights)
    .filter(([k]) => k !== 'complexityLevel' && k !== 'capitalIntensity')
    .sort(([, a], [, b]) => (b ?? 1) - (a ?? 1))
    .slice(0, 3)
  return entries.map(([k]) => k)
}

export function getProfileExplanation(profile: ScoringProfile): string {
  switch (profile.slug) {
    case 'freedom-first':
      return 'Priorise l\'autonomie, le levier remote et une faible charge opérationnelle.'
    case 'cash-flow-first':
      return 'Priorise le Revenue potential à court terme, la Validation speed et les tests concrets.'
    case 'scalable-asset-first':
      return 'Priorise les actifs composants, le levier d\'écosystème et la portée globale.'
    case 'lifestyle-balance':
      return 'Équilibre l\'alignement personnel, l\'Excitement et une Complexity soutenable.'
    default:
      return profile.description ?? 'Scoring lens personnalisé.'
  }
}

export function previewTopIdeasForProfile(ideas: Idea[], profile: ScoringProfile, limit = 3): Idea[] {
  return [...ideas]
    .sort((a, b) => calculateWeightedScore(b, profile) - calculateWeightedScore(a, profile))
    .slice(0, limit)
}
