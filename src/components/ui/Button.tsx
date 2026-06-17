import * as React from 'react'
import { cn } from '../../lib/cn'

type ButtonVariant = 'primary' | 'ghost'
type ButtonSize = 'md' | 'lg'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap',
        'rounded-[--radius-sharp] px-4 py-2 text-sm font-semibold',
        'border border-transparent transition',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:pointer-events-none disabled:opacity-50',
        size === 'lg' && 'h-12 px-5 text-base',
        size === 'md' && 'h-10',
        variant === 'primary' &&
          'bg-primary text-midnight shadow-sm hover:brightness-95 active:brightness-90',
        variant === 'ghost' &&
          'bg-transparent text-tertiary border-alternate/70 hover:bg-mineral active:bg-alternate/30',
        className
      )}
      {...props}
    />
  )
}

