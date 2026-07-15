import { Card } from './ui/Card'
import { cn } from '../lib/cn'

type Variant = 'default' | 'strength' | 'constraint'

export function InsightPanel({
  title,
  items,
  emptyLabel = 'Rien de notable',
  variant = 'default',
}: {
  title: string
  items: string[]
  emptyLabel?: string
  variant?: Variant
}) {
  const isStrength = variant === 'strength'
  const isConstraint = variant === 'constraint'

  return (
    <Card
      className={cn(
        'p-5',
        isStrength && 'border-primary/30 bg-primary/[0.04]',
        isConstraint && 'border-alternate/70'
      )}
    >
      <div
        className={cn(
          'text-micro font-semibold tracking-wide',
          isStrength ? 'text-midnight/75' : isConstraint ? 'text-midnight/70' : 'text-tertiary/70'
        )}
      >
        {title}
      </div>
      <div className="mt-3 space-y-2">
        {items.length ? (
          items.map((item) => (
            <div
              key={item}
              className={cn(
                'rounded-[--radius-sharp] border px-3 py-2.5 text-sm font-medium leading-relaxed',
                isStrength
                  ? 'border-primary/35 bg-background text-midnight shadow-sm'
                  : isConstraint
                    ? 'border-alternate/80 bg-background text-midnight shadow-sm'
                    : 'border-alternate/70 bg-background text-midnight'
              )}
            >
              {item}
            </div>
          ))
        ) : (
          <div
            className={cn(
              'rounded-[--radius-sharp] border border-dashed px-3 py-2.5 text-sm',
              isConstraint
                ? 'border-alternate/60 bg-mineral/40 text-tertiary/75'
                : 'text-tertiary/65'
            )}
          >
            {emptyLabel}
          </div>
        )}
      </div>
    </Card>
  )
}
