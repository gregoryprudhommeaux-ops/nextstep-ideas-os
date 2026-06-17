import type { AISettings } from '../../types/ai'
import { DEFAULT_AI_SETTINGS } from '../../types/ai'

const SETTINGS_KEY = 'nextstep-ai-settings-v1'

async function deriveKey(userId: string): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const material = await crypto.subtle.importKey(
    'raw',
    enc.encode(`nextstep-ai-${userId}`),
    'PBKDF2',
    false,
    ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: enc.encode('nextstep-salt-v1'), iterations: 100_000, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function saveAISettings(settings: AISettings, userId: string): Promise<void> {
  if (!settings.persistKeys) {
    sessionStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    localStorage.removeItem(SETTINGS_KEY)
    return
  }
  sessionStorage.removeItem(SETTINGS_KEY)
  const key = await deriveKey(userId)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const enc = new TextEncoder()
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(JSON.stringify(settings))
  )
  const payload = {
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(ciphertext)),
  }
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(payload))
}

export async function loadAISettings(userId: string): Promise<AISettings> {
  const session = sessionStorage.getItem(SETTINGS_KEY)
  if (session) {
    try {
      return JSON.parse(session) as AISettings
    } catch {
      return { ...DEFAULT_AI_SETTINGS }
    }
  }

  const raw = localStorage.getItem(SETTINGS_KEY)
  if (!raw) return { ...DEFAULT_AI_SETTINGS }

  try {
    const payload = JSON.parse(raw) as { iv: number[]; data: number[] }
    const key = await deriveKey(userId)
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(payload.iv) },
      key,
      new Uint8Array(payload.data)
    )
    return JSON.parse(new TextDecoder().decode(decrypted)) as AISettings
  } catch {
    return { ...DEFAULT_AI_SETTINGS }
  }
}

export function clearAISettings(): void {
  localStorage.removeItem(SETTINGS_KEY)
  sessionStorage.removeItem(SETTINGS_KEY)
}
