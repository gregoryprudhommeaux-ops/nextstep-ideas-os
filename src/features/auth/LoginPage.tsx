import { ArrowRight, ExternalLink } from 'lucide-react'
import * as React from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { isLikelyEmbeddedBrowser } from '../../lib/browser'
import { signInWithGoogle } from '../../services/firebase/auth'
import { allowedEmails } from './allowedEmails'

function authErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = String((error as { code: string }).code)
    if (code === 'auth/popup-blocked' || code === 'auth/popup-closed-by-user') {
      return 'Sign-in was cancelled. Try again in Chrome or Safari.'
    }
    if (code === 'auth/unauthorized-domain') {
      return 'This domain is not authorized in Firebase. Add localhost to Authorized domains.'
    }
  }
  return 'Google sign-in failed. Open this app in Chrome or Safari and try again.'
}

export function LoginPage() {
  const hasWhitelist = allowedEmails.size > 0
  const embedded = isLikelyEmbeddedBrowser()
  const [isSigningIn, setIsSigningIn] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSignIn = async () => {
    setError(null)
    setIsSigningIn(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setIsSigningIn(false)
      setError(authErrorMessage(err))
    }
  }

  return (
    <div className="flex min-h-dvh w-full flex-col bg-mineral">
      <header className="sticky top-0 z-10 w-full shrink-0 border-b border-alternate/60 bg-midnight text-background">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-[--radius-sharp] bg-primary" />
            <div className="leading-tight">
              <div className="text-sm font-black tracking-tight">NextStep Idea OS</div>
              <div className="text-micro text-background/60">Private founder cockpit</div>
            </div>
          </div>
          <div className="text-micro text-background/60">STEP 1 — Foundation</div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-6 px-5 py-10 lg:grid-cols-2 lg:py-16">
        <section className="flex flex-col justify-center">
          <div className="text-micro text-tertiary/70">Secure access</div>
          <h1 className="mt-3 text-balance text-4xl font-black tracking-tight text-midnight lg:text-5xl">
            A private strategic OS for decisive clarity.
          </h1>
          <p className="mt-4 max-w-prose text-base leading-relaxed text-tertiary/80">
            Sign in with Google to access your private workspace. Access is restricted to
            authorized emails.
          </p>
        </section>

        <section className="flex items-center justify-center lg:justify-end">
          <Card className="w-full max-w-md p-6">
            <div className="text-micro text-tertiary/70">Authentication</div>
            <div className="mt-2 text-lg font-bold tracking-tight text-midnight">
              Sign in to continue
            </div>
            <p className="mt-2 text-sm text-tertiary/70">
              This is a private founder tool. No public sign-ups.
            </p>

            {embedded ? (
              <div className="mt-4 rounded-[--radius-sharp] border border-primary/30 bg-primary/10 px-4 py-3 text-xs leading-relaxed text-tertiary">
                <div className="flex items-start gap-2">
                  <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-midnight" />
                  <span>
                    Google blocks sign-in inside embedded browsers. Open{' '}
                    <a
                      href="http://localhost:5173/login"
                      className="font-semibold text-midnight underline underline-offset-2"
                      target="_blank"
                      rel="noreferrer"
                    >
                      localhost:5173/login
                    </a>{' '}
                    in <span className="font-semibold">Chrome</span> or{' '}
                    <span className="font-semibold">Safari</span>.
                  </span>
                </div>
              </div>
            ) : null}

            <div className="mt-6">
              <Button
                className="w-full justify-between"
                size="lg"
                disabled={isSigningIn}
                onClick={() => void handleSignIn()}
              >
                {isSigningIn ? 'Redirecting to Google…' : 'Continue with Google'}
                <ArrowRight className="h-4 w-4" />
              </Button>

              {error ? (
                <div className="mt-4 rounded-[--radius-sharp] border border-alternate/70 bg-mineral px-4 py-3 text-xs leading-relaxed text-tertiary">
                  {error}
                </div>
              ) : null}

              <div className="mt-4 text-micro text-tertiary/45">Whitelist: `VITE_ALLOWED_EMAILS`</div>
              {!hasWhitelist ? (
                <div className="mt-2 text-xs leading-relaxed text-tertiary/70">
                  No authorized emails configured yet. You can sign in, but you will be routed to
                  <span className="font-semibold text-tertiary"> /restricted</span> until you set
                  `VITE_ALLOWED_EMAILS`.
                </div>
              ) : null}
            </div>
          </Card>
        </section>
      </main>
    </div>
  )
}
