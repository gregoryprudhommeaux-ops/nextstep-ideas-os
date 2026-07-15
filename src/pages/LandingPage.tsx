import { Link } from 'react-router-dom'
import {
  ArrowRight,
  GitBranch,
  Layers,
  LineChart,
  Sparkles,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useAuth } from '../features/auth/useAuth'
import { LoadingScreen } from '../features/shell/LoadingScreen'

const steps = [
  {
    n: '01',
    title: 'Capturer',
    body: 'Déposez une idée en quelques secondes — titre, contexte et ce qui l\'a inspirée (liens, decks, chats, notes vocales).',
  },
  {
    n: '02',
    title: 'Score & brief',
    body: 'Ajustez vos scores subjectifs et rédigez votre brief stratégique. Voyez ce qui remonte dans votre Portfolio.',
  },
  {
    n: '03',
    title: 'Connecter & explorer',
    body: 'Reliez les Synergies, regroupez les Umbrellas, explorez avec Steven. Votre Portfolio devient un système.',
  },
]

const pillars = [
  {
    icon: LineChart,
    title: 'Score stratégique',
    body: 'Pondérez alignement, revenus, scalabilité et vitesse de validation — une lecture claire de chaque idée.',
  },
  {
    icon: GitBranch,
    title: 'Synergy map',
    body: 'Voyez quelles idées se renforcent mutuellement au lieu de se disputer l\'attention.',
  },
  {
    icon: Layers,
    title: 'Groupes Umbrella',
    body: 'Regroupez les idées sous une logique de marque commune quand des patterns émergent.',
  },
  {
    icon: Sparkles,
    title: 'Exploration Steven',
    body: 'Enrichissez, challengez ou recentrez chaque idée — et voyez comment tout se connecte.',
  },
]

export function LandingPage() {
  const { user, isLoading, isAuthorized } = useAuth()
  const isSignedIn = Boolean(user && isAuthorized)
  const cockpitHref = isSignedIn ? '/app' : '/login'

  if (isLoading) return <LoadingScreen />

  return (
    <div className="flex min-h-dvh w-full flex-col bg-mineral">
      <header className="sticky top-0 z-10 w-full border-b border-alternate/60 bg-midnight/95 text-background backdrop-blur-sm">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-5">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-[--radius-sharp] transition hover:opacity-90"
            aria-label="NextStep Idea OS — accueil"
          >
            <div className="h-7 w-7 rounded-[--radius-sharp] bg-primary" />
            <div className="leading-tight">
              <div className="text-sm font-black tracking-tight">NextStep Idea OS</div>
              <div className="text-micro text-background/55">Cockpit fondateur privé</div>
            </div>
          </Link>
          <Link to={cockpitHref}>
            <Button
              variant="ghost"
              className="border-background/20 text-background hover:bg-background/10 hover:text-background"
            >
              {isSignedIn ? 'Ouvrir le cockpit' : 'Se connecter'}
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-alternate/50 bg-background">
          <div className="mx-auto max-w-5xl px-5 py-16 md:py-24">
            <div className="text-micro text-primary/90">Pour les fondateurs avec trop d&apos;idées</div>
            <h1 className="mt-4 max-w-2xl text-balance text-4xl font-black tracking-tight text-midnight md:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
              Transformez le chaos d&apos;idées en clarté stratégique.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-tertiary/80 md:text-lg">
              Un cockpit privé pour capturer, scorer, connecter et revoir vos idées business — pour savoir
              quoi poursuivre, mettre en pause ou abandonner.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to={cockpitHref}>
                <Button size="lg" className="gap-2">
                  Ouvrir votre cockpit
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <span className="text-xs text-tertiary/55">Privé · Connexion Google · Vos données restent les vôtres</span>
            </div>
          </div>
        </section>

        {/* Objective */}
        <section className="mx-auto max-w-5xl px-5 py-14 md:py-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center">
            <div>
              <div className="text-micro text-tertiary/60">L&apos;objectif</div>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-midnight md:text-3xl">
                Arrêtez de jongler avec les idées dans votre tête.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-tertiary/80 md:text-base">
                Vous n&apos;avez pas besoin d&apos;une autre app de notes. Vous avez besoin d&apos;un endroit pour{' '}
                <span className="font-semibold text-midnight">classer</span>,{' '}
                <span className="font-semibold text-midnight">comparer</span> et{' '}
                <span className="font-semibold text-midnight">décider</span> — avec un scoring qui
                reflète <em>vos</em> priorités, pas un modèle générique.
              </p>
            </div>
            <Card className="border-primary/20 bg-primary/5 p-6">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-midnight" />
                <div>
                  <div className="text-sm font-bold text-midnight">Conçu pour un fondateur</div>
                  <p className="mt-2 text-sm leading-relaxed text-tertiary/75">
                    Commencez vide. Ajoutez les idées une par une. Pas de démo encombrante — un workspace
                    que vous faites grandir à votre rythme.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Steps */}
        <section className="border-y border-alternate/50 bg-background">
          <div className="mx-auto max-w-5xl px-5 py-14 md:py-16">
            <div className="text-micro text-tertiary/60">Comment ça marche</div>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-midnight">Trois étapes. Sans friction.</h2>
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
              {steps.map((s) => (
                <Card key={s.n} className="relative p-6">
                  <div className="text-3xl font-black tabular-nums text-primary/40">{s.n}</div>
                  <div className="mt-3 text-lg font-bold text-midnight">{s.title}</div>
                  <p className="mt-2 text-sm leading-relaxed text-tertiary/75">{s.body}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pillars */}
        <section className="mx-auto max-w-5xl px-5 py-14 md:py-16">
          <div className="text-micro text-tertiary/60">Dans le cockpit</div>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-midnight">
            Lisez votre Portfolio comme un stratège.
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {pillars.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="flex gap-4 rounded-[--radius-card] border border-alternate/60 bg-background p-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[--radius-sharp] bg-mineral">
                  <Icon className="h-5 w-5 text-tertiary/70" />
                </div>
                <div>
                  <div className="text-sm font-bold text-midnight">{title}</div>
                  <p className="mt-1 text-sm leading-relaxed text-tertiary/70">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-alternate/50 bg-midnight text-background">
          <div className="mx-auto max-w-5xl px-5 py-14 text-center md:py-16">
            <h2 className="text-2xl font-black tracking-tight md:text-3xl">
              Votre prochaine idée mérite un système.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-background/65">
              Capturez votre première idée en moins d&apos;une minute. Le reste se construit au fil du temps.
            </p>
            <Link to={cockpitHref} className="mt-8 inline-block">
              <Button size="lg" className="gap-2">
                {isSignedIn ? 'Retour au cockpit' : 'Commencer'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-alternate/50 py-6 text-center text-micro text-tertiary/45">
        NextStep Idea OS — workspace stratégique privé
      </footer>
    </div>
  )
}
