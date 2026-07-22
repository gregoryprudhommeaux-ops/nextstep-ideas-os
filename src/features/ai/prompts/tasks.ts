import type { FounderProfile } from '../../../types/domain'
import { ANTI_SLOP_PROSE_RULE, JSON_ONLY_RULE } from './context'

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
- Ne pas inclure "Je ne sais pas encore" dans options — l'UI l'ajoute automatiquement
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

Verdicts (valeurs exactes, minuscules):
- new: thème absent du portfolio
- extension: même idée, nouvel angle (targetIdeaId = id exact d'une idée listée ci-dessus)
- variant: proche d'une idée existante
- sharedBase: socle mutualisable entre plusieurs idées

Ne jamais inventer d'autres valeurs pour verdict ou alternativeVerdict.
Omettre les champs optionnels absents — ne pas les mettre à null.

${founderContext}

${portfolioContext}

PENSÉE:
${rawInput}${answersBlock}`
}

import { dimensionScoresPromptBlock } from '../../scoring/dimensionScores'

export function analyzeIdeaPrompt(
  ideaTitle: string,
  ideaDescription: string,
  founderContext: string,
  portfolioContext?: string
): string {
  return `${JSON_ONLY_RULE}

Analyse cette idée pour le fondateur:
{
  "brief": string,
  "founderFitNote": string,
  "oneLiner"?: string,
  "subtitle"?: string,
  "whyNow"?: string,
  "audience"?: string,
  "risks"?: string,
  "category": "service"|"productizedService"|"saasAi"|"communityPlatform"|"hospitality"|"mediaBrand"|"consulting"|"marketplace"|"digitalAsset"|"localPhysical",
  "horizon": "0_30d"|"30_90d"|"3_12m"|"1_3y",
  "businessModelType": "services"|"productizedServices"|"subscriptionSaas"|"marketplaceTakeRate"|"transactional"|"licensing"|"adsSponsorship"|"affiliation"|"hybrid",
  "geography": "local"|"national"|"europe"|"global",
  ${dimensionScoresPromptBlock()}
}

Champs obligatoires (strings non vides): brief, founderFitNote, dimensionScores (toutes les clés listées).
brief = synthèse stratégique en 2-4 phrases. founderFitNote = adéquation avec le profil fondateur.
Choisis category, horizon, businessModelType et geography en fonction du projet réel (pas de défaut SaaS).
Exemples: jardinage urbain → localPhysical + services + local ; SaaS B2B → saasAi + subscriptionSaas.

Pas de business plan. Langage naturel pour founderFitNote.
Espaces corrects entre les mots — jamais de mots collés (ex. « revenus combine », pas « revenusCombine »).
${ANTI_SLOP_PROSE_RULE}

${founderContext}
${portfolioContext ? `\n${portfolioContext}\n\nCalibre les scores relativement aux autres idées du portfolio quand pertinent.` : ''}

IDÉE: ${ideaTitle}
${ideaDescription ? `DESCRIPTION: ${ideaDescription}` : ''}`
}

export function calibrateScoresPrompt(
  ideaTitle: string,
  ideaDescription: string,
  founderContext: string,
  previousScores: Record<string, number>
): string {
  return `${JSON_ONLY_RULE}

Tes scores précédents pour cette idée étaient trop neutres (5/10 partout ou sans écart réel).
Recalibre avec discernement et retourne le JSON complet d'analyse.

Scores précédents à NE PAS reproduire: ${JSON.stringify(previousScores)}

{
  "brief": string,
  "founderFitNote": string,
  "oneLiner"?: string,
  "subtitle"?: string,
  "whyNow"?: string,
  "audience"?: string,
  "risks"?: string,
  "category": "service"|"productizedService"|"saasAi"|"communityPlatform"|"hospitality"|"mediaBrand"|"consulting"|"marketplace"|"digitalAsset"|"localPhysical",
  "horizon": "0_30d"|"30_90d"|"3_12m"|"1_3y",
  "businessModelType": "services"|"productizedServices"|"subscriptionSaas"|"marketplaceTakeRate"|"transactional"|"licensing"|"adsSponsorship"|"affiliation"|"hybrid",
  "geography": "local"|"national"|"europe"|"global",
  ${dimensionScoresPromptBlock()}
}

${ANTI_SLOP_PROSE_RULE}

${founderContext}

IDÉE: ${ideaTitle}
${ideaDescription ? `DESCRIPTION: ${ideaDescription}` : ''}`
}

export function refineIdeaPrompt(
  idea: {
    title: string
    description?: string
    oneLiner?: string
    audience?: string
    whyNow?: string
    strategicNotes?: string
    firstTest?: string
    nextStep?: string
    risks?: string
  },
  notes: string,
  founderContext: string
): string {
  const snapshot = [
    `Titre: ${idea.title}`,
    idea.oneLiner ? `Résumé: ${idea.oneLiner}` : '',
    idea.description ? `Description: ${idea.description}` : '',
    idea.audience ? `Audience: ${idea.audience}` : '',
    idea.whyNow ? `Why now: ${idea.whyNow}` : '',
    idea.strategicNotes ? `Modèle / revenus: ${idea.strategicNotes}` : '',
    idea.firstTest ? `Premier test: ${idea.firstTest}` : '',
    idea.nextStep ? `Prochaine étape: ${idea.nextStep}` : '',
    idea.risks ? `Risques: ${idea.risks}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  return `${JSON_ONLY_RULE}

L'utilisateur revient sur une idée déjà capturée pour l'affiner avec de nouvelles précisions libres.
Trie toi-même le contenu (deal, modèle opérationnel, vision marché, pistes, risques…) et répartis-le dans les bons champs de la fiche.
Intègre sans tout réécrire from scratch. Pas de business plan. Langage naturel pour founderFitNote.
Espaces corrects entre les mots — jamais de mots collés (ex. « revenus combine », pas « revenusCombine »).
${ANTI_SLOP_PROSE_RULE}

Retourne:
{
  "description": string,
  "oneLiner"?: string,
  "whyNow"?: string,
  "audience"?: string,
  "strategicNotes"?: string,
  "firstTest"?: string,
  "nextStep"?: string,
  "risks"?: string,
  "brief": string,
  "founderFitNote": string,
  "category"?: "service"|"productizedService"|"saasAi"|"communityPlatform"|"hospitality"|"mediaBrand"|"consulting"|"marketplace"|"digitalAsset"|"localPhysical",
  "horizon"?: "0_30d"|"30_90d"|"3_12m"|"1_3y",
  "businessModelType"?: "services"|"productizedServices"|"subscriptionSaas"|"marketplaceTakeRate"|"transactional"|"licensing"|"adsSponsorship"|"affiliation"|"hybrid",
  "geography"?: "local"|"national"|"europe"|"global",
  "changeSummary": string[] (2-5 bullets sur ce qui a évolué),
  ${dimensionScoresPromptBlock()}
}

${founderContext}

FICHE ACTUELLE:
${snapshot}

NOUVELLES PRÉCISIONS (texte libre):
${notes.trim() || '(aucune)'}`
}

