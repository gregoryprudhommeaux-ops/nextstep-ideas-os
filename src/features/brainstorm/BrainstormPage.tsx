import { Link } from 'react-router-dom'
import { ArrowRight, Check, Settings } from 'lucide-react'
import { SectionHeader } from '../../components/SectionHeader'
import { Card } from '../../components/ui/Card'
import { Textarea } from '../../components/ui/Textarea'
import { Button } from '../../components/ui/Button'
import { AIBanner } from '../../components/AIBanner'
import { cn } from '../../lib/cn'
import { optionsForDisplay, UNSURE_ANSWER_LABEL } from './clarifyingOptions'
import { useBrainstorm } from './useBrainstorm'
import { ManualClassification } from './ManualClassification'
import { SpeechDictationBar } from '../speech/SpeechDictationBar'
import { appendDictationText } from '../speech/appendDictationText'

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

  const appendDictation = (spoken: string) => {
    setRawInput((prev) => appendDictationText(prev, spoken))
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {phase !== 'done' ? (
        <SectionHeader
          eyebrow="Flux du moment"
          title="Qu'est-ce qui te traverse l'esprit ?"
          description="Partage une pensée brute — Steven clarifie, classe et enrichit sa compréhension de toi à chaque échange validé."
        />
      ) : null}

      {loaded && !isAvailable ? <AIBanner /> : null}

      {error ? (
        <Card className="border-red-300/60 bg-red-50/80 p-4 text-sm text-red-900">{error}</Card>
      ) : null}

      {phase === 'done' ? (
        <Card className="overflow-hidden border-primary/35 p-0 shadow-sm">
          <div className="border-b border-primary/20 bg-primary/10 px-5 py-5 sm:px-6">
            <div className="flex items-start gap-4">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[--radius-sharp] bg-primary/30"
                aria-hidden
              >
                <Check className="h-5 w-5 text-midnight" strokeWidth={2.5} />
              </div>
              <div className="min-w-0 pt-0.5">
                <div className="text-micro font-semibold text-midnight/55">Échange enregistré</div>
                <h2 className="mt-1 text-balance text-xl font-black tracking-tight text-midnight sm:text-2xl">
                  Steven a intégré ta pensée
                </h2>
              </div>
            </div>
          </div>

          <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
            <p className="text-sm leading-relaxed text-tertiary/80">
              {resultIdeaId
                ? 'Une nouvelle entrée a été ajoutée à ton Portfolio. Steven a aussi mis à jour sa compréhension de ton profil fondateur.'
                : 'Steven a enrichi sa compréhension de ton profil — sans nouvelle idée dans le Portfolio cette fois.'}
            </p>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {resultIdeaId ? (
                <Link to={`/app/ideas/${resultIdeaId}`} className="w-full sm:w-auto">
                  <Button type="button" className="w-full gap-2 sm:min-w-[12rem]">
                    Voir l&apos;idée créée
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link to="/app/portfolio" className="w-full sm:w-auto">
                  <Button type="button" className="w-full gap-2 sm:min-w-[12rem]">
                    Ouvrir le Portfolio
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
              <Button
                type="button"
                variant="ghost"
                onClick={reset}
                className="w-full sm:w-auto sm:min-w-[10rem]"
              >
                Nouvel échange
              </Button>
            </div>

            <div className="flex items-center gap-2 border-t border-alternate/50 pt-4 text-xs text-tertiary/65">
              <Settings className="h-3.5 w-3.5 shrink-0 text-tertiary/45" aria-hidden />
              <span>
                Détail des apprentissages dans{' '}
                <Link
                  to="/app/settings"
                  className="font-semibold text-midnight underline decoration-primary/40 underline-offset-2 hover:decoration-primary"
                >
                  Settings
                </Link>
              </span>
            </div>
          </div>
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
          <SpeechDictationBar disabled={busy} onAppend={appendDictation} />
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
                {optionsForDisplay(q.options).map((opt) => (
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
                  onClick={() => setAnswer(q.id, UNSURE_ANSWER_LABEL)}
                  className={cn(
                    'rounded-full border border-dashed px-3 py-1.5 text-xs font-medium transition',
                    answers[q.id] === UNSURE_ANSWER_LABEL
                      ? 'border-primary/50 bg-primary/15 text-midnight'
                      : 'border-alternate/60 text-tertiary/60 hover:border-alternate'
                  )}
                >
                  {UNSURE_ANSWER_LABEL}
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
