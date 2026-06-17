import type { Timestamp } from 'firebase/firestore'
import type { WithTimestamps } from '../../types/domain'

export type StevenEvolutionSource = 'brainstorm' | 'founder_profile' | 'manual'

/** Metadata for the most recent automatic evolution of Steven's learned context. */
export type StevenEvolutionRecord = {
  at: Timestamp
  summaryBullets: string[]
  source: StevenEvolutionSource
  sessionId?: string
}

/** Persisted Steven configuration (base prompt lives in code). */
export type StevenConfig = WithTimestamps & {
  /** Manual notes from Settings — user-edited, never overwritten by AI. */
  customInstructions: string
  /** AI-maintained understanding of the founder — updated after each brainstorm exchange. */
  learnedContext: string
  /** Last automatic update (date + what changed). */
  lastEvolution: StevenEvolutionRecord | null
}
