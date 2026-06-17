import type { ScoreDimension } from '../../types/domain'

export type DimensionMeta = {
  label: string
  shortLabel: string
  kind: 'positive' | 'penalty' | 'boolean'
  description: string
}

export const dimensionMeta: Record<ScoreDimension, DimensionMeta> = {
  personalAlignment: {
    label: 'Personal alignment',
    shortLabel: 'Align',
    kind: 'positive',
    description: 'How well the idea fits your values and trajectory.',
  },
  freedomFit: {
    label: 'Freedom',
    shortLabel: 'Freedom',
    kind: 'positive',
    description: 'Autonomy and time ownership potential.',
  },
  remoteFit: {
    label: 'Remote fit',
    shortLabel: 'Remote',
    kind: 'positive',
    description: 'Compatibility with remote-first execution.',
  },
  scalabilityFit: {
    label: 'Scalability',
    shortLabel: 'Scale',
    kind: 'positive',
    description: 'Ability to grow without linear time input.',
  },
  sideBusinessFit: {
    label: 'Side business',
    shortLabel: 'Side',
    kind: 'boolean',
    description: 'Can start while protecting bandwidth.',
  },
  revenuePotential: {
    label: 'Revenue potential',
    shortLabel: 'Revenue',
    kind: 'positive',
    description: 'Upside for meaningful income or asset value.',
  },
  speedToValidation: {
    label: 'Validation speed',
    shortLabel: 'Speed',
    kind: 'positive',
    description: 'How quickly you can test core assumptions.',
  },
  ecosystemFit: {
    label: 'Ecosystem fit',
    shortLabel: 'Ecosystem',
    kind: 'positive',
    description: 'Compounds with existing skills and assets.',
  },
  excitementLevel: {
    label: 'Excitement',
    shortLabel: 'Excite',
    kind: 'positive',
    description: 'Emotional pull and sustained motivation.',
  },
  complexityLevel: {
    label: 'Complexity',
    shortLabel: 'Complex',
    kind: 'penalty',
    description: 'Operational and cognitive load (penalty).',
  },
  capitalIntensity: {
    label: 'Capital intensity',
    shortLabel: 'Capex',
    kind: 'penalty',
    description: 'Upfront capital required (penalty).',
  },
}

export const positiveDimensions = Object.entries(dimensionMeta)
  .filter(([, m]) => m.kind === 'positive' || m.kind === 'boolean')
  .map(([k]) => k as ScoreDimension)

export const penaltyDimensions = Object.entries(dimensionMeta)
  .filter(([, m]) => m.kind === 'penalty')
  .map(([k]) => k as ScoreDimension)
