import type { AIProvider } from '../../../types/ai'
import type { ChatMessage } from './base'
import { openaiChat, testOpenAI } from './openai'
import { geminiChat, testGemini } from './gemini'
import { perplexityChat, testPerplexity } from './perplexity'
import { anthropicChat, testAnthropic, isAnthropicRelayConfigured } from './anthropic'

export type ProviderTestResult = { ok: boolean; error?: string }

export async function providerChat(
  provider: AIProvider,
  apiKey: string,
  messages: ChatMessage[]
): Promise<string> {
  switch (provider) {
    case 'openai':
      return openaiChat(apiKey, messages)
    case 'google':
      return geminiChat(apiKey, messages)
    case 'perplexity':
      return perplexityChat(apiKey, messages)
    case 'anthropic':
      return anthropicChat(apiKey, messages)
    default:
      throw new Error(`Provider inconnu: ${provider}`)
  }
}

export async function testProvider(
  provider: AIProvider,
  apiKey: string
): Promise<ProviderTestResult> {
  switch (provider) {
    case 'openai':
      return testOpenAI(apiKey)
    case 'google':
      return testGemini(apiKey)
    case 'perplexity':
      return testPerplexity(apiKey)
    case 'anthropic':
      return testAnthropic(apiKey)
    default:
      return { ok: false, error: 'Provider inconnu' }
  }
}

export const PROVIDER_LABELS: Record<AIProvider, string> = {
  openai: 'OpenAI (ChatGPT)',
  anthropic: 'Anthropic (Claude)',
  google: 'Google (Gemini)',
  perplexity: 'Perplexity',
}

export const PROVIDER_HINTS: Record<AIProvider, string> = {
  openai: 'Analyse idée, brief, scores — sk-…',
  anthropic: isAnthropicRelayConfigured()
    ? 'Via relay — cl-… (VITE_AI_RELAY_URL)'
    : 'Relay requis — définis VITE_AI_RELAY_URL',
  google: 'Alternative analyse + multimodal — AIza…',
  perplexity: 'Marché, tendances, concurrence — pplx-…',
}
