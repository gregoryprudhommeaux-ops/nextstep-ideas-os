import { useCallback, useState } from 'react'
import type { MarketResearchResult } from '../../types/ai'
import { marketResearch } from '../ai/router'
import { useAIRouterContext } from '../brainstorm/useAIRouterContext'
import { useAppStore } from '../../app/store'
import { nowTimestamp } from '../../lib/time'

export function useMarketResearch(ideaId: string, query: string) {
  const ctx = useAIRouterContext()
  const updateIdea = useAppStore((s) => s.updateIdea)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async () => {
    if (!ctx.isAvailable || !query.trim()) return
    setLoading(true)
    setError(null)
    try {
      const result: MarketResearchResult = await marketResearch(ctx, query)
      updateIdea(ideaId, {
        marketResearch: { ...result, researchedAt: nowTimestamp() },
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur recherche marché')
    } finally {
      setLoading(false)
    }
  }, [ctx, ideaId, query, updateIdea])

  return { run, loading, error, isAvailable: ctx.isAvailable, loaded: ctx.loaded }
}
