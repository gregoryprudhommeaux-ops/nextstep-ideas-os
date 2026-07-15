import * as React from 'react'
import { Copy, Download, FilePenLine, MessageSquare, RotateCcw, Send } from 'lucide-react'
import type { Idea } from '../../types/domain'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Textarea } from '../../components/ui/Textarea'
import { MarkdownContent } from '../../components/MarkdownContent'
import { SpeechDictationBar } from '../speech/SpeechDictationBar'
import { appendDictationText } from '../speech/appendDictationText'
import {
  downloadTextFile,
  extractMarkdownBlocks,
  formatBrainstormTranscript,
} from '../../lib/download'
import { slugify } from '../../lib/id'
import { copyTextToClipboard } from '../../lib/clipboard'
import { cn } from '../../lib/cn'
import { IDEA_BRAINSTORM_QUICK_PROMPTS, useIdeaBrainstorm } from './useIdeaBrainstorm'

type Props = {
  idea: Idea
}

function formatMessageTime(ms: number): string {
  if (!ms) return ''
  return new Date(ms).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function IdeaBrainstormPanel({ idea }: Props) {
  const {
    thread,
    draft,
    setDraft,
    sendMessage,
    clearThread,
    syncToProject,
    loading,
    syncing,
    error,
    canSend,
    canSyncToProject,
    isTaskAvailable,
    isSyncAvailable,
    lastChangeSummary,
    loaded,
  } = useIdeaBrainstorm(idea)

  const scrollRef = React.useRef<HTMLDivElement>(null)
  const slug = slugify(idea.title) || 'idee'
  const [copiedMessageId, setCopiedMessageId] = React.useState<string | null>(null)

  const copyMessage = React.useCallback(async (messageId: string, content: string) => {
    const ok = await copyTextToClipboard(content)
    if (!ok) return
    setCopiedMessageId(messageId)
    window.setTimeout(() => setCopiedMessageId(null), 2000)
  }, [])

  const copyLastExchange = React.useCallback(async () => {
    const lastAssistant = [...thread].reverse().find((m) => m.role === 'assistant')
    if (!lastAssistant) return

    const lastAssistantIndex = thread.findIndex((m) => m.id === lastAssistant.id)
    const precedingUser = thread
      .slice(0, lastAssistantIndex)
      .reverse()
      .find((m) => m.role === 'user')

    const text = precedingUser
      ? `Toi:\n${precedingUser.content}\n\nSteven:\n${lastAssistant.content}`
      : lastAssistant.content

    const ok = await copyTextToClipboard(text)
    if (!ok) return
    setCopiedMessageId('last-exchange')
    window.setTimeout(() => setCopiedMessageId(null), 2000)
  }, [thread])

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [thread.length, loading])

  if (!loaded) return null

  const downloadTranscript = () => {
    if (thread.length === 0) return
    downloadTextFile(
      `${slug}-brainstorm.md`,
      formatBrainstormTranscript(idea.title, thread)
    )
  }

  return (
    <Card className="overflow-hidden p-0" id="brainstorming">
      <div className="border-b border-alternate/50 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-micro text-tertiary/60">Brainstorming</div>
            <h2 className="mt-1 text-sm font-bold text-midnight">Échanger avec Steven</h2>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-tertiary/65">
              Chat orienté livrables : PRD, prompts Cursor, plans Markdown téléchargeables pour
              poursuivre dans ton IA ou ton IDE.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {thread.length > 0 ? (
              <>
                <Button type="button" variant="ghost" className="text-xs" onClick={downloadTranscript}>
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Télécharger la conversation
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-xs"
                  disabled={loading}
                  onClick={clearThread}
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  Nouvelle conversation
                </Button>
              </>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {IDEA_BRAINSTORM_QUICK_PROMPTS.map((prompt) => (
            <Button
              key={prompt.label}
              type="button"
              variant="ghost"
              className="h-8 text-xs"
              disabled={loading || !isTaskAvailable}
              onClick={() => void sendMessage(prompt.message)}
            >
              {prompt.label}
            </Button>
          ))}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="max-h-[min(32rem,55vh)] space-y-4 overflow-y-auto bg-mineral/20 px-5 py-5"
      >
        {thread.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-sm text-tertiary/55">
            <MessageSquare className="h-8 w-8 text-tertiary/35" />
            <p>Pose une question ou choisis un raccourci ci-dessus pour démarrer.</p>
          </div>
        ) : (
          thread.map((message) => {
            const ms = message.createdAt.toMillis?.() ?? 0
            const artifacts =
              message.role === 'assistant' ? extractMarkdownBlocks(message.content) : []

            return (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[min(100%,42rem)] rounded-[--radius-card] border px-4 py-3 shadow-sm',
                    message.role === 'user'
                      ? 'border-primary/25 bg-primary/10'
                      : 'border-alternate/50 bg-background'
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-micro font-semibold text-tertiary/55">
                      {message.role === 'user' ? 'Toi' : 'Steven'}
                    </span>
                    {ms ? (
                      <span className="text-[0.65rem] text-tertiary/45">{formatMessageTime(ms)}</span>
                    ) : null}
                  </div>
                  <div className="mt-2">
                    {message.role === 'assistant' ? (
                      <MarkdownContent content={message.content} />
                    ) : (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-midnight">
                        {message.content}
                      </p>
                    )}
                  </div>
                  {artifacts.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-alternate/40 pt-3">
                      {artifacts.map((block, index) => (
                        <Button
                          key={`${message.id}-artifact-${index}`}
                          type="button"
                          variant="ghost"
                          className="h-8 text-xs"
                          onClick={() =>
                            downloadTextFile(
                              `${slug}-livrable-${index + 1}.md`,
                              block
                            )
                          }
                        >
                          <Download className="mr-1.5 h-3.5 w-3.5" />
                          Télécharger le livrable {artifacts.length > 1 ? index + 1 : ''}
                        </Button>
                      ))}
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-8 text-xs"
                        onClick={() => void copyMessage(message.id, message.content)}
                      >
                        <Copy className="mr-1.5 h-3.5 w-3.5" />
                        {copiedMessageId === message.id ? 'Copié !' : 'Copier'}
                      </Button>
                    </div>
                  ) : message.role === 'assistant' ? (
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-alternate/40 pt-3">
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-8 text-xs"
                        onClick={() =>
                          downloadTextFile(`${slug}-reponse-steven.md`, message.content)
                        }
                      >
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                        Télécharger en Markdown
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-8 text-xs"
                        onClick={() => void copyMessage(message.id, message.content)}
                      >
                        <Copy className="mr-1.5 h-3.5 w-3.5" />
                        {copiedMessageId === message.id ? 'Copié !' : 'Copier'}
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            )
          })
        )}
        {loading ? (
          <div className="flex justify-start">
            <div className="rounded-[--radius-card] border border-alternate/50 bg-background px-4 py-3 text-sm text-tertiary/60">
              Steven réfléchit…
            </div>
          </div>
        ) : null}
      </div>

      <div className="border-t border-alternate/50 px-5 py-4">
        {!isTaskAvailable ? (
          <p className="mb-3 text-xs text-tertiary/55">
            Clé API requise pour le brainstorming (Settings).
          </p>
        ) : null}
        {error ? <p className="mb-3 text-xs text-red-600/90">{error}</p> : null}
        {lastChangeSummary && lastChangeSummary.length > 0 ? (
          <div className="mb-3 rounded-[--radius-sharp] border border-primary/25 bg-primary/10 px-4 py-3">
            <div className="text-micro text-primary/80">Fiche projet mise à jour</div>
            <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-tertiary/85">
              {lastChangeSummary.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          disabled={loading || !isTaskAvailable}
          placeholder="Ex. Donne-moi un PRD pour le MVP, ou un prompt Cursor pour prototyper la landing…"
          className="min-h-[88px]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && canSend) {
              e.preventDefault()
              void sendMessage(draft)
            }
          }}
        />
        <SpeechDictationBar
          disabled={loading || !isTaskAvailable}
          onAppend={(spoken) => setDraft((prev) => appendDictationText(prev, spoken))}
          className="mt-2"
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-micro text-tertiary/45">⌘↵ pour envoyer</span>
          <div className="flex flex-wrap items-center gap-2">
            {thread.length > 0 ? (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={loading || syncing}
                  onClick={() => void copyLastExchange()}
                >
                  <Copy className="h-4 w-4" />
                  {copiedMessageId === 'last-exchange' ? 'Copié !' : 'Copier le dernier échange'}
                </Button>
                {isSyncAvailable ? (
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={!canSyncToProject}
                    onClick={() => void syncToProject()}
                  >
                    <FilePenLine className="h-4 w-4" />
                    {syncing ? 'Mise à jour…' : 'Mettre à jour le projet'}
                  </Button>
                ) : (
                  <span className="text-micro text-tertiary/45">
                    Clé API requise pour mettre à jour la fiche
                  </span>
                )}
              </>
            ) : null}
            <Button
              type="button"
              disabled={!canSend || !isTaskAvailable}
              onClick={() => void sendMessage(draft)}
            >
              <Send className="h-4 w-4" />
              {loading ? 'Envoi…' : 'Envoyer'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
