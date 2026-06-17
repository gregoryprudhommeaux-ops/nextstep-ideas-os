import type { FounderProfile } from '../../../types/domain'
import { JSON_ONLY_RULE } from './context'

export function structureProfilePrompt(profile: FounderProfile): string {
  return `${JSON_ONLY_RULE}

Structure le profil fondateur suivant en JSON avec exactement cette forme:
{
  "whoIAm": { "experienceSummary": string, "skills": string[], "location"?: string, "timeConstraints"?: string },
  "whatIWant": { "lifestyleVision": string, "revenueTarget"?: string, "autonomyVsSalary": "autonomy"|"salary"|"balanced"|"unknown", "horizonYears"?: number },
  "howIWork": { "personalitySummary": string, "riskTolerance": "low"|"medium"|"high"|"unknown", "energyDrivers": string[], "energyDrains": string[] }
}

TEXTE BRUT:
Qui je suis: ${profile.whoIAmRaw}
Ce que je veux: ${profile.whatIWantRaw}
Comment je fonctionne: ${profile.howIWorkRaw}`
}

export function parseThoughtPrompt(
  rawInput: string,
  founderContext: string,
  portfolioContext: string
): string {
  return `${JSON_ONLY_RULE}

Analyse cette pensée brute et retourne:
{
  "provisionalTitle": string,
  "problemSummary": string,
  "audienceHint"?: string,
  "questions": [{ "id": string, "text": string, "dimension": "intention"|"problem"|"proximity"|"maturity"|"energy", "options": [{ "id": string, "label": string }] (2-4), "allowFreeText": boolean }]
}

Règles pour questions (0 à 3 max):
- Clarifient l'intention, pas un business plan
- Toujours inclure "Je ne sais pas encore" comme option
- Choix simples quand possible

${founderContext}

${portfolioContext}

PENSÉE BRUTE:
${rawInput}`
}

export function classifyThoughtPrompt(
  rawInput: string,
  founderContext: string,
  portfolioContext: string,
  answers?: Record<string, string>
): string {
  const answersBlock =
    answers && Object.keys(answers).length > 0
      ? `\nRÉPONSES UTILISATEUR:\n${Object.entries(answers)
          .map(([k, v]) => `- ${k}: ${v}`)
          .join('\n')}`
      : ''

  return `${JSON_ONLY_RULE}

Propose une classification portfolio:
{
  "provisionalTitle": string,
  "understoodSummary": string,
  "verdict": "new"|"extension"|"variant"|"sharedBase",
  "targetIdeaId"?: string,
  "targetUmbrellaId"?: string,
  "alternativeVerdict"?: "new"|"extension"|"variant"|"sharedBase",
  "alternativeNote"?: string,
  "founderFitNote"?: string,
  "energyNote"?: string,
  "confidence": "low"|"medium"|"high"
}

Verdicts:
- new: thème absent du portfolio
- extension: même idée, nouvel angle (utiliser targetIdeaId)
- variant: proche d'une idée existante
- sharedBase: socle mutualisable entre plusieurs idées

${founderContext}

${portfolioContext}

PENSÉE:
${rawInput}${answersBlock}`
}

export function analyzeIdeaPrompt(
  ideaTitle: string,
  ideaDescription: string,
  founderContext: string
): string {
  return `${JSON_ONLY_RULE}

Analyse cette idée pour le fondateur:
{
  "brief": string,
  "founderFitNote": string,
  "whyNow"?: string,
  "audience"?: string,
  "risks"?: string,
  "dimensionScores"?: { "personalAlignment": 1-10, "freedomFit": 1-10, "remoteFit": 1-10, "scalabilityFit": 1-10, "revenuePotential": 1-10, "speedToValidation": 1-10, "excitementLevel": 1-10, "complexityLevel": 1-10, "ecosystemFit": 1-10, "capitalIntensity": 1-10 }
}

Pas de business plan. Langage naturel pour founderFitNote.

${founderContext}

IDÉE: ${ideaTitle}
${ideaDescription ? `DESCRIPTION: ${ideaDescription}` : ''}`
}

export function portfolioScanPrompt(founderContext: string, portfolioContext: string): string {
  return `${JSON_ONLY_RULE}

Analyse le portfolio et détecte synergies, regroupements umbrella et socles mutualisés.
Utilise UNIQUEMENT les idées listées (champs id:...).

{
  "suggestedSynergies": [{ "sourceIdeaId": string, "targetIdeaId": string, "note": string, "score": 1-10 }],
  "umbrellaCandidates": [{ "name": string, "ideaIds": string[], "note": string }],
  "sharedBases": [{ "name": string, "ideaIds": string[], "dimensions": ("audience"|"infra"|"brand"|"backOffice"|"channels")[], "note": string }]
}

Règles:
- Max 5 synergies, 3 umbrellas, 3 socles
- Ne propose pas de liens déjà évidents si peu de matière
- Pas de business plan — patterns et mutualisation seulement

${founderContext}

${portfolioContext}`
}

export function weeklyReviewSummaryPrompt(
  weekLabel: string,
  answers: { qStatusChange?: string; qSynergy?: string; qDeprioritize?: string },
  portfolioContext: string
): string {
  return `${JSON_ONLY_RULE}

Synthétise la review hebdomadaire du fondateur:
{
  "summary": string,
  "ideasToExplore": string[],
  "ideasToPause": string[],
  "reflections": string
}

Règles:
- ideasToExplore / ideasToPause: ids d'idées du portfolio (champ id:...)
- Ton coach ops, pas consultant
- Court et actionnable

Semaine: ${weekLabel}

Réponses:
- Moved: ${answers.qStatusChange ?? '—'}
- Synergy: ${answers.qSynergy ?? '—'}
- Deprioritize: ${answers.qDeprioritize ?? '—'}

${portfolioContext}`
}
