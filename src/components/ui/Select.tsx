import * as React from 'react'
import { cn } from '../../lib/cn'

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        'h-10 w-full rounded-[--radius-sharp] border border-alternate/70 bg-background px-3 text-sm text-midnight',
        'focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}
