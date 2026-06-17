import * as React from 'react'
import { Check, X } from 'lucide-react'
import type { AIProvider, AISettings } from '../../types/ai'
import { Card } from '../../components/ui/Card'
import { Field } from '../../components/ui/Field'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { PROVIDER_HINTS, PROVIDER_LABELS } from '../ai/providers'

const CONFIGURABLE_PROVIDERS: AIProvider[] = ['openai', 'google', 'perplexity']

type Props = {
  settings: AISettings
  onSave: (next: AISettings) => Promise<void>
  onTest: (provider: AIProvider, apiKey: string) => Promise<{ ok: boolean; error?: string }>
}

export function APIKeysSettings({ settings, onSave, onTest }: Props) {
  const [draftKeys, setDraftKeys] = React.useState<Partial<Record<AIProvider, string>>>({})
  const [testing, setTesting] = React.useState<AIProvider | null>(null)
  const [testError, setTestError] = React.useState<string | null>(null)

  const getDraftKey = (provider: AIProvider) =>
    draftKeys[provider] ?? settings.providers[provider]?.apiKey ?? ''

  async function handleTest(provider: AIProvider) {
    const apiKey = getDraftKey(provider).trim()
    if (!apiKey) return
    setTesting(provider)
    setTestError(null)
    const result = await onTest(provider, apiKey)
    if (!result.ok) setTestError(result.error ?? 'Échec du test')
    setTesting(null)
  }

  async function handleTogglePersist(checked: boolean) {
    await onSave({ ...settings, persistKeys: checked })
  }

  async function handleDefaultProvider(provider: AIProvider) {
    await onSave({ ...settings, defaultAnalysisProvider: provider })
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-bold text-midnight">Clés API</h2>
        <p className="mt-1 text-sm text-tertiary/70">
          Bring Your Own Key — tes clés restent sur cet appareil, chiffrées localement. Jamais
          envoyées à nos serveurs.
        </p>
      </div>

      <Card className="border-amber-500/30 bg-amber-500/5 p-4 text-sm text-tertiary/80">
        Ta clé reste sur cet appareil. Ne partage pas ton poste. Perplexity est recommandé pour le
        marché ; OpenAI ou Gemini pour l&apos;analyse.
      </Card>

      <div className="space-y-4">
        {CONFIGURABLE_PROVIDERS.map((provider) => {
          const config = settings.providers[provider]
          const status = config?.lastTestStatus

          return (
            <Card key={provider} className="space-y-3 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="font-semibold text-midnight">{PROVIDER_LABELS[provider]}</div>
                {status === 'ok' ? (
                  <span className="inline-flex items-center gap-1 text-xs text-primary">
                    <Check className="h-3.5 w-3.5" /> Connecté
                  </span>
                ) : status === 'error' ? (
                  <span className="inline-flex items-center gap-1 text-xs text-red-600">
                    <X className="h-3.5 w-3.5" /> Erreur
                  </span>
                ) : null}
              </div>

              <Field label="Clé API" hint={PROVIDER_HINTS[provider]}>
                <Input
                  type="password"
                  value={getDraftKey(provider)}
                  onChange={(e) =>
                    setDraftKeys((prev) => ({ ...prev, [provider]: e.target.value }))
                  }
                  placeholder="••••••••••••••••"
                  autoComplete="off"
                />
              </Field>

              <Button
                type="button"
                variant="ghost"
                disabled={!getDraftKey(provider).trim() || testing === provider}
                onClick={() => void handleTest(provider)}
              >
                {testing === provider ? 'Test en cours…' : 'Tester la connexion'}
              </Button>
            </Card>
          )
        })}
      </div>

      {testError ? <p className="text-sm text-red-600">{testError}</p> : null}

      <Card className="space-y-4 p-4 sm:p-5">
        <Field label="Provider par défaut pour l'analyse">
          <Select
            value={settings.defaultAnalysisProvider}
            onChange={(e) => void handleDefaultProvider(e.target.value as AIProvider)}
          >
            <option value="openai">OpenAI</option>
            <option value="google">Google Gemini</option>
            <option value="perplexity">Perplexity</option>
          </Select>
        </Field>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-tertiary/80">
          <input
            type="checkbox"
            checked={settings.persistKeys}
            onChange={(e) => void handleTogglePersist(e.target.checked)}
            className="rounded border-alternate"
          />
          Persister les clés (décocher = session uniquement)
        </label>
      </Card>
    </section>
  )
}
