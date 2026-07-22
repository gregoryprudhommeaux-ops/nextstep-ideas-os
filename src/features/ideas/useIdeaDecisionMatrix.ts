import { useCallback, useEffect, useState } from 'react'
import type { DecisionMatrix, DecisionMatrixCompetitor, Idea } from '../../types/domain'
import { useAppStore } from '../../app/store'
import { fillDecisionMatrix, resolveProviderForTask } from '../ai/router'
import { useAIRouterContext } from '../brainstorm/useAIRouterContext'
import { nowTimestamp } from '../../lib/time'
import { normalizeProseSpacing } from '../../lib/prose'
import {
  draftDecisionMatrix,
  withComputedMatrixScores,
} from './decisionMatrixScore'

function padCompetitors(list: DecisionMatrixCompetitor[]): DecisionMatrixCompetitor[] {
  const next = [...list]
  while (next.length < 3) next.push({ name: '', revenue: 'unknown' })
  return next.slice(0, 3)
}

export function useIdeaDecisionMatrix(idea: Idea) {
  const ctx = useAIRouterContext()
  const updateIdea = useAppStore((s) => s.updateIdea)
  const [draft, setDraft] = useState<DecisionMatrix>(() =>
    idea.decisionMatrix
      ? withComputedMatrixScores({
          ...idea.decisionMatrix,
          topCompetitors: padCompetitors(idea.decisionMatrix.topCompetitors),
        })
      : draftDecisionMatrix(idea)
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const [manualOpen, setManualOpen] = useState(false)

  useEffect(() => {
    if (dirty) return
    setDraft(
      idea.decisionMatrix
        ? withComputedMatrixScores({
            ...idea.decisionMatrix,
            topCompetitors: padCompetitors(idea.decisionMatrix.topCompetitors),
          })
        : draftDecisionMatrix(idea)
    )
  }, [idea, dirty])

  const isTaskAvailable =
    ctx.loaded && resolveProviderForTask(ctx.settings, 'ideaDecisionMatrix') !== null

  const persist = useCallback(
    (matrix: DecisionMatrix, extras?: { provider?: DecisionMatrix['provider'] }) => {
      const computed = withComputedMatrixScores(matrix)
      const evaluatedAt = nowTimestamp()
      updateIdea(idea.id, {
        decisionMatrix: {
          ...computed,
          evaluatedAt,
          provider: extras?.provider ?? computed.provider,
        },
      })
      setDraft({
        ...computed,
        topCompetitors: padCompetitors(computed.topCompetitors),
        evaluatedAt,
        provider: extras?.provider ?? computed.provider,
      })
      setDirty(false)
      setManualOpen(false)
      return computed
    },
    [idea.id, updateIdea]
  )

  const patch = useCallback((partial: Partial<DecisionMatrix>) => {
    setDirty(true)
    setDraft((prev) =>
      withComputedMatrixScores({
        ...prev,
        ...partial,
        topCompetitors: partial.topCompetitors
          ? padCompetitors(partial.topCompetitors)
          : prev.topCompetitors,
      })
    )
  }, [])

  const patchCompetitor = useCallback((index: number, partial: Partial<DecisionMatrixCompetitor>) => {
    setDirty(true)
    setDraft((prev) => {
      const topCompetitors = padCompetitors(prev.topCompetitors).map((c, i) =>
        i === index ? { ...c, ...partial } : c
      )
      return withComputedMatrixScores({ ...prev, topCompetitors })
    })
  }, [])

  const save = useCallback(() => {
    persist(draft)
  }, [draft, persist])

  const openManual = useCallback(() => {
    setManualOpen(true)
  }, [])

  const runSteven = useCallback(async () => {
    if (!isTaskAvailable) return
    const current =
      useAppStore.getState().data?.ideas.find((i) => i.id === idea.id) ?? idea
    setLoading(true)
    setError(null)
    try {
      const result = await fillDecisionMatrix(ctx, {
        ...current,
        decisionMatrix: dirty || manualOpen ? draft : current.decisionMatrix,
      })
      const provider = resolveProviderForTask(ctx.settings, 'ideaDecisionMatrix')!
      persist(
        {
          niche: result.niche,
          competitorsOver100k: result.competitorsOver100k,
          topCompetitors: padCompetitors(
            result.topCompetitors.map((c) => ({
              name: c.name,
              revenue: c.revenue,
              revenueConfidence: c.revenueConfidence,
              sourceNote: c.sourceNote,
            }))
          ),
          simplicity: result.simplicity,
          noSocial: result.noSocial,
          kiff: result.kiff,
          marketability: result.marketability,
          stevenChallenge: normalizeProseSpacing(result.stevenChallenge),
          stevenNotes: result.stevenNotes
            ? normalizeProseSpacing(result.stevenNotes)
            : undefined,
          scoreTotal: 0,
          evidenceVeto: false,
        },
        { provider }
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de l’évaluation')
    } finally {
      setLoading(false)
    }
  }, [ctx, dirty, draft, idea, isTaskAvailable, manualOpen, persist])

  return {
    draft,
    loading,
    error,
    dirty,
    showForm: Boolean(idea.decisionMatrix) || dirty || manualOpen,
    patch,
    patchCompetitor,
    save,
    openManual,
    runSteven,
    isTaskAvailable,
    loaded: ctx.loaded,
    hasSaved: Boolean(idea.decisionMatrix),
  }
}
