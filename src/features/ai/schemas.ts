import { z } from 'zod'
import {
  BUSINESS_MODEL_VALUES,
  GEOGRAPHY_VALUES,
  HORIZON_VALUES,
  IDEA_CATEGORY_VALUES,
} from '../ideas/ideaClassification'
import {
  IDEA_SCORE_DIMENSIONS,
  normalizeDimensionScores,
} from '../scoring/dimensionScores'
import { STRATEGIC_FIT_DIMENSIONS } from '../ideas/dimensionJustification'
import { normalizeProseSpacing } from '../../lib/prose'

const ideaCategorySchema = z.enum(IDEA_CATEGORY_VALUES)
const horizonSchema = z.enum(HORIZON_VALUES)
const businessModelSchema = z.enum(BUSINESS_MODEL_VALUES)
const geographySchema = z.enum(GEOGRAPHY_VALUES)

const ideaMetadataFields = {
  category: ideaCategorySchema.optional(),
  horizon: horizonSchema.optional(),
  businessModelType: businessModelSchema.optional(),
  geography: geographySchema.optional(),
  oneLiner: z.string().optional(),
  subtitle: z.string().optional(),
}

const PORTFOLIO_VERDICT_VALUES = ['new', 'extension', 'variant', 'sharedBase'] as const
type PortfolioVerdictValue = (typeof PORTFOLIO_VERDICT_VALUES)[number]

function coercePortfolioVerdict(
  value: unknown,
  fallback?: PortfolioVerdictValue
): PortfolioVerdictValue | undefined {
  if (value === null || value === undefined || value === '') return fallback
  const raw = String(value).trim()
  if ((PORTFOLIO_VERDICT_VALUES as readonly string[]).includes(raw)) {
    return raw as PortfolioVerdictValue
  }
  const key = raw.toLowerCase().replace(/[^a-z]/g, '')
  const aliases: Record<string, PortfolioVerdictValue> = {
    new: 'new',
    newidea: 'new',
    nouvelle: 'new',
    nouveau: 'new',
    extension: 'extension',
    extend: 'extension',
    extensionofexisting: 'extension',
    variant: 'variant',
    variante: 'variant',
    varianteproche: 'variant',
    sharedbase: 'sharedBase',
    shared: 'sharedBase',
    socle: 'sharedBase',
    soclemutualise: 'sharedBase',
    mutualise: 'sharedBase',
    mutualized: 'sharedBase',
    umbrella: 'sharedBase',
    platform: 'sharedBase',
  }
  return aliases[key] ?? fallback
}

const portfolioVerdictSchema = z.preprocess(
  (value) => coercePortfolioVerdict(value, 'new'),
  z.enum(PORTFOLIO_VERDICT_VALUES)
)

const optionalPortfolioVerdictSchema = z.preprocess(
  (value) => coercePortfolioVerdict(value),
  z.enum(PORTFOLIO_VERDICT_VALUES).optional()
)

const confidenceSchema = z.preprocess((value) => {
  const raw = String(value ?? 'medium')
    .trim()
    .toLowerCase()
  if (raw.includes('low') || raw.includes('faible') || raw.includes('bas')) return 'low'
  if (raw.includes('high') || raw.includes('fort') || raw.includes('élev') || raw.includes('haut')) {
    return 'high'
  }
  return 'medium'
}, z.enum(['low', 'medium', 'high']))

const ideaDimensionScoreShape = Object.fromEntries(
  IDEA_SCORE_DIMENSIONS.map((key) => [key, z.number().min(1).max(10)])
) as Record<(typeof IDEA_SCORE_DIMENSIONS)[number], z.ZodNumber>

const ideaDimensionScoresSchema = z.preprocess((value) => {
  const normalized = normalizeDimensionScores(value)
  return Object.fromEntries(
    IDEA_SCORE_DIMENSIONS.map((key) => [key, normalized[key] ?? 5])
  )
}, z.object(ideaDimensionScoreShape))

const strategicDimensionNotesSchema = z.preprocess(
  (value) => (value && typeof value === 'object' ? value : {}),
  z
    .object(
      Object.fromEntries(
        STRATEGIC_FIT_DIMENSIONS.map((key) => [key, z.string().min(1)])
      ) as Record<(typeof STRATEGIC_FIT_DIMENSIONS)[number], z.ZodString>
    )
    .partial()
)

function coerceNonEmptyString(value: unknown): string {
  if (typeof value === 'string') {
    const trimmed = normalizeProseSpacing(value.trim())
    if (trimmed) return trimmed
  }
  return ''
}

function normalizeIdeaAnalysisPayload(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value
  const raw = { ...(value as Record<string, unknown>) }
  const brief =
    coerceNonEmptyString(raw.brief) ||
    coerceNonEmptyString(raw.description) ||
    coerceNonEmptyString(raw.summary) ||
    coerceNonEmptyString(raw.oneLiner)
  const founderFitNote =
    coerceNonEmptyString(raw.founderFitNote) ||
    coerceNonEmptyString(raw.founderFit) ||
    brief
  raw.brief = brief || 'Synthèse stratégique à affiner.'
  raw.founderFitNote = founderFitNote || raw.brief
  return raw
}

