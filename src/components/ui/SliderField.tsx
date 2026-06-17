import { cn } from '../../lib/cn'

export function SliderField({
  label,
  value,
  onChange,
  min = 1,
  max = 10,
  hint,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  hint?: string
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium text-tertiary/80">{label}</span>
        <span className="text-xs font-bold tabular-nums text-midnight">{value}/{max}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(
          'mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-alternate/50',
          '[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none',
          '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary'
        )}
      />
      {hint ? <p className="mt-1 text-[11px] text-tertiary/50">{hint}</p> : null}
    </div>
  )
}
