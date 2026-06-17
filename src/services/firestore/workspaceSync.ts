import { doc, getDoc, setDoc } from 'firebase/firestore'
import type { AppData } from '../../app/store'
import { isFirebaseConfigured } from '../../config/env'
import { getFirebaseServices } from '../firebase/firebase'
import {
  deserializeWorkspace,
  serializeWorkspace,
  workspaceSavedAt,
} from './serialize'

const DOC_ID = 'main'

function workspaceRef(uid: string) {
  return doc(getFirebaseServices().db, 'users', uid, 'workspace', DOC_ID)
}

const FIRESTORE_TIMEOUT_MS = 8_000

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Firestore timeout')), ms)
    promise
      .then((v) => {
        clearTimeout(timer)
        resolve(v)
      })
      .catch((e) => {
        clearTimeout(timer)
        reject(e)
      })
  })
}

export async function loadWorkspaceFromFirestore(uid: string): Promise<{
  data: AppData
  savedAt: number
} | null> {
  if (!isFirebaseConfigured()) return null
  try {
    const snap = await withTimeout(getDoc(workspaceRef(uid)), FIRESTORE_TIMEOUT_MS)
    if (!snap.exists()) return null
    const raw = snap.data() as Record<string, unknown>
    const data = deserializeWorkspace(raw)
    if (!data) return null
    return { data, savedAt: workspaceSavedAt(raw) }
  } catch {
    return null
  }
}

export async function saveWorkspaceToFirestore(uid: string, data: AppData): Promise<void> {
  if (!isFirebaseConfigured()) return
  await setDoc(workspaceRef(uid), serializeWorkspace(data), { merge: true })
}

let syncTimer: ReturnType<typeof setTimeout> | null = null

export function scheduleWorkspaceSync(uid: string, data: AppData): void {
  if (!isFirebaseConfigured()) return
  if (syncTimer) clearTimeout(syncTimer)
  syncTimer = setTimeout(() => {
    void saveWorkspaceToFirestore(uid, data).catch(() => {
      // offline or rules — local cache remains source on this device
    })
  }, 900)
}

export function pickWorkspaceSource(
  local: AppData | null,
  localSavedAt: number,
  remote: { data: AppData; savedAt: number } | null
): AppData | null {
  if (!local && !remote) return null
  if (!remote) return local
  if (!local) return remote.data
  return remote.savedAt >= localSavedAt ? remote.data : local
}
