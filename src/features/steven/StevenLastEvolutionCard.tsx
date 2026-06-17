import { Card } from '../../components/ui/Card'
import { formatEvolutionTimestamp } from '../../lib/time'
import type { StevenEvolutionRecord } from './types'

export function StevenLastEvolutionCard({
  lastEvolution,
}: {
  lastEvolution: StevenEvolutionRecord | null
}) {
  if (!lastEvolution) {
    return (
      <Card className="border-alternate/50 bg-mineral/50 p-5">
        <div className="text-sm font-bold text-midnight">Dernière évolution de Steven</div>
        <p className="mt-2 text-sm text-tertiary/65">
          Aucune mise à jour automatique pour l&apos;instant. Valide un échange sur la page{' '}
          <span className="font-medium text-midnight">Brainstorm</span> pour que Steven enrichisse sa
          compréhension de toi.
        </p>
      </Card>
    )
  }

  const sourceLabel =
    lastEvolution.source === 'brainstorm'
      ? 'Échange brainstorm'
      : lastEvolution.source === 'founder_profile'
        ? 'Profil fondateur'
        : 'Manuel'

  return (
    <Card className="border-primary/25 bg-primary/5 p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="text-sm font-bold text-midnight">Dernière évolution de Steven</div>
        <div className="text-micro text-tertiary/60">{sourceLabel}</div>
      </div>
      <time
        dateTime={lastEvolution.at.toDate().toISOString()}
        className="mt-2 block text-sm tabular-nums text-tertiary/75"
      >
        {formatEvolutionTimestamp(lastEvolution.at)}
      </time>
      <ul className="mt-4 space-y-2">
        {lastEvolution.summaryBullets.map((bullet) => (
          <li key={bullet} className="flex gap-2 text-sm leading-relaxed text-midnight">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
            {bullet}
          </li>
        ))}
      </ul>
    </Card>
  )
}
