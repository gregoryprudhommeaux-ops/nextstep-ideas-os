import { ErrorBoundary } from './components/ErrorBoundary'
import { AuthProvider } from './features/auth/AuthProvider'
import { AppRouter } from './routes/AppRouter'

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ErrorBoundary>
  )
}
