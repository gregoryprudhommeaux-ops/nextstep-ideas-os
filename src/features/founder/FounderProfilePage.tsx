import { useState } from 'react'
import { SectionHeader } from '../../components/SectionHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useAppStore } from '../../app/store'
import { useAISettings } from '../ai/useAISettings'
import { structureFounderProfile, type AIRouterContext } from '../ai/router'
import { nowTimestamp } from '../../lib/time'

export function FounderProfilePage() {
  const profile = useAppStore((s) => s.data?.founderProfile)
  const ideas = useAppStore((s) => s.data?.ideas ?? [])
  const umbrellaGroups = useAppStore((s) => s.data?.umbrellaGroups ?? [])
  const steven = useAppStore((s) => s.data?.steven)
  const updateFounderProfile = useAppStore((s) => s.updateFounderProfile)
  const { settings, isAvailable } = useAISettings()
  const [structuring, setStructuring] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!profile) return null

  const blocks = [
    { title: 'Qui je suis', raw: profile.whoIAmRaw },
    { title: 'Ce que je veux', raw: profile.whatIWantRaw },
    { title: 'Comment je fonctionne', raw: profile.howIWorkRaw },
  ]

  async function handleStructure() {
    if (!profile) return
    setStructuring(true)
    setError(null)
    try {
      const ctx: AIRouterContext = {
        settings,
        steven: steven
          ? {
              customInstructions: steven.customInstructions,
              learnedContext: steven.learnedContext,
            }
          : null,
        founderProfile: profile,
        ideas,
        umbrellaGroups,
      }
      const structured = await structureFounderProfile(ctx, profile)
      updateFounderProfile({
        ...structured,
        lastStructuredAt: nowTimestamp(),
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de structuration')
    } finally {
      setStructuring(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <SectionHeader
        eyebrow="Profil fondateur"
        title="Ton contexte"
        description="Ce profil guide l’interprétation de tes idées par Steven."
        action={
          isAvailable ? (
            <Button type="button" disabled={structuring} onClick={() => void handleStructure()}>
              {structuring ? 'Structuration…' : 'Structurer avec AI'}
            </Button>
          ) : null
        }
      />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="space-y-4">
        {blocks.map((block) => (
          <Card key={block.title} className="p-5">
            <h2 className="text-sm font-semibold text-midnight">{block.title}</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-tertiary/80">
              {block.raw}
            </p>
          </Card>
        ))}
      </div>

      {profile.whoIAm.skills.length > 0 ? (
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-midnight">Compétences (AI)</h2>
          <p className="mt-2 text-sm text-tertiary/80">{profile.whoIAm.skills.join(' · ')}</p>
        </Card>
      ) : null}
    </div>
  )
}
