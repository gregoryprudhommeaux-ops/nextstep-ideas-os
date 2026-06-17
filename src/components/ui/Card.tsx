import * as React from 'react'
import { cn } from '../../lib/cn'

export type CardProps = React.HTMLAttributes<HTMLDivElement>

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[--radius-card] border border-alternate/60 bg-background shadow-sm',
        className
      )}
      {...props}
    />
  )
}

