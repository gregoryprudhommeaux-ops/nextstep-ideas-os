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
  const [category, setCategory] = React.useState<IdeaCategory>('saasAi')
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
        eyebrow="Step 1"
        title="Capture an idea"
        description="Capture the core idea, then attach what inspired it — links, decks, chats, voice notes."
      />

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Title" hint="Short, decisive name">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Local founder newsletter"
              autoFocus
              required
            />
          </Field>

          <Field label="Description" hint="One paragraph — what is it?">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What problem does this solve?"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Category">
              <Select value={category} onChange={(e) => setCategory(e.target.value as IdeaCategory)}>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {categoryLabels[c]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Status">
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
              label="What inspired this?"
              hint="Websites, Google Slides, PDFs, chat excerpts, screenshot links, or voice note URLs."
            >
              <InspirationEditor value={inspirations} onChange={setInspirations} />
            </Field>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="submit" disabled={!title.trim()}>
              Save & continue
            </Button>
            <Link to="/app/ideas">
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  )
}
