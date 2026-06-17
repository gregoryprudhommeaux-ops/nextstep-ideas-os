# AI Brainstorm Pivot — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformer NextStep Idea OS d'un tableur stratégique manuel en compagnon de brainstorming AI (BYOK) avec onboarding fondateur, flux conversation → proposition → validation, et portfolio intelligent.

**Architecture:** Extensions du store Zustand existant + persistance localStorage v2. AI Router client-side avec clés BYOK chiffrées localement. Multi-provider (OpenAI/Gemini/Perplexity en direct, Anthropic via relay optionnel). Nouvelles routes `/brainstorm`, `/founder`, `/settings`, `/portfolio`.

**Tech Stack:** Vite + React 19 + TypeScript + Tailwind v4 + Zustand + Firebase Auth + `zod` (validation AI output) + Web Crypto API (chiffrement clés).

**Spec:** `docs/superpowers/specs/2026-06-17-ai-brainstorm-pivot-design.md`

---

## File Map

| File | Responsibility |
|------|----------------|
| `src/types/ai.ts` | AI provider types, task roles, router interfaces |
| `src/types/domain.ts` | FounderProfile, BrainstormSession, SharedBase, Idea extensions |
| `src/features/ai/keyStorage.ts` | Encrypt/decrypt API keys in localStorage |
| `src/features/ai/schemas.ts` | Zod schemas for AI structured output |
| `src/features/ai/router.ts` | Route tasks to providers, degraded mode |
| `src/features/ai/providers/openai.ts` | OpenAI fetch adapter |
| `src/features/ai/providers/gemini.ts` | Google Gemini fetch adapter |
| `src/features/ai/providers/perplexity.ts` | Perplexity fetch adapter |
| `src/features/ai/prompts/*.ts` | Prompt templates per task |
| `src/features/founder/FounderOnboardingPage.tsx` | 3-block onboarding |
| `src/features/founder/FounderProfilePage.tsx` | View/edit profile |
| `src/features/settings/SettingsPage.tsx` | BYOK configuration |
| `src/features/brainstorm/BrainstormPage.tsx` | Main brainstorm flow |
| `src/features/brainstorm/ThoughtInput.tsx` | Raw thought capture |
| `src/features/brainstorm/ClarifyingDialog.tsx` | 1-3 intention questions |
| `src/features/brainstorm/ProposalCard.tsx` | Classification proposal UI |
| `src/features/brainstorm/ManualClassification.tsx` | Degraded mode without AI |
| `src/features/portfolio/PortfolioPage.tsx` | System view |
| `src/app/store.ts` | Extended with founderProfile, brainstorm, sharedBases |
| `src/app/persistence.ts` | v2 migration |
| `src/routes/AppRouter.tsx` | New routes + redirects |
| `src/features/shell/appNavItems.ts` | Updated nav |

---

## Phase 1 — Types & Fondations

### Task 1: Add AI types

**Files:**
- Create: `src/types/ai.ts`

- [ ] **Step 1: Create `src/types/ai.ts`**

