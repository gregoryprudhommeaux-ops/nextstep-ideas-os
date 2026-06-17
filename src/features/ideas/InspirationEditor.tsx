import * as React from 'react'
import { Link2, MessageSquare, Trash2 } from 'lucide-react'
import type { IdeaInspiration, InspirationKind } from '../../types/domain'
import { Field } from '../../components/ui/Field'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { newId } from '../../lib/id'
import { nowTimestamp } from '../../lib/time'
import {
  inspirationKindHints,
  inspirationKindLabels,
  inspirationUsesUrl,
} from '../../lib/inspirationLabels'

const kinds = Object.keys(inspirationKindLabels) as InspirationKind[]

function emptyDraft(kind: InspirationKind = 'website'): IdeaInspiration {
  return {
    id: newId('insp'),
    kind,
    label: '',
    url: '',
    content: '',
    createdAt: nowTimestamp(),
  }
}

export function InspirationEditor({
  value,
  onChange,
}: {
  value: IdeaInspiration[]
  onChange: (next: IdeaInspiration[]) => void
}) {
  const [draft, setDraft] = React.useState<IdeaInspiration | null>(null)

  const addDraft = () => setDraft(emptyDraft())

  const commitDraft = () => {
    if (!draft) return
    const hasUrl = inspirationUsesUrl(draft.kind) && draft.url?.trim()
    const hasContent = draft.kind === 'conversation' && draft.content?.trim()
    if (!hasUrl && !hasContent) return
    onChange([
      ...value,
      {
        ...draft,
        label: draft.label?.trim() || undefined,
        url: draft.url?.trim() || undefined,
        content: draft.content?.trim() || undefined,
      },
    ])
    setDraft(null)
  }

  const remove = (id: string) => onChange(value.filter((i) => i.id !== id))

  return (
    <div className="space-y-3">
      {value.map((item) => (
        <div
          key={item.id}
          className="flex items-start justify-between gap-3 rounded-[--radius-sharp] border border-alternate/60 bg-mineral px-3 py-2.5"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-midnight">
              {item.kind === 'conversation' ? (
                <MessageSquare className="h-3.5 w-3.5 shrink-0 text-tertiary/60" />
              ) : (
                <Link2 className="h-3.5 w-3.5 shrink-0 text-tertiary/60" />
              )}
              {item.label || inspirationKindLabels[item.kind]}
            </div>
            {item.url ? (
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="mt-1 block truncate text-xs text-tertiary/75 underline-offset-2 hover:text-midnight hover:underline"
              >
                {item.url}
              </a>
            ) : null}
            {item.content ? (
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-tertiary/70">
                {item.content}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => remove(item.id)}
            className="shrink-0 rounded p-1 text-tertiary/50 hover:bg-background hover:text-midnight"
            aria-label="Remove"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}

      {draft ? (
        <div className="space-y-3 rounded-[--radius-card] border border-primary/25 bg-primary/5 p-4">
          <Field label="Type">
            <Select
              value={draft.kind}
              onChange={(e) =>
                setDraft((d) => (d ? { ...d, kind: e.target.value as InspirationKind } : d))
              }
            >
              {kinds.map((k) => (
                <option key={k} value={k}>
                  {inspirationKindLabels[k]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Label (optional)" hint="e.g. Competitor deck, Chat with Marc">
            <Input
              value={draft.label ?? ''}
              onChange={(e) => setDraft((d) => (d ? { ...d, label: e.target.value } : d))}
              placeholder="Short name"
            />
          </Field>
          {inspirationUsesUrl(draft.kind) ? (
            <Field label="Link" hint={inspirationKindHints[draft.kind]}>
              <Input
                type="url"
                value={draft.url ?? ''}
                onChange={(e) => setDraft((d) => (d ? { ...d, url: e.target.value } : d))}
                placeholder="https://"
              />
            </Field>
          ) : (
            <Field label="Conversation" hint={inspirationKindHints.conversation}>
              <Textarea
                value={draft.content ?? ''}
                onChange={(e) => setDraft((d) => (d ? { ...d, content: e.target.value } : d))}
                rows={4}
                placeholder="Paste the exchange or voice transcript…"
              />
            </Field>
          )}
          <div className="flex gap-2">
            <Button type="button" size="md" onClick={commitDraft}>
              Add source
            </Button>
            <Button type="button" variant="ghost" onClick={() => setDraft(null)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button type="button" variant="ghost" onClick={addDraft}>
          + Add inspiration source
        </Button>
      )}
    </div>
  )
}

export function InspirationList({ items }: { items: IdeaInspiration[] }) {
  if (!items.length) return null

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-[--radius-sharp] border border-alternate/60 bg-mineral px-4 py-3"
        >
          <div className="flex items-center gap-2 text-micro text-tertiary/55">
            {item.kind === 'conversation' ? (
              <MessageSquare className="h-3.5 w-3.5" />
            ) : (
              <Link2 className="h-3.5 w-3.5" />
            )}
            {inspirationKindLabels[item.kind]}
          </div>
          <div className="mt-1 text-sm font-semibold text-midnight">
            {item.label || 'Untitled source'}
          </div>
          {item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-xs text-tertiary/75 underline-offset-2 hover:text-midnight hover:underline"
            >
              Open link →
            </a>
          ) : null}
          {item.content ? (
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-tertiary/80">
              {item.content}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  )
}
