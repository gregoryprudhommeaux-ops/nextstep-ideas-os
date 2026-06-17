import * as React from 'react'
import { cn } from '../../lib/cn'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-[--radius-sharp] border border-alternate/70 bg-background px-3 text-sm text-midnight',
        'placeholder:text-tertiary/45 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20',
        className
      )}
      {...props}
    />
  )
}
