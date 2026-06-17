import type { Timestamp } from 'firebase/firestore'
import type {
  AIProvider,
  ClassificationProposal,
  ClarifyingQuestion,
  IdeaAIAnalysis,
  MarketResearchResult,
} from './ai'

export type Role = 'owner' | 'viewer'

export type IdeaStatus = 'inbox' | 'explore' | 'validate' | 'build' | 'archive'

export type IdeaCategory =
  | 'service'
  | 'productizedService'
  | 'saasAi'
  | 'communityPlatform'
  | 'hospitality'
  | 'mediaBrand'
  | 'consulting'
  | 'marketplace'
  | 'digitalAsset'
  | 'localPhysical'

export type BusinessModelType =
  | 'services'
  | 'productizedServices'
  | 'subscriptionSaas'
  | 'marketplaceTakeRate'
  | 'transactional'
  | 'licensing'
  | 'adsSponsorship'
  | 'affiliation'
  | 'hybrid'

export type HorizonType = '0_30d' | '30_90d' | '3_12m' | '1_3y'

export type GeographyType = 'local' | 'national' | 'europe' | 'global'

export type FilterType = 'boolean' | 'numeric' | 'select'

export type FilterPolarity = 'positive' | 'negative'

export type SynergyStrength = 'weak' | 'medium' | 'strong' | 'conflict'

export type FirestoreTime = Timestamp

export type WithTimestamps = {
  createdAt: FirestoreTime
  updatedAt?: FirestoreTime
}

export type ScoreDimension =
  | 'personalAlignment'
  | 'freedomFit'
  | 'remoteFit'
  | 'scalabilityFit'
  | 'sideBusinessFit'
  | 'revenuePotential'
  | 'speedToValidation'
  | 'ecosystemFit'
  | 'excitementLevel'
  | 'complexityLevel'
  | 'capitalIntensity'

export type UserProfile = WithTimestamps & {
  id: string
  email: string
  displayName: string
  photoURL?: string
  role: Role
}

export type InspirationKind =
  | 'website'
  | 'google_drive'
  | 'pdf'
  | 'conversation'
  | 'screenshot'
  | 'voice_note'

export type IdeaInspiration = WithTimestamps & {
  id: string
  kind: InspirationKind
  /** Short label, e.g. "Competitor deck" */
  label?: string
  /** Link — website, Google Drive, PDF, image, or audio URL */
  url?: string
  /** Pasted conversation or brainstorm note (for kind=conversation) */
  content?: string
}

export type Idea = WithTimestamps & {
  id: string
  title: string
  subtitle?: string
  oneLiner?: string
  description?: string

  category: IdeaCategory
  status: IdeaStatus
  businessModelType: BusinessModelType
  geography: GeographyType
  audience?: string

  whyNow?: string
  strategicNotes?: string
  firstTest?: string
  nextStep?: string
  risks?: string

  horizon: HorizonType
  effortLevel: number
  capitalIntensity: number

  sideBusinessFit: boolean
  remoteFit: number
  freedomFit: number
  scalabilityFit: number
  personalAlignment: number
  excitementLevel: number
  revenuePotential: number
  complexityLevel: number
  speedToValidation: number
  ecosystemFit: number
  umbrellaFit: number

  tagIds: string[]
  umbrellaGroupId?: string | null
  /** Links, decks, chats, voice notes that sparked this idea */
  inspirations?: IdeaInspiration[]

  scoreSource?: 'manual' | 'ai' | 'hybrid'
  aiAnalysis?: IdeaAIAnalysis & { analyzedAt: FirestoreTime; provider: AIProvider }
  portfolioRole?: 'standalone' | 'extension' | 'variant'
  parentIdeaId?: string
  extensionNote?: string
  captureSource?: 'manual' | 'brainstorm'
  brainstormSessionId?: string

  marketResearch?: MarketResearchResult & { researchedAt: FirestoreTime }
}

