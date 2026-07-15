import type { IdeaScoreBreakdown, ScoreDimension } from '../../types/domain'
import { dimensionMeta, penaltyDimensions } from '../../features/scoring/dimensions'
import { Card } from '../ui/Card'
import { SCORE_BREAKDOWN_ORDER } from './scoreBreakdownOrder'
import { buildRadarPoints, ScoreRadarChart } from './ScoreRadarChart'
import { DimensionScoreRow } from './DimensionScoreRow'

type Props = {
  ideaId: string
  breakdown: IdeaScoreBreakdown
}

export function ScoreBreakdownCard({ ideaId, breakdown }: Props) {
  const penaltySet = new Set(penaltyDimensions)
  const radarPoints = buildRadarPoints(breakdown, SCORE_BREAKDOWN_ORDER)

  const ordered = SCORE_BREAKDOWN_ORDER.filter(
    (k) => breakdown[k as ScoreDimension] != null
  ) as ScoreDimension[]

  const firstPenaltyIndex = ordered.findIndex((k) => penaltySet.has(k))

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <div className="text-micro text-tertiary/60">Score breakdown</div>
          <div className="mt-1 text-sm text-tertiary/70">
            Brut <span className="font-semibold text-midnight">{breakdown.rawScore}</span>
            <span className="mx-2 text-tertiary/40">•</span>
            Pondéré <span className="font-semibold text-midnight">{breakdown.weightedScore}</span>
          </div>
          <p className="mt-1 text-xs text-tertiary/55">
            Clique sur une dimension pour voir pourquoi Steven a attribué ce score.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(240px,380px)] lg:items-start">
        <div className="space-y-1">
          {ordered.map((k, index) => {
            const meta = dimensionMeta[k]
            const v = breakdown[k] ?? 0
            const showPenaltyHeader = index === firstPenaltyIndex && firstPenaltyIndex > 0

            return (
              <div key={k}>
                {showPenaltyHeader ? (
                  <div className="mb-2 mt-4 border-t border-alternate/50 pt-4 text-micro text-tertiary/55">
                    Pénalités
                  </div>
                ) : null}
                <DimensionScoreRow
                  ideaId={ideaId}
                  dimension={k}
                  value100={v}
                  kind={meta?.kind === 'penalty' ? 'penalty' : 'positive'}
                  highlight={k === 'personalAlignment'}
                />
              </div>
            )
          })}
        </div>

        <div className="lg:sticky lg:top-20">
          <ScoreRadarChart points={radarPoints} />
        </div>
      </div>
    </Card>
  )
}
