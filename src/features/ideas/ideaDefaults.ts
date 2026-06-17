import type { Idea, IdeaCategory, IdeaStatus, HorizonType, IdeaInspiration } from '../../types/domain'
import { newId } from '../../lib/id'
import { nowTimestamp } from '../../lib/time'

export type IdeaCaptureInput = {
  title: string
  description?: string
  category: IdeaCategory
  status: IdeaStatus
  horizon: HorizonType
  inspirations?: IdeaInspiration[]
}

export function createNewIdea(input: IdeaCaptureInput): Idea {
  const now = nowTimestamp()
  return {
    id: newId('idea'),
    title: input.title.trim(),
    description: input.description?.trim() ?? '',
    category: input.category,
    status: input.status,
    horizon: input.horizon,
    businessModelType: 'services',
    geography: 'global',
    effortLevel: 5,
    capitalIntensity: 5,
    sideBusinessFit: true,
    remoteFit: 5,
    freedomFit: 5,
    scalabilityFit: 5,
    personalAlignment: 5,
    excitementLevel: 5,
    revenuePotential: 5,
    complexityLevel: 5,
    speedToValidation: 5,
    ecosystemFit: 5,
    umbrellaFit: 5,
    tagIds: [],
    umbrellaGroupId: null,
    inspirations: input.inspirations ?? [],
    createdAt: now,
    updatedAt: now,
  }
}
