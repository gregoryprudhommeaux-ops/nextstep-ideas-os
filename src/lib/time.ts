import { Timestamp } from 'firebase/firestore'

export function nowTimestamp(): Timestamp {
  return Timestamp.now()
}

export function currentWeekLabel(): string {
  const d = new Date()
  const start = new Date(d.getFullYear(), 0, 1)
  const days = Math.floor((d.getTime() - start.getTime()) / 86_400_000)
  const week = Math.ceil((days + start.getDay() + 1) / 7)
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`
}

/** Format Firestore timestamp for Steven evolution UI. */
export function formatEvolutionTimestamp(ts: Timestamp): string {
  const d = ts.toDate()
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d)
}
