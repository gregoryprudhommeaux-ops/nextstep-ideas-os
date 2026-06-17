import { isFirebaseConfigured } from '../../config/env'
import { getFirebaseServices } from './firebase'

/** Safe uid read — never throws when Firebase env is missing. */
export function getCurrentUserId(): string | null {
  if (!isFirebaseConfigured()) return null
  try {
    return getFirebaseServices().auth.currentUser?.uid ?? null
  } catch {
    return null
  }
}
