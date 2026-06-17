import { Textarea } from '../../components/ui/Textarea'
import { Button } from '../../components/ui/Button'

type Props = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
  loading?: boolean
}

export function ThoughtInput({ value, onChange, onSubmit, disabled, loading }: Props) {
  return (
    <div className="space-y-4">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="J'ai pensé à un outil qui aide les freelances à facturer via WhatsApp, ça rejoint un peu mon idée de back-office…"
        rows={6}
        className="min-h-[160px]"
        disabled={disabled}
      />
      <div className="flex justify-end">
        <Button
          type="button"
          disabled={disabled || loading || value.trim().length < 10}
          onClick={onSubmit}
        >
          {loading ? 'Steven réfléchit…' : 'Partager'}
        </Button>
      </div>
    </div>
  )
}
