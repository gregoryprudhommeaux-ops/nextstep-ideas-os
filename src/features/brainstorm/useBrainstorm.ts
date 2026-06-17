import * as React from 'react'
import type { AISettings } from '../../types/ai'
import type { ClassificationProposal, ClarifyingQuestion } from '../../types/ai'
import { useAppStore, EMPTY_IDEAS, EMPTY_UMBRELLA_GROUPS } from '../../app/store'
import { useAISettings } from '../ai/useAISettings'
import {
  classifyThought,
  evolveSteven,
  parseThought,
  analyzeIdea,
  getProviderForTask,
  type AIRouterContext,
} from '../ai/router'
import { newId } from '../../lib/id'

export type BrainstormPhase =
  | 'input'
  | 'loading'
  | 'clarifying'
  | 'proposing'
  | 'applying'
  | 'done'
  | 'error'

function buildAIContext(
  settings: AISettings,
  steven: AIRouterContext['steven'],
  founderProfile: AIRouterContext['founderProfile'],
  ideas: AIRouterContext['ideas'],
  umbrellaGroups: AIRouterContext['umbrellaGroups']
): AIRouterContext {
  return { settings, steven, founderProfile, ideas, umbrellaGroups }
}

export function useBrainstorm() {
  const { settings, loaded, isAvailable } = useAISettings()
  const steven = useAppStore((s) => s.data?.steven)
  const founderProfile = useAppStore((s) => s.data?.founderProfile ?? null)
  const ideas = useAppStore((s) => s.data?.ideas ?? EMPTY_IDEAS)
  const umbrellaGroups = useAppStore((s) => s.data?.umbrellaGroups ?? EMPTY_UMBRELLA_GROUPS)
  const applyBrainstormVerdict = useAppStore((s) => s.applyBrainstormVerdict)
  const applyManualBrainstorm = useAppStore((s) => s.applyManualBrainstorm)
  const applyStevenEvolution = useAppStore((s) => s.applyStevenEvolution)

  const [phase, setPhase] = React.useState<BrainstormPhase>('input')
  const [rawInput, setRawInput] = React.useState('')
  const [questions, setQuestions] = React.useState<ClarifyingQuestion[]>([])
  const [answers, setAnswers] = React.useState<Record<string, string>>({})
  const [proposal, setProposal] = React.useState<ClassificationProposal | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [sessionId] = React.useState(() => newId('bs'))
  const [resultIdeaId, setResultIdeaId] = React.useState<string | null>(null)

  const ctx = React.useMemo(
    () =>
      buildAIContext(
        settings,
        steven
          ? {
              customInstructions: steven.customInstructions,
              learnedContext: steven.learnedContext,
            }
          : null,
        founderProfile,
        ideas,
        umbrellaGroups
      ),
    [settings, steven, founderProfile, ideas, umbrellaGroups]
  )

  const reset = React.useCallback(() => {
    setPhase('input')
    setRawInput('')
    setQuestions([])
    setAnswers({})
    setProposal(null)
    setError(null)
    setResultIdeaId(null)
  }, [])

  const share = React.useCallback(async () => {
    const text = rawInput.trim()
    if (!text || !isAvailable) return
    setError(null)
    setPhase('loading')
    try {
      const parsed = await parseThought(ctx, text)
      if (parsed.questions.length > 0) {
        setQuestions(parsed.questions)
        setAnswers({})
        setPhase('clarifying')
        return
      }
      const classified = await classifyThought(ctx, text)
      setProposal(classified)
      setPhase('proposing')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de l’analyse')
      setPhase('error')
    }
  }, [rawInput, isAvailable, ctx])

  const submitClarifications = React.useCallback(async () => {
    setError(null)
    setPhase('loading')
    try {
      const classified = await classifyThought(ctx, rawInput.trim(), answers)
      setProposal(classified)
      setPhase('proposing')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la classification')
      setPhase('error')
    }
  }, [ctx, rawInput, answers])

  const validateProposal = React.useCallback(
    async (separateIdea?: boolean) => {
      if (!proposal) return
      setError(null)
      setPhase('applying')
      try {
        let aiAnalysis
        try {
          aiAnalysis = await analyzeIdea(
            ctx,
            proposal.provisionalTitle,
            `${rawInput.trim()}\n\n${proposal.understoodSummary}`
          )
        } catch {
          // Idea still created without AI scores if analysis fails
        }

        const provider = getProviderForTask(ctx.settings, 'analyzeIdea')
        const ideaId = applyBrainstormVerdict({
          proposal,
          rawInput: rawInput.trim(),
          sessionId,
          separateIdea,
          aiAnalysis,
          provider,
        })
        setResultIdeaId(ideaId)

        try {
          const evolution = await evolveSteven(ctx, {
            rawInput: rawInput.trim(),
            questions,
            answers,
            proposal,
          })
          applyStevenEvolution({
            learnedContext: evolution.learnedContext,
            summaryBullets: evolution.changeSummary,
            source: 'brainstorm',
            sessionId,
          })
        } catch {
          // Idea is saved even if Steven evolution fails
        }

        setPhase('done')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur lors de l’application')
        setPhase('error')
      }
    },
    [
      proposal,
      applyBrainstormVerdict,
      ctx,
      rawInput,
      questions,
      answers,
      applyStevenEvolution,
      sessionId,
    ]
  )

  const submitManual = React.useCallback(
    (input: {
      rawInput: string
      title: string
      verdict: ClassificationProposal['verdict']
      targetIdeaId?: string
    }) => {
      const ideaId = applyManualBrainstorm(input)
      setResultIdeaId(ideaId)
      setPhase('done')
    },
    [applyManualBrainstorm]
  )

  const setAnswer = React.useCallback((questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }, [])

  return {
    phase,
    rawInput,
    setRawInput,
    questions,
    answers,
    setAnswer,
    proposal,
    error,
    resultIdeaId,
    loaded,
    isAvailable,
    share,
    submitClarifications,
    validateProposal,
    submitManual,
    reset,
  }
}
