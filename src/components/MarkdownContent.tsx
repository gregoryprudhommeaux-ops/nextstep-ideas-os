import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-midnight">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="rounded bg-mineral px-1 py-0.5 font-mono text-[0.85em]">
          {part.slice(1, -1)}
        </code>
      )
    }
    return part
  })
}

function renderBlock(block: string, key: number) {
  const lines = block.split('\n')
  const nodes: ReactNode[] = []
  let listItems: string[] = []

  const flushList = () => {
    if (listItems.length === 0) return
    nodes.push(
      <ul key={`${key}-ul-${nodes.length}`} className="my-2 list-disc space-y-1 pl-5">
        {listItems.map((item, idx) => (
          <li key={idx}>{renderInline(item)}</li>
        ))}
      </ul>
    )
    listItems = []
  }

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      flushList()
      continue
    }
    if (/^[-*]\s+/.test(trimmed)) {
      listItems.push(trimmed.replace(/^[-*]\s+/, ''))
      continue
    }
    flushList()
    if (trimmed.startsWith('### ')) {
      nodes.push(
        <h4 key={`${key}-h4-${nodes.length}`} className="mt-3 text-sm font-bold text-midnight">
          {renderInline(trimmed.slice(4))}
        </h4>
      )
    } else if (trimmed.startsWith('## ')) {
      nodes.push(
        <h3 key={`${key}-h3-${nodes.length}`} className="mt-3 text-base font-bold text-midnight">
          {renderInline(trimmed.slice(3))}
        </h3>
      )
    } else if (trimmed.startsWith('# ')) {
      nodes.push(
        <h2 key={`${key}-h2-${nodes.length}`} className="mt-3 text-lg font-bold text-midnight">
          {renderInline(trimmed.slice(2))}
        </h2>
      )
    } else {
      nodes.push(
        <p key={`${key}-p-${nodes.length}`} className="leading-relaxed">
          {renderInline(trimmed)}
        </p>
      )
    }
  }
  flushList()
  return <div key={key}>{nodes}</div>
}

type Props = {
  content: string
  className?: string
}

export function MarkdownContent({ content, className }: Props) {
  const parts = content.split(/(```[\s\S]*?```)/g)

  return (
    <div className={cn('space-y-2 text-sm text-tertiary/85', className)}>
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          const inner = part.replace(/^```\w*\n?/, '').replace(/```$/, '').trim()
          return (
            <pre
              key={index}
              className="overflow-x-auto rounded-[--radius-sharp] border border-alternate/50 bg-mineral/80 p-3 font-mono text-xs leading-relaxed text-midnight"
            >
              {inner}
            </pre>
          )
        }
        if (!part.trim()) return null
        return renderBlock(part.trim(), index)
      })}
    </div>
  )
}
