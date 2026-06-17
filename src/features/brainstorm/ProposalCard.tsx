import type { ClassificationProposal } from '../../types/ai'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { VERDICT_LABELS } from './applyVerdict'
import { useAppStore, EMPTY_IDEAS } from '../../app/store'

type Props = {
  proposal: ClassificationProposal
  onValidate: () => void
  onSeparate: () => void
  onContinue: () => void
  loading?: boolean
}

export function ProposalCard({
  proposal,
  onValidate,
  onSeparate,
  onContinue,
  loading,
}: Props) {
  const ideas = useAppStore((s) => s.data?.ideas ?? EMPTY_IDEAS)
  const targetIdea = ideas.find((i) => i.id === proposal.targetIdeaId)

  return (
    <Card className="space-y-5 p-5 sm:p-6">
      <div>
        <div className="text-micro text-tertiary/60">Ce que Steven a compris</div>
        <h2 className="mt-2 text-lg font-black tracking-tight text-midnight">
          {proposal.provisionalTitle}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-tertiary/80">
          {proposal.understoodSummary}
        </p>
      </div>

      <div className="rounded-[--radius-sharp] border border-primary/25 bg-primary/5 p-4">
        <div className="text-micro text-tertiary/60">Classification proposée</div>
        <p className="mt-1 text-sm font-semibold text-midnight">
          → {VERDICT_LABELS[proposal.verdict]}
          {targetIdea ? ` : « ${targetIdea.title} »` : ''}
        </p>
        {proposal.alternativeNote ? (
          <p className="mt-2 text-xs text-tertiary/70">{proposal.alternativeNote}</p>
        ) : null}
      </div>

      {proposal.founderFitNote ? (
        <div>
          <div className="text-micro text-tertiary/60">Fit fondateur</div>
          <p className="mt-1 text-sm text-tertiary/80">{proposal.founderFitNote}</p>
        </div>
      ) : null}

      {proposal.energyNote ? (
        <div>
          <div className="text-micro text-tertiary/60">Énergie</div>
          <p className="mt-1 text-sm text-tertiary/80">{proposal.energyNote}</p>
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button type="button" disabled={loading} onClick={onValidate}>
          {loading ? 'Création…' : 'Valider'}
        </Button>
        {(proposal.verdict === 'extension' || proposal.verdict === 'variant') && (
          <Button type="button" variant="ghost" disabled={loading} onClick={onSeparate}>
            Idée séparée
          </Button>
        )}
        <Button type="button" variant="ghost" disabled={loading} onClick={onContinue}>
          Continuer à brainstormer
        </Button>
      </div>
    </Card>
  )
}