```typescript
export type AIProvider = 'openai' | 'anthropic' | 'google' | 'perplexity'

export type AITaskRole =
  | 'structureProfile'
  | 'parseThought'
  | 'refineThought'
  | 'classifyPortfolio'
  | 'analyzeIdea'
  | 'marketResearch'
  | 'portfolioScan'

export type AIProviderConfig = {
  apiKey: string
  enabled: boolean
  lastTestedAt?: number
  lastTestStatus?: 'ok' | 'error'
}

export type AISettings = {
  providers: Partial<Record<AIProvider, AIProviderConfig>>
  defaultAnalysisProvider: AIProvider
  taskRouting: Partial<Record<AITaskRole, AIProvider>>
  persistKeys: boolean
}

export const DEFAULT_AI_SETTINGS: AISettings = {
  providers: {},
  defaultAnalysisProvider: 'openai',
  taskRouting: {
    marketResearch: 'perplexity',
  },
  persistKeys: true,
}

export type PortfolioVerdict = 'new' | 'extension' | 'variant' | 'sharedBase'

export type ClarifyingQuestion = {
  id: string
  text: string
  dimension: 'intention' | 'problem' | 'proximity' | 'maturity' | 'energy'
  options: { id: string; label: string }[]
  allowFreeText: boolean
}

export type ClassificationProposal = {
  provisionalTitle: string
  understoodSummary: string
  verdict: PortfolioVerdict
  targetIdeaId?: string
  targetUmbrellaId?: string
  alternativeVerdict?: PortfolioVerdict
  alternativeNote?: string
  founderFitNote?: string
  energyNote?: string
  confidence: 'low' | 'medium' | 'high'
}

export type IdeaAIAnalysis = {
  brief: string
  founderFitNote: string
  whyNow?: string
  audience?: string
  risks?: string
  dimensionScores?: Record<string, number>
}

export type ParseThoughtResult = {
  provisionalTitle: string
  problemSummary: string
  audienceHint?: string
  questions: ClarifyingQuestion[]
}

export type MarketResearchResult = {
  summary: string
  trends: string[]
  competitors: string[]
  sources?: string[]
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: PASS (no imports of ai.ts yet — file is standalone)

---

### Task 2: Extend domain types

**Files:**
- Modify: `src/types/domain.ts`

- [ ] **Step 1: Add new types at end of `src/types/domain.ts`**

```typescript
import type { AIProvider, ClassificationProposal, IdeaAIAnalysis, PortfolioVerdict } from './ai'

export type BrainstormPhase =
  | 'input'
  | 'clarifying'
  | 'proposing'
  | 'applied'
  | 'cancelled'

export type FounderProfile = WithTimestamps & {
  id: string
  userId: string
  whoIAmRaw: string
  whoIAm: {
    experienceSummary: string
    skills: string[]
    location?: string
    timeConstraints?: string
  }
  whatIWantRaw: string
  whatIWant: {
    lifestyleVision: string
    revenueTarget?: string
    autonomyVsSalary: 'autonomy' | 'salary' | 'balanced' | 'unknown'
    horizonYears?: number
  }
  howIWorkRaw: string
  howIWork: {
    personalitySummary: string
    riskTolerance: 'low' | 'medium' | 'high' | 'unknown'
    energyDrivers: string[]
    energyDrains: string[]
  }
  onboardingCompletedAt?: FirestoreTime
  lastStructuredAt?: FirestoreTime
}

export type BrainstormSession = WithTimestamps & {
  id: string
  phase: BrainstormPhase
  rawInput: string
  inspirations?: IdeaInspiration[]
  questions: import('./ai').ClarifyingQuestion[]
  answers: Record<string, string>
  proposal?: ClassificationProposal
  resultIdeaId?: string
  resultLinkId?: string
}

export type SharedBase = WithTimestamps & {
  id: string
  name: string
  description: string
  ideaIds: string[]
  sharedDimensions: ('audience' | 'infra' | 'brand' | 'backOffice' | 'channels')[]
  aiSuggested: boolean
  confirmedByUser: boolean
}
```

- [ ] **Step 2: Extend `Idea` type — add fields before closing brace**

```typescript
  scoreSource?: 'manual' | 'ai' | 'hybrid'
  aiAnalysis?: IdeaAIAnalysis & { analyzedAt: FirestoreTime; provider: AIProvider }
  portfolioRole?: 'standalone' | 'extension' | 'variant'
  parentIdeaId?: string
  extensionNote?: string
  captureSource?: 'manual' | 'brainstorm'
  brainstormSessionId?: string
```

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: PASS (existing code uses optional fields)

---

### Task 3: Persistence v2 migration

**Files:**
- Modify: `src/app/persistence.ts`
- Modify: `src/app/store.ts`
- Modify: `src/data/systemDefaults.ts`

- [ ] **Step 1: Update `AppData` in `src/app/store.ts`**

```typescript
import type { BrainstormSession, FounderProfile, SharedBase } from '../types/domain'

