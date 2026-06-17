import { getEnv } from '../../../config/env'
import type { ChatMessage } from './base'

const RELAY_URL = getEnv('VITE_AI_RELAY_URL')
const MODEL = 'claude-sonnet-4-20250514'

export function isAnthropicRelayConfigured(): boolean {
  return Boolean(RELAY_URL)
}

export async function anthropicChat(apiKey: string, messages: ChatMessage[]): Promise<string> {
  if (!RELAY_URL) {
    throw new Error('Relay Anthropic non configuré — définis VITE_AI_RELAY_URL')
  }

  const res = await fetch(RELAY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey, messages, model: MODEL }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Anthropic relay failed (${res.status}): ${err.slice(0, 300)}`)
  }

  const data = (await res.json()) as { content?: string; text?: string }
  const content = data.content ?? data.text
  if (!content) throw new Error('Empty Anthropic relay response')
  return content
}

export async function testAnthropic(apiKey: string): Promise<{ ok: boolean; error?: string }> {
  if (!RELAY_URL) {
    return { ok: false, error: 'VITE_AI_RELAY_URL manquant' }
  }
  try {
    await anthropicChat(apiKey, [{ role: 'user', content: 'Reply with {"ok":true}' }])
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' }
  }
}
