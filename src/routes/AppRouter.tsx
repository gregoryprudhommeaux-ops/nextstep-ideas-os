import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PublicOnly, RequireAuth, RequireAuthorized, RequireOnboarding } from './guards'
import { LoginPage } from '../features/auth/LoginPage'
import { RestrictedPage } from '../features/auth/RestrictedPage'
import { AppShellLayout } from '../features/shell/AppShellLayout'
import { DashboardPage } from '../pages/DashboardPage'
import { IdeasBoardPage } from '../features/ideas/IdeasBoardPage'
import { IdeaDetailPage } from '../pages/IdeaDetailPage'
import { IdeaNewPage } from '../pages/IdeaNewPage'
import { IdeaEditPage } from '../pages/IdeaEditPage'
import { FiltersPage } from '../pages/FiltersPage'
import { SynergyPage } from '../pages/SynergyPage'
import { UmbrellasPage } from '../pages/UmbrellasPage'
import { WeeklyReviewPage } from '../pages/WeeklyReviewPage'
import { SettingsPage } from '../pages/SettingsPage'
import { LandingPage } from '../pages/LandingPage'
import { FounderOnboardingPage } from '../features/founder/FounderOnboardingPage'
import { BrainstormPage } from '../features/brainstorm/BrainstormPage'
import { PortfolioPage } from '../features/portfolio/PortfolioPage'

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
              <RequireOnboarding>
                <AppShellLayout />
              </RequireOnboarding>
            </RequireAuthorized>
          }
        >
          <Route index element={<Navigate to="/app/brainstorm" replace />} />
          <Route path="brainstorm" element={<BrainstormPage />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="founder" element={<FounderOnboardingPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="ideas" element={<IdeasBoardPage />} />
          <Route path="ideas/new" element={<IdeaNewPage />} />
          <Route path="ideas/:ideaId/edit" element={<IdeaEditPage />} />
          <Route path="ideas/:ideaId" element={<IdeaDetailPage />} />
          <Route path="filters" element={<FiltersPage />} />
          <Route path="synergy" element={<SynergyPage />} />
          <Route path="umbrellas" element={<UmbrellasPage />} />
          <Route path="review" element={<WeeklyReviewPage />} />
        </Route>
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

