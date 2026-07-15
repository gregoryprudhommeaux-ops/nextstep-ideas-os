import * as React from 'react'
import type { SynergySuggestResult } from '../../types/ai'
import { useAppStore, EMPTY_IDEAS, EMPTY_SYNERGY_LINKS } from '../../app/store'
import { suggestSynergies } from '../ai/router'
import { useAIRouterContext } from '../brainstorm/useAIRouterContext'
import { newId } from '../../lib/id'
import { synergyPairExists } from '../portfolio/portfolioUtils'

export type SynergySuggestionItem = SynergySuggestResult['suggestedSynergies'][number] & {
  id: string
  status: 'open' | 'applied' | 'dismissed'
  userNotes?: string
  resultLinkId?: string
}

export function useSynergySuggest() {
  const ctx = useAIRouterContext()
  const ideas = useAppStore((s) => s.data?.ideas ?? EMPTY_IDEAS)
  const links = useAppStore((s) => s.data?.synergyLinks ?? EMPTY_SYNERGY_LINKS)
  const addSynergyLink = useAppStore((s) => s.addSynergyLink)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [summary, setSummary] = React.useState<string | null>(null)
  const [suggestions, setSuggestions] = React.useState<SynergySuggestionItem[]>([])

  const suggest = React.useCallback(async () => {
    if (!ctx.isAvailable || ideas.length < 2) return
    setLoading(true)
    setError(null)
    try {
      const result = await suggestSynergies(ctx)
      setSummary(result.summary)
      setSuggestions(
        result.suggestedSynergies.map((s) => ({
          ...s,
          id: newId('sug'),
          status: 'open' as const,
        }))
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors des suggestions')
    } finally {
      setLoading(false)
    }
  }, [ctx, ideas.length])

  const dismiss = React.useCallback((id: string) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'dismissed' as const } : s))
    )
  }, [])

  const updateNotes = React.useCallback((id: string, userNotes: string) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, userNotes } : s))
    )
  }, [])

  const apply = React.useCallback(
    (id: string) => {
      const item = suggestions.find((s) => s.id === id)
      if (!item || item.status !== 'open') return
      if (synergyPairExists(links, item.sourceIdeaId, item.targetIdeaId)) {
        setSuggestions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: 'dismissed' as const } : s))
        )
        return
      }
      const note = [item.note, item.userNotes].filter(Boolean).join('\n\n')
      addSynergyLink({
        sourceIdeaId: item.sourceIdeaId,
        targetIdeaId: item.targetIdeaId,
        totalSynergyScore: item.score,
        notes: note,
      })
      setSuggestions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: 'applied' as const } : s))
      )
    },
    [suggestions, links, addSynergyLink]
  )

  const openCount = suggestions.filter((s) => s.status === 'open').length

  return {
    suggest,
    apply,
    dismiss,
    updateNotes,
    loading,
    error,
    summary,
    suggestions,
    openCount,
    isAvailable: ctx.loaded && ctx.isAvailable && ideas.length >= 2,
  }
}
