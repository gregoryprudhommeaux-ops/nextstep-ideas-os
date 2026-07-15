import type { IdeaExtrapolationResult } from '../../types/ai'
import type {
  ExtrapolationAmbition,
  ExtrapolationMode,
  IdeaExtrapolation,
  IdeaExtrapolationProposal,
} from '../../types/domain'
import type { AIProvider } from '../../types/ai'
import { newId } from '../../lib/id'
import { nowTimestamp } from '../../lib/time'

function mapProposal(
  p: {
    title: string
    oneLiner?: string
    rationale: string
    triage: IdeaExtrapolationProposal['triage']
    triageReason: string
  },
  relatedIdeaIds?: string[]
): IdeaExtrapolationProposal {
  return {
    id: newId('xpp'),
    title: p.title,
    oneLiner: p.oneLiner,
    rationale: p.rationale,
    triage: p.triage,
    triageReason: p.triageReason,
    relatedIdeaIds,
    status: 'open',
  }
}

export function buildIdeaExtrapolation(
  result: IdeaExtrapolationResult,
  inputs: {
    preserveInput: string
    avoidInput: string
    ambition: ExtrapolationAmbition
  },
  provider?: AIProvider
): IdeaExtrapolation {
  const now = nowTimestamp()
  const base = {
    id: newId('xpl'),
    preserveInput: inputs.preserveInput,
    avoidInput: inputs.avoidInput,
    ambition: inputs.ambition,
    provider,
    createdAt: now,
    updatedAt: now,
  }

  if (result.mode === 'expand') {
    return {
      ...base,
      mode: 'expand',
      reformulation: result.reformulation,
      coreToPreserve: result.coreToPreserve,
      corePromise: result.corePromise,
      criticalNotes: [],
      weaknesses: [],
      tightenedIdea: result.reformulation,
      priorityDirections: [],
      mistakesToAvoid: [],
      strategicQuestion: result.strategicQuestion ?? '',
      complementProposals: result.complementProposals.map((p) => mapProposal(p)),
      portfolioLinkProposals: result.portfolioLinkProposals.map((p) =>
        mapProposal(p, p.relatedIdeaIds)
      ),
    }
  }

  if (result.mode === 'challenge') {
    return {
      ...base,
      mode: 'challenge',
      reformulation: result.reformulation,
      coreToPreserve: result.coreToPreserve,
      criticalNotes: result.criticalNotes,
      weaknesses: result.weaknesses,
      hypothesesToTest: result.hypothesesToTest,
      tightenedIdea: result.reformulation,
      priorityDirections: [],
      mistakesToAvoid: [],
      strategicQuestion: result.strategicQuestion,
      complementProposals: [],
      portfolioLinkProposals: [],
    }
  }

  return {
    ...base,
    mode: 'focus',
    reformulation: result.reformulation,
    coreToPreserve: result.coreToPreserve,
    criticalNotes: [],
    weaknesses: [],
    tightenedIdea: result.tightenedIdea,
    priorityDirections: result.priorityDirections,
    mistakesToAvoid: result.mistakesToAvoid,
    strategicQuestion: result.strategicQuestion,
    complementProposals: result.complementProposals.map((p) => mapProposal(p)),
    portfolioLinkProposals: result.portfolioLinkProposals.map((p) =>
      mapProposal(p, p.relatedIdeaIds)
    ),
  }
}

export function patchExtrapolationProposal(
  extrapolation: IdeaExtrapolation,
  kind: 'complement' | 'portfolio_link',
  proposalId: string,
  patch: Partial<IdeaExtrapolationProposal>
): IdeaExtrapolation {
  const key = kind === 'complement' ? 'complementProposals' : 'portfolioLinkProposals'
  return {
    ...extrapolation,
    [key]: extrapolation[key].map((p) => (p.id === proposalId ? { ...p, ...patch } : p)),
    updatedAt: nowTimestamp(),
  }
}

export function buildIdeaFromExtrapolationProposal(
  proposal: IdeaExtrapolationProposal,
  sourceIdeaTitle: string,
  kind: 'complement' | 'portfolio_link',
  mode?: ExtrapolationMode
): { title: string; description: string } {
  const kindLabel =
    kind === 'complement' ? 'extension du noyau' : 'lien portfolio'
  const modeLabel = mode ? ` — mode ${mode}` : ''
  const related =
    proposal.relatedIdeaIds?.length && kind === 'portfolio_link'
      ? `\n\nLié au portfolio : ${proposal.relatedIdeaIds.join(', ')}`
      : ''

  return {
    title: proposal.title,
    description: [
      proposal.oneLiner,
      proposal.rationale,
      proposal.triageReason,
      proposal.userNotes,
      `— Extrapolation Steven (${kindLabel}${modeLabel}) depuis « ${sourceIdeaTitle} »`,
      related,
    ]
      .filter(Boolean)
      .join('\n\n'),
  }
}
