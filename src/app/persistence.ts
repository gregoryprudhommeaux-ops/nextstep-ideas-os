import { Timestamp } from 'firebase/firestore'
import type { AppData } from './store'
import type { WithTimestamps } from '../types/domain'
import { normalizeStevenConfig } from '../features/steven/normalizeStevenConfig'
import { stampTimestamps, reviveTimestamps } from '../services/firestore/serialize'

const STORAGE_KEY_PREFIX = 'nextstep-idea-os-v2'
const LEGACY_KEY = 'nextstep-idea-os-v1'
/** Pre–user-scoping global key (migrated on first login). */
const LEGACY_GLOBAL_V2_KEY = 'nextstep-idea-os-v2'
const SAVED_AT_PREFIX = 'nextstep-idea-os-saved-at'
const LEGACY_GLOBAL_SAVED_AT_KEY = 'nextstep-idea-os-saved-at'

function dataKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}:${userId}`
}

function savedAtKey(userId: string): string {
  return `${SAVED_AT_PREFIX}:${userId}`
}

function migrateV1toV2(raw: Record<string, unknown>): AppData {
  return {
    version: 2,
    ideas: (raw.ideas as AppData['ideas']) ?? [],
    filters: (raw.filters as AppData['filters']) ?? [],
    profiles: (raw.profiles as AppData['profiles']) ?? [],
    tags: (raw.tags as AppData['tags']) ?? [],
    decisionNotes: (raw.decisionNotes as AppData['decisionNotes']) ?? [],
    synergyLinks: (raw.synergyLinks as AppData['synergyLinks']) ?? [],
    umbrellaGroups: (raw.umbrellaGroups as AppData['umbrellaGroups']) ?? [],
    weeklyReviews: (raw.weeklyReviews as AppData['weeklyReviews']) ?? [],
    founderProfile: null,
    brainstormSessions: [],
    sharedBases: [],
    portfolioAnalyses: [],
    steven: normalizeStevenConfig((raw.steven as AppData['steven']) ?? undefined),
  }
}

function parseStoredData(raw: string): AppData | null {
  try {
    const parsed = JSON.parse(raw) as AppData | Record<string, unknown>
    if (!parsed || typeof parsed !== 'object') return null
    if (!('version' in parsed) || (parsed as AppData).version !== 2) {
      return reviveTimestamps(migrateV1toV2(parsed as Record<string, unknown>))
    }
    const data = reviveTimestamps(parsed as AppData)
    return { ...data, portfolioAnalyses: data.portfolioAnalyses ?? [] }
  } catch {
    return null
  }
}

function isDataOwnedByUser(data: AppData, userId: string): boolean {
  const owner = data.founderProfile?.userId
  if (!owner) return true
  return owner === userId
}

function readLegacyGlobal(userId: string): AppData | null {
  const raw = localStorage.getItem(LEGACY_GLOBAL_V2_KEY)
  if (!raw) return null
  const data = parseStoredData(raw)
  if (!data || !isDataOwnedByUser(data, userId)) return null
  savePersistedData(data, userId)
  localStorage.removeItem(LEGACY_GLOBAL_V2_KEY)
  const legacyAt = localStorage.getItem(LEGACY_GLOBAL_SAVED_AT_KEY)
  if (legacyAt) {
    localStorage.setItem(savedAtKey(userId), legacyAt)
    localStorage.removeItem(LEGACY_GLOBAL_SAVED_AT_KEY)
  }
  return data
}

export function loadPersistedData(userId: string): AppData | null {
  try {
    const scoped = localStorage.getItem(dataKey(userId))
    if (scoped) {
      const data = parseStoredData(scoped)
      return data && isDataOwnedByUser(data, userId) ? data : null
    }

    const legacyV1 = localStorage.getItem(LEGACY_KEY)
    if (legacyV1) {
      const parsed = JSON.parse(legacyV1) as Record<string, unknown>
      const migrated = migrateV1toV2(parsed)
      savePersistedData(migrated, userId)
      localStorage.removeItem(LEGACY_KEY)
      return reviveTimestamps(migrated)
    }

    return readLegacyGlobal(userId)
  } catch {
    return null
  }
}

export function savePersistedData(data: AppData, userId: string): void {
  try {
    const now = Date.now()
    localStorage.setItem(dataKey(userId), JSON.stringify(stampTimestamps(data)))
    localStorage.setItem(savedAtKey(userId), String(now))
  } catch {
    // ignore quota errors in dev
  }
}

export function getLocalSavedAt(userId: string): number {
  try {
    const raw = localStorage.getItem(savedAtKey(userId))
    return raw ? Number(raw) : 0
  } catch {
    return 0
  }
}

export function touchUpdated<T extends WithTimestamps>(entity: T): T {
  return { ...entity, updatedAt: Timestamp.now() }
}
