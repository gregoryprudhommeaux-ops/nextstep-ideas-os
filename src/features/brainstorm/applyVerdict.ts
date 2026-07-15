import { applyAnalysisToIdeaPatch } from '../ideas/ideaClassification'
import { resolveIdeaReferenceId } from '../portfolio/portfolioUtils'
import type { AIProvider, ClassificationProposal, IdeaAIAnalysis, PortfolioVerdict } from '../../types/ai'
import type { Idea, IdeaInspiration } from '../../types/domain'
import { newId } from '../../lib/id'
import { nowTimestamp } from '../../lib/time'
import { mapDimensionScores } from '../scoring/dimensionScores'
import { normalizeIdeaTextPatch } from '../../lib/prose'

export const VERDICT_LABELS: Record<PortfolioVerdict, string> = {
  new: 'Nouvelle idée',
  extension: 'Extension',
  variant: 'Variante proche',
  sharedBase: 'Socle mutualisé',
}

export type ApplyVerdictInput = {
  proposal: ClassificationProposal
  rawInput: string
  sessionId: string
  separateIdea?: boolean
  aiAnalysis?: IdeaAIAnalysis
  provider?: AIProvider
  inspirations?: IdeaInspiration[]
  ideas?: Idea[]
}

export function resolveVerdict(
  proposal: ClassificationProposal,
  separateIdea?: boolean
): PortfolioVerdict {
  if (separateIdea) return 'new'
  return proposal.verdict
}

export function buildIdeaFromBrainstorm(input: ApplyVerdictInput): Idea {
  const now = nowTimestamp()
  const verdict = resolveVerdict(input.proposal, input.separateIdea)
  const analysis = input.aiAnalysis
  const scores = mapDimensionScores(analysis?.dimensionScores)

  const portfolioRole =
    verdict === 'extension' ? 'extension' : verdict === 'variant' ? 'variant' : 'standalone'

  const parentIdeaId =
    verdict === 'extension' || verdict === 'variant'
      ? resolveIdeaReferenceId(input.proposal.targetIdeaId, input.ideas ?? [])
      : undefined

  const fromAnalysis = applyAnalysisToIdeaPatch(analysis)

  return normalizeIdeaTextPatch({
    id: newId('idea'),
    title: input.proposal.provisionalTitle.trim(),
    oneLiner: fromAnalysis.oneLiner ?? input.proposal.understoodSummary,
    subtitle: fromAnalysis.subtitle,
    description: analysis?.brief ?? input.proposal.understoodSummary,
    category: fromAnalysis.category!,
    status: 'inbox',
    horizon: fromAnalysis.horizon!,
    businessModelType: fromAnalysis.businessModelType!,
    geography: fromAnalysis.geography!,
    audience: fromAnalysis.audience ?? analysis?.audience,
    whyNow: fromAnalysis.whyNow ?? analysis?.whyNow,
    risks: fromAnalysis.risks ?? analysis?.risks,
    effortLevel: 5,
    sideBusinessFit: true,
    umbrellaFit: 5,
    tagIds: [],
    umbrellaGroupId: null,
    inspirations: input.inspirations ?? [],
    scoreSource: analysis ? 'ai' : 'manual',
    aiAnalysis: analysis
      ? {
          ...analysis,
          analyzedAt: now,
          provider: input.provider ?? 'openai',
        }
      : undefined,
    portfolioRole,
    parentIdeaId,
    extensionNote:
      verdict === 'extension' ? input.proposal.understoodSummary : undefined,
    captureSource: 'brainstorm',
    brainstormSessionId: input.sessionId,
    createdAt: now,
    updatedAt: now,
    ...scores,
  })
}

export function provisionalTitleFromRaw(raw: string): string {
  const line = raw.trim().split('\n')[0]?.trim() ?? ''
  if (line.length <= 80) return line || 'Nouvelle idée'
  return `${line.slice(0, 77)}…`
}
