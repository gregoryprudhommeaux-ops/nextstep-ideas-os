import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { SectionHeader } from '../../components/SectionHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { AIBanner } from '../../components/AIBanner'
import {
  useAppStore,
  EMPTY_IDEAS,
  EMPTY_SYNERGY_LINKS,
  EMPTY_UMBRELLA_GROUPS,
  EMPTY_SHARED_BASES,
} from '../../app/store'
import { statusLabels } from '../../lib/labels'
import { groupExtensions, getStandaloneIdeas, ideaTitleById } from './portfolioUtils'
import { usePortfolioScan } from './usePortfolioScan'
import { PortfolioScanPanel } from './PortfolioScanPanel'
import { SynergyStrengthBadge } from '../../components/SynergyStrengthBadge'
import { getPartnerId } from '../synergy/synergyUtils'

function IdeaRow({ idea }: { idea: { id: string; title: string; oneLiner?: string; status: string } }) {
  return (
    <Link
      to={`/app/ideas/${idea.id}`}
      className="block rounded-[--radius-sharp] border border-alternate/50 bg-background px-4 py-3 transition hover:border-alternate hover:bg-mineral"
    >
      <div className="font-medium text-midnight">{idea.title}</div>
      {idea.oneLiner ? (
        <p className="mt-1 line-clamp-2 text-xs text-tertiary/65">{idea.oneLiner}</p>
      ) : null}
      <div className="mt-2 text-micro text-tertiary/50">
        {statusLabels[idea.status as keyof typeof statusLabels] ?? idea.status}
      </div>
    </Link>
  )
}

