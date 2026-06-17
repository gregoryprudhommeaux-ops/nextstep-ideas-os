import type { ReactNode } from 'react'

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow ? <div className="text-micro text-tertiary/60">{eyebrow}</div> : null}
        <div className="mt-1 text-2xl font-black tracking-tight text-midnight">{title}</div>
        {description ? (
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-tertiary/75">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  )
}
