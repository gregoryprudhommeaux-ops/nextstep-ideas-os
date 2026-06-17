import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { requireEnv } from '../../config/env'

let singleton:
  | { app: ReturnType<typeof initializeApp>; auth: ReturnType<typeof getAuth>; db: ReturnType<typeof getFirestore> }
  | null = null

export function getFirebaseServices() {
  if (singleton) return singleton

  const firebaseConfig = {
    apiKey: requireEnv('VITE_FIREBASE_API_KEY'),
    authDomain: requireEnv('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: requireEnv('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: requireEnv('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: requireEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: requireEnv('VITE_FIREBASE_APP_ID'),
  }

  const app = initializeApp(firebaseConfig)
  const auth = getAuth(app)
  const db = getFirestore(app)
  singleton = { app, auth, db }
  return singleton
}

