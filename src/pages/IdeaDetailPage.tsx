import { Link, useParams } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useActiveProfile, useAppStore, useIdeaScore, EMPTY_DECISION_NOTES, EMPTY_IDEAS, EMPTY_SYNERGY_LINKS } from '../app/store'
import { ScorePill } from '../components/score/ScorePill'
import { TagBadge } from '../components/TagBadge'
import { MetricRow } from '../components/MetricRow'
import { ScoreBreakdownCard } from '../components/score/ScoreBreakdownCard'
import { InsightPanel } from '../components/InsightPanel'
import { TensionBadge } from '../components/TensionBadge'
import {
  detectConstraints,
  detectStrengths,
  detectTensions,
} from '../features/scoring/tensions'
import { categoryLabels, horizonLabels, statusLabels } from '../lib/labels'
import { ArrowLeft, Pencil } from 'lucide-react'
import { SynergyStrengthBadge } from '../components/SynergyStrengthBadge'
import { getLinksForIdea, getPartnerId } from '../features/synergy/synergyUtils'
import { InspirationList } from '../features/ideas/InspirationEditor'
import { IdeaMarketResearchPanel } from '../features/ideas/IdeaMarketResearchPanel'

function MemoSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="p-6">
      <div className="text-micro text-tertiary/60">{title}</div>
      <div className="mt-3 text-sm leading-relaxed text-tertiary/80">{children}</div>
    </Card>
  )
}

