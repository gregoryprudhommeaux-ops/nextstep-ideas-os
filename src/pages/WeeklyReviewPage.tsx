import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { SectionHeader } from '../components/SectionHeader'
import { useAppStore } from '../app/store'

function IdeaChipList({ ids, label }: { ids?: string[]; label: string }) {
  const ideas = useAppStore((s) => s.data?.ideas ?? [])
  const list = (ids ?? []).map((id) => ideas.find((i) => i.id === id)).filter(Boolean)

  return (
    <div>
      <div className="text-micro text-tertiary/60">{label}</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {list.length ? (
          list.map((idea) => (
            <Link
              key={idea!.id}
              to={`/app/ideas/${idea!.id}`}
              className="rounded-full border border-alternate/60 bg-background px-3 py-1 text-xs font-medium text-tertiary/80 transition hover:border-primary/30 hover:bg-primary/5"
            >
              {idea!.title}
            </Link>
          ))
        ) : (
          <span className="text-xs text-tertiary/50">—</span>
        )}
      </div>
    </div>
  )
}

export function WeeklyReviewPage() {
  const reviews = useAppStore((s) => s.data?.weeklyReviews ?? [])
  const sorted = [...reviews].sort((a, b) => b.weekLabel.localeCompare(a.weekLabel))
  const latest = sorted[0]

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Decision rhythm"
        title="Weekly review"
        description="Guided strategic review — momentum, alignment, and portfolio moves."
      />

      {latest ? (
        <Card className="border-primary/20 bg-primary/5 p-6">
          <div className="text-micro text-tertiary/60">Current week</div>
          <div className="mt-1 text-xl font-black tracking-tight text-midnight">{latest.weekLabel}</div>
          {latest.summary ? (
            <p className="mt-3 max-w-prose text-sm leading-relaxed text-tertiary/80">{latest.summary}</p>
          ) : null}
        </Card>
      ) : null}

      <div className="space-y-6">
        {sorted.map((review) => (
          <Card key={review.id} className="p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="text-lg font-black tracking-tight text-midnight">{review.weekLabel}</div>
            </div>
            {review.summary ? (
              <p className="mt-3 text-sm leading-relaxed text-tertiary/75">{review.summary}</p>
            ) : null}

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <IdeaChipList ids={review.ideasToExplore} label="Explore" />
              <IdeaChipList ids={review.ideasToTest} label="Test" />
              <IdeaChipList ids={review.ideasToPause} label="Pause" />
              <IdeaChipList ids={review.mergeCandidates} label="Merge candidates" />
              <IdeaChipList ids={review.umbrellaCandidates} label="Umbrella candidates" />
            </div>

            {review.reflections ? (
              <div className="mt-6 border-t border-alternate/50 pt-5">
                <div className="text-micro text-tertiary/55">Reflections</div>
                <p className="mt-2 text-sm leading-relaxed text-tertiary/80">{review.reflections}</p>
              </div>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  )
}
