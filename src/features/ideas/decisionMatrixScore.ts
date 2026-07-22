import type { DecisionMatrix, Idea } from '../../types/domain'
import { categoryLabels } from '../../lib/labels'

export const MATRIX_SCORE_MAX = 16

export function clampMatrixDim(n: number): number {
  if (!Number.isFinite(n)) return 3
  return Math.min(5, Math.max(1, Math.round(n)))
}

export function computeDecisionMatrixTotals(
  m: Pick<
    DecisionMatrix,
    'simplicity' | 'kiff' | 'marketability' | 'noSocial' | 'competitorsOver100k'
  >
): { scoreTotal: number; evidenceVeto: boolean; evidenceWeak: boolean } {
  const simplicity = clampMatrixDim(m.simplicity)
  const kiff = clampMatrixDim(m.kiff)
  const marketability = clampMatrixDim(m.marketability)
  return {
    scoreTotal: simplicity + kiff + marketability + (m.noSocial ? 1 : 0),
    evidenceVeto: m.competitorsOver100k === 'no',
    evidenceWeak: m.competitorsOver100k === 'unknown',
  }
}

export function withComputedMatrixScores(
  m: Omit<DecisionMatrix, 'scoreTotal' | 'evidenceVeto'> &
    Partial<Pick<DecisionMatrix, 'scoreTotal' | 'evidenceVeto'>>
): DecisionMatrix {
  const dims = {
    simplicity: clampMatrixDim(m.simplicity),
    kiff: clampMatrixDim(m.kiff),
    marketability: clampMatrixDim(m.marketability),
    noSocial: Boolean(m.noSocial),
    competitorsOver100k: m.competitorsOver100k,
  }
  const { scoreTotal, evidenceVeto } = computeDecisionMatrixTotals(dims)
  return {
    ...m,
    ...dims,
    topCompetitors: (m.topCompetitors ?? []).slice(0, 3).map((c) => ({
      name: c.name.trim(),
      revenue: (c.revenue || 'unknown').trim() || 'unknown',
      revenueConfidence: c.revenueConfidence,
      sourceNote: c.sourceNote?.trim() || undefined,
    })),
    niche: m.niche.trim(),
    scoreTotal,
    evidenceVeto,
  }
}

/** Draft when the idea has no matrix yet — seeded from profile dims, not persisted until save. */
export function draftDecisionMatrix(idea: Idea): DecisionMatrix {
  return withComputedMatrixScores({
    niche: categoryLabels[idea.category] ?? idea.category,
    competitorsOver100k: 'unknown',
    topCompetitors: [
      { name: '', revenue: 'unknown' },
      { name: '', revenue: 'unknown' },
      { name: '', revenue: 'unknown' },
    ],
    simplicity: clampMatrixDim((11 - idea.complexityLevel) / 2),
    noSocial: idea.category !== 'communityPlatform',
    kiff: clampMatrixDim(idea.excitementLevel / 2),
    marketability: 3,
  })
}

export function hasDecisionMatrix(idea: Idea): boolean {
  return Boolean(idea.decisionMatrix)
}

/** Incubation candidates: scored, no evidence veto, not archived. */
export function isIncubationCandidate(idea: Idea): boolean {
  const m = idea.decisionMatrix
  if (!m || idea.status === 'archive') return false
  return !m.evidenceVeto
}

export type DecisionMatrixPortfolioFilter =
  | 'all'
  | 'scored'
  | 'incubation'
  | 'veto'
  | 'unscored'

export function filterIdeasForDecisionMatrix(
  ideas: Idea[],
  filter: DecisionMatrixPortfolioFilter
): Idea[] {
  const active = ideas.filter((i) => i.status !== 'archive')
  switch (filter) {
    case 'scored':
      return active.filter(hasDecisionMatrix)
    case 'incubation':
      return active.filter(isIncubationCandidate)
    case 'veto':
      return active.filter((i) => i.decisionMatrix?.evidenceVeto === true)
    case 'unscored':
      return active.filter((i) => !hasDecisionMatrix(i))
    default:
      return active
  }
}

export type DecisionMatrixSortKey =
  | 'scoreTotal'
  | 'simplicity'
  | 'kiff'
  | 'marketability'
  | 'title'

export function sortIdeasByDecisionMatrix(
  ideas: Idea[],
  key: DecisionMatrixSortKey,
  dir: 'asc' | 'desc'
): Idea[] {
  const sign = dir === 'asc' ? 1 : -1
  return [...ideas].sort((a, b) => {
    if (key === 'title') {
      return sign * a.title.localeCompare(b.title, 'fr')
    }
    const av = a.decisionMatrix?.[key]
    const bv = b.decisionMatrix?.[key]
    const aMissing = av == null
    const bMissing = bv == null
    if (aMissing && bMissing) return a.title.localeCompare(b.title, 'fr')
    if (aMissing) return 1
    if (bMissing) return -1
    const delta = (av as number) - (bv as number)
    if (delta !== 0) return sign * delta
    return a.title.localeCompare(b.title, 'fr')
  })
}