export function IdeaDetailPage() {
  const { ideaId } = useParams()
  const idea = useAppStore((s) => s.data?.ideas.find((i) => i.id === ideaId) ?? null)
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
  const profile = useActiveProfile()
  const score = useIdeaScore(ideaId ?? '')

  if (!idea) {
    return (
      <Card className="p-6">
        <div className="text-micro text-tertiary/60">Not found</div>
        <div className="mt-2 text-lg font-bold tracking-tight text-midnight">Idea not found</div>
        <Link to="/app/ideas" className="mt-4 inline-block text-sm text-tertiary/75 hover:text-midnight">
          ← Back to board
        </Link>
      </Card>
    )
  }

  const tensions = detectTensions(idea)
  const strengths = detectStrengths(idea)
  const constraints = detectConstraints(idea)

  return (
    <div className="space-y-6">
      <Link
        to="/app/ideas"
        className="inline-flex items-center gap-1.5 text-xs text-tertiary/65 hover:text-midnight"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to board
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <div className="text-micro text-tertiary/60">Strategic memo</div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-midnight">{idea.title}</h1>
          {idea.subtitle ? (
            <p className="mt-1 text-sm font-medium text-tertiary/75">{idea.subtitle}</p>
          ) : null}
          {idea.oneLiner ? (
            <p className="mt-3 text-sm leading-relaxed text-tertiary/75">{idea.oneLiner}</p>
          ) : null}
          {idea.parentIdeaId ? (
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
          ) : null}
        </div>
        <Card className="p-4">
          <div className="text-micro text-tertiary/60">Weighted score</div>
          <div className="mt-2 flex justify-end">
            <ScorePill score={score?.weightedScore ?? 0} />
          </div>
          <div className="mt-2 text-right text-xs text-tertiary/60">
            Lens: <span className="text-tertiary/80">{profile?.name ?? '—'}</span>
          </div>
          <Link to={`/app/ideas/${idea.id}/edit`} className="mt-4 block">
            <Button variant="ghost" className="w-full justify-center gap-2">
              <Pencil className="h-3.5 w-3.5" />
              Edit idea
            </Button>
          </Link>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        {idea.tagIds.map((t) => (
          <TagBadge key={t} tagId={t} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-[--radius-sharp] border border-alternate/60 bg-background px-3 py-2">
          <div className="text-micro text-tertiary/55">Status</div>
          <div className="mt-1 text-sm font-semibold text-midnight">{statusLabels[idea.status]}</div>
        </div>
        <div className="rounded-[--radius-sharp] border border-alternate/60 bg-background px-3 py-2">
          <div className="text-micro text-tertiary/55">Category</div>
          <div className="mt-1 text-sm font-semibold text-midnight">{categoryLabels[idea.category]}</div>
        </div>
        <div className="rounded-[--radius-sharp] border border-alternate/60 bg-background px-3 py-2">
          <div className="text-micro text-tertiary/55">Horizon</div>
          <div className="mt-1 text-sm font-semibold text-midnight">{horizonLabels[idea.horizon]}</div>
        </div>
        <div className="rounded-[--radius-sharp] border border-alternate/60 bg-background px-3 py-2">
          <div className="text-micro text-tertiary/55">Audience</div>
          <div className="mt-1 truncate text-sm font-semibold text-midnight">
            {idea.audience || '—'}
          </div>
        </div>
      </div>

      {(idea.inspirations?.length ?? 0) > 0 ? (
        <Card className="p-6">
          <div className="text-micro text-tertiary/60">What inspired this</div>
          <p className="mt-1 text-xs text-tertiary/60">
            Decks, sites, conversations, and notes that sparked the idea.
          </p>
          <div className="mt-4">
            <InspirationList items={idea.inspirations ?? []} />
          </div>
        </Card>
      ) : null}

      {idea.aiAnalysis ? (
        <Card className="border-primary/20 bg-primary/5 p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="text-micro text-tertiary/60">Analyse Steven</div>
            {idea.scoreSource === 'ai' ? (
              <span className="text-micro text-primary/80">Scores AI</span>
            ) : null}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-tertiary/85">{idea.aiAnalysis.brief}</p>
          <div className="mt-4">
            <div className="text-micro text-tertiary/55">Fit fondateur</div>
            <p className="mt-1 text-sm text-tertiary/80">{idea.aiAnalysis.founderFitNote}</p>
          </div>
        </Card>
      ) : null}

      <IdeaMarketResearchPanel idea={idea} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="text-micro text-tertiary/60">Strategic brief</div>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-tertiary/80">
            <div>
              <div className="text-micro text-tertiary/50">Overview</div>
              <p className="mt-1">{idea.description || '—'}</p>
            </div>
            <div>
              <div className="text-micro text-tertiary/50">Why now</div>
              <p className="mt-1">{idea.whyNow || '—'}</p>
            </div>
            <div>
              <div className="text-micro text-tertiary/50">Who for</div>
              <p className="mt-1">{idea.audience || '—'}</p>
            </div>
            <div>
              <div className="text-micro text-tertiary/50">Revenue model</div>
              <p className="mt-1">{idea.strategicNotes || '—'}</p>
            </div>
            <div>
              <div className="text-micro text-tertiary/50">Personal note</div>
              <p className="mt-1">{idea.oneLiner || '—'}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-micro text-tertiary/60">Strategic fit</div>
          <div className="mt-4 space-y-3">
            <MetricRow label="Personal alignment" value={idea.personalAlignment} suffix="/10" highlight />
            <MetricRow label="Freedom" value={idea.freedomFit} suffix="/10" />
            <MetricRow label="Remote fit" value={idea.remoteFit} suffix="/10" />
            <MetricRow label="Scalability" value={idea.scalabilityFit} suffix="/10" />
            <MetricRow label="Validation speed" value={idea.speedToValidation} suffix="/10" />
            <MetricRow label="Revenue potential" value={idea.revenuePotential} suffix="/10" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InsightPanel title="Strategic strengths" items={strengths} />
        <InsightPanel title="Constraints" items={constraints} emptyLabel="No major constraints flagged" />
      </div>

      {tensions.length > 0 ? (
        <Card className="p-6">
          <div className="text-micro text-tertiary/60">Key tensions</div>
          <p className="mt-2 text-xs text-tertiary/65">
            Signals where excitement, fit, or upside may pull in different directions.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {tensions.map((t) => (
              <TensionBadge key={t.id} label={t.label} severity={t.severity} />
            ))}
          </div>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <MemoSection title="First test">
          {idea.firstTest ? idea.firstTest : <span className="text-tertiary/55">—</span>}
        </MemoSection>
        <MemoSection title="Next step">
          {idea.nextStep ? idea.nextStep : <span className="text-tertiary/55">—</span>}
        </MemoSection>
        <MemoSection title="Risks">
          {idea.risks ? idea.risks : <span className="text-tertiary/55">—</span>}
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
                Group cohesion {umbrella.cohesionScore}/10
              </span>
            ) : null}
          </div>
          {umbrella.promise ? (
            <p className="mt-2 text-xs leading-relaxed text-tertiary/70">{umbrella.promise}</p>
          ) : null}
          <div className="mt-2 text-xs text-tertiary/60">
            Umbrella fit score: <span className="font-semibold">{idea.umbrellaFit}/10</span>
          </div>
        </Card>
      ) : null}

      {synergyLinks.length > 0 ? (
        <Card className="p-6">
          <div className="flex items-baseline justify-between gap-2">
            <div className="text-micro text-tertiary/60">Synergies</div>
            <Link to="/app/synergy" className="text-micro text-tertiary/60 hover:text-tertiary">
              View map →
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {synergyLinks.map((link) => {
              const partnerId = getPartnerId(link, idea.id)
              const partner = allIdeas.find((i) => i.id === partnerId)
              return (
                <Link
                  key={link.id}
                  to={`/app/ideas/${partnerId}`}
                  className="flex items-start justify-between gap-3 rounded-[--radius-card] border border-alternate/60 bg-mineral px-4 py-3 transition hover:border-alternate hover:bg-background"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-midnight">{partner?.title ?? partnerId}</div>
                    {link.notes ? (
                      <p className="mt-1 line-clamp-2 text-xs text-tertiary/65">{link.notes}</p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-xs font-bold tabular-nums">{link.totalSynergyScore}</span>
                    <SynergyStrengthBadge strength={link.synergyStrength} />
                  </div>
                </Link>
              )
            })}
          </div>
        </Card>
      ) : null}

      {score ? <ScoreBreakdownCard breakdown={score} /> : null}

      <Card className="p-6">
        <div className="text-micro text-tertiary/60">Decision notes</div>
        <div className="mt-4 space-y-3">
          {notes.length ? (
            notes.map((n) => (
              <div
                key={n.id}
                className="rounded-[--radius-card] border border-alternate/60 bg-mineral p-4"
              >
                <div className="text-micro text-primary/80">{n.decisionType}</div>
                <div className="mt-2 text-sm leading-relaxed text-tertiary/80">{n.note}</div>
              </div>
            ))
          ) : (
            <div className="text-sm text-tertiary/60">No decision notes yet.</div>
          )}
        </div>
      </Card>
    </div>
  )
}
