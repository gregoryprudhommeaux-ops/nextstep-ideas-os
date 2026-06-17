import type { FounderProfile } from '../../types/domain'
import { newId } from '../../lib/id'
import { nowTimestamp } from '../../lib/time'
import { normalizeLinkedInUrl } from '../../lib/linkedin'

export type FounderOnboardingInput = {
  whoIAmRaw: string
  whatIWantRaw: string
  howIWorkRaw: string
  linkedinUrl: string
  userId: string
}

export function createFounderProfile(input: FounderOnboardingInput): FounderProfile {
  const now = nowTimestamp()
  const linkedinUrl = normalizeLinkedInUrl(input.linkedinUrl)
  return {
    id: newId('founder'),
    userId: input.userId,
    linkedinUrl: linkedinUrl || undefined,
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
