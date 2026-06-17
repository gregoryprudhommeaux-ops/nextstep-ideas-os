import type { LucideIcon } from 'lucide-react'
import { Brain, LayoutGrid, NotebookPen, User } from 'lucide-react'

export type AppNavItem = {
  to: string
  label: string
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
    description: 'Flux du moment',
    icon: Brain,
    requiresOnboarding: true,
  },
  {
    to: '/app/portfolio',
    label: 'Portfolio',
    description: 'Vue système',
    icon: LayoutGrid,
    requiresOnboarding: true,
  },
  {
    to: '/app/review',
    label: 'Revue',
    description: 'Revue hebdo',
    icon: NotebookPen,
    requiresOnboarding: true,
  },
  {
    to: '/app/founder',
    label: 'Profil',
    description: 'Profil fondateur',
    icon: User,
  },
]
