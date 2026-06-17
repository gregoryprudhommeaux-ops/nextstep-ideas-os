import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PublicOnly, RequireAuth, RequireAuthorized } from './guards'
import { LoginPage } from '../features/auth/LoginPage'
import { RestrictedPage } from '../features/auth/RestrictedPage'
import { AppShellLayout } from '../features/shell/AppShellLayout'
import { DashboardPage } from '../pages/DashboardPage'
import { IdeasBoardPage } from '../features/ideas/IdeasBoardPage'
import { IdeaDetailPage } from '../pages/IdeaDetailPage'
import { FiltersPage } from '../pages/FiltersPage'
import { SynergyPage } from '../pages/SynergyPage'
import { UmbrellasPage } from '../pages/UmbrellasPage'
import { WeeklyReviewPage } from '../pages/WeeklyReviewPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnly>
              <LoginPage />
            </PublicOnly>
          }
        />
        <Route
          path="/restricted"
          element={
            <RequireAuth>
              <RestrictedPage />
            </RequireAuth>
          }
        />
        <Route
          path="/app"
          element={
            <RequireAuthorized>
              <AppShellLayout />
            </RequireAuthorized>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="ideas" element={<IdeasBoardPage />} />
          <Route path="ideas/:ideaId" element={<IdeaDetailPage />} />
          <Route path="filters" element={<FiltersPage />} />
          <Route path="synergy" element={<SynergyPage />} />
          <Route path="umbrellas" element={<UmbrellasPage />} />
          <Route path="review" element={<WeeklyReviewPage />} />
        </Route>
        <Route path="/" element={<Navigate to="/app" replace />} />
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

