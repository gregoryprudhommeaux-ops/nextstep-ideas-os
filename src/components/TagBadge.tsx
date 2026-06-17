import { useAppStore } from '../app/store'
import { cn } from '../lib/cn'

export function TagBadge({ tagId }: { tagId: string }) {
  const tag = useAppStore((s) => s.data?.tags.find((t) => t.id === tagId))
  if (!tag) return null
  return (
    <span
      className={cn(
        'rounded-full border border-alternate/60 bg-background px-2 py-0.5',
        'text-[11px] font-semibold tracking-tight text-tertiary/80'
      )}
    >
      {tag.label}
    </span>
  )
}

