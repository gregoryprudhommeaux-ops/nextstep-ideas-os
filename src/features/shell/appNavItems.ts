import type { LucideIcon } from 'lucide-react'
import { Brain, LayoutGrid, Settings, User } from 'lucide-react'

export type AppNavItem = {
  to: string
  label: string
  /** Compact label for mobile bottom navigation */
  shortLabel?: string
  description: string
  icon: LucideIcon
  end?: boolean
  /** Locked until founder onboarding is complete */
  requiresOnboarding?: boolean
}

export const appNavItems: AppNavItem[] = [
  {
    to: '/app/brainstorm',
    end: true,
    label: 'Brainstorm',
    shortLabel: 'Brain',
    description: 'Flux du moment',
    icon: Brain,
    requiresOnboarding: true,
  },
  {
    to: '/app/portfolio',
    label: 'Portfolio',
    shortLabel: 'Portf.',
    description: 'Vue système',
    icon: LayoutGrid,
    requiresOnboarding: true,
  },
  {
    to: '/app/founder',
    label: 'Profil',
    shortLabel: 'Profil',
    description: 'Profil fondateur',
    icon: User,
  },
]

export const settingsNavItem: AppNavItem = {
  to: '/app/settings',
  end: true,
  label: 'Settings',
  shortLabel: 'Régl.',
  description: 'Steven & clés API',
  icon: Settings,
}
