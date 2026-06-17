import type { PortfolioScanResult } from '../../types/ai'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import {
  useAppStore,
  EMPTY_IDEAS,
  EMPTY_SYNERGY_LINKS,
} from '../../app/store'
import { ideaTitleById, synergyPairExists } from './portfolioUtils'

type Props = {
  result: PortfolioScanResult
  onDismiss: () => void
}

export function PortfolioScanPanel({ result, onDismiss }: Props) {
  const ideas = useAppStore((s) => s.data?.ideas ?? EMPTY_IDEAS)
  const synergyLinks = useAppStore((s) => s.data?.synergyLinks ?? EMPTY_SYNERGY_LINKS)
  const addSynergyLink = useAppStore((s) => s.addSynergyLink)
  const addUmbrella = useAppStore((s) => s.addUmbrella)
  const addSharedBase = useAppStore((s) => s.addSharedBase)

  const synergies = result.suggestedSynergies.filter(
    (s) =>
      ideas.some((i) => i.id === s.sourceIdeaId) &&
      ideas.some((i) => i.id === s.targetIdeaId) &&
      !synergyPairExists(synergyLinks, s.sourceIdeaId, s.targetIdeaId)
  )

  const hasSuggestions =
    synergies.length > 0 ||
    result.umbrellaCandidates.length > 0 ||
    result.sharedBases.length > 0

  if (!hasSuggestions) {
    return (
      <Card className="p-5 text-sm text-tertiary/70">
        Aucune nouvelle suggestion — le portfolio semble déjà bien structuré.
        <Button type="button" variant="ghost" className="mt-3" onClick={onDismiss}>
          Fermer
        </Button>
      </Card>
    )
  }

  return (
    <Card className="space-y-6 border-primary/25 bg-primary/5 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-midnight">Suggestions de Steven</div>
          <p className="mt-1 text-xs text-tertiary/70">
            Confirme ce qui résonne — rien n&apos;est appliqué sans ton accord.
          </p>
        </div>
        <Button type="button" variant="ghost" onClick={onDismiss}>
          Fermer
        </Button>
      </div>

      {synergies.length > 0 ? (
        <section className="space-y-3">
          <h3 className="text-micro text-tertiary/60">Synergies</h3>
          {synergies.map((s) => (
            <div
              key={`${s.sourceIdeaId}-${s.targetIdeaId}`}
              className="rounded-[--radius-sharp] border border-alternate/60 bg-background p-3"
            >
              <div className="text-sm font-medium text-midnight">
                {ideaTitleById(ideas, s.sourceIdeaId)} ↔ {ideaTitleById(ideas, s.targetIdeaId)}
              </div>
              <p className="mt-1 text-xs text-tertiary/70">{s.note}</p>
              <Button
                type="button"
                className="mt-2"
                onClick={() =>
                  addSynergyLink({
                    sourceIdeaId: s.sourceIdeaId,
                    targetIdeaId: s.targetIdeaId,
                    totalSynergyScore: s.score,
                    notes: s.note,
                  })
                }
              >
                Créer le lien
              </Button>
            </div>
          ))}
        </section>
      ) : null}

      {result.umbrellaCandidates.length > 0 ? (
        <section className="space-y-3">
          <h3 className="text-micro text-tertiary/60">Umbrellas émergents</h3>
          {result.umbrellaCandidates.map((u, i) => (
            <div key={i} className="rounded-[--radius-sharp] border border-alternate/60 bg-background p-3">
              <div className="text-sm font-medium text-midnight">{u.name}</div>
              <p className="mt-1 text-xs text-tertiary/70">{u.note}</p>
              <p className="mt-1 text-xs text-tertiary/55">
                {u.ideaIds.map((id) => ideaTitleById(ideas, id)).join(' · ')}
              </p>
              <Button
                type="button"
                className="mt-2"
                onClick={() => addUmbrella({ name: u.name, promise: u.note, ideaIds: u.ideaIds })}
              >
                Créer l&apos;umbrella
              </Button>
            </div>
          ))}
        </section>
      ) : null}

      {result.sharedBases.length > 0 ? (
        <section className="space-y-3">
          <h3 className="text-micro text-tertiary/60">Socles mutualisés</h3>
          {result.sharedBases.map((b, i) => (
            <div key={i} className="rounded-[--radius-sharp] border border-alternate/60 bg-background p-3">
              <div className="text-sm font-medium text-midnight">{b.name}</div>
              <p className="mt-1 text-xs text-tertiary/70">{b.note}</p>
              <p className="mt-1 text-xs text-tertiary/55">
                {b.ideaIds.map((id) => ideaTitleById(ideas, id)).join(' · ')}
              </p>
              <Button
                type="button"
                className="mt-2"
                onClick={() =>
                  addSharedBase({
                    name: b.name,
                    description: b.note,
                    ideaIds: b.ideaIds,
                    sharedDimensions: b.dimensions,
                    aiSuggested: true,
                  })
                }
              >
                Confirmer le socle
              </Button>
            </div>
          ))}
        </section>
      ) : null}
    </Card>
  )
}
