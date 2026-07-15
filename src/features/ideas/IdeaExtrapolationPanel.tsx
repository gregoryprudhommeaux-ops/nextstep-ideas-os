import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Textarea } from '../../components/ui/Textarea'
import { Field } from '../../components/ui/Field'
import { cn } from '../../lib/cn'
import type { ExtrapolationMode, Idea, IdeaExtrapolation, IdeaExtrapolationProposal } from '../../types/domain'
import { useAppStore, EMPTY_IDEAS } from '../../app/store'
import { ideaTitleById } from '../portfolio/portfolioUtils'
import {
  extrapolationAmbitionOptions,
  extrapolationModeLabels,
  extrapolationModeOptions,
  extrapolationTriageLabels,
  extrapolationTriageStyles,
} from './extrapolationLabels'
import { useIdeaExtrapolation } from './useIdeaExtrapolation'
import { formatAnalysisDate } from '../portfolio/portfolioAnalysisUtils'
import { PortfolioSuggestionCard, DismissSuggestionButton } from '../portfolio/PortfolioSuggestionCard'
import { SpeechDictationBar } from '../speech/SpeechDictationBar'
import { appendDictationText } from '../speech/appendDictationText'
import { ExtrapolationMindMap } from './ExtrapolationMindMap'

type Props = {
  idea: Idea
}

function ExtrapolationProposalCard({
  proposal,
  subtitle,
  onNotesChange,
  onDismiss,
  onCreateIdea,
}: {
  proposal: IdeaExtrapolationProposal
  subtitle?: string
  onNotesChange: (notes: string) => void
  onDismiss: () => void
  onCreateIdea: () => void
}) {
  const status =
    proposal.status === 'converted'
      ? 'converted'
      : proposal.status === 'dismissed'
        ? 'dismissed'
        : 'open'

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 px-1">
        <span
          className={`rounded-full px-2 py-0.5 text-micro font-medium ${extrapolationTriageStyles[proposal.triage]}`}
        >
          {extrapolationTriageLabels[proposal.triage]}
        </span>
        {proposal.triage === 'off_focus' ? (
          <span className="text-micro text-tertiary/50">Steven recommande d&apos;écarter</span>
        ) : null}
      </div>
      <PortfolioSuggestionCard
        title={proposal.title}
        subtitle={subtitle ?? proposal.oneLiner}
        note={[proposal.rationale, proposal.triageReason].filter(Boolean).join('\n\n')}
        status={status}
        userNotes={proposal.userNotes}
        resultIdeaId={proposal.resultIdeaId}
        onNotesChange={onNotesChange}
      >
        <Button type="button" onClick={onCreateIdea}>
          Créer comme idée
        </Button>
        <DismissSuggestionButton onDismiss={onDismiss} />
      </PortfolioSuggestionCard>
    </div>
  )
}

function ProposalColumns({
  extrapolation,
  ideas,
  onNotesChange,
  onDismiss,
  onCreateIdea,
}: {
  extrapolation: IdeaExtrapolation
  ideas: Idea[]
  onNotesChange: (kind: 'complement' | 'portfolio_link', id: string, notes: string) => void
  onDismiss: (kind: 'complement' | 'portfolio_link', id: string) => void
  onCreateIdea: (kind: 'complement' | 'portfolio_link', id: string) => void
}) {
  const visibleComplements = extrapolation.complementProposals.filter((p) => p.status !== 'dismissed')
  const visiblePortfolioLinks = extrapolation.portfolioLinkProposals.filter(
    (p) => p.status !== 'dismissed'
  )

  if (visibleComplements.length === 0 && visiblePortfolioLinks.length === 0) return null

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-midnight">Extensions du noyau</h3>
        <p className="text-xs text-tertiary/60">
          Pistes proches qui renforcent l&apos;idée sans la dénaturer.
        </p>
        {visibleComplements.length === 0 ? (
          <p className="text-xs text-tertiary/55">Aucune proposition active.</p>
        ) : (
          visibleComplements.map((p) => (
            <ExtrapolationProposalCard
              key={p.id}
              proposal={p}
              onNotesChange={(notes) => onNotesChange('complement', p.id, notes)}
              onDismiss={() => onDismiss('complement', p.id)}
              onCreateIdea={() => onCreateIdea('complement', p.id)}
            />
          ))
        )}
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-bold text-midnight">Liens avec ton portfolio</h3>
        <p className="text-xs text-tertiary/60">
          Ponts avec tes autres idées pour rester centré sur un cœur de business.
        </p>
        {visiblePortfolioLinks.length === 0 ? (
          <p className="text-xs text-tertiary/55">
            Aucun lien portfolio proposé — ajoute d&apos;autres idées ou relance en mode Expand.
          </p>
        ) : (
          visiblePortfolioLinks.map((p) => (
            <ExtrapolationProposalCard
              key={p.id}
              proposal={p}
              subtitle={
                p.relatedIdeaIds?.length
                  ? `↔ ${p.relatedIdeaIds.map((id) => ideaTitleById(ideas, id)).join(' · ')}`
                  : p.oneLiner
              }
              onNotesChange={(notes) => onNotesChange('portfolio_link', p.id, notes)}
              onDismiss={() => onDismiss('portfolio_link', p.id)}
              onCreateIdea={() => onCreateIdea('portfolio_link', p.id)}
            />
          ))
        )}
      </section>
    </div>
  )
}

