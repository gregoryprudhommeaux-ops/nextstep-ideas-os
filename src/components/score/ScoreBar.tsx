import { cn } from '../../lib/cn'

export function ScoreBar({ value, label, kind = 'positive' }: { value: number; label: string; kind?: 'positive' | 'penalty' }) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-tertiary/70">{label}</span>
        <span className="text-xs font-semibold tabular-nums text-midnight">{value}</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-alternate/40">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            kind === 'penalty' ? 'bg-tertiary/50' : pct >= 70 ? 'bg-primary' : 'bg-secondary/70'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
