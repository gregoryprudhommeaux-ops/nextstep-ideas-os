import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SectionHeader } from '../../components/SectionHeader'
import { Button } from '../../components/ui/Button'
import { Field } from '../../components/ui/Field'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { useAppStore } from '../../app/store'
import { useAuth } from '../auth/useAuth'
import { isValidLinkedInUrl } from '../../lib/linkedin'
import { FounderProfilePage } from './FounderProfilePage'

const STEPS = [
  {
    key: 'whoIAm' as const,
    title: 'Qui je suis',
    prompt:
      'Raconte ton parcours pro et ce que tu sais faire mieux que la moyenne — expérience, compétences, lieu, contraintes de temps.',
    placeholder:
      'Ex. 10 ans en ops freelance, bon en automatisation et relation client, basé à Lyon, dispo le soir et le week-end…',
  },
  {
    key: 'whatIWant' as const,
    title: 'Ce que je veux',
    prompt:
      'À quoi ressemble ta vie idéale dans 3 ans ? Quel type de revenu ? Autonomie ou salaire ?',
    placeholder:
      'Ex. Travailler à mon rythme, 5–8k€/mois, peu de réunions, liberté géographique…',
  },
  {
    key: 'howIWork' as const,
    title: 'Comment je fonctionne',
    prompt:
      'Décris-toi en quelques phrases — forces, faiblesses, ce qui te motive et ce qui te fatigue.',
    placeholder:
      'Ex. Curieux, j’aime prototyper vite. Je déteste la paperasse. Motivé par l’impact visible…',
  },
]

export function FounderOnboardingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const founderProfile = useAppStore((s) => s.data?.founderProfile)
  const saveFounderProfile = useAppStore((s) => s.saveFounderProfile)

  const [step, setStep] = useState(0)
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [whoIAmRaw, setWhoIAmRaw] = useState('')
  const [whatIWantRaw, setWhatIWantRaw] = useState('')
  const [howIWorkRaw, setHowIWorkRaw] = useState('')

  if (founderProfile?.onboardingCompletedAt) {
    return <FounderProfilePage />
  }

  const current = STEPS[step]
  const values = { whoIAm: whoIAmRaw, whatIWant: whatIWantRaw, howIWork: howIWorkRaw }
  const currentValue = values[current.key]
  const linkedinOk = isValidLinkedInUrl(linkedinUrl)
  const canContinue =
    step === 0
      ? whoIAmRaw.trim().length >= 10 && linkedinOk
      : currentValue.trim().length >= 10

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
      return
    }
    saveFounderProfile({
      whoIAmRaw,
      whatIWantRaw,
      howIWorkRaw,
      linkedinUrl,
      userId: user?.uid ?? 'local',
    })
    navigate('/app/brainstorm')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <SectionHeader
        eyebrow={`Étape ${step + 1} sur ${STEPS.length}`}
        title="Ton profil fondateur"
        description="Une seule session, en langage naturel. Termine ces 3 blocs pour débloquer Brainstorm, Portfolio et la revue hebdo."
      />

      <div className="flex gap-2">
        {STEPS.map((s, i) => (
          <div
            key={s.key}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= step ? 'bg-primary' : 'bg-alternate/50'
            }`}
          />
        ))}
      </div>

      {step === 0 ? (
        <Field
          label="Profil LinkedIn"
          hint="Lien public vers ton profil — Steven s’en sert pour contextualiser ton parcours."
        >
          <Input
            type="url"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            placeholder="https://www.linkedin.com/in/ton-profil"
            autoComplete="url"
          />
          {linkedinUrl.trim() && !linkedinOk ? (
            <p className="mt-2 text-xs text-red-600/90">
              URL LinkedIn invalide — utilise un lien du type linkedin.com/in/…
            </p>
          ) : null}
        </Field>
      ) : null}

      <Field label={current.title} hint={current.prompt}>
        <Textarea
          value={currentValue}
          onChange={(e) => {
            if (current.key === 'whoIAm') setWhoIAmRaw(e.target.value)
            if (current.key === 'whatIWant') setWhatIWantRaw(e.target.value)
            if (current.key === 'howIWork') setHowIWorkRaw(e.target.value)
          }}
          placeholder={current.placeholder}
          rows={8}
          className="min-h-[180px]"
        />
      </Field>

      <div className="flex justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          disabled={step === 0}
          onClick={() => setStep(step - 1)}
        >
          Retour
        </Button>
        <Button type="button" disabled={!canContinue} onClick={handleNext}>
          {step < STEPS.length - 1 ? 'Continuer' : 'Terminer'}
        </Button>
      </div>
    </div>
  )
}
