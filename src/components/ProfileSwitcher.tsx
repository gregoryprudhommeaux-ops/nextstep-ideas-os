import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { useActiveProfile, useAppStore, EMPTY_PROFILES } from '../app/store'
import { cn } from '../lib/cn'

export function ProfileSwitcher({ variant = 'header' }: { variant?: 'header' | 'inline' }) {
  const profile = useActiveProfile()
  const profiles = useAppStore((s) => s.data?.profiles ?? EMPTY_PROFILES)
  const setActiveProfileId = useAppStore((s) => s.setActiveProfileId)
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const isHeader = variant === 'header'

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-2 rounded-[--radius-sharp] border px-3 py-1.5 text-left transition',
          isHeader
            ? 'border-background/20 bg-background/5 hover:border-background/30 hover:bg-background/10'
            : 'border-alternate/70 bg-background hover:border-alternate'
        )}
      >
        <div className="min-w-0">
          <div
            className={cn(
              'text-micro',
              isHeader ? 'text-background/55' : 'text-tertiary/55'
            )}
          >
            Scoring lens
          </div>
          <div
            className={cn(
              'truncate text-xs font-semibold',
              isHeader ? 'text-background' : 'text-midnight'
            )}
          >
            {profile?.name ?? '—'}
          </div>
        </div>
        <ChevronDown
          className={cn('h-3.5 w-3.5 shrink-0', isHeader ? 'text-background/60' : 'text-tertiary/60')}
        />
      </button>

      {open ? (
        <div
          className={cn(
            'absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-[--radius-card] border border-alternate/70 bg-background shadow-lg',
            isHeader ? 'top-full' : 'top-full'
          )}
        >
          {profiles.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setActiveProfileId(p.id)
                setOpen(false)
              }}
              className={cn(
                'w-full border-b border-alternate/40 px-4 py-3 text-left last:border-b-0 hover:bg-mineral',
                p.id === profile?.id && 'bg-primary/10'
              )}
            >
              <div className="text-sm font-semibold text-midnight">{p.name}</div>
              {p.description ? (
                <div className="mt-1 line-clamp-2 text-xs leading-relaxed text-tertiary/70">
                  {p.description}
                </div>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
