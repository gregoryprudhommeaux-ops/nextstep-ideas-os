import { useState } from 'react'
import type { PortfolioVerdict } from '../../types/ai'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Textarea } from '../../components/ui/Textarea'
import { Field } from '../../components/ui/Field'
import { Select } from '../../components/ui/Select'
import { VERDICT_LABELS, provisionalTitleFromRaw } from './applyVerdict'
import { useAppStore, EMPTY_IDEAS } from '../../app/store'

type Props = {
  onSubmit: (input: {
    rawInput: string
    verdict: PortfolioVerdict
    targetIdeaId?: string
    title: string
  }) => void
}

export function ManualClassification({ onSubmit }: Props) {
  const ideas = useAppStore((s) => s.data?.ideas ?? EMPTY_IDEAS)
  const [rawInput, setRawInput] = useState('')
  const [verdict, setVerdict] = useState<PortfolioVerdict>('new')
  const [targetIdeaId, setTargetIdeaId] = useState('')

  const needsTarget = verdict === 'extension' || verdict === 'variant'

  function handleSubmit() {
    const title = provisionalTitleFromRaw(rawInput)
    onSubmit({
      rawInput: rawInput.trim(),
      verdict,
      targetIdeaId: needsTarget ? targetIdeaId : undefined,
      title,
    })
  }

  return (
    <Card className="space-y-4 p-5">
      <p className="text-sm text-tertiary/70">
        Mode manuel — capture ta pensée et classe-la toi-même.
      </p>
      <Textarea
        value={rawInput}
        onChange={(e) => setRawInput(e.target.value)}
        placeholder="Décris ton idée du moment…"
        rows={5}
        className="min-h-[120px]"
      />

      <Field label="Classification">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(VERDICT_LABELS) as PortfolioVerdict[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVerdict(v)}
              className={`rounded-[--radius-sharp] border px-3 py-1.5 text-xs font-medium transition ${
                verdict === v
                  ? 'border-primary bg-primary/10 text-midnight'
                  : 'border-alternate/70 text-tertiary/70 hover:border-alternate'
              }`}
            >
              {VERDICT_LABELS[v]}
            </button>
          ))}
        </div>
      </Field>

      {needsTarget && ideas.length > 0 ? (
        <Field label="Idée liée">
          <Select value={targetIdeaId} onChange={(e) => setTargetIdeaId(e.target.value)}>
            <option value="">Choisir une idée…</option>
            {ideas.map((i) => (
              <option key={i.id} value={i.id}>
                {i.title}
              </option>
            ))}
          </Select>
        </Field>
      ) : null}

      <div className="flex justify-end">
        <Button
          type="button"
          disabled={rawInput.trim().length < 10 || (needsTarget && !targetIdeaId)}
          onClick={handleSubmit}
        >
          Enregistrer
        </Button>
      </div>
    </Card>
  )
}
