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
      return 'Prioritizes autonomy, remote leverage, and low operational drag.'
    case 'cash-flow-first':
      return 'Prioritizes near-term revenue, fast validation, and practical tests.'
    case 'scalable-asset-first':
      return 'Prioritizes compounding assets, ecosystem leverage, and global reach.'
    case 'lifestyle-balance':
      return 'Balances alignment, excitement, and sustainable complexity.'
    default:
      return profile.description ?? 'Custom scoring lens.'
  }
}

export function previewTopIdeasForProfile(ideas: Idea[], profile: ScoringProfile, limit = 3): Idea[] {
  return [...ideas]
    .sort((a, b) => calculateWeightedScore(b, profile) - calculateWeightedScore(a, profile))
    .slice(0, limit)
}
