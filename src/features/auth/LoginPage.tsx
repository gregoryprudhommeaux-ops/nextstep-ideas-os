import { Link } from 'react-router-dom'
import { ArrowRight, ExternalLink } from 'lucide-react'
import * as React from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { isLikelyEmbeddedBrowser } from '../../lib/browser'
import { signInWithGoogle } from '../../services/firebase/auth'
import { allowedEmails } from './allowedEmails'
import { useAuth } from './useAuth'
import { authErrorMessage } from './authErrors'

export function LoginPage() {
  const { redirectError } = useAuth()
  const hasWhitelist = allowedEmails.size > 0
  const embedded = isLikelyEmbeddedBrowser()
  const [isSigningIn, setIsSigningIn] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const displayError = error ?? redirectError ?? null

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
              <div className="text-micro text-background/60">Cockpit fondateur privé</div>
            </div>
          </div>
          <Link to="/" className="shrink-0 text-micro text-background/60 hover:text-background">
            <span className="hidden sm:inline">← Comment ça marche</span>
            <span className="sm:hidden">Accueil</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-6 px-5 py-10 lg:grid-cols-2 lg:py-16">
        <section className="flex flex-col justify-center">
          <div className="text-micro text-tertiary/70">Accès sécurisé</div>
          <h1 className="mt-3 text-balance text-4xl font-black tracking-tight text-midnight lg:text-5xl">
            Un OS stratégique privé pour décider avec clarté.
          </h1>
          <p className="mt-4 max-w-prose text-base leading-relaxed text-tertiary/80">
            Connecte-toi avec Google pour accéder à ton workspace privé. L’accès est limité aux
            e-mails autorisés.
          </p>
        </section>

        <section className="flex items-center justify-center lg:justify-end">
          <Card className="w-full max-w-md p-6">
            <div className="text-micro text-tertiary/70">Authentification</div>
            <div className="mt-2 text-lg font-bold tracking-tight text-midnight">
              Se connecter pour continuer
            </div>
            <p className="mt-2 text-sm text-tertiary/70">
              Outil fondateur privé — pas d’inscription publique.
            </p>

            {embedded ? (
              <div className="mt-4 rounded-[--radius-sharp] border border-primary/30 bg-primary/10 px-4 py-3 text-xs leading-relaxed text-tertiary">
                <div className="flex items-start gap-2">
                  <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-midnight" />
                  <span>
                    Google bloque la connexion dans les navigateurs intégrés. Ouvre{' '}
                    <a
                      href={`${window.location.origin}/login`}
                      className="font-semibold text-midnight underline underline-offset-2"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {window.location.host}/login
                    </a>{' '}
                    dans <span className="font-semibold">Chrome</span> ou{' '}
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
                {isSigningIn ? 'Redirection vers Google…' : 'Continuer avec Google'}
                <ArrowRight className="h-4 w-4" />
              </Button>

              {displayError ? (
                <div className="mt-4 rounded-[--radius-sharp] border border-alternate/70 bg-mineral px-4 py-3 text-xs leading-relaxed text-tertiary">
                  {displayError}
                </div>
              ) : null}

              <div className="mt-4 text-micro text-tertiary/45">Whitelist : `VITE_ALLOWED_EMAILS`</div>
              {!hasWhitelist ? (
                <div className="mt-2 text-xs leading-relaxed text-tertiary/70">
                  Aucun e-mail autorisé configuré. Tu peux te connecter, mais tu seras redirigé vers
                  <span className="font-semibold text-tertiary"> /restricted</span> tant que
                  `VITE_ALLOWED_EMAILS` n’est pas défini.
                </div>
              ) : null}
            </div>
          </Card>
        </section>
      </main>
    </div>
  )
}
