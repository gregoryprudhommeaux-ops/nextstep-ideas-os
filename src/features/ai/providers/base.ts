export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

export async function chatCompletion(
  apiKey: string,
  baseUrl: string,
  model: string,
  messages: ChatMessage[],
  jsonMode = true
): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 90_000)
  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
      }),
      signal: controller.signal,
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(`AI request failed (${res.status}): ${err.slice(0, 300)}`)
    }
    const data = (await res.json()) as { choices: { message: { content: string } }[] }
    const content = data.choices[0]?.message?.content
    if (!content) throw new Error('Empty AI response')
    return content
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error('AI request timed out after 90s', { cause: e })
    }
    throw e
  } finally {
    clearTimeout(timeout)
  }
}
