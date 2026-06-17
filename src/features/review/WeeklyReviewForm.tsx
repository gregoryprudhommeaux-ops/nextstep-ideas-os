import * as React from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Field } from '../../components/ui/Field'
import { Textarea } from '../../components/ui/Textarea'
import { useAppStore, EMPTY_WEEKLY_REVIEWS, EMPTY_IDEAS } from '../../app/store'
import { currentWeekLabel } from '../../lib/time'
import { useAIRouterContext } from '../brainstorm/useAIRouterContext'
import { generateWeeklyReviewSummary } from '../ai/router'
import { Link } from 'react-router-dom'

const QUESTIONS = [
  {
    key: 'qStatusChange' as const,
    label: 'What moved this week?',
    hint: 'Any idea that changed status, priority, or direction.',
  },
  {
    key: 'qSynergy' as const,
    label: 'What synergy did you notice?',
    hint: 'Connections between ideas, assets, or audiences.',
  },
  {
    key: 'qDeprioritize' as const,
    label: 'What are you deprioritizing?',
    hint: 'What to pause, archive, or stop thinking about for now.',
  },
]

export function WeeklyReviewForm() {
  const weekLabel = currentWeekLabel()
  const existing = useAppStore((s) => {
    const reviews = s.data?.weeklyReviews ?? EMPTY_WEEKLY_REVIEWS
    return reviews.find((r) => r.weekLabel === weekLabel) ?? null
  })

  return <WeeklyReviewFields key={weekLabel} weekLabel={weekLabel} existing={existing} />
}

function WeeklyReviewFields({
  weekLabel,
  existing,
}: {
  weekLabel: string
  existing: {
    qStatusChange?: string
    qSynergy?: string
    qDeprioritize?: string
    summary?: string
    ideasToExplore?: string[]
    ideasToPause?: string[]
    reflections?: string
  } | null
}) {
  const saveWeeklyReview = useAppStore((s) => s.saveWeeklyReview)
  const ideas = useAppStore((s) => s.data?.ideas ?? EMPTY_IDEAS)
  const ctx = useAIRouterContext()
  const [qStatusChange, setQStatusChange] = React.useState(existing?.qStatusChange ?? '')
  const [qSynergy, setQSynergy] = React.useState(existing?.qSynergy ?? '')
  const [qDeprioritize, setQDeprioritize] = React.useState(existing?.qDeprioritize ?? '')
  const [summary, setSummary] = React.useState(existing?.summary ?? '')
  const [ideasToExplore, setIdeasToExplore] = React.useState(existing?.ideasToExplore ?? [])
  const [ideasToPause, setIdeasToPause] = React.useState(existing?.ideasToPause ?? [])
  const [reflections, setReflections] = React.useState(existing?.reflections ?? '')
  const [saved, setSaved] = React.useState(false)
  const [aiLoading, setAiLoading] = React.useState(false)
  const [aiError, setAiError] = React.useState<string | null>(null)

  const values = { qStatusChange, qSynergy, qDeprioritize }
  const setters = {
    qStatusChange: setQStatusChange,
    qSynergy: setQSynergy,
    qDeprioritize: setQDeprioritize,
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    saveWeeklyReview({ ...values, summary, ideasToExplore, ideasToPause, reflections })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const synthesize = React.useCallback(async () => {
    if (!ctx.isAvailable) return
    setAiLoading(true)
    setAiError(null)
    const answers = { qStatusChange, qSynergy, qDeprioritize }
    try {
      const result = await generateWeeklyReviewSummary(ctx, weekLabel, answers)
      setSummary(result.summary)
      setIdeasToExplore(result.ideasToExplore)
      setIdeasToPause(result.ideasToPause)
      setReflections(result.reflections)
      saveWeeklyReview({
        ...answers,
        summary: result.summary,
        ideasToExplore: result.ideasToExplore,
        ideasToPause: result.ideasToPause,
        reflections: result.reflections,
      })
    } catch (e) {
      setAiError(e instanceof Error ? e.message : 'Erreur synthèse')
    } finally {
      setAiLoading(false)
    }
  }, [ctx, weekLabel, qStatusChange, qSynergy, qDeprioritize, saveWeeklyReview])

  const ideaTitle = (id: string) => ideas.find((i) => i.id === id)?.title ?? id

  return (
    <Card className="p-6">
      <form onSubmit={submit} className="space-y-5">
        <div>
          <div className="text-micro text-tertiary/60">This week</div>
          <div className="mt-1 text-lg font-black text-midnight">{weekLabel}</div>
          <p className="mt-2 text-xs text-tertiary/65">
            Three short answers — archived automatically.
          </p>
        </div>

        {QUESTIONS.map((q) => (
          <Field key={q.key} label={q.label} hint={q.hint}>
            <Textarea
              value={values[q.key]}
              onChange={(e) => setters[q.key](e.target.value)}
              rows={3}
            />
          </Field>
        ))}

        {ctx.isAvailable ? (
          <div className="flex flex-wrap items-center gap-3 border-t border-alternate/50 pt-4">
            <Button type="button" variant="ghost" onClick={() => void synthesize()} disabled={aiLoading}>
              {aiLoading ? 'Steven réfléchit…' : 'Synthétiser avec Steven'}
            </Button>
            {aiError ? <span className="text-sm text-red-600/90">{aiError}</span> : null}
          </div>
        ) : null}

        {summary ? (
          <Card className="border-primary/20 bg-primary/5 p-4">
            <div className="text-micro text-tertiary/60">Synthèse Steven</div>
            <p className="mt-2 text-sm leading-relaxed text-tertiary/85">{summary}</p>
            {ideasToExplore.length > 0 ? (
              <div className="mt-3">
                <div className="text-micro text-tertiary/55">À explorer</div>
                <ul className="mt-1 space-y-1 text-sm">
                  {ideasToExplore.map((id) => (
                    <li key={id}>
                      <Link to={`/app/ideas/${id}`} className="text-midnight hover:underline">
                        {ideaTitle(id)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {ideasToPause.length > 0 ? (
              <div className="mt-3">
                <div className="text-micro text-tertiary/55">À mettre en pause</div>
                <ul className="mt-1 space-y-1 text-sm text-tertiary/75">
                  {ideasToPause.map((id) => (
                    <li key={id}>{ideaTitle(id)}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {reflections ? (
              <p className="mt-3 text-xs italic text-tertiary/70">{reflections}</p>
            ) : null}
          </Card>
        ) : null}

        <Button type="submit">{saved ? 'Saved ✓' : 'Save weekly review'}</Button>
      </form>
    </Card>
  )
}
