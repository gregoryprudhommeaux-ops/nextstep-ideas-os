import type { LucideIcon } from 'lucide-react'
import {
  Brain,
  Filter,
  GitBranch,
  LayoutGrid,
  Lightbulb,
  NotebookPen,
  Settings,
  User,
} from 'lucide-react'

export type AppNavItem = {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

export const appNavItems: AppNavItem[] = [
  { to: '/app/brainstorm', end: true, label: 'Brainstorm', icon: Brain },
  { to: '/app/portfolio', label: 'Portfolio', icon: LayoutGrid },
  { to: '/app/ideas', label: 'Ideas', icon: Lightbulb },
  { to: '/app/synergy', label: 'Synergy', icon: GitBranch },
  { to: '/app/review', label: 'Review', icon: NotebookPen },
  { to: '/app/founder', label: 'Profil', icon: User },
  { to: '/app/settings', label: 'Settings', icon: Settings },
  { to: '/app/filters', label: 'Profiles', icon: Filter },
]

export const mobileBottomNavItems = appNavItems.filter(
  (i) => !['/app/synergy', '/app/filters', '/app/settings'].includes(i.to)
)
