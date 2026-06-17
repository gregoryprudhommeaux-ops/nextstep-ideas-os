import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { useActiveProfile, useAppStore, useRankedIdeas } from '../app/store'
import { SectionHeader } from '../components/SectionHeader'
import { StatCard } from '../components/StatCard'
import { IdeaLinkRow } from '../components/IdeaLinkRow'
import { getProfileExplanation } from '../features/scoring/profileInsights'
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
  const ideas = useAppStore((s) => s.data?.ideas ?? [])
  const synergyLinks = useAppStore((s) => s.data?.synergyLinks ?? [])
  const latestReview = useAppStore((s) => {
    const reviews = s.data?.weeklyReviews ?? []
    return [...reviews].sort((a, b) => b.weekLabel.localeCompare(a.weekLabel))[0] ?? null
  })

  const mostConnected = getMostConnectedIdeas(ideas, synergyLinks, 5)

  const total = ideas.length
  const byStatus = ideas.reduce<Record<string, number>>((acc, i) => {
    acc[i.status] = (acc[i.status] ?? 0) + 1
    return acc
  }, {})

  const top5 = ranked.slice(0, 5)
  const highAlignment = [...ideas]
    .sort((a, b) => b.personalAlignment - a.personalAlignment)
    .slice(0, 5)
  const quickTests = [...ideas]
    .filter((i) => i.complexityLevel <= 4 && i.speedToValidation >= 7)
    .sort((a, b) => b.speedToValidation - a.speedToValidation)
    .slice(0, 5)
  const attention = profile
    ? ideas.filter((i) => needsAttention(i, profile)).slice(0, 5)
    : []
  const needingValidation = ideas
    .filter((i) => i.status === 'explore' || i.status === 'validate')
    .slice(0, 5)

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Portfolio snapshot"
        title="Dashboard"
        description="Read your idea portfolio through the active scoring lens. Switch profiles to change what rises."
      />

      {profile ? (
        <Card className="border-primary/25 bg-primary/5 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-prose">
              <div className="text-micro text-tertiary/60">Active scoring lens</div>
              <div className="mt-1 text-lg font-black tracking-tight text-midnight">{profile.name}</div>
              <p className="mt-2 text-sm leading-relaxed text-tertiary/75">
                {getProfileExplanation(profile)}
              </p>
            </div>
            <Link
              to="/app/filters"
              className="text-micro text-tertiary/70 underline-offset-2 hover:text-tertiary hover:underline"
            >
              View all profiles →
            </Link>
          </div>
        </Card>
      ) : null}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total ideas" value={total} accent />
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
            <div className="text-micro text-tertiary/60">Top ranked</div>
            <Link to="/app/ideas" className="text-micro text-tertiary/60 hover:text-tertiary">
              View board →
            </Link>
          </div>
          <div className="mt-4 space-y-1">
            {top5.map((i) => (
              <IdeaLinkRow key={i.id} idea={i} />
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-micro text-tertiary/60">Needs attention</div>
          <p className="mt-1 text-xs text-tertiary/60">
            High upside ideas with weak fit under the current lens.
          </p>
          <div className="mt-4 space-y-1">
            {attention.length ? (
              attention.map((i) => <IdeaLinkRow key={i.id} idea={i} meta="Review strategic tension" />)
            ) : (
              <div className="text-xs text-tertiary/55">No critical tensions flagged.</div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="text-micro text-tertiary/60">Highest alignment</div>
          <div className="mt-4 space-y-1">
            {highAlignment.map((i) => (
              <IdeaLinkRow key={i.id} idea={i} meta={`Alignment ${i.personalAlignment}/10`} />
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-micro text-tertiary/60">Quick validation</div>
          <div className="mt-4 space-y-1">
            {quickTests.map((i) => (
              <IdeaLinkRow
                key={i.id}
                idea={i}
                meta={`Speed ${i.speedToValidation}/10 • Complexity ${i.complexityLevel}/10`}
              />
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-micro text-tertiary/60">Needs validation</div>
          <div className="mt-4 space-y-1">
            {needingValidation.length ? (
              needingValidation.map((i) => (
                <IdeaLinkRow key={i.id} idea={i} meta={statusLabels[i.status]} />
              ))
            ) : (
              <div className="text-xs text-tertiary/55">No ideas in explore/validate.</div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-baseline justify-between gap-2">
            <div className="text-micro text-tertiary/60">Most connected ideas</div>
            <Link to="/app/synergy" className="text-micro text-tertiary/60 hover:text-tertiary">
              Synergy map →
            </Link>
          </div>
          <div className="mt-4 space-y-1">
            {mostConnected.map(({ idea, count }) => (
              <IdeaLinkRow key={idea.id} idea={idea} meta={`${count} synergy links`} />
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-baseline justify-between gap-2">
            <div className="text-micro text-tertiary/60">Weekly review</div>
            <Link to="/app/review" className="text-micro text-tertiary/60 hover:text-tertiary">
              Full review →
            </Link>
          </div>
          {latestReview ? (
            <div className="mt-4">
              <div className="text-sm font-semibold text-midnight">{latestReview.weekLabel}</div>
              {latestReview.summary ? (
                <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-tertiary/70">
                  {latestReview.summary}
                </p>
              ) : null}
              {latestReview.reflections ? (
                <p className="mt-3 text-xs italic leading-relaxed text-tertiary/60">
                  “{latestReview.reflections.slice(0, 120)}…”
                </p>
              ) : null}
            </div>
          ) : (
            <div className="mt-4 text-xs text-tertiary/55">No reviews yet.</div>
          )}
        </Card>
      </div>
    </div>
  )
}
