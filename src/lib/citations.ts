export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/** Turn bare domains or strings containing a URL into https links. */
export function coerceToHttpUrl(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  if (isHttpUrl(trimmed)) return trimmed

  const embedded = trimmed.match(/https?:\/\/[^\s)\]"']+/i)?.[0]
  if (embedded && isHttpUrl(embedded)) return embedded

  if (/^[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(trimmed)) {
    const candidate = `https://${trimmed}`
    if (isHttpUrl(candidate)) return candidate
  }

  return null
}

export function citationHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

/** Merge API citations, search results, and optional model-provided strings into unique URLs. */
export function mergeMarketSources(...groups: (string[] | undefined)[]): string[] {
  const urls: string[] = []
  const seen = new Set<string>()

  for (const group of groups) {
    if (!group?.length) continue
    for (const raw of group) {
      const url = coerceToHttpUrl(raw)
      if (!url || seen.has(url)) continue
      seen.add(url)
      urls.push(url)
    }
  }

  return urls
}

export function normalizeMarketSources(sources?: string[]): string[] {
  return mergeMarketSources(sources)
}

/** Resolve [n] marker to URL (1-indexed, Perplexity convention). */
export function getCitationUrl(sources: string[] | undefined, citationNumber: number): string | null {
  if (!sources?.length || citationNumber < 1) return null
  const urls = normalizeMarketSources(sources)
  return urls[citationNumber - 1] ?? null
}
