import type { InspirationKind } from '../types/domain'

export const inspirationKindLabels: Record<InspirationKind, string> = {
  website: 'Website',
  google_drive: 'Google Drive (Slides / Doc)',
  pdf: 'PDF link',
  conversation: 'Conversation excerpt',
  screenshot: 'Screenshot / image link',
  voice_note: 'Voice note link',
}

export const inspirationKindHints: Record<InspirationKind, string> = {
  website: 'https://example.com',
  google_drive: 'Paste a share link from Google Drive or Slides',
  pdf: 'Direct link to a PDF (Drive, Dropbox, etc.)',
  conversation: 'Paste the chat or call notes that sparked the idea',
  screenshot: 'Link to an image (Drive, Notion, imgur…)',
  voice_note: 'Link to an audio file on Drive, Dropbox, or Voice Memos sync',
}

export function inspirationUsesUrl(kind: InspirationKind): boolean {
  return kind !== 'conversation'
}
