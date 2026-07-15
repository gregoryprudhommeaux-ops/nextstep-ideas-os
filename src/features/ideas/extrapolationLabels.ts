import type { ExtrapolationAmbition, ExtrapolationMode, ExtrapolationTriage } from '../../types/domain'

export const extrapolationModeOptions: {
  value: ExtrapolationMode
  label: string
  description: string
}[] = [
  {
    value: 'expand',
    label: 'Expand',
    description: 'Enrichir autour du noyau — extensions + liens portfolio',
  },
  {
    value: 'challenge',
    label: 'Challenge',
    description: 'Tester la robustesse — faiblesses et hypothèses à valider',
  },
  {
    value: 'focus',
    label: 'Focus',
    description: 'Recentrer — trier, couper et prioriser',
  },
]

export const extrapolationModeLabels: Record<ExtrapolationMode, string> = {
  expand: 'Expand — enrichir',
  challenge: 'Challenge — tester',
  focus: 'Focus — recentrer',
}

export const extrapolationAmbitionOptions: {
  value: ExtrapolationAmbition
  label: string
}[] = [
  { value: 'quick_test', label: 'Test rapide' },
  { value: 'side_business', label: 'Side business' },
  { value: 'main_business', label: 'Business principal' },
  { value: 'platform', label: 'Plateforme / écosystème' },
]

export const extrapolationTriageLabels: Record<ExtrapolationTriage, string> = {
  explore_now: 'À approfondir',
  later: 'Plus tard',
  off_focus: 'Hors focus',
}

export const extrapolationTriageStyles: Record<ExtrapolationTriage, string> = {
  explore_now: 'bg-primary/20 text-midnight',
  later: 'bg-alternate/70 text-tertiary/80',
  off_focus: 'bg-mineral text-tertiary/60 line-through',
}
