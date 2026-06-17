import type { Idea, IdeaScoreBreakdown, ScoringProfile, ScoreDimension } from '../../types/domain'

const positiveDimensions: ScoreDimension[] = [
  'personalAlignment',
  'freedomFit',
  'remoteFit',
  'scalabilityFit',
  'revenuePotential',
  'speedToValidation',
  'ecosystemFit',
  'excitementLevel',
]

const booleanDimensions: ScoreDimension[] = ['sideBusinessFit']

const penaltyDimensions: ScoreDimension[] = ['complexityLevel', 'capitalIntensity']

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n))
}

function as01_0to10(n: number) {
  return clamp01(n / 10)
}

function as01_boolean(b: boolean) {
  return b ? 1 : 0
}

export function calculateScoreBreakdown(idea: Idea, profile: ScoringProfile): IdeaScoreBreakdown {
  const breakdown: Partial<Record<ScoreDimension, number>> = {}

  let rawSum = 0
  let rawCount = 0

  for (const d of positiveDimensions) {
    const v01 = as01_0to10(idea[d] as number)
    const v100 = Math.round(v01 * 100)
    breakdown[d] = v100
    rawSum += v01
    rawCount += 1
  }

  for (const d of booleanDimensions) {
    const v01 = as01_boolean(idea[d] as boolean)
    const v100 = Math.round(v01 * 100)
    breakdown[d] = v100
    rawSum += v01
    rawCount += 1
  }

  const rawScore = rawCount ? Math.round((rawSum / rawCount) * 100) : 0

  let weightedNumerator = 0
  let weightedDenominator = 0

  const weights = profile.weights ?? {}
  const weightOf = (d: ScoreDimension) => Math.max(0, weights[d] ?? 1)

  for (const d of [...positiveDimensions, ...booleanDimensions]) {
    const w = weightOf(d)
    weightedNumerator += (breakdown[d] ?? 0) * w
    weightedDenominator += w
  }

  // Penalties subtract from weighted score.
  for (const d of penaltyDimensions) {
    const w = weightOf(d)
    const penalty01 = as01_0to10(idea[d] as number)
    const penalty100 = Math.round(penalty01 * 100)
    breakdown[d] = penalty100
    weightedNumerator -= penalty100 * w
    weightedDenominator += w
  }

  const weightedScore =
    weightedDenominator > 0
      ? Math.round(Math.max(0, Math.min(100, weightedNumerator / weightedDenominator)))
      : 0

  return {
    ...breakdown,
    rawScore,
    weightedScore,
  }
}

export function calculateRawScore(idea: Idea, profile: ScoringProfile) {
  return calculateScoreBreakdown(idea, profile).rawScore
}

export function calculateWeightedScore(idea: Idea, profile: ScoringProfile) {
  return calculateScoreBreakdown(idea, profile).weightedScore
}

export function sortIdeasByProfile(ideas: Idea[], profile: ScoringProfile) {
  const scoreById = new Map<string, number>()
  for (const i of ideas) scoreById.set(i.id, calculateWeightedScore(i, profile))
  return [...ideas].sort((a, b) => (scoreById.get(b.id) ?? 0) - (scoreById.get(a.id) ?? 0))
}

