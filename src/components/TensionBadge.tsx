import { cn } from '../lib/cn'

export function TensionBadge({
  label,
  severity,
}: {
  label: string
  severity: 'medium' | 'high'
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium',
        severity === 'high'
          ? 'border-tertiary/30 bg-tertiary/10 text-tertiary'
          : 'border-alternate/70 bg-background text-tertiary/75'
      )}
    >
      {label}
    </span>
  )
}