export type AppData = {
  version: 2
  ideas: Idea[]
  filters: FilterDefinition[]
  profiles: ScoringProfile[]
  tags: Tag[]
  decisionNotes: DecisionNote[]
  synergyLinks: SynergyLink[]
  umbrellaGroups: UmbrellaGroup[]
  weeklyReviews: WeeklyReview[]
  founderProfile: FounderProfile | null
  brainstormSessions: BrainstormSession[]
  sharedBases: SharedBase[]
}
```

- [ ] **Step 2: Update `createEmptyAppData` in `src/data/systemDefaults.ts`**

Add to return object:
```typescript
  version: 2 as const,
  founderProfile: null,
  brainstormSessions: [],
  sharedBases: [],
```

- [ ] **Step 3: Add migration in `src/app/persistence.ts`**

Change `STORAGE_KEY` to `'nextstep-idea-os-v2'` and update `loadPersistedData`:

```typescript
const STORAGE_KEY = 'nextstep-idea-os-v2'
const LEGACY_KEY = 'nextstep-idea-os-v1'

function migrateV1toV2(raw: Record<string, unknown>): AppData {
  return {
    version: 2,
    ideas: (raw.ideas as AppData['ideas']) ?? [],
    filters: (raw.filters as AppData['filters']) ?? [],
    profiles: (raw.profiles as AppData['profiles']) ?? [],
    tags: (raw.tags as AppData['tags']) ?? [],
    decisionNotes: (raw.decisionNotes as AppData['decisionNotes']) ?? [],
    synergyLinks: (raw.synergyLinks as AppData['synergyLinks']) ?? [],
    umbrellaGroups: (raw.umbrellaGroups as AppData['umbrellaGroups']) ?? [],
    weeklyReviews: (raw.weeklyReviews as AppData['weeklyReviews']) ?? [],
    founderProfile: null,
    brainstormSessions: [],
    sharedBases: [],
  }
}

export function loadPersistedData(): AppData | null {
  try {
    let raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const legacy = localStorage.getItem(LEGACY_KEY)
      if (legacy) {
        const parsed = JSON.parse(legacy) as Record<string, unknown>
        const migrated = migrateV1toV2(parsed)
        savePersistedData(migrated)
        localStorage.removeItem(LEGACY_KEY)
        return reviveTimestamps(migrated)
      }
      return null
    }
    const parsed = JSON.parse(raw) as AppData
    if (!parsed.version) return reviveTimestamps(migrateV1toV2(parsed as unknown as Record<string, unknown>))
    return reviveTimestamps(parsed)
  } catch {
    return null
  }
}
```

- [ ] **Step 4: Run build**

Run: `npm run build`
Expected: PASS

---

### Task 4: Founder onboarding page (no AI)

**Files:**
- Create: `src/features/founder/founderDefaults.ts`
- Create: `src/features/founder/FounderOnboardingPage.tsx`
- Modify: `src/app/store.ts`
- Modify: `src/routes/AppRouter.tsx`
- Modify: `src/routes/guards.tsx`

- [ ] **Step 1: Create `src/features/founder/founderDefaults.ts`**

```typescript
import type { FounderProfile } from '../../types/domain'
import { newId } from '../../lib/id'
import { nowTimestamp } from '../../lib/time'

export type FounderOnboardingInput = {
  whoIAmRaw: string
  whatIWantRaw: string
  howIWorkRaw: string
  userId: string
}

