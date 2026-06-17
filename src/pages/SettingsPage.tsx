import * as React from 'react'
import { SectionHeader } from '../components/SectionHeader'
import { Card } from '../components/ui/Card'
import { Textarea } from '../components/ui/Textarea'
import { Button } from '../components/ui/Button'
import { useAppStore } from '../app/store'
import {
  STEVEN_BASE_SYSTEM_PROMPT,
  STEVEN_PROMPT_VERSION,
  buildStevenSystemPrompt,
} from '../features/steven/stevenBrain'
import { StevenLastEvolutionCard } from '../features/steven/StevenLastEvolutionCard'
import { useAISettings } from '../features/ai/useAISettings'
import { APIKeysSettings } from '../features/settings/APIKeysSettings'
import { isFirebaseConfigured } from '../config/env'

export function SettingsPage() {
  const steven = useAppStore((s) => s.data?.steven)
  const setStevenCustomInstructions = useAppStore((s) => s.setStevenCustomInstructions)
  const { settings, save, testConnection, loaded, isAvailable } = useAISettings()

  const savedInstructions = steven?.customInstructions ?? ''
  const [override, setOverride] = React.useState<string | null>(null)
  const draft = override ?? savedInstructions
  const [saved, setSaved] = React.useState(false)

  const isDirty = override !== null && override !== savedInstructions
  const previewFull = buildStevenSystemPrompt({
    customInstructions: draft,
    learnedContext: steven?.learnedContext ?? '',
  })

  const handleSave = () => {
    setStevenCustomInstructions(draft)
    setOverride(null)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <SectionHeader
        eyebrow="Settings"
        title="Configuration"
        description="Clés API (BYOK) et personnalisation de Steven — ton compagnon de brainstorming."
      />

      {loaded ? (
        <APIKeysSettings
          settings={settings}
          onSave={save}
          onTest={testConnection}
        />
      ) : null}

      {isFirebaseConfigured() ? (
        <Card className="p-4">
          <div className="text-micro text-tertiary/60">Sync cloud</div>
          <p className="mt-2 text-sm text-tertiary/75">
            Ton workspace est synchronisé sur Firestore (users/…/workspace/main) quand tu es connecté.
            Les clés API restent uniquement sur cet appareil.
          </p>
        </Card>
      ) : null}

      {!isAvailable && loaded ? (
        <p className="text-sm text-tertiary/60">
          Sans clé configurée, l&apos;app fonctionne en mode manuel.
        </p>
      ) : null}

      <SectionHeader
        eyebrow="Steven"
        title="Persona & instructions"
        description="The operational brain behind NextStep Idea OS — persona, reasoning style, and how he accompanies your brainstorms."
      />

      <Card className="border-primary/25 bg-primary/5 p-5 sm:p-6">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[--radius-sharp] bg-midnight text-lg font-black text-primary">
            S
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-lg font-black tracking-tight text-midnight">Steven</div>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-tertiary/80">
              Mentor opérationnel — not a coach. He clarifies, challenges with care, classifies ideas
              in your portfolio, and suggests the lightest next step. After each validated brainstorm,
              his understanding of you evolves automatically.
            </p>
            <div className="mt-3 text-micro text-tertiary/55">
              Prompt version {STEVEN_PROMPT_VERSION} · base prompt is read-only (updated with app
              releases)
            </div>
          </div>
        </div>
      </Card>

      <StevenLastEvolutionCard lastEvolution={steven?.lastEvolution ?? null} />

      {steven?.learnedContext?.trim() ? (
        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-bold text-midnight">Contexte appris (automatique)</h2>
            <p className="mt-1 text-sm text-tertiary/70">
              Mémoire évolutive maintenue par Steven après chaque échange validé — lecture seule.
            </p>
          </div>
          <Card className="overflow-hidden p-0">
            <pre className="max-h-[min(16rem,35vh)] overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-[11px] leading-relaxed text-midnight sm:p-5 sm:text-xs">
              {steven.learnedContext}
            </pre>
          </Card>
        </section>
      ) : null}

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-bold text-midnight">System prompt</h2>
          <p className="mt-1 text-sm text-tertiary/70">
            Steven&apos;s full persona — identity, experience, lenses, conversation flow, and output
            format. This is what the AI receives as its core instructions.
          </p>
        </div>
        <Card className="overflow-hidden p-0">
          <pre className="max-h-[min(28rem,55vh)] overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-[11px] leading-relaxed text-midnight sm:p-5 sm:text-xs">
            {STEVEN_BASE_SYSTEM_PROMPT}
          </pre>
        </Card>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-bold text-midnight">Evolve Steven</h2>
          <p className="mt-1 text-sm text-tertiary/70">
            Add ideas, preferences, or comments that should shape how Steven works with you — tone,
            priorities, sectors to avoid, examples of good feedback, etc. Appended to the system
            prompt on every session.
          </p>
        </div>
        <Card className="space-y-4 p-5 sm:p-6">
          <Textarea
            value={draft}
            onChange={(e) => setOverride(e.target.value)}
            placeholder={`Examples:\n• Prefer shorter answers when I'm on mobile.\n• I'm exploring B2B SaaS and local services — weight both equally.\n• Challenge me more on dispersion — I tend to start too many parallel ideas.\n• When classifying, always mention if an idea could share a back-office with another.`}
            className="min-h-[160px] font-mono text-xs sm:text-sm"
            aria-label="Custom instructions for Steven"
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleSave} disabled={!isDirty}>
              Save instructions
            </Button>
            {saved ? (
              <span className="text-sm text-primary/90">Saved — Steven will use this on next session.</span>
            ) : isDirty ? (
              <span className="text-sm text-tertiary/55">Unsaved changes</span>
            ) : null}
          </div>
        </Card>
      </section>

      {(draft.trim() || steven?.learnedContext?.trim()) ? (
        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-bold text-midnight">Combined prompt preview</h2>
            <p className="mt-1 text-sm text-tertiary/70">
              What Steven will receive on the next session (base + learned context + your manual notes).
            </p>
          </div>
          <Card className="overflow-hidden p-0">
            <pre className="max-h-[min(20rem,40vh)] overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-[11px] leading-relaxed text-tertiary/85 sm:p-5 sm:text-xs">
              {previewFull}
            </pre>
          </Card>
        </section>
      ) : null}
    </div>
  )
}
