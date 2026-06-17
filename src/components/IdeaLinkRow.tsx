import { Link } from 'react-router-dom'
import { ScorePill } from './score/ScorePill'
import { useIdeaScore } from '../app/store'
import type { Idea } from '../types/domain'
import { categoryLabels } from '../lib/labels'

export function IdeaLinkRow({ idea, meta }: { idea: Idea; meta?: string }) {
  const score = useIdeaScore(idea.id)
  return (
    <Link
      to={`/app/ideas/${idea.id}`}
      className="group flex items-start justify-between gap-3 rounded-[--radius-sharp] border border-transparent px-2 py-2 transition hover:border-alternate/60 hover:bg-mineral"
    >
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-midnight group-hover:text-tertiary">
          {idea.title}
        </div>
        <div className="mt-1 line-clamp-1 text-xs text-tertiary/65">
          {meta ?? idea.oneLiner ?? categoryLabels[idea.category]}
        </div>
      </div>
      <ScorePill score={score?.weightedScore ?? 0} />
    </Link>
  )
}
