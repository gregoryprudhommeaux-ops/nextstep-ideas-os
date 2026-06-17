import { Card } from './ui/Card'

export function InsightPanel({
  title,
  items,
  emptyLabel = 'None identified',
}: {
  title: string
  items: string[]
  emptyLabel?: string
}) {
  return (
    <Card className="p-5">
      <div className="text-micro text-tertiary/60">{title}</div>
      <div className="mt-3 space-y-2">
        {items.length ? (
          items.map((item) => (
            <div
              key={item}
              className="rounded-[--radius-sharp] border border-alternate/50 bg-mineral px-3 py-2 text-xs leading-relaxed text-tertiary/80"
            >
              {item}
            </div>
          ))
        ) : (
          <div className="text-xs text-tertiary/55">{emptyLabel}</div>
        )}
      </div>
    </Card>
  )
}