export function applyBrainstormToIdeaPrompt(
  idea: {
    title: string
    description?: string
    oneLiner?: string
    audience?: string
    whyNow?: string
    strategicNotes?: string
    firstTest?: string
    nextStep?: string
    risks?: string
    aiAnalysis?: { brief?: string; founderFitNote?: string }
  },
  transcript: string,
  founderContext: string
): string {
  const snapshot = [
    `Titre: ${idea.title}`,
    idea.oneLiner ? `Résumé: ${idea.oneLiner}` : '',
    idea.description ? `Description: ${idea.description}` : '',
    idea.audience ? `Audience: ${idea.audience}` : '',
    idea.whyNow ? `Why now: ${idea.whyNow}` : '',
    idea.strategicNotes ? `Modèle / revenus: ${idea.strategicNotes}` : '',
    idea.firstTest ? `Premier test: ${idea.firstTest}` : '',
    idea.nextStep ? `Prochaine étape: ${idea.nextStep}` : '',
    idea.risks ? `Risques: ${idea.risks}` : '',
    idea.aiAnalysis?.brief ? `Brief actuel: ${idea.aiAnalysis.brief}` : '',
    idea.aiAnalysis?.founderFitNote
      ? `Fit fondateur actuel: ${idea.aiAnalysis.founderFitNote}`
      : '',
  ]
    .filter(Boolean)
    .join('\n')

  return `${JSON_ONLY_RULE}

L'utilisateur a brainstormé avec Steven sur cette idée. Intègre les échanges ci-dessous dans la fiche projet et l'analyse stratégique.
- Mets à jour description, oneLiner, audience, modèle, tests, risques selon les clarifications apportées dans la conversation
- Regénère brief et founderFitNote pour refléter la vision affinée
- Recalibre dimensionScores si les échanges changent substantiellement l'évaluation
- changeSummary : ce qui a évolué grâce au brainstorm (2-5 bullets concrètes)

Ne perds pas ce qui reste valide dans la fiche actuelle. Priorise les corrections explicites de l'utilisateur sur les hypothèses antérieures.
Pas de business plan. Langage naturel pour founderFitNote.
Espaces corrects entre les mots — jamais de mots collés.
${ANTI_SLOP_PROSE_RULE}

Retourne:
{
  "description": string,
  "oneLiner"?: string,
  "whyNow"?: string,
  "audience"?: string,
  "strategicNotes"?: string,
  "firstTest"?: string,
  "nextStep"?: string,
  "risks"?: string,
  "brief": string,
  "founderFitNote": string,
  "category"?: "service"|"productizedService"|"saasAi"|"communityPlatform"|"hospitality"|"mediaBrand"|"consulting"|"marketplace"|"digitalAsset"|"localPhysical",
  "horizon"?: "0_30d"|"30_90d"|"3_12m"|"1_3y",
  "businessModelType"?: "services"|"productizedServices"|"subscriptionSaas"|"marketplaceTakeRate"|"transactional"|"licensing"|"adsSponsorship"|"affiliation"|"hybrid",
  "geography"?: "local"|"national"|"europe"|"global",
  "changeSummary": string[] (2-5 bullets sur ce qui a évolué),
  ${dimensionScoresPromptBlock()}
}

${founderContext}

FICHE ACTUELLE:
${snapshot}

ÉCHANGES BRAINSTORMING (conversation complète):
${transcript.trim() || '(aucun échange)'}`
}

