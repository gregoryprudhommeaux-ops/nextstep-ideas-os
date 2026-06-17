import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { SectionHeader } from '../components/SectionHeader'
import { ScorePill } from '../components/score/ScorePill'
import { useAppStore, useIdeaScore } from '../app/store'
import { cn } from '../lib/cn'

function GroupIdeaRow({ ideaId }: { ideaId: string }) {
  const idea = useAppStore((s) => s.data?.ideas.find((i) => i.id === ideaId))
  const score = useIdeaScore(ideaId)
  if (!idea) return null
  return (
    <Link
      to={`/app/ideas/${idea.id}`}
      className="flex items-center justify-between rounded-[--radius-sharp] border border-alternate/50 bg-mineral px-3 py-2 transition hover:border-alternate hover:bg-background"
    >
      <span className="truncate text-sm font-medium text-midnight">{idea.title}</span>
      <ScorePill score={score?.weightedScore ?? 0} />
    </Link>
  )
}

export function UmbrellasPage() {
  const groups = useAppStore((s) => s.data?.umbrellaGroups ?? [])
  const ungrouped = useAppStore((s) => {
    const ideas = s.data?.ideas ?? []
    const grps = s.data?.umbrellaGroups ?? []
    const grouped = new Set(grps.flatMap((g) => g.ideaIds))
    return ideas.filter((i) => !grouped.has(i.id))
  })

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Brand families"
        title="Umbrella groups"
        description="Cluster ideas under shared brand logic. Cohesion scores surface fit — tension notes flag dilution risk."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {groups.map((g) => (
          <Card key={g.id} className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-micro text-tertiary/60">Umbrella</div>
                <div className="mt-1 text-xl font-black tracking-tight text-midnight">{g.name}</div>
              </div>
              {g.cohesionScore != null ? (
                <div className="text-right">
                  <div className="text-micro text-tertiary/55">Cohesion</div>
                  <div className="text-2xl font-black tabular-nums text-midnight">{g.cohesionScore}</div>
                </div>
              ) : null}
            </div>

            {g.promise ? (
              <p className="mt-4 text-sm font-medium text-tertiary/80">{g.promise}</p>
            ) : null}
            {g.strategicLogic ? (
              <p className="mt-3 text-sm leading-relaxed text-tertiary/70">{g.strategicLogic}</p>
            ) : null}

            {g.tensionNotes ? (
              <div className="mt-4 rounded-[--radius-sharp] border border-alternate/60 bg-mineral px-3 py-2.5">
                <div className="text-micro text-tertiary/55">Tension</div>
                <p className="mt-1 text-xs leading-relaxed text-tertiary/75">{g.tensionNotes}</p>
              </div>
            ) : null}

            <div className="mt-5">
              <div className="text-micro text-tertiary/55">Ideas in group</div>
              <div className="mt-2 space-y-2">
                {g.ideaIds.map((id) => (
                  <GroupIdeaRow key={id} ideaId={id} />
                ))}
              </div>
            </div>

            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-alternate/40">
              <div
                className={cn(
                  'h-full rounded-full',
                  (g.cohesionScore ?? 0) >= 7 ? 'bg-primary' : 'bg-secondary/70'
                )}
                style={{ width: `${(g.cohesionScore ?? 0) * 10}%` }}
              />
            </div>
          </Card>
        ))}
      </div>

      {ungrouped.length > 0 ? (
        <Card className="p-6">
          <div className="text-micro text-tertiary/60">Ungrouped ideas</div>
          <p className="mt-2 text-xs text-tertiary/65">
            Ideas not yet assigned to an umbrella — candidates for new brand families.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {ungrouped.map((i) => (
              <Link
                key={i.id}
                to={`/app/ideas/${i.id}`}
                className="rounded-full border border-alternate/60 bg-background px-3 py-1 text-xs font-medium text-tertiary/80 hover:border-alternate"
              >
                {i.title}
              </Link>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  )
}
