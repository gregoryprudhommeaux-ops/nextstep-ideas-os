import { Timestamp } from 'firebase/firestore'
import type { StevenConfig } from './types'
import { STEVEN_BASE_SYSTEM_PROMPT, STEVEN_PROMPT_VERSION } from './stevenSystemPrompt'

export { STEVEN_BASE_SYSTEM_PROMPT, STEVEN_PROMPT_VERSION }

export type StevenPromptInput = Pick<StevenConfig, 'customInstructions' | 'learnedContext'>

export function createDefaultStevenConfig(): StevenConfig {
  return {
    customInstructions: '',
    learnedContext: '',
    lastEvolution: null,
    createdAt: Timestamp.now(),
  }
}

function appendSection(parts: string[], section: string | undefined): void {
  const text = section?.trim()
  if (text) parts.push(section!)
}

/**
 * Full system prompt sent to the LLM: base persona + learned context + manual notes.
 */
export function buildStevenSystemPrompt(
  config?: StevenPromptInput | string | null
): string {
  const input: StevenPromptInput =
    typeof config === 'string'
      ? { customInstructions: config, learnedContext: '' }
      : {
          customInstructions: config?.customInstructions ?? '',
          learnedContext: config?.learnedContext ?? '',
        }

  const parts: string[] = [STEVEN_BASE_SYSTEM_PROMPT]

  appendSection(
    parts,
    input.learnedContext
      ? `---

## Contexte appris sur le fondateur (mis à jour automatiquement)

Ce bloc synthétise ce que tu as appris sur cette personne au fil des échanges — personnalité, capacités, préférences, patterns de portfolio. Utilise-le pour personnaliser chaque analyse.

${input.learnedContext.trim()}`
      : undefined
  )

  appendSection(
    parts,
    input.customInstructions
      ? `---

## Instructions supplémentaires (manuel)

Ajoutées par le fondateur dans les réglages. Intègre-les lorsqu'elles sont compatibles avec ton rôle.

${input.customInstructions.trim()}`
      : undefined
  )

  return parts.join('\n\n')
}

export function getStevenBrainSnapshot(config: StevenConfig | null | undefined) {
  const normalized = {
    customInstructions: config?.customInstructions ?? '',
    learnedContext: config?.learnedContext ?? '',
  }
  return {
    version: STEVEN_PROMPT_VERSION,
    basePrompt: STEVEN_BASE_SYSTEM_PROMPT,
    customInstructions: normalized.customInstructions,
    learnedContext: normalized.learnedContext,
    lastEvolution: config?.lastEvolution ?? null,
    fullPrompt: buildStevenSystemPrompt(normalized),
  }
}
