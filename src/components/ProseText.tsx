import { normalizeProseSpacing } from '../lib/prose'
import { cn } from '../lib/cn'

type Props = {
  children?: string | null
  className?: string
  fallback?: string
}

export function ProseText({ children, className, fallback }: Props) {
  const raw = children?.trim()
  if (!raw) {
    return fallback ? <span className={className}>{fallback}</span> : null
  }

  return (
    <span className={cn('whitespace-pre-wrap', className)}>{normalizeProseSpacing(raw)}</span>
  )
}
