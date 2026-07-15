import * as React from 'react'
import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { SectionHeader } from '../components/SectionHeader'
import { Button } from '../components/ui/Button'
import { useAppStore, EMPTY_IDEAS, EMPTY_SYNERGY_LINKS } from '../app/store'
import {
  filterLinksByStrength,
  filterLinksForIdea,
  getIsolatedIdeas,
  getMostConnectedIdeas,
  sortLinksByScore,
  strengthLabels,
} from '../features/synergy/synergyUtils'
import type { SynergyStrength } from '../types/domain'
import { SynergySuggestPanel } from '../features/synergy/SynergySuggestPanel'
import { AddSynergyForm } from '../features/synergy/AddSynergyForm'
import { SynergyLinkCard } from '../features/synergy/SynergyLinkCard'
import { EmptyState } from '../components/EmptyState'
import { IdeaPortfolioGraph } from '../features/ideas/IdeaPortfolioGraph'
import { cn } from '../lib/cn'

export function SynergyPage() {
  const ideas = useAppStore((s) => s.data?.ideas ?? EMPTY_IDEAS)
  const links = useAppStore((s) => s.data?.synergyLinks ?? EMPTY_SYNERGY_LINKS)
  const deleteSynergyLink = useAppStore((s) => s.deleteSynergyLink)
  const updateSynergyLink = useAppStore((s) => s.updateSynergyLink)
  const [strengthFilter, setStrengthFilter] = React.useState<SynergyStrength | 'all'>('all')
  const [view, setView] = React.useState<'graph' | 'list'>('graph')
  const [focusIdeaId, setFocusIdeaId] = React.useState<string | null>(null)
  const [prefillSourceId, setPrefillSourceId] = React.useState<string | undefined>()

  const activeIdeas = React.useMemo(
    () => ideas.filter((i) => i.status !== 'archive'),
    [ideas]
  )

  const ideaTitle = (id: string) => ideas.find((i) => i.id === id)?.title ?? id
  const filtered = sortLinksByScore(
    filterLinksForIdea(filterLinksByStrength(links, strengthFilter), focusIdeaId)
  )
  const mostConnected = getMostConnectedIdeas(activeIdeas, links, 8)
  const isolated = getIsolatedIdeas(activeIdeas, links)
  const connectedIdeaCount = new Set(
    links.flatMap((l) => [l.sourceIdeaId, l.targetIdeaId])
  ).size

  const startLinkFrom = (ideaId: string) => {
    setFocusIdeaId(ideaId)
    setPrefillSourceId(ideaId)
    setView('list')
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Relations"
        title="Synergy map"
        description="Visualise comment tes idées se renforcent — repère les hubs, les angles morts et les ponts à creuser."
        action={
          <div className="flex flex-wrap gap-2">
            <Link to="/app/portfolio/analysis">
              <Button type="button" variant="ghost">
                <Sparkles className="h-4 w-4" />
                Analyse Steven
              </Button>
            </Link>
            <div className="flex rounded-[--radius-sharp] border border-alternate/60 p-0.5">
              {(
                [
                  { id: 'graph' as const, label: 'Carte' },
                  { id: 'list' as const, label: 'Liste' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setView(opt.id)}
                  className={cn(
                    'rounded-[--radius-sharp] px-3 py-1.5 text-xs font-medium transition',
                    view === opt.id
                      ? 'bg-primary/20 text-midnight'
                      : 'text-tertiary/65 hover:text-midnight'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-4">
          <div className="text-2xl font-black text-midnight">{links.length}</div>
          <div className="text-xs text-tertiary/65">Liens Synergy</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-black text-midnight">{connectedIdeaCount}</div>
          <div className="text-xs text-tertiary/65">Idées connectées</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-black text-midnight">{isolated.length}</div>
          <div className="text-xs text-tertiary/65">Sans lien</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-black text-midnight">
            {mostConnected[0]?.count ?? 0}
          </div>
          <div className="text-xs text-tertiary/65">Max connexions</div>
        </Card>
      </div>

      <SynergySuggestPanel />

      <AddSynergyForm
        key={prefillSourceId ?? 'default'}
        defaultSourceId={prefillSourceId}
        defaultOpen={Boolean(prefillSourceId)}
        onClose={() => setPrefillSourceId(undefined)}
      />

      {activeIdeas.length < 2 && links.length === 0 ? (
        <EmptyState
          title="Au moins deux idées requises"
          description="Capture quelques idées d'abord, puis relie celles qui se renforcent mutuellement."
          actionLabel="Carte des idées"
          actionTo="/app/ideas"
        />
      ) : null}

      {view === 'graph' ? (
        <IdeaPortfolioGraph
          ideas={activeIdeas}
          mode="synergy"
          showEdgeFilters={false}
          focusIdeaId={focusIdeaId}
          onSelectIdeaId={setFocusIdeaId}
          graphHeight="min(65vh, 560px)"
        />
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {(['all', 'strong', 'medium', 'weak', 'conflict'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStrengthFilter(s)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium capitalize transition',
              strengthFilter === s
                ? 'border-primary/40 bg-primary/10 text-midnight'
                : 'border-alternate/60 bg-background text-tertiary/70 hover:border-alternate'
            )}
          >
            {s === 'all' ? 'Tous' : strengthLabels[s]}
          </button>
        ))}
        {focusIdeaId ? (
          <button
            type="button"
            onClick={() => setFocusIdeaId(null)}
            className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-midnight"
          >
            Filtre : {ideaTitle(focusIdeaId)} ×
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <Card className="p-5">
            <div className="text-micro text-tertiary/60">Hubs du portfolio</div>
            <p className="mt-1 text-xs text-tertiary/55">Idées les plus connectées — pivots potentiels.</p>
            <div className="mt-4 space-y-1">
              {mostConnected.length ? (
                mostConnected.map(({ idea, count }) => (
                  <button
                    key={idea.id}
                    type="button"
                    onClick={() => setFocusIdeaId(idea.id)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-[--radius-sharp] px-2 py-1.5 text-left transition hover:bg-mineral',
                      focusIdeaId === idea.id && 'bg-primary/10'
                    )}
                  >
                    <span className="truncate text-sm font-medium text-midnight">{idea.title}</span>
                    <span className="text-xs tabular-nums text-tertiary/60">{count}</span>
                  </button>
                ))
              ) : (
                <p className="text-xs text-tertiary/55">Aucun lien encore.</p>
              )}
            </div>
          </Card>

          {isolated.length > 0 ? (
            <Card className="border-primary/20 bg-primary/5 p-5">
              <div className="text-micro text-primary/80">Angles morts</div>
              <p className="mt-1 text-xs text-tertiary/65">
                Idées sans Synergy — opportunités de pont ou de recentrage.
              </p>
              <div className="mt-4 space-y-2">
                {isolated.slice(0, 6).map((idea) => (
                  <div
                    key={idea.id}
                    className="flex items-center justify-between gap-2 rounded-[--radius-sharp] bg-background/80 px-2 py-1.5"
                  >
                    <Link
                      to={`/app/ideas/${idea.id}`}
                      className="truncate text-sm text-midnight hover:underline"
                    >
                      {idea.title}
                    </Link>
                    <button
                      type="button"
                      onClick={() => startLinkFrom(idea.id)}
                      className="shrink-0 text-micro font-medium text-primary hover:underline"
                    >
                      Relier
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}
        </div>

        <Card className="p-5 lg:col-span-2">
          <div className="flex items-baseline justify-between gap-2">
            <div className="text-micro text-tertiary/60">Liens Synergy</div>
            <span className="text-micro text-tertiary/50">{filtered.length} affiché(s)</span>
          </div>
          <div className="mt-4 space-y-3">
            {filtered.map((link) => (
              <SynergyLinkCard
                key={link.id}
                link={link}
                ideaTitle={ideaTitle}
                ideas={ideas}
                onDelete={deleteSynergyLink}
                onUpdate={updateSynergyLink}
              />
            ))}
            {filtered.length === 0 ? (
              <div className="rounded-[--radius-sharp] border border-dashed border-alternate/60 px-4 py-8 text-center text-sm text-tertiary/55">
                {links.length === 0
                  ? 'Crée ton premier lien — ou lance une analyse globale pour des suggestions Steven.'
                  : 'Aucun lien pour ce filtre.'}
              </div>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  )
}
