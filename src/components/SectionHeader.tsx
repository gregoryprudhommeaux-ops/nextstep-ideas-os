import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0 max-w-2xl">
        {eyebrow ? <div className="text-micro text-tertiary/60">{eyebrow}</div> : null}
        <h1 className="mt-1 text-balance text-2xl font-black tracking-tight text-midnight sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-sm leading-relaxed text-tertiary/75 sm:text-[15px]">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0 sm:self-end">{action}</div> : null}
    </div>
  )
}