export function createFounderProfile(input: FounderOnboardingInput): FounderProfile {
  const now = nowTimestamp()
  return {
    id: newId('founder'),
    userId: input.userId,
    whoIAmRaw: input.whoIAmRaw.trim(),
    whoIAm: { experienceSummary: input.whoIAmRaw.trim(), skills: [] },
    whatIWantRaw: input.whatIWantRaw.trim(),
    whatIWant: { lifestyleVision: input.whatIWantRaw.trim(), autonomyVsSalary: 'unknown' },
    howIWorkRaw: input.howIWorkRaw.trim(),
    howIWork: {
      personalitySummary: input.howIWorkRaw.trim(),
      riskTolerance: 'unknown',
      energyDrivers: [],
      energyDrains: [],
    },
    onboardingCompletedAt: now,
    createdAt: now,
    updatedAt: now,
  }
}
```

- [ ] **Step 2: Add store actions in `src/app/store.ts`**

```typescript
  saveFounderProfile: (input: FounderOnboardingInput) => void
  updateFounderProfile: (patch: Partial<FounderProfile>) => void
```

Implementation:
```typescript
  saveFounderProfile: (input) =>
    set((s) => {
      if (!s.data) return s
      const profile = createFounderProfile(input)
      const data = commitData({ ...s.data, founderProfile: profile })
      return { data }
    }),

  updateFounderProfile: (patch) =>
    set((s) => {
      if (!s.data?.founderProfile) return s
      const founderProfile = touchUpdated({ ...s.data.founderProfile, ...patch })
      const data = commitData({ ...s.data, founderProfile })
      return { data }
    }),
```

- [ ] **Step 3: Create `src/features/founder/FounderOnboardingPage.tsx`**

3-step stepper with textareas. On submit call `saveFounderProfile` then `navigate('/app/brainstorm')`.
Use existing `Textarea`, `Button`, `SectionHeader` components.
Get `userId` from `useAuth()` — fallback `'local'`.

- [ ] **Step 4: Add onboarding guard in `src/routes/guards.tsx`**

```typescript
export function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const profile = useAppStore((s) => s.data?.founderProfile)
  const location = useLocation()
  if (!profile?.onboardingCompletedAt && !location.pathname.includes('/founder')) {
    return <Navigate to="/app/founder" replace />
  }
  return <>{children}</>
}
```

Wrap app routes inside `RequireOnboarding`.

- [ ] **Step 5: Add routes in `AppRouter.tsx`**

```typescript
import { FounderOnboardingPage } from '../features/founder/FounderOnboardingPage'

// Inside /app routes:
<Route path="founder" element={<FounderOnboardingPage />} />
<Route index element={<Navigate to="/app/brainstorm" replace />} />
```

- [ ] **Step 6: Run dev and test onboarding flow**

Run: `npm run dev`
Expected: After login → redirect to `/app/founder` → complete 3 steps → land on brainstorm

---

### Task 5: Update navigation

**Files:**
- Modify: `src/features/shell/appNavItems.ts`
- Create: `src/features/brainstorm/BrainstormPage.tsx` (stub)
- Create: `src/features/portfolio/PortfolioPage.tsx` (stub)
- Create: `src/features/settings/SettingsPage.tsx` (stub)
- Modify: `src/routes/AppRouter.tsx`

- [ ] **Step 1: Update `appNavItems.ts`**

```typescript
import { Brain, LayoutGrid, Settings, User } from 'lucide-react'

