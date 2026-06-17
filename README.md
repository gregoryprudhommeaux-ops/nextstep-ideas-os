# NextStep Idea OS

Private strategic founder OS — brainstorming AI (Steven), portfolio scoring, and multi-device sync.

## Stack

- Vite + React 19 + TypeScript
- Tailwind CSS v4 (NextStep design tokens)
- React Router 7
- Firebase Auth (Google) + Firestore workspace sync
- Zustand + localStorage (per-user cache)
- BYOK AI: OpenAI, Gemini, Perplexity (+ optional Anthropic relay)

## Local setup

### 1) Install

```bash
npm install
```

### 2) Environment

Create `.env.local` at the repo root from `.env.example`.

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_FIREBASE_*` | Yes | Firebase web app config |
| `VITE_ALLOWED_EMAILS` | Yes | Comma-separated authorized emails |
| `VITE_AI_RELAY_URL` | No | Server proxy for Anthropic Claude |

### 3) Firebase Console

1. Create a Firebase project and **Web app** — copy config into `.env.local`.
2. **Authentication** → enable **Google** provider.
3. **Authorized domains** → add `localhost` (and `127.0.0.1` if you use it).
4. **Firestore** → create database.
5. Deploy security rules from this repo:

```bash
firebase deploy --only firestore:rules
```

Rules scope workspace data to `users/{userId}/workspace/{docId}` — each user can only read/write their own doc.

### 4) Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in **Chrome or Safari** (not an embedded browser).

### 5) AI keys (BYOK)

After sign-in: **Settings → API keys**. Keys are encrypted in this browser only — never sent to Firestore.

- **OpenAI** — brainstorm parse/classify/analyze (default)
- **Perplexity** — market research (default for `marketResearch` task)
- **Gemini** — alternative analysis provider
- **Anthropic** — requires `VITE_AI_RELAY_URL` (your server-side relay)

## Auth flow

- **Redirect flow** (`signInWithRedirect`) — reliable in local dev; popup is not used.
- Session persists via `browserLocalPersistence`.
- Routing:
  - Unauthenticated → `/login`
  - Authenticated, not whitelisted → `/restricted`
  - Authenticated + whitelisted → `/app` (onboarding if needed → `/app/founder`)
- Deep links: visiting a protected route while logged out redirects to `/login`, then back to the original path after sign-in.

## Data model

- **Local cache**: `localStorage` keyed per Firebase `uid`
- **Cloud sync**: `users/{uid}/workspace/main` in Firestore (debounced 900ms)
- On login/user switch: in-memory store resets and re-hydrates from local + Firestore (newest `savedAt` wins)
- API keys: `localStorage` / `sessionStorage` only, AES-GCM per user

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (port 5173) |
| `npm run build` | Typecheck + production build |
| `npm run lint` | ESLint |
| `npm run preview` | Preview production build |

## Project structure (high level)

```
src/
  app/           store, persistence, bootstrap
  features/
    auth/        Google sign-in, guards
    brainstorm/  Steven C→A flow
    ai/          router, providers, prompts, schemas
    founder/     onboarding
    portfolio/   scan & grouping
  routes/        AppRouter + guards
  services/      Firebase, Firestore sync
```

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Setup required screen | Fill all `VITE_FIREBASE_*` in `.env.local`, restart dev server |
| Redirect loop / blank after Google | Check authorized domains; use Chrome/Safari |
| `/restricted` after sign-in | Add your email to `VITE_ALLOWED_EMAILS` |
| AI banner despite Perplexity key | Ensure key is **tested** (enabled) in Settings |
| Firestore permission denied | Deploy `firestore.rules`; confirm you're signed in |
| Wrong user's data on shared PC | Cache is uid-scoped; sign out clears session store |
