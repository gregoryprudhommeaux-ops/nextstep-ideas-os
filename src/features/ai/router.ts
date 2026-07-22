import type { z } from 'zod'
import { Timestamp } from 'firebase/firestore'
import type { AIProvider, AISettings, AITaskRole } from '../../types/ai'
import type {
  ExtrapolationMode,
  FounderProfile,
  Idea,
  IdeaBrainstormMessage,
  SynergyLink,
  UmbrellaGroup,
} from '../../types/domain'
import type {
  ClassificationProposal,
  IdeaAIAnalysis,
  IdeaRefinementResult,
  IdeaExtrapolationResult,
  MarketResearchResult,
  ParseThoughtResult,
  PortfolioScanResult,
  SynergySuggestResult,
  StevenEvolutionResult,
  WeeklyReviewSummaryResult,
  BusinessModelCanvasResult,
  DecisionMatrixAIResult,
} from '../../types/ai'
import { nowTimestamp } from '../../lib/time'
import { mergeMarketSources } from '../../lib/citations'
import { buildStevenSystemPrompt } from '../steven/stevenBrain'
import { evolveStevenPrompt, type StevenEvolutionExchange } from '../steven/stevenEvolution'
import type { StevenConfig } from '../steven/types'
import { providerChat, providerChatText } from './providers'
import type { ChatMessage } from './providers/base'
import { perplexityChatWithCitations } from './providers/perplexity'
import {
  classificationProposalSchema,
  dimensionRationaleSchema,
  founderStructuredSchema,
  ideaAnalysisSchema,
  ideaRefinementResultSchema,
  ideaExtrapolationExpandSchema,
  ideaExtrapolationChallengeSchema,
  ideaExtrapolationFocusSchema,
  marketResearchSchema,
  parseAIJson,
  parseThoughtResultSchema,
  portfolioScanSchema,
  synergySuggestSchema,
  businessModelCanvasSchema,
  decisionMatrixSchema,
  stevenEvolutionResultSchema,
  weeklyReviewSummarySchema,
} from './schemas'
import {
  analyzeIdeaPrompt,
  calibrateScoresPrompt,
  classifyThoughtPrompt,
  explainDimensionPrompt,
  parseThoughtPrompt,
  portfolioScanPrompt,
  synergySuggestPrompt,
  refineIdeaPrompt,
  applyBrainstormToIdeaPrompt,
  extrapolateIdeaPrompt,
  structureProfilePrompt,
  weeklyReviewSummaryPrompt,
  IDEA_BRAINSTORM_SYSTEM_ADDON,
  ideaBrainstormContextBlock,
  businessModelCanvasPrompt,
  decisionMatrixPrompt,
} from './prompts/tasks'
import { buildFounderContext, buildPortfolioContext, buildExistingSynergiesContext, JSON_ONLY_RULE } from './prompts/context'
import { needsScoreCalibration } from '../scoring/dimensionScores'
import { normalizeProseSpacing } from '../../lib/prose'
import { dimensionMeta } from '../scoring/dimensions'
import { getIdeaDimensionScore } from '../ideas/dimensionJustification'
import {
  resolveIdeaReferenceId,
  resolveUmbrellaReferenceId,
  synergyPairExists,
} from '../portfolio/portfolioUtils'
import type { ScoreDimension } from '../../types/domain'

const MAX_PROMPT_CHARS = 12_000

function clipPrompt(text: string): string {
  const trimmed = text.trim()
  if (trimmed.length <= MAX_PROMPT_CHARS) return trimmed
  return `${trimmed.slice(0, MAX_PROMPT_CHARS)}\n\n[…texte tronqué]`
}

export type AIRouterContext = {
  settings: AISettings
  steven?: Pick<StevenConfig, 'customInstructions' | 'learnedContext'> | null
  /** @deprecated use steven */
  stevenCustomInstructions?: string
  founderProfile: FounderProfile | null
  ideas: Idea[]
  umbrellaGroups: UmbrellaGroup[]
  synergyLinks?: SynergyLink[]
}

