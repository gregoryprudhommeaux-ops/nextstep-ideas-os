import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import type {
  BrainstormPhase,
  BrainstormSession,
  DecisionNote,
  FilterDefinition,
  FounderProfile,
  Idea,
  ScoringProfile,
  SharedBase,
  SynergyLink,
  SynergyStrength,
  Tag,
  UmbrellaGroup,
  WeeklyReview,
} from '../types/domain'
import { calculateScoreBreakdown, sortIdeasByProfile } from '../features/scoring/scoring'
import { savePersistedData, touchUpdated } from './persistence'
import { getCurrentUserId } from '../services/firebase/session'
import { scheduleWorkspaceSync } from '../services/firestore/workspaceSync'
import { isFirebaseConfigured } from '../config/env'
import { newId, slugify } from '../lib/id'
import { currentWeekLabel, nowTimestamp } from '../lib/time'
import { createNewIdea, type IdeaCaptureInput } from '../features/ideas/ideaDefaults'
import type { StevenConfig, StevenEvolutionSource } from '../features/steven/types'
import type { ClassificationProposal, PortfolioVerdict } from '../types/ai'
import {
  buildIdeaFromBrainstorm,
  type ApplyVerdictInput,
} from '../features/brainstorm/applyVerdict'
import {
  createFounderProfile,
  type FounderOnboardingInput,
} from '../features/founder/founderDefaults'

/** Stable fallbacks — never use `?? []` inline in selectors (new ref every read → infinite loop). */
export const EMPTY_IDEAS: Idea[] = []
export const EMPTY_PROFILES: ScoringProfile[] = []
export const EMPTY_FILTERS: FilterDefinition[] = []
export const EMPTY_SYNERGY_LINKS: SynergyLink[] = []
export const EMPTY_DECISION_NOTES: DecisionNote[] = []
export const EMPTY_UMBRELLA_GROUPS: UmbrellaGroup[] = []
export const EMPTY_SHARED_BASES: SharedBase[] = []
export const EMPTY_WEEKLY_REVIEWS: WeeklyReview[] = []

export type AppData = {
  version: 2
  ideas: Idea[]
  filters: FilterDefinition[]
  profiles: ScoringProfile[]
  tags: Tag[]
  decisionNotes: DecisionNote[]
  synergyLinks: SynergyLink[]
  umbrellaGroups: UmbrellaGroup[]
  weeklyReviews: WeeklyReview[]
  founderProfile: FounderProfile | null
  brainstormSessions: BrainstormSession[]
  sharedBases: SharedBase[]
  steven: StevenConfig
}

export type BoardSort = 'profileScore' | 'alignment' | 'validationSpeed' | 'complexity'
export type BoardDensity = 'comfortable' | 'compact'

function synergyStrength(score: number): SynergyStrength {
  if (score >= 8) return 'strong'
  if (score >= 6) return 'medium'
  if (score >= 4) return 'weak'
  return 'conflict'
}

function commitData(data: AppData): AppData {
  const uid = getCurrentUserId()
  if (uid) {
    savePersistedData(data, uid)
    if (isFirebaseConfigured()) {
      scheduleWorkspaceSync(uid, data)
    }
  }
  return data
}

