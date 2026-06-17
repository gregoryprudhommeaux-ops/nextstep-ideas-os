import { mockRepository } from '../services/repositories/MockRepository'
import { useAppStore } from './store'

export async function bootstrapMockData() {
  const snap = await mockRepository.getSeedSnapshot()
  useAppStore.getState().setData({
    ideas: snap.ideas,
    filters: snap.filters,
    profiles: snap.profiles,
    tags: snap.tags,
    decisionNotes: snap.decisionNotes,
    synergyLinks: snap.synergyLinks,
    umbrellaGroups: snap.umbrellaGroups,
    weeklyReviews: snap.weeklyReviews,
  })
}

