import type { ChatMessage } from './base'
import { resolveProviderBase } from './resolveBaseUrl'

const BASE = resolveProviderBase(
  'https://api.perplexity.ai',
  'VITE_PERPLEXITY_PROXY_URL',
  '/api/perplexity'
)
const MODEL = 'sonar'

export type PerplexityChatResult = {
  content: string
  citations: string[]
}

function explainFetchError(error: unknown): Error {
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return new Error(
      import.meta.env.DEV
        ? 'Requête bloquée par le navigateur — redémarre `npm run dev` (proxy API actif en local).'
        : 'Requête bloquée par le navigateur (CORS) — configure un proxy relay côté serveur.'
    )
  }
  if (error instanceof Error && error.name === 'AbortError') {
    return new Error('AI request timed out after 90s', { cause: error })
  }
  return error instanceof Error ? error : new Error('Unknown AI request error')
}

export async function perplexityChatWithCitations(
  apiKey: string,
  messages: ChatMessage[]
): Promise<PerplexityChatResult> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 90_000)
  try {
    const res = await fetch(`${BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        return_citations: true,
      }),
      signal: controller.signal,
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(`AI request failed (${res.status}): ${err.slice(0, 300)}`)
    }
    const data = (await res.json()) as {
      choices: { message: { content: string } }[]
      citations?: string[]
      search_results?: { url?: string }[]
    }
    const content = data.choices[0]?.message?.content
    if (!content) throw new Error('Empty AI response')

    const fromSearch = (data.search_results ?? [])
      .map((r) => r.url)
      .filter((u): u is string => Boolean(u))
    const citations = [...(data.citations ?? []), ...fromSearch]

    return { content, citations }
  } catch (e) {
    throw explainFetchError(e)
  } finally {
    clearTimeout(timeout)
  }
}

export async function perplexityChat(apiKey: string, messages: ChatMessage[]): Promise<string> {
  const { content } = await perplexityChatWithCitations(apiKey, messages)
  return content
}

export async function testPerplexity(apiKey: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await perplexityChat(apiKey, [{ role: 'user', content: 'Reply with one word: ok' }])
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' }
  }
}
