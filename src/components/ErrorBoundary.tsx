import * as React from 'react'
import { Card } from './ui/Card'

type Props = { children: React.ReactNode }
type State = { error: Error | null }

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="min-h-dvh bg-mineral px-5 py-10">
        <Card className="mx-auto max-w-lg p-6">
          <div className="text-micro text-tertiary/60">Runtime error</div>
          <h1 className="mt-2 text-xl font-black tracking-tight text-midnight">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm text-tertiary/75">
            The app hit an unexpected error. Try a hard refresh. If it persists, check the browser
            console.
          </p>
          <pre className="mt-4 overflow-x-auto rounded-[--radius-sharp] border border-alternate/70 bg-mineral p-3 font-mono text-xs text-midnight">
            {this.state.error.message}
          </pre>
        </Card>
      </div>
    )
  }
}
