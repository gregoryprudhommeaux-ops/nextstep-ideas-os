import * as React from 'react'
import type { Idea } from '../../types/domain'
import { useAppStore } from '../../app/store'
import { analyzeIdea, getProviderForTask } from '../ai/router'
import { useAIRouterContext } from '../brainstorm/useAIRouterContext'
import { ideaAnalysisText, patchIdeaFromAnalysis } from '../scoring/dimensionScores'

export function useIdeaStrategicAnalysis(idea: Idea) {
  const updateIdea = useAppStore((s) => s.updateIdea)
  const ctx = useAIRouterContext()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const refresh = React.useCallback(async () => {
    if (!ctx.isAvailable) {
      setError('Clé API requise — configure Settings.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { title, description } = ideaAnalysisText(idea)
      const analysis = await analyzeIdea(ctx, title, description)
      const provider = getProviderForTask(ctx.settings, 'analyzeIdea')
      updateIdea(idea.id, patchIdeaFromAnalysis(idea, analysis, provider))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de l’analyse')
    } finally {
      setLoading(false)
    }
  }, [ctx, idea, updateIdea])

  return {
    refresh,
    loading,
    error,
    isAvailable: ctx.loaded && ctx.isAvailable,
  }
}
