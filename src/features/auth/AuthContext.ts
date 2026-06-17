import * as React from 'react'
import type { User } from 'firebase/auth'

export type AuthState = {
  user: User | null
  isLoading: boolean
  isAuthorized: boolean
  email: string | null
  configError?: string
}

export const AuthContext = React.createContext<AuthState | null>(null)

