import { AlertTriangle, RefreshCw, Sparkles } from 'lucide-react'
import type { Idea } from '../../types/domain'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Field } from '../../components/ui/Field'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { SliderField } from '../../components/ui/SliderField'
import { Textarea } from '../../components/ui/Textarea'
import { ProseText } from '../../components/ProseText'
import { competitorsOver100kLabels, revenueConfidenceLabels } from '../../lib/labels'
import { cn } from '../../lib/cn'
import { MATRIX_SCORE_MAX, computeDecisionMatrixTotals } from './decisionMatrixScore'
import { useIdeaDecisionMatrix } from './useIdeaDecisionMatrix'

type Props = {
  idea: Idea
}

export function IdeaDecisionMatrixPanel({ idea }: Props) {
  const {
    draft,
    loading,
    error,
    dirty,
    showForm,
    patch,
    patchCompetitor,
    save,
    openManual,
    runSteven,
    isTaskAvailable,
    loaded,
    hasSaved,
  } = useIdeaDecisionMatrix(idea)

  if (!loaded) return null

  const { evidenceWeak } = computeDecisionMatrixTotals(draft)

  return (
    <Card className="overflow-hidden p-0" id="decision-matrix">
      <div className="border-b border-alternate/50 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-micro text-tertiary/60">Évaluation evidence-first</div>
            <h2 className="mt-1 text-sm font-bold text-midnight">Matrice de décision</h2>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-tertiary/65">
              Preuve marché (concurrents qui monétisent), simplicité, pas de cold-start social, kiff,
              marketabilité. Score = 3 notes /5 + bonus « pas social » (max {MATRIX_SCORE_MAX}).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {dirty ? (
              <Button type="button" variant="ghost" className="text-xs" onClick={save}>
                Enregistrer
              </Button>
            ) : null}
            {isTaskAvailable ? (
              <Button
                type="button"
                variant="ghost"
                className="text-xs"
                disabled={loading}
                onClick={() => void runSteven()}
              >
                <RefreshCw className={cn('mr-1.5 h-3.5 w-3.5', loading && 'animate-spin')} />
                {loading ? 'Steven…' : hasSaved ? 'Challenger avec Steven' : 'Remplir avec Steven'}
              </Button>
            ) : (
              <p className="text-xs text-tertiary/55">Clé API requise (Settings)</p>
            )}
          </div>
        </div>
        {error ? <p className="mt-3 text-xs text-red-600/90">{error}</p> : null}
      </div>

      {!showForm ? (
        <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
          <Sparkles className="h-8 w-8 text-tertiary/30" />
          <p className="max-w-md text-sm text-tertiary/65">
            Steven peut pré-remplir la matrice à partir de la fiche (et de la recherche marché si
            disponible), puis te challenger sur les preuves manquantes.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {isTaskAvailable ? (
              <Button type="button" disabled={loading} onClick={() => void runSteven()}>
                {loading ? 'Évaluation…' : 'Remplir avec Steven'}
              </Button>
            ) : null}
            <Button type="button" variant="ghost" onClick={openManual}>
              Remplir à la main
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-5 px-5 py-5">
          <div className="flex flex-wrap items-center gap-3">
            <div
              className={cn(
                'rounded-[--radius-sharp] px-3 py-2 tabular-nums',
                draft.evidenceVeto
                  ? 'bg-red-50 text-red-900 ring-1 ring-red-200/80'
                  : evidenceWeak
                    ? 'bg-amber-50 text-amber-950 ring-1 ring-amber-200/80'
                    : 'bg-mineral/60 text-midnight ring-1 ring-alternate/60'
              )}
            >
              <div className="text-micro text-tertiary/60">Score matrice</div>
              <div className="text-lg font-bold">
                {draft.scoreTotal}
                <span className="text-sm font-medium text-tertiary/55">/{MATRIX_SCORE_MAX}</span>
              </div>
            </div>
            {draft.evidenceVeto ? (
              <p className="inline-flex max-w-md items-start gap-1.5 text-xs font-medium text-red-800">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Veto soft : pas de signal clair de 2 concurrents à +100k — l&apos;idée reste
                spéculative.
              </p>
            ) : evidenceWeak ? (
              <p className="inline-flex max-w-md items-start gap-1.5 text-xs text-amber-900/90">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Preuve marché encore floue — clarifie les concurrents avant de prioriser.
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Catégorie / niche" hint="Plus précis que la catégorie fiche si besoin">
              <Input
                value={draft.niche}
                onChange={(e) => patch({ niche: e.target.value })}
                placeholder="ex. micro-SaaS B2B facturation freelances"
              />
            </Field>
            <Field
              label="2 concurrents à +100k ?"
              hint="Yes seulement avec signaux crédibles — sinon unknown / no"
            >
              <Select
                value={draft.competitorsOver100k}
                onChange={(e) =>
                  patch({
                    competitorsOver100k: e.target.value as typeof draft.competitorsOver100k,
                  })
                }
              >
                {(Object.keys(competitorsOver100kLabels) as Array<keyof typeof competitorsOver100kLabels>).map(
                  (key) => (
                    <option key={key} value={key}>
                      {competitorsOver100kLabels[key]}
                    </option>
                  )
                )}
              </Select>
            </Field>
          </div>

          <div>
            <div className="text-micro text-tertiary/60">3 plus gros concurrents + revenus</div>
            <p className="mt-1 text-[11px] text-tertiary/50">
              Revenue = estimation libre ou « unknown ». Ne pas inventer des chiffres App Store.
            </p>
            <div className="mt-3 space-y-2">
              {draft.topCompetitors.map((c, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 gap-2 rounded-[--radius-sharp] border border-alternate/50 bg-mineral/20 p-3 sm:grid-cols-12"
                >
                  <div className="sm:col-span-4">
                    <Input
                      value={c.name}
                      onChange={(e) => patchCompetitor(index, { name: e.target.value })}
                      placeholder={`Concurrent ${index + 1}`}
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <Input
                      value={c.revenue}
                      onChange={(e) => patchCompetitor(index, { revenue: e.target.value })}
                      placeholder="revenu / unknown"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Select
                      value={c.revenueConfidence ?? ''}
                      onChange={(e) =>
                        patchCompetitor(index, {
                          revenueConfidence: e.target.value
                            ? (e.target.value as 'low' | 'medium' | 'high')
                            : undefined,
                        })
                      }
                    >
                      <option value="">Confiance</option>
                      {(Object.keys(revenueConfidenceLabels) as Array<
                        keyof typeof revenueConfidenceLabels
                      >).map((key) => (
                        <option key={key} value={key}>
                          {revenueConfidenceLabels[key]}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="sm:col-span-3">
                    <Input
                      value={c.sourceNote ?? ''}
                      onChange={(e) => patchCompetitor(index, { sourceNote: e.target.value })}
                      placeholder="source / note"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SliderField
              label="Simplicité"
              value={draft.simplicity}
              min={1}
              max={5}
              onChange={(v) => patch({ simplicity: v })}
              hint="5 = peu de pièces mobiles"
            />
            <SliderField
              label="Kiff"
              value={draft.kiff}
              min={1}
              max={5}
              onChange={(v) => patch({ kiff: v })}
              hint="Envie / énergie réelle — pas flatterie"
            />
            <SliderField
              label="Marketabilité"
              value={draft.marketability}
              min={1}
              max={5}
              onChange={(v) => patch({ marketability: v })}
              hint="Facilité à expliquer / vendre la promesse"
            />
            <label className="flex cursor-pointer items-start gap-3 rounded-[--radius-sharp] border border-alternate/50 bg-mineral/20 px-3 py-3">
              <input
                type="checkbox"
                className="mt-1"
                checked={draft.noSocial}
                onChange={(e) => patch({ noSocial: e.target.checked })}
              />
              <span>
                <span className="text-xs font-medium text-tertiary/80">Pas social</span>
                <span className="mt-0.5 block text-[11px] text-tertiary/50">
                  La valeur n&apos;exige pas un réseau d&apos;utilisateurs (+1 au score si coché)
                </span>
              </span>
            </label>
          </div>

          {draft.stevenChallenge ? (
            <div className="rounded-[--radius-sharp] border border-primary/20 bg-primary/5 px-4 py-3">
              <div className="text-micro text-tertiary/60">Challenge Steven</div>
              <p className="mt-2 text-sm leading-relaxed text-tertiary/85">
                <ProseText>{draft.stevenChallenge}</ProseText>
              </p>
              {draft.stevenNotes ? (
                <p className="mt-2 text-xs text-tertiary/65">
                  <ProseText>{draft.stevenNotes}</ProseText>
                </p>
              ) : null}
            </div>
          ) : null}

          <Field label="Notes / challenge (éditable)">
            <Textarea
              rows={3}
              value={draft.stevenChallenge ?? ''}
              onChange={(e) => patch({ stevenChallenge: e.target.value })}
              placeholder="Ce qui manque de preuve, angle mort, question de recul…"
            />
          </Field>

          {dirty ? (
            <div className="flex justify-end">
              <Button type="button" onClick={save}>
                Enregistrer la matrice
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </Card>
  )
}