export const appNavItems: AppNavItem[] = [
  { to: '/app/brainstorm', end: true, label: 'Brainstorm', icon: Brain },
  { to: '/app/portfolio', label: 'Portfolio', icon: LayoutGrid },
  { to: '/app/ideas', label: 'Ideas', icon: Lightbulb },
  { to: '/app/review', label: 'Review', icon: NotebookPen },
  { to: '/app/founder', label: 'Profil', icon: User },
  { to: '/app/settings', label: 'Settings', icon: Settings },
]
```

- [ ] **Step 2: Create stub pages** (each renders `<SectionHeader title="..." />` + placeholder text)

- [ ] **Step 3: Add routes**

```typescript
<Route path="brainstorm" element={<BrainstormPage />} />
<Route path="portfolio" element={<PortfolioPage />} />
<Route path="settings" element={<SettingsPage />} />
```

- [ ] **Step 4: Run build**

Run: `npm run build`
Expected: PASS

---

## Phase 2 — BYOK & AI Router

### Task 6: Install zod + key storage

**Files:**
- Modify: `package.json` (via npm)
- Create: `src/features/ai/keyStorage.ts`

- [ ] **Step 1: Install zod**

Run: `npm install zod`

- [ ] **Step 2: Create `src/features/ai/keyStorage.ts`**

```typescript
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
    { name: 'PBKDF2', salt: enc.encode('nextstep-salt-v1'), iterations: 100000, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function saveAISettings(settings: AISettings, userId: string): Promise<void> {
  if (!settings.persistKeys) {
    sessionStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    return
  }
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
  if (session) return JSON.parse(session) as AISettings

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
```

---

### Task 7: Zod schemas for AI output

**Files:**
- Create: `src/features/ai/schemas.ts`

- [ ] **Step 1: Create schemas**

```typescript
import { z } from 'zod'

export const clarifyingQuestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  dimension: z.enum(['intention', 'problem', 'proximity', 'maturity', 'energy']),
  options: z.array(z.object({ id: z.string(), label: z.string() })).min(2).max(4),
  allowFreeText: z.boolean(),
})

export const parseThoughtResultSchema = z.object({
  provisionalTitle: z.string(),
  problemSummary: z.string(),
  audienceHint: z.string().optional(),
  questions: z.array(clarifyingQuestionSchema).max(3),
})

export const classificationProposalSchema = z.object({
  provisionalTitle: z.string(),
  understoodSummary: z.string(),
  verdict: z.enum(['new', 'extension', 'variant', 'sharedBase']),
  targetIdeaId: z.string().optional(),
  targetUmbrellaId: z.string().optional(),
  alternativeVerdict: z.enum(['new', 'extension', 'variant', 'sharedBase']).optional(),
  alternativeNote: z.string().optional(),
  founderFitNote: z.string().optional(),
  energyNote: z.string().optional(),
  confidence: z.enum(['low', 'medium', 'high']),
})

export const founderStructuredSchema = z.object({
  whoIAm: z.object({
    experienceSummary: z.string(),
    skills: z.array(z.string()),
    location: z.string().optional(),
    timeConstraints: z.string().optional(),
  }),
  whatIWant: z.object({
    lifestyleVision: z.string(),
    revenueTarget: z.string().optional(),
    autonomyVsSalary: z.enum(['autonomy', 'salary', 'balanced', 'unknown']),
    horizonYears: z.number().optional(),
  }),
  howIWork: z.object({
    personalitySummary: z.string(),
    riskTolerance: z.enum(['low', 'medium', 'high', 'unknown']),
    energyDrivers: z.array(z.string()),
    energyDrains: z.array(z.string()),
  }),
})

export const ideaAnalysisSchema = z.object({
  brief: z.string(),
  founderFitNote: z.string(),
  whyNow: z.string().optional(),
  audience: z.string().optional(),
  risks: z.string().optional(),
  dimensionScores: z.record(z.string(), z.number().min(1).max(10)).optional(),
})
```

---

### Task 8: OpenAI provider adapter

**Files:**
- Create: `src/features/ai/providers/base.ts`
- Create: `src/features/ai/providers/openai.ts`

- [ ] **Step 1: Create `base.ts`**

```typescript
export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

export async function chatCompletion(
  apiKey: string,
  baseUrl: string,
  model: string,
  messages: ChatMessage[],
  jsonMode = true
): Promise<string> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`AI request failed (${res.status}): ${err}`)
  }
  const data = (await res.json()) as { choices: { message: { content: string } }[] }
  return data.choices[0]?.message?.content ?? ''
}
```

- [ ] **Step 2: Create `openai.ts`**

```typescript
import { chatCompletion, type ChatMessage } from './base'

