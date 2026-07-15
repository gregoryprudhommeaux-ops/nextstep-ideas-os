import { Link, useNavigate } from 'react-router-dom'
import * as React from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Field } from '../components/ui/Field'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Select } from '../components/ui/Select'
import { SectionHeader } from '../components/SectionHeader'
import { useAppStore } from '../app/store'
import { InspirationEditor } from '../features/ideas/InspirationEditor'
import type { IdeaCategory, IdeaStatus, HorizonType, IdeaInspiration } from '../types/domain'
import { categoryLabels, horizonLabels, statusLabels } from '../lib/labels'

const categories = Object.keys(categoryLabels) as IdeaCategory[]
const statuses = Object.keys(statusLabels) as IdeaStatus[]
const horizons = Object.keys(horizonLabels) as HorizonType[]

export function IdeaNewPage() {
  const navigate = useNavigate()
  const addIdea = useAppStore((s) => s.addIdea)
  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [category, setCategory] = React.useState<IdeaCategory>('service')
  const [status, setStatus] = React.useState<IdeaStatus>('inbox')
  const [horizon, setHorizon] = React.useState<HorizonType>('3_12m')
  const [inspirations, setInspirations] = React.useState<IdeaInspiration[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    const id = addIdea({ title, description, category, status, horizon, inspirations })
    navigate(`/app/ideas/${id}/edit`)
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <SectionHeader
        eyebrow="Étape 1"
        title="Capturer une idée"
        description="Saisis l'idée de base, puis attache ce qui l'a inspirée — liens, decks, chats, notes vocales."
      />

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Titre" hint="Nom court et décisif">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex. Newsletter locale pour fondateurs"
              autoFocus
              required
            />
          </Field>

          <Field label="Description" hint="Un paragraphe — de quoi s'agit-il ?">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Quel problème cela résout-il ?"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Catégorie">
              <Select value={category} onChange={(e) => setCategory(e.target.value as IdeaCategory)}>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {categoryLabels[c]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Statut">
              <Select value={status} onChange={(e) => setStatus(e.target.value as IdeaStatus)}>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {statusLabels[s]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Horizon">
              <Select value={horizon} onChange={(e) => setHorizon(e.target.value as HorizonType)}>
                {horizons.map((h) => (
                  <option key={h} value={h}>
                    {horizonLabels[h]}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="border-t border-alternate/50 pt-4">
            <Field
              label="Qu'est-ce qui a inspiré l'idée ?"
              hint="Sites web, Google Slides, PDF, extraits de chat, liens de captures d'écran ou notes vocales."
            >
              <InspirationEditor value={inspirations} onChange={setInspirations} />
            </Field>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="submit" disabled={!title.trim()}>
              Enregistrer et continuer
            </Button>
            <Link to="/app/ideas">
              <Button type="button" variant="ghost">
                Annuler
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  )
}
