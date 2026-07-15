import type {
  BusinessModelType,
  GeographyType,
  HorizonType,
  Idea,
  IdeaCategory,
} from '../../types/domain'
import type { IdeaAIAnalysis } from '../../types/ai'

export const IDEA_CATEGORY_VALUES = [
  'service',
  'productizedService',
  'saasAi',
  'communityPlatform',
  'hospitality',
  'mediaBrand',
  'consulting',
  'marketplace',
  'digitalAsset',
  'localPhysical',
] as const satisfies readonly IdeaCategory[]

export const HORIZON_VALUES = ['0_30d', '30_90d', '3_12m', '1_3y'] as const satisfies readonly HorizonType[]

export const BUSINESS_MODEL_VALUES = [
  'services',
  'productizedServices',
  'subscriptionSaas',
  'marketplaceTakeRate',
  'transactional',
  'licensing',
  'adsSponsorship',
  'affiliation',
  'hybrid',
] as const satisfies readonly BusinessModelType[]

export const GEOGRAPHY_VALUES = ['local', 'national', 'europe', 'global'] as const satisfies readonly GeographyType[]

function pickEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback
}

export type IdeaMetadataDefaults = Pick<
  Idea,
  'category' | 'horizon' | 'businessModelType' | 'geography'
>

const DEFAULT_METADATA: IdeaMetadataDefaults = {
  category: 'service',
  horizon: '30_90d',
  businessModelType: 'services',
  geography: 'global',
}

/** Map Steven analysis fields onto idea sheet columns (category, horizon, etc.). */
export function applyAnalysisToIdeaPatch(
  analysis?: IdeaAIAnalysis,
  fallbacks: Partial<IdeaMetadataDefaults> = {}
): Partial<Idea> {
  const base = { ...DEFAULT_METADATA, ...fallbacks }
  if (!analysis) return base

  return {
    category: pickEnum(analysis.category, IDEA_CATEGORY_VALUES, base.category),
    horizon: pickEnum(analysis.horizon, HORIZON_VALUES, base.horizon),
    businessModelType: pickEnum(
      analysis.businessModelType,
      BUSINESS_MODEL_VALUES,
      base.businessModelType
    ),
    geography: pickEnum(analysis.geography, GEOGRAPHY_VALUES, base.geography),
    audience: analysis.audience ?? undefined,
    whyNow: analysis.whyNow ?? undefined,
    risks: analysis.risks ?? undefined,
    oneLiner: analysis.oneLiner ?? undefined,
    subtitle: analysis.subtitle ?? undefined,
  }
}
