import type { Repository, SeedSnapshot } from './types'
import { seedSnapshot } from '../../data/seed/seedSnapshot'

export const mockRepository: Repository = {
  async getSeedSnapshot(): Promise<SeedSnapshot> {
    return seedSnapshot
  },
}

