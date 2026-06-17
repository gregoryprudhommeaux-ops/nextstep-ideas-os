import { useCallback, useState } from 'react'
import type { PortfolioScanResult } from '../../types/ai'
import { portfolioScan } from '../ai/router'
import { useAIRouterContext } from '../brainstorm/useAIRouterContext'

export function usePortfolioScan() {
  const ctx = useAIRouterContext()
  const [result, setResult] = useState<PortfolioScanResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const scan = useCallback(async () => {
    if (!ctx.isAvailable) return
    setLoading(true)
    setError(null)
    try {
      const scanResult = await portfolioScan(ctx)
      setResult(scanResult)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors du scan')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }, [ctx])

  const clear = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return { result, loading, error, scan, clear, isAvailable: ctx.isAvailable, loaded: ctx.loaded }
}
