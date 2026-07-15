import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useActiveProfile, useAppStore, useRankedIdeas, EMPTY_IDEAS, EMPTY_SYNERGY_LINKS } from '../app/store'
import { SectionHeader } from '../components/SectionHeader'
import { StatCard } from '../components/StatCard'
import { IdeaLinkRow } from '../components/IdeaLinkRow'
import { statusLabels } from '../lib/labels'
import type { Idea } from '../types/domain'
import { getMostConnectedIdeas } from '../features/synergy/synergyUtils'
import { calculateWeightedScore } from '../features/scoring/scoring'

function needsAttention(idea: Idea, profile: NonNullable<ReturnType<typeof useActiveProfile>>) {
  const score = calculateWeightedScore(idea, profile)
  const upside = idea.revenuePotential >= 7 || idea.scalabilityFit >= 7
  const weakFit = score < 55 || idea.personalAlignment < 6
  return upside && weakFit
}

export function DashboardPage() {
  const profile = useActiveProfile()
  const ranked = useRankedIdeas()
  const ideas = useAppStore((s) => s.data?.ideas ?? EMPTY_IDEAS)
  const synergyLinks = useAppStore((s) => s.data?.synergyLinks ?? EMPTY_SYNERGY_LINKS)

  const mostConnected = getMostConnectedIdeas(ideas, synergyLinks, 5)

  const total = ideas.length
  const activeIdeas = ideas.filter((i) => i.status !== 'archive')
  const byStatus = ideas.reduce<Record<string, number>>((acc, i) => {
    acc[i.status] = (acc[i.status] ?? 0) + 1
    return acc
  }, {})

  const top5 = ranked.filter((i) => i.status !== 'archive').slice(0, 5)
  const highAlignment = [...activeIdeas]
    .sort((a, b) => b.personalAlignment - a.personalAlignment)
    .slice(0, 5)
  const quickTests = [...activeIdeas]
    .filter((i) => i.complexityLevel <= 4 && i.speedToValidation >= 7)
    .sort((a, b) => b.speedToValidation - a.speedToValidation)
    .slice(0, 5)
  const attention = profile
    ? activeIdeas.filter((i) => needsAttention(i, profile)).slice(0, 5)
    : []
  const needingValidation = activeIdeas
    .filter((i) => i.status === 'explore' || i.status === 'validate')
    .slice(0, 5)

  if (total === 0) {
    return (
      <div className="space-y-8">
        <SectionHeader
          eyebrow="Bienvenue"
          title="Votre cockpit stratégique"
          description="Commencez léger. Capturez une idée, scorez-la subjectivement, puis faites grandir votre Portfolio semaine après semaine."
        />
        <Card className="border-primary/25 bg-primary/5 p-8">
          <div className="text-micro text-tertiary/60">Pour démarrer</div>
          <ol className="mt-4 space-y-3 text-sm leading-relaxed text-tertiary/80">
            <li>
              <span className="font-semibold text-midnight">1.</span> Capturez une idée (titre + courte
              description)
            </li>
            <li>
              <span className="font-semibold text-midnight">2.</span> Complétez le brief stratégique
              et ajustez vos scores
            </li>
            <li>
              <span className="font-semibold text-midnight">3.</span> Reliez les idées, explorez les synergies
              et regroupez les Umbrellas
            </li>
          </ol>
          <Link to="/app/ideas/new" className="mt-6 inline-block">
            <Button size="lg">Capturer ma première idée</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Aperçu Portfolio"
        title="Dashboard"
        description="Vue d’ensemble de ton Portfolio — idées, tensions et prochaines actions."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total idées" value={total} accent />
        {(Object.keys(statusLabels) as (keyof typeof statusLabels)[]).map((status) => (
          <StatCard
            key={status}
            label={statusLabels[status]}
            value={byStatus[status] ?? 0}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-baseline justify-between gap-3">
            <div className="text-micro text-tertiary/60">Top classé</div>
            <Link to="/app/ideas" className="text-micro text-tertiary/60 hover:text-tertiary">
              Voir le board →
            </Link>
          </div>
          <div className="mt-4 space-y-1">
            {top5.map((i) => (
              <IdeaLinkRow key={i.id} idea={i} />
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-micro text-tertiary/60">À surveiller</div>
          <p className="mt-1 text-xs text-tertiary/60">
            Idées à fort potentiel avec un score global faible ou un alignement personnel limité.
          </p>
          <div className="mt-4 space-y-1">
            {attention.length ? (
              attention.map((i) => <IdeaLinkRow key={i.id} idea={i} meta="Revoir la tension stratégique" />)
            ) : (
              <div className="text-xs text-tertiary/55">Aucune tension critique signalée.</div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="text-micro text-tertiary/60">Alignement le plus fort</div>
          <div className="mt-4 space-y-1">
            {highAlignment.map((i) => (
              <IdeaLinkRow key={i.id} idea={i} meta={`Alignement ${i.personalAlignment}/10`} />
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-micro text-tertiary/60">Validation rapide</div>
          <div className="mt-4 space-y-1">
            {quickTests.map((i) => (
              <IdeaLinkRow
                key={i.id}
                idea={i}
                meta={`Validation speed ${i.speedToValidation}/10 • Complexity ${i.complexityLevel}/10`}
              />
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-micro text-tertiary/60">À valider</div>
          <div className="mt-4 space-y-1">
            {needingValidation.length ? (
              needingValidation.map((i) => (
                <IdeaLinkRow key={i.id} idea={i} meta={statusLabels[i.status]} />
              ))
            ) : (
              <div className="text-xs text-tertiary/55">Aucune idée en Explore/Validate.</div>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-baseline justify-between gap-2">
          <div className="text-micro text-tertiary/60">Idées les plus connectées</div>
          <Link to="/app/synergy" className="text-micro text-tertiary/60 hover:text-tertiary">
            Synergy map →
          </Link>
        </div>
        <div className="mt-4 space-y-1">
          {mostConnected.map(({ idea, count }) => (
            <IdeaLinkRow key={idea.id} idea={idea} meta={`${count} liens Synergy`} />
          ))}
        </div>
      </Card>
    </div>
  )
}
