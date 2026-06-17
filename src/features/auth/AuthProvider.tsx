import * as React from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { initAuthPersistence } from '../../services/firebase/auth'
import { isFirebaseConfigured } from '../../config/env'
import { getFirebaseServices } from '../../services/firebase/firebase'
import { allowedEmails } from './allowedEmails'
import { AuthContext, type AuthState } from './AuthContext'

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

  React.useEffect(() => {
    if (!isFirebaseConfigured()) return

    let isMounted = true
    let unsubscribe: (() => void) | null = null

    const auth = getFirebaseServices().auth

    void initAuthPersistence()
      .catch(() => {})
      .finally(() => {
        unsubscribe = onAuthStateChanged(auth, (user) => {
          if (!isMounted) return
          const email = (user?.email ?? '').toLowerCase() || null
          const isAuthorized = email ? allowedEmails.has(email) : false
          setState({ user, isLoading: false, isAuthorized, email, configError: undefined })
        })
      })

    return () => {
      isMounted = false
      unsubscribe?.()
    }
  }, [])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

