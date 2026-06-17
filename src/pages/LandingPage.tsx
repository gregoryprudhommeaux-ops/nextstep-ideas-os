import { Link } from 'react-router-dom'
import {
  ArrowRight,
  GitBranch,
  Layers,
  LineChart,
  Sparkles,
  Target,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useAuth } from '../features/auth/useAuth'
import { LoadingScreen } from '../features/shell/LoadingScreen'

const steps = [
  {
    n: '01',
    title: 'Capture',
    body: 'Drop an idea in seconds — title, context, and what inspired it (links, decks, chats, voice notes).',
  },
  {
    n: '02',
    title: 'Score & brief',
    body: 'Tune subjective scores and write your strategic brief. Switch lenses to see what rises.',
  },
  {
    n: '03',
    title: 'Connect & review',
    body: 'Link synergies, group umbrellas, run a weekly review. Your portfolio becomes a system.',
  },
]

const pillars = [
  {
    icon: LineChart,
    title: 'Multi-lens scoring',
    body: 'Freedom First, Cash Flow First, Scalable Asset — same ideas, different strategic read.',
  },
  {
    icon: GitBranch,
    title: 'Synergy map',
    body: 'See which ideas reinforce each other instead of competing for attention.',
  },
  {
    icon: Layers,
    title: 'Umbrella groups',
    body: 'Cluster ideas under shared brand logic when patterns emerge.',
  },
  {
    icon: Target,
    title: 'Weekly review',
    body: 'Three guided questions to turn reflection into decisions.',
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
            aria-label="NextStep Idea OS — home"
          >
            <div className="h-7 w-7 rounded-[--radius-sharp] bg-primary" />
            <div className="leading-tight">
              <div className="text-sm font-black tracking-tight">NextStep Idea OS</div>
              <div className="text-micro text-background/55">Private founder cockpit</div>
            </div>
          </Link>
          <Link to={cockpitHref}>
            <Button
              variant="ghost"
              className="border-background/20 text-background hover:bg-background/10 hover:text-background"
            >
              {isSignedIn ? 'Open cockpit' : 'Sign in'}
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-alternate/50 bg-background">
          <div className="mx-auto max-w-5xl px-5 py-16 md:py-24">
            <div className="text-micro text-primary/90">For founders with too many ideas</div>
            <h1 className="mt-4 max-w-2xl text-balance text-4xl font-black tracking-tight text-midnight md:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
              Turn idea chaos into strategic clarity.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-tertiary/80 md:text-lg">
              A private cockpit to capture, score, connect, and review your business ideas — so you
              know what to pursue, pause, or kill.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to={cockpitHref}>
                <Button size="lg" className="gap-2">
                  Open your cockpit
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <span className="text-xs text-tertiary/55">Private · Google sign-in · Your data stays yours</span>
            </div>
          </div>
        </section>

        {/* Objective */}
        <section className="mx-auto max-w-5xl px-5 py-14 md:py-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center">
            <div>
              <div className="text-micro text-tertiary/60">The objective</div>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-midnight md:text-3xl">
                Stop juggling ideas in your head.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-tertiary/80 md:text-base">
                You do not need another notes app. You need a place to{' '}
                <span className="font-semibold text-midnight">rank</span>,{' '}
                <span className="font-semibold text-midnight">compare</span>, and{' '}
                <span className="font-semibold text-midnight">decide</span> — with scoring that
                reflects <em>your</em> priorities, not a generic template.
              </p>
            </div>
            <Card className="border-primary/20 bg-primary/5 p-6">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-midnight" />
                <div>
                  <div className="text-sm font-bold text-midnight">Built for one founder</div>
                  <p className="mt-2 text-sm leading-relaxed text-tertiary/75">
                    Start empty. Add ideas one by one. No demo clutter — a workspace you grow at your
                    own pace.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Steps */}
        <section className="border-y border-alternate/50 bg-background">
          <div className="mx-auto max-w-5xl px-5 py-14 md:py-16">
            <div className="text-micro text-tertiary/60">How it works</div>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-midnight">Three steps. No friction.</h2>
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
          <div className="text-micro text-tertiary/60">Inside the cockpit</div>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-midnight">
            Read your portfolio like a strategist.
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
              Your next idea deserves a system.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-background/65">
              Capture your first idea in under a minute. The rest builds as you go.
            </p>
            <Link to={cockpitHref} className="mt-8 inline-block">
              <Button size="lg" className="gap-2">
                {isSignedIn ? 'Back to cockpit' : 'Get started'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-alternate/50 py-6 text-center text-micro text-tertiary/45">
        NextStep Idea OS — private strategic workspace
      </footer>
    </div>
  )
}