export type FilterDefinition = WithTimestamps & {
  id: string
  name: string
  slug: string
  description?: string
  type: FilterType
  polarity: FilterPolarity
  weight: number
  isCore: boolean
  isActive: boolean
  options?: { label: string; value: string }[]
}

export type ScoringProfile = WithTimestamps & {
  id: string
  name: string
  slug: string
  description?: string
  weights: Partial<Record<ScoreDimension, number>>
}

export type IdeaScoreBreakdown = Partial<Record<ScoreDimension, number>> & {
  rawScore: number
  weightedScore: number
}

export type IdeaScore = WithTimestamps & {
  id: string
  ideaId: string
  profileId: string
  rawScore: number
  weightedScore: number
  scoreBreakdown: Record<string, number>
}

export type SynergyLink = WithTimestamps & {
  id: string
  sourceIdeaId: string
  targetIdeaId: string

  sameAudienceScore?: number
  sameBrandUniverseScore?: number
  sameCapabilitiesScore?: number
  sameChannelsScore?: number
  sameGeographyScore?: number
  sameOperatorsScore?: number
  sameContentEcosystemScore?: number
  sameMonetizationScore?: number
  sameTechStackScore?: number
  crossSellPotentialScore?: number

  totalSynergyScore: number
  synergyStrength: SynergyStrength
  notes?: string
}

export type UmbrellaGroup = WithTimestamps & {
  id: string
  name: string
  slug: string
  promise?: string
  audience?: string
  strategicLogic?: string
  ideaIds: string[]
  cohesionScore?: number
  tensionNotes?: string
}

export type WeeklyReview = WithTimestamps & {
  id: string
  weekLabel: string
  summary?: string
  /** Guided reflection — status moves this week */
  qStatusChange?: string
  /** Guided reflection — synergies noticed */
  qSynergy?: string
  /** Guided reflection — what to deprioritize */
  qDeprioritize?: string
  ideasToExplore?: string[]
  ideasToPause?: string[]
  ideasToTest?: string[]
  mergeCandidates?: string[]
  umbrellaCandidates?: string[]
  reflections?: string
}

export type DecisionNote = {
  id: string
  ideaId: string
  decisionType: 'explore' | 'pause' | 'commit' | 'kill' | 'merge' | 'umbrella'
  note: string
  createdAt: FirestoreTime
}

export type Tag = {
  id: string
  label: string
  colorStyle: string
  createdAt: FirestoreTime
}

export type BrainstormPhase =
  | 'input'
  | 'clarifying'
  | 'proposing'
  | 'applied'
  | 'cancelled'

export type FounderProfile = WithTimestamps & {
  id: string
  userId: string
  linkedinUrl?: string
  whoIAmRaw: string
  whoIAm: {
    experienceSummary: string
    skills: string[]
    location?: string
    timeConstraints?: string
  }
  whatIWantRaw: string
  whatIWant: {
    lifestyleVision: string
    revenueTarget?: string
    autonomyVsSalary: 'autonomy' | 'salary' | 'balanced' | 'unknown'
    horizonYears?: number
  }
  howIWorkRaw: string
  howIWork: {
    personalitySummary: string
    riskTolerance: 'low' | 'medium' | 'high' | 'unknown'
    energyDrivers: string[]
    energyDrains: string[]
  }
  onboardingCompletedAt?: FirestoreTime
  lastStructuredAt?: FirestoreTime
}

export type BrainstormSession = WithTimestamps & {
  id: string
  phase: BrainstormPhase
  rawInput: string
  inspirations?: IdeaInspiration[]
  questions: ClarifyingQuestion[]
  answers: Record<string, string>
  proposal?: ClassificationProposal
  resultIdeaId?: string
  resultLinkId?: string
}

export type SharedBase = WithTimestamps & {
  id: string
  name: string
  description: string
  ideaIds: string[]
  sharedDimensions: ('audience' | 'infra' | 'brand' | 'backOffice' | 'channels')[]
  aiSuggested: boolean
  confirmedByUser: boolean
}

