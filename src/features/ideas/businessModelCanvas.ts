import type { BmcBlockHealth, BmcBlockKey } from '../../types/ai'

export type BmcBlockMeta = {
  label: string
  shortLabel: string
  help: string
  gridArea: string
}

export const BMC_BLOCK_KEYS: BmcBlockKey[] = [
  'keyPartners',
  'keyActivities',
  'keyResources',
  'valuePropositions',
  'customerRelationships',
  'channels',
  'customerSegments',
  'costStructure',
  'revenueStreams',
]

export const bmcBlockMeta: Record<BmcBlockKey, BmcBlockMeta> = {
  keyPartners: {
    label: 'Partenaires clés',
    shortLabel: 'Partenaires',
    help: 'Qui t’aide à créer et délivrer de la valeur ? Fournisseurs, alliances, écosystème.',
    gridArea: 'partners',
  },
  keyActivities: {
    label: 'Activités clés',
    shortLabel: 'Activités',
    help: 'Les actions indispensables pour faire tourner le modèle.',
    gridArea: 'activities',
  },
  keyResources: {
    label: 'Ressources clés',
    shortLabel: 'Ressources',
    help: 'Actifs, compétences, réseau, IP, équipe — ce sans quoi ça ne marche pas.',
    gridArea: 'resources',
  },
  valuePropositions: {
    label: 'Proposition de valeur',
    shortLabel: 'Valeur',
    help: 'Le problème résolu et la promesse unique pour le client.',
    gridArea: 'value',
  },
  customerRelationships: {
    label: 'Relations clients',
    shortLabel: 'Relations',
    help: 'Comment tu acquiers, engages et retiens les clients.',
    gridArea: 'relationships',
  },
  channels: {
    label: 'Canaux',
    shortLabel: 'Canaux',
    help: 'Comment tu touches le client : vente, marketing, distribution.',
    gridArea: 'channels',
  },
  customerSegments: {
    label: 'Segments clients',
    shortLabel: 'Segments',
    help: 'Pour qui tu crées de la valeur — cible prioritaire et secondaires.',
    gridArea: 'segments',
  },
  costStructure: {
    label: 'Structure des coûts',
    shortLabel: 'Coûts',
    help: 'Les postes de dépense majeurs et ce qui drive le coût marginal.',
    gridArea: 'cost',
  },
  revenueStreams: {
    label: 'Sources de revenus',
    shortLabel: 'Revenus',
    help: 'Comment l’argent entre : pricing, récurrence, sponsoring, etc.',
    gridArea: 'revenue',
  },
}

export const bmcHealthMeta: Record<
  BmcBlockHealth,
  { label: string; dotClass: string; cellClass: string }
> = {
  strong: {
    label: 'Solide',
    dotClass: 'bg-primary',
    cellClass: 'border-primary/35 bg-primary/[0.06]',
  },
  moderate: {
    label: 'À préciser',
    dotClass: 'bg-tertiary/40',
    cellClass: 'border-alternate/60 bg-background',
  },
  weak: {
    label: 'Faiblesse',
    dotClass: 'bg-amber-500',
    cellClass: 'border-amber-400/55 bg-amber-50/80',
  },
  missing: {
    label: 'Manquant',
    dotClass: 'bg-red-500',
    cellClass: 'border-red-300/70 border-dashed bg-red-50/60',
  },
}

export function isBmcGapHealth(health: BmcBlockHealth): boolean {
  return health === 'weak' || health === 'missing'
}

export const BMC_GRID_STYLE = {
  display: 'grid',
  gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
  gridTemplateRows: 'minmax(7rem, auto) minmax(7rem, auto) minmax(5rem, auto)',
  gridTemplateAreas: `
    "partners activities value relationships segments"
    "partners resources value channels segments"
    "cost cost revenue revenue revenue"
  `,
} as const
