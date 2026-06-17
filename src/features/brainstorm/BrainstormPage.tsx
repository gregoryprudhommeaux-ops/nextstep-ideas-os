import { Link } from 'react-router-dom'
import { SectionHeader } from '../../components/SectionHeader'
import { Card } from '../../components/ui/Card'
import { Textarea } from '../../components/ui/Textarea'
import { Button } from '../../components/ui/Button'
import { AIBanner } from '../../components/AIBanner'
import { cn } from '../../lib/cn'
import { useBrainstorm } from './useBrainstorm'
import { ManualClassification } from './ManualClassification'

const verdictLabels: Record<string, string> = {
  new: 'Nouvelle idée',
  extension: "Extension d'une idée existante",
  variant: 'Variante proche',
  sharedBase: 'Socle mutualisé',
}

export function BrainstormPage() {
  const {
    phase,
    rawInput,
    setRawInput,
    questions,
    answers,
    setAnswer,
    proposal,
    error,
    resultIdeaId,
    loaded,
    isAvailable,
    share,
    submitClarifications,
    validateProposal,
    submitManual,
    reset,
  } = useBrainstorm()

  const busy = phase === 'loading' || phase === 'applying'

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <SectionHeader
        eyebrow="Flux du moment"
        title="Qu'est-ce qui te traverse l'esprit ?"
        description="Partage une pensée brute — Steven clarifie, classe et enrichit sa compréhension de toi à chaque échange validé."
      />

      {loaded && !isAvailable ? <AIBanner /> : null}

      {error ? (
        <Card className="border-red-300/60 bg-red-50/80 p-4 text-sm text-red-900">{error}</Card>
      ) : null}

      {phase === 'done' ? (
        <Card className="space-y-4 border-primary/30 bg-primary/5 p-5">
          <div className="text-sm font-bold text-midnight">Échange enregistré</div>
          <p className="text-sm leading-relaxed text-tertiary/80">
            Steven a mis à jour sa compréhension de ton profil. Tu peux voir le détail dans{' '}
            <Link to="/app/settings" className="font-medium text-midnight underline-offset-2 hover:underline">
              Settings
            </Link>
            .
          </p>
          {resultIdeaId ? (
            <Link
              to={`/app/ideas/${resultIdeaId}`}
              className="inline-block text-sm font-medium text-midnight underline-offset-2 hover:underline"
            >
              Voir l'idée créée →
            </Link>
          ) : null}
          <Button type="button" variant="ghost" onClick={reset}>
            Nouvel échange
          </Button>
        </Card>
      ) : null}

      {(phase === 'input' || phase === 'error') && !isAvailable && loaded ? (
        <ManualClassification onSubmit={submitManual} />
      ) : null}

      {(phase === 'input' || phase === 'error') && isAvailable ? (
        <Card className="space-y-4 p-5">
          <Textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder="J'ai pensé à un outil qui aide les freelances à facturer via WhatsApp, ça rejoint un peu mon idée de back-office…"
            rows={6}
            className="min-h-[160px]"
            disabled={busy}
          />
          <div className="flex justify-end">
            <Button
              type="button"
              disabled={!rawInput.trim() || busy}
              onClick={() => void share()}
            >
              Partager à Steven
            </Button>
          </div>
        </Card>
      ) : null}

      {phase === 'clarifying' ? (
        <Card className="space-y-5 p-5">
          <div>
            <div className="text-micro text-tertiary/60">Steven</div>
            <p className="mt-1 text-sm font-medium text-midnight">
              Quelques questions pour affiner — pas de business plan.
            </p>
          </div>
          {questions.map((q) => (
            <div key={q.id} className="space-y-2">
              <div className="text-sm text-midnight">{q.text}</div>
              <div className="flex flex-wrap gap-2">
                {q.options.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAnswer(q.id, opt.label)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-medium transition',
                      answers[q.id] === opt.label
                        ? 'border-primary/50 bg-primary/15 text-midnight'
                        : 'border-alternate/60 bg-background text-tertiary/75 hover:border-alternate'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setAnswer(q.id, 'Je ne sais pas encore')}
                  className={cn(
                    'rounded-full border border-dashed px-3 py-1.5 text-xs font-medium transition',
                    answers[q.id] === 'Je ne sais pas encore'
                      ? 'border-primary/50 bg-primary/15 text-midnight'
                      : 'border-alternate/60 text-tertiary/60 hover:border-alternate'
                  )}
                >
                  Je ne sais pas encore
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={reset} disabled={busy}>
              Annuler
            </Button>
            <Button type="button" disabled={busy} onClick={() => void submitClarifications()}>
              Continuer
            </Button>
          </div>
        </Card>
      ) : null}

      {phase === 'proposing' && proposal ? (
        <Card className="space-y-4 p-5">
          <div className="text-micro text-tertiary/60">Proposition de Steven</div>
          <div className="text-lg font-black tracking-tight text-midnight">{proposal.provisionalTitle}</div>
          <p className="text-sm leading-relaxed text-tertiary/80">{proposal.understoodSummary}</p>
          <div className="rounded-[--radius-sharp] border border-alternate/50 bg-mineral px-3 py-2 text-sm">
            <span className="font-semibold text-midnight">Classification : </span>
            {verdictLabels[proposal.verdict] ?? proposal.verdict}
            {proposal.confidence ? (
              <span className="text-tertiary/60"> · confiance {proposal.confidence}</span>
            ) : null}
          </div>
          {proposal.founderFitNote ? (
            <p className="text-sm text-tertiary/75">
              <span className="font-medium text-midnight">Fit : </span>
              {proposal.founderFitNote}
            </p>
          ) : null}
          {proposal.energyNote ? (
            <p className="text-sm text-tertiary/75">
              <span className="font-medium text-midnight">Énergie : </span>
              {proposal.energyNote}
            </p>
          ) : null}
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="ghost" onClick={reset} disabled={busy}>
              Recommencer
            </Button>
            {(proposal.verdict === 'extension' || proposal.verdict === 'variant') && (
              <Button
                type="button"
                variant="ghost"
                disabled={busy}
                onClick={() => void validateProposal(true)}
              >
                Idée séparée
              </Button>
            )}
            <Button type="button" disabled={busy} onClick={() => void validateProposal(false)}>
              Valider
            </Button>
          </div>
        </Card>
      ) : null}

      {busy ? (
        <p className="text-center text-sm text-tertiary/55">Steven analyse…</p>
      ) : null}
    </div>
  )
}
