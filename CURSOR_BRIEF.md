## NextStep Idea OS — Cursor Brief (STEP 1 focus)

### STEP 1 goal
Set up a clean, extensible project foundation with:
- React + TypeScript + Vite
- Tailwind CSS v4 + NextStep design tokens
- Firebase (Auth + Firestore scaffold)
- Google Sign-In
- Route protection
- Authorized email whitelist via `VITE_ALLOWED_EMAILS`
- Base app shell (polished, on-brand)
- README + `.env.example`

### Product context (later steps)
This will become a private strategic founder operating system to organize and evaluate business ideas.
Do **not** build scoring/ideas/synergies/umbrellas yet in STEP 1 — only the foundation.

### Routing behavior (required)
- `/login`: unauthenticated users land here
- `/restricted`: authenticated but unauthorized users land here
- `/app`: authenticated + authorized users land here

### Whitelist behavior (required)
- After Google sign-in, check if authenticated `email` exists in `VITE_ALLOWED_EMAILS`.
- If not allowed: show Restricted Access screen and offer sign out.

---

## Runbook — prompts for Cursor (sequence)

### STEP 1 (foundation)
1) Scaffold project structure + deps only.\n
2) Tailwind v4 + NextStep tokens + UI primitives.\n
3) Firebase config + Auth provider + whitelist logic (`VITE_ALLOWED_EMAILS`).\n
4) Routes + guards + screens: Login / Restricted / App shell.\n
5) Audit: auth, routing, env vars, Tailwind, TS errors, polish.\n

### STEP 2 (domain skeleton)
Add domain types + seed data + repository interfaces (Mock → Firestore) and a first “Ideas Board + Detail” stub wired to mock data only.

