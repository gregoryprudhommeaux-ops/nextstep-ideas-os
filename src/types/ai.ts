export type AIProvider = 'openai' | 'anthropic' | 'google' | 'perplexity'

export type AITaskRole =
  | 'structureProfile'
  | 'parseThought'
  | 'refineThought'
  | 'classifyPortfolio'
  | 'analyzeIdea'
  | 'marketResearch'
  | 'portfolioScan'
  | 'suggestSynergies'
  | 'evolveSteven'
  | 'ideaExtrapolate'
  | 'ideaBrainstorm'
  | 'ideaBmcCanvas'
  | 'ideaDecisionMatrix'

export type AIProviderConfig = {
  apiKey: string
  enabled: boolean
  lastTestedAt?: number
  lastTestStatus?: 'ok' | 'error'
}

export type AISettings = {
  providers: Partial<Record<AIProvider, AIProviderConfig>>
  defaultAnalysisProvider: AIProvider
  taskRouting: Partial<Record<AITaskRole, AIProvider>>
  persistKeys: boolean
}

export const DEFAULT_AI_SETTINGS: AISettings = {
  providers: {},
  defaultAnalysisProvider: 'openai',
  taskRouting: {
    marketResearch: 'perplexity',
    ideaDecisionMatrix: 'perplexity',
  },
  persistKeys: true,
}

export type PortfolioVerdict = 'new' | 'extension' | 'variant' | 'sharedBase'

export type ClarifyingQuestion = {
  id: string
  text: string
  dimension: 'intention' | 'problem' | 'proximity' | 'maturity' | 'energy'
  options: { id: string; label: string }[]
  allowFreeText: boolean
}

export type ClassificationProposal = {
  provisionalTitle: string
  understoodSummary: string
  verdict: PortfolioVerdict
  targetIdeaId?: string
  targetUmbrellaId?: string
  alternativeVerdict?: PortfolioVerdict
  alternativeNote?: string
  founderFitNote?: string
  energyNote?: string
  confidence: 'low' | 'medium' | 'high'
}

export type IdeaRefinementInput = string

export type IdeaRefinementResult = {
  description: string
  oneLiner?: string
  subtitle?: string
  whyNow?: string
  audience?: string
  strategicNotes?: string
  firstTest?: string
  nextStep?: string
  risks?: string
  brief: string
  founderFitNote: string
  changeSummary: string[]
  category?: string
  horizon?: string
  businessModelType?: string
  geography?: string
  dimensionScores?: Record<string, number>
  dimensionNotes?: Record<string, string>
}

export type IdeaAIAnalysis = {
  brief: string
  founderFitNote: string
  whyNow?: string
  audience?: string
  risks?: string
  oneLiner?: string
  subtitle?: string
  category?: string
  horizon?: string
  businessModelType?: string
  geography?: string
  dimensionScores?: Record<string, number>
  dimensionNotes?: Record<string, string>
}

export type ParseThoughtResult = {
  provisionalTitle: string
  problemSummary: string
  audienceHint?: string
  questions: ClarifyingQuestion[]
}

export type MarketResearchResult = {
  summary: string
  trends: string[]
  competitors: string[]
  sources?: string[]
}

export type PortfolioScanResult = {
  summary: string
  ecosystemNote?: string
  suggestedSynergies: {
    sourceIdeaId: string
    targetIdeaId: string
    note: string
    score: number
  }[]
  umbrellaCandidates: {
    name: string
    ideaIds: string[]
    note: string
  }[]
  sharedBases: {
    name: string
    ideaIds: string[]
    dimensions: ('audience' | 'infra' | 'brand' | 'backOffice' | 'channels')[]
    note: string
  }[]
  newIdeaProposals: {
    title: string
    oneLiner?: string
    description?: string
    rationale: string
    relatedIdeaIds?: string[]
  }[]
}

export type SynergySuggestResult = {
  summary: string
  suggestedSynergies: {
    sourceIdeaId: string
    targetIdeaId: string
    note: string
    score: number
    synergyType?: 'audience' | 'infra' | 'brand' | 'backOffice' | 'channels' | 'capabilities' | 'monetization' | 'crossSell'
  }[]
}

export type ExtrapolationMode = 'expand' | 'challenge' | 'focus'

export type ExtrapolationProposalResult = {
  title: string
  oneLiner?: string
  rationale: string
  triage: 'explore_now' | 'later' | 'off_focus'
  triageReason: string
}

export type IdeaExtrapolationExpandResult = {
  reformulation: string
  coreToPreserve: string
  corePromise?: string
  strategicQuestion?: string
  complementProposals: ExtrapolationProposalResult[]
  portfolioLinkProposals: (ExtrapolationProposalResult & { relatedIdeaIds: string[] })[]
}

export type IdeaExtrapolationChallengeResult = {
  reformulation: string
  coreToPreserve: string
  weaknesses: string[]
  criticalNotes: string[]
  hypothesesToTest: string[]
  strategicQuestion: string
}

export type IdeaExtrapolationFocusResult = {
  reformulation: string
  coreToPreserve: string
  tightenedIdea: string
  priorityDirections: string[]
  mistakesToAvoid: string[]
  strategicQuestion: string
  complementProposals: ExtrapolationProposalResult[]
  portfolioLinkProposals: (ExtrapolationProposalResult & { relatedIdeaIds: string[] })[]
}

export type IdeaExtrapolationResult =
  | ({ mode: 'expand' } & IdeaExtrapolationExpandResult)
  | ({ mode: 'challenge' } & IdeaExtrapolationChallengeResult)
  | ({ mode: 'focus' } & IdeaExtrapolationFocusResult)

export type StevenEvolutionResult = {
  learnedContext: string
  changeSummary: string[]
}

export type WeeklyReviewSummaryResult = {
  summary: string
  ideasToExplore: string[]
  ideasToPause: string[]
  reflections: string
}

export type BmcBlockHealth = 'strong' | 'moderate' | 'weak' | 'missing'

export type BmcBlockKey =
  | 'keyPartners'
  | 'keyActivities'
  | 'keyResources'
  | 'valuePropositions'
  | 'customerRelationships'
  | 'channels'
  | 'customerSegments'
  | 'costStructure'
  | 'revenueStreams'

export type BmcBlock = {
  summary: string
  detail: string
  health: BmcBlockHealth
  gapNote?: string
}

export type BusinessModelCanvasResult = {
  blocks: Record<BmcBlockKey, BmcBlock>
  overallGaps: string[]
  synthesis: string
}

/** Steven fill/challenge payload for the decision matrix (score computed client-side). */
export type DecisionMatrixAIResult = {
  niche: string
  competitorsOver100k: 'yes' | 'no' | 'unknown'
  topCompetitors: {
    name: string
    revenue: string
    revenueConfidence?: 'low' | 'medium' | 'high'
    sourceNote?: string
  }[]
  simplicity: number
  noSocial: boolean
  kiff: number
  marketability: number
  stevenChallenge: string
  stevenNotes?: string
}
