import * as React from 'react'
import { useAuth } from '../features/auth/useAuth'
import { useAppStore } from './store'
import { bootstrapAppData, hydrateEmptyWorkspace } from './bootstrap'

/** Loads workspace data as soon as the user is authorized — before onboarding guard resolves. */
export function WorkspaceBootstrap() {
  const { user } = useAuth()
  const data = useAppStore((s) => s.data)
  const uid = user?.uid
  const bootstrappingRef = React.useRef(false)

  React.useEffect(() => {
    if (!uid || data !== null || bootstrappingRef.current) return
    bootstrappingRef.current = true
    void bootstrapAppData(uid).finally(() => {
      bootstrappingRef.current = false
    })
  }, [uid, data])

  React.useEffect(() => {
    if (!uid || data !== null) return
    const watchdog = window.setTimeout(() => {
      if (useAppStore.getState().data === null) {
        hydrateEmptyWorkspace()
      }
    }, 10_000)
    return () => window.clearTimeout(watchdog)
  }, [uid, data])

  return null
}
