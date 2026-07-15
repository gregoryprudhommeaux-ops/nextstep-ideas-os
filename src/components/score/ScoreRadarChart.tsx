import type { ScoreDimension } from '../../types/domain'
import { dimensionMeta } from '../../features/scoring/dimensions'

export type RadarPoint = {
  key: ScoreDimension
  label: string
  shortLabel: string
  value: number
  /** 0–100 for polygon (penalties inverted so high = better). */
  chartValue: number
  kind: 'positive' | 'penalty' | 'boolean'
}

const SIZE = 380
const CX = SIZE / 2
const CY = SIZE / 2
const RADIUS = 118
const LABEL_RADIUS = RADIUS + 36

function polar(cx: number, cy: number, radius: number, angle: number, t: number) {
  const r = radius * Math.max(0, Math.min(1, t / 100))
  return {
    x: cx + r * Math.sin(angle),
    y: cy - r * Math.cos(angle),
  }
}

function polygonPath(points: { x: number; y: number }[]) {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ') + ' Z'
}

function labelAnchor(angle: number): 'start' | 'middle' | 'end' {
  const x = Math.sin(angle)
  if (x > 0.35) return 'start'
  if (x < -0.35) return 'end'
  return 'middle'
}

function labelDy(angle: number): number {
  const y = -Math.cos(angle)
  if (y > 0.6) return 4
  if (y < -0.6) return -2
  return 2
}

export function buildRadarPoints(
  breakdown: Partial<Record<ScoreDimension, number>>,
  order: ScoreDimension[]
): RadarPoint[] {
  return order
    .filter((key) => breakdown[key] != null)
    .map((key) => {
      const meta = dimensionMeta[key]
      const value = breakdown[key] ?? 0
      const chartValue = meta.kind === 'penalty' ? 100 - value : value
      return {
        key,
        label: meta.label,
        shortLabel: meta.shortLabel,
        value,
        chartValue,
        kind: meta.kind,
      }
    })
}

type Props = {
  points: RadarPoint[]
}

export function ScoreRadarChart({ points }: Props) {
  if (points.length < 3) return null

  const n = points.length
  const angles = points.map((_, i) => (2 * Math.PI * i) / n - Math.PI / 2)
  const dataPts = points.map((p, i) => polar(CX, CY, RADIUS, angles[i], p.chartValue))
  const benchmarkPts = angles.map((a) => polar(CX, CY, RADIUS, a, 60))
  const gridLevels = [25, 50, 75, 100]

  return (
    <div className="w-full">
      <div className="rounded-[--radius-card] border border-alternate/60 bg-mineral/60 p-3 sm:p-4">
        <div className="text-micro text-tertiary/55">Profil radar</div>
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="mx-auto mt-2 h-auto w-full max-w-[360px]"
          role="img"
          aria-label="Diagramme radar des scores"
        >
          <defs>
            <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.08" />
            </radialGradient>
            <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="var(--color-midnight)" floodOpacity="0.08" />
            </filter>
          </defs>

          <circle cx={CX} cy={CY} r={RADIUS + 8} fill="var(--color-background)" stroke="var(--color-alternate)" strokeOpacity="0.35" />

          {gridLevels.map((level) => {
            const ring = angles.map((a) => polar(CX, CY, RADIUS, a, level))
            return (
              <path
                key={level}
                d={polygonPath(ring)}
                fill="none"
                stroke="var(--color-midnight)"
                strokeOpacity={level === 100 ? 0.14 : 0.07}
                strokeWidth={level === 100 ? 1.25 : 1}
              />
            )
          })}

          {angles.map((a, i) => {
            const outer = polar(CX, CY, RADIUS, a, 100)
            return (
              <line
                key={points[i].key}
                x1={CX}
                y1={CY}
                x2={outer.x}
                y2={outer.y}
                stroke="var(--color-midnight)"
                strokeOpacity={0.1}
                strokeWidth={1}
              />
            )
          })}

          <path
            d={polygonPath(benchmarkPts)}
            fill="none"
            stroke="var(--color-tertiary)"
            strokeOpacity={0.35}
            strokeWidth={1}
            strokeDasharray="4 4"
          />

          <path
            d={polygonPath(dataPts)}
            fill="url(#radarFill)"
            stroke="var(--color-primary)"
            strokeWidth={2.5}
            strokeLinejoin="round"
            filter="url(#radarGlow)"
          />

          {dataPts.map((pt, i) => (
            <g key={points[i].key}>
              <circle cx={pt.x} cy={pt.y} r={5} fill="var(--color-background)" stroke="var(--color-midnight)" strokeOpacity="0.2" />
              <circle cx={pt.x} cy={pt.y} r={3.5} fill="var(--color-primary)" stroke="var(--color-background)" strokeWidth={1.5} />
            </g>
          ))}

          {gridLevels.slice(0, -1).map((level) => {
            const tick = polar(CX, CY, RADIUS, 0, level)
            return (
              <text
                key={level}
                x={tick.x + 6}
                y={tick.y}
                className="fill-tertiary/45 text-[8px] tabular-nums"
              >
                {level}
              </text>
            )
          })}

          {points.map((p, i) => {
            const a = angles[i]
            const lp = polar(CX, CY, LABEL_RADIUS, a, 100)
            const anchor = labelAnchor(a)
            const score10 = Math.round(p.value / 10)
            return (
              <g key={p.key}>
                <rect
                  x={lp.x + (anchor === 'end' ? -52 : anchor === 'middle' ? -26 : 0)}
                  y={lp.y + labelDy(a) - 10}
                  width={52}
                  height={18}
                  rx={3}
                  fill="var(--color-background)"
                  fillOpacity={0.92}
                  stroke="var(--color-alternate)"
                  strokeOpacity={0.5}
                />
                <text
                  x={lp.x + (anchor === 'end' ? -26 : anchor === 'middle' ? 0 : 26)}
                  y={lp.y + labelDy(a)}
                  textAnchor={anchor}
                  className="fill-midnight text-[9px] font-semibold"
                >
                  <title>{`${p.label}: ${score10}/10${p.kind === 'penalty' ? ' (pénalité inversée)' : ''}`}</title>
                  {p.shortLabel} · {score10}
                </text>
              </g>
            )
          })}
        </svg>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] text-tertiary/55">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-sm bg-primary/70" />
            Score idée
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0 w-4 border-t border-dashed border-tertiary/50" />
            Référence 6/10
          </span>
          <span>Pénalités inversées</span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {points.map((p) => {
          const score10 = Math.round(p.value / 10)
          return (
            <div
              key={p.key}
              className="flex items-center justify-between gap-2 rounded-[--radius-sharp] border border-alternate/40 bg-background px-2 py-1.5"
            >
              <span className="truncate text-[10px] text-tertiary/70">{p.shortLabel}</span>
              <span className="shrink-0 text-[10px] font-semibold tabular-nums text-midnight">
                {score10}/10
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
