import { Card } from './ui/Card'
import { cn } from '../lib/cn'

export function StatCard({
  label,
  value,
  detail,
  accent,
}: {
  label: string
  value: string | number
  detail?: string
  accent?: boolean
}) {
  return (
    <Card className={cn('p-5', accent && 'border-primary/30')}>
      <div className="text-micro text-tertiary/60">{label}</div>
      <div className="mt-2 text-3xl font-black tracking-tight text-midnight">{value}</div>
      {detail ? <div className="mt-2 text-xs leading-relaxed text-tertiary/65">{detail}</div> : null}
    </Card>
  )
}
