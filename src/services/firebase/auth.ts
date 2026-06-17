import {
  GoogleAuthProvider,
  browserLocalPersistence,
  setPersistence,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { getFirebaseServices } from './firebase'

export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

export async function initAuthPersistence() {
  await setPersistence(getFirebaseServices().auth, browserLocalPersistence)
}

export async function signInWithGoogle() {
  return await signInWithPopup(getFirebaseServices().auth, googleProvider)
}

export async function signOutUser() {
  return await signOut(getFirebaseServices().auth)
}

