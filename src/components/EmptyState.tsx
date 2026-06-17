import { Link } from 'react-router-dom'
import { Button } from './ui/Button'

export function EmptyState({
  title,
  description,
  actionLabel,
  actionTo,
}: {
  title: string
  description?: string
  actionLabel?: string
  actionTo?: string
}) {
  return (
    <div className="rounded-[--radius-card] border border-dashed border-alternate/70 bg-mineral px-4 py-8 text-center">
      <div className="text-sm font-semibold text-midnight">{title}</div>
      {description ? (
        <p className="mt-2 text-xs leading-relaxed text-tertiary/65">{description}</p>
      ) : null}
      {actionLabel && actionTo ? (
        <Link to={actionTo} className="mt-4 inline-block">
          <Button size="md">{actionLabel}</Button>
        </Link>
      ) : null}
    </div>
  )
}
