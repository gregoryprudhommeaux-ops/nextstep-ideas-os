import { create } from 'zustand'
import type {
  DecisionNote,
  FilterDefinition,
  Idea,
  ScoringProfile,
  SynergyLink,
  Tag,
  UmbrellaGroup,
  WeeklyReview,
} from '../types/domain'
import { calculateScoreBreakdown, sortIdeasByProfile } from '../features/scoring/scoring'

export type AppData = {
  ideas: Idea[]
  filters: FilterDefinition[]
  profiles: ScoringProfile[]
  tags: Tag[]
  decisionNotes: DecisionNote[]
  synergyLinks: SynergyLink[]
  umbrellaGroups: UmbrellaGroup[]
  weeklyReviews: WeeklyReview[]
}

export type BoardSort = 'profileScore' | 'alignment' | 'validationSpeed' | 'complexity'
export type BoardDensity = 'comfortable' | 'compact'

export type AppState = {
  data: AppData | null
  activeProfileId: string | null
  search: string
  statusFilter: Idea['status'] | 'all'
  categoryFilter: Idea['category'] | 'all'
  boardSort: BoardSort
  boardDensity: BoardDensity

  setData: (data: AppData) => void
  setActiveProfileId: (id: string) => void
  setSearch: (s: string) => void
  setStatusFilter: (s: AppState['statusFilter']) => void
  setCategoryFilter: (c: AppState['categoryFilter']) => void
  setBoardSort: (sort: BoardSort) => void
  setBoardDensity: (density: BoardDensity) => void
}

export const useAppStore = create<AppState>((set) => ({
  data: null,
  activeProfileId: null,
  search: '',
  statusFilter: 'all',
  categoryFilter: 'all',
  boardSort: 'profileScore',
  boardDensity: 'comfortable',

  setData: (data) =>
    set(() => ({
      data,
      activeProfileId: data.profiles[0]?.id ?? null,
    })),
  setActiveProfileId: (id) => set(() => ({ activeProfileId: id })),
  setSearch: (s) => set(() => ({ search: s })),
  setStatusFilter: (s) => set(() => ({ statusFilter: s })),
  setCategoryFilter: (c) => set(() => ({ categoryFilter: c })),
  setBoardSort: (sort) => set(() => ({ boardSort: sort })),
  setBoardDensity: (density) => set(() => ({ boardDensity: density })),
}))

export function useActiveProfile() {
  return useAppStore((s) => {
    const profiles = s.data?.profiles ?? []
    return profiles.find((p) => p.id === s.activeProfileId) ?? profiles[0] ?? null
  })
}

export function useRankedIdeas() {
  return useAppStore((s) => {
    const data = s.data
    if (!data) return []
    const profile = data.profiles.find((p) => p.id === s.activeProfileId) ?? data.profiles[0]
    if (!profile) return data.ideas
    return sortIdeasByProfile(data.ideas, profile)
  })
}

export function useIdeaScore(ideaId: string) {
  return useAppStore((s) => {
    const data = s.data
    if (!data) return null
    const idea = data.ideas.find((i) => i.id === ideaId)
    const profile = data.profiles.find((p) => p.id === s.activeProfileId) ?? data.profiles[0]
    if (!idea || !profile) return null
    return calculateScoreBreakdown(idea, profile)
  })
}

