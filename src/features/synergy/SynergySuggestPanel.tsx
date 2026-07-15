import { Sparkles } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { AIBanner } from '../../components/AIBanner'
import {
  PortfolioSuggestionCard,
  DismissSuggestionButton,
} from '../portfolio/PortfolioSuggestionCard'
import { ideaTitleById } from '../portfolio/portfolioUtils'
import { useAppStore, EMPTY_IDEAS } from '../../app/store'
import { synergyTypeLabels } from './synergyLabels'
import { useSynergySuggest } from './useSynergySuggest'

export function SynergySuggestPanel() {
  const ideas = useAppStore((s) => s.data?.ideas ?? EMPTY_IDEAS)
  const {
    suggest,
    apply,
    dismiss,
    updateNotes,
    loading,
    error,
    summary,
    suggestions,
    openCount,
    isAvailable,
  } = useSynergySuggest()

  const visible = suggestions.filter((s) => s.status !== 'dismissed')

  if (!isAvailable && visible.length === 0) {
    return <AIBanner />
  }

  return (
    <Card className="border-primary/25 bg-primary/5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-midnight">
            <Sparkles className="h-4 w-4 text-primary" />
            Suggestions Steven
          </div>
          <p className="mt-1 text-xs text-tertiary/70">
            Synergies manquantes détectées à partir de ton portfolio — sans lancer une analyse
            globale complète.
          </p>
        </div>
        {isAvailable ? (
          <Button type="button" disabled={loading} onClick={() => void suggest()}>
            {loading ? 'Analyse…' : openCount > 0 ? 'Relancer' : 'Suggérer des synergies'}
          </Button>
        ) : null}
      </div>

      {error ? <p className="mt-3 text-sm text-red-600/90">{error}</p> : null}

      {summary ? (
        <p className="mt-4 rounded-[--radius-sharp] border border-alternate/50 bg-background/80 px-3 py-2 text-xs leading-relaxed text-tertiary/80">
          {summary}
        </p>
      ) : null}

      {visible.length > 0 ? (
        <div className="mt-4 space-y-2">
          {visible.map((s) => {
            const typeLabel = s.synergyType ? synergyTypeLabels[s.synergyType] : undefined
            return (
              <PortfolioSuggestionCard
                key={s.id}
                title={`${ideaTitleById(ideas, s.sourceIdeaId)} ↔ ${ideaTitleById(ideas, s.targetIdeaId)}`}
                subtitle={[typeLabel, `Score ${s.score}/10`].filter(Boolean).join(' · ')}
                note={s.note}
                status={s.status === 'applied' ? 'applied' : 'open'}
                userNotes={s.userNotes}
                onNotesChange={(notes) => updateNotes(s.id, notes)}
              >
                <Button type="button" onClick={() => apply(s.id)}>
                  Créer le lien
                </Button>
                <DismissSuggestionButton onDismiss={() => dismiss(s.id)} />
              </PortfolioSuggestionCard>
            )
          })}
        </div>
      ) : summary && !loading ? (
        <p className="mt-4 text-xs text-tertiary/55">
          Aucune nouvelle synergie évidente — ton réseau est peut-être déjà bien couvert.
        </p>
      ) : null}
    </Card>
  )
}
