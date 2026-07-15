import type { AIProvider, IdeaRefinementResult } from '../../types/ai'
import type { Idea, IdeaRefinement } from '../../types/domain'
import { newId } from '../../lib/id'
import { nowTimestamp } from '../../lib/time'
import { mapDimensionScores } from '../scoring/dimensionScores'
import { applyAnalysisToIdeaPatch } from './ideaClassification'
import { normalizeIdeaTextPatch } from '../../lib/prose'

export function hasRefinementInput(notes: string | undefined | null): boolean {
  return Boolean(notes?.trim())
}

export function refinementDisplayText(ref: IdeaRefinement | null | undefined): string {
  if (!ref || typeof ref !== 'object') return ''
  if (ref.notes?.trim()) return ref.notes.trim()
  return [
    ref.dealNotes,
    ref.businessNotes,
    ref.marketVision,
    ref.possibilities,
  ]
    .filter(Boolean)
    .join('\n\n')
}

export function isValidRefinement(ref: unknown): ref is IdeaRefinement {
  return Boolean(ref && typeof ref === 'object' && 'id' in ref && typeof (ref as IdeaRefinement).id === 'string')
}

export function buildNotesOnlyRefinement(notes: string): IdeaRefinement {
  const now = nowTimestamp()
  return {
    id: newId('ref'),
    notes: notes.trim(),
    createdAt: now,
    updatedAt: now,
  }
}

export function buildRefinementEntry(
  notes: string,
  result: IdeaRefinementResult,
  provider: AIProvider
): IdeaRefinement {
  const now = nowTimestamp()
  return {
    id: newId('ref'),
    notes: notes.trim(),
    stevenSummary: result.brief,
    changeSummary: result.changeSummary,
    provider,
    createdAt: now,
    updatedAt: now,
  }
}

export function patchIdeaFromRefinement(
  idea: Idea | null | undefined,
  result: IdeaRefinementResult,
  provider: AIProvider
): Partial<Idea> {
  if (!idea) return {}
  const metadata = applyAnalysisToIdeaPatch(
    {
      brief: result.brief,
      founderFitNote: result.founderFitNote,
      oneLiner: result.oneLiner,
      subtitle: result.subtitle,
      whyNow: result.whyNow,
      audience: result.audience,
      risks: result.risks,
      category: result.category,
      horizon: result.horizon,
      businessModelType: result.businessModelType,
      geography: result.geography,
      dimensionNotes: result.dimensionNotes,
    },
    {
      category: idea.category,
      horizon: idea.horizon,
      businessModelType: idea.businessModelType,
      geography: idea.geography,
    }
  )

  const patch: Partial<Idea> = {
    description: result.description,
    oneLiner: metadata.oneLiner ?? result.oneLiner ?? idea.oneLiner,
    subtitle: metadata.subtitle ?? idea.subtitle,
    whyNow: metadata.whyNow ?? result.whyNow ?? idea.whyNow,
    audience: metadata.audience ?? result.audience ?? idea.audience,
    strategicNotes: result.strategicNotes ?? idea.strategicNotes,
    firstTest: result.firstTest ?? idea.firstTest,
    nextStep: result.nextStep ?? idea.nextStep,
    risks: metadata.risks ?? result.risks ?? idea.risks,
    category: metadata.category ?? idea.category,
    horizon: metadata.horizon ?? idea.horizon,
    businessModelType: metadata.businessModelType ?? idea.businessModelType,
    geography: metadata.geography ?? idea.geography,
    aiAnalysis: {
      brief: result.brief,
      founderFitNote: result.founderFitNote,
      oneLiner: metadata.oneLiner ?? result.oneLiner,
      subtitle: metadata.subtitle ?? result.subtitle,
      whyNow: metadata.whyNow ?? result.whyNow ?? idea.aiAnalysis?.whyNow,
      audience: metadata.audience ?? result.audience ?? idea.aiAnalysis?.audience,
      risks: metadata.risks ?? result.risks ?? idea.aiAnalysis?.risks,
      category: metadata.category ?? idea.aiAnalysis?.category,
      horizon: metadata.horizon ?? idea.aiAnalysis?.horizon,
      businessModelType:
        metadata.businessModelType ?? idea.aiAnalysis?.businessModelType,
      geography: metadata.geography ?? idea.aiAnalysis?.geography,
      dimensionNotes: {
        ...idea.aiAnalysis?.dimensionNotes,
        ...result.dimensionNotes,
      },
      analyzedAt: nowTimestamp(),
      provider,
    },
  }
  if (result.dimensionScores) {
    Object.assign(patch, mapDimensionScores(result.dimensionScores))
    patch.scoreSource =
      idea.scoreSource === 'manual' || idea.scoreSource === 'hybrid' ? 'hybrid' : 'ai'
  }
  return normalizeIdeaTextPatch(patch)
}
