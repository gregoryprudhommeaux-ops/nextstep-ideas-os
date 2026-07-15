import * as React from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Field } from '../../components/ui/Field'
import { Select } from '../../components/ui/Select'
import { Textarea } from '../../components/ui/Textarea'
import { SliderField } from '../../components/ui/SliderField'
import { useAppStore, EMPTY_IDEAS } from '../../app/store'

export function AddSynergyForm({
  defaultSourceId,
  defaultOpen = false,
  onClose,
}: {
  defaultSourceId?: string
  defaultOpen?: boolean
  onClose?: () => void
} = {}) {
  const ideas = useAppStore((s) => s.data?.ideas ?? EMPTY_IDEAS)
  const addSynergyLink = useAppStore((s) => s.addSynergyLink)
  const [open, setOpen] = React.useState(defaultOpen)
  const [source, setSource] = React.useState(defaultSourceId ?? '')
  const [target, setTarget] = React.useState('')
  const [score, setScore] = React.useState(7)
  const [notes, setNotes] = React.useState('')

  if (ideas.length < 2) return null

  React.useEffect(() => {
    if (defaultSourceId) setSource(defaultSourceId)
  }, [defaultSourceId])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!source || !target || source === target) return
    addSynergyLink({ sourceIdeaId: source, targetIdeaId: target, totalSynergyScore: score, notes })
    setSource('')
    setTarget('')
    setScore(7)
    setNotes('')
    setOpen(false)
    onClose?.()
  }

  if (!open) {
    return (
      <Button
        variant="ghost"
        onClick={() => {
          setOpen(true)
          if (defaultSourceId) setSource(defaultSourceId)
        }}
      >
        + Relier deux idées
      </Button>
    )
  }

  return (
    <Card className="p-5">
      <form onSubmit={submit} className="space-y-4">
        <div className="text-micro text-tertiary/60">Nouveau lien Synergy</div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Idée A">
            <Select value={source} onChange={(e) => setSource(e.target.value)} required>
              <option value="">Sélectionner…</option>
              {ideas.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.title}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Idée B">
            <Select value={target} onChange={(e) => setTarget(e.target.value)} required>
              <option value="">Sélectionner…</option>
              {ideas.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.title}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <SliderField label="Score Synergy" value={score} onChange={setScore} min={1} max={10} />
        <Field label="Pourquoi elles se connectent">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </Field>
        <div className="flex gap-2">
          <Button type="submit">Ajouter le lien</Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setOpen(false)
              onClose?.()
            }}
          >
            Annuler
          </Button>
        </div>
      </form>
    </Card>
  )
}
