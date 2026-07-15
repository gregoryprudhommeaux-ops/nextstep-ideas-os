import type { PortfolioScanResult } from '../../types/ai'
import type { PortfolioGlobalAnalysis } from '../../types/domain'
import { newId } from '../../lib/id'
import { nowTimestamp } from '../../lib/time'

export function scanResultToAnalysis(result: PortfolioScanResult): PortfolioGlobalAnalysis {
  const now = nowTimestamp()
  return {
    id: newId('pfa'),
    summary: result.summary,
    ecosystemNote: result.ecosystemNote,
    suggestedSynergies: result.suggestedSynergies.map((s) => ({
      id: newId('pfs'),
      ...s,
      status: 'open' as const,
    })),
    umbrellaCandidates: result.umbrellaCandidates.map((u) => ({
      id: newId('pfu'),
      ...u,
      status: 'open' as const,
    })),
    sharedBases: result.sharedBases.map((b) => ({
      id: newId('pfb'),
      ...b,
      status: 'open' as const,
    })),
    newIdeaProposals: (result.newIdeaProposals ?? []).map((n) => ({
      id: newId('pfn'),
      ...n,
      status: 'open' as const,
    })),
    createdAt: now,
    updatedAt: now,
  }
}

export function formatAnalysisDate(createdAt: { toDate?: () => Date } | Date): string {
  const date =
    createdAt instanceof Date
      ? createdAt
      : typeof createdAt.toDate === 'function'
        ? createdAt.toDate()
        : new Date()
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function analysisSuggestionCount(analysis: PortfolioGlobalAnalysis): number {
  return (
    analysis.suggestedSynergies.length +
    analysis.umbrellaCandidates.length +
    analysis.sharedBases.length +
    analysis.newIdeaProposals.length
  )
}

export function analysisOpenCount(analysis: PortfolioGlobalAnalysis): number {
  const open = (s: { status: string }) => s.status === 'open'
  return (
    analysis.suggestedSynergies.filter(open).length +
    analysis.umbrellaCandidates.filter(open).length +
    analysis.sharedBases.filter(open).length +
    analysis.newIdeaProposals.filter(open).length
  )
}

export function buildIdeaDescriptionFromProposal(parts: (string | undefined)[]): string {
  return parts.filter((p) => p?.trim()).join('\n\n')
}
