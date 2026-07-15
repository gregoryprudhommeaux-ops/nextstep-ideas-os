import { LogOut } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'
import { useAppStore } from '../../app/store'
import { Button } from '../../components/ui/Button'
import { signOutUser } from '../../services/firebase/auth'
import { AppSidebar, MobileBottomNav } from './AppSidebar'
import { LoadingScreen } from './LoadingScreen'

export function AppShellLayout() {
  const hasData = useAppStore((s) => Boolean(s.data))
  const onboardingComplete = useAppStore((s) =>
    Boolean(s.data?.founderProfile?.onboardingCompletedAt)
  )
  const resetWorkspace = useAppStore((s) => s.resetWorkspace)

  const handleSignOut = () => {
    resetWorkspace()
    void signOutUser()
  }

  if (!hasData) return <LoadingScreen />

  return (
    <div className="flex min-h-dvh w-full bg-mineral">
      <AppSidebar onboardingComplete={onboardingComplete} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-end gap-2 border-b border-alternate/40 bg-background/95 px-4 backdrop-blur-sm sm:gap-3 sm:px-5">
          <div className="mr-auto md:hidden">
            <Link to="/app/brainstorm" className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-[--radius-sharp] bg-primary" />
              <span className="text-sm font-black text-midnight">NextStep</span>
            </Link>
          </div>
          <Button
            variant="ghost"
            className="h-9 px-2 sm:px-3"
            onClick={handleSignOut}
            aria-label="Déconnexion"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Déconnexion</span>
          </Button>
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-[calc(5.25rem+env(safe-area-inset-bottom))] sm:px-5 sm:py-8 md:max-w-4xl md:pb-8 lg:max-w-5xl">
          <Outlet />
        </main>

        <MobileBottomNav onboardingComplete={onboardingComplete} />
      </div>
    </div>
  )
}
