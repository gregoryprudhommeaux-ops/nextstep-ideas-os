import { cn } from '../../lib/cn'

export function ScoreBar({ value, label, kind = 'positive' }: { value: number; label: string; kind?: 'positive' | 'penalty' }) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div>
      {label ? (
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-tertiary/70">{label}</span>
          <span className="text-xs font-semibold tabular-nums text-midnight">{value}</span>
        </div>
      ) : null}
      <div className={label ? 'mt-1.5' : ''}>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-alternate/50">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              kind === 'penalty'
                ? 'bg-tertiary/60'
                : pct >= 70
                  ? 'bg-primary'
                  : pct >= 40
                    ? 'bg-secondary/80'
                    : 'bg-tertiary/45'
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
