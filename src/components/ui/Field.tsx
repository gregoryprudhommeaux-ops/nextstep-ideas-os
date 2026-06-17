import * as React from 'react'
import { cn } from '../../lib/cn'

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string
  hint?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={cn('block', className)}>
      <span className="text-micro text-tertiary/60">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint ? <p className="mt-1 text-xs text-tertiary/55">{hint}</p> : null}
    </label>
  )
}
