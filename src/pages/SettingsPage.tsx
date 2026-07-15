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
  const { settings, save, testConnection, saveProviderKey, loaded, isAvailable } = useAISettings()

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
          onSaveKey={saveProviderKey}
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
        description="Le cerveau opérationnel derrière NextStep Idea OS — persona, style de raisonnement et façon d'accompagner vos Brainstorms."
      />

      <Card className="border-primary/25 bg-primary/5 p-5 sm:p-6">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[--radius-sharp] bg-midnight text-lg font-black text-primary">
            S
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-lg font-black tracking-tight text-midnight">Steven</div>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-tertiary/80">
              Mentor opérationnel — pas un coach. Il clarifie, challenge avec bienveillance, classe les idées
              dans votre Portfolio et suggère la prochaine étape la plus légère. Après chaque Brainstorm validé,
              sa compréhension de vous évolue automatiquement.
            </p>
            <div className="mt-3 text-micro text-tertiary/55">
              Version du prompt {STEVEN_PROMPT_VERSION} · le prompt de base est en lecture seule (mis à jour avec
              les releases de l&apos;app)
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
          <h2 className="text-sm font-bold text-midnight">Prompt système</h2>
          <p className="mt-1 text-sm text-tertiary/70">
            La persona complète de Steven — identité, expérience, lenses, déroulé de conversation et format
            de sortie. C&apos;est ce que l&apos;AI reçoit comme instructions de base.
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
          <h2 className="text-sm font-bold text-midnight">Faire évoluer Steven</h2>
          <p className="mt-1 text-sm text-tertiary/70">
            Ajoutez des idées, préférences ou commentaires qui doivent façonner la façon dont Steven travaille
            avec vous — ton, priorités, secteurs à éviter, exemples de bon feedback, etc. Ajouté au prompt
            système à chaque session.
          </p>
        </div>
        <Card className="space-y-4 p-5 sm:p-6">
          <Textarea
            value={draft}
            onChange={(e) => setOverride(e.target.value)}
            placeholder={`Exemples :\n• Préférer des réponses plus courtes sur mobile.\n• J'explore le B2B SaaS et les services locaux — pondérer les deux également.\n• Me challenger davantage sur la dispersion — je tends à lancer trop d'idées en parallèle.\n• Lors du classement, toujours mentionner si une idée pourrait partager un back-office avec une autre.`}
            className="min-h-[160px] font-mono text-xs sm:text-sm"
            aria-label="Instructions personnalisées pour Steven"
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleSave} disabled={!isDirty}>
              Enregistrer les instructions
            </Button>
            {saved ? (
              <span className="text-sm text-primary/90">Enregistré — Steven utilisera ceci à la prochaine session.</span>
            ) : isDirty ? (
              <span className="text-sm text-tertiary/55">Modifications non enregistrées</span>
            ) : null}
          </div>
        </Card>
      </section>

      {(draft.trim() || steven?.learnedContext?.trim()) ? (
        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-bold text-midnight">Aperçu du prompt combiné</h2>
            <p className="mt-1 text-sm text-tertiary/70">
              Ce que Steven recevra à la prochaine session (base + contexte appris + vos notes manuelles).
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
