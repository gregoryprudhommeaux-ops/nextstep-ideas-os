import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import type { PortfolioSuggestionStatus } from '../../types/domain'
import { Button } from '../../components/ui/Button'

type Props = {
  title: string
  subtitle?: string
  note: string
  status: PortfolioSuggestionStatus
  userNotes?: string
  onNotesChange: (notes: string) => void
  resultIdeaId?: string
  resultLinkId?: string
  children?: React.ReactNode
}

const statusLabels: Record<PortfolioSuggestionStatus, string> = {
  open: 'À traiter',
  applied: 'Appliqué',
  dismissed: 'Ignoré',
  converted: '→ Idée créée',
}

const statusStyles: Record<PortfolioSuggestionStatus, string> = {
  open: 'bg-primary/15 text-midnight',
  applied: 'bg-emerald-100 text-emerald-900',
  dismissed: 'bg-alternate/60 text-tertiary/70',
  converted: 'bg-sky-100 text-sky-900',
}

export function PortfolioSuggestionCard({
  title,
  subtitle,
  note,
  status,
  userNotes,
  onNotesChange,
  resultIdeaId,
  children,
}: Props) {
  const [expanded, setExpanded] = useState(status === 'open')
  const [draftNotes, setDraftNotes] = useState(userNotes ?? '')

  return (
    <div
      className={`rounded-[--radius-sharp] border bg-background transition ${
        expanded ? 'border-alternate/60' : 'border-alternate/40'
      }`}
    >
      <button
        type="button"
        className="flex w-full items-start gap-3 p-3 text-left"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <ChevronDown
          className={`mt-0.5 h-4 w-4 shrink-0 text-tertiary/60 transition ${expanded ? 'rotate-180' : ''}`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-midnight">{title}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-micro font-medium ${statusStyles[status]}`}
            >
              {statusLabels[status]}
            </span>
          </div>
          {subtitle ? <p className="mt-1 text-xs text-tertiary/60">{subtitle}</p> : null}
          {!expanded ? (
            <p className="mt-1 line-clamp-2 text-xs text-tertiary/70">{note}</p>
          ) : null}
        </div>
      </button>

      {expanded ? (
        <div className="space-y-3 border-t border-alternate/40 px-3 pb-3 pt-2">
          <p className="text-xs leading-relaxed text-tertiary/75">{note}</p>

          <label className="block space-y-1">
            <span className="text-micro text-tertiary/55">Tes notes & compléments</span>
            <textarea
              className="w-full rounded-[--radius-sharp] border border-alternate/60 bg-mineral/30 px-3 py-2 text-xs text-midnight placeholder:text-tertiary/45 focus:border-primary/50 focus:outline-none"
              rows={3}
              value={draftNotes}
              placeholder="Affine l'idée, ajoute du contexte, des contraintes…"
              onChange={(e) => setDraftNotes(e.target.value)}
              onBlur={() => {
                if (draftNotes !== (userNotes ?? '')) onNotesChange(draftNotes)
              }}
            />
          </label>

          {resultIdeaId ? (
            <Link
              to={`/app/ideas/${resultIdeaId}`}
              className="inline-block text-xs font-medium text-primary underline-offset-2 hover:underline"
            >
              Voir l&apos;idée créée →
            </Link>
          ) : null}

          {status === 'open' ? (
            <div className="flex flex-wrap gap-2">{children}</div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export function DismissSuggestionButton({ onDismiss }: { onDismiss: () => void }) {
  return (
    <Button type="button" variant="ghost" onClick={onDismiss}>
      Ignorer
    </Button>
  )
}
