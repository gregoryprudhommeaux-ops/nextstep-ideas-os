import * as React from 'react'
import { Check, X } from 'lucide-react'
import type { AIProvider, AISettings } from '../../types/ai'
import { Card } from '../../components/ui/Card'
import { Field } from '../../components/ui/Field'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { isAnthropicRelayConfigured } from '../ai/providers/anthropic'
import { PROVIDER_HINTS, PROVIDER_LABELS } from '../ai/providers'

function getConfigurableProviders(): AIProvider[] {
  const providers: AIProvider[] = ['openai', 'google', 'perplexity']
  if (isAnthropicRelayConfigured()) providers.push('anthropic')
  return providers
}

type Props = {
  settings: AISettings
  onSave: (next: AISettings) => Promise<void>
  onTest: (provider: AIProvider, apiKey: string) => Promise<{ ok: boolean; error?: string }>
}

export function APIKeysSettings({ settings, onSave, onTest }: Props) {
  const providers = React.useMemo(() => getConfigurableProviders(), [])
  const [selected, setSelected] = React.useState<AIProvider>(
    settings.defaultAnalysisProvider && providers.includes(settings.defaultAnalysisProvider)
      ? settings.defaultAnalysisProvider
      : 'openai'
  )
  const [draftKeys, setDraftKeys] = React.useState<Partial<Record<AIProvider, string>>>({})
  const [testing, setTesting] = React.useState(false)
  const [testError, setTestError] = React.useState<string | null>(null)

  const getDraftKey = (provider: AIProvider) =>
    draftKeys[provider] ?? settings.providers[provider]?.apiKey ?? ''

  const selectedConfig = settings.providers[selected]
  const selectedStatus = selectedConfig?.lastTestStatus
  const currentKey = getDraftKey(selected)

  async function handleTest() {
    const apiKey = currentKey.trim()
    if (!apiKey) return
    setTesting(true)
    setTestError(null)
    const result = await onTest(selected, apiKey)
    if (!result.ok) setTestError(result.error ?? 'Échec du test')
    setTesting(false)
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
        Choisis une plateforme, colle ta clé, teste la connexion. Perplexity pour le marché ;
        OpenAI ou Gemini pour l&apos;analyse.
      </Card>

      <Card className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <Field label="Plateforme" className="min-w-[12rem] flex-1">
            <Select
              value={selected}
              onChange={(e) => {
                setSelected(e.target.value as AIProvider)
                setTestError(null)
              }}
            >
              {providers.map((provider) => (
                <option key={provider} value={provider}>
                  {PROVIDER_LABELS[provider]}
                </option>
              ))}
            </Select>
          </Field>

          {selectedStatus === 'ok' ? (
            <span className="inline-flex items-center gap-1 pt-6 text-xs text-primary">
              <Check className="h-3.5 w-3.5" /> Connecté
            </span>
          ) : selectedStatus === 'error' ? (
            <span className="inline-flex items-center gap-1 pt-6 text-xs text-red-600">
              <X className="h-3.5 w-3.5" /> Erreur
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {providers.map((provider) => {
            const status = settings.providers[provider]?.lastTestStatus
            if (status !== 'ok') return null
            return (
              <span
                key={provider}
                className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-midnight"
              >
                {PROVIDER_LABELS[provider].split(' ')[0]} ✓
              </span>
            )
          })}
        </div>

        <Field label="Clé API" hint={PROVIDER_HINTS[selected]}>
          <Input
            type="password"
            value={currentKey}
            onChange={(e) => setDraftKeys((prev) => ({ ...prev, [selected]: e.target.value }))}
            placeholder="••••••••••••••••"
            autoComplete="off"
          />
        </Field>

        <Button
          type="button"
          variant="ghost"
          disabled={!currentKey.trim() || testing}
          onClick={() => void handleTest()}
        >
          {testing ? 'Test en cours…' : 'Tester la connexion'}
        </Button>

        {testError ? <p className="text-sm text-red-600">{testError}</p> : null}

        <div className="border-t border-alternate/50 pt-4">
          <Field label="Provider par défaut pour l'analyse">
            <Select
              value={settings.defaultAnalysisProvider}
              onChange={(e) => void handleDefaultProvider(e.target.value as AIProvider)}
            >
              {providers.map((provider) => (
                <option key={provider} value={provider}>
                  {PROVIDER_LABELS[provider]}
                </option>
              ))}
            </Select>
          </Field>
        </div>

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
