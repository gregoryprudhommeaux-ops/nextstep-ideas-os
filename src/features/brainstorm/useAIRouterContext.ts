import { useMemo } from 'react'
import { useAppStore } from '../../app/store'
import { useAISettings } from '../ai/useAISettings'
import type { AIRouterContext } from '../ai/router'

export function useAIRouterContext(): AIRouterContext & { loaded: boolean; isAvailable: boolean } {
  const founderProfile = useAppStore((s) => s.data?.founderProfile ?? null)
  const ideas = useAppStore((s) => s.data?.ideas ?? [])
  const umbrellaGroups = useAppStore((s) => s.data?.umbrellaGroups ?? [])
  const steven = useAppStore((s) => s.data?.steven)
  const { settings, loaded, isAvailable } = useAISettings()

  const ctx = useMemo<AIRouterContext>(
    () => ({
      settings,
      steven: steven
        ? {
            customInstructions: steven.customInstructions,
            learnedContext: steven.learnedContext,
          }
        : null,
      founderProfile,
      ideas,
      umbrellaGroups,
    }),
    [settings, steven, founderProfile, ideas, umbrellaGroups]
  )

  return { ...ctx, loaded, isAvailable }
}
