import type { Idea } from '../../types/domain'
import { RefreshCw } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { DimensionScoreRow } from '../../components/score/DimensionScoreRow'
import {
  getIdeaDimensionScore,
  STRATEGIC_FIT_DIMENSIONS,
} from './dimensionJustification'
import { hasPlaceholderStrategicScores } from '../scoring/dimensionScores'
import { useIdeaStrategicAnalysis } from './useIdeaStrategicAnalysis'

type Props = {
  idea: Idea
}

export function StrategicFitCard({ idea }: Props) {
  const { refresh, loading, error, isAvailable } = useIdeaStrategicAnalysis(idea)
  const placeholder = hasPlaceholderStrategicScores(idea)

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-micro text-tertiary/60">Strategic fit</div>
          <p className="mt-1 text-xs text-tertiary/55">
            Clique sur une dimension pour voir l&apos;analyse de Steven.
          </p>
        </div>
        {isAvailable ? (
          <Button
            type="button"
            variant="ghost"
            className="shrink-0 text-xs"
            disabled={loading}
            onClick={() => void refresh()}
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Analyse…' : placeholder ? 'Analyser avec Steven' : 'Mettre à jour'}
          </Button>
        ) : null}
      </div>

      {placeholder && isAvailable ? (
        <p className="mt-3 rounded-[--radius-sharp] border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-tertiary/70">
          Scores par défaut (5/10) — lance l&apos;analyse Steven pour des notes différenciées.
        </p>
      ) : null}

      {error ? <p className="mt-3 text-xs text-red-600/90">{error}</p> : null}

      <div className="mt-4 space-y-1">
        {STRATEGIC_FIT_DIMENSIONS.map((dimension) => (
          <DimensionScoreRow
            key={dimension}
            ideaId={idea.id}
            dimension={dimension}
            value100={getIdeaDimensionScore(idea, dimension) * 10}
            highlight={dimension === 'personalAlignment'}
            showBar={false}
          />
        ))}
      </div>
    </Card>
  )
}