export function PortfolioPage() {
  const ideas = useAppStore((s) => s.data?.ideas ?? EMPTY_IDEAS)
  const synergyLinks = useAppStore((s) => s.data?.synergyLinks ?? EMPTY_SYNERGY_LINKS)
  const umbrellaGroups = useAppStore((s) => s.data?.umbrellaGroups ?? EMPTY_UMBRELLA_GROUPS)
  const sharedBases = useAppStore((s) => s.data?.sharedBases ?? EMPTY_SHARED_BASES)

  const standalone = getStandaloneIdeas(ideas)
  const extensionGroups = groupExtensions(ideas)
  const { result, loading, error, scan, clear, isAvailable, loaded } = usePortfolioScan()

  const variantCount = ideas.filter((i) => i.portfolioRole === 'variant').length

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Vue système"
        title="Portfolio"
        description="Idées, extensions, liens et socles — la carte de ton écosystème de projets."
        action={
          isAvailable && ideas.length >= 2 ? (
            <Button type="button" disabled={loading} onClick={() => void scan()}>
              <Sparkles className="h-4 w-4" />
              {loading ? 'Analyse…' : 'Scanner avec Steven'}
            </Button>
          ) : null
        }
      />

      {loaded && !isAvailable && ideas.length >= 2 ? <AIBanner /> : null}

      {error ? (
        <Card className="border-red-300/60 bg-red-50/80 p-4 text-sm text-red-900">{error}</Card>
      ) : null}

      {result ? <PortfolioScanPanel result={result} onDismiss={clear} /> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="text-2xl font-black text-midnight">{standalone.length}</div>
          <div className="text-sm text-tertiary/70">Idées distinctes</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-black text-midnight">{extensionGroups.length}</div>
          <div className="text-sm text-tertiary/70">Familles (extensions)</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-black text-midnight">{synergyLinks.length}</div>
          <div className="text-sm text-tertiary/70">Liens synergies</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-black text-midnight">{sharedBases.length}</div>
          <div className="text-sm text-tertiary/70">Socles mutualisés</div>
        </Card>
      </div>

      {ideas.length === 0 ? (
        <Card className="p-6 text-center text-sm text-tertiary/70">
          Aucune idée encore.{' '}
          <Link to="/app/brainstorm" className="text-primary underline-offset-2 hover:underline">
            Partage une pensée
          </Link>{' '}
          pour commencer.
        </Card>
      ) : (
        <div className="space-y-8">
          {standalone.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-sm font-bold text-midnight">Idées distinctes</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {standalone.map((idea) => (
                  <IdeaRow key={idea.id} idea={idea} />
                ))}
              </div>
            </section>
          ) : null}

          {extensionGroups.length > 0 ? (
            <section className="space-y-4">
              <h2 className="text-sm font-bold text-midnight">Extensions par idée parente</h2>
              {extensionGroups.map((group) => (
                <Card key={group.parentId} className="space-y-3 p-4">
                  <Link
                    to={`/app/ideas/${group.parentId}`}
                    className="text-sm font-semibold text-midnight underline-offset-2 hover:underline"
                  >
                    {group.parentTitle}
                  </Link>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {group.extensions.map((ext) => (
                      <IdeaRow key={ext.id} idea={ext} />
                    ))}
                  </div>
                </Card>
              ))}
            </section>
          ) : null}

          {variantCount > 0 ? (
            <section className="space-y-3">
              <h2 className="text-sm font-bold text-midnight">Variantes</h2>
              <p className="text-xs text-tertiary/60">
                {variantCount} idée{variantCount > 1 ? 's' : ''} proche{variantCount > 1 ? 's' : ''} d&apos;autres
                thèmes — voir les synergies ci-dessous.
              </p>
            </section>
          ) : null}

          {umbrellaGroups.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-sm font-bold text-midnight">Umbrellas</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {umbrellaGroups.map((u) => (
                  <Card key={u.id} className="p-4">
                    <Link
                      to="/app/umbrellas"
                      className="font-medium text-midnight underline-offset-2 hover:underline"
                    >
                      {u.name}
                    </Link>
                    {u.promise ? (
                      <p className="mt-1 text-xs text-tertiary/65">{u.promise}</p>
                    ) : null}
                    <p className="mt-2 text-xs text-tertiary/55">
                      {u.ideaIds.map((id) => ideaTitleById(ideas, id)).join(' · ')}
                    </p>
                  </Card>
                ))}
              </div>
            </section>
          ) : null}

          {sharedBases.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-sm font-bold text-midnight">Socles mutualisés</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {sharedBases.map((base) => (
                  <Card key={base.id} className="p-4">
                    <div className="font-medium text-midnight">{base.name}</div>
                    <p className="mt-1 text-xs text-tertiary/65">{base.description}</p>
                    <p className="mt-2 text-xs text-tertiary/55">
                      {base.sharedDimensions.join(' · ')}
                    </p>
                    <p className="mt-1 text-xs text-tertiary/55">
                      {base.ideaIds.map((id) => ideaTitleById(ideas, id)).join(' · ')}
                    </p>
                  </Card>
                ))}
              </div>
            </section>
          ) : null}

          {synergyLinks.length > 0 ? (
            <section className="space-y-3">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-bold text-midnight">Synergies</h2>
                <Link to="/app/synergy" className="text-xs text-tertiary/60 hover:text-midnight">
                  Carte complète →
                </Link>
              </div>
              <Card className="divide-y divide-alternate/40">
                {synergyLinks.map((link) => {
                  const partnerId = getPartnerId(link, link.sourceIdeaId)
                  return (
                    <Link
                      key={link.id}
                      to={`/app/ideas/${partnerId}`}
                      className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-alternate/20"
                    >
                      <div className="min-w-0 text-sm text-midnight">
                        {ideaTitleById(ideas, link.sourceIdeaId)} ↔{' '}
                        {ideaTitleById(ideas, link.targetIdeaId)}
                      </div>
                      <SynergyStrengthBadge strength={link.synergyStrength} />
                    </Link>
                  )
                })}
              </Card>
            </section>
          ) : null}
        </div>
      )}
    </div>
  )
}
