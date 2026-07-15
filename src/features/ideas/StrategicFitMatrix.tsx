import * as React from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowUp, RefreshCw } from 'lucide-react'
import type { Idea, ScoreDimension } from '../../types/domain'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { dimensionMeta } from '../scoring/dimensions'
import {
  getIdeaDimensionScore,
  STRATEGIC_FIT_DIMENSIONS,
} from './dimensionJustification'
import { hasPlaceholderStrategicScores } from '../scoring/dimensionScores'
import type { usePortfolioScoreRefresh } from './usePortfolioScoreRefresh'
import { cn } from '../../lib/cn'

function strategicFitAverage(idea: Idea): number {
  const scores = STRATEGIC_FIT_DIMENSIONS.map((d) => getIdeaDimensionScore(idea, d))
  const sum = scores.reduce((acc, s) => acc + s, 0)
  return Math.round((sum / scores.length) * 10) / 10
}

/** Background gradient: low scores = warm/mineral, high = primary green. */
export function scoreHeatStyle(score: number): React.CSSProperties {
  const t = Math.max(0, Math.min(1, (score - 1) / 9))
  const hue = 38 + t * 88
  const saturation = 28 + t * 52
  const lightness = 93 - t * 38
  return {
    backgroundColor: `hsl(${hue} ${saturation}% ${lightness}%)`,
  }
}

function scoreTextClass(score: number): string {
  if (score >= 8) return 'font-bold text-midnight'
  if (score >= 6) return 'font-semibold text-midnight/90'
  if (score >= 4) return 'font-medium text-tertiary/80'
  return 'font-medium text-tertiary/65'
}

type ScoreRefresh = ReturnType<typeof usePortfolioScoreRefresh>

type SortKey = 'average' | ScoreDimension
type SortDir = 'asc' | 'desc'

type SortState = {
  key: SortKey
  dir: SortDir
}

function sortLabel(key: SortKey): string {
  if (key === 'average') return 'moyenne'
  return dimensionMeta[key].label
}

type Props = {
  ideas: Idea[]
  className?: string
  scoreRefresh?: ScoreRefresh
}