const BASE = 'https://api.openai.com/v1'
const MODEL = 'gpt-4o-mini'

export async function openaiChat(apiKey: string, messages: ChatMessage[]): Promise<string> {
  return chatCompletion(apiKey, BASE, MODEL, messages)
}

export async function testOpenAI(apiKey: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await openaiChat(apiKey, [{ role: 'user', content: 'Reply with {"ok":true}' }])
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' }
  }
}
```

- [ ] **Step 3: Create `perplexity.ts`** (same pattern, base URL `https://api.perplexity.ai`, model `sonar`)

- [ ] **Step 4: Create `gemini.ts`** (POST to `generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=`)

---

### Task 9: AI Router

**Files:**
- Create: `src/features/ai/prompts/system.ts`
- Create: `src/features/ai/prompts/parseThought.ts`
- Create: `src/features/ai/prompts/classify.ts`
- Create: `src/features/ai/router.ts`
- Create: `src/features/ai/useAISettings.ts`

- [ ] **Step 1: Create system prompt in `prompts/system.ts`**

```typescript
export const SYSTEM_PROMPT = `Tu es un collègue créatif qui aide un fondateur à clarifier ses idées.
Tu ne fais pas de business plan. Tu ne demandes jamais de CA, TAM, pricing, ou stack technique.
Tu poses 1 à 3 questions maximum par tour, avec des choix simples.
Tu acceptes "je ne sais pas encore" comme réponse valide.
Tu réponds en français sauf si l'utilisateur écrit en anglais.
Tu réponds UNIQUEMENT en JSON valide, sans markdown.`
```

- [ ] **Step 2: Create `router.ts`**

Core logic:
- `getProviderForTask(task, settings)` → resolves provider
- `parseThought(input, profile, ideas, settings)` → calls provider, validates with `parseThoughtResultSchema`
- `classifyPortfolio(context, settings)` → validates with `classificationProposalSchema`
- `isAIAvailable(settings)` → checks if default provider has enabled key

- [ ] **Step 3: Create `useAISettings.ts` hook**

```typescript
export function useAISettings() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<AISettings>(DEFAULT_AI_SETTINGS)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!user) return
    loadAISettings(user.uid).then((s) => { setSettings(s); setLoaded(true) })
  }, [user])

  const save = async (next: AISettings) => {
    if (!user) return
    await saveAISettings(next, user.uid)
    setSettings(next)
  }

  return { settings, save, loaded, isAvailable: isAIAvailable(settings) }
}
```

---

### Task 10: Settings page

**Files:**
- Modify: `src/features/settings/SettingsPage.tsx`

- [ ] **Step 1: Build Settings UI**

For each provider (openai, google, perplexity):
- Password input for API key
- Enable toggle
- Test button → calls `testOpenAI` / etc.
- Status indicator

Global:
- Select default analysis provider
- Checkbox persist keys
- Warning banner about local-only storage

- [ ] **Step 2: Manual test**

Run: `npm run dev`
Navigate to `/app/settings`, enter OpenAI key, test connection.
Expected: ✓ indicator

---

## Phase 3 — Brainstorm Flow

### Task 11: ThoughtInput component

**Files:**
- Create: `src/features/brainstorm/ThoughtInput.tsx`

- [ ] **Step 1: Create component**

Large textarea with placeholder « Qu'est-ce qui te traverse l'esprit en ce moment ? »
Submit button « Partager »
Optional: reuse `InspirationEditor` for attachments

---

### Task 12: ClarifyingDialog component

**Files:**
- Create: `src/features/brainstorm/ClarifyingDialog.tsx`

- [ ] **Step 1: Create component**

Renders 1-3 questions from `ClarifyingQuestion[]`.
Radio options + always show « Je ne sais pas encore ».
Optional free text if `allowFreeText`.
Submit calls `onAnswer(answers: Record<string, string>)`.

---

### Task 13: ProposalCard component

**Files:**
- Create: `src/features/brainstorm/ProposalCard.tsx`