export function portfolioScanPrompt(founderContext: string, portfolioContext: string): string {
  return `${JSON_ONLY_RULE}

Analyse le portfolio et détecte synergies, regroupements umbrella et socles mutualisés.
Utilise UNIQUEMENT les idées listées (champs id:...).

{
  "summary": string,
  "ecosystemNote": string (optionnel — comment les projets pourraient fonctionner ensemble),
  "suggestedSynergies": [{ "sourceIdeaId": string, "targetIdeaId": string, "note": string, "score": 1-10 }],
  "umbrellaCandidates": [{ "name": string, "ideaIds": string[], "note": string }],
  "sharedBases": [{ "name": string, "ideaIds": string[], "dimensions": ("audience"|"infra"|"brand"|"backOffice"|"channels")[], "note": string }],
  "newIdeaProposals": [{ "title": string, "oneLiner": string (optionnel), "description": string (optionnel), "rationale": string, "relatedIdeaIds": string[] (optionnel) }]
}

Règles:
- summary: 2-4 phrases sur la dynamique globale du portfolio
- Max 5 synergies, 3 umbrellas, 3 socles, 3 nouvelles idées émergentes
- newIdeaProposals: projets distincts qui pourraient naître de la combinaison (pas des variantes triviales)
- Ne propose pas de liens déjà évidents si peu de matière
- Pas de business plan — patterns et mutualisation seulement
${ANTI_SLOP_PROSE_RULE}

${founderContext}

${portfolioContext}`
}

export function synergySuggestPrompt(
  founderContext: string,
  portfolioContext: string,
  existingSynergiesContext: string
): string {
  return `${JSON_ONLY_RULE}

Tu es Steven. Propose des synergies manquantes entre les idées du portfolio.
Utilise UNIQUEMENT les idées listées (champs id:...). Ne repropose pas les liens déjà existants.

{
  "summary": string,
  "suggestedSynergies": [{
    "sourceIdeaId": string,
    "targetIdeaId": string,
    "note": string,
    "score": 1-10,
    "synergyType"?: "audience"|"infra"|"brand"|"backOffice"|"channels"|"capabilities"|"monetization"|"crossSell"
  }]
}

Règles:
- summary: 1-2 phrases sur les patterns de connexion possibles
- 3 à 8 synergies max, priorise les plus actionnables
- score: force réelle du lien (pas 7 partout)
- synergyType: nature principale du lien
- note: pourquoi ces deux idées se renforcent (concret, pas générique)
- Privilégie les idées sans lien ou peu connectées quand pertinent

${founderContext}

${portfolioContext}

${existingSynergiesContext}`
}

