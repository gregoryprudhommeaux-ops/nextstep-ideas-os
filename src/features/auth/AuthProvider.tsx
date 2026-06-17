import * as React from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { completeGoogleRedirectSignIn, initAuthPersistence } from '../../services/firebase/auth'
import { isFirebaseConfigured } from '../../config/env'
import { getFirebaseServices } from '../../services/firebase/firebase'
import { allowedEmails } from './allowedEmails'
import { AuthContext, type AuthState } from './AuthContext'
import { useAppStore } from '../../app/store'

const initialState: AuthState = isFirebaseConfigured()
  ? { user: null, isLoading: true, isAuthorized: false, email: null, configError: undefined }
  : {
      user: null,
      isLoading: false,
      isAuthorized: false,
      email: null,
      configError:
        'Missing Firebase env. Create `.env.local` from `.env.example` and set VITE_FIREBASE_* values.',
    }

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AuthState>(initialState)
  const lastUidRef = React.useRef<string | null>(null)

  React.useEffect(() => {
    if (!isFirebaseConfigured()) return

    const auth = getFirebaseServices().auth

    // Do not block auth listener on persistence — setPersistence can hang in some browsers.
    void initAuthPersistence().catch(() => {})
    void completeGoogleRedirectSignIn().catch(() => {})

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const uid = user?.uid ?? null
      const prevUid = lastUidRef.current
      // Only reset on logout or account switch — not on first session attach (null → uid)
      if (prevUid !== null && prevUid !== uid) {
        useAppStore.getState().resetWorkspace()
      }
      lastUidRef.current = uid

      const email = (user?.email ?? '').toLowerCase() || null
      const isAuthorized = email ? allowedEmails.has(email) : false
      setState({ user, isLoading: false, isAuthorized, email, configError: undefined })
    })

    return () => unsubscribe()
  }, [])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

