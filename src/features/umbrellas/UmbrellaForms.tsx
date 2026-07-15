import * as React from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Field } from '../../components/ui/Field'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { useAppStore, EMPTY_IDEAS } from '../../app/store'

export function CreateUmbrellaForm() {
  const addUmbrella = useAppStore((s) => s.addUmbrella)
  const updateUmbrella = useAppStore((s) => s.updateUmbrella)
  const ideas = useAppStore((s) => s.data?.ideas ?? EMPTY_IDEAS)
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState('')
  const [promise, setPromise] = React.useState('')
  const [tension, setTension] = React.useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    const id = addUmbrella({ name, promise })
    if (tension.trim()) updateUmbrella(id, { tensionNotes: tension.trim() })
    setName('')
    setPromise('')
    setTension('')
    setOpen(false)
  }

  return (
    <div className="space-y-4">
      {!open ? (
        <Button variant="ghost" onClick={() => setOpen(true)}>
          + Créer un Umbrella
        </Button>
      ) : (
        <Card className="p-5">
          <form onSubmit={submit} className="space-y-4">
            <div className="text-micro text-tertiary/60">Nouveau groupe Umbrella</div>
            <Field label="Nom">
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </Field>
            <Field label="Promesse de marque">
              <Textarea value={promise} onChange={(e) => setPromise(e.target.value)} rows={2} />
            </Field>
            <Field label="Notes de tension (optionnel)">
              <Textarea value={tension} onChange={(e) => setTension(e.target.value)} rows={2} />
            </Field>
            <div className="flex gap-2">
              <Button type="submit">Créer</Button>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      )}

      {ideas.length > 0 ? (
        <p className="text-xs text-tertiary/55">
          Assignez les idées depuis chaque carte Umbrella, ou lors de l&apos;édition d&apos;une idée.
        </p>
      ) : null}
    </div>
  )
}

export function UmbrellaAssignSelect({
  umbrellaId,
  ideaIds,
}: {
  umbrellaId: string
  ideaIds: string[]
}) {
  const ideas = useAppStore((s) => s.data?.ideas ?? EMPTY_IDEAS)
  const assignIdeaToUmbrella = useAppStore((s) => s.assignIdeaToUmbrella)
  const unassigned = ideas.filter((i) => !ideaIds.includes(i.id))

  if (!unassigned.length) return null

  return (
    <select
      className="mt-2 h-9 w-full rounded-[--radius-sharp] border border-alternate/70 bg-background px-2 text-xs"
      defaultValue=""
      onChange={(e) => {
        if (e.target.value) assignIdeaToUmbrella(e.target.value, umbrellaId)
        e.target.value = ''
      }}
    >
      <option value="">+ Ajouter une idée au groupe…</option>
      {unassigned.map((i) => (
        <option key={i.id} value={i.id}>
          {i.title}
        </option>
      ))}
    </select>
  )
}
