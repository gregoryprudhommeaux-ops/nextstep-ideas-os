import type { SynergySuggestResult } from '../../types/ai'

export const synergyTypeLabels: Record<
  NonNullable<SynergySuggestResult['suggestedSynergies'][number]['synergyType']>,
  string
> = {
  audience: 'Audience partagée',
  infra: 'Infra mutualisée',
  brand: 'Marque / univers',
  backOffice: 'Back-office',
  channels: 'Canaux',
  capabilities: 'Compétences',
  monetization: 'Monétisation',
  crossSell: 'Cross-sell',
}
