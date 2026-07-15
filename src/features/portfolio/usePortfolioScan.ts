import { useCallback, useState } from 'react'
import { portfolioScan } from '../ai/router'
import { useAIRouterContext } from '../brainstorm/useAIRouterContext'
import { useAppStore } from '../../app/store'

export function usePortfolioScan() {
  const ctx = useAIRouterContext()
  const savePortfolioAnalysis = useAppStore((s) => s.savePortfolioAnalysis)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const scan = useCallback(async (): Promise<string | null> => {
    if (!ctx.isAvailable) return null
    setLoading(true)
    setError(null)
    try {
      const scanResult = await portfolioScan(ctx)
      return savePortfolioAnalysis(scanResult)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors du scan')
      return null
    } finally {
      setLoading(false)
    }
  }, [ctx, savePortfolioAnalysis])

  return { loading, error, scan, isAvailable: ctx.isAvailable, loaded: ctx.loaded }
}
