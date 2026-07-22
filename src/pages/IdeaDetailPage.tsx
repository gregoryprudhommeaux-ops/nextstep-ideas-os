import { Link, useNavigate, useParams } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useAppStore, useIdeaScore, EMPTY_DECISION_NOTES, EMPTY_IDEAS, EMPTY_SYNERGY_LINKS } from '../app/store'
import { ScorePill } from '../components/score/ScorePill'
import { TagBadge } from '../components/TagBadge'
import { ScoreBreakdownCard } from '../components/score/ScoreBreakdownCard'
import { InsightPanel } from '../components/InsightPanel'
import { TensionBadge } from '../components/TensionBadge'
import {
  detectConstraints,
  detectStrengths,
  detectTensions,
} from '../features/scoring/tensions'
import { categoryLabels, horizonLabels, statusLabels } from '../lib/labels'
import { ArrowLeft, Archive, ArchiveRestore, Pencil, Trash2 } from 'lucide-react'
import { SynergyStrengthBadge } from '../components/SynergyStrengthBadge'
import { getLinksForIdea, getPartnerId } from '../features/synergy/synergyUtils'
import { ideaExists } from '../features/portfolio/portfolioUtils'
import { IdeaMarketResearchPanel } from '../features/ideas/IdeaMarketResearchPanel'
import { IdeaDecisionMatrixPanel } from '../features/ideas/IdeaDecisionMatrixPanel'
import { IdeaRefinementPanel } from '../features/ideas/IdeaRefinementPanel'
import { IdeaExtrapolationPanel } from '../features/ideas/IdeaExtrapolationPanel'
import { StrategicFitCard } from '../features/ideas/StrategicFitCard'
import { IdeaBusinessModelCanvasPanel } from '../features/ideas/IdeaBusinessModelCanvasPanel'
import { IdeaBrainstormPanel } from '../features/ideas/IdeaBrainstormPanel'
import { ProseText } from '../components/ProseText'

function MemoSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="p-6">
      <div className="text-micro text-tertiary/60">{title}</div>
      <div className="mt-3 text-sm leading-relaxed text-tertiary/80">{children}</div>
    </Card>
  )
}