function getApiKey(settings: AISettings, provider: AIProvider): string | null {
  const key = settings.providers[provider]?.apiKey?.trim()
  return key || null
}

export function hasStoredApiKey(settings: AISettings, provider: AIProvider): boolean {
  return getApiKey(settings, provider) !== null
}

const PROVIDER_FALLBACK_ORDER: AIProvider[] = ['openai', 'google', 'perplexity', 'anthropic']

/** Pick the first provider with a tested key: task route → default → any configured. */
export function resolveProviderForTask(settings: AISettings, task: AITaskRole): AIProvider | null {
  const candidates: AIProvider[] = []
  const routed = settings.taskRouting[task]
  if (routed) candidates.push(routed)
  if (!candidates.includes(settings.defaultAnalysisProvider)) {
    candidates.push(settings.defaultAnalysisProvider)
  }
  for (const p of PROVIDER_FALLBACK_ORDER) {
    if (!candidates.includes(p)) candidates.push(p)
  }
  return candidates.find((p) => getApiKey(settings, p) !== null) ?? null
}

export function getProviderForTask(settings: AISettings, task: AITaskRole): AIProvider {
  return (
    resolveProviderForTask(settings, task) ??
    settings.taskRouting[task] ??
    settings.defaultAnalysisProvider
  )
}

export function isAIAvailable(settings: AISettings, task?: AITaskRole): boolean {
  if (task) {
    return resolveProviderForTask(settings, task) !== null
  }
  const coreTasks: AITaskRole[] = [
    'structureProfile',
    'parseThought',
    'refineThought',
    'classifyPortfolio',
    'analyzeIdea',
    'marketResearch',
    'portfolioScan',
    'suggestSynergies',
    'evolveSteven',
    'ideaExtrapolate',
    'ideaBrainstorm',
    'ideaBmcCanvas',
    'ideaDecisionMatrix',
  ]
  return coreTasks.some((t) => resolveProviderForTask(settings, t) !== null)
}

function systemPrompt(ctx: AIRouterContext): string {
  if (ctx.steven) return buildStevenSystemPrompt(ctx.steven)
  return buildStevenSystemPrompt(ctx.stevenCustomInstructions)
}

async function chatJson<T>(
  ctx: AIRouterContext,
  task: AITaskRole,
  userPrompt: string,
  schema: z.ZodType<T>
): Promise<T> {
  const provider = resolveProviderForTask(ctx.settings, task)
  if (!provider) {
    throw new Error('Aucune clé API configurée — ajoute une clé dans Settings.')
  }
  const apiKey = getApiKey(ctx.settings, provider)!

  const raw = await providerChat(provider, apiKey, [
    { role: 'system', content: systemPrompt(ctx) },
    { role: 'user', content: clipPrompt(userPrompt) },
  ])

  return parseAIJson(raw, schema)
}

export async function structureFounderProfile(
  ctx: AIRouterContext,
  profile: FounderProfile
): Promise<FounderProfile> {
  const structured = await chatJson(ctx, 'structureProfile', structureProfilePrompt(profile), founderStructuredSchema)

  return {
    ...profile,
    whoIAm: structured.whoIAm,
    whatIWant: structured.whatIWant,
    howIWork: structured.howIWork,
    lastStructuredAt: nowTimestamp(),
    updatedAt: Timestamp.now(),
  }
}

export async function parseThought(
  ctx: AIRouterContext,
  rawInput: string
): Promise<ParseThoughtResult> {
  return chatJson(
    ctx,
    'parseThought',
    parseThoughtPrompt(
      rawInput,
      buildFounderContext(ctx.founderProfile),
      buildPortfolioContext(ctx.ideas, ctx.umbrellaGroups)
    ),
    parseThoughtResultSchema
  )
}

