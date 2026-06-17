import { useAppStore } from '../../app/store'
import { getStevenBrainSnapshot } from './stevenBrain'

/** Full Steven system prompt for AI calls (base + user custom instructions). */
export function useStevenBrain() {
  const steven = useAppStore((s) => s.data?.steven)
  return getStevenBrainSnapshot(steven)
}
