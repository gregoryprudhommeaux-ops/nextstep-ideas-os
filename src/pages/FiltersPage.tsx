import { Card } from '../components/ui/Card'
import { useActiveProfile, useAppStore, EMPTY_FILTERS, EMPTY_IDEAS, EMPTY_PROFILES } from '../app/store'
import { SectionHeader } from '../components/SectionHeader'
import { cn } from '../lib/cn'
import { dimensionMeta, penaltyDimensions, positiveDimensions } from '../features/scoring/dimensions'
import {
  getProfileExplanation,
  getProfileFavoredDimensions,
  previewTopIdeasForProfile,
} from '../features/scoring/profileInsights'
import type { ScoreDimension } from '../types/domain'

export function FiltersPage() {
  const profile = useActiveProfile()
  const profiles = useAppStore((s) => s.data?.profiles ?? EMPTY_PROFILES)
  const filters = useAppStore((s) => s.data?.filters ?? EMPTY_FILTERS)
  const ideas = useAppStore((s) => s.data?.ideas ?? EMPTY_IDEAS)
  const activeProfileId = useAppStore((s) => s.activeProfileId)
  const setActiveProfileId = useAppStore((s) => s.setActiveProfileId)

  return (
    <div className="space-y-6 sm:space-y-8">
      <SectionHeader
        eyebrow="Scoring system"
        title="Filters & Profiles"
        description="Switch strategic lenses to change how ideas rank. Weights are transparent — no black box."
      />

      {profile ? (
        <Card className="border-primary/30 bg-primary/5 p-5 sm:p-6">
          <div className="text-micro text-tertiary/60">Active lens</div>
          <div className="mt-1 text-xl font-black tracking-tight text-midnight sm:text-2xl">
            {profile.name}
          </div>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-tertiary/80 sm:text-[15px]">
            {getProfileExplanation(profile)}
          </p>
          <div className="mt-4 text-xs leading-relaxed text-tertiary/65">
            Favors:{' '}
            {getProfileFavoredDimensions(profile)
              .map((d) => dimensionMeta[d as ScoreDimension]?.label ?? d)
              .join(' • ')}
          </div>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <div className="text-micro text-tertiary/60">Scoring profiles</div>
          <div className="mt-4 space-y-2">
            {profiles.map((p) => {
              const preview = previewTopIdeasForProfile(ideas, p, 2)
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActiveProfileId(p.id)}
                  className={cn(
                    'w-full rounded-[--radius-card] border px-4 py-3 text-left transition',
                    p.id === activeProfileId
                      ? 'border-primary/40 bg-primary/10'
                      : 'border-alternate/60 bg-background hover:border-alternate'
                  )}
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="text-sm font-semibold text-midnight">{p.name}</div>
                    {p.id === activeProfileId ? (
                      <span className="text-micro text-tertiary/70">Active</span>
                    ) : null}
                  </div>
                  {p.description ? (
                    <div className="mt-2 text-xs leading-relaxed text-tertiary/70">{p.description}</div>
                  ) : null}
                  {preview.length > 0 ? (
                    <div className="mt-3 text-[11px] text-tertiary/55">
                      Rises: {preview.map((i) => i.title).join(', ')}
                    </div>
                  ) : null}
                </button>
              )
            })}
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-micro text-tertiary/60">Filter definitions</div>
          <p className="mt-2 text-xs text-tertiary/60">
            Structure for future custom filters. Step 2.5 displays seed definitions only.
          </p>
          <div className="mt-4 space-y-3">
            {filters.length ? (
              filters.map((f) => (
                <div
                  key={f.id}
                  className="rounded-[--radius-card] border border-alternate/50 bg-background px-4 py-3"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="text-sm font-semibold text-midnight">{f.name}</div>
                    <div className="text-micro text-tertiary/60">{f.type}</div>
                  </div>
                  {f.description ? (
                    <div className="mt-2 text-xs leading-relaxed text-tertiary/70">{f.description}</div>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="text-sm text-tertiary/60">No custom filters yet — scoring profiles drive ranking.</p>
            )}
          </div>
        </Card>
      </div>

      {profile ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="p-6">
            <div className="text-micro text-tertiary/60">Core dimension weights</div>
            <p className="mt-2 text-xs text-tertiary/60">Higher weight = more influence on ranking.</p>
            <div className="mt-4 space-y-2">
              {positiveDimensions.map((d) => {
                const w = profile.weights[d] ?? 1
                const emphasized = w > 1.1
                return (
                  <div
                    key={d}
                    className={cn(
                      'flex items-center justify-between rounded-[--radius-sharp] border px-3 py-2',
                      emphasized ? 'border-primary/30 bg-primary/5' : 'border-alternate/60 bg-background'
                    )}
                  >
                    <div>
                      <div className="text-xs font-medium text-midnight">{dimensionMeta[d].label}</div>
                      <div className="text-[11px] text-tertiary/55">{dimensionMeta[d].description}</div>
                    </div>
                    <span className="text-sm font-bold tabular-nums text-midnight">{w}</span>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-micro text-tertiary/60">Penalty weights</div>
            <p className="mt-2 text-xs text-tertiary/60">Subtracted from weighted score.</p>
            <div className="mt-4 space-y-2">
              {penaltyDimensions.map((d) => {
                const w = profile.weights[d] ?? 1
                return (
                  <div
                    key={d}
                    className="flex items-center justify-between rounded-[--radius-sharp] border border-alternate/60 bg-background px-3 py-2"
                  >
                    <div>
                      <div className="text-xs font-medium text-midnight">{dimensionMeta[d].label}</div>
                      <div className="text-[11px] text-tertiary/55">{dimensionMeta[d].description}</div>
                    </div>
                    <span className="text-sm font-bold tabular-nums text-tertiary/80">−{w}</span>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  )
}
