import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createSpeechRecognition,
  isSpeechRecognitionSupported,
  speechErrorMessage,
} from './speechRecognition'
import {
  getStoredSpeechLanguage,
  storeSpeechLanguage,
  type SpeechLanguageCode,
} from './speechLanguages'

type Options = {
  onAppend: (text: string) => void
  disabled?: boolean
}

export function useSpeechDictation({ onAppend, disabled }: Options) {
  const [language, setLanguageState] = useState<SpeechLanguageCode>(getStoredSpeechLanguage)
  const [isListening, setIsListening] = useState(false)
  const [interimText, setInterimText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<ReturnType<typeof createSpeechRecognition>>(null)
  const wantsListeningRef = useRef(false)

  const isSupported = isSpeechRecognitionSupported()

  const stop = useCallback(() => {
    wantsListeningRef.current = false
    recognitionRef.current?.stop()
    setIsListening(false)
    setInterimText('')
  }, [])

  const setLanguage = useCallback(
    (code: SpeechLanguageCode) => {
      storeSpeechLanguage(code)
      setLanguageState(code)
      if (isListening) stop()
    },
    [isListening, stop]
  )

  const start = useCallback(() => {
    if (disabled || !isSupported) return

    setError(null)
    const recognition = createSpeechRecognition()
    if (!recognition) {
      setError('Dictée vocale non supportée dans ce navigateur.')
      return
    }

    recognitionRef.current = recognition
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = language

    recognition.onresult = (event) => {
      let interim = ''
      let finals = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0]?.transcript ?? ''
        if (event.results[i].isFinal) finals += transcript
        else interim += transcript
      }
      if (finals.trim()) onAppend(finals.trim())
      setInterimText(interim.trim())
    }

    recognition.onerror = (event) => {
      if (event.error === 'aborted') return
      setError(speechErrorMessage(event.error))
      wantsListeningRef.current = false
      setIsListening(false)
      setInterimText('')
    }

    recognition.onend = () => {
      setInterimText('')
      if (wantsListeningRef.current) {
        try {
          recognition.start()
        } catch {
          wantsListeningRef.current = false
          setIsListening(false)
        }
        return
      }
      setIsListening(false)
    }

    try {
      wantsListeningRef.current = true
      recognition.start()
      setIsListening(true)
    } catch {
      wantsListeningRef.current = false
      setError('Impossible de démarrer la dictée. Réessaie.')
    }
  }, [disabled, isSupported, language, onAppend])

  const toggle = useCallback(() => {
    if (isListening) stop()
    else start()
  }, [isListening, start, stop])

  useEffect(() => {
    return () => {
      wantsListeningRef.current = false
      recognitionRef.current?.abort()
    }
  }, [])

  return {
    isSupported,
    isListening,
    language,
    setLanguage,
    interimText,
    error,
    toggle,
    stop,
  }
}
