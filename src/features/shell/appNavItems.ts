import type { LucideIcon } from 'lucide-react'
import { Brain, LayoutGrid, NotebookPen, User } from 'lucide-react'

export type AppNavItem = {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

/** Core nav — 4 zones aligned with the product story. */
const coreNavItems: AppNavItem[] = [
  { to: '/app/brainstorm', end: true, label: 'Brainstorm', icon: Brain },
  { to: '/app/portfolio', label: 'Portfolio', icon: LayoutGrid },
  { to: '/app/review', label: 'Revue', icon: NotebookPen },
  { to: '/app/founder', label: 'Profil', icon: User },
]

export function getAppNavItems(onboardingComplete: boolean): AppNavItem[] {
  if (onboardingComplete) return coreNavItems
  return coreNavItems.filter((item) => item.to === '/app/founder')
}

export const mobileBottomNavItems = coreNavItems
