import * as React from 'react'
import { cn } from '../../lib/cn'

export type CardProps = React.HTMLAttributes<HTMLDivElement>

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[--radius-card] border border-alternate/50 bg-background shadow-[0_1px_2px_rgba(26,26,26,0.04)]',
        className
      )}
      {...props}
    />
  )
}

