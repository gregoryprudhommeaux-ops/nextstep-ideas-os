import { AlertTriangle } from 'lucide-react'
import { Card } from '../../components/ui/Card'

export function SetupRequiredPage({ message }: { message: string }) {
  return (
    <div className="min-h-dvh bg-mineral">
      <header className="sticky top-0 z-10 border-b border-alternate/60 bg-midnight text-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-[--radius-sharp] bg-primary" />
            <div className="text-sm font-black tracking-tight">NextStep Idea OS</div>
          </div>
          <div className="text-micro text-background/60">Setup required</div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 lg:py-16">
        <Card className="max-w-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-[--radius-panel] border border-alternate/60 bg-background p-3">
              <AlertTriangle className="h-5 w-5 text-tertiary/80" />
            </div>
            <div>
              <div className="text-micro text-tertiary/60">Configuration</div>
              <h1 className="mt-2 text-xl font-black tracking-tight text-midnight">
                Firebase env is missing
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-tertiary/80">
                Create a <span className="font-semibold text-tertiary">`.env.local`</span> from{' '}
                <span className="font-semibold text-tertiary">`.env.example`</span> and paste your
                Firebase Web App config values.
              </p>
              <div className="mt-4 rounded-[--radius-sharp] border border-alternate/70 bg-mineral px-4 py-3">
                <div className="text-micro text-tertiary/60">Error</div>
                <div className="mt-1 font-mono text-xs text-midnight">{message}</div>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}

