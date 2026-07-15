import * as React from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import { SynergyStrengthBadge } from '../../components/SynergyStrengthBadge'
import { Button } from '../../components/ui/Button'
import { Textarea } from '../../components/ui/Textarea'
import { SliderField } from '../../components/ui/SliderField'
import type { Idea, SynergyLink } from '../../types/domain'
import { ideaExists } from '../portfolio/portfolioUtils'

type Props = {
  link: SynergyLink
  ideaTitle: (id: string) => string
  ideas: Idea[]
  onDelete: (id: string) => void
  onUpdate: (id: string, patch: { totalSynergyScore?: number; notes?: string }) => void
}

export function SynergyLinkCard({ link, ideaTitle, ideas, onDelete, onUpdate }: Props) {
  const [editing, setEditing] = React.useState(false)
  const [score, setScore] = React.useState(link.totalSynergyScore)
  const [notes, setNotes] = React.useState(link.notes ?? '')

  React.useEffect(() => {
    setScore(link.totalSynergyScore)
    setNotes(link.notes ?? '')
  }, [link])

  const sourceOk = ideaExists(ideas, link.sourceIdeaId)
  const targetOk = ideaExists(ideas, link.targetIdeaId)

  const save = () => {
    onUpdate(link.id, { totalSynergyScore: score, notes })
    setEditing(false)
  }

  return (
    <div className="rounded-[--radius-card] border border-alternate/60 bg-background p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {sourceOk ? (
              <Link
                to={`/app/ideas/${link.sourceIdeaId}`}
                className="text-sm font-semibold text-midnight hover:text-tertiary"
              >
                {ideaTitle(link.sourceIdeaId)}
              </Link>
            ) : (
              <span className="text-sm font-semibold text-tertiary/60">
                {ideaTitle(link.sourceIdeaId)}
              </span>
            )}
            <span className="text-tertiary/40">↔</span>
            {targetOk ? (
              <Link
                to={`/app/ideas/${link.targetIdeaId}`}
                className="text-sm font-semibold text-midnight hover:text-tertiary"
              >
                {ideaTitle(link.targetIdeaId)}
              </Link>
            ) : (
              <span className="text-sm font-semibold text-tertiary/60">
                {ideaTitle(link.targetIdeaId)}
              </span>
            )}
          </div>
          {editing ? (
            <div className="mt-3 space-y-3">
              <SliderField label="Score Synergy" value={score} onChange={setScore} min={1} max={10} />
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Pourquoi ces idées se renforcent…"
              />
              <div className="flex gap-2">
                <Button type="button" onClick={save}>
                  Enregistrer
                </Button>
                <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          ) : link.notes ? (
            <p className="mt-2 text-xs leading-relaxed text-tertiary/70">{link.notes}</p>
          ) : (
            <p className="mt-2 text-xs italic text-tertiary/45">
              Aucune note — ajoute le « pourquoi » du lien.
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tabular-nums text-midnight">{link.totalSynergyScore}</span>
          <SynergyStrengthBadge strength={link.synergyStrength} />
          <Button
            type="button"
            variant="ghost"
            className="h-8 w-8 px-0 text-tertiary/50 hover:text-midnight"
            aria-label="Modifier le lien"
            onClick={() => setEditing((v) => !v)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-8 w-8 px-0 text-tertiary/50 hover:text-red-600"
            aria-label="Supprimer le lien"
            onClick={() => {
              if (confirm('Supprimer ce lien Synergy ?')) onDelete(link.id)
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
