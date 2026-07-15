import * as React from 'react'
import { AlertTriangle, HelpCircle, RefreshCw, Sparkles } from 'lucide-react'
import type { Idea } from '../../types/domain'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { ProseText } from '../../components/ProseText'
import {
  BMC_BLOCK_KEYS,
  BMC_GRID_STYLE,
  bmcBlockMeta,
  bmcHealthMeta,
  isBmcGapHealth,
} from './businessModelCanvas'
import { useIdeaBusinessModelCanvas } from './useIdeaBusinessModelCanvas'
import { cn } from '../../lib/cn'

type Props = {
  idea: Idea
}

function SummaryBullets({ summary }: { summary: string }) {
  const items = summary
    .split(/[·•\n]/)
    .map((s) => s.trim())
    .filter(Boolean)

  if (items.length <= 1) {
    return <p className="line-clamp-4 text-xs leading-relaxed text-tertiary/80">{summary}</p>
  }

  return (
    <ul className="space-y-1 text-xs leading-relaxed text-tertiary/80">
      {items.slice(0, 4).map((item) => (
        <li key={item} className="flex gap-1.5">
          <span className="text-tertiary/35">·</span>
          <span className="line-clamp-2">{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function IdeaBusinessModelCanvasPanel({ idea }: Props) {
  const {
    canvas,
    loading,
    error,
    generate,
    isTaskAvailable,
    loaded,
    selectedBlock,
    helpBlock,
    selectBlock,
    toggleHelp,
  } = useIdeaBusinessModelCanvas(idea)

  if (!loaded) return null

  const gapCount = canvas
    ? BMC_BLOCK_KEYS.filter((k) => isBmcGapHealth(canvas.blocks[k].health)).length
    : 0

  const activeBlock = selectedBlock && canvas ? canvas.blocks[selectedBlock] : null
  const activeMeta = selectedBlock ? bmcBlockMeta[selectedBlock] : null

  return (
    <Card className="overflow-hidden p-0" id="business-model-canvas">
      <div className="border-b border-alternate/50 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-micro text-tertiary/60">Modèle économique</div>
            <h2 className="mt-1 text-sm font-bold text-midnight">Business Model Canvas</h2>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-tertiary/65">
              Vue interactive des 9 blocs. Clique sur une case pour les détails — le{' '}
              <HelpCircle className="inline h-3.5 w-3.5 align-text-bottom" /> explique le bloc. Les
              zones en orange/rouge signalent des faiblesses ou manques.
            </p>
            {canvas && gapCount > 0 ? (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-900 ring-1 ring-amber-200/80">
                <AlertTriangle className="h-3.5 w-3.5" />
                {gapCount} bloc{gapCount > 1 ? 's' : ''} à risque
              </p>
            ) : null}
          </div>
          {isTaskAvailable ? (
            <Button type="button" variant="ghost" className="text-xs" disabled={loading} onClick={() => void generate()}>
              <RefreshCw className={cn('mr-1.5 h-3.5 w-3.5', loading && 'animate-spin')} />
              {loading ? 'Génération…' : canvas ? 'Mettre à jour' : 'Générer avec Steven'}
            </Button>
          ) : (
            <p className="text-xs text-tertiary/55">Clé API requise (Settings)</p>
          )}
        </div>
        {error ? <p className="mt-3 text-xs text-red-600/90">{error}</p> : null}
      </div>

      {!canvas ? (
        <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
          <Sparkles className="h-8 w-8 text-tertiary/30" />
          <p className="max-w-md text-sm text-tertiary/65">
            Steven peut remplir le canvas à partir de ta fiche et mettre en évidence ce qui manque
            encore dans le modèle.
          </p>
          {isTaskAvailable ? (
            <Button type="button" disabled={loading} onClick={() => void generate()}>
              {loading ? 'Génération…' : 'Générer le canvas'}
            </Button>
          ) : null}
        </div>
      ) : (
        <>
          {canvas.synthesis ? (
            <div className="border-b border-alternate/40 bg-mineral/25 px-5 py-3 text-sm leading-relaxed text-tertiary/80">
              <ProseText>{canvas.synthesis}</ProseText>
            </div>
          ) : null}

          <div className="overflow-x-auto p-3 sm:p-4">
            <div
              className="min-w-[640px] gap-1.5"
              style={BMC_GRID_STYLE as React.CSSProperties}
            >
              {BMC_BLOCK_KEYS.map((key) => {
                const meta = bmcBlockMeta[key]
                const block = canvas.blocks[key]
                const health = bmcHealthMeta[block.health]
                const isGap = isBmcGapHealth(block.health)
                const isSelected = selectedBlock === key
                const isHelp = helpBlock === key

                return (
                  <div
                    key={key}
                    style={{ gridArea: meta.gridArea }}
                    className={cn(
                      'relative flex min-h-[7rem] flex-col rounded-[--radius-sharp] border p-2.5 transition',
                      health.cellClass,
                      isSelected && 'ring-2 ring-primary/35 ring-offset-1 ring-offset-background',
                      isGap && !isSelected && 'shadow-sm'
                    )}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <button
                        type="button"
                        className="min-w-0 flex-1 text-left"
                        onClick={() => selectBlock(key)}
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn('h-2 w-2 shrink-0 rounded-full', health.dotClass)}
                            title={health.label}
                          />
                          <span className="text-micro font-semibold uppercase tracking-wide text-tertiary/70">
                            <span className="hidden sm:inline">{meta.label}</span>
                            <span className="sm:hidden">{meta.shortLabel}</span>
                          </span>
                        </div>
                      </button>
                      <button
                        type="button"
                        className={cn(
                          'shrink-0 rounded-full p-0.5 text-tertiary/45 transition hover:bg-background hover:text-midnight',
                          isHelp && 'bg-background text-primary'
                        )}
                        title="Qu'est-ce que ce bloc ?"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleHelp(key)
                        }}
                      >
                        <HelpCircle className="h-4 w-4" />
                      </button>
                    </div>

                    {isHelp ? (
                      <p className="mt-2 rounded-md border border-alternate/50 bg-background/90 p-2 text-[0.65rem] leading-relaxed text-tertiary/70">
                        {meta.help}
                      </p>
                    ) : (
                      <button type="button" className="mt-2 flex-1 text-left" onClick={() => selectBlock(key)}>
                        <SummaryBullets summary={block.summary} />
                        {isGap && block.gapNote ? (
                          <p className="mt-2 text-[0.65rem] font-medium leading-snug text-amber-900/85">
                            ⚠ {block.gapNote}
                          </p>
                        ) : null}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {activeBlock && activeMeta ? (
            <div className="border-t border-alternate/50 bg-background px-5 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-midnight">{activeMeta.label}</span>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-micro font-semibold',
                    bmcHealthMeta[activeBlock.health].cellClass
                  )}
                >
                  {bmcHealthMeta[activeBlock.health].label}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-tertiary/85">
                <ProseText>{activeBlock.detail}</ProseText>
              </p>
              {activeBlock.gapNote ? (
                <div className="mt-3 rounded-[--radius-sharp] border border-amber-200/80 bg-amber-50/70 px-3 py-2 text-xs text-amber-950/90">
                  <span className="font-semibold">Manque / faiblesse : </span>
                  <ProseText>{activeBlock.gapNote}</ProseText>
                </div>
              ) : null}
            </div>
          ) : null}

          {canvas.overallGaps.length > 0 ? (
            <div className="border-t border-alternate/40 bg-red-50/30 px-5 py-4">
              <div className="text-micro font-semibold text-red-800/80">Faiblesses transverses</div>
              <ul className="mt-2 space-y-1.5">
                {canvas.overallGaps.map((gap) => (
                  <li key={gap} className="flex gap-2 text-xs leading-relaxed text-red-950/75">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500/80" />
                    <ProseText>{gap}</ProseText>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      )}
    </Card>
  )
}
