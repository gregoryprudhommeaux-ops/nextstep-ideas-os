import * as React from 'react'
import { useAppStore, EMPTY_IDEAS, EMPTY_UMBRELLA_GROUPS } from '../../app/store'
import { analyzeIdea, getProviderForTask } from '../ai/router'
import { buildPortfolioContext } from '../ai/prompts/context'
import { useAIRouterContext } from '../brainstorm/useAIRouterContext'
import {
  hasPlaceholderStrategicScores,
  ideaAnalysisText,
  patchIdeaFromAnalysis,
} from '../scoring/dimensionScores'

type RefreshScope = 'placeholder' | 'all'

const BATCH_DELAY_MS = 900
const AUTO_REFRESH_SESSION_KEY = 'portfolio-placeholder-score-refresh'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function usePortfolioScoreRefresh() {
  const ideas = useAppStore((s) => s.data?.ideas ?? EMPTY_IDEAS)
  const umbrellaGroups = useAppStore((s) => s.data?.umbrellaGroups ?? EMPTY_UMBRELLA_GROUPS)
  const updateIdea = useAppStore((s) => s.updateIdea)
  const ctx = useAIRouterContext()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [progress, setProgress] = React.useState<{ done: number; total: number; title?: string } | null>(
    null
  )

  const targets = React.useMemo(
    () => ideas.filter((idea) => hasPlaceholderStrategicScores(idea)),
    [ideas]
  )

  const portfolioContext = React.useMemo(
    () => buildPortfolioContext(ideas, umbrellaGroups),
    [ideas, umbrellaGroups]
  )

  const refresh = React.useCallback(
    async (scope: RefreshScope = 'placeholder') => {
      if (!ctx.isAvailable) {
        setError('Clé API requise — configure Settings.')
        return
      }
      const list = scope === 'all' ? ideas : targets
      if (list.length === 0) {
        setError('Aucune idée à mettre à jour.')
        return
      }

      setLoading(true)
      setError(null)
      setProgress({ done: 0, total: list.length })

      const provider = getProviderForTask(ctx.settings, 'analyzeIdea')
      const failures: string[] = []

      try {
        for (let i = 0; i < list.length; i++) {
          const idea = list[i]
          setProgress({ done: i, total: list.length, title: idea.title })
          try {
            const { title, description } = ideaAnalysisText(idea)
            const analysis = await analyzeIdea(ctx, title, description, { portfolioContext })
            updateIdea(idea.id, patchIdeaFromAnalysis(idea, analysis, provider))
          } catch (e) {
            failures.push(idea.title)
            console.error(`Score refresh failed for ${idea.id}`, e)
          }
          setProgress({ done: i + 1, total: list.length, title: idea.title })
          if (i < list.length - 1) await sleep(BATCH_DELAY_MS)
        }

        if (failures.length === list.length) {
          setError('Impossible de mettre à jour les scores — vérifie ta clé API.')
        } else if (failures.length > 0) {
          setError(`${failures.length} idée(s) en échec : ${failures.slice(0, 3).join(', ')}${failures.length > 3 ? '…' : ''}`)
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur lors de la mise à jour')
      } finally {
        setLoading(false)
        setProgress(null)
      }
    },
    [ctx, ideas, targets, portfolioContext, updateIdea]
  )

  const autoRefreshPlaceholders = React.useCallback(() => {
    if (!ctx.loaded || !ctx.isAvailable || targets.length === 0 || loading) return
    if (sessionStorage.getItem(AUTO_REFRESH_SESSION_KEY)) return
    sessionStorage.setItem(AUTO_REFRESH_SESSION_KEY, '1')
    void refresh('placeholder')
  }, [ctx.loaded, ctx.isAvailable, targets.length, loading, refresh])

  return {
    refresh,
    autoRefreshPlaceholders,
    loading,
    error,
    progress,
    placeholderCount: targets.length,
    isAvailable: ctx.loaded && ctx.isAvailable,
  }
}
