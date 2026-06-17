import * as React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { SectionHeader } from '../components/SectionHeader'
import { SynergyStrengthBadge } from '../components/SynergyStrengthBadge'
import { useAppStore, EMPTY_IDEAS, EMPTY_SYNERGY_LINKS } from '../app/store'
import {
  filterLinksByStrength,
  getMostConnectedIdeas,
  sortLinksByScore,
} from '../features/synergy/synergyUtils'
import type { SynergyStrength } from '../types/domain'
import { cn } from '../lib/cn'

export function SynergyPage() {
  const ideas = useAppStore((s) => s.data?.ideas ?? EMPTY_IDEAS)
  const links = useAppStore((s) => s.data?.synergyLinks ?? EMPTY_SYNERGY_LINKS)
  const [strengthFilter, setStrengthFilter] = React.useState<SynergyStrength | 'all'>('all')

  const ideaTitle = (id: string) => ideas.find((i) => i.id === id)?.title ?? id
  const filtered = sortLinksByScore(filterLinksByStrength(links, strengthFilter))
  const mostConnected = getMostConnectedIdeas(ideas, links, 6)

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Relationships"
        title="Synergy map"
        description="Strategic connections between ideas — ranked by synergy score, not a messy graph."
      />

      <div className="flex flex-wrap gap-2">
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
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-1">
          <div className="text-micro text-tertiary/60">Most connected</div>
          <div className="mt-4 space-y-3">
            {mostConnected.map(({ idea, count }) => (
              <Link
                key={idea.id}
                to={`/app/ideas/${idea.id}`}
                className="flex items-center justify-between rounded-[--radius-sharp] px-2 py-1.5 transition hover:bg-mineral"
              >
                <span className="truncate text-sm font-medium text-midnight">{idea.title}</span>
                <span className="text-xs tabular-nums text-tertiary/60">{count} links</span>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <div className="text-micro text-tertiary/60">Synergy links</div>
          <div className="mt-4 space-y-3">
            {filtered.map((link) => (
              <div
                key={link.id}
                className="rounded-[--radius-card] border border-alternate/60 bg-background p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/app/ideas/${link.sourceIdeaId}`}
                        className="text-sm font-semibold text-midnight hover:text-tertiary"
                      >
                        {ideaTitle(link.sourceIdeaId)}
                      </Link>
                      <span className="text-tertiary/40">↔</span>
                      <Link
                        to={`/app/ideas/${link.targetIdeaId}`}
                        className="text-sm font-semibold text-midnight hover:text-tertiary"
                      >
                        {ideaTitle(link.targetIdeaId)}
                      </Link>
                    </div>
                    {link.notes ? (
                      <p className="mt-2 text-xs leading-relaxed text-tertiary/70">{link.notes}</p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold tabular-nums text-midnight">
                      {link.totalSynergyScore}
                    </span>
                    <SynergyStrengthBadge strength={link.synergyStrength} />
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 ? (
              <div className="text-sm text-tertiary/55">No links for this filter.</div>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  )
}
