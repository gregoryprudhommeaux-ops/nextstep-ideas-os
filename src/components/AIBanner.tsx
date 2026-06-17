import { Link } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'

export function AIBanner() {
  return (
    <div className="flex items-start gap-3 rounded-[--radius-sharp] border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-midnight">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
      <p>
        Connecte une clé API pour activer l&apos;analyse AI.{' '}
        <Link to="/app/settings" className="font-semibold text-midnight underline-offset-2 hover:underline">
          Configurer dans Settings
        </Link>
      </p>
    </div>
  )
}