export function extrapolateIdeaPrompt(
  mode: 'expand' | 'challenge' | 'focus',
  idea: {
    id: string
    title: string
    oneLiner?: string
    description?: string
    audience?: string
    whyNow?: string
    strategicNotes?: string
    category?: string
    horizon?: string
  },
  inputs: {
    preserveInput: string
    avoidInput: string
    ambition: string
  },
  founderContext: string,
  portfolioContext: string
): string {
  const snapshot = [
    `id:${idea.id}`,
    `Titre: ${idea.title}`,
    idea.oneLiner ? `Pitch: ${idea.oneLiner}` : '',
    idea.description ? `Description: ${idea.description}` : '',
    idea.audience ? `Audience: ${idea.audience}` : '',
    idea.whyNow ? `Why now: ${idea.whyNow}` : '',
    idea.strategicNotes ? `Modèle: ${idea.strategicNotes}` : '',
    idea.category ? `Catégorie: ${idea.category}` : '',
    idea.horizon ? `Horizon: ${idea.horizon}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  const inputsBlock = `Entrées utilisateur :
- À préserver absolument : ${inputs.preserveInput.trim() || '(non précisé — infère depuis la fiche)'}
- À éviter : ${inputs.avoidInput.trim() || '(non précisé)'}
- Niveau d'ambition : ${inputs.ambition}`

  const base = `${JSON_ONLY_RULE}

${inputsBlock}

${founderContext}

${portfolioContext}

IDÉE À EXPLORER :
${snapshot}`

  if (mode === 'expand') {
    return `${base}

Tu es Steven en mode **EXPAND** — enrichir autour du noyau sans le diluer.
Objectif : reformuler l'idée, expliciter le cœur, proposer des extensions proches + des liens portfolio.

Règles :
- complementProposals : 5 à 8 pistes très proches du noyau
- portfolioLinkProposals : 0 à 5 ponts avec d'autres idées du portfolio (relatedIdeaIds obligatoires, pas l'idée courante)
- triage sur chaque proposition : explore_now | later | off_focus + triageReason
- Pas de business plan. Direct. Langue de l'utilisateur (FR · EN · ES).
${ANTI_SLOP_PROSE_RULE}

JSON :
{
  "reformulation": string,
  "coreToPreserve": string,
  "corePromise": string (optionnel),
  "strategicQuestion": string (optionnel),
  "complementProposals": [{ "title": string, "oneLiner": string (optionnel), "rationale": string, "triage": "explore_now"|"later"|"off_focus", "triageReason": string }],
  "portfolioLinkProposals": [{ "title": string, "oneLiner": string (optionnel), "rationale": string, "relatedIdeaIds": string[], "triage": "explore_now"|"later"|"off_focus", "triageReason": string }]
}`
  }

  if (mode === 'challenge') {
    return `${base}

Tu es Steven en mode **CHALLENGE** — tester la robustesse sans enrichir le portefeuille.
Objectif : reformuler, ancrer le noyau, exposer faiblesses, angles morts et hypothèses à valider.
Ne propose PAS de nouvelles idées business (pas de complementProposals).

Règles :
- Sois exigeant mais constructif — pas de condescendance
- Challenge : client, exécution, différenciation, faisabilité, dispersion
- Pas de business plan. Direct. Langue de l'utilisateur (FR · EN · ES).
${ANTI_SLOP_PROSE_RULE}

JSON :
{
  "reformulation": string,
  "coreToPreserve": string,
  "weaknesses": string[],
  "criticalNotes": string[],
  "hypothesesToTest": string[],
  "strategicQuestion": string
}`
  }

  return `${base}

Tu es Steven en mode **FOCUS** — recentrer, trier et couper ce qui dérive.
Objectif : version resserrée, directions prioritaires, erreurs à éviter, tri explicite des pistes.

Règles :
- complementProposals : 0 à 5 pistes avec triage (beaucoup en off_focus ou later si elles dérivent)
- portfolioLinkProposals : 0 à 4 liens portfolio — uniquement si cohérents avec le cœur
- Marque hors focus sans complaisance
- Pas de business plan. Direct. Langue de l'utilisateur (FR · EN · ES).
${ANTI_SLOP_PROSE_RULE}

JSON :
{
  "reformulation": string,
  "coreToPreserve": string,
  "tightenedIdea": string,
  "priorityDirections": string[] (max 3),
  "mistakesToAvoid": string[] (max 3),
  "strategicQuestion": string,
  "complementProposals": [{ "title": string, "oneLiner": string (optionnel), "rationale": string, "triage": "explore_now"|"later"|"off_focus", "triageReason": string }],
  "portfolioLinkProposals": [{ "title": string, "oneLiner": string (optionnel), "rationale": string, "relatedIdeaIds": string[], "triage": "explore_now"|"later"|"off_focus", "triageReason": string }]
}`
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

export function explainDimensionPrompt(
  idea: {
    title: string
    description?: string
    oneLiner?: string
    audience?: string
    whyNow?: string
    aiBrief?: string
    founderFitNote?: string
  },
  dimensionKey: string,
  dimensionLabel: string,
  dimensionDescription: string,
  score: number,
  founderContext: string
): string {
  return `${JSON_ONLY_RULE}

Explique en 2-3 phrases (langue de l'utilisateur / FR par défaut) pourquoi cette idée mérite ${score}/10 sur « ${dimensionLabel} ».
Ton de Steven : direct, concret, pas de business plan. Ancre-toi sur le profil fondateur et la fiche idée.
${ANTI_SLOP_PROSE_RULE}

JSON: { "rationale": string }

${founderContext}

IDÉE: ${idea.title}
${idea.oneLiner ? `Résumé: ${idea.oneLiner}` : ''}
${idea.description ? `Description: ${idea.description}` : ''}
${idea.aiBrief ? `Analyse: ${idea.aiBrief}` : ''}
${idea.founderFitNote ? `Fit fondateur: ${idea.founderFitNote}` : ''}

DIMENSION: ${dimensionLabel} (${dimensionKey})
Définition: ${dimensionDescription}
Score actuel: ${score}/10`
}

export const IDEA_BRAINSTORM_SYSTEM_ADDON = `MODE BRAINSTORMING (idée en cours)
Tu échanges en conversation avec le fondateur pour faire avancer CE projet précis.
Tu peux produire selon la demande :
- prompts complets prêts à coller (Cursor, ChatGPT, Claude, autre IA)
- PRD / plans structurés en Markdown
- specs, checklists, scripts d'interview, plans de test

Règles de format :
- Réponds en Markdown naturel (pas de JSON, pas de wrapper), dans la langue de l'utilisateur (FR · EN · ES).
- Pour tout livrable important (PRD, prompt, plan, spec), mets-le dans un bloc \`\`\`markdown ... \`\`\` pour faciliter le téléchargement.
- Espaces corrects entre les mots — jamais de mots collés.
- Concret, actionnable, aligné profil fondateur + fiche idée.
- Si la demande est vague, propose 2–3 options courtes avant le livrable.
- Applique strictement la doctrine anti-AI-slop du system prompt (prose humaine, pas de jargon vide, syntaxe sans tells IA).`

export function ideaBrainstormContextBlock(
  idea: {
    title: string
    subtitle?: string
    oneLiner?: string
    description?: string
    audience?: string
    whyNow?: string
    strategicNotes?: string
    firstTest?: string
    nextStep?: string
    risks?: string
    category?: string
    horizon?: string
    businessModelType?: string
    geography?: string
    aiAnalysis?: { brief?: string; founderFitNote?: string }
  },
  founderContext: string
): string {
  const lines = [
    `Titre: ${idea.title}`,
    idea.subtitle ? `Sous-titre: ${idea.subtitle}` : '',
    idea.oneLiner ? `Résumé: ${idea.oneLiner}` : '',
    idea.description ? `Description: ${idea.description}` : '',
    idea.audience ? `Audience: ${idea.audience}` : '',
    idea.whyNow ? `Pourquoi maintenant: ${idea.whyNow}` : '',
    idea.strategicNotes ? `Modèle / revenus: ${idea.strategicNotes}` : '',
    idea.firstTest ? `Premier test: ${idea.firstTest}` : '',
    idea.nextStep ? `Prochaine étape: ${idea.nextStep}` : '',
    idea.risks ? `Risques: ${idea.risks}` : '',
    idea.category ? `Catégorie: ${idea.category}` : '',
    idea.horizon ? `Horizon: ${idea.horizon}` : '',
    idea.businessModelType ? `Modèle: ${idea.businessModelType}` : '',
    idea.geography ? `Géographie: ${idea.geography}` : '',
    idea.aiAnalysis?.brief ? `Brief Steven: ${idea.aiAnalysis.brief}` : '',
    idea.aiAnalysis?.founderFitNote ? `Fit fondateur: ${idea.aiAnalysis.founderFitNote}` : '',
  ].filter(Boolean)

  return `${founderContext}

FICHE IDÉE (contexte figé pour cette session) :
${lines.join('\n')}`
}

export function businessModelCanvasPrompt(
  idea: {
    title: string
    subtitle?: string
    oneLiner?: string
    description?: string
    audience?: string
    whyNow?: string
    strategicNotes?: string
    firstTest?: string
    nextStep?: string
    risks?: string
    category?: string
    horizon?: string
    businessModelType?: string
    geography?: string
    aiAnalysis?: { brief?: string; founderFitNote?: string }
    marketResearch?: { summary?: string }
  },
  founderContext: string
): string {
  const snapshot = [
    `Titre: ${idea.title}`,
    idea.subtitle ? `Sous-titre: ${idea.subtitle}` : '',
    idea.oneLiner ? `Résumé: ${idea.oneLiner}` : '',
    idea.description ? `Description: ${idea.description}` : '',
    idea.audience ? `Audience: ${idea.audience}` : '',
    idea.whyNow ? `Pourquoi maintenant: ${idea.whyNow}` : '',
    idea.strategicNotes ? `Modèle / revenus: ${idea.strategicNotes}` : '',
    idea.firstTest ? `Premier test: ${idea.firstTest}` : '',
    idea.nextStep ? `Prochaine étape: ${idea.nextStep}` : '',
    idea.risks ? `Risques: ${idea.risks}` : '',
    idea.category ? `Catégorie: ${idea.category}` : '',
    idea.businessModelType ? `Type modèle: ${idea.businessModelType}` : '',
    idea.geography ? `Géographie: ${idea.geography}` : '',
    idea.aiAnalysis?.brief ? `Brief Steven: ${idea.aiAnalysis.brief}` : '',
    idea.aiAnalysis?.founderFitNote ? `Fit fondateur: ${idea.aiAnalysis.founderFitNote}` : '',
    idea.marketResearch?.summary ? `Recherche marché: ${idea.marketResearch.summary}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  return `${JSON_ONLY_RULE}

Construis un Business Model Canvas pour cette idée.
Sois critique : signale explicitement les blocs faibles ou manquants.

JSON:
{
  "blocks": {
    "keyPartners": { "summary": "puces courtes séparées par ·", "detail": "2-4 phrases", "health": "strong"|"moderate"|"weak"|"missing", "gapNote"?: string },
    "keyActivities": { ... },
    "keyResources": { ... },
    "valuePropositions": { ... },
    "customerRelationships": { ... },
    "channels": { ... },
    "customerSegments": { ... },
    "costStructure": { ... },
    "revenueStreams": { ... }
  },
  "overallGaps": ["3-6 faiblesses transverses"],
  "synthesis": "2-3 phrases sur la robustesse du modèle"
}

Règles health : strong = solide ; moderate = à préciser ; weak = lacune ; missing = non adressé (gapNote obligatoire).
Au moins 2 blocs weak/missing si le projet est encore flou. Espaces corrects entre les mots.

${founderContext}

FICHE IDÉE:
${snapshot}`
}

export function decisionMatrixPrompt(
  idea: {
    title: string
    subtitle?: string
    oneLiner?: string
    description?: string
    audience?: string
    whyNow?: string
    category?: string
    excitementLevel?: number
    complexityLevel?: number
    aiAnalysis?: { brief?: string; founderFitNote?: string }
    marketResearch?: { summary?: string; competitors?: string[] }
    decisionMatrix?: {
      niche?: string
      competitorsOver100k?: string
      topCompetitors?: { name: string; revenue: string }[]
      simplicity?: number
      noSocial?: boolean
      kiff?: number
      marketability?: number
    }
  },
  founderContext: string
): string {
  const snapshot = [
    `Titre: ${idea.title}`,
    idea.subtitle ? `Sous-titre: ${idea.subtitle}` : '',
    idea.oneLiner ? `Résumé: ${idea.oneLiner}` : '',
    idea.description ? `Description: ${idea.description}` : '',
    idea.audience ? `Audience: ${idea.audience}` : '',
    idea.whyNow ? `Pourquoi maintenant: ${idea.whyNow}` : '',
    idea.category ? `Catégorie fiche: ${idea.category}` : '',
    idea.excitementLevel != null ? `Excitement (1-10): ${idea.excitementLevel}` : '',
    idea.complexityLevel != null ? `Complexité (1-10, pénalité): ${idea.complexityLevel}` : '',
    idea.aiAnalysis?.brief ? `Brief Steven: ${idea.aiAnalysis.brief}` : '',
    idea.aiAnalysis?.founderFitNote ? `Fit fondateur: ${idea.aiAnalysis.founderFitNote}` : '',
    idea.marketResearch?.summary ? `Recherche marché: ${idea.marketResearch.summary}` : '',
    idea.marketResearch?.competitors?.length
      ? `Concurrents déjà listés: ${idea.marketResearch.competitors.join(' · ')}`
      : '',
  ]
    .filter(Boolean)
    .join('\n')

  const existing = idea.decisionMatrix
    ? [
        `Niche actuelle: ${idea.decisionMatrix.niche ?? '—'}`,
        `2 concurrents +100k: ${idea.decisionMatrix.competitorsOver100k ?? 'unknown'}`,
        idea.decisionMatrix.topCompetitors?.length
          ? `Concurrents saisis: ${idea.decisionMatrix.topCompetitors
              .map((c) => `${c.name} (${c.revenue})`)
              .join(' · ')}`
          : '',
        `Simplicité: ${idea.decisionMatrix.simplicity ?? '—'}`,
        `Pas social: ${idea.decisionMatrix.noSocial ?? '—'}`,
        `Kiff: ${idea.decisionMatrix.kiff ?? '—'}`,
        `Marketabilité: ${idea.decisionMatrix.marketability ?? '—'}`,
      ]
        .filter(Boolean)
        .join('\n')
    : '(aucune matrice encore)'

  return `${JSON_ONLY_RULE}
${ANTI_SLOP_PROSE_RULE}

Remplis / challenge la matrice de décision evidence-first pour cette idée.
Objectif : aider le fondateur à prendre du recul, pas à valider l'idée par défaut.

JSON:
{
  "niche": "catégorie / niche courte",
  "competitorsOver100k": "yes"|"no"|"unknown",
  "topCompetitors": [
    { "name": string, "revenue": string, "revenueConfidence"?: "low"|"medium"|"high", "sourceNote"?: string }
  ],
  "simplicity": 1-5,
  "noSocial": boolean,
  "kiff": 1-5,
  "marketability": 1-5,
  "stevenChallenge": "2-5 phrases : ce qui cloche, ce qui manque de preuve, question de recul",
  "stevenNotes"?: "notes courtes optionnelles"
}

Règles:
- competitorsOver100k = yes seulement s'il y a des signaux crédibles que ≥2 apps/produits proches monétisent fort (ordre de grandeur ~100k+/an ou équivalent). Sinon no ou unknown.
- Ne jamais inventer des revenus App Store / Sensor Tower comme faits. Si tu n'as pas de source, revenue = "unknown", revenueConfidence = "low", et dis-le dans sourceNote.
- topCompetitors : 0 à 3 max. Préférer moins d'entrées honnêtes que 3 noms fantômes.
- simplicity : 5 = très simple à livrer / peu de pièces mobiles ; 1 = infra lourde, cold-start social, multi-côté, etc.
- noSocial = true si le produit n'exige PAS un réseau d'utilisateurs pour créer de la valeur (évite cold-start social).
- kiff : alignement énergie / envie du fondateur (1-5), pas flatterie.
- marketability : facilité à expliquer / vendre la promesse (1-5).
- stevenChallenge : critique utile, concrete, sans motivational fluff.

${founderContext}

FICHE IDÉE:
${snapshot}

MATRICE ACTUELLE (à challenger / corriger):
${existing}`
}
