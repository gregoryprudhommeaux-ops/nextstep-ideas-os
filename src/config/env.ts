export function getEnv(key: string): string | undefined {
  return (import.meta.env[key] as string | undefined) ?? undefined
}

export function requireEnv(key: string): string {
  const v = getEnv(key)
  if (!v) throw new Error(`Missing env: ${key}`)
  return v
}

export const allowedEmails = new Set(
  (getEnv('VITE_ALLOWED_EMAILS') ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
)

export function isFirebaseConfigured(): boolean {
  return Boolean(
    getEnv('VITE_FIREBASE_API_KEY') &&
      getEnv('VITE_FIREBASE_AUTH_DOMAIN') &&
      getEnv('VITE_FIREBASE_PROJECT_ID') &&
      getEnv('VITE_FIREBASE_STORAGE_BUCKET') &&
      getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID') &&
      getEnv('VITE_FIREBASE_APP_ID')
  )
}

