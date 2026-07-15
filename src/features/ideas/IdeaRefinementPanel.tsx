import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Textarea } from '../../components/ui/Textarea'
import { Field } from '../../components/ui/Field'
import type { Idea } from '../../types/domain'
import { refinementDisplayText, isValidRefinement } from './applyRefinement'
import { useIdeaRefinement } from './useIdeaRefinement'
import { InspirationEditor } from './InspirationEditor'
import { useAppStore } from '../../app/store'
import { SpeechDictationBar } from '../speech/SpeechDictationBar'
import { appendDictationText } from '../speech/appendDictationText'

type Props = {
  idea: Idea
}

function formatRefinementDate(idea: Idea, refinementId: string): string {
  const ref = idea.refinements?.find((r) => r.id === refinementId)
  if (!ref?.createdAt) return ''
  const ms = ref.createdAt.toMillis?.() ?? 0
  if (!ms) return ''
  return new Date(ms).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function IdeaRefinementPanel({ idea }: Props) {
  const updateIdea = useAppStore((s) => s.updateIdea)
  const {
    notes,
    setNotes,
    saveNotes,
    refineWithAI,
    loading,
    saving,
    error,
    canSubmit,
    isTaskAvailable,
    loaded,
    lastChangeSummary,
  } = useIdeaRefinement(idea)

  if (!loaded) return null

  const busy = loading || saving
  const history = [...(idea.refinements ?? [])].filter(isValidRefinement).reverse()

  const appendDictation = (spoken: string) => {
    setNotes((prev) => appendDictationText(prev, spoken))
  }

  return (
    <Card className="border-primary/20 bg-primary/[0.03] p-6">
      <div>
        <div className="text-micro text-tertiary/60">Affiner le projet</div>
        <p className="mt-1 text-sm leading-relaxed text-tertiary/75">
          Ajoute ce que tu veux — deal, modèle, marché, pistes… Steven trie et met à jour la fiche
          stratégique.
        </p>
      </div>

      <div className="mt-5">
        <Field
          label="Tes précisions"
          hint="Texte libre : conditions du deal, vision du marché, structure de la boîte, prochaines étapes…"
        >
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
            placeholder="Ex. J'ai eu un call avec la franchise — 45k€ d'entrée, 6% de redevances. Le quartier se gentrifie vite, peu de bars à vin premium. Je pourrais tester un pop-up un vendredi soir avant de m'engager…"
            disabled={busy}
            className="min-h-[140px]"
          />
          <SpeechDictationBar disabled={busy} onAppend={appendDictation} className="mt-2" />
        </Field>
      </div>

      <div className="mt-5 border-t border-alternate/40 pt-5">
        <Field
          label="Documents & liens"
          hint="PDF, deck, site, article… enregistrés automatiquement sur la fiche"
        >
          <InspirationEditor
            mode="attachment"
            value={idea.inspirations ?? []}
            onChange={(inspirations) => updateIdea(idea.id, { inspirations })}
            disabled={busy}
          />
        </Field>
      </div>

      {error ? <p className="mt-4 text-sm text-red-600/90">{error}</p> : null}

      {lastChangeSummary && lastChangeSummary.length > 0 ? (
        <div className="mt-4 rounded-[--radius-sharp] border border-primary/25 bg-primary/10 px-4 py-3">
          <div className="text-micro text-primary/80">Mis à jour par Steven</div>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-tertiary/85">
            {lastChangeSummary.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        {isTaskAvailable ? (
          <Button type="button" disabled={!canSubmit || busy} onClick={() => void refineWithAI()}>
            {loading ? 'Affinement…' : 'Affiner avec Steven'}
          </Button>
        ) : (
          <p className="text-xs text-tertiary/55 self-center">
            Clé API requise pour l&apos;affinement AI (Settings)
          </p>
        )}
        <Button
          type="button"
          variant="ghost"
          disabled={!canSubmit || busy}
          onClick={() => void saveNotes()}
        >
          {saving ? 'Enregistrement…' : 'Enregistrer mes notes'}
        </Button>
      </div>

      {history.length > 0 ? (
        <div className="mt-6 space-y-3 border-t border-alternate/50 pt-5">
          <div className="text-micro text-tertiary/60">Historique des affinements</div>
          {history.map((ref) => {
            const text = refinementDisplayText(ref)
            return (
              <div
                key={ref.id}
                className="rounded-[--radius-sharp] border border-alternate/60 bg-background px-4 py-3 text-sm"
              >
                <div className="text-micro text-tertiary/55">{formatRefinementDate(idea, ref.id)}</div>
                {ref.changeSummary && ref.changeSummary.length > 0 ? (
                  <ul className="mt-2 list-inside list-disc space-y-0.5 text-xs text-tertiary/75">
                    {ref.changeSummary.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                ) : null}
                {text ? (
                  <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-tertiary/70">
                    {text}
                  </p>
                ) : null}
              </div>
            )
          })}
        </div>
      ) : null}
    </Card>
  )
}
