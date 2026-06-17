import { Link, useLocation } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { cn } from '../../lib/cn'
import { appNavItems, type AppNavItem } from './appNavItems'
import { isNavItemActive } from './navActive'

type SidebarItemProps = {
  item: AppNavItem
  isActive: boolean
  locked: boolean
  variant: 'sidebar' | 'bottom'
}

function SidebarItem({ item, isActive, locked, variant }: SidebarItemProps) {
  const { to, label, description, icon: Icon } = item

  const sidebarClass = cn(
    'flex w-full items-center gap-3 rounded-[--radius-sharp] px-3 py-2.5 text-left transition',
    isActive && !locked
      ? 'bg-background/12 text-background'
      : locked
        ? 'cursor-not-allowed text-background/35'
        : 'text-background/65 hover:bg-background/8 hover:text-background'
  )

  const bottomClass = cn(
    'flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[--radius-sharp] px-1 py-2 text-[10px] font-medium transition',
    isActive && !locked ? 'text-primary' : locked ? 'text-tertiary/35' : 'text-tertiary/55'
  )

  const content =
    variant === 'sidebar' ? (
      <>
        <Icon className={cn('h-4 w-4 shrink-0', locked && 'opacity-50')} strokeWidth={isActive ? 2.25 : 1.75} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-sm font-semibold">
            <span className="truncate">{label}</span>
            {locked ? <Lock className="h-3 w-3 shrink-0 opacity-60" aria-hidden /> : null}
          </div>
          <div className="truncate text-[11px] text-background/45">{description}</div>
        </div>
      </>
    ) : (
      <>
        <Icon
          className={cn('h-5 w-5', isActive && !locked ? 'text-primary' : 'text-tertiary/45')}
          strokeWidth={isActive ? 2.25 : 1.75}
        />
        <span className="truncate">{label}</span>
      </>
    )

  if (locked) {
    return (
      <span
        className={variant === 'sidebar' ? sidebarClass : bottomClass}
        title="Termine ton profil fondateur pour débloquer"
        aria-disabled
      >
        {content}
      </span>
    )
  }

  return (
    <Link
      to={to}
      className={variant === 'sidebar' ? sidebarClass : bottomClass}
      aria-current={isActive ? 'page' : undefined}
    >
      {content}
    </Link>
  )
}

export function AppSidebar({ onboardingComplete }: { onboardingComplete: boolean }) {
  const { pathname } = useLocation()

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-alternate/30 bg-midnight text-background md:flex lg:w-60">
      <div className="flex h-14 items-center gap-2.5 border-b border-background/10 px-4">
        <div className="h-8 w-8 shrink-0 rounded-[--radius-sharp] bg-primary" />
        <div className="min-w-0 leading-tight">
          <div className="truncate text-sm font-black tracking-tight">NextStep</div>
          <div className="text-micro text-background/50">Idea OS</div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Navigation principale">
        {appNavItems.map((item) => {
          const locked = Boolean(item.requiresOnboarding && !onboardingComplete)
          const isActive = isNavItemActive(pathname, item.to, item.end)
          return (
            <SidebarItem
              key={item.to}
              item={item}
              isActive={isActive}
              locked={locked}
              variant="sidebar"
            />
          )
        })}
      </nav>

      {!onboardingComplete ? (
        <div className="border-t border-background/10 p-4 text-xs leading-relaxed text-background/50">
          Termine les 3 étapes du profil pour débloquer Brainstorm, Portfolio et la revue.
        </div>
      ) : null}
    </aside>
  )
}

export function MobileBottomNav({ onboardingComplete }: { onboardingComplete: boolean }) {
  const { pathname } = useLocation()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t border-alternate/60 bg-background/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur-md md:hidden"
      aria-label="Navigation principale"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-between">
        {appNavItems.map((item) => {
          const locked = Boolean(item.requiresOnboarding && !onboardingComplete)
          const isActive = isNavItemActive(pathname, item.to, item.end)
          return (
            <SidebarItem
              key={item.to}
              item={item}
              isActive={isActive}
              locked={locked}
              variant="bottom"
            />
          )
        })}
      </div>
    </nav>
  )
}
