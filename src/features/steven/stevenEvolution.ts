import type { ClassificationProposal, ClarifyingQuestion } from '../../types/ai'
import { JSON_ONLY_RULE } from '../ai/prompts/context'

export type StevenEvolutionExchange = {
  rawInput: string
  questions?: ClarifyingQuestion[]
  answers?: Record<string, string>
  proposal?: ClassificationProposal
  founderContext: string
  portfolioContext: string
  currentLearnedContext: string
}

export function evolveStevenPrompt(exchange: StevenEvolutionExchange): string {
  const qaBlock =
    exchange.questions?.length && exchange.answers
      ? `\nQUESTIONS / RÉPONSES:\n${exchange.questions
          .map((q) => `- Q: ${q.text}\n  R: ${exchange.answers?.[q.id] ?? '—'}`)
          .join('\n')}`
      : ''

  const proposalBlock = exchange.proposal
    ? `\nCLASSIFICATION RETENUE:\n- Titre: ${exchange.proposal.provisionalTitle}\n- Résumé: ${exchange.proposal.understoodSummary}\n- Verdict: ${exchange.proposal.verdict}\n- Fit fondateur: ${exchange.proposal.founderFitNote ?? '—'}\n- Énergie: ${exchange.proposal.energyNote ?? '—'}`
    : ''

  return `${JSON_ONLY_RULE}

Tu maintiens la mémoire évolutive de Steven sur ce fondateur. Après un échange de brainstorm, mets à jour le contexte appris.

CONTEXTE APPRIS ACTUEL (à enrichir, pas effacer sans raison):
"""
${exchange.currentLearnedContext || '(vide — première session)'}
"""

${exchange.founderContext}

${exchange.portfolioContext}

NOUVEL ÉCHANGE:
Pensée brute: ${exchange.rawInput}${qaBlock}${proposalBlock}

Retourne JSON:
{
  "learnedContext": string,
  "changeSummary": string[]
}

Règles pour learnedContext:
- Document concis en français, puces ou sections courtes
- Fusionne l'ancien contexte avec les nouveaux signaux (personnalité, compétences, préférences, patterns d'idées, risques de dispersion, énergie, secteurs attirants/évités)
- Maximum ~1200 mots — condense si nécessaire
- Pas de répétition inutile ; garde ce qui reste pertinent
- Ne invente pas de faits non présents dans l'échange ou le profil

Règles pour changeSummary (2 à 5 puces):
- Décris UNIQUEMENT ce qui change ou s'ajoute lors de CETTE mise à jour
- Phrases courtes, factuelles, en français
- Exemples: "Ajout: tendance à lier les idées au back-office freelance", "Précision: préfère les tests manuels avant tout build"`
}
