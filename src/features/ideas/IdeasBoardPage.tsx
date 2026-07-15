import { Link } from 'react-router-dom'
import { useRankedIdeas, useAppStore } from '../../app/store'
import { SectionHeader } from '../../components/SectionHeader'
import { EmptyState } from '../../components/EmptyState'
import { Button } from '../../components/ui/Button'
import type { Idea, IdeaCategory } from '../../types/domain'
import { IdeaPortfolioGraph } from './IdeaPortfolioGraph'
import { statusLabels } from '../../lib/labels'

const statusOptions: Idea['status'][] = ['inbox', 'explore', 'validate', 'build', 'archive']

export function IdeasBoardPage() {
  const ideas = useRankedIdeas()
  const search = useAppStore((s) => s.search)
  const statusFilter = useAppStore((s) => s.statusFilter)
  const categoryFilter = useAppStore((s) => s.categoryFilter)
  const setSearch = useAppStore((s) => s.setSearch)
  const setStatusFilter = useAppStore((s) => s.setStatusFilter)
  const setCategoryFilter = useAppStore((s) => s.setCategoryFilter)

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
        title="Carte des idées"
        description="Vue réseau — vois comment tes projets pourraient se connecter, s'étendre ou partager un socle. Pas un pipeline Kanban : un terrain de brainstorm."
        action={
          <div className="flex flex-wrap gap-2">
            <Link to="/app/synergy">
              <Button type="button" variant="ghost">
                Gérer les synergies
              </Button>
            </Link>
            <Link to="/app/ideas/new">
              <Button>+ Nouvelle idée</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher des idées…"
          className="h-10 w-full rounded-[--radius-sharp] border border-alternate/70 bg-background px-3 text-sm text-midnight outline-none focus:ring-2 focus:ring-primary/40 lg:col-span-2"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as Idea['status'] | 'all')}
          className="h-10 w-full rounded-[--radius-sharp] border border-alternate/70 bg-background px-3 text-sm text-midnight outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="all">Tous les statuts</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {statusLabels[status]}
            </option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as IdeaCategory | 'all')}
          className="h-10 w-full rounded-[--radius-sharp] border border-alternate/70 bg-background px-3 text-sm text-midnight outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="all">Toutes les catégories</option>
          <option value="service">Service</option>
          <option value="productizedService">Service productisé</option>
          <option value="saasAi">SaaS / AI</option>
          <option value="communityPlatform">Communauté</option>
          <option value="hospitality">Hospitality</option>
          <option value="mediaBrand">Media brand</option>
          <option value="consulting">Consulting</option>
          <option value="marketplace">Marketplace</option>
          <option value="digitalAsset">Actif digital</option>
          <option value="localPhysical">Local physique</option>
        </select>
      </div>

      {noResults ? (
        <EmptyState
          title={hasFilters ? 'Aucune idée ne correspond aux filtres' : 'Votre Portfolio est vide'}
          description={
            hasFilters
              ? 'Essayez de réinitialiser la recherche ou les filtres.'
              : 'Commencez par une idée — puis reliez-la aux autres via synergies, umbrellas ou explorations Steven.'
          }
          actionLabel={hasFilters ? undefined : 'Capturer ma première idée'}
          actionTo={hasFilters ? undefined : '/app/ideas/new'}
        />
      ) : (
        <IdeaPortfolioGraph ideas={filtered} />
      )}
    </div>
  )
}
