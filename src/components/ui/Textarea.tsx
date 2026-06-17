import * as React from 'react'
import { cn } from '../../lib/cn'

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'min-h-[88px] w-full resize-y rounded-[--radius-sharp] border border-alternate/70 bg-background px-3 py-2 text-sm leading-relaxed text-midnight',
        'placeholder:text-tertiary/45 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20',
        className
      )}
      {...props}
    />
  )
}
