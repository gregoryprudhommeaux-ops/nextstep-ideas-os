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
        <div className="text-sm text-tertiary/70">Idée introuvable.</div>
        <Link to="/app/ideas" className="mt-3 inline-block text-sm text-tertiary hover:text-midnight">
          ← Retour à la carte
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
        eyebrow="Étapes 2–3"
        title="Développer votre idée"
        description="Complétez le brief stratégique, puis ajustez vos scores subjectifs."
        action={score ? <ScorePill score={score.weightedScore} /> : null}
      />

      <Card className="space-y-4 p-6">
        <div className="text-micro text-tertiary/60">Essentiel</div>
        <Field label="Titre">
          <Input value={draft.title} onChange={(e) => patch({ title: e.target.value })} />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Catégorie">
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
          <Field label="Statut">
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
        <div className="text-micro text-tertiary/60">Documents & liens</div>
        <p className="text-xs text-tertiary/60">
          PDF, deck, site ou article — utile pour Steven et pour toi plus tard.
        </p>
        <InspirationEditor
          mode="attachment"
          value={draft.inspirations ?? []}
          onChange={(inspirations) => patch({ inspirations })}
        />
      </Card>

      <Card className="space-y-4 p-6">
        <div className="text-micro text-tertiary/60">Brief stratégique</div>
        <Field label="Pourquoi maintenant">
          <Textarea value={draft.whyNow ?? ''} onChange={(e) => patch({ whyNow: e.target.value })} />
        </Field>
        <Field label="Pour qui (cible)">
          <Textarea value={draft.audience ?? ''} onChange={(e) => patch({ audience: e.target.value })} />
        </Field>
        <Field label="Note sur le modèle de revenu" hint="Comment cela pourrait-il générer des revenus ?">
          <Textarea
            value={draft.strategicNotes ?? ''}
            onChange={(e) => patch({ strategicNotes: e.target.value })}
          />
        </Field>
        <Field label="Risque clé">
          <Textarea value={draft.risks ?? ''} onChange={(e) => patch({ risks: e.target.value })} />
        </Field>
        <Field label="Note d&apos;alignement personnel">
          <Textarea
            value={draft.oneLiner ?? ''}
            onChange={(e) => patch({ oneLiner: e.target.value })}
            placeholder="Pourquoi cela compte-t-il pour vous ?"
          />
        </Field>
        <Field label="Premier test">
          <Textarea value={draft.firstTest ?? ''} onChange={(e) => patch({ firstTest: e.target.value })} />
        </Field>
        <Field label="Prochaine étape">
          <Textarea value={draft.nextStep ?? ''} onChange={(e) => patch({ nextStep: e.target.value })} />
        </Field>
      </Card>

      <Card className="space-y-4 p-6">
        <div className="text-micro text-tertiary/60">Vos scores (1–10)</div>
        <p className="text-xs text-tertiary/60">
          Subjectif — ajustez jusqu&apos;à ce que le classement vous semble juste.
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
                hint={meta.kind === 'penalty' ? 'Plus élevé = pénalité plus forte' : undefined}
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
            <option value="">Aucun Umbrella</option>
            {umbrellas.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>
        </Card>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={save} className="w-full sm:w-auto">
            Enregistrer l&apos;idée
          </Button>
          <Link to={`/app/ideas/${idea.id}`} className="w-full sm:w-auto">
            <Button variant="ghost" className="w-full">
              Annuler
            </Button>
          </Link>
        </div>
        <Button
          variant="ghost"
          className="w-full text-red-700 hover:bg-red-50 hover:text-red-800 sm:w-auto"
          onClick={() => {
            if (
              confirm(
                'Supprimer définitivement cette idée ? Toutes ses données, synergies et notes seront effacées. Action irréversible.'
              )
            ) {
              deleteIdea(idea.id)
              navigate('/app/ideas')
            }
          }}
        >
          Supprimer
        </Button>
      </div>
    </div>
  )
}
