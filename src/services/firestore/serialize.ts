import { Timestamp } from 'firebase/firestore'
import type { AppData } from '../../app/store'

type Serialized = unknown

export function reviveTimestamps<T>(value: T): T {
  if (Array.isArray(value)) return value.map(reviveTimestamps) as T
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    if (typeof obj.__ts === 'number') {
      return Timestamp.fromMillis(obj.__ts) as T
    }
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(obj)) out[k] = reviveTimestamps(v)
    return out as T
  }
  return value
}

export function stampTimestamps<T>(value: T): Serialized {
  if (value instanceof Timestamp) return { __ts: value.toMillis() }
  if (Array.isArray(value)) return value.map(stampTimestamps)
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = stampTimestamps(v)
    }
    return out
  }
  return value
}

export function serializeWorkspace(data: AppData): Record<string, unknown> {
  return {
    savedAt: Date.now(),
    payload: stampTimestamps(data),
  }
}

export function deserializeWorkspace(raw: Record<string, unknown>): AppData | null {
  const payload = raw.payload
  if (!payload || typeof payload !== 'object') return null
  return reviveTimestamps(payload) as AppData
}

export function workspaceSavedAt(raw: Record<string, unknown>): number {
  return typeof raw.savedAt === 'number' ? raw.savedAt : 0
}
