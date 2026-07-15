import { useCallback, useState } from 'react'
import type { Idea } from '../../types/domain'
import { refineIdea, resolveProviderForTask } from '../ai/router'
import { useAIRouterContext } from '../brainstorm/useAIRouterContext'
import { useAppStore } from '../../app/store'
import {
  buildNotesOnlyRefinement,
  buildRefinementEntry,
  hasRefinementInput,
  patchIdeaFromRefinement,
} from './applyRefinement'

export function useIdeaRefinement(idea: Idea) {
  const ctx = useAIRouterContext()
  const updateIdea = useAppStore((s) => s.updateIdea)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastChangeSummary, setLastChangeSummary] = useState<string[] | null>(null)

  const canSubmit = hasRefinementInput(notes)
  const isTaskAvailable = ctx.loaded && resolveProviderForTask(ctx.settings, 'refineThought') !== null

  const appendRefinement = useCallback(
    (entry: NonNullable<Idea['refinements']>[number]) => {
      updateIdea(idea.id, {
        refinements: [...(idea.refinements ?? []), entry],
      })
    },
    [idea.id, idea.refinements, updateIdea]
  )

  const saveNotes = useCallback(async () => {
    if (!canSubmit) return
    setSaving(true)
    setError(null)
    try {
      appendRefinement(buildNotesOnlyRefinement(notes))
      setNotes('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de l’enregistrement')
    } finally {
      setSaving(false)
    }
  }, [appendRefinement, canSubmit, notes])

  const refineWithAI = useCallback(async () => {
    if (!canSubmit || !isTaskAvailable) return
    const current =
      useAppStore.getState().data?.ideas.find((i) => i.id === idea.id) ?? idea
    if (!current) return
    setLoading(true)
    setError(null)
    setLastChangeSummary(null)
    try {
      const provider = resolveProviderForTask(ctx.settings, 'refineThought')!
      const result = await refineIdea(ctx, current, notes)
      const entry = buildRefinementEntry(notes, result, provider)
      updateIdea(current.id, {
        ...patchIdeaFromRefinement(current, result, provider),
        refinements: [...(current.refinements ?? []), entry],
      })
      setLastChangeSummary(result.changeSummary)
      setNotes('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de l’affinement')
    } finally {
      setLoading(false)
    }
  }, [canSubmit, ctx, idea, notes, isTaskAvailable, updateIdea])

  return {
    notes,
    setNotes,
    saveNotes,
    refineWithAI,
    loading,
    saving,
    error,
    canSubmit,
    isTaskAvailable,
    loaded: ctx.loaded,
    lastChangeSummary,
  }
}
