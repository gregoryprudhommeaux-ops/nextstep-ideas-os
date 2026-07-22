import * as React from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowUp } from 'lucide-react'
import type { Idea } from '../../types/domain'
import { Card } from '../../components/ui/Card'
import { Select } from '../../components/ui/Select'
import { competitorsOver100kLabels } from '../../lib/labels'
import { cn } from '../../lib/cn'
import {
  MATRIX_SCORE_MAX,
  type DecisionMatrixPortfolioFilter,
  type DecisionMatrixSortKey,
  filterIdeasForDecisionMatrix,
  sortIdeasByDecisionMatrix,
} from './decisionMatrixScore'

type SortDir = 'asc' | 'desc'

type Props = {
  ideas: Idea[]
  className?: string
}

const FILTER_OPTIONS: { id: DecisionMatrixPortfolioFilter; label: string; hint: string }[] = [
  { id: 'all', label: 'Toutes', hint: 'Hors archive' },
  { id: 'incubation', label: 'Incubation', hint: 'Scorées, sans veto preuve' },
  { id: 'scored', label: 'Scorées', hint: 'Matrice remplie' },
  { id: 'veto', label: 'Veto', hint: 'Preuve marché absente' },
  { id: 'unscored', label: 'Sans matrice', hint: 'À évaluer' },
]

const SORT_COLUMNS: { key: DecisionMatrixSortKey; label: string; short: string }[] = [
  { key: 'scoreTotal', label: 'Score', short: 'Sc.' },
  { key: 'simplicity', label: 'Simplicité', short: 'Simp.' },
  { key: 'kiff', label: 'Kiff', short: 'Kiff' },
  { key: 'marketability', label: 'Marketabilité', short: 'Mkt' },
]

function SortButton({
  active,
  dir,
  label,
  short,
  onClick,
  align = 'center',
}: {
  active: boolean
  dir: SortDir
  label: string
  short: string
  onClick: () => void
  align?: 'center' | 'left'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-1 px-2 py-2.5 text-micro font-semibold transition hover:text-midnight',
        align === 'center' ? 'justify-center' : 'justify-start px-4',
        active ? 'text-midnight' : 'text-tertiary/70'
      )}
      title={`Trier par ${label}`}
    >
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{short}</span>
      {active ? (
        dir === 'desc' ? (
          <ArrowDown className="h-3 w-3 shrink-0" aria-hidden />
        ) : (
          <ArrowUp className="h-3 w-3 shrink-0" aria-hidden />
        )
      ) : null}
    </button>
  )
}

