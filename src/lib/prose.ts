/** Fix common spacing glitches in AI-generated or merged French prose. */
export function normalizeProseSpacing(text: string): string {
  if (!text) return text

  return (
    text
      // revenusCombine → revenus Combine
      .replace(/([a-zàâäéèêëïîôùûüçœæ])([A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇŒÆ])/g, '$1 $2')
      // missing space after sentence punctuation
      .replace(/([.!?;:])([^\s\d])/g, '$1 $2')
      // missing space after comma
      .replace(/,([^\s\d])/g, ', $1')
      .replace(/[ \t]{2,}/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  )
}

const IDEA_STRING_FIELDS = [
  'title',
  'subtitle',
  'oneLiner',
  'description',
  'whyNow',
  'audience',
  'strategicNotes',
  'firstTest',
  'nextStep',
  'risks',
  'extensionNote',
] as const

export function normalizeIdeaTextPatch<T extends Record<string, unknown>>(patch: T): T {
  const out: Record<string, unknown> = { ...patch }

  for (const key of IDEA_STRING_FIELDS) {
    const value = out[key]
    if (typeof value === 'string') {
      out[key] = normalizeProseSpacing(value)
    }
  }

  const analysis = out.aiAnalysis
  if (analysis && typeof analysis === 'object') {
    const a = { ...(analysis as Record<string, unknown>) }
    for (const key of ['brief', 'founderFitNote', 'oneLiner', 'subtitle', 'whyNow', 'audience', 'risks'] as const) {
      if (typeof a[key] === 'string') {
        a[key] = normalizeProseSpacing(a[key] as string)
      }
    }
    if (a.dimensionNotes && typeof a.dimensionNotes === 'object') {
      const notes = { ...(a.dimensionNotes as Record<string, string>) }
      for (const [k, v] of Object.entries(notes)) {
        if (typeof v === 'string') notes[k] = normalizeProseSpacing(v)
      }
      a.dimensionNotes = notes
    }
    out.aiAnalysis = a
  }

  return out as T
}
