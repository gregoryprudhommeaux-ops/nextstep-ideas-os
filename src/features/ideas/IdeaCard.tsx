import { TagBadge } from '../../components/TagBadge'
import { ScorePill } from '../../components/score/ScorePill'
import { SignalBadge } from '../../components/SignalBadge'
import type { Idea } from '../../types/domain'
import { useAppStore, useIdeaScore } from '../../app/store'
import { categoryLabels, horizonLabels } from '../../lib/labels'
import { cn } from '../../lib/cn'

export function IdeaCard({ idea }: { idea: Idea }) {
  const score = useIdeaScore(idea.id)
  const density = useAppStore((s) => s.boardDensity)
  const compact = density === 'compact'

  return (
    <div
      className={cn(
        'rounded-[--radius-card] border border-alternate/60 bg-background transition',
        'hover:border-alternate hover:shadow-sm',
        compact ? 'px-2.5 py-2.5' : 'px-3.5 py-3.5'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold tracking-tight text-midnight">
            {idea.title}
          </div>
          {!compact && idea.oneLiner ? (
            <div className="mt-1 line-clamp-2 text-xs leading-relaxed text-tertiary/70">
              {idea.oneLiner}
            </div>
          ) : null}
        </div>
        <ScorePill score={score?.weightedScore ?? 0} />
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[10px] uppercase tracking-wide text-tertiary/55">
        <span>{categoryLabels[idea.category]}</span>
        <span>•</span>
        <span>{horizonLabels[idea.horizon]}</span>
      </div>

      <div className={cn('flex flex-wrap gap-1', compact ? 'mt-2' : 'mt-3')}>
        <SignalBadge label="Freedom" value={idea.freedomFit} />
        <SignalBadge label="Remote fit" value={idea.remoteFit} />
        <SignalBadge label="Validation speed" value={idea.speedToValidation} />
        <SignalBadge label="Scalability" value={idea.scalabilityFit} />
      </div>

      {!compact && idea.tagIds.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {idea.tagIds.slice(0, 3).map((t) => (
            <TagBadge key={t} tagId={t} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
