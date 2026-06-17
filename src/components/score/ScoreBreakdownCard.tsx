import type { IdeaScoreBreakdown } from '../../types/domain'
import { dimensionMeta, penaltyDimensions } from '../../features/scoring/dimensions'
import { ScoreBar } from './ScoreBar'
import { Card } from '../ui/Card'

export function ScoreBreakdownCard({ breakdown }: { breakdown: IdeaScoreBreakdown }) {
  const penaltySet = new Set(penaltyDimensions)
  const entries = Object.entries(breakdown).filter(
    ([k]) => k !== 'rawScore' && k !== 'weightedScore'
  ) as [keyof typeof dimensionMeta, number][]

  const positives = entries.filter(([k]) => !penaltySet.has(k))
  const penalties = entries.filter(([k]) => penaltySet.has(k))

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <div className="text-micro text-tertiary/60">Score breakdown</div>
          <div className="mt-1 text-sm text-tertiary/70">
            Raw <span className="font-semibold text-midnight">{breakdown.rawScore}</span>
            <span className="mx-2 text-tertiary/40">•</span>
            Weighted <span className="font-semibold text-midnight">{breakdown.weightedScore}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <div className="text-micro text-tertiary/55">Core dimensions</div>
          <div className="mt-3 space-y-3">
            {positives.map(([k, v]) => (
              <ScoreBar
                key={k}
                label={dimensionMeta[k]?.label ?? k}
                value={v}
                kind={dimensionMeta[k]?.kind === 'penalty' ? 'penalty' : 'positive'}
              />
            ))}
          </div>
        </div>
        <div>
          <div className="text-micro text-tertiary/55">Penalties</div>
          <div className="mt-3 space-y-3">
            {penalties.map(([k, v]) => (
              <ScoreBar key={k} label={dimensionMeta[k]?.label ?? k} value={v} kind="penalty" />
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