- [ ] **Step 1: Create component**

Displays `ClassificationProposal`:
- Title, understood summary
- Verdict label (human-readable French)
- Target idea name if extension
- Alternative note if present
- Founder fit + energy notes
- Buttons: Valider | Idée séparée | Continuer à brainstormer

---

### Task 14: ManualClassification (degraded mode)

**Files:**
- Create: `src/features/brainstorm/ManualClassification.tsx`

- [ ] **Step 1: Create component**

When `!isAvailable`:
- Show banner « Connecte une clé API pour activer l'analyse AI »
- Simple form: title (pre-filled from raw input first line), 4 verdict buttons
- Creates idea directly via store

---

### Task 15: BrainstormPage orchestration

**Files:**
- Modify: `src/features/brainstorm/BrainstormPage.tsx`
- Modify: `src/app/store.ts`

- [ ] **Step 1: Add store actions**

```typescript
  startBrainstormSession: (rawInput: string, inspirations?: IdeaInspiration[]) => string
  updateBrainstormSession: (id: string, patch: Partial<BrainstormSession>) => void
  applyBrainstormVerdict: (sessionId: string, verdict: PortfolioVerdict, options?: { separateIdea?: boolean }) => string
```

`applyBrainstormVerdict` logic:
- `new` → `addIdea` with `captureSource: 'brainstorm'`, AI fields from proposal
- `extension` → `addIdea` with `parentIdeaId`, `portfolioRole: 'extension'`
- `variant` → prompt user to merge or create separate (v1: create + suggest synergy link)
- `sharedBase` → create `SharedBase` + link ideas

- [ ] **Step 2: BrainstormPage state machine**

```typescript
type Step = 'input' | 'clarifying' | 'proposing' | 'done'

// input → (AI parse) → clarifying (if questions) → proposing → done
```

- [ ] **Step 3: Wire AI calls**

On submit input:
1. `parseThought(...)` 
2. If questions.length > 0 → clarifying step
3. Else → `classifyPortfolio(...)` → proposing step

On answer questions:
1. `refineThought(...)` or second `classifyPortfolio` with answers
2. → proposing step

On validate:
1. `applyBrainstormVerdict`
2. Navigate to `/app/ideas/:id` or stay on brainstorm

- [ ] **Step 4: End-to-end test**

Run: `npm run dev`
With OpenAI key configured:
1. Enter thought at brainstorm
2. Answer 1-2 questions
3. Validate proposal
4. Verify idea created with AI fields

---

### Task 16: AI idea analysis on create

**Files:**
- Modify: `src/features/ideas/ideaDefaults.ts`
- Create: `src/features/ai/prompts/analyzeIdea.ts`
- Modify: `src/app/store.ts` (`applyBrainstormVerdict`)

- [ ] **Step 1: After idea creation, call `analyzeIdea`**

Populate `aiAnalysis` on Idea:
```typescript
aiAnalysis: {
  analyzedAt: nowTimestamp(),
  provider: 'openai',
  brief: result.brief,
  founderFitNote: result.founderFitNote,
  whyNow: result.whyNow,
  audience: result.audience,
  risks: result.risks,
  dimensionScores: result.dimensionScores,
}
```

Map `dimensionScores` to existing Idea numeric fields (`personalAlignment`, `freedomFit`, etc.) with `scoreSource: 'ai'`.

---

### Task 17: Update IdeaDetailPage for AI fields

**Files:**
- Modify: `src/pages/IdeaDetailPage.tsx`

- [ ] **Step 1: Show AI brief section when `idea.aiAnalysis` exists**

Display: brief, founderFitNote, whyNow, audience, risks.
Show scores from AI (read-only by default, « Override manuel » toggle reveals sliders).

- [ ] **Step 2: Show extension link if `parentIdeaId`**

Link to parent idea with `extensionNote`.

---

## Phase 4 — Portfolio View

### Task 18: PortfolioPage

