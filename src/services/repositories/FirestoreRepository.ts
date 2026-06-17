import type { Repository, SeedSnapshot } from './types'

export const firestoreRepository: Repository = {
  async getSeedSnapshot(): Promise<SeedSnapshot> {
    throw new Error('FirestoreRepository not implemented in STEP 1')
  },
}

