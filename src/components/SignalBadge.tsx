import { cn } from '../lib/cn'

export function SignalBadge({
  label,
  value,
  max = 10,
}: {
  label: string
  value: number
  max?: number
}) {
  const strong = value >= 7
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        strong
          ? 'border-primary/35 bg-primary/10 text-midnight'
          : 'border-alternate/60 bg-background text-tertiary/70'
      )}
      title={`${label}: ${value}/${max}`}
    >
      <span className="text-tertiary/55">{label}</span>
      <span className="tabular-nums">{value}</span>
    </span>
  )
}
