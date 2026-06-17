import { cn } from '../lib/cn'
import type { SynergyStrength } from '../types/domain'
import { strengthLabels } from '../features/synergy/synergyUtils'

const styles: Record<SynergyStrength, string> = {
  strong: 'border-primary/40 bg-primary/10 text-midnight',
  medium: 'border-secondary/30 bg-secondary/10 text-tertiary',
  weak: 'border-alternate/70 bg-background text-tertiary/75',
  conflict: 'border-tertiary/25 bg-tertiary/5 text-tertiary/80',
}

export function SynergyStrengthBadge({ strength }: { strength: SynergyStrength }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        styles[strength]
      )}
    >
      {strengthLabels[strength]}
    </span>
  )
}
