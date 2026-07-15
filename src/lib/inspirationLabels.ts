import type { InspirationKind } from '../types/domain'

export const inspirationKindLabels: Record<InspirationKind, string> = {
  website: 'Site web',
  google_drive: 'Google Drive (Slides / Doc)',
  pdf: 'Lien PDF',
  conversation: 'Extrait de conversation',
  screenshot: 'Screenshot / image',
  voice_note: 'Note vocale',
}

export const inspirationKindHints: Record<InspirationKind, string> = {
  website: 'https://exemple.com',
  google_drive: 'Colle un lien partagé Google Drive ou Slides',
  pdf: 'Lien direct vers un PDF (Drive, Dropbox, etc.)',
  conversation: 'Colle l’échange ou les notes d’appel qui ont déclenché l’idée',
  screenshot: 'Lien vers une image (Drive, Notion, imgur…)',
  voice_note: 'Lien vers un fichier audio (Drive, Dropbox, Voice Memos…)',
}

export function inspirationUsesUrl(kind: InspirationKind): boolean {
  return kind !== 'conversation'
}
