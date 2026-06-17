import { cn } from '../lib/cn'

export function MetricRow({
  label,
  value,
  suffix,
  highlight,
}: {
  label: string
  value: string | number
  suffix?: string
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-tertiary/75">{label}</span>
      <span
        className={cn(
          'text-sm font-semibold tabular-nums',
          highlight ? 'text-midnight' : 'text-tertiary/85'
        )}
      >
        {value}
        {suffix ? <span className="text-tertiary/55"> {suffix}</span> : null}
      </span>
    </div>
  )
}
