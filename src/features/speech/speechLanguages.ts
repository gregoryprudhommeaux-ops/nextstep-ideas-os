export const SPEECH_LANGUAGES = [
  { code: 'fr-FR', label: 'Français' },
  { code: 'en-US', label: 'English' },
  { code: 'es-ES', label: 'Español' },
] as const

export type SpeechLanguageCode = (typeof SPEECH_LANGUAGES)[number]['code']

const STORAGE_KEY = 'nextstep-speech-lang'

export function getStoredSpeechLanguage(): SpeechLanguageCode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (SPEECH_LANGUAGES.some((l) => l.code === raw)) return raw as SpeechLanguageCode
  } catch {
    // ignore
  }
  return 'fr-FR'
}

export function storeSpeechLanguage(code: SpeechLanguageCode): void {
  try {
    localStorage.setItem(STORAGE_KEY, code)
  } catch {
    // ignore
  }
}
