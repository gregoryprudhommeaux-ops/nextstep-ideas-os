import { chatCompletion, type ChatMessage } from './base'

const BASE = 'https://api.perplexity.ai'
const MODEL = 'sonar'

export async function perplexityChat(apiKey: string, messages: ChatMessage[]): Promise<string> {
  return chatCompletion(apiKey, BASE, MODEL, messages, false)
}

export async function testPerplexity(apiKey: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await perplexityChat(apiKey, [{ role: 'user', content: 'Reply with one word: ok' }])
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' }
  }
}