export type AppState = {
  data: AppData | null
  activeProfileId: string | null
  search: string
  statusFilter: Idea['status'] | 'all'
  categoryFilter: Idea['category'] | 'all'
  boardSort: BoardSort
  boardDensity: BoardDensity

  setData: (data: AppData) => void
  hydrateData: (data: AppData) => void
  resetWorkspace: () => void
  setActiveProfileId: (id: string) => void
  setSearch: (s: string) => void
  setStatusFilter: (s: AppState['statusFilter']) => void
  setCategoryFilter: (c: AppState['categoryFilter']) => void
  setBoardSort: (sort: BoardSort) => void
  setBoardDensity: (density: BoardDensity) => void

  addIdea: (input: IdeaCaptureInput) => string
  updateIdea: (id: string, patch: Partial<Idea>) => void
  deleteIdea: (id: string) => void

  addSynergyLink: (input: {
    sourceIdeaId: string
    targetIdeaId: string
    totalSynergyScore: number
    notes?: string
  }) => void
  deleteSynergyLink: (id: string) => void

  addUmbrella: (input: { name: string; promise?: string; ideaIds?: string[] }) => string
  updateUmbrella: (id: string, patch: Partial<UmbrellaGroup>) => void
  assignIdeaToUmbrella: (ideaId: string, umbrellaId: string | null) => void

  addSharedBase: (input: {
    name: string
    description: string
    ideaIds: string[]
    sharedDimensions: SharedBase['sharedDimensions']
    aiSuggested?: boolean
  }) => string

  saveWeeklyReview: (input: {
    qStatusChange?: string
    qSynergy?: string
    qDeprioritize?: string
    summary?: string
    ideasToExplore?: string[]
    ideasToPause?: string[]
    reflections?: string
  }) => void

  saveFounderProfile: (input: FounderOnboardingInput) => void
  updateFounderProfile: (patch: Partial<FounderProfile>) => void

  setStevenCustomInstructions: (customInstructions: string) => void

  applyStevenEvolution: (input: {
    learnedContext: string
    summaryBullets: string[]
    source: StevenEvolutionSource
    sessionId?: string
  }) => void

  applyBrainstormVerdict: (input: ApplyVerdictInput) => string
  applyManualBrainstorm: (input: {
    rawInput: string
    title: string
    verdict: PortfolioVerdict
    targetIdeaId?: string
  }) => string
}

