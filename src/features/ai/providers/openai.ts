import { chatCompletion, type ChatMessage } from './base'

const BASE = 'https://api.openai.com/v1'
const MODEL = 'gpt-4o-mini'

export async function openaiChat(apiKey: string, messages: ChatMessage[]): Promise<string> {
  return chatCompletion(apiKey, BASE, MODEL, messages)
}

export async function testOpenAI(apiKey: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await openaiChat(apiKey, [{ role: 'user', content: 'Reply with {"ok":true}' }])
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' }
  }
}
