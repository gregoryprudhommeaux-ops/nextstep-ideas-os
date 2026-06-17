import { Timestamp } from 'firebase/firestore'
import type { AppData } from '../app/store'
import type { ScoringProfile } from '../types/domain'
import { createDefaultStevenConfig } from '../features/steven/stevenBrain'

const now = Timestamp.now()

const baseWeights: ScoringProfile['weights'] = {
  personalAlignment: 1,
  freedomFit: 1,
  remoteFit: 1,
  scalabilityFit: 1,
  sideBusinessFit: 1,
  revenuePotential: 1,
  speedToValidation: 1,
  ecosystemFit: 1,
  excitementLevel: 1,
  complexityLevel: 1,
  capitalIntensity: 1,
}

const profiles: ScoringProfile[] = [
  {
    id: 'p-freedom-first',
    name: 'Freedom First',
    slug: 'freedom-first',
    description: 'Autonomy, low complexity, lifestyle leverage.',
    weights: { ...baseWeights, freedomFit: 1.35, personalAlignment: 1.2, remoteFit: 1.15, complexityLevel: 1.25 },
    createdAt: now,
  },
  {
    id: 'p-cash-flow-first',
    name: 'Cash Flow First',
    slug: 'cash-flow-first',
    description: 'Near-term revenue and fast validation.',
    weights: { ...baseWeights, revenuePotential: 1.4, speedToValidation: 1.25, sideBusinessFit: 1.15 },
    createdAt: now,
  },
  {
    id: 'p-scalable-asset-first',
    name: 'Scalable Asset First',
    slug: 'scalable-asset-first',
    description: 'Compounding assets and global reach.',
    weights: { ...baseWeights, scalabilityFit: 1.5, ecosystemFit: 1.25 },
    createdAt: now,
  },
]

/** Empty portfolio — scoring lenses only, no demo ideas. */
export function createEmptyAppData(): AppData {
  return {
    version: 2,
    ideas: [],
    filters: [],
    profiles,
    tags: [],
    decisionNotes: [],
    synergyLinks: [],
    umbrellaGroups: [],
    weeklyReviews: [],
    founderProfile: null,
    brainstormSessions: [],
    sharedBases: [],
    steven: createDefaultStevenConfig(),
  }
}
