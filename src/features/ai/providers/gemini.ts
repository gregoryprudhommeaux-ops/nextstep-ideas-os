import type { ChatMessage } from './base'

const MODEL = 'gemini-2.0-flash'

function toGeminiMessages(messages: ChatMessage[]) {
  const system = messages.find((m) => m.role === 'system')?.content
  const rest = messages.filter((m) => m.role !== 'system')
  return {
    systemInstruction: system ? { parts: [{ text: system }] } : undefined,
    contents: rest.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
  }
}

export async function geminiChat(apiKey: string, messages: ChatMessage[]): Promise<string> {
  const { systemInstruction, contents } = toGeminiMessages(messages)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 90_000)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...(systemInstruction ? { systemInstruction } : {}),
        contents,
        generationConfig: { responseMimeType: 'application/json' },
      }),
      signal: controller.signal,
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Gemini request failed (${res.status}): ${err.slice(0, 300)}`)
    }
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[]
    }
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) throw new Error('Empty Gemini response')
    return text
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error('Gemini request timed out after 90s', { cause: e })
    }
    throw e
  } finally {
    clearTimeout(timeout)
  }
}

export async function testGemini(apiKey: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await geminiChat(apiKey, [{ role: 'user', content: 'Reply with {"ok":true}' }])
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' }
  }
}