export const useAppStore = create<AppState>((set, get) => ({
  data: null,
  activeProfileId: null,
  search: '',
  statusFilter: 'all',
  categoryFilter: 'all',
  boardSort: 'profileScore',
  boardDensity: 'comfortable',

  setData: (data) =>
    set(() => {
      commitData(data)
      return { data, activeProfileId: data.profiles[0]?.id ?? null }
    }),

  hydrateData: (data) =>
    set(() => ({
      data,
      activeProfileId: data.profiles[0]?.id ?? null,
    })),

  resetWorkspace: () =>
    set(() => ({
      data: null,
      activeProfileId: null,
      search: '',
      statusFilter: 'all',
      categoryFilter: 'all',
    })),

  setActiveProfileId: (id) => set(() => ({ activeProfileId: id })),
  setSearch: (s) => set(() => ({ search: s })),
  setStatusFilter: (s) => set(() => ({ statusFilter: s })),
  setCategoryFilter: (c) => set(() => ({ categoryFilter: c })),
  setBoardSort: (sort) => set(() => ({ boardSort: sort })),
  setBoardDensity: (density) => set(() => ({ boardDensity: density })),

  addIdea: (input) => {
    const idea = createNewIdea(input)
    set((s) => {
      if (!s.data) return s
      const data = commitData({ ...s.data, ideas: [...s.data.ideas, idea] })
      return { data }
    })
    return idea.id
  },

  updateIdea: (id, patch) =>
    set((s) => {
      if (!s.data) return s
      const ideas = s.data.ideas.map((i) =>
        i.id === id ? touchUpdated({ ...i, ...patch, id: i.id }) : i
      )
      const data = commitData({ ...s.data, ideas })
      return { data }
    }),

  deleteIdea: (id) =>
    set((s) => {
      if (!s.data) return s
      const data = commitData({
        ...s.data,
        ideas: s.data.ideas.filter((i) => i.id !== id),
        synergyLinks: s.data.synergyLinks.filter(
          (l) => l.sourceIdeaId !== id && l.targetIdeaId !== id
        ),
        umbrellaGroups: s.data.umbrellaGroups.map((g) => ({
          ...g,
          ideaIds: g.ideaIds.filter((x) => x !== id),
        })),
      })
      return { data }
    }),

  addSynergyLink: (input) =>
    set((s) => {
      if (!s.data || input.sourceIdeaId === input.targetIdeaId) return s
      const score = Math.max(1, Math.min(10, input.totalSynergyScore))
      const link: SynergyLink = {
        id: newId('syn'),
        sourceIdeaId: input.sourceIdeaId,
        targetIdeaId: input.targetIdeaId,
        totalSynergyScore: score,
        synergyStrength: synergyStrength(score),
        notes: input.notes?.trim() || undefined,
        createdAt: nowTimestamp(),
      }
      const data = commitData({ ...s.data, synergyLinks: [...s.data.synergyLinks, link] })
      return { data }
    }),

  deleteSynergyLink: (id) =>
    set((s) => {
      if (!s.data) return s
      const data = commitData({
        ...s.data,
        synergyLinks: s.data.synergyLinks.filter((l) => l.id !== id),
      })
      return { data }
    }),

  addUmbrella: (input) => {
    const id = newId('umb')
    const group: UmbrellaGroup = {
      id,
      name: input.name.trim(),
      slug: slugify(input.name) || id,
      promise: input.promise?.trim() || undefined,
      ideaIds: input.ideaIds ?? [],
      cohesionScore: 5,
      createdAt: nowTimestamp(),
    }
    set((s) => {
      if (!s.data) return s
      const ideas = s.data.ideas.map((i) =>
        group.ideaIds.includes(i.id) ? { ...i, umbrellaGroupId: id } : i
      )
      const data = commitData({
        ...s.data,
        ideas,
        umbrellaGroups: [...s.data.umbrellaGroups, group],
      })
      return { data }
    })
    return id
  },

  updateUmbrella: (id, patch) =>
    set((s) => {
      if (!s.data) return s
      const umbrellaGroups = s.data.umbrellaGroups.map((g) =>
        g.id === id ? touchUpdated({ ...g, ...patch, id: g.id }) : g
      )
      const data = commitData({ ...s.data, umbrellaGroups })
      return { data }
    }),

  assignIdeaToUmbrella: (ideaId, umbrellaId) =>
    set((s) => {
      if (!s.data) return s
      const ideas = s.data.ideas.map((i) =>
        i.id === ideaId ? { ...i, umbrellaGroupId: umbrellaId, updatedAt: nowTimestamp() } : i
      )
      const umbrellaGroups = s.data.umbrellaGroups.map((g) => {
        const has = g.ideaIds.includes(ideaId)
        if (umbrellaId === g.id) {
          return has ? g : { ...g, ideaIds: [...g.ideaIds, ideaId] }
        }
        return has ? { ...g, ideaIds: g.ideaIds.filter((x) => x !== ideaId) } : g
      })
      const data = commitData({ ...s.data, ideas, umbrellaGroups })
      return { data }
    }),

  addSharedBase: (input) => {
    const id = newId('base')
    const base: SharedBase = {
      id,
      name: input.name.trim(),
      description: input.description.trim(),
      ideaIds: input.ideaIds,
      sharedDimensions: input.sharedDimensions,
      aiSuggested: input.aiSuggested ?? false,
      confirmedByUser: true,
      createdAt: nowTimestamp(),
    }
    set((s) => {
      if (!s.data) return s
      const data = commitData({ ...s.data, sharedBases: [...s.data.sharedBases, base] })
      return { data }
    })
    return id
  },

  saveWeeklyReview: (input) =>
    set((s) => {
      if (!s.data) return s
      const weekLabel = currentWeekLabel()
      const existing = s.data.weeklyReviews.find((r) => r.weekLabel === weekLabel)
      const next: WeeklyReview = existing
        ? touchUpdated({
            ...existing,
            ...input,
            weekLabel,
          })
        : {
            id: newId('wr'),
            weekLabel,
            ...input,
            createdAt: nowTimestamp(),
          }
      const weeklyReviews = existing
        ? s.data.weeklyReviews.map((r) => (r.id === existing.id ? next : r))
        : [...s.data.weeklyReviews, next]
      const data = commitData({ ...s.data, weeklyReviews })
      return { data }
    }),

  saveFounderProfile: (input) =>
    set((s) => {
      if (!s.data) return s
      const profile = createFounderProfile(input)
      const data = commitData({ ...s.data, founderProfile: profile })
      return { data }
    }),

  updateFounderProfile: (patch) =>
    set((s) => {
      if (!s.data?.founderProfile) return s
      const founderProfile = touchUpdated({ ...s.data.founderProfile, ...patch })
      const data = commitData({ ...s.data, founderProfile })
      return { data }
    }),

  setStevenCustomInstructions: (customInstructions) =>
    set((s) => {
      if (!s.data) return s
      const steven = touchUpdated({
        ...s.data.steven,
        customInstructions,
      })
      const data = commitData({ ...s.data, steven })
      return { data }
    }),

  applyStevenEvolution: (input) =>
    set((s) => {
      if (!s.data) return s
      const steven = touchUpdated({
        ...s.data.steven,
        learnedContext: input.learnedContext,
        lastEvolution: {
          at: nowTimestamp(),
          summaryBullets: input.summaryBullets,
          source: input.source,
          sessionId: input.sessionId,
        },
      })
      const data = commitData({ ...s.data, steven })
      return { data }
    }),

  applyBrainstormVerdict: (input) => {
    const idea = buildIdeaFromBrainstorm(input)
    const sessionId = input.sessionId
    const verdict = input.separateIdea ? 'new' : input.proposal.verdict

    set((s) => {
      if (!s.data) return s

      let ideas = [...s.data.ideas, idea]
      const synergyLinks = [...s.data.synergyLinks]
      const sharedBases = [...s.data.sharedBases]
      let umbrellaGroups = s.data.umbrellaGroups

      if (verdict === 'variant' && input.proposal.targetIdeaId) {
        const score = 7
        synergyLinks.push({
          id: newId('syn'),
          sourceIdeaId: idea.id,
          targetIdeaId: input.proposal.targetIdeaId,
          totalSynergyScore: score,
          synergyStrength: synergyStrength(score),
          notes: input.proposal.understoodSummary,
          createdAt: nowTimestamp(),
        })
      }

      if (verdict === 'sharedBase') {
        const relatedIds = [
          idea.id,
          ...(input.proposal.targetIdeaId ? [input.proposal.targetIdeaId] : []),
        ]
        sharedBases.push({
          id: newId('base'),
          name: input.proposal.provisionalTitle,
          description: input.proposal.understoodSummary,
          ideaIds: relatedIds,
          sharedDimensions: ['backOffice'],
          aiSuggested: true,
          confirmedByUser: true,
          createdAt: nowTimestamp(),
        })
      }

      if (input.proposal.targetUmbrellaId) {
        const umbId = input.proposal.targetUmbrellaId
        ideas = ideas.map((i) =>
          i.id === idea.id ? { ...i, umbrellaGroupId: umbId } : i
        )
        umbrellaGroups = umbrellaGroups.map((g) =>
          g.id === umbId ? { ...g, ideaIds: [...g.ideaIds, idea.id] } : g
        )
      }

      const session = s.data.brainstormSessions.find((x) => x.id === sessionId)
      const brainstormSessions = session
        ? s.data.brainstormSessions.map((x) =>
            x.id === sessionId
              ? touchUpdated({
                  ...x,
                  phase: 'applied' as BrainstormPhase,
                  proposal: input.proposal,
                  resultIdeaId: idea.id,
                })
              : x
          )
        : [
            ...s.data.brainstormSessions,
            {
              id: sessionId,
              phase: 'applied' as const,
              rawInput: input.rawInput,
              questions: [],
              answers: {},
              proposal: input.proposal,
              resultIdeaId: idea.id,
              createdAt: nowTimestamp(),
            },
          ]

      const data = commitData({
        ...s.data,
        ideas,
        synergyLinks,
        sharedBases,
        umbrellaGroups,
        brainstormSessions,
      })
      return { data }
    })

    return idea.id
  },

  applyManualBrainstorm: (input) => {
    const sessionId = newId('bs')
    const proposal: ClassificationProposal = {
      provisionalTitle: input.title,
      understoodSummary: input.rawInput,
      verdict: input.verdict,
      targetIdeaId: input.targetIdeaId,
      confidence: 'low',
    }
    return get().applyBrainstormVerdict({
      proposal,
      rawInput: input.rawInput,
      sessionId,
    })
  },
}))

export function useActiveProfile() {
  return useAppStore((s) => {
    const profiles = s.data?.profiles ?? EMPTY_PROFILES
    return profiles.find((p) => p.id === s.activeProfileId) ?? profiles[0] ?? null
  })
}

export function useRankedIdeas() {
  return useAppStore(
    useShallow((s) => {
      const data = s.data
      if (!data) return EMPTY_IDEAS
      const profile = data.profiles.find((p) => p.id === s.activeProfileId) ?? data.profiles[0]
      if (!profile) return data.ideas
      return sortIdeasByProfile(data.ideas, profile)
    })
  )
}

export function useIdeaScore(ideaId: string) {
  return useAppStore(
    useShallow((s) => {
      const data = s.data
      if (!data) return null
      const idea = data.ideas.find((i) => i.id === ideaId)
      const profile = data.profiles.find((p) => p.id === s.activeProfileId) ?? data.profiles[0]
      if (!idea || !profile) return null
      return calculateScoreBreakdown(idea, profile)
    })
  )
}
