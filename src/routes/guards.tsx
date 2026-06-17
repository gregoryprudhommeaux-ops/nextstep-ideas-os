import * as React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'
import { LoadingScreen } from '../features/shell/LoadingScreen'
import { SetupRequiredPage } from '../features/auth/SetupRequiredPage'

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

  if (isLoading) return <LoadingScreen />
  if (configError) return <SetupRequiredPage message={configError} />
  if (!user) return <Navigate to="/login" replace />
  if (!isAuthorized) return <Navigate to="/restricted" replace />
  return <>{children}</>
}

export function PublicOnly({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthorized, configError } = useAuth()

  if (isLoading) return <LoadingScreen />
  if (configError) return <SetupRequiredPage message={configError} />
  if (!user) return <>{children}</>
  return <Navigate to={isAuthorized ? '/app' : '/restricted'} replace />
}