**Files:**
- Modify: `src/features/portfolio/PortfolioPage.tsx`

- [ ] **Step 1: Build portfolio view**

Sections:
- **Idées standalone** — ideas without parentIdeaId
- **Extensions** — grouped by parentIdeaId
- **Umbrellas** — existing umbrella groups
- **Socles mutualisés** — from `sharedBases`

Each item links to idea detail or umbrella page.

- [ ] **Step 2: Add « Suggested links » placeholder** (filled in Task 19)

---

### Task 19: Portfolio scan AI

**Files:**
- Create: `src/features/ai/prompts/portfolioScan.ts`
- Modify: `src/features/ai/router.ts`
- Modify: `src/features/portfolio/PortfolioPage.tsx`

- [ ] **Step 1: Add `portfolioScan` to router**

Input: all ideas + founder profile.
Output: suggested synergies, umbrella candidates, shared bases.

- [ ] **Step 2: « Analyser le portfolio » button on PortfolioPage**

Calls `portfolioScan`, displays suggestions with confirm/dismiss.

---

## Phase 5 — Polish & Hardening

### Task 20: Degraded mode banner component

**Files:**
- Create: `src/components/AIBanner.tsx`

- [ ] **Step 1: Create reusable banner**

Shows when `!isAIAvailable`, links to `/app/settings`.
Use on BrainstormPage and PortfolioPage.

---

### Task 21: Founder profile view/edit page

**Files:**
- Create: `src/features/founder/FounderProfilePage.tsx`
- Modify: `src/routes/AppRouter.tsx`

- [ ] **Step 1: Create view/edit page**

Show 3 raw blocks + structured fields.
Button « Re-structurer avec AI » if key available.
Route: `/app/founder` shows onboarding if incomplete, else profile view.

---

### Task 22: Hide legacy creation flow

**Files:**
- Modify: `src/features/ideas/IdeasBoardPage.tsx`
- Modify: `src/pages/IdeaNewPage.tsx`

- [ ] **Step 1: Remove primary CTA « New idea » from board header**

Replace with link « Capture manuelle » (secondary, smaller).
Brainstorm remains primary entry.

- [ ] **Step 2: Add banner on IdeaNewPage**

« Tu peux aussi capturer une pensée depuis Brainstorm » with link.

---

### Task 23: Lint + build verification

- [ ] **Step 1: Run lint**

Run: `npm run lint`
Expected: PASS (fix any issues)

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 3: Manual smoke test checklist**

- [ ] Login → onboarding → brainstorm
- [ ] Settings → key test
- [ ] Brainstorm with AI → idea created
- [ ] Brainstorm without AI → manual classification
- [ ] Portfolio shows extensions
- [ ] Idea detail shows AI brief

---

## Self-Review Checklist

| Spec requirement | Task |
|------------------|------|
| FounderProfile 3 blocs | Task 4, 21 |
| BYOK localStorage chiffré | Task 6, 10 |
| Multi-provider routing | Task 8, 9 |
| Brainstorm C→A flow | Task 11-15 |
| Classification verdicts | Task 13, 15 |
| Mode dégradé | Task 14, 20 |
| AI idea analysis | Task 16, 17 |
| Portfolio view | Task 18, 19 |
| Nav restructure | Task 5 |
| Persistance v2 | Task 3 |
| Scoring profiles = lentilles | Unchanged (existing) |
| Firestore sync | Out of scope v1 |
| Anthropic relay | Out of scope v1 |

---

## Execution Order Summary

```
Phase 1: Tasks 1-5  (types, migration, onboarding, nav)
Phase 2: Tasks 6-10 (BYOK, router, settings)
Phase 3: Tasks 11-17 (brainstorm flow, idea AI)
Phase 4: Tasks 18-19 (portfolio)
Phase 5: Tasks 20-23 (polish, verify)
```

Estimated: ~23 tasks, each 15-45 min → 2-3 days focused work.
