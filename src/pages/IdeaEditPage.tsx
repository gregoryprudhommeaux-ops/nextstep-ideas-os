import { Link, useNavigate, useParams } from 'react-router-dom'
import * as React from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Field } from '../components/ui/Field'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Select } from '../components/ui/Select'
import { SliderField } from '../components/ui/SliderField'
import { SectionHeader } from '../components/SectionHeader'
import { useAppStore, useIdeaScore, EMPTY_UMBRELLA_GROUPS } from '../app/store'
import type { Idea, IdeaCategory, IdeaStatus, HorizonType, ScoreDimension } from '../types/domain'
import { categoryLabels, horizonLabels, statusLabels } from '../lib/labels'
import { dimensionMeta, penaltyDimensions, positiveDimensions } from '../features/scoring/dimensions'
import { ScorePill } from '../components/score/ScorePill'
import { InspirationEditor } from '../features/ideas/InspirationEditor'

const categories = Object.keys(categoryLabels) as IdeaCategory[]
const statuses = Object.keys(statusLabels) as IdeaStatus[]
const horizons = Object.keys(horizonLabels) as HorizonType[]

const scoreFields: ScoreDimension[] = [...positiveDimensions, ...penaltyDimensions]

export function IdeaEditPage() {
  const { ideaId } = useParams()
  const idea = useAppStore((s) => s.data?.ideas.find((i) => i.id === ideaId) ?? null)

  if (!idea) {
    return (
      <Card className="p-6">
        <div className="text-sm text-tertiary/70">Idea not found.</div>
        <Link to="/app/ideas" className="mt-3 inline-block text-sm text-tertiary hover:text-midnight">
          ← Back to board
        </Link>
      </Card>
    )
  }

  return <IdeaEditForm key={idea.id} idea={idea} />
}

function IdeaEditForm({ idea }: { idea: Idea }) {
  const navigate = useNavigate()
  const updateIdea = useAppStore((s) => s.updateIdea)
  const deleteIdea = useAppStore((s) => s.deleteIdea)
  const umbrellas = useAppStore((s) => s.data?.umbrellaGroups ?? EMPTY_UMBRELLA_GROUPS)
  const assignIdeaToUmbrella = useAppStore((s) => s.assignIdeaToUmbrella)
  const score = useIdeaScore(idea.id)

  const [draft, setDraft] = React.useState<Idea>({ ...idea })

  const patch = (p: Partial<Idea>) => setDraft((d) => (d ? { ...d, ...p } : d))

  const save = () => {
    const { id, createdAt, ...rest } = draft
    void id
    void createdAt
    updateIdea(idea.id, rest)
    navigate(`/app/ideas/${idea.id}`)
  }

  const umbrellaValue =
    umbrellas.find((u) => u.ideaIds.includes(idea.id))?.id ?? draft.umbrellaGroupId ?? ''

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <SectionHeader
        eyebrow="Step 2–3"
        title="Develop your idea"
        description="Complete the strategic brief, then tune your subjective scores."
        action={score ? <ScorePill score={score.weightedScore} /> : null}
      />

      <Card className="space-y-4 p-6">
        <div className="text-micro text-tertiary/60">Basics</div>
        <Field label="Title">
          <Input value={draft.title} onChange={(e) => patch({ title: e.target.value })} />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Category">
            <Select
              value={draft.category}
              onChange={(e) => patch({ category: e.target.value as IdeaCategory })}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {categoryLabels[c]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status">
            <Select
              value={draft.status}
              onChange={(e) => patch({ status: e.target.value as IdeaStatus })}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {statusLabels[s]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Horizon">
            <Select
              value={draft.horizon}
              onChange={(e) => patch({ horizon: e.target.value as HorizonType })}
            >
              {horizons.map((h) => (
                <option key={h} value={h}>
                  {horizonLabels[h]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Card>

      <Card className="space-y-4 p-6">
        <div className="text-micro text-tertiary/60">Inspiration sources</div>
        <InspirationEditor
          value={draft.inspirations ?? []}
          onChange={(inspirations) => patch({ inspirations })}
        />
      </Card>

      <Card className="space-y-4 p-6">
        <div className="text-micro text-tertiary/60">Strategic brief</div>
        <Field label="Why now">
          <Textarea value={draft.whyNow ?? ''} onChange={(e) => patch({ whyNow: e.target.value })} />
        </Field>
        <Field label="Who for (audience)">
          <Textarea value={draft.audience ?? ''} onChange={(e) => patch({ audience: e.target.value })} />
        </Field>
        <Field label="Revenue model note" hint="How could this make money?">
          <Textarea
            value={draft.strategicNotes ?? ''}
            onChange={(e) => patch({ strategicNotes: e.target.value })}
          />
        </Field>
        <Field label="Key risk">
          <Textarea value={draft.risks ?? ''} onChange={(e) => patch({ risks: e.target.value })} />
        </Field>
        <Field label="Personal alignment note">
          <Textarea
            value={draft.oneLiner ?? ''}
            onChange={(e) => patch({ oneLiner: e.target.value })}
            placeholder="Why does this matter to you?"
          />
        </Field>
        <Field label="First test">
          <Textarea value={draft.firstTest ?? ''} onChange={(e) => patch({ firstTest: e.target.value })} />
        </Field>
        <Field label="Next step">
          <Textarea value={draft.nextStep ?? ''} onChange={(e) => patch({ nextStep: e.target.value })} />
        </Field>
      </Card>

      <Card className="space-y-4 p-6">
        <div className="text-micro text-tertiary/60">Your scores (1–10)</div>
        <p className="text-xs text-tertiary/60">
          Subjective — adjust until the ranking feels right for you.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {scoreFields.map((key) => {
            const meta = dimensionMeta[key]
            const val = draft[key]
            if (typeof val === 'boolean') {
              return (
                <label key={key} className="flex items-center gap-2 text-sm text-tertiary/80">
                  <input
                    type="checkbox"
                    checked={val}
                    onChange={(e) => patch({ [key]: e.target.checked } as Partial<Idea>)}
                  />
                  {meta.label}
                </label>
              )
            }
            return (
              <SliderField
                key={key}
                label={meta.label}
                value={val as number}
                onChange={(n) => patch({ [key]: n } as Partial<Idea>)}
                hint={meta.kind === 'penalty' ? 'Higher = more penalty' : undefined}
              />
            )
          })}
        </div>
      </Card>

      {umbrellas.length > 0 ? (
        <Card className="space-y-3 p-6">
          <div className="text-micro text-tertiary/60">Umbrella</div>
          <Select
            value={umbrellaValue}
            onChange={(e) => {
              const v = e.target.value
              assignIdeaToUmbrella(idea.id, v || null)
              patch({ umbrellaGroupId: v || null })
            }}
          >
            <option value="">No umbrella</option>
            {umbrellas.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>
        </Card>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Button onClick={save}>Save idea</Button>
          <Link to={`/app/ideas/${idea.id}`}>
            <Button variant="ghost">Cancel</Button>
          </Link>
        </div>
        <Button
          variant="ghost"
          className="text-tertiary/70"
          onClick={() => {
            if (confirm('Delete this idea?')) {
              deleteIdea(idea.id)
              navigate('/app/ideas')
            }
          }}
        >
          Delete
        </Button>
      </div>
    </div>
  )
}
