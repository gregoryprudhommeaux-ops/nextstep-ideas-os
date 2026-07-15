import type { AIProvider, IdeaAIAnalysis } from '../../types/ai'
import type { Idea, ScoreDimension } from '../../types/domain'
import { nowTimestamp } from '../../lib/time'
import { applyAnalysisToIdeaPatch } from '../ideas/ideaClassification'
import { normalizeIdeaTextPatch } from '../../lib/prose'
import { STRATEGIC_FIT_DIMENSIONS } from '../ideas/dimensionJustification'

export const IDEA_SCORE_DIMENSIONS: ScoreDimension[] = [
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

const DIMENSION_ALIASES: Record<string, ScoreDimension> = {
  personalalignment: 'personalAlignment',
  alignment: 'personalAlignment',
  personal: 'personalAlignment',
  freedomfit: 'freedomFit',
  freedom: 'freedomFit',
  remotefit: 'remoteFit',
  remote: 'remoteFit',
  scalabilityfit: 'scalabilityFit',
  scalability: 'scalabilityFit',
  scale: 'scalabilityFit',
  revenuepotential: 'revenuePotential',
  revenue: 'revenuePotential',
  speedtovalidation: 'speedToValidation',
  validationspeed: 'speedToValidation',
  validation: 'speedToValidation',
  speed: 'speedToValidation',
  excitementslevel: 'excitementLevel',
  excitementlevel: 'excitementLevel',
  excitement: 'excitementLevel',
  complexitylevel: 'complexityLevel',
  complexity: 'complexityLevel',
  ecosystemfit: 'ecosystemFit',
  ecosystem: 'ecosystemFit',
  capitalintensity: 'capitalIntensity',
  capital: 'capitalIntensity',
  capex: 'capitalIntensity',
}

function clampScore(value?: number): number {
  if (value == null || Number.isNaN(value)) return 5
  return Math.max(1, Math.min(10, Math.round(value)))
}

export function normalizeDimensionScores(raw: unknown): Partial<Record<ScoreDimension, number>> {
  if (!raw || typeof raw !== 'object') return {}
  const out: Partial<Record<ScoreDimension, number>> = {}
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value !== 'number') continue
    const normalizedKey = key.replace(/[^a-zA-Z]/g, '').toLowerCase()
    const dimension =
      (IDEA_SCORE_DIMENSIONS as readonly string[]).includes(key)
        ? (key as ScoreDimension)
        : DIMENSION_ALIASES[normalizedKey]
    if (dimension) out[dimension] = clampScore(value)
  }
  return out
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
  const normalized = normalizeDimensionScores(scores)
  const out = {} as Record<string, number>
  for (const key of IDEA_SCORE_DIMENSIONS) {
    out[key] = normalized[key] ?? 5
  }
  return out as ReturnType<typeof mapDimensionScores>
}

export function ideaAnalysisText(idea: Idea): { title: string; description: string } {
  const description = [
    idea.oneLiner,
    idea.description,
    idea.category ? `Catégorie: ${idea.category}` : '',
    idea.businessModelType ? `Modèle: ${idea.businessModelType}` : '',
    idea.geography ? `Géographie: ${idea.geography}` : '',
    idea.horizon ? `Horizon: ${idea.horizon}` : '',
    idea.audience ? `Audience: ${idea.audience}` : '',
    idea.whyNow ? `Pourquoi maintenant: ${idea.whyNow}` : '',
    idea.strategicNotes ? `Modèle / revenus: ${idea.strategicNotes}` : '',
    idea.risks ? `Risques: ${idea.risks}` : '',
    idea.inspirations?.length
      ? `Inspirations: ${idea.inspirations.map((i) => i.label || i.url).filter(Boolean).join(', ')}`
      : '',
    idea.aiAnalysis?.brief ? `Brief Steven: ${idea.aiAnalysis.brief}` : '',
    idea.aiAnalysis?.founderFitNote ? `Fit fondateur: ${idea.aiAnalysis.founderFitNote}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')

  return { title: idea.title, description: description || idea.title }
}

export function hasPlaceholderStrategicScores(idea: Idea): boolean {
  return STRATEGIC_FIT_DIMENSIONS.every((dimension) => idea[dimension] === 5)
}

/** True when AI returned undifferentiated mid-range scores (typical default pattern). */
export function needsScoreCalibration(
  scores?: Partial<Record<ScoreDimension, number>> | Record<string, number>
): boolean {
  const normalized = normalizeDimensionScores(scores)
  const strategic = STRATEGIC_FIT_DIMENSIONS.map((d) => normalized[d] ?? 5)
  if (strategic.every((s) => s === 5)) return true
  const distinct = new Set(strategic).size
  if (distinct <= 2 && strategic.every((s) => s >= 4 && s <= 6)) return true
  return false
}

export function patchIdeaFromAnalysis(
  idea: Idea,
  analysis: IdeaAIAnalysis,
  provider: AIProvider
): Partial<Idea> {
  const metadata = applyAnalysisToIdeaPatch(analysis, {
    category: idea.category,
    horizon: idea.horizon,
    businessModelType: idea.businessModelType,
    geography: idea.geography,
  })

  return normalizeIdeaTextPatch({
    ...metadata,
    description: idea.description?.trim() ? idea.description : analysis.brief,
    oneLiner: metadata.oneLiner ?? idea.oneLiner ?? analysis.oneLiner,
    ...mapDimensionScores(analysis.dimensionScores),
    scoreSource: idea.scoreSource === 'manual' ? 'hybrid' : 'ai',
    aiAnalysis: {
      ...analysis,
      dimensionNotes: analysis.dimensionNotes,
      analyzedAt: nowTimestamp(),
      provider,
    },
  })
}

export function dimensionScoresPromptBlock(): string {
  const keys = IDEA_SCORE_DIMENSIONS.map((k) => `"${k}"`).join(', ')
  return `"dimensionScores": { ${keys} — chaque valeur entière 1-10 },
  "dimensionNotes": { ${STRATEGIC_FIT_DIMENSIONS.map((k) => `"${k}"`).join(', ')} } — 1-2 phrases par dimension stratégique

Règles de scoring (obligatoires):
- INTERDIT de mettre 5/10 sur toutes les dimensions stratégiques — c'est une erreur.
- Au moins 4 dimensions stratégiques doivent différer de 5 ; utilise toute l'échelle 1-10.
- Calibre selon le profil fondateur ET la nature réelle du projet (local vs remote, service vs produit, etc.).
- Sois critique là où le modèle est lourd, local, peu scalable ou peu aligné avec le profil.
- personalAlignment: adéquation valeurs / énergie du fondateur.
- freedomFit & remoteFit: autonomie et exécution à distance (pénalise fort si présence physique requise).
- scalabilityFit & revenuePotential: potentiel de scale et revenus (pénalise les modèles artisanaux locaux).
- speedToValidation: rapidité pour tester l'hypothèse clé.
- complexityLevel & capitalIntensity: plus haut = plus lourd / cher (pénalités).
- excitementLevel & ecosystemFit: motivation durable et levier avec l'existant.

Exemples de calibration (ne pas copier — adapter au projet):
- Restaurant / retail local Guadalajara: personalAlignment 7, freedomFit 5, remoteFit 2, scalabilityFit 3, speedToValidation 5, revenuePotential 5
- Consulting food tech IA: personalAlignment 9, freedomFit 8, remoteFit 9, scalabilityFit 7, speedToValidation 8, revenuePotential 8
- Contenu / pédagogie chef: personalAlignment 8, freedomFit 7, remoteFit 6, scalabilityFit 5, speedToValidation 7, revenuePotential 6`
}
