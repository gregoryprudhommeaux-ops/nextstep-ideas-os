import { LogOut } from 'lucide-react'
import * as React from 'react'
import { Button } from '../../components/ui/Button'
import { signOutUser } from '../../services/firebase/auth'
import { NavLink, Outlet } from 'react-router-dom'
import { bootstrapMockData } from '../../app/bootstrap'
import { useAppStore } from '../../app/store'
import { ProfileSwitcher } from '../../components/ProfileSwitcher'
import { cn } from '../../lib/cn'

export function AppShellLayout() {
  const hasData = useAppStore((s) => Boolean(s.data))

  React.useEffect(() => {
    if (!hasData) void bootstrapMockData()
  }, [hasData])

  return (
    <div className="min-h-dvh bg-mineral">
      <header className="sticky top-0 z-10 border-b border-alternate/40 bg-midnight text-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-7 w-7 shrink-0 rounded-[--radius-sharp] bg-primary" />
            <div className="min-w-0 leading-tight">
              <div className="truncate text-sm font-black tracking-tight">NextStep Idea OS</div>
              <div className="text-micro text-background/60">Strategic cockpit</div>
            </div>
          </div>

          <nav className="hidden items-center gap-5 text-micro md:flex">
            <NavLink
              to="/app"
              end
              className={({ isActive }) =>
                cn(isActive ? 'text-background' : 'text-background/60 hover:text-background/80')
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/app/ideas"
              className={({ isActive }) =>
                cn(isActive ? 'text-background' : 'text-background/60 hover:text-background/80')
              }
            >
              Ideas
            </NavLink>
            <NavLink
              to="/app/synergy"
              className={({ isActive }) =>
                cn(isActive ? 'text-background' : 'text-background/60 hover:text-background/80')
              }
            >
              Synergy
            </NavLink>
            <NavLink
              to="/app/umbrellas"
              className={({ isActive }) =>
                cn(isActive ? 'text-background' : 'text-background/60 hover:text-background/80')
              }
            >
              Umbrellas
            </NavLink>
            <NavLink
              to="/app/review"
              className={({ isActive }) =>
                cn(isActive ? 'text-background' : 'text-background/60 hover:text-background/80')
              }
            >
              Review
            </NavLink>
            <NavLink
              to="/app/filters"
              className={({ isActive }) =>
                cn(isActive ? 'text-background' : 'text-background/60 hover:text-background/80')
              }
            >
              Profiles
            </NavLink>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <ProfileSwitcher variant="header" />
            <Button
              variant="ghost"
              className="ml-2 border-background/15 text-background hover:border-alternate/40 hover:bg-background hover:text-midnight"
              onClick={() => void signOutUser()}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">
        <Outlet />
      </main>
    </div>
  )
}
