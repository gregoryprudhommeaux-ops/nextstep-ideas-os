import { Link, NavLink, useLocation } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { appNavItems, mobileBottomNavItems, type AppNavItem } from './appNavItems'
import { isNavItemActive } from './navActive'

function navClassName(isActive: boolean, variant: 'header' | 'tab' | 'pill') {
  if (variant === 'header') {
    return cn(
      'whitespace-nowrap rounded-[--radius-sharp] px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition',
      isActive
        ? 'bg-background/15 text-background'
        : 'text-background/55 hover:bg-background/10 hover:text-background/90'
    )
  }
  if (variant === 'pill') {
    return cn(
      'shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium transition',
      isActive
        ? 'border-primary/40 bg-primary/15 text-midnight'
        : 'border-alternate/60 bg-background text-tertiary/70 hover:border-alternate'
    )
  }
  return cn(
    'flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[--radius-sharp] px-1 py-2 text-[10px] font-medium transition',
    isActive ? 'text-primary' : 'text-tertiary/55'
  )
}

export function DesktopNav() {
  return (
    <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
      {appNavItems.map(({ to, end, label }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => navClassName(isActive, 'header')}>
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

export function MobileNavPills() {
  return (
    <nav
      className="flex gap-2 overflow-x-auto border-b border-alternate/50 bg-background px-4 py-3 lg:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Main"
    >
      {appNavItems.map(({ to, end, label }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => navClassName(isActive, 'pill')}>
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

export function MobileBottomNav() {
  const { pathname } = useLocation()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t border-alternate/60 bg-background/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur-md lg:hidden"
      aria-label="Main"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-between">
        {mobileBottomNavItems.map((item) => (
          <MobileBottomNavItem key={item.to} item={item} pathname={pathname} />
        ))}
      </div>
    </nav>
  )
}

function MobileBottomNavItem({ item, pathname }: { item: AppNavItem; pathname: string }) {
  const { to, end, label, icon: Icon } = item
  const isActive = isNavItemActive(pathname, to, end)

  return (
    <Link to={to} className={navClassName(isActive, 'tab')} aria-current={isActive ? 'page' : undefined}>
      <Icon
        className={cn('h-5 w-5', isActive ? 'text-primary' : 'text-tertiary/45')}
        strokeWidth={isActive ? 2.25 : 1.75}
      />
      <span className="truncate">{label}</span>
    </Link>
  )
}