function normalizeRefinementPayload(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value
  const raw = { ...(value as Record<string, unknown>) }
  const description = coerceNonEmptyString(raw.description) || coerceNonEmptyString(raw.brief)
  const brief = coerceNonEmptyString(raw.brief) || description
  const founderFitNote =
    coerceNonEmptyString(raw.founderFitNote) || coerceNonEmptyString(raw.founderFit) || brief
  raw.description = description || 'Description à compléter.'
  raw.brief = brief || raw.description
  raw.founderFitNote = founderFitNote || raw.brief
  return raw
}

export const clarifyingQuestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  dimension: z.enum(['intention', 'problem', 'proximity', 'maturity', 'energy']),
  options: z.array(z.object({ id: z.string(), label: z.string() })).min(2).max(4),
  allowFreeText: z.boolean(),
})

export const parseThoughtResultSchema = z.object({
  provisionalTitle: z.string(),
  problemSummary: z.string(),
  audienceHint: z.string().optional(),
  questions: z.array(clarifyingQuestionSchema).max(3),
})

export const classificationProposalSchema = z.object({
  provisionalTitle: z.string(),
  understoodSummary: z.string(),
  verdict: portfolioVerdictSchema,
  targetIdeaId: z.string().optional(),
  targetUmbrellaId: z.string().optional(),
  alternativeVerdict: optionalPortfolioVerdictSchema,
  alternativeNote: z.string().optional(),
  founderFitNote: z.string().optional(),
  energyNote: z.string().optional(),
  confidence: confidenceSchema,
})

export const founderStructuredSchema = z.object({
  whoIAm: z.object({
    experienceSummary: z.string(),
    skills: z.array(z.string()),
    location: z.string().optional(),
    timeConstraints: z.string().optional(),
  }),
  whatIWant: z.object({
    lifestyleVision: z.string(),
    revenueTarget: z.string().optional(),
    autonomyVsSalary: z.enum(['autonomy', 'salary', 'balanced', 'unknown']),
    horizonYears: z.number().optional(),
  }),
  howIWork: z.object({
    personalitySummary: z.string(),
    riskTolerance: z.enum(['low', 'medium', 'high', 'unknown']),
    energyDrivers: z.array(z.string()),
    energyDrains: z.array(z.string()),
  }),
})

export const ideaRefinementResultSchema = z.preprocess(
  normalizeRefinementPayload,
  z.object({
  description: z.string(),
  ...ideaMetadataFields,
  whyNow: z.string().optional(),
  audience: z.string().optional(),
  strategicNotes: z.string().optional(),
  firstTest: z.string().optional(),
  nextStep: z.string().optional(),
  risks: z.string().optional(),
  brief: z.string(),
  founderFitNote: z.string(),
  changeSummary: z.array(z.string().min(1)).min(1).max(6),
  dimensionScores: ideaDimensionScoresSchema.optional(),
  dimensionNotes: strategicDimensionNotesSchema.optional(),
  })
)

export const ideaAnalysisSchema = z.preprocess(
  normalizeIdeaAnalysisPayload,
  z.object({
  brief: z.string(),
  founderFitNote: z.string(),
  category: ideaCategorySchema,
  horizon: horizonSchema,
  businessModelType: businessModelSchema,
  geography: geographySchema,
  oneLiner: z.string().optional(),
  subtitle: z.string().optional(),
  whyNow: z.string().optional(),
  audience: z.string().optional(),
  risks: z.string().optional(),
  dimensionScores: ideaDimensionScoresSchema,
  dimensionNotes: strategicDimensionNotesSchema,
  })
)

export const dimensionRationaleSchema = z.object({
  rationale: z.string(),
})

const bmcHealthSchema = z.enum(['strong', 'moderate', 'weak', 'missing'])

const bmcBlockSchema = z.object({
  summary: z.string().min(1),
  detail: z.string().min(1),
  health: bmcHealthSchema,
  gapNote: z.string().optional(),
})

const bmcBlockShape = {
  keyPartners: bmcBlockSchema,
  keyActivities: bmcBlockSchema,
  keyResources: bmcBlockSchema,
  valuePropositions: bmcBlockSchema,
  customerRelationships: bmcBlockSchema,
  channels: bmcBlockSchema,
  customerSegments: bmcBlockSchema,
  costStructure: bmcBlockSchema,
  revenueStreams: bmcBlockSchema,
} as const

export const businessModelCanvasSchema = z.object({
  blocks: z.object(bmcBlockShape),
  overallGaps: z.array(z.string().min(1)).min(1).max(8),
  synthesis: z.string().min(1),
})

export const marketResearchSchema = z.object({
  summary: z.string(),
  trends: z.array(z.string()),
  competitors: z.array(z.string()),
  sources: z.array(z.string()).optional(),
})

export const stevenEvolutionResultSchema = z.object({
  learnedContext: z.string(),
  changeSummary: z.array(z.string().min(1)).min(1).max(6),
})

