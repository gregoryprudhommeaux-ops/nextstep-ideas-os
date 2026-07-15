import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { CitationText } from '../../components/CitationText'
import type { Idea } from '../../types/domain'
import { citationHost, normalizeMarketSources } from '../../lib/citations'
import { useMarketResearch } from './useMarketResearch'

type Props = {
  idea: Idea
}

function SourceLinks({ sources }: { sources: string[] }) {
  const urls = normalizeMarketSources(sources)
  if (urls.length === 0) return null

  return (
    <div className="rounded-[--radius-sharp] border border-alternate/60 bg-mineral/50 px-4 py-3">
      <div className="text-micro font-semibold text-midnight/70">Sources</div>
      <ul className="mt-2 space-y-1.5">
        {urls.map((url, index) => (
          <li key={url} id={`source-${index + 1}`}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary"
              title={url}
            >
              <span className="tabular-nums text-midnight/60">[{index + 1}]</span>{' '}
              {citationHost(url)}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function IdeaMarketResearchPanel({ idea }: Props) {
  const query = [idea.title, idea.oneLiner, idea.audience].filter(Boolean).join(' — ')
  const { run, loading, error, isAvailable, loaded } = useMarketResearch(idea.id, query)
  const research = idea.marketResearch
  const citations = normalizeMarketSources(research?.sources)

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
          <p className="leading-relaxed">
            <CitationText text={research.summary} citations={citations} />
          </p>
          {research.trends.length > 0 ? (
            <div>
              <div className="text-micro text-tertiary/55">Tendances</div>
              <ul className="mt-2 list-inside list-disc space-y-1">
                {research.trends.map((t) => (
                  <li key={t}>
                    <CitationText text={t} citations={citations} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {research.competitors.length > 0 ? (
            <div>
              <div className="text-micro text-tertiary/55">Concurrents / alternatives</div>
              <ul className="mt-2 list-inside list-disc space-y-1">
                {research.competitors.map((c) => (
                  <li key={c}>
                    <CitationText text={c} citations={citations} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {citations.length > 0 ? (
            <SourceLinks sources={citations} />
          ) : research.sources?.length ? (
            <p className="text-xs text-tertiary/65">
              Sources détectées mais sans lien — clique sur <strong className="text-midnight">Actualiser</strong>{' '}
              pour récupérer les URLs.
            </p>
          ) : null}
        </div>
      ) : null}
    </Card>
  )
}
