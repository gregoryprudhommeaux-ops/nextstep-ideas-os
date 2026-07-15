import { Mic, MicOff } from 'lucide-react'
import { cn } from '../../lib/cn'
import { Button } from '../../components/ui/Button'
import { SPEECH_LANGUAGES, type SpeechLanguageCode } from './speechLanguages'
import { useSpeechDictation } from './useSpeechDictation'

type Props = {
  disabled?: boolean
  onAppend: (text: string) => void
  className?: string
}

export function SpeechDictationBar({ disabled, onAppend, className }: Props) {
  const { isSupported, isListening, language, setLanguage, interimText, error, toggle } =
    useSpeechDictation({ onAppend, disabled })

  if (!isSupported) {
    return (
      <p className={cn('text-xs text-tertiary/55', className)}>
        Dictée vocale : utilise Chrome ou Safari pour dicter à l&apos;oral.
      </p>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor="speech-lang">
          Langue de dictée
        </label>
        <select
          id="speech-lang"
          value={language}
          disabled={disabled}
          onChange={(e) => setLanguage(e.target.value as SpeechLanguageCode)}
          className="rounded-[--radius-sharp] border border-alternate/70 bg-background px-2.5 py-1.5 text-xs text-midnight focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
        >
          {SPEECH_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>

        <Button
          type="button"
          variant={isListening ? 'primary' : 'ghost'}
          disabled={disabled}
          onClick={toggle}
          className={cn('h-8 gap-1.5 px-3 text-xs', isListening && 'ring-2 ring-primary/30')}
          aria-pressed={isListening}
        >
          {isListening ? (
            <>
              <MicOff className="h-3.5 w-3.5" />
              Arrêter
            </>
          ) : (
            <>
              <Mic className="h-3.5 w-3.5" />
              Dicter
            </>
          )}
        </Button>

        {isListening ? (
          <span className="flex items-center gap-1.5 text-xs text-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Écoute…
          </span>
        ) : null}
      </div>

      {interimText ? (
        <p className="text-xs italic text-tertiary/60">&ldquo;{interimText}&rdquo;</p>
      ) : null}

      {error ? <p className="text-xs text-red-800/90">{error}</p> : null}
    </div>
  )
}
