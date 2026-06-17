import { useCallback, useEffect, useState } from 'react'
import type { AIProvider, AISettings } from '../../types/ai'
import { DEFAULT_AI_SETTINGS } from '../../types/ai'
import { loadAISettings, saveAISettings } from './keyStorage'
import { isAIAvailable as checkAvailable } from './router'
import { testProvider } from './providers'
import { useAuth } from '../auth/useAuth'

export function useAISettings() {
  const { user } = useAuth()
  const userId = user?.uid ?? 'local'
  const [settings, setSettings] = useState<AISettings>(DEFAULT_AI_SETTINGS)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    loadAISettings(userId).then((s) => {
      if (!cancelled) {
        setSettings(s)
        setLoaded(true)
      }
    })
    return () => {
      cancelled = true
    }
  }, [userId])

  const save = useCallback(
    async (next: AISettings) => {
      await saveAISettings(next, userId)
      setSettings(next)
    },
    [userId]
  )

  const updateProvider = useCallback(
    async (provider: AIProvider, patch: Partial<AISettings['providers'][AIProvider]>) => {
      const current = settings.providers[provider] ?? { apiKey: '', enabled: false }
      const next: AISettings = {
        ...settings,
        providers: {
          ...settings.providers,
          [provider]: { ...current, ...patch },
        },
      }
      await save(next)
    },
    [settings, save]
  )

  const testConnection = useCallback(
    async (provider: AIProvider, apiKey: string) => {
      const result = await testProvider(provider, apiKey)
      const next: AISettings = {
        ...settings,
        providers: {
          ...settings.providers,
          [provider]: {
            apiKey,
            enabled: result.ok,
            lastTestedAt: Date.now(),
            lastTestStatus: result.ok ? 'ok' : 'error',
          },
        },
      }
      await save(next)
      return result
    },
    [settings, save]
  )

  return {
    settings,
    save,
    updateProvider,
    testConnection,
    loaded,
    isAvailable: checkAvailable(settings),
    userId,
  }
}