export const portfolioScanSchema = z.object({
  summary: z.string().min(1),
  ecosystemNote: z.string().optional(),
  suggestedSynergies: z.array(
    z.object({
      sourceIdeaId: z.string(),
      targetIdeaId: z.string(),
      note: z.string(),
      score: z.number().min(1).max(10),
    })
  ),
  umbrellaCandidates: z.array(
    z.object({
      name: z.string(),
      ideaIds: z.array(z.string()),
      note: z.string(),
    })
  ),
  sharedBases: z.array(
    z.object({
      name: z.string(),
      ideaIds: z.array(z.string()),
      dimensions: z.array(z.enum(['audience', 'infra', 'brand', 'backOffice', 'channels'])),
      note: z.string(),
    })
  ),
  newIdeaProposals: z.array(
    z.object({
      title: z.string(),
      oneLiner: z.string().optional(),
      description: z.string().optional(),
      rationale: z.string(),
      relatedIdeaIds: z.array(z.string()).optional(),
    })
  ),
})

const synergyTypeSchema = z.enum([
  'audience',
  'infra',
  'brand',
  'backOffice',
  'channels',
  'capabilities',
  'monetization',
  'crossSell',
])

function normalizeSynergySuggestPayload(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value
  const raw = { ...(value as Record<string, unknown>) }
  const summary =
    coerceNonEmptyString(raw.summary) ||
    coerceNonEmptyString(raw.brief) ||
    coerceNonEmptyString(raw.ecosystemNote)
  raw.summary = summary || 'Synergies potentielles détectées.'
  return raw
}

export const synergySuggestSchema = z.preprocess(
  normalizeSynergySuggestPayload,
  z.object({
    summary: z.string().min(1),
    suggestedSynergies: z.array(
      z.object({
        sourceIdeaId: z.string(),
        targetIdeaId: z.string(),
        note: z.string(),
        score: z.number().min(1).max(10),
        synergyType: synergyTypeSchema.optional(),
      })
    ),
  })
)

const extrapolationTriageSchema = z.enum(['explore_now', 'later', 'off_focus'])

const extrapolationProposalSchema = z.object({
  title: z.string(),
  oneLiner: z.string().optional(),
  rationale: z.string(),
  triage: extrapolationTriageSchema,
  triageReason: z.string(),
})

const portfolioLinkProposalSchema = extrapolationProposalSchema.extend({
  relatedIdeaIds: z.array(z.string()).min(1).max(4),
})

export const ideaExtrapolationExpandSchema = z.object({
  reformulation: z.string(),
  coreToPreserve: z.string(),
  corePromise: z.string().optional(),
  strategicQuestion: z.string().optional(),
  complementProposals: z.array(extrapolationProposalSchema).min(3).max(10),
  portfolioLinkProposals: z.array(portfolioLinkProposalSchema),
})

export const ideaExtrapolationChallengeSchema = z.object({
  reformulation: z.string(),
  coreToPreserve: z.string(),
  weaknesses: z.array(z.string()).min(2).max(8),
  criticalNotes: z.array(z.string()).min(2).max(8),
  hypothesesToTest: z.array(z.string()).min(2).max(6),
  strategicQuestion: z.string(),
})

export const ideaExtrapolationFocusSchema = z.object({
  reformulation: z.string(),
  coreToPreserve: z.string(),
  tightenedIdea: z.string(),
  priorityDirections: z.array(z.string()).min(1).max(3),
  mistakesToAvoid: z.array(z.string()).min(1).max(3),
  strategicQuestion: z.string(),
  complementProposals: z.array(extrapolationProposalSchema),
  portfolioLinkProposals: z.array(portfolioLinkProposalSchema),
})

export const weeklyReviewSummarySchema = z.object({
  summary: z.string(),
  ideasToExplore: z.array(z.string()),
  ideasToPause: z.array(z.string()),
  reflections: z.string(),
})

/** LLMs often emit `null` for omitted fields; Zod `.optional()` expects `undefined`. */
function sanitizeAIJsonValue(value: unknown): unknown {
  if (value === null) return undefined
  if (Array.isArray(value)) return value.map(sanitizeAIJsonValue)
  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, v]) => [
        key,
        sanitizeAIJsonValue(v),
      ])
    )
  }
  return value
}

export function parseAIJson<T>(raw: string, schema: z.ZodType<T>): T {
  const trimmed = raw.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const jsonText = fenced ? fenced[1].trim() : trimmed
  let parsed: unknown
  try {
    parsed = sanitizeAIJsonValue(JSON.parse(jsonText))
  } catch {
    throw new Error('Réponse AI invalide — JSON attendu')
  }
  const result = schema.safeParse(parsed)
  if (!result.success) {
    const issue = result.error.issues[0]
    const path = issue?.path?.length ? `${issue.path.join('.')}: ` : ''
    throw new Error(`Réponse AI incomplète: ${path}${issue?.message ?? 'validation'}`)
  }
  return result.data
}
