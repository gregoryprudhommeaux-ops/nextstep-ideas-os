import * as React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'
import { LoadingScreen } from '../features/shell/LoadingScreen'
import { SetupRequiredPage } from '../features/auth/SetupRequiredPage'
import { useAppStore } from '../app/store'
import { WorkspaceBootstrap } from '../app/WorkspaceBootstrap'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading, configError } = useAuth()
  const location = useLocation()

  if (isLoading) return <LoadingScreen />
  if (configError) return <SetupRequiredPage message={configError} />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return <>{children}</>
}

export function RequireAuthorized({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthorized, configError } = useAuth()
  const location = useLocation()

  if (isLoading) return <LoadingScreen />
  if (configError) return <SetupRequiredPage message={configError} />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (!isAuthorized) return <Navigate to="/restricted" replace />
  return (
    <>
      <WorkspaceBootstrap />
      {children}
    </>
  )
}

export function PublicOnly({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthorized, configError } = useAuth()
  const location = useLocation()
  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/app/brainstorm'

  if (isLoading) return <LoadingScreen />
  if (configError) return <SetupRequiredPage message={configError} />
  if (!user) return <>{children}</>
  return <Navigate to={isAuthorized ? from : '/restricted'} replace />
}

export function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const data = useAppStore((s) => s.data)
  const profile = data?.founderProfile
  const location = useLocation()

  if (data === null) return <LoadingScreen />

  if (!profile?.onboardingCompletedAt && !location.pathname.includes('/founder')) {
    return <Navigate to="/app/founder" replace />
  }

  return <>{children}</>
}

