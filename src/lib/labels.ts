import type { IdeaCategory, IdeaStatus, HorizonType } from '../types/domain'

export const categoryLabels: Record<IdeaCategory, string> = {
  service: 'Service',
  productizedService: 'Service productisé',
  saasAi: 'SaaS / AI',
  communityPlatform: 'Communauté / plateforme',
  hospitality: 'Hospitality',
  mediaBrand: 'Media brand',
  consulting: 'Consulting',
  marketplace: 'Marketplace',
  digitalAsset: 'Actif digital',
  localPhysical: 'Local / physique',
}

export const statusLabels: Record<IdeaStatus, string> = {
  inbox: 'Inbox',
  explore: 'Explore',
  validate: 'Validate',
  build: 'Build',
  archive: 'Archive',
}

export const horizonLabels: Record<HorizonType, string> = {
  '0_30d': '0–30 jours',
  '30_90d': '30–90 jours',
  '3_12m': '3–12 mois',
  '1_3y': '1–3 ans',
}
