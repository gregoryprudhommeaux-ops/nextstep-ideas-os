import { LogOut, Settings } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'
import { useAppStore } from '../../app/store'
import { ProfileSwitcher } from '../../components/ProfileSwitcher'
import { Button } from '../../components/ui/Button'
import { signOutUser } from '../../services/firebase/auth'
import { DesktopNav, MobileBottomNav, MobileNavPills } from './AppNav'
import { LoadingScreen } from './LoadingScreen'

export function AppShellLayout() {
  const hasData = useAppStore((s) => Boolean(s.data))
  const resetWorkspace = useAppStore((s) => s.resetWorkspace)

  const handleSignOut = () => {
    resetWorkspace()
    void signOutUser()
  }

  if (!hasData) return <LoadingScreen />

  return (
    <div className="flex min-h-dvh w-full flex-col bg-mineral">
      <header className="sticky top-0 z-30 w-full shrink-0 border-b border-alternate/40 bg-midnight text-background">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-5">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-2.5 rounded-[--radius-sharp] transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background/50 sm:gap-3"
            aria-label="NextStep Idea OS — home"
          >
            <div className="h-8 w-8 shrink-0 rounded-[--radius-sharp] bg-primary" />
            <div className="min-w-0 leading-tight">
              <div className="truncate text-sm font-black tracking-tight sm:text-[15px]">
                NextStep Idea OS
              </div>
              <div className="hidden text-micro text-background/55 sm:block">Strategic cockpit</div>
            </div>
          </Link>

          <DesktopNav />

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <div className="max-w-[8.5rem] sm:max-w-none">
              <ProfileSwitcher variant="header" />
            </div>
            <Link
              to="/app/settings"
              className="flex h-9 w-9 items-center justify-center rounded-[--radius-sharp] border border-background/15 text-background transition hover:border-alternate/40 hover:bg-background hover:text-midnight sm:h-10 sm:w-10"
              aria-label="Settings"
              title="Settings — Steven"
            >
              <Settings className="h-4 w-4" />
            </Link>
            <Button
              variant="ghost"
              className="h-9 w-9 border-background/15 p-0 text-background hover:border-alternate/40 hover:bg-background hover:text-midnight sm:h-10 sm:w-auto sm:px-3"
              onClick={handleSignOut}
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <MobileNavPills />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 sm:px-5 sm:py-8 lg:pb-8">
        <Outlet />
      </main>

      <MobileBottomNav />
    </div>
  )
}
