/** Append spoken text to existing notes with light punctuation between segments. */
export function appendDictationText(prev: string, spoken: string): string {
  const trimmed = prev.trimEnd()
  if (!trimmed) return spoken
  const sep = /[.!?…]$/.test(trimmed) ? ' ' : trimmed.endsWith(',') ? ' ' : '. '
  return `${trimmed}${sep}${spoken}`
}
