import type { ScoreDimension } from '../../types/domain'

export type DimensionMeta = {
  label: string
  shortLabel: string
  kind: 'positive' | 'penalty' | 'boolean'
  description: string
}

export const dimensionMeta: Record<ScoreDimension, DimensionMeta> = {
  personalAlignment: {
    label: 'Alignement personnel',
    shortLabel: 'Align',
    kind: 'positive',
    description: 'Adéquation avec tes valeurs et ta trajectoire.',
  },
  freedomFit: {
    label: 'Freedom',
    shortLabel: 'Freedom',
    kind: 'positive',
    description: 'Potentiel d’autonomie et de maîtrise du temps.',
  },
  remoteFit: {
    label: 'Remote fit',
    shortLabel: 'Remote',
    kind: 'positive',
    description: 'Compatibilité avec une exécution remote-first.',
  },
  scalabilityFit: {
    label: 'Scalability',
    shortLabel: 'Scale',
    kind: 'positive',
    description: 'Capacité à grandir sans effort linéaire.',
  },
  sideBusinessFit: {
    label: 'Side business',
    shortLabel: 'Side',
    kind: 'boolean',
    description: 'Peut démarrer sans saturer ta bande passante.',
  },
  revenuePotential: {
    label: 'Revenue potential',
    shortLabel: 'Revenue',
    kind: 'positive',
    description: 'Potentiel de revenus ou de valeur d’actif.',
  },
  speedToValidation: {
    label: 'Validation speed',
    shortLabel: 'Speed',
    kind: 'positive',
    description: 'Rapidité pour tester les hypothèses clés.',
  },
  ecosystemFit: {
    label: 'Ecosystem fit',
    shortLabel: 'Ecosystem',
    kind: 'positive',
    description: 'Effet de levier avec tes compétences et actifs existants.',
  },
  excitementLevel: {
    label: 'Excitement',
    shortLabel: 'Excite',
    kind: 'positive',
    description: 'Motivation et énergie sur la durée.',
  },
  complexityLevel: {
    label: 'Complexity',
    shortLabel: 'Complex',
    kind: 'penalty',
    description: 'Charge opérationnelle et cognitive (pénalité).',
  },
  capitalIntensity: {
    label: 'Capital intensity',
    shortLabel: 'Capex',
    kind: 'penalty',
    description: 'Capital initial requis (pénalité).',
  },
}

export const positiveDimensions = Object.entries(dimensionMeta)
  .filter(([, m]) => m.kind === 'positive' || m.kind === 'boolean')
  .map(([k]) => k as ScoreDimension)

export const penaltyDimensions = Object.entries(dimensionMeta)
  .filter(([, m]) => m.kind === 'penalty')
  .map(([k]) => k as ScoreDimension)
