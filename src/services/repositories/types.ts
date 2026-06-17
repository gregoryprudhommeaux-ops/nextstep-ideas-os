import type {
  DecisionNote,
  FilterDefinition,
  Idea,
  ScoringProfile,
  SynergyLink,
  Tag,
  UmbrellaGroup,
  WeeklyReview,
} from '../../types/domain'

export type SeedSnapshot = {
  ideas: Idea[]
  filters: FilterDefinition[]
  profiles: ScoringProfile[]
  tags: Tag[]
  decisionNotes: DecisionNote[]
  synergyLinks: SynergyLink[]
  umbrellaGroups: UmbrellaGroup[]
  weeklyReviews: WeeklyReview[]
}

export type Repository = {
  getSeedSnapshot(): Promise<SeedSnapshot>
}

