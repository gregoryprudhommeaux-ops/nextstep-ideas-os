import { AuthProvider } from './features/auth/AuthProvider'
import { AppRouter } from './routes/AppRouter'

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}
