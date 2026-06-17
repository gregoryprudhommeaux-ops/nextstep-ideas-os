import { Link } from 'react-router-dom'
import { useActiveProfile, useAppStore, useRankedIdeas } from '../../app/store'
import { IdeaCard } from './IdeaCard'
import { SectionHeader } from '../../components/SectionHeader'
import { EmptyState } from '../../components/EmptyState'
import { Button } from '../../components/ui/Button'
import type { Idea, IdeaCategory, IdeaStatus, ScoringProfile } from '../../types/domain'
import { statusLabels } from '../../lib/labels'
import { cn } from '../../lib/cn'
import type { BoardSort } from '../../app/store'
import { calculateWeightedScore } from '../scoring/scoring'

const columns: { status: IdeaStatus; label: string }[] = [
  { status: 'inbox', label: 'Inbox' },
  { status: 'explore', label: 'Explore' },
  { status: 'validate', label: 'Validate' },
  { status: 'build', label: 'Build' },
  { status: 'archive', label: 'Archive' },
]

function sortIdeas(ideas: Idea[], sort: BoardSort, profile: ScoringProfile | null) {
  const copy = [...ideas]
  switch (sort) {
    case 'alignment':
      return copy.sort((a, b) => b.personalAlignment - a.personalAlignment)
    case 'validationSpeed':
      return copy.sort((a, b) => b.speedToValidation - a.speedToValidation)
    case 'complexity':
      return copy.sort((a, b) => a.complexityLevel - b.complexityLevel)
    case 'profileScore':
    default:
      if (!profile) return copy
      return copy.sort(
        (a, b) => calculateWeightedScore(b, profile) - calculateWeightedScore(a, profile)
      )
  }
}

export function IdeasBoardPage() {
  const profile = useActiveProfile()
  const ideas = useRankedIdeas()
  const search = useAppStore((s) => s.search)
  const statusFilter = useAppStore((s) => s.statusFilter)
  const categoryFilter = useAppStore((s) => s.categoryFilter)
  const boardSort = useAppStore((s) => s.boardSort)
  const boardDensity = useAppStore((s) => s.boardDensity)
  const setSearch = useAppStore((s) => s.setSearch)
  const setStatusFilter = useAppStore((s) => s.setStatusFilter)
  const setCategoryFilter = useAppStore((s) => s.setCategoryFilter)
  const setBoardSort = useAppStore((s) => s.setBoardSort)
  const setBoardDensity = useAppStore((s) => s.setBoardDensity)

  const filtered = ideas.filter((i) => {
    if (statusFilter !== 'all' && i.status !== statusFilter) return false
    if (categoryFilter !== 'all' && i.category !== categoryFilter) return false
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      return (
        i.title.toLowerCase().includes(q) ||
        (i.oneLiner ?? '').toLowerCase().includes(q) ||
        (i.subtitle ?? '').toLowerCase().includes(q)
      )
    }
    return true
  })

  const hasFilters = search.trim() || statusFilter !== 'all' || categoryFilter !== 'all'
  const noResults = filtered.length === 0

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Portfolio"
        title="Ideas board"
        description="A strategic portfolio view — ranked by your active scoring lens."
        action={
          <Link to="/app/ideas/new">
            <Button>+ New idea</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search ideas…"
          className="h-10 w-full rounded-[--radius-sharp] border border-alternate/70 bg-background px-3 text-sm text-midnight outline-none focus:ring-2 focus:ring-primary/40 lg:col-span-2"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as Idea['status'] | 'all')}
          className="h-10 w-full rounded-[--radius-sharp] border border-alternate/70 bg-background px-3 text-sm text-midnight outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="all">All statuses</option>
          {columns.map((c) => (
            <option key={c.status} value={c.status}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as IdeaCategory | 'all')}
          className="h-10 w-full rounded-[--radius-sharp] border border-alternate/70 bg-background px-3 text-sm text-midnight outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="all">All categories</option>
          <option value="service">Service</option>
          <option value="productizedService">Productized service</option>
          <option value="saasAi">SaaS / AI</option>
          <option value="communityPlatform">Community</option>
          <option value="hospitality">Hospitality</option>
          <option value="mediaBrand">Media brand</option>
          <option value="consulting">Consulting</option>
          <option value="marketplace">Marketplace</option>
          <option value="digitalAsset">Digital asset</option>
          <option value="localPhysical">Local physical</option>
        </select>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-micro text-tertiary/55">Sort</span>
          <select
            value={boardSort}
            onChange={(e) => setBoardSort(e.target.value as BoardSort)}
            className="h-9 rounded-[--radius-sharp] border border-alternate/70 bg-background px-3 text-xs text-midnight outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="profileScore">Profile score</option>
            <option value="alignment">Personal alignment</option>
            <option value="validationSpeed">Validation speed</option>
            <option value="complexity">Low complexity</option>
          </select>
        </div>
        <div className="flex items-center gap-1 rounded-[--radius-sharp] border border-alternate/70 bg-background p-0.5">
          <button
            type="button"
            onClick={() => setBoardDensity('comfortable')}
            className={cn(
              'rounded-[--radius-sharp] px-3 py-1.5 text-xs font-medium transition',
              boardDensity === 'comfortable' ? 'bg-mineral text-midnight' : 'text-tertiary/65'
            )}
          >
            Comfortable
          </button>
          <button
            type="button"
            onClick={() => setBoardDensity('compact')}
            className={cn(
              'rounded-[--radius-sharp] px-3 py-1.5 text-xs font-medium transition',
              boardDensity === 'compact' ? 'bg-mineral text-midnight' : 'text-tertiary/65'
            )}
          >
            Compact
          </button>
        </div>
      </div>

      {noResults ? (
        <EmptyState
          title={hasFilters ? 'No ideas match your filters' : 'Your portfolio is empty'}
          description={
            hasFilters
              ? 'Try clearing search or filters.'
              : 'Start with one idea — capture the title, then enrich the brief step by step.'
          }
          actionLabel={hasFilters ? undefined : 'Capture my first idea'}
          actionTo={hasFilters ? undefined : '/app/ideas/new'}
        />
      ) : (
        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0 lg:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {columns.map((c) => {
            const list = sortIdeas(
              filtered.filter((i) => i.status === c.status),
              boardSort,
              profile
            )
            return (
              <div key={c.status} className="min-w-[min(100%,17.5rem)] shrink-0 lg:min-w-0">
                <div className="mb-3 flex items-baseline justify-between border-b border-alternate/50 pb-2">
                  <div className="text-micro font-semibold text-tertiary/70">{c.label}</div>
                  <div className="text-xs font-semibold tabular-nums text-tertiary/55">{list.length}</div>
                </div>
                <div className="space-y-2.5">
                  {list.map((idea) => (
                    <Link key={idea.id} to={`/app/ideas/${idea.id}`} className="block">
                      <IdeaCard idea={idea} />
                    </Link>
                  ))}
                  {list.length === 0 ? (
                    <div className="text-xs text-tertiary/45">{statusLabels[c.status]} empty</div>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
