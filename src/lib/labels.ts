import type { IdeaCategory, IdeaStatus, HorizonType } from '../types/domain'

export const categoryLabels: Record<IdeaCategory, string> = {
  service: 'Service',
  productizedService: 'Productized service',
  saasAi: 'SaaS / AI',
  communityPlatform: 'Community',
  hospitality: 'Hospitality',
  mediaBrand: 'Media brand',
  consulting: 'Consulting',
  marketplace: 'Marketplace',
  digitalAsset: 'Digital asset',
  localPhysical: 'Local physical',
}

export const statusLabels: Record<IdeaStatus, string> = {
  inbox: 'Inbox',
  explore: 'Explore',
  validate: 'Validate',
  build: 'Build',
  archive: 'Archive',
}

export const horizonLabels: Record<HorizonType, string> = {
  '0_30d': '0–30 days',
  '30_90d': '30–90 days',
  '3_12m': '3–12 months',
  '1_3y': '1–3 years',
}
