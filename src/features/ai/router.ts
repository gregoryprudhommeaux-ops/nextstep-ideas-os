import type { z } from 'zod'
import { Timestamp } from 'firebase/firestore'
import type { AIProvider, AISettings, AITaskRole } from '../../types/ai'
import type { FounderProfile, Idea, UmbrellaGroup } from '../../types/domain'
import type {
  ClassificationProposal,
  IdeaAIAnalysis,
  MarketResearchResult,
  ParseThoughtResult,
  PortfolioScanResult,
  StevenEvolutionResult,
  WeeklyReviewSummaryResult,
} from '../../types/ai'
import { nowTimestamp } from '../../lib/time'
import { buildStevenSystemPrompt } from '../steven/stevenBrain'
import { evolveStevenPrompt, type StevenEvolutionExchange } from '../steven/stevenEvolution'
import type { StevenConfig } from '../steven/types'
import { providerChat } from './providers'
import {
  classificationProposalSchema,
  founderStructuredSchema,
  ideaAnalysisSchema,
  marketResearchSchema,
  parseAIJson,
  parseThoughtResultSchema,
  portfolioScanSchema,
  stevenEvolutionResultSchema,
  weeklyReviewSummarySchema,
} from './schemas'
import {
  analyzeIdeaPrompt,
  classifyThoughtPrompt,
  parseThoughtPrompt,
  portfolioScanPrompt,
  structureProfilePrompt,
  weeklyReviewSummaryPrompt,
} from './prompts/tasks'
import { buildFounderContext, buildPortfolioContext, JSON_ONLY_RULE } from './prompts/context'

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
}

function getApiKey(settings: AISettings, provider: AIProvider): string | null {
  const config = settings.providers[provider]
  if (!config?.enabled || !config.apiKey.trim()) return null
  return config.apiKey.trim()
}

export function getProviderForTask(settings: AISettings, task: AITaskRole): AIProvider {
  return settings.taskRouting[task] ?? settings.defaultAnalysisProvider
}

export function isAIAvailable(settings: AISettings, task?: AITaskRole): boolean {
  if (task) {
    return getApiKey(settings, getProviderForTask(settings, task)) !== null
  }
  const coreTasks: AITaskRole[] = [
    'parseThought',
    'classifyPortfolio',
    'analyzeIdea',
    'marketResearch',
    'portfolioScan',
  ]
  return coreTasks.some((t) => getApiKey(settings, getProviderForTask(settings, t)) !== null)
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
  const provider = getProviderForTask(ctx.settings, task)
  const apiKey = getApiKey(ctx.settings, provider)
  if (!apiKey) {
    throw new Error(`Aucune clé API configurée pour ${provider}`)
  }

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
  return chatJson(
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
}

export async function analyzeIdea(
  ctx: AIRouterContext,
  title: string,
  description: string
): Promise<IdeaAIAnalysis> {
  return chatJson(
    ctx,
    'analyzeIdea',
    analyzeIdeaPrompt(title, description, buildFounderContext(ctx.founderProfile)),
    ideaAnalysisSchema
  )
}

export async function marketResearch(
  ctx: AIRouterContext,
  query: string
): Promise<MarketResearchResult> {
  const provider = getProviderForTask(ctx.settings, 'marketResearch')
  const apiKey = getApiKey(ctx.settings, provider)
  if (!apiKey) throw new Error('Clé Perplexity ou LLM requise pour la recherche marché')

  const raw = await providerChat(provider, apiKey, [
    {
      role: 'system',
      content: `${systemPrompt(ctx)}\n\nTu fais de la recherche marché concise. ${JSON_ONLY_RULE}`,
    },
    {
      role: 'user',
      content: `Recherche marché pour: ${clipPrompt(query)}\n\nJSON: { "summary": string, "trends": string[], "competitors": string[], "sources"?: string[] }`,
    },
  ])

  return parseAIJson(raw, marketResearchSchema)
}

export async function portfolioScan(ctx: AIRouterContext): Promise<PortfolioScanResult> {
  if (ctx.ideas.length < 2) {
    return { suggestedSynergies: [], umbrellaCandidates: [], sharedBases: [] }
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
