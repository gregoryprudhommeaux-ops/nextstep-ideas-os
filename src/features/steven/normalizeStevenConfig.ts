import type { StevenConfig } from './types'
import { createDefaultStevenConfig } from './stevenBrain'

/** Ensure Steven config has all fields after schema migrations. */
export function normalizeStevenConfig(config?: StevenConfig | null): StevenConfig {
  const defaults = createDefaultStevenConfig()
  if (!config) return defaults
  return {
    ...defaults,
    ...config,
    customInstructions: config.customInstructions ?? '',
    learnedContext: config.learnedContext ?? '',
    lastEvolution: config.lastEvolution ?? null,
  }
}
