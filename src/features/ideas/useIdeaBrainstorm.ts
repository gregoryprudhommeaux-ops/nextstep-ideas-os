import { useCallback, useState } from 'react'
import type { Idea, IdeaBrainstormMessage } from '../../types/domain'
import { useAppStore } from '../../app/store'
import {
  applyBrainstormToIdea,
  resolveProviderForTask,
  sendIdeaBrainstormMessage,
} from '../ai/router'
import { useAIRouterContext } from '../brainstorm/useAIRouterContext'
import { newId } from '../../lib/id'
import { nowTimestamp } from '../../lib/time'
import { normalizeProseSpacing } from '../../lib/prose'
import {
  buildRefinementEntry,
  patchIdeaFromRefinement,
} from './applyRefinement'

export const IDEA_BRAINSTORM_QUICK_PROMPTS = [
  {
    label: 'PRD complet',
    message:
      'Rédige un PRD Markdown complet pour cette idée : problème, utilisateurs, proposition de valeur, scope MVP, métriques, risques et roadmap 90 jours.',
  },
  {
    label: 'Prompt Cursor',
    message:
      'Génère un prompt Markdown prêt à coller dans Cursor pour implémenter un MVP de cette idée (contexte, stack suggérée, tâches, critères de done).',
  },
  {
    label: 'Plan de validation',
    message:
      'Propose un plan de validation en Markdown : hypothèses clés, expériences terrain, signaux go/no-go, sur 4 semaines.',
  },
] as const

function buildMessage(role: IdeaBrainstormMessage['role'], content: string, provider?: IdeaBrainstormMessage['provider']): IdeaBrainstormMessage {
  const now = nowTimestamp()
  return {
    id: newId('bsm'),
    role,
    content: normalizeProseSpacing(content),
    provider,
    createdAt: now,
    updatedAt: now,
  }
}

export function useIdeaBrainstorm(idea: Idea) {
  const ctx = useAIRouterContext()
  const updateIdea = useAppStore((s) => s.updateIdea)
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastChangeSummary, setLastChangeSummary] = useState<string[] | null>(null)

  const thread = idea.brainstormThread ?? []
  const isTaskAvailable =
    ctx.loaded && resolveProviderForTask(ctx.settings, 'ideaBrainstorm') !== null
  const isSyncAvailable =
    ctx.loaded && resolveProviderForTask(ctx.settings, 'refineThought') !== null
  const canSend = Boolean(draft.trim()) && !loading && !syncing
  const canSyncToProject = thread.length > 0 && !loading && !syncing

  const sendMessage = useCallback(
    async (text: string) => {
      const message = text.trim()
      if (!message || !isTaskAvailable) return

      const current =
        useAppStore.getState().data?.ideas.find((i) => i.id === idea.id) ?? idea
      const history = current.brainstormThread ?? []
      const userMsg = buildMessage('user', message)

      updateIdea(idea.id, { brainstormThread: [...history, userMsg] })
      setDraft('')
      setLoading(true)
      setError(null)

      try {
        const { content, provider } = await sendIdeaBrainstormMessage(
          ctx,
          current,
          history,
          message
        )
        const latest =
          useAppStore.getState().data?.ideas.find((i) => i.id === idea.id) ?? current
        const latestThread = latest.brainstormThread ?? [...history, userMsg]
        const assistantMsg = buildMessage('assistant', content, provider)
        updateIdea(idea.id, { brainstormThread: [...latestThread, assistantMsg] })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur lors de l’échange')
        setDraft(message)
      } finally {
        setLoading(false)
      }
    },
    [ctx, idea, isTaskAvailable, updateIdea]
  )

  const clearThread = useCallback(() => {
    if (!confirm('Effacer toute la conversation de brainstorming sur cette idée ?')) return
    updateIdea(idea.id, { brainstormThread: [] })
    setError(null)
    setLastChangeSummary(null)
  }, [idea.id, updateIdea])

  const syncToProject = useCallback(async () => {
    if (!canSyncToProject || !isSyncAvailable) return

    const current =
      useAppStore.getState().data?.ideas.find((i) => i.id === idea.id) ?? idea
    const history = current.brainstormThread ?? []
    if (history.length === 0) return

    setSyncing(true)
    setError(null)
    setLastChangeSummary(null)

    try {
      const provider = resolveProviderForTask(ctx.settings, 'refineThought')!
      const result = await applyBrainstormToIdea(ctx, current, history)
      const entry = buildRefinementEntry(
        'Synchronisation depuis le brainstorming avec Steven',
        result,
        provider
      )
      updateIdea(current.id, {
        ...patchIdeaFromRefinement(current, result, provider),
        refinements: [...(current.refinements ?? []), entry],
      })
      setLastChangeSummary(result.changeSummary)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la mise à jour du projet')
    } finally {
      setSyncing(false)
    }
  }, [canSyncToProject, ctx, idea, isSyncAvailable, updateIdea])

  return {
    thread,
    draft,
    setDraft,
    sendMessage,
    clearThread,
    syncToProject,
    loading,
    syncing,
    error,
    canSend,
    canSyncToProject,
    isTaskAvailable,
    isSyncAvailable,
    lastChangeSummary,
    loaded: ctx.loaded,
  }
}