export async function classifyThought(
  ctx: AIRouterContext,
  rawInput: string,
  answers?: Record<string, string>
): Promise<ClassificationProposal> {
  const result = await chatJson(
    ctx,
    'classifyPortfolio',
    classifyThoughtPrompt(
      rawInput,
      buildFounderContext(ctx.founderProfile),
      buildPortfolioContext(ctx.ideas, ctx.umbrellaGroups),
      answers
    ),
    classificationProposalSchema
  )
  return {
    ...result,
    targetIdeaId: resolveIdeaReferenceId(result.targetIdeaId, ctx.ideas),
    targetUmbrellaId: resolveUmbrellaReferenceId(result.targetUmbrellaId, ctx.umbrellaGroups),
  }
}

export type AnalyzeIdeaOptions = {
  portfolioContext?: string
}

export async function analyzeIdea(
  ctx: AIRouterContext,
  title: string,
  description: string,
  options?: AnalyzeIdeaOptions
): Promise<IdeaAIAnalysis> {
  const founderContext = buildFounderContext(ctx.founderProfile)
  let parsed = await chatJson(
    ctx,
    'analyzeIdea',
    analyzeIdeaPrompt(title, description, founderContext, options?.portfolioContext),
    ideaAnalysisSchema
  )

  if (needsScoreCalibration(parsed.dimensionScores)) {
    parsed = await chatJson(
      ctx,
      'analyzeIdea',
      calibrateScoresPrompt(title, description, founderContext, parsed.dimensionScores ?? {}),
      ideaAnalysisSchema
    )
  }

  const fallbackText = description.trim() || title.trim()
  return {
    ...parsed,
    brief: parsed.brief.trim() || fallbackText,
    founderFitNote: parsed.founderFitNote.trim() || parsed.brief.trim() || fallbackText,
  }
}

export async function explainDimensionScore(
  ctx: AIRouterContext,
  idea: Idea | null | undefined,
  dimension: ScoreDimension
): Promise<{ text: string; provider: AIProvider }> {
  if (!idea) throw new Error('Idée introuvable')
  const cached = idea.aiAnalysis?.dimensionNotes?.[dimension]?.trim()
  if (cached) {
    return {
      text: cached,
      provider: idea.aiAnalysis?.provider ?? ctx.settings.defaultAnalysisProvider,
    }
  }

  const provider = resolveProviderForTask(ctx.settings, 'analyzeIdea')
  if (!provider) throw new Error('Aucune clé API configurée — ajoute une clé dans Settings.')

  const meta = dimensionMeta[dimension]
  const score = getIdeaDimensionScore(idea, dimension)
  const { rationale } = await chatJson(
    ctx,
    'analyzeIdea',
    explainDimensionPrompt(
      {
        title: idea.title,
        description: idea.description,
        oneLiner: idea.oneLiner,
        audience: idea.audience,
        whyNow: idea.whyNow,
        aiBrief: idea.aiAnalysis?.brief,
        founderFitNote: idea.aiAnalysis?.founderFitNote,
      },
      dimension,
      meta.label,
      meta.description,
      score,
      buildFounderContext(ctx.founderProfile)
    ),
    dimensionRationaleSchema
  )

  return { text: rationale, provider }
}

export async function refineIdea(
  ctx: AIRouterContext,
  idea: Idea,
  notes: string
): Promise<IdeaRefinementResult> {
  return chatJson(
    ctx,
    'refineThought',
    refineIdeaPrompt(idea, notes, buildFounderContext(ctx.founderProfile)),
    ideaRefinementResultSchema
  )
}

export async function applyBrainstormToIdea(
  ctx: AIRouterContext,
  idea: Idea,
  thread: IdeaBrainstormMessage[]
): Promise<IdeaRefinementResult> {
  const transcript = thread
    .map((m) => `${m.role === 'user' ? 'Utilisateur' : 'Steven'}:\n${m.content}`)
    .join('\n\n---\n\n')

  return chatJson(
    ctx,
    'refineThought',
    applyBrainstormToIdeaPrompt(idea, transcript, buildFounderContext(ctx.founderProfile)),
    ideaRefinementResultSchema
  )
}

const AMBITION_LABELS: Record<string, string> = {
  quick_test: 'Test rapide / validation légère',
  side_business: 'Side business',
  main_business: 'Business principal',
  platform: 'Plateforme / écosystème',
}