export function DecisionMatrixPortfolioTable({ ideas, className }: Props) {
  const [filter, setFilter] = React.useState<DecisionMatrixPortfolioFilter>('incubation')
  const [sortKey, setSortKey] = React.useState<DecisionMatrixSortKey>('scoreTotal')
  const [sortDir, setSortDir] = React.useState<SortDir>('desc')

  const handleSort = React.useCallback((key: DecisionMatrixSortKey) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
        return prev
      }
      setSortDir('desc')
      return key
    })
  }, [])

  const rows = React.useMemo(() => {
    const filtered = filterIdeasForDecisionMatrix(ideas, filter)
    return sortIdeasByDecisionMatrix(filtered, sortKey, sortDir)
  }, [ideas, filter, sortKey, sortDir])

  const scoredCount = React.useMemo(
    () => ideas.filter((i) => i.status !== 'archive' && i.decisionMatrix).length,
    [ideas]
  )

  if (ideas.filter((i) => i.status !== 'archive').length === 0) return null

  return (
    <Card className={cn('overflow-hidden p-0', className)} id="decision-matrix-portfolio">
      <div className="border-b border-alternate/50 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-micro text-tertiary/60">Evidence-first</div>
            <h2 className="mt-1 text-sm font-bold text-midnight">Matrice de décision — portfolio</h2>
            <p className="mt-1 max-w-2xl text-xs text-tertiary/60">
              Tri par score matrice. Le mode Incubation garde les idées scorées sans veto preuve — pour
              prioriser ce qui mérite d&apos;être affiné.
            </p>
            <p className="mt-2 text-xs text-tertiary/55">
              {scoredCount} idée{scoredCount > 1 ? 's' : ''} avec matrice · {rows.length} affichée
              {rows.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              className="h-9 w-[11rem] text-xs"
              value={filter}
              onChange={(e) => setFilter(e.target.value as DecisionMatrixPortfolioFilter)}
              aria-label="Filtre matrice"
            >
              {FILTER_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id} title={opt.hint}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
        {filter === 'incubation' ? (
          <p className="mt-3 rounded-[--radius-sharp] bg-mineral/40 px-3 py-2 text-xs text-tertiary/70">
            Incubation = vue de travail, pas un nouveau statut. Les idées archivées et celles en veto
            preuve sont exclues.
          </p>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-tertiary/65">
          {filter === 'unscored'
            ? 'Toutes les idées actives ont déjà une matrice.'
            : filter === 'incubation' || filter === 'scored'
              ? 'Aucune idée dans ce filtre — remplis une matrice depuis une fiche idée.'
              : 'Aucune idée pour ce filtre.'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-xs">
            <thead>
              <tr className="border-b border-alternate/50 bg-mineral/50">
                <th className="sticky left-0 z-10 min-w-[140px] bg-mineral/95 p-0 text-left">
                  <SortButton
                    active={sortKey === 'title'}
                    dir={sortDir}
                    label="Idée"
                    short="Idée"
                    align="left"
                    onClick={() => handleSort('title')}
                  />
                </th>
                <th className="px-3 py-2.5 text-left text-micro font-semibold text-tertiary/70">
                  Niche
                </th>
                <th className="px-2 py-2.5 text-center text-micro font-semibold text-tertiary/70">
                  +100k
                </th>
                {SORT_COLUMNS.map((col) => (
                  <th key={col.key} className="p-0">
                    <SortButton
                      active={sortKey === col.key}
                      dir={sortDir}
                      label={col.label}
                      short={col.short}
                      onClick={() => handleSort(col.key)}
                    />
                  </th>
                ))}
                <th className="px-2 py-2.5 text-center text-micro font-semibold text-tertiary/70">
                  Pas social
                </th>
                <th className="px-2 py-2.5 text-center text-micro font-semibold text-tertiary/70">
                  Preuve
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((idea) => {
                const m = idea.decisionMatrix
                return (
                  <tr key={idea.id} className="border-b border-alternate/30 last:border-0">
                    <td className="sticky left-0 z-10 bg-background px-4 py-2">
                      <Link
                        to={`/app/ideas/${idea.id}`}
                        className="line-clamp-2 font-medium text-midnight hover:text-primary hover:underline"
                      >
                        {idea.title}
                      </Link>
                    </td>
                    <td className="max-w-[10rem] px-3 py-2 text-tertiary/75">
                      <span className="line-clamp-2">{m?.niche || '—'}</span>
                    </td>
                    <td className="px-2 py-2 text-center text-tertiary/70">
                      {m ? (
                        <span
                          title={competitorsOver100kLabels[m.competitorsOver100k]}
                          className="tabular-nums"
                        >
                          {m.competitorsOver100k === 'yes'
                            ? 'Oui'
                            : m.competitorsOver100k === 'no'
                              ? 'Non'
                              : '?'}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-2 py-2 text-center">
                      {m ? (
                        <span
                          className={cn(
                            'inline-block min-w-[2.5rem] rounded-[--radius-sharp] px-2 py-1 tabular-nums font-semibold',
                            m.evidenceVeto
                              ? 'bg-red-50 text-red-900 ring-1 ring-red-200/70'
                              : 'bg-mineral/70 text-midnight ring-1 ring-alternate/50'
                          )}
                        >
                          {m.scoreTotal}
                          <span className="text-micro font-medium text-tertiary/50">
                            /{MATRIX_SCORE_MAX}
                          </span>
                        </span>
                      ) : (
                        <span className="text-tertiary/45">—</span>
                      )}
                    </td>
                    <td className="px-2 py-2 text-center tabular-nums text-tertiary/75">
                      {m?.simplicity ?? '—'}
                    </td>
                    <td className="px-2 py-2 text-center tabular-nums text-tertiary/75">
                      {m?.kiff ?? '—'}
                    </td>
                    <td className="px-2 py-2 text-center tabular-nums text-tertiary/75">
                      {m?.marketability ?? '—'}
                    </td>
                    <td className="px-2 py-2 text-center text-tertiary/70">
                      {m ? (m.noSocial ? 'Oui' : 'Non') : '—'}
                    </td>
                    <td className="px-2 py-2 text-center">
                      {m?.evidenceVeto ? (
                        <span className="rounded-full bg-red-50 px-2 py-0.5 text-micro font-medium text-red-800 ring-1 ring-red-200/70">
                          Veto
                        </span>
                      ) : m ? (
                        <span className="text-micro text-tertiary/55">ok</span>
                      ) : (
                        <span className="text-tertiary/45">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
