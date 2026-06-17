import type { FounderProfile } from '../../types/domain'
import { newId } from '../../lib/id'
import { nowTimestamp } from '../../lib/time'

export type FounderOnboardingInput = {
  whoIAmRaw: string
  whatIWantRaw: string
  howIWorkRaw: string
  userId: string
}

export function createFounderProfile(input: FounderOnboardingInput): FounderProfile {
  const now = nowTimestamp()
  return {
    id: newId('founder'),
    userId: input.userId,
    whoIAmRaw: input.whoIAmRaw.trim(),
    whoIAm: { experienceSummary: input.whoIAmRaw.trim(), skills: [] },
    whatIWantRaw: input.whatIWantRaw.trim(),
    whatIWant: { lifestyleVision: input.whatIWantRaw.trim(), autonomyVsSalary: 'unknown' },
    howIWorkRaw: input.howIWorkRaw.trim(),
    howIWork: {
      personalitySummary: input.howIWorkRaw.trim(),
      riskTolerance: 'unknown',
      energyDrivers: [],
      energyDrains: [],
    },
    onboardingCompletedAt: now,
    createdAt: now,
    updatedAt: now,
  }
}
