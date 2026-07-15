import { useCallback, useState } from 'react'
import type { Idea, ExtrapolationAmbition, ExtrapolationMode, IdeaExtrapolation } from '../../types/domain'
import { extrapolateIdea, resolveProviderForTask } from '../ai/router'
import { useAIRouterContext } from '../brainstorm/useAIRouterContext'
import { useAppStore } from '../../app/store'
import {
  buildIdeaExtrapolation,
  patchExtrapolationProposal,
  buildIdeaFromExtrapolationProposal,
} from './extrapolationUtils'

export function getIdeaExtrapolations(idea: Idea): IdeaExtrapolation[] {
  if (idea.extrapolations?.length) return idea.extrapolations
  if (idea.latestExtrapolation) return [idea.latestExtrapolation]
  return []
}

function patchExtrapolationInList(
  list: IdeaExtrapolation[],
  extrapolationId: string,
  patch: IdeaExtrapolation | ((item: IdeaExtrapolation) => IdeaExtrapolation)
): IdeaExtrapolation[] {
  return list.map((item) => {
    if (item.id !== extrapolationId) return item
    return typeof patch === 'function' ? patch(item) : patch
  })
}

export function useIdeaExtrapolation(idea: Idea) {
  const ctx = useAIRouterContext()
  const updateIdea = useAppStore((s) => s.updateIdea)
  const addIdea = useAppStore((s) => s.addIdea)

  const extrapolations = getIdeaExtrapolations(idea)
  const [selectedId, setSelectedId] = useState(
    () => extrapolations[0]?.id ?? null
  )

  const activeExtrapolation =
    extrapolations.find((x) => x.id === selectedId) ?? extrapolations[0] ?? null

  const [preserveInput, setPreserveInput] = useState(
    () => activeExtrapolation?.preserveInput ?? idea.latestExtrapolation?.preserveInput ?? ''
  )
  const [avoidInput, setAvoidInput] = useState(
    () => activeExtrapolation?.avoidInput ?? idea.latestExtrapolation?.avoidInput ?? ''
  )
  const [ambition, setAmbition] = useState<ExtrapolationAmbition>(
    () =>
      activeExtrapolation?.ambition ??
      idea.latestExtrapolation?.ambition ??
      'side_business'
  )
  const [loadingMode, setLoadingMode] = useState<ExtrapolationMode | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isTaskAvailable =
    ctx.loaded && resolveProviderForTask(ctx.settings, 'ideaExtrapolate') !== null

  const explore = useCallback(
    async (mode: ExtrapolationMode) => {
      if (!isTaskAvailable) return
      setLoadingMode(mode)
      setError(null)
      try {
        const provider = resolveProviderForTask(ctx.settings, 'ideaExtrapolate')!
        const result = await extrapolateIdea(ctx, idea, mode, {
          preserveInput,
          avoidInput,
          ambition,
        })
        const extrapolation = buildIdeaExtrapolation(
          result,
          { preserveInput, avoidInput, ambition },
          provider
        )
        const next = [extrapolation, ...getIdeaExtrapolations(idea)]
        updateIdea(idea.id, { extrapolations: next, latestExtrapolation: undefined })
        setSelectedId(extrapolation.id)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur lors de l’exploration')
      } finally {
        setLoadingMode(null)
      }
    },
    [ambition, avoidInput, ctx, idea, isTaskAvailable, preserveInput, updateIdea]
  )

  const updateProposalNotes = useCallback(
    (kind: 'complement' | 'portfolio_link', proposalId: string, userNotes: string) => {
      if (!activeExtrapolation) return
      const next = patchExtrapolationInList(extrapolations, activeExtrapolation.id, (item) =>
        patchExtrapolationProposal(item, kind, proposalId, { userNotes })
      )
      updateIdea(idea.id, { extrapolations: next })
    },
    [activeExtrapolation, extrapolations, idea.id, updateIdea]
  )

  const dismissProposal = useCallback(
    (kind: 'complement' | 'portfolio_link', proposalId: string) => {
      if (!activeExtrapolation) return
      const next = patchExtrapolationInList(extrapolations, activeExtrapolation.id, (item) =>
        patchExtrapolationProposal(item, kind, proposalId, { status: 'dismissed' })
      )
      updateIdea(idea.id, { extrapolations: next })
    },
    [activeExtrapolation, extrapolations, idea.id, updateIdea]
  )

  const createIdeaFromProposal = useCallback(
    (kind: 'complement' | 'portfolio_link', proposalId: string) => {
      if (!activeExtrapolation) return ''
      const list =
        kind === 'complement'
          ? activeExtrapolation.complementProposals
          : activeExtrapolation.portfolioLinkProposals
      const proposal = list.find((p) => p.id === proposalId)
      if (!proposal || proposal.status === 'dismissed') return proposal?.resultIdeaId ?? ''
      if (proposal.resultIdeaId) return proposal.resultIdeaId

      const { title, description } = buildIdeaFromExtrapolationProposal(
        proposal,
        idea.title,
        kind,
        activeExtrapolation.mode
      )
      const ideaId = addIdea({
        title,
        description,
        category: idea.category,
        status: 'inbox',
        horizon: idea.horizon,
      })
      const next = patchExtrapolationInList(extrapolations, activeExtrapolation.id, (item) =>
        patchExtrapolationProposal(item, kind, proposalId, {
          status: 'converted',
          resultIdeaId: ideaId,
        })
      )
      updateIdea(idea.id, { extrapolations: next })
      return ideaId
    },
    [activeExtrapolation, addIdea, extrapolations, idea, updateIdea]
  )

  const selectExtrapolation = useCallback((id: string) => {
    const item = extrapolations.find((x) => x.id === id)
    if (!item) return
    setSelectedId(id)
    setPreserveInput(item.preserveInput)
    setAvoidInput(item.avoidInput)
    setAmbition(item.ambition)
  }, [extrapolations])

  return {
    preserveInput,
    setPreserveInput,
    avoidInput,
    setAvoidInput,
    ambition,
    setAmbition,
    loadingMode,
    error,
    explore,
    isTaskAvailable,
    loaded: ctx.loaded,
    extrapolation: activeExtrapolation,
    extrapolations,
    selectedId: activeExtrapolation?.id ?? null,
    selectExtrapolation,
    updateProposalNotes,
    dismissProposal,
    createIdeaFromProposal,
  }
}