export async function extrapolateIdea(
  ctx: AIRouterContext,
  idea: Idea,
  mode: ExtrapolationMode,
  inputs: { preserveInput: string; avoidInput: string; ambition: string }
): Promise<IdeaExtrapolationResult> {
  const otherIdeas = ctx.ideas.filter((i) => i.id !== idea.id)
  const promptInputs = {
    ...inputs,
    ambition: AMBITION_LABELS[inputs.ambition] ?? inputs.ambition,
  }
  const founderContext = buildFounderContext(ctx.founderProfile)
  const portfolioContext = buildPortfolioContext(otherIdeas, ctx.umbrellaGroups)
  const userPrompt = extrapolateIdeaPrompt(
    mode,
    idea,
    promptInputs,
    founderContext,
    portfolioContext
  )

  if (mode === 'expand') {
    const result = await chatJson(ctx, 'ideaExtrapolate', userPrompt, ideaExtrapolationExpandSchema)
    return { mode: 'expand', ...result }
  }
  if (mode === 'challenge') {
    const result = await chatJson(ctx, 'ideaExtrapolate', userPrompt, ideaExtrapolationChallengeSchema)
    return { mode: 'challenge', ...result }
  }
  const result = await chatJson(ctx, 'ideaExtrapolate', userPrompt, ideaExtrapolationFocusSchema)
  return { mode: 'focus', ...result }
}

export async function marketResearch(
  ctx: AIRouterContext,
  query: string
): Promise<MarketResearchResult> {
  const provider = resolveProviderForTask(ctx.settings, 'marketResearch')
  if (!provider) throw new Error('Clé Perplexity ou LLM requise pour la recherche marché')
  const apiKey = getApiKey(ctx.settings, provider)!

  const messages = [
    {
      role: 'system' as const,
      content: `${systemPrompt(ctx)}\n\nTu fais de la recherche marché concise. ${JSON_ONLY_RULE}`,
    },
    {
      role: 'user' as const,
      content: `Recherche marché pour: ${clipPrompt(query)}\n\nJSON: { "summary": string, "trends": string[], "competitors": string[] }\n\nCite les sources avec [1], [2]… dans le texte. Ne mets pas de champ "sources" dans le JSON — les URLs viennent de la recherche web.`,
    },
  ]

  if (provider === 'perplexity') {
    const { content, citations } = await perplexityChatWithCitations(apiKey, messages)
    const parsed = parseAIJson(content, marketResearchSchema)
    const sources = mergeMarketSources(citations, parsed.sources)
    return {
      ...parsed,
      sources,
    }
  }

  const raw = await providerChat(provider, apiKey, messages)
  const parsed = parseAIJson(raw, marketResearchSchema)
  return {
    ...parsed,
    sources: mergeMarketSources(parsed.sources),
  }
}

export async function portfolioScan(ctx: AIRouterContext): Promise<PortfolioScanResult> {
  if (ctx.ideas.length < 2) {
    return {
      summary: 'Pas assez d’idées pour une analyse globale.',
      suggestedSynergies: [],
      umbrellaCandidates: [],
      sharedBases: [],
      newIdeaProposals: [],
    }
  }

  return chatJson(
    ctx,
    'portfolioScan',
    portfolioScanPrompt(
      buildFounderContext(ctx.founderProfile),
      buildPortfolioContext(ctx.ideas, ctx.umbrellaGroups)
    ),
    portfolioScanSchema
  )
}

