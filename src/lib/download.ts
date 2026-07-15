export function downloadTextFile(filename: string, content: string, mime = 'text/markdown;charset=utf-8') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function extractMarkdownBlocks(text: string): string[] {
  const blocks: string[] = []
  const regex = /```(?:markdown|md)?\s*\n([\s\S]*?)```/gi
  let match: RegExpExecArray | null
  while ((match = regex.exec(text)) !== null) {
    const block = match[1]?.trim()
    if (block) blocks.push(block)
  }
  return blocks
}

export function formatBrainstormTranscript(
  ideaTitle: string,
  messages: { role: 'user' | 'assistant'; content: string }[]
): string {
  const header = `# Brainstorming — ${ideaTitle}\n\n`
  const body = messages
    .map((m) => `## ${m.role === 'user' ? 'Toi' : 'Steven'}\n\n${m.content}`)
    .join('\n\n---\n\n')
  return header + body
}
