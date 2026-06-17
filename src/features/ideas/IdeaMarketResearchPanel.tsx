import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import type { Idea } from '../../types/domain'
import { useMarketResearch } from './useMarketResearch'

type Props = {
  idea: Idea
}

export function IdeaMarketResearchPanel({ idea }: Props) {
  const query = [idea.title, idea.oneLiner, idea.audience].filter(Boolean).join(' — ')
  const { run, loading, error, isAvailable, loaded } = useMarketResearch(idea.id, query)
  const research = idea.marketResearch

  if (!loaded) return null

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-micro text-tertiary/60">Recherche marché</div>
          <p className="mt-1 text-xs text-tertiary/65">
            Tendances et concurrence via Perplexity — contexte rapide, pas un rapport.
          </p>
        </div>
        {isAvailable ? (
          <Button variant="ghost" onClick={() => void run()} disabled={loading}>
            {loading ? 'Recherche…' : research ? 'Actualiser' : 'Rechercher avec Steven'}
          </Button>
        ) : (
          <p className="text-xs text-tertiary/55">Clé Perplexity requise (Settings)</p>
        )}
      </div>

      {error ? <p className="mt-3 text-sm text-red-600/90">{error}</p> : null}

      {research ? (
        <div className="mt-4 space-y-4 text-sm text-tertiary/85">
          <p className="leading-relaxed">{research.summary}</p>
          {research.trends.length > 0 ? (
            <div>
              <div className="text-micro text-tertiary/55">Tendances</div>
              <ul className="mt-2 list-inside list-disc space-y-1">
                {research.trends.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {research.competitors.length > 0 ? (
            <div>
              <div className="text-micro text-tertiary/55">Concurrents / alternatives</div>
              <ul className="mt-2 list-inside list-disc space-y-1">
                {research.competitors.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {research.sources && research.sources.length > 0 ? (
            <div className="text-xs text-tertiary/55">
              Sources : {research.sources.join(' · ')}
            </div>
          ) : null}
        </div>
      ) : null}
    </Card>
  )
}
