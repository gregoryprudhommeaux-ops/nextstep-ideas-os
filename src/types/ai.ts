export type AIProvider = 'openai' | 'anthropic' | 'google' | 'perplexity'

export type AITaskRole =
  | 'structureProfile'
  | 'parseThought'
  | 'refineThought'
  | 'classifyPortfolio'
  | 'analyzeIdea'
  | 'marketResearch'
  | 'portfolioScan'
  | 'evolveSteven'

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

export type IdeaAIAnalysis = {
  brief: string
  founderFitNote: string
  whyNow?: string
  audience?: string
  risks?: string
  dimensionScores?: Record<string, number>
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
}

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
