import { Link, useNavigate, useParams } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { SectionHeader } from '../../components/SectionHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { AIBanner } from '../../components/AIBanner'
import {
  useAppStore,
  EMPTY_PORTFOLIO_ANALYSES,
  EMPTY_IDEAS,
} from '../../app/store'
import {
  analysisOpenCount,
  analysisSuggestionCount,
  formatAnalysisDate,
} from './portfolioAnalysisUtils'
import { PortfolioAnalysisDetail } from './PortfolioAnalysisDetail'
import { usePortfolioScan } from './usePortfolioScan'

function AnalysisListItem({
  analysis,
}: {
  analysis: (typeof EMPTY_PORTFOLIO_ANALYSES)[number]
}) {
  const open = analysisOpenCount(analysis)
  const total = analysisSuggestionCount(analysis)

  return (
    <Link
      to={`/app/portfolio/analysis/${analysis.id}`}
      className="block rounded-[--radius-sharp] border border-alternate/50 bg-background px-4 py-3 transition hover:border-alternate hover:bg-mineral"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs text-tertiary/55">{formatAnalysisDate(analysis.createdAt)}</div>
          <p className="mt-1 line-clamp-2 text-sm font-medium text-midnight">{analysis.summary}</p>
        </div>
        <div className="shrink-0 text-right text-xs text-tertiary/60">
          {open > 0 ? (
            <span className="font-medium text-primary">{open} à traiter</span>
          ) : (
            <span>Terminé</span>
          )}
          <div className="mt-0.5">{total} proposition{total > 1 ? 's' : ''}</div>
        </div>
      </div>
    </Link>
  )
}

export function GlobalAnalysisPage() {
  const { analysisId } = useParams<{ analysisId?: string }>()
  const navigate = useNavigate()
  const analyses = useAppStore((s) => s.data?.portfolioAnalyses ?? EMPTY_PORTFOLIO_ANALYSES)
  const ideas = useAppStore((s) => s.data?.ideas ?? EMPTY_IDEAS)
  const { loading, error, scan, isAvailable, loaded } = usePortfolioScan()

  const analysis = analysisId ? analyses.find((a) => a.id === analysisId) : null

  const handleScan = async () => {
    const id = await scan()
    if (id) navigate(`/app/portfolio/analysis/${id}`)
  }

  if (analysisId && !analysis) {
    return (
      <Card className="p-6 text-center text-sm text-tertiary/70">
        Analyse introuvable.{' '}
        <Link to="/app/portfolio/analysis" className="text-primary underline-offset-2 hover:underline">
          Voir l&apos;historique
        </Link>
      </Card>
    )
  }

  if (analysis) {
    return (
      <div className="space-y-6">
        <SectionHeader
          eyebrow="Analyse globale"
          title="Résultat du scan"
          description={formatAnalysisDate(analysis.createdAt)}
          action={
            <Link to="/app/portfolio/analysis">
              <Button type="button" variant="ghost">
                Historique
              </Button>
            </Link>
          }
        />
        <PortfolioAnalysisDetail analysis={analysis} />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Analyse globale"
        title="Comment tes projets fonctionnent ensemble"
        description="Historique des scans Steven — synergies, regroupements et nouvelles idées émergentes à transformer en projets."
        action={
          <div className="flex flex-wrap gap-2">
            <Link to="/app/portfolio">
              <Button type="button" variant="ghost">
                Portfolio
              </Button>
            </Link>
            {isAvailable && ideas.length >= 2 ? (
              <Button type="button" disabled={loading} onClick={() => void handleScan()}>
                <Sparkles className="h-4 w-4" />
                {loading ? 'Analyse…' : 'Nouveau scan'}
              </Button>
            ) : null}
          </div>
        }
      />

      {loaded && !isAvailable && ideas.length >= 2 ? <AIBanner /> : null}

      {error ? (
        <Card className="border-red-300/60 bg-red-50/80 p-4 text-sm text-red-900">{error}</Card>
      ) : null}

      {ideas.length < 2 ? (
        <Card className="p-6 text-center text-sm text-tertiary/70">
          Il faut au moins 2 idées pour lancer une analyse globale.
        </Card>
      ) : analyses.length === 0 ? (
        <Card className="space-y-3 p-6 text-center text-sm text-tertiary/70">
          <p>Aucune analyse enregistrée pour l&apos;instant.</p>
          {isAvailable ? (
            <Button type="button" disabled={loading} onClick={() => void handleScan()}>
              <Sparkles className="h-4 w-4" />
              Scanner avec Steven
            </Button>
          ) : null}
        </Card>
      ) : (
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-midnight">Historique</h2>
          <div className="space-y-2">
            {analyses.map((a) => (
              <AnalysisListItem key={a.id} analysis={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
