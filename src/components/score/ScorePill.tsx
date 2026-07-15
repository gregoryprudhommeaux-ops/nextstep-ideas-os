import { cn } from '../../lib/cn'

export function ScorePill({ score }: { score: number }) {
  const tone =
    score >= 75 ? 'border-primary/40 bg-primary/15 text-midnight' : 'border-alternate/70 bg-background text-tertiary/80'

  return (
    <span
      className={cn(
        'inline-flex h-7 items-center rounded-full border px-2.5 text-xs font-bold tabular-nums',
        tone
      )}
      title="Score pondéré (0–100)"
    >
      {score}
    </span>
  )
}

