import { z } from 'zod'

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
  verdict: z.enum(['new', 'extension', 'variant', 'sharedBase']),
  targetIdeaId: z.string().optional(),
  targetUmbrellaId: z.string().optional(),
  alternativeVerdict: z.enum(['new', 'extension', 'variant', 'sharedBase']).optional(),
  alternativeNote: z.string().optional(),
  founderFitNote: z.string().optional(),
  energyNote: z.string().optional(),
  confidence: z.enum(['low', 'medium', 'high']),
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

export const ideaAnalysisSchema = z.object({
  brief: z.string(),
  founderFitNote: z.string(),
  whyNow: z.string().optional(),
  audience: z.string().optional(),
  risks: z.string().optional(),
  dimensionScores: z.record(z.string(), z.number().min(1).max(10)).optional(),
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
})

export const weeklyReviewSummarySchema = z.object({
  summary: z.string(),
  ideasToExplore: z.array(z.string()),
  ideasToPause: z.array(z.string()),
  reflections: z.string(),
})

export function parseAIJson<T>(raw: string, schema: z.ZodType<T>): T {
  const trimmed = raw.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const jsonText = fenced ? fenced[1].trim() : trimmed
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    throw new Error('Réponse AI invalide — JSON attendu')
  }
  const result = schema.safeParse(parsed)
  if (!result.success) {
    throw new Error(`Réponse AI incomplète: ${result.error.issues[0]?.message ?? 'validation'}`)
  }
  return result.data
}
