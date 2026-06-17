import { Card } from '../components/ui/Card'
import { SectionHeader } from '../components/SectionHeader'
import { useAppStore, EMPTY_IDEAS, EMPTY_WEEKLY_REVIEWS } from '../app/store'
import { WeeklyReviewForm } from '../features/review/WeeklyReviewForm'
import { Link } from 'react-router-dom'

function IdeaChipList({ ids, label }: { ids?: string[]; label: string }) {
  const ideas = useAppStore((s) => s.data?.ideas ?? EMPTY_IDEAS)
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
  const reviews = useAppStore((s) => s.data?.weeklyReviews ?? EMPTY_WEEKLY_REVIEWS)
  const sorted = [...reviews].sort((a, b) => b.weekLabel.localeCompare(a.weekLabel))
  const past = sorted.slice(1)

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Decision rhythm"
        title="Weekly review"
        description="Three guided questions each week — your decision journal."
      />

      <WeeklyReviewForm />

      {past.length > 0 ? (
        <div className="space-y-6">
          <div className="text-micro text-tertiary/60">Past reviews</div>
          {past.map((review) => (
            <Card key={review.id} className="p-6">
              <div className="text-lg font-black tracking-tight text-midnight">{review.weekLabel}</div>
              {review.qStatusChange ? (
                <div className="mt-4">
                  <div className="text-micro text-tertiary/55">Moved</div>
                  <p className="mt-1 text-sm text-tertiary/80">{review.qStatusChange}</p>
                </div>
              ) : null}
              {review.qSynergy ? (
                <div className="mt-4">
                  <div className="text-micro text-tertiary/55">Synergy</div>
                  <p className="mt-1 text-sm text-tertiary/80">{review.qSynergy}</p>
                </div>
              ) : null}
              {review.qDeprioritize ? (
                <div className="mt-4">
                  <div className="text-micro text-tertiary/55">Deprioritized</div>
                  <p className="mt-1 text-sm text-tertiary/80">{review.qDeprioritize}</p>
                </div>
              ) : null}
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <IdeaChipList ids={review.ideasToExplore} label="Explore" />
                <IdeaChipList ids={review.ideasToTest} label="Test" />
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  )
}
