import type { ScoreDimension } from '../../types/domain'

/** Stable order for bars + radar (matches scoring engine). */
export const SCORE_BREAKDOWN_ORDER: ScoreDimension[] = [
  'personalAlignment',
  'freedomFit',
  'remoteFit',
  'scalabilityFit',
  'revenuePotential',
  'speedToValidation',
  'ecosystemFit',
  'excitementLevel',
  'sideBusinessFit',
  'complexityLevel',
  'capitalIntensity',
]
