import { useState } from 'react'
import type { ClarifyingQuestion } from '../../types/ai'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Textarea } from '../../components/ui/Textarea'
import { cn } from '../../lib/cn'

const UNSURE_ID = 'unsure'

type Props = {
  questions: ClarifyingQuestion[]
  onSubmit: (answers: Record<string, string>) => void
  onBack: () => void
  loading?: boolean
}

export function ClarifyingDialog({ questions, onSubmit, onBack, loading }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({})

  function setAnswer(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const allAnswered = questions.every((q) => answers[q.id]?.trim())

  return (
    <div className="space-y-4">
      {questions.map((q) => (
        <Card key={q.id} className="space-y-3 p-5">
          <p className="text-sm font-medium text-midnight">{q.text}</p>
          <div className="space-y-2">
            {q.options.map((opt) => {
              const selected = answers[q.id] === opt.label
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAnswer(q.id, opt.label)}
                  className={cn(
                    'w-full rounded-[--radius-sharp] border px-3 py-2.5 text-left text-sm transition',
                    selected
                      ? 'border-primary bg-primary/10 text-midnight'
                      : 'border-alternate/70 text-tertiary/80 hover:border-alternate'
                  )}
                >
                  {opt.label}
                </button>
              )
            })}
            <button
              type="button"
              onClick={() => setAnswer(q.id, 'Je ne sais pas encore')}
              className={cn(
                'w-full rounded-[--radius-sharp] border px-3 py-2.5 text-left text-sm transition',
                answers[q.id] === 'Je ne sais pas encore'
                  ? 'border-primary bg-primary/10 text-midnight'
                  : 'border-dashed border-alternate/70 text-tertiary/60 hover:border-alternate'
              )}
            >
              Je ne sais pas encore
            </button>
          </div>
          {q.allowFreeText && answers[q.id] && answers[q.id] !== UNSURE_ID ? (
            <Textarea
              rows={2}
              placeholder="Précise si tu veux…"
              className="text-sm"
              onChange={(e) => {
                const base = answers[q.id]
                setAnswer(q.id, e.target.value.trim() ? `${base} — ${e.target.value}` : base)
              }}
            />
          ) : null}
        </Card>
      ))}

      <div className="flex justify-between gap-3">
        <Button type="button" variant="ghost" onClick={onBack} disabled={loading}>
          Retour
        </Button>
        <Button
          type="button"
          disabled={!allAnswered || loading}
          onClick={() => onSubmit(answers)}
        >
          {loading ? 'Analyse…' : 'Continuer'}
        </Button>
      </div>
    </div>
  )
}
