import { Link, useNavigate } from 'react-router-dom'
import type { PortfolioGlobalAnalysis } from '../../types/domain'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import {
  useAppStore,
  EMPTY_IDEAS,
  EMPTY_SYNERGY_LINKS,
} from '../../app/store'
import { ideaTitleById, synergyPairExists } from './portfolioUtils'
import { PortfolioSuggestionCard, DismissSuggestionButton } from './PortfolioSuggestionCard'

type Props = {
  analysis: PortfolioGlobalAnalysis
}

export function PortfolioAnalysisDetail({ analysis }: Props) {
  const navigate = useNavigate()
  const ideas = useAppStore((s) => s.data?.ideas ?? EMPTY_IDEAS)
  const synergyLinks = useAppStore((s) => s.data?.synergyLinks ?? EMPTY_SYNERGY_LINKS)
  const updateAnalysisNotes = useAppStore((s) => s.updatePortfolioAnalysisNotes)
  const updateSuggestionNotes = useAppStore((s) => s.updatePortfolioSuggestionNotes)
  const dismissSuggestion = useAppStore((s) => s.dismissPortfolioSuggestion)
  const applySynergy = useAppStore((s) => s.applyPortfolioSynergySuggestion)
  const applyUmbrella = useAppStore((s) => s.applyPortfolioUmbrellaSuggestion)
  const applySharedBase = useAppStore((s) => s.applyPortfolioSharedBaseSuggestion)
  const createIdea = useAppStore((s) => s.createIdeaFromPortfolioSuggestion)

  const visibleSynergies = analysis.suggestedSynergies.filter(
    (s) =>
      s.status !== 'dismissed' &&
      ideas.some((i) => i.id === s.sourceIdeaId) &&
      ideas.some((i) => i.id === s.targetIdeaId) &&
      (s.status === 'applied' || !synergyPairExists(synergyLinks, s.sourceIdeaId, s.targetIdeaId))
  )

  const hasContent =
    visibleSynergies.length > 0 ||
    analysis.umbrellaCandidates.some((u) => u.status !== 'dismissed') ||
    analysis.sharedBases.some((b) => b.status !== 'dismissed') ||
    analysis.newIdeaProposals.some((n) => n.status !== 'dismissed')

  return (
    <div className="space-y-6">
      <Card className="space-y-4 border-primary/20 bg-primary/5 p-5">
        <div>
          <h2 className="text-sm font-bold text-midnight">Synthèse</h2>
          <p className="mt-2 text-sm leading-relaxed text-tertiary/80">{analysis.summary}</p>
        </div>
        {analysis.ecosystemNote ? (
          <div>
            <h3 className="text-micro font-semibold text-tertiary/60">Écosystème</h3>
            <p className="mt-1 text-sm leading-relaxed text-tertiary/80">
              {analysis.ecosystemNote}
            </p>
          </div>
        ) : null}
        <label className="block space-y-1">
          <span className="text-micro text-tertiary/55">Notes globales sur cette analyse</span>
          <textarea
            className="w-full rounded-[--radius-sharp] border border-alternate/60 bg-background px-3 py-2 text-sm text-midnight placeholder:text-tertiary/45 focus:border-primary/50 focus:outline-none"
            rows={3}
            defaultValue={analysis.userNotes ?? ''}
            placeholder="Réflexions, priorités, prochaines étapes…"
            onBlur={(e) => updateAnalysisNotes(analysis.id, e.target.value)}
          />
        </label>
      </Card>

      {!hasContent ? (
        <Card className="p-5 text-sm text-tertiary/70">
          Toutes les propositions ont été traitées ou ignorées.
        </Card>
      ) : null}

      {visibleSynergies.length > 0 ? (
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-midnight">Synergies</h3>
          {visibleSynergies.map((s) => (
            <PortfolioSuggestionCard
              key={s.id}
              title={`${ideaTitleById(ideas, s.sourceIdeaId)} ↔ ${ideaTitleById(ideas, s.targetIdeaId)}`}
              subtitle={`Score ${s.score}/10`}
              note={s.note}
              status={s.status}
              userNotes={s.userNotes}
              onNotesChange={(notes) =>
                updateSuggestionNotes(analysis.id, 'synergy', s.id, notes)
              }
              resultLinkId={s.resultLinkId}
            >
              <Button type="button" onClick={() => applySynergy(analysis.id, s.id)}>
                Créer le lien
              </Button>
              <DismissSuggestionButton
                onDismiss={() => dismissSuggestion(analysis.id, 'synergy', s.id)}
              />
            </PortfolioSuggestionCard>
          ))}
        </section>
      ) : null}

      {analysis.umbrellaCandidates.filter((u) => u.status !== 'dismissed').length > 0 ? (
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-midnight">Umbrellas émergents</h3>
          {analysis.umbrellaCandidates
            .filter((u) => u.status !== 'dismissed')
            .map((u) => (
              <PortfolioSuggestionCard
                key={u.id}
                title={u.name}
                subtitle={u.ideaIds.map((id) => ideaTitleById(ideas, id)).join(' · ')}
                note={u.note}
                status={u.status}
                userNotes={u.userNotes}
                resultIdeaId={u.resultIdeaId}
                onNotesChange={(notes) =>
                  updateSuggestionNotes(analysis.id, 'umbrella', u.id, notes)
                }
              >
                <Button type="button" onClick={() => applyUmbrella(analysis.id, u.id)}>
                  Créer l&apos;umbrella
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    const ideaId = createIdea(analysis.id, 'umbrella', u.id)
                    if (ideaId) navigate(`/app/ideas/${ideaId}`)
                  }}
                >
                  Créer comme idée
                </Button>
                <DismissSuggestionButton
                  onDismiss={() => dismissSuggestion(analysis.id, 'umbrella', u.id)}
                />
              </PortfolioSuggestionCard>
            ))}
        </section>
      ) : null}

      {analysis.sharedBases.filter((b) => b.status !== 'dismissed').length > 0 ? (
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-midnight">Socles mutualisés</h3>
          {analysis.sharedBases
            .filter((b) => b.status !== 'dismissed')
            .map((b) => (
              <PortfolioSuggestionCard
                key={b.id}
                title={b.name}
                subtitle={`${b.dimensions.join(' · ')} — ${b.ideaIds.map((id) => ideaTitleById(ideas, id)).join(' · ')}`}
                note={b.note}
                status={b.status}
                userNotes={b.userNotes}
                resultIdeaId={b.resultIdeaId}
                onNotesChange={(notes) =>
                  updateSuggestionNotes(analysis.id, 'sharedBase', b.id, notes)
                }
              >
                <Button type="button" onClick={() => applySharedBase(analysis.id, b.id)}>
                  Confirmer le socle
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    const ideaId = createIdea(analysis.id, 'sharedBase', b.id)
                    if (ideaId) navigate(`/app/ideas/${ideaId}`)
                  }}
                >
                  Créer comme idée
                </Button>
                <DismissSuggestionButton
                  onDismiss={() => dismissSuggestion(analysis.id, 'sharedBase', b.id)}
                />
              </PortfolioSuggestionCard>
            ))}
        </section>
      ) : null}

      {analysis.newIdeaProposals.filter((n) => n.status !== 'dismissed').length > 0 ? (
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-midnight">Nouvelles idées émergentes</h3>
          {analysis.newIdeaProposals
            .filter((n) => n.status !== 'dismissed')
            .map((n) => (
              <PortfolioSuggestionCard
                key={n.id}
                title={n.title}
                subtitle={
                  n.oneLiner ??
                  (n.relatedIdeaIds?.length
                    ? `Lié à : ${n.relatedIdeaIds.map((id) => ideaTitleById(ideas, id)).join(' · ')}`
                    : undefined)
                }
                note={[n.description, n.rationale].filter(Boolean).join('\n\n') || n.rationale}
                status={n.status}
                userNotes={n.userNotes}
                resultIdeaId={n.resultIdeaId}
                onNotesChange={(notes) =>
                  updateSuggestionNotes(analysis.id, 'newIdea', n.id, notes)
                }
              >
                <Button
                  type="button"
                  onClick={() => {
                    const ideaId = createIdea(analysis.id, 'newIdea', n.id)
                    if (ideaId) navigate(`/app/ideas/${ideaId}`)
                  }}
                >
                  Créer comme idée
                </Button>
                <DismissSuggestionButton
                  onDismiss={() => dismissSuggestion(analysis.id, 'newIdea', n.id)}
                />
              </PortfolioSuggestionCard>
            ))}
        </section>
      ) : null}

      <p className="text-xs text-tertiary/55">
        <Link to="/app/portfolio" className="underline-offset-2 hover:underline">
          ← Retour au portfolio
        </Link>
      </p>
    </div>
  )
}
