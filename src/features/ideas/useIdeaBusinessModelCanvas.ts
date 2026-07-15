import { useCallback, useState } from 'react'
import type { Idea } from '../../types/domain'
import type { BmcBlockKey, BusinessModelCanvasResult } from '../../types/ai'
import { normalizeProseSpacing } from '../../lib/prose'
import { BMC_BLOCK_KEYS } from './businessModelCanvas'
import { useAppStore } from '../../app/store'
import { generateBusinessModelCanvas, resolveProviderForTask } from '../ai/router'
import { useAIRouterContext } from '../brainstorm/useAIRouterContext'
import { nowTimestamp } from '../../lib/time'

function normalizeBmcResult(result: BusinessModelCanvasResult): BusinessModelCanvasResult {
  const blocks = { ...result.blocks }
  for (const key of BMC_BLOCK_KEYS) {
    const block = blocks[key]
    blocks[key] = {
      ...block,
      summary: normalizeProseSpacing(block.summary),
      detail: normalizeProseSpacing(block.detail),
      gapNote: block.gapNote ? normalizeProseSpacing(block.gapNote) : undefined,
    }
  }
  return {
    ...result,
    blocks,
    synthesis: normalizeProseSpacing(result.synthesis),
    overallGaps: result.overallGaps.map((g) => normalizeProseSpacing(g)),
  }
}

export function useIdeaBusinessModelCanvas(idea: Idea) {
  const ctx = useAIRouterContext()
  const updateIdea = useAppStore((s) => s.updateIdea)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedBlock, setSelectedBlock] = useState<BmcBlockKey | null>(null)
  const [helpBlock, setHelpBlock] = useState<BmcBlockKey | null>(null)

  const canvas = idea.businessModelCanvas
  const isTaskAvailable =
    ctx.loaded && resolveProviderForTask(ctx.settings, 'ideaBmcCanvas') !== null

  const generate = useCallback(async () => {
    if (!isTaskAvailable) return
    const current =
      useAppStore.getState().data?.ideas.find((i) => i.id === idea.id) ?? idea
    setLoading(true)
    setError(null)
    try {
      const result = normalizeBmcResult(await generateBusinessModelCanvas(ctx, current))
      const provider = resolveProviderForTask(ctx.settings, 'ideaBmcCanvas')!
      updateIdea(idea.id, {
        businessModelCanvas: {
          ...result,
          generatedAt: nowTimestamp(),
          provider,
        },
      })
      setSelectedBlock(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la génération')
    } finally {
      setLoading(false)
    }
  }, [ctx, idea, isTaskAvailable, updateIdea])

  const toggleHelp = useCallback((key: BmcBlockKey) => {
    setHelpBlock((prev) => (prev === key ? null : key))
  }, [])

  const selectBlock = useCallback((key: BmcBlockKey) => {
    setSelectedBlock((prev) => (prev === key ? null : key))
    setHelpBlock(null)
  }, [])

  return {
    canvas,
    loading,
    error,
    generate,
    isTaskAvailable,
    loaded: ctx.loaded,
    selectedBlock,
    helpBlock,
    selectBlock,
    toggleHelp,
  }
}
