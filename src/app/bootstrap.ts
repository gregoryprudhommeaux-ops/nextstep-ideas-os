import { loadPersistedData, getLocalSavedAt } from './persistence'
import { createEmptyAppData } from '../data/systemDefaults'
import { normalizeStevenConfig } from '../features/steven/normalizeStevenConfig'
import { useAppStore, type AppData } from './store'
import {
  loadWorkspaceFromFirestore,
  pickWorkspaceSource,
  saveWorkspaceToFirestore,
} from '../services/firestore/workspaceSync'
import { isFirebaseConfigured } from '../config/env'

function normalizeAppData(data: ReturnType<typeof createEmptyAppData>) {
  return {
    ...data,
    steven: normalizeStevenConfig(data.steven),
  }
}

function isDataOwnedByUser(data: AppData, userId: string): boolean {
  const owner = data.founderProfile?.userId
  if (!owner) return true
  return owner === userId
}

export async function bootstrapAppData(userId: string) {
  let chosen: AppData | null

  try {
    let local = loadPersistedData(userId)
    if (local && !isDataOwnedByUser(local, userId)) {
      local = null
    }

    const localSavedAt = getLocalSavedAt(userId)
    chosen = local

    if (isFirebaseConfigured()) {
      const remote = await loadWorkspaceFromFirestore(userId)
      chosen = pickWorkspaceSource(local, localSavedAt, remote)

      if (chosen && !remote) {
        // Non-blocking — never stall UI if rules/network fail
        void saveWorkspaceToFirestore(userId, chosen).catch(() => {})
      }
    }
  } catch {
    chosen = null
  }

  const data = normalizeAppData(chosen ?? createEmptyAppData())
  useAppStore.getState().hydrateData(data)
}

/** Last-resort if bootstrap hangs — unblocks the loading screen. */
export function hydrateEmptyWorkspace() {
  const data = normalizeAppData(createEmptyAppData())
  useAppStore.getState().hydrateData(data)
}
