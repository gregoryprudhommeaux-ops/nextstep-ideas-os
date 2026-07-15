import { Fragment } from 'react'
import { cn } from '../lib/cn'
import { getCitationUrl } from '../lib/citations'

type Props = {
  text: string
  citations?: string[]
  className?: string
}

export function CitationText({ text, citations = [], className }: Props) {
  const parts = text.split(/(\[\d+\])/g)

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const match = part.match(/^\[(\d+)\]$/)
        if (!match) return <Fragment key={index}>{part}</Fragment>

        const citationNumber = parseInt(match[1], 10)
        const url = getCitationUrl(citations, citationNumber)
        if (!url) {
          return (
            <span
              key={index}
              className="font-medium text-tertiary/50"
              title="Source non disponible — relance la recherche"
            >
              [{match[1]}]
            </span>
          )
        }

        return (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex items-baseline font-semibold text-primary underline decoration-primary/50 underline-offset-2',
              'hover:decoration-primary'
            )}
            title={url}
          >
            [{match[1]}]
          </a>
        )
      })}
    </span>
  )
}