export async function suggestSynergies(ctx: AIRouterContext): Promise<SynergySuggestResult> {
  if (ctx.ideas.length < 2) {
    return { summary: 'Au moins deux idées sont nécessaires.', suggestedSynergies: [] }
  }

  const links = ctx.synergyLinks ?? []
  const parsed = await chatJson(
    ctx,
    'suggestSynergies',
    synergySuggestPrompt(
      buildFounderContext(ctx.founderProfile),
      buildPortfolioContext(ctx.ideas, ctx.umbrellaGroups),
      buildExistingSynergiesContext(ctx.ideas, links)
    ),
    synergySuggestSchema
  )

  const ideaIds = new Set(ctx.ideas.map((i) => i.id))
  const suggestions = parsed.suggestedSynergies
    .map((s) => ({
      ...s,
      sourceIdeaId: resolveIdeaReferenceId(s.sourceIdeaId, ctx.ideas) ?? s.sourceIdeaId,
      targetIdeaId: resolveIdeaReferenceId(s.targetIdeaId, ctx.ideas) ?? s.targetIdeaId,
    }))
    .filter(
      (s) =>
        ideaIds.has(s.sourceIdeaId) &&
        ideaIds.has(s.targetIdeaId) &&
        s.sourceIdeaId !== s.targetIdeaId &&
        !synergyPairExists(links, s.sourceIdeaId, s.targetIdeaId)
    )

  return { summary: parsed.summary, suggestedSynergies: suggestions }
}

export async function evolveSteven(
  ctx: AIRouterContext,
  exchange: Omit<StevenEvolutionExchange, 'founderContext' | 'portfolioContext' | 'currentLearnedContext'>
): Promise<StevenEvolutionResult> {
  const fullExchange: StevenEvolutionExchange = {
    ...exchange,
    currentLearnedContext: ctx.steven?.learnedContext ?? '',
    founderContext: buildFounderContext(ctx.founderProfile),
    portfolioContext: buildPortfolioContext(ctx.ideas, ctx.umbrellaGroups),
  }

  return chatJson(ctx, 'evolveSteven', evolveStevenPrompt(fullExchange), stevenEvolutionResultSchema)
}

export async function generateWeeklyReviewSummary(
  ctx: AIRouterContext,
  weekLabel: string,
  answers: { qStatusChange?: string; qSynergy?: string; qDeprioritize?: string }
): Promise<WeeklyReviewSummaryResult> {
  return chatJson(
    ctx,
    'analyzeIdea',
    weeklyReviewSummaryPrompt(weekLabel, answers, buildPortfolioContext(ctx.ideas, ctx.umbrellaGroups)),
    weeklyReviewSummarySchema
  )
}

const MAX_BRAINSTORM_HISTORY = 24

export async function sendIdeaBrainstormMessage(
  ctx: AIRouterContext,
  idea: Idea,
  history: IdeaBrainstormMessage[],
  userMessage: string
): Promise<{ content: string; provider: AIProvider }> {
  const provider = resolveProviderForTask(ctx.settings, 'ideaBrainstorm')
  if (!provider) {
    throw new Error('Aucune clé API configurée — ajoute une clé dans Settings.')
  }
  const apiKey = getApiKey(ctx.settings, provider)!

  const systemContent = clipPrompt(
    [
      systemPrompt(ctx),
      IDEA_BRAINSTORM_SYSTEM_ADDON,
      ideaBrainstormContextBlock(idea, buildFounderContext(ctx.founderProfile)),
    ].join('\n\n')
  )

  const trimmedHistory = history.slice(-MAX_BRAINSTORM_HISTORY)
  const messages: ChatMessage[] = [
    { role: 'system', content: systemContent },
    ...trimmedHistory.map((m) => ({
      role: m.role,
      content: clipPrompt(m.content),
    })),
    { role: 'user', content: clipPrompt(userMessage) },
  ]

  const raw = await providerChatText(provider, apiKey, messages, false)
  return { content: normalizeProseSpacing(raw.trim()), provider }
}

export async function generateBusinessModelCanvas(
  ctx: AIRouterContext,
  idea: Idea
): Promise<BusinessModelCanvasResult> {
  return chatJson(
    ctx,
    'ideaBmcCanvas',
    businessModelCanvasPrompt(idea, buildFounderContext(ctx.founderProfile)),
    businessModelCanvasSchema
  )
}

export async function fillDecisionMatrix(
  ctx: AIRouterContext,
  idea: Idea
): Promise<DecisionMatrixAIResult> {
  return chatJson(
    ctx,
    'ideaDecisionMatrix',
    decisionMatrixPrompt(idea, buildFounderContext(ctx.founderProfile)),
    decisionMatrixSchema
  )
}
