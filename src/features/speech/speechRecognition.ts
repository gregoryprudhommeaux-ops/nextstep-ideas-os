type SpeechRecognitionInstance = {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
}

export function isSpeechRecognitionSupported(): boolean {
  return Boolean(getSpeechRecognitionCtor())
}

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | undefined {
  return window.SpeechRecognition ?? window.webkitSpeechRecognition
}

export function createSpeechRecognition(): SpeechRecognitionInstance | null {
  const Ctor = getSpeechRecognitionCtor()
  return Ctor ? new Ctor() : null
}

export function speechErrorMessage(code: string): string {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Micro refusé. Autorise l’accès au micro dans les réglages du navigateur.'
    case 'no-speech':
      return 'Aucune voix détectée. Réessaie en parlant plus près du micro.'
    case 'audio-capture':
      return 'Micro indisponible. Vérifie qu’aucune autre app ne l’utilise.'
    case 'network':
      return 'Erreur réseau pendant la dictée. Vérifie ta connexion.'
    case 'aborted':
      return 'Dictée interrompue.'
    default:
      return 'Dictée impossible. Utilise Chrome ou Safari.'
  }
}
