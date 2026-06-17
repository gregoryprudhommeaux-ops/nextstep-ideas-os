import {
  GoogleAuthProvider,
  browserLocalPersistence,
  getRedirectResult,
  setPersistence,
  signInWithRedirect,
  signOut,
} from 'firebase/auth'
import { getFirebaseServices } from './firebase'

export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

export async function initAuthPersistence() {
  await setPersistence(getFirebaseServices().auth, browserLocalPersistence)
}

/** Full-page redirect — works when Google blocks signInWithPopup (embedded browsers, COOP). */
export async function signInWithGoogle() {
  await signInWithRedirect(getFirebaseServices().auth, googleProvider)
}

export async function completeGoogleRedirectSignIn() {
  return await getRedirectResult(getFirebaseServices().auth)
}

export async function signOutUser() {
  return await signOut(getFirebaseServices().auth)
}
