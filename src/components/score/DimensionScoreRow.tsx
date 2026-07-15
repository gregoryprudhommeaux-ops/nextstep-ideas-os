import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import type { ScoreDimension } from '../../types/domain'
import { cn } from '../../lib/cn'
import { dimensionMeta } from '../../features/scoring/dimensions'
import {
  getStaticDimensionFallback,
  getStoredDimensionNote,
} from '../../features/ideas/dimensionJustification'
import { explainDimensionScore, resolveProviderForTask } from '../../features/ai/router'
import { useAIRouterContext } from '../../features/brainstorm/useAIRouterContext'
import { useAppStore } from '../../app/store'
import { nowTimestamp } from '../../lib/time'
import { ScoreBar } from './ScoreBar'

type Props = {
  ideaId: string
  dimension: ScoreDimension
  /** Score on 0–100 scale (breakdown) */
  value100: number
  kind?: 'positive' | 'penalty'
  highlight?: boolean
  showBar?: boolean
}

export function DimensionScoreRow({
  ideaId,
  dimension,
  value100,
  kind = 'positive',
  highlight = false,
  showBar = true,
}: Props) {
  const ctx = useAIRouterContext()
  const idea = useAppStore((s) => s.data?.ideas.find((i) => i.id === ideaId) ?? null)
  const updateIdea = useAppStore((s) => s.updateIdea)
  const [expanded, setExpanded] = React.useState(false)
  const [rationale, setRationale] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (idea) {
      setRationale(getStoredDimensionNote(idea, dimension))
    }
  }, [idea, dimension])

  const meta = dimensionMeta[dimension]
  const score10 = Math.round(value100 / 10)
  const canFetchAI =
    ctx.loaded && resolveProviderForTask(ctx.settings, 'analyzeIdea') !== null

  async function loadRationale() {
    if (!idea) return
    const stored = getStoredDimensionNote(idea, dimension)
    if (stored) {
      setRationale(stored)
      return
    }
    if (!canFetchAI) {
      setRationale(getStaticDimensionFallback(idea, dimension))
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { text, provider } = await explainDimensionScore(ctx, idea, dimension)
      setRationale(text)
      const base = idea.aiAnalysis
      updateIdea(idea.id, {
        aiAnalysis: {
          brief: base?.brief ?? idea.description ?? idea.oneLiner ?? '',
          founderFitNote: base?.founderFitNote ?? '',
          ...base,
          dimensionNotes: { ...base?.dimensionNotes, [dimension]: text },
          analyzedAt: base?.analyzedAt ?? nowTimestamp(),
          provider: base?.provider ?? provider,
        },
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
      setRationale(getStaticDimensionFallback(idea, dimension))
    } finally {
      setLoading(false)
    }
  }

  function handleToggle() {
    const next = !expanded
    setExpanded(next)
    if (next && !rationale && !loading) void loadRationale()
  }

  if (!idea) return null

  return (
    <div
      className={cn(
        'rounded-[--radius-sharp] border transition',
        expanded ? 'border-alternate/60 bg-mineral/50' : 'border-transparent hover:border-alternate/40'
      )}
    >
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center justify-between gap-3 px-1 py-1.5 text-left"
        aria-expanded={expanded}
      >
        <span className="flex min-w-0 items-center gap-1.5 text-xs text-tertiary/75">
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 shrink-0 text-tertiary/45 transition',
              expanded ? 'rotate-180' : ''
            )}
          />
          <span className={cn(highlight && 'font-medium text-midnight')}>{meta.label}</span>
        </span>
        <span
          className={cn(
            'shrink-0 text-xs font-semibold tabular-nums',
            highlight ? 'text-midnight' : 'text-tertiary/85'
          )}
        >
          {score10}
          <span className="text-tertiary/55">/10</span>
        </span>
      </button>

      {showBar ? (
        <div className="px-1 pb-1.5">
          <ScoreBar label="" value={value100} kind={kind} />
        </div>
      ) : null}

      {expanded ? (
        <div className="border-t border-alternate/40 px-3 py-2.5">
          {loading ? (
            <p className="text-xs text-tertiary/60">Steven analyse…</p>
          ) : (
            <p className="text-xs leading-relaxed text-tertiary/80">
              <span className="font-medium text-midnight">Steven — </span>
              {rationale ?? getStaticDimensionFallback(idea, dimension)}
            </p>
          )}
          {error ? <p className="mt-1 text-xs text-red-600/80">{error}</p> : null}
        </div>
      ) : null}
    </div>
  )
}
