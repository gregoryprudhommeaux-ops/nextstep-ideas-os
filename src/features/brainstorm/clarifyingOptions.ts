import type { ClarifyingQuestion } from '../../types/ai'

export const UNSURE_ANSWER_LABEL = 'Je ne sais pas encore'

/** Options shown as chips — excludes the fixed "unsure" choice and duplicate labels. */
export function optionsForDisplay(options: ClarifyingQuestion['options']) {
  const seen = new Set<string>()
  return options.filter((opt) => {
    const label = opt.label.trim()
    const key = label.toLowerCase()
    if (key === UNSURE_ANSWER_LABEL.toLowerCase()) return false
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
