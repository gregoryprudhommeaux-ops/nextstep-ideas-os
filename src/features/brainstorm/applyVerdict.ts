import type { AIProvider, ClassificationProposal, IdeaAIAnalysis, PortfolioVerdict } from '../../types/ai'
import type { Idea, IdeaInspiration, ScoreDimension } from '../../types/domain'
import { newId } from '../../lib/id'
import { nowTimestamp } from '../../lib/time'

export const VERDICT_LABELS: Record<PortfolioVerdict, string> = {
  new: 'Nouvelle idée',
  extension: 'Extension',
  variant: 'Variante proche',
  sharedBase: 'Socle mutualisé',
}

const SCORE_KEYS: ScoreDimension[] = [
  'personalAlignment',
  'freedomFit',
  'remoteFit',
  'scalabilityFit',
  'revenuePotential',
  'speedToValidation',
  'excitementLevel',
  'complexityLevel',
  'ecosystemFit',
  'capitalIntensity',
]

function clampScore(value?: number): number {
  if (value == null || Number.isNaN(value)) return 5
  return Math.max(1, Math.min(10, Math.round(value)))
}

export function mapDimensionScores(scores?: Record<string, number>): Pick<
  Idea,
  | 'personalAlignment'
  | 'freedomFit'
  | 'remoteFit'
  | 'scalabilityFit'
  | 'revenuePotential'
  | 'speedToValidation'
  | 'excitementLevel'
  | 'complexityLevel'
  | 'ecosystemFit'
  | 'capitalIntensity'
> {
  const out = {} as Record<string, number>
  for (const key of SCORE_KEYS) {
    out[key] = clampScore(scores?.[key])
  }
  return out as ReturnType<typeof mapDimensionScores>
}

export type ApplyVerdictInput = {
  proposal: ClassificationProposal
  rawInput: string
  sessionId: string
  separateIdea?: boolean
  aiAnalysis?: IdeaAIAnalysis
  provider?: AIProvider
  inspirations?: IdeaInspiration[]
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

  return {
    id: newId('idea'),
    title: input.proposal.provisionalTitle.trim(),
    oneLiner: input.proposal.understoodSummary,
    description: analysis?.brief ?? input.proposal.understoodSummary,
    category: 'saasAi',
    status: 'inbox',
    horizon: '30_90d',
    businessModelType: 'services',
    geography: 'global',
    audience: analysis?.audience,
    whyNow: analysis?.whyNow,
    risks: analysis?.risks,
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
    parentIdeaId: verdict === 'extension' || verdict === 'variant' ? input.proposal.targetIdeaId : undefined,
    extensionNote:
      verdict === 'extension' ? input.proposal.understoodSummary : undefined,
    captureSource: 'brainstorm',
    brainstormSessionId: input.sessionId,
    createdAt: now,
    updatedAt: now,
    ...scores,
  }
}

export function provisionalTitleFromRaw(raw: string): string {
  const line = raw.trim().split('\n')[0]?.trim() ?? ''
  if (line.length <= 80) return line || 'Nouvelle idée'
  return `${line.slice(0, 77)}…`
}
