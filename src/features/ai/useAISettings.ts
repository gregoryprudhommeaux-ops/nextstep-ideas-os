import { useCallback, useEffect, useState } from 'react'
import type { AIProvider, AISettings, AITaskRole } from '../../types/ai'
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
      const defaultKey = settings.providers[settings.defaultAnalysisProvider]?.apiKey?.trim()
      const next: AISettings = {
        ...settings,
        defaultAnalysisProvider:
          result.ok && !defaultKey ? provider : settings.defaultAnalysisProvider,
        providers: {
          ...settings.providers,
          [provider]: {
            apiKey,
            enabled: true,
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

  const saveProviderKey = useCallback(
    async (provider: AIProvider, apiKey: string) => {
      const trimmed = apiKey.trim()
      if (!trimmed) return
      const defaultKey = settings.providers[settings.defaultAnalysisProvider]?.apiKey?.trim()
      const next: AISettings = {
        ...settings,
        defaultAnalysisProvider: !defaultKey ? provider : settings.defaultAnalysisProvider,
        providers: {
          ...settings.providers,
          [provider]: {
            apiKey: trimmed,
            enabled: true,
            lastTestedAt: Date.now(),
          },
        },
      }
      await save(next)
    },
    [settings, save]
  )

  const isTaskAvailable = useCallback(
    (task: AITaskRole) => checkAvailable(settings, task),
    [settings]
  )

  return {
    settings,
    save,
    updateProvider,
    testConnection,
    saveProviderKey,
    loaded,
    isAvailable: checkAvailable(settings),
    isTaskAvailable,
    userId,
  }
}
