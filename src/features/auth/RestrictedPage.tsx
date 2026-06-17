import { ShieldX } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { useAppStore } from '../../app/store'
import { signOutUser } from '../../services/firebase/auth'
import { useAuth } from './useAuth'

export function RestrictedPage() {
  const { email } = useAuth()
  const resetWorkspace = useAppStore((s) => s.resetWorkspace)

  const handleSignOut = () => {
    resetWorkspace()
    void signOutUser()
  }

  return (
    <div className="flex min-h-dvh w-full flex-col bg-mineral">
      <header className="sticky top-0 z-10 w-full shrink-0 border-b border-alternate/60 bg-midnight text-background">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-[--radius-sharp] bg-primary" />
            <div className="text-sm font-black tracking-tight">NextStep Idea OS</div>
          </div>
          <div className="text-micro text-background/60">Access restricted</div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 lg:py-16">
        <Card className="max-w-2xl p-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="text-micro text-tertiary/70">Security</div>
              <h1 className="mt-3 text-2xl font-black tracking-tight text-midnight">
                Your email is not authorized
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-tertiary/80">
                This workspace is private. Access is restricted to a whitelist configured in
                <span className="font-semibold text-tertiary"> `VITE_ALLOWED_EMAILS`</span>.
              </p>
              <div className="mt-4 rounded-[--radius-sharp] border border-alternate/70 bg-mineral px-4 py-3">
                <div className="text-micro text-tertiary/70">Signed in as</div>
                <div className="mt-1 font-mono text-sm text-midnight">
                  {email ?? '(unknown)'}
                </div>
              </div>
            </div>
            <div className="hidden rounded-[--radius-panel] border border-alternate/60 bg-background p-4 lg:block">
              <ShieldX className="h-6 w-6 text-tertiary/80" />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </Card>
      </main>
    </div>
  )
}