export function IdeaDetailPage() {
  const navigate = useNavigate()
  const { ideaId } = useParams()
  const idea = useAppStore((s) => s.data?.ideas.find((i) => i.id === ideaId) ?? null)
  const updateIdea = useAppStore((s) => s.updateIdea)
  const deleteIdea = useAppStore((s) => s.deleteIdea)
  const decisionNotes = useAppStore((s) => s.data?.decisionNotes ?? EMPTY_DECISION_NOTES)
  const notes = useMemo(
    () => decisionNotes.filter((n) => n.ideaId === ideaId),
    [decisionNotes, ideaId]
  )
  const synergyLinksSource = useAppStore((s) => s.data?.synergyLinks ?? EMPTY_SYNERGY_LINKS)
  const synergyLinks = useMemo(
    () => (ideaId ? getLinksForIdea(synergyLinksSource, ideaId) : EMPTY_SYNERGY_LINKS),
    [synergyLinksSource, ideaId]
  )
  const umbrella = useAppStore((s) =>
    s.data?.umbrellaGroups.find((g) => g.ideaIds.includes(ideaId ?? '')) ?? null
  )
  const allIdeas = useAppStore((s) => s.data?.ideas ?? EMPTY_IDEAS)
  const score = useIdeaScore(ideaId ?? '')

  if (!idea) {
    return (
      <Card className="p-6">
        <div className="text-micro text-tertiary/60">Introuvable</div>
        <div className="mt-2 text-lg font-bold tracking-tight text-midnight">Idée introuvable</div>
        <Link to="/app/ideas" className="mt-4 inline-block text-sm text-tertiary/75 hover:text-midnight">
          ← Retour à la carte
        </Link>
      </Card>
    )
  }

  const tensions = detectTensions(idea)
  const strengths = detectStrengths(idea)
  const constraints = detectConstraints(idea)
  const isArchived = idea.status === 'archive'
  const id = idea.id

  function handleArchive() {
    if (
      !confirm(
        'Archiver cette idée ? Elle quittera le board actif mais restera accessible dans Archive — utile si une future idée s’y rattache.'
      )
    ) {
      return
    }
    updateIdea(id, { status: 'archive' })
  }

  function handleRestore() {
    updateIdea(id, { status: 'inbox' })
  }

  function handleDelete() {
    if (
      !confirm(
        'Supprimer définitivement cette idée ? Toutes ses données, synergies et notes seront effacées. Action irréversible.'
      )
    ) {
      return
    }
    deleteIdea(id)
    navigate('/app/ideas')
  }

  return (
    <div className="space-y-6">
      <Link
        to="/app/ideas"
        className="inline-flex items-center gap-1.5 text-xs text-tertiary/65 hover:text-midnight"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour à la carte
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 max-w-2xl flex-1">
          <div className="text-micro text-tertiary/60">Mémo stratégique</div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-midnight">{idea.title}</h1>
          {idea.subtitle ? (
            <p className="mt-1 text-sm font-medium text-tertiary/75">{idea.subtitle}</p>
          ) : null}
          {idea.oneLiner ? (
            <p className="mt-3 text-sm leading-relaxed text-tertiary/75">
              <ProseText>{idea.oneLiner}</ProseText>
            </p>
          ) : null}
          {idea.parentIdeaId && ideaExists(allIdeas, idea.parentIdeaId) ? (
            <p className="mt-2 text-xs text-tertiary/60">
              Extension de{' '}
              <Link
                to={`/app/ideas/${idea.parentIdeaId}`}
                className="font-medium text-midnight underline-offset-2 hover:underline"
              >
                {allIdeas.find((i) => i.id === idea.parentIdeaId)?.title ?? 'idée parente'}
              </Link>
              {idea.extensionNote ? ` — ${idea.extensionNote}` : ''}
            </p>
          ) : idea.parentIdeaId ? (
            <p className="mt-2 text-xs text-tertiary/60">
              Extension d&apos;une idée parente (lien indisponible)
              {idea.extensionNote ? ` — ${idea.extensionNote}` : ''}
            </p>
          ) : null}
        </div>
        <Card className="w-full shrink-0 p-4 sm:max-w-[14rem]">
          <div className="text-micro text-tertiary/60">Score pondéré</div>
          <div className="mt-2 flex justify-end">
            <ScorePill score={score?.weightedScore ?? 0} />
          </div>
          <Link to={`/app/ideas/${idea.id}/edit`} className="mt-4 block">
            <Button variant="ghost" className="w-full justify-center gap-2">
              <Pencil className="h-3.5 w-3.5" />
              Modifier l&apos;idée
            </Button>
          </Link>
          <div className="mt-3 space-y-2 border-t border-alternate/50 pt-3">
            {isArchived ? (
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-center gap-2"
                onClick={handleRestore}
              >
                <ArchiveRestore className="h-3.5 w-3.5" />
                Restaurer
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-center gap-2"
                onClick={handleArchive}
              >
                <Archive className="h-3.5 w-3.5" />
                Archiver
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-center gap-2 text-red-700 hover:bg-red-50 hover:text-red-800"
              onClick={handleDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Supprimer
            </Button>
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        {idea.tagIds.map((t) => (
          <TagBadge key={t} tagId={t} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-[--radius-sharp] border border-alternate/60 bg-background px-3 py-2">
          <div className="text-micro text-tertiary/55">Statut</div>
          <div className="mt-1 text-sm font-semibold text-midnight">{statusLabels[idea.status]}</div>
        </div>
        <div className="rounded-[--radius-sharp] border border-alternate/60 bg-background px-3 py-2">
          <div className="text-micro text-tertiary/55">Catégorie</div>
          <div className="mt-1 text-sm font-semibold text-midnight">{categoryLabels[idea.category]}</div>
        </div>
        <div className="rounded-[--radius-sharp] border border-alternate/60 bg-background px-3 py-2">
          <div className="text-micro text-tertiary/55">Horizon</div>
          <div className="mt-1 text-sm font-semibold text-midnight">{horizonLabels[idea.horizon]}</div>
        </div>
        <div className="rounded-[--radius-sharp] border border-alternate/60 bg-background px-3 py-2">
          <div className="text-micro text-tertiary/55">Cible</div>
          <div className="mt-1 truncate text-sm font-semibold text-midnight">
            {idea.audience || '—'}
          </div>
        </div>
      </div>

      {idea.aiAnalysis ? (
        <Card className="border-primary/20 bg-primary/5 p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="text-micro text-tertiary/60">Analyse Steven</div>
            {idea.scoreSource === 'ai' ? (
              <span className="text-micro text-primary/80">Scores AI</span>
            ) : null}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-tertiary/85">
            <ProseText>{idea.aiAnalysis.brief}</ProseText>
          </p>
          <div className="mt-4">
            <div className="text-micro text-tertiary/55">Fit fondateur</div>
            <p className="mt-1 text-sm text-tertiary/80">
              <ProseText>{idea.aiAnalysis.founderFitNote}</ProseText>
            </p>
          </div>
        </Card>
      ) : null}

      <IdeaMarketResearchPanel idea={idea} />

      <IdeaDecisionMatrixPanel idea={idea} />

      <IdeaRefinementPanel idea={idea} />

      <IdeaExtrapolationPanel idea={idea} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="text-micro text-tertiary/60">Brief stratégique</div>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-tertiary/80">
            <div>
              <div className="text-micro text-tertiary/50">Vue d&apos;ensemble</div>
              <p className="mt-1">
                <ProseText fallback="—">{idea.description}</ProseText>
              </p>
            </div>
            <div>
              <div className="text-micro text-tertiary/50">Pourquoi maintenant</div>
              <p className="mt-1">
                <ProseText fallback="—">{idea.whyNow}</ProseText>
              </p>
            </div>
            <div>
              <div className="text-micro text-tertiary/50">Pour qui</div>
              <p className="mt-1">
                <ProseText fallback="—">{idea.audience}</ProseText>
              </p>
            </div>
            <div>
              <div className="text-micro text-tertiary/50">Modèle de revenu</div>
              <p className="mt-1">
                <ProseText fallback="—">{idea.strategicNotes}</ProseText>
              </p>
            </div>
            <div>
              <div className="text-micro text-tertiary/50">Note personnelle</div>
              <p className="mt-1">
                <ProseText fallback="—">{idea.oneLiner}</ProseText>
              </p>
            </div>
          </div>
        </Card>
        <StrategicFitCard idea={idea} />
      </div>

      <IdeaBusinessModelCanvasPanel idea={idea} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InsightPanel title="Atouts stratégiques" items={strengths} variant="strength" />
        <InsightPanel
          title="Contraintes"
          items={constraints}
          emptyLabel="Aucune contrainte majeure signalée"
          variant="constraint"
        />
      </div>

      {tensions.length > 0 ? (
        <Card className="p-6">
          <div className="text-micro text-tertiary/60">Tensions clés</div>
          <p className="mt-2 text-xs text-tertiary/65">
            Signaux où Excitement, fit ou potentiel peuvent tirer dans des directions différentes.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {tensions.map((t) => (
              <TensionBadge key={t.id} label={t.label} severity={t.severity} />
            ))}
          </div>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <MemoSection title="Premier test">
          <ProseText fallback="—">{idea.firstTest}</ProseText>
        </MemoSection>
        <MemoSection title="Prochaine étape">
          <ProseText fallback="—">{idea.nextStep}</ProseText>
        </MemoSection>
        <MemoSection title="Risques">
          <ProseText fallback="—">{idea.risks}</ProseText>
        </MemoSection>
      </div>

      {umbrella ? (
        <Card className="p-5">
          <div className="text-micro text-tertiary/60">Umbrella fit</div>
          <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
            <Link to="/app/umbrellas" className="text-sm font-semibold text-midnight hover:text-tertiary">
              {umbrella.name}
            </Link>
            {umbrella.cohesionScore != null ? (
              <span className="text-xs text-tertiary/65">
                Cohésion du groupe {umbrella.cohesionScore}/10
              </span>
            ) : null}
          </div>
          {umbrella.promise ? (
            <p className="mt-2 text-xs leading-relaxed text-tertiary/70">{umbrella.promise}</p>
          ) : null}
          <div className="mt-2 text-xs text-tertiary/60">
            Umbrella fit score : <span className="font-semibold">{idea.umbrellaFit}/10</span>
          </div>
        </Card>
      ) : null}

      {synergyLinks.length > 0 ? (
        <Card className="p-6">
          <div className="flex items-baseline justify-between gap-2">
            <div className="text-micro text-tertiary/60">Synergies</div>
            <Link to="/app/synergy" className="text-micro text-tertiary/60 hover:text-tertiary">
              Voir la carte →
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {synergyLinks.map((link) => {
              const partnerId = getPartnerId(link, idea.id)
              const partner = allIdeas.find((i) => i.id === partnerId)
              const row = (
                <>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-midnight">{partner?.title ?? partnerId}</div>
                    {link.notes ? (
                      <p className="mt-1 line-clamp-2 text-xs text-tertiary/65">
                        <ProseText>{link.notes}</ProseText>
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-xs font-bold tabular-nums">{link.totalSynergyScore}</span>
                    <SynergyStrengthBadge strength={link.synergyStrength} />
                  </div>
                </>
              )
              return partner ? (
                <Link
                  key={link.id}
                  to={`/app/ideas/${partnerId}`}
                  className="flex items-start justify-between gap-3 rounded-[--radius-card] border border-alternate/60 bg-mineral px-4 py-3 transition hover:border-alternate hover:bg-background"
                >
                  {row}
                </Link>
              ) : (
                <div
                  key={link.id}
                  className="flex items-start justify-between gap-3 rounded-[--radius-card] border border-alternate/60 bg-mineral px-4 py-3 opacity-70"
                >
                  {row}
                </div>
              )
            })}
          </div>
        </Card>
      ) : null}

      {score ? <ScoreBreakdownCard ideaId={idea.id} breakdown={score} /> : null}

      <Card className="p-6">
        <div className="text-micro text-tertiary/60">Notes de décision</div>
        <div className="mt-4 space-y-3">
          {notes.length ? (
            notes.map((n) => (
              <div
                key={n.id}
                className="rounded-[--radius-card] border border-alternate/60 bg-mineral p-4"
              >
                <div className="text-micro text-primary/80">{n.decisionType}</div>
                <div className="mt-2 text-sm leading-relaxed text-tertiary/80">
                  <ProseText>{n.note}</ProseText>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-tertiary/60">Aucune note de décision pour l&apos;instant.</div>
          )}
        </div>
      </Card>

      <IdeaBrainstormPanel idea={idea} />
    </div>
  )
}
