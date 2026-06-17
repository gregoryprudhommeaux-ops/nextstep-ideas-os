export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-[--radius-card] border border-dashed border-alternate/70 bg-mineral px-4 py-8 text-center">
      <div className="text-sm font-semibold text-midnight">{title}</div>
      {description ? (
        <p className="mt-2 text-xs leading-relaxed text-tertiary/65">{description}</p>
      ) : null}
    </div>
  )
}