function ExtrapolationResults({
  idea,
  extrapolation,
  ideas,
  updateProposalNotes,
  dismissProposal,
  createIdeaFromProposal,
}: {
  idea: Idea
  extrapolation: IdeaExtrapolation
  ideas: Idea[]
  updateProposalNotes: (kind: 'complement' | 'portfolio_link', id: string, notes: string) => void
  dismissProposal: (kind: 'complement' | 'portfolio_link', id: string) => void
  createIdeaFromProposal: (kind: 'complement' | 'portfolio_link', id: string) => string
}) {
  const navigate = useNavigate()
  const mode: ExtrapolationMode = extrapolation.mode ?? 'expand'
  const [proposalView, setProposalView] = useState<'list' | 'map'>('map')

  const handleCreate = (kind: 'complement' | 'portfolio_link', id: string) => {
    const newId = createIdeaFromProposal(kind, id)
    if (newId) navigate(`/app/ideas/${newId}`)
  }

  return (
    <div className="mt-8 space-y-6 border-t border-alternate/50 pt-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-primary/20 px-2.5 py-1 text-micro font-semibold text-midnight">
          {extrapolationModeLabels[mode]}
        </span>
      </div>

      <section className="space-y-3 rounded-[--radius-sharp] border border-primary/20 bg-primary/5 p-4">
        <h3 className="text-sm font-bold text-midnight">Synthèse</h3>
        <p className="text-sm leading-relaxed text-tertiary/85">{extrapolation.reformulation}</p>
        <div>
          <div className="text-micro text-tertiary/55">Noyau à préserver</div>
          <p className="mt-1 text-sm text-tertiary/80">{extrapolation.coreToPreserve}</p>
          {extrapolation.corePromise ? (
            <p className="mt-1 text-xs text-tertiary/65">{extrapolation.corePromise}</p>
          ) : null}
        </div>
      </section>

      {mode === 'challenge' ? (
        <section className="grid gap-4 md:grid-cols-2">
          <Card className="border-alternate/50 bg-mineral/30 p-4">
            <div className="text-micro text-tertiary/55">Faiblesses & angles morts</div>
            <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-tertiary/75">
              {extrapolation.weaknesses.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
            {extrapolation.criticalNotes.length > 0 ? (
              <ul className="mt-3 list-inside list-disc space-y-1 text-xs text-tertiary/65">
                {extrapolation.criticalNotes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            ) : null}
          </Card>
          <Card className="border-alternate/50 bg-mineral/30 p-4">
            <div className="text-micro text-tertiary/55">Hypothèses à tester avant d&apos;aller plus loin</div>
            <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-tertiary/75">
              {(extrapolation.hypothesesToTest ?? []).map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </Card>
        </section>
      ) : null}

      {mode === 'focus' ? (
        <Card className="border-primary/25 bg-primary/5 p-4">
          <div className="text-micro text-primary/80">Version resserrée</div>
          <p className="mt-2 text-sm leading-relaxed text-tertiary/85">{extrapolation.tightenedIdea}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-micro text-tertiary/55">Directions prioritaires</div>
              <ol className="mt-1 list-inside list-decimal space-y-0.5 text-xs text-tertiary/75">
                {extrapolation.priorityDirections.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ol>
            </div>
            <div>
              <div className="text-micro text-tertiary/55">Erreurs à éviter</div>
              <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs text-tertiary/75">
                {extrapolation.mistakesToAvoid.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      ) : null}

      {(mode === 'expand' || mode === 'focus') && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-midnight">Propositions</h3>
              <p className="text-xs text-tertiary/60">
                Vue haut niveau des extensions et des ponts avec ton portfolio.
              </p>
            </div>
            <div className="flex rounded-[--radius-sharp] border border-alternate/60 p-0.5">
              {(
                [
                  { id: 'map' as const, label: 'Carte' },
                  { id: 'list' as const, label: 'Liste' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setProposalView(opt.id)}
                  className={cn(
                    'rounded-[--radius-sharp] px-3 py-1.5 text-xs font-medium transition',
                    proposalView === opt.id
                      ? 'bg-primary/20 text-midnight'
                      : 'text-tertiary/65 hover:text-midnight'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {proposalView === 'map' ? (
            <ExtrapolationMindMap idea={idea} extrapolation={extrapolation} ideas={ideas} />
          ) : (
            <ProposalColumns
              extrapolation={extrapolation}
              ideas={ideas}
              onNotesChange={updateProposalNotes}
              onDismiss={dismissProposal}
              onCreateIdea={handleCreate}
            />
          )}
        </div>
      )}

      {extrapolation.strategicQuestion ? (
        <Card className="border-primary/25 bg-primary/5 p-4">
          <div className="text-micro text-primary/80">Question stratégique suivante</div>
          <p className="mt-2 text-sm font-medium text-midnight">{extrapolation.strategicQuestion}</p>
        </Card>
      ) : null}
    </div>
  )
}

export function IdeaExtrapolationPanel({ idea }: Props) {
  const ideas = useAppStore((s) => s.data?.ideas ?? EMPTY_IDEAS)
  const {
    preserveInput,
    setPreserveInput,
    avoidInput,
    setAvoidInput,
    ambition,
    setAmbition,
    loadingMode,
    error,
    explore,
    isTaskAvailable,
    loaded,
    extrapolation,
    extrapolations,
    selectedId,
    selectExtrapolation,
    updateProposalNotes,
    dismissProposal,
    createIdeaFromProposal,
  } = useIdeaExtrapolation(idea)

  if (!loaded) return null

  const busy = loadingMode !== null

  return (
    <Card className="border-alternate/60 bg-background p-6">
      <div>
        <div className="text-micro text-tertiary/60">Explorer avec Steven</div>
        <p className="mt-1 text-sm leading-relaxed text-tertiary/75">
          Trois modes : enrichir (Expand), challenger (Challenge) ou recentrer (Focus) — sans perdre le
          cœur de l&apos;idée.
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="À préserver absolument" hint="Le cœur que Steven ne doit pas diluer">
          <Textarea
            value={preserveInput}
            onChange={(e) => setPreserveInput(e.target.value)}
            rows={3}
            placeholder="Ex. Le positionnement premium local, pas une chaîne nationale…"
            disabled={busy}
          />
          <SpeechDictationBar
            disabled={busy}
            onAppend={(spoken) => setPreserveInput((prev) => appendDictationText(prev, spoken))}
            className="mt-2"
          />
        </Field>
        <Field label="À éviter" hint="Dispersion, modèles ou marchés hors scope">
          <Textarea
            value={avoidInput}
            onChange={(e) => setAvoidInput(e.target.value)}
            rows={3}
            placeholder="Ex. Marketplace multi-villes, levée de fonds, recrutement lourd…"
            disabled={busy}
          />
          <SpeechDictationBar
            disabled={busy}
            onAppend={(spoken) => setAvoidInput((prev) => appendDictationText(prev, spoken))}
            className="mt-2"
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Niveau d'ambition">
          <select
            value={ambition}
            disabled={busy}
            onChange={(e) => setAmbition(e.target.value as typeof ambition)}
            className="w-full rounded-[--radius-sharp] border border-alternate/70 bg-background px-3 py-2 text-sm text-midnight focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          >
            {extrapolationAmbitionOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-5 space-y-3">
        <div className="text-micro text-tertiary/55">Choisir un mode</div>
        {isTaskAvailable ? (
          <div className="grid gap-2 sm:grid-cols-3">
            {extrapolationModeOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={busy}
                onClick={() => void explore(opt.value)}
                className={cn(
                  'rounded-[--radius-sharp] border p-3 text-left transition',
                  loadingMode === opt.value
                    ? 'border-primary/50 bg-primary/15 ring-2 ring-primary/25'
                    : 'border-alternate/60 bg-background hover:border-alternate hover:bg-mineral/40',
                  busy && loadingMode !== opt.value && 'opacity-50'
                )}
              >
                <div className="flex items-center gap-1.5 text-sm font-semibold text-midnight">
                  {loadingMode === opt.value ? (
                    <span className="text-xs font-normal text-tertiary/70">En cours…</span>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      {opt.label}
                    </>
                  )}
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-tertiary/65">{opt.description}</p>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-tertiary/55">Clé API requise (Settings)</p>
        )}
      </div>

      {error ? <p className="mt-3 text-sm text-red-600/90">{error}</p> : null}

      {extrapolations.length > 1 ? (
        <div className="mt-6 space-y-2 border-t border-alternate/40 pt-5">
          <div className="text-micro text-tertiary/55">Historique ({extrapolations.length})</div>
          <div className="flex flex-wrap gap-2">
            {extrapolations.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectExtrapolation(item.id)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-medium transition',
                  selectedId === item.id
                    ? 'border-primary/50 bg-primary/15 text-midnight'
                    : 'border-alternate/60 text-tertiary/70 hover:border-alternate'
                )}
              >
                {extrapolationModeLabels[item.mode ?? 'expand'].split(' — ')[0]} ·{' '}
                {formatAnalysisDate(item.createdAt)}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {extrapolation ? (
        <ExtrapolationResults
          idea={idea}
          extrapolation={extrapolation}
          ideas={ideas}
          updateProposalNotes={updateProposalNotes}
          dismissProposal={dismissProposal}
          createIdeaFromProposal={createIdeaFromProposal}
        />
      ) : null}
    </Card>
  )
}