export function StrategicFitMatrix({ ideas, className, scoreRefresh }: Props) {
  const autoRefresh = scoreRefresh?.autoRefreshPlaceholders
  const [sort, setSort] = React.useState<SortState>({ key: 'average', dir: 'desc' })

  React.useEffect(() => {
    autoRefresh?.()
  }, [autoRefresh])

  const handleSort = React.useCallback((key: SortKey) => {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === 'desc' ? 'asc' : 'desc' } : { key, dir: 'desc' }
    )
  }, [])

  const rows = React.useMemo(() => {
    const base = ideas
      .filter((i) => i.status !== 'archive')
      .map((idea) => ({
        idea,
        average: strategicFitAverage(idea),
        placeholder: hasPlaceholderStrategicScores(idea),
      }))

    const scoreFor = (row: (typeof base)[number]) =>
      sort.key === 'average' ? row.average : getIdeaDimensionScore(row.idea, sort.key)

    return [...base].sort((a, b) => {
      const delta = scoreFor(a) - scoreFor(b)
      return sort.dir === 'asc' ? delta : -delta
    })
  }, [ideas, sort])

  if (rows.length === 0) return null

  const { placeholderCount = 0, loading = false, progress, error, isAvailable, refresh } =
    scoreRefresh ?? {}

  return (
    <Card className={cn('overflow-hidden p-0', className)}>
      <div className="border-b border-alternate/50 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-micro text-tertiary/60">Synthèse</div>
            <h2 className="mt-1 text-sm font-bold text-midnight">Strategic fit — comparatif</h2>
            <p className="mt-1 text-xs text-tertiary/60">
              Une ligne par projet, une colonne par dimension. Clique sur un en-tête pour trier.
            </p>
            {loading && progress ? (
              <p className="mt-2 text-xs font-medium text-primary">
                Analyse Steven… {progress.done}/{progress.total}
                {progress.title ? ` — ${progress.title}` : ''}
              </p>
            ) : null}
            {!loading && placeholderCount > 0 ? (
              <p className="mt-2 text-xs text-tertiary/65">
                {placeholderCount} projet{placeholderCount > 1 ? 's' : ''} avec scores par défaut
                (5/10).
              </p>
            ) : null}
            {error ? <p className="mt-2 text-xs text-red-600/90">{error}</p> : null}
          </div>
          {isAvailable && placeholderCount > 0 ? (
            <Button
              type="button"
              variant="ghost"
              className="shrink-0 text-xs"
              disabled={loading}
              onClick={() => void refresh?.('placeholder')}
            >
              <RefreshCw className={cn('mr-1.5 h-3.5 w-3.5', loading && 'animate-spin')} />
              {loading ? 'Analyse…' : `Recalibrer ${placeholderCount} projet${placeholderCount > 1 ? 's' : ''}`}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-xs">
          <thead>
            <tr className="border-b border-alternate/50 bg-mineral/50">
              <th className="sticky left-0 z-10 min-w-[140px] bg-mineral/95 px-4 py-2.5 text-left text-micro font-semibold text-tertiary/70">
                Projet
              </th>
              {STRATEGIC_FIT_DIMENSIONS.map((d) => (
                <th key={d} className="p-0">
                  <button
                    type="button"
                    onClick={() => handleSort(d)}
                    className={cn(
                      'flex w-full items-center justify-center gap-1 px-2 py-2.5 text-micro font-semibold transition hover:text-midnight',
                      sort.key === d ? 'text-midnight' : 'text-tertiary/70'
                    )}
                    title={`Trier par ${dimensionMeta[d].label}`}
                  >
                    <span className="hidden sm:inline">{dimensionMeta[d].label}</span>
                    <span className="sm:hidden">{dimensionMeta[d].shortLabel}</span>
                    {sort.key === d ? (
                      sort.dir === 'desc' ? (
                        <ArrowDown className="h-3 w-3 shrink-0" aria-hidden />
                      ) : (
                        <ArrowUp className="h-3 w-3 shrink-0" aria-hidden />
                      )
                    ) : null}
                  </button>
                </th>
              ))}
              <th className="min-w-[4rem] p-0">
                <button
                  type="button"
                  onClick={() => handleSort('average')}
                  className={cn(
                    'flex w-full items-center justify-center gap-1 px-3 py-2.5 text-micro font-semibold transition hover:text-midnight',
                    sort.key === 'average' ? 'text-midnight' : 'text-midnight/70'
                  )}
                  title="Trier par moyenne"
                >
                  Moy.
                  {sort.key === 'average' ? (
                    sort.dir === 'desc' ? (
                      <ArrowDown className="h-3 w-3 shrink-0" aria-hidden />
                    ) : (
                      <ArrowUp className="h-3 w-3 shrink-0" aria-hidden />
                    )
                  ) : null}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ idea, average, placeholder }) => {
              const analyzing = loading && progress?.title === idea.title
              return (
                <tr
                  key={idea.id}
                  className={cn(
                    'border-b border-alternate/30 last:border-0',
                    analyzing && 'bg-primary/5',
                    placeholder && !loading && 'opacity-90'
                  )}
                >
                  <td className="sticky left-0 z-10 bg-background px-4 py-2">
                    <Link
                      to={`/app/ideas/${idea.id}`}
                      className="line-clamp-2 font-medium text-midnight hover:text-primary hover:underline"
                      title={idea.title}
                    >
                      {idea.title}
                    </Link>
                    {placeholder ? (
                      <span className="mt-0.5 block text-micro text-tertiary/50">scores par défaut</span>
                    ) : null}
                  </td>
                  {STRATEGIC_FIT_DIMENSIONS.map((d) => {
                    const score = getIdeaDimensionScore(idea, d)
                    return (
                      <td key={d} className="p-0.5 text-center">
                        <div
                          className={cn(
                            'rounded-[--radius-sharp] px-1 py-2 tabular-nums',
                            scoreTextClass(score),
                            placeholder && score === 5 && 'ring-1 ring-dashed ring-tertiary/25'
                          )}
                          style={scoreHeatStyle(score)}
                          title={`${dimensionMeta[d].label}: ${score}/10`}
                        >
                          {score}
                        </div>
                      </td>
                    )
                  })}
                  <td className="p-0.5 text-center">
                    <div
                      className={cn(
                        'rounded-[--radius-sharp] px-2 py-2 tabular-nums ring-1 ring-alternate/40',
                        scoreTextClass(average)
                      )}
                      style={scoreHeatStyle(average)}
                    >
                      {average.toFixed(1)}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-alternate/40 px-5 py-3 text-micro text-tertiary/55">
        <span>Échelle :</span>
        {[2, 5, 8].map((n) => (
          <span key={n} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-6 rounded-sm border border-alternate/30"
              style={scoreHeatStyle(n)}
            />
            {n}/10
          </span>
        ))}
        <span className="text-tertiary/45">
          · trié par {sortLabel(sort.key)} ({sort.dir === 'desc' ? 'décroissant' : 'croissant'})
        </span>
      </div>
    </Card>
  )
}
