import * as React from 'react'
import { useAuth } from '../features/auth/useAuth'
import { useAppStore } from './store'
import { bootstrapAppData } from './bootstrap'

/** Loads workspace data as soon as the user is authorized — before onboarding guard resolves. */
export function WorkspaceBootstrap() {
  const { user } = useAuth()
  const data = useAppStore((s) => s.data)
  const uid = user?.uid

  React.useEffect(() => {
    if (!uid || data !== null) return
    void bootstrapAppData(uid)
  }, [uid, data])

  return null
}
