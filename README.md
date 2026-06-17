# NextStep Idea OS (STEP 1 foundation)

Private strategic founder OS — **secured** behind Google Sign-In (Firebase Auth) and an **authorized email whitelist** via `VITE_ALLOWED_EMAILS`.

## Stack
- Vite + React + TypeScript
- Tailwind CSS v4 (NextStep tokens)
- React Router
- Firebase Auth (Google)
- Firestore scaffold (no domain collections yet in STEP 1)

## Local setup

### 1) Install
```bash
npm install
```

### 2) Configure env
Create `.env.local` at repo root from `.env.example`.

Required:
- `VITE_ALLOWED_EMAILS`: comma-separated authorized emails (e.g. `me@gmail.com,other@gmail.com`).
- Firebase web app config variables (from Firebase Console).

### 3) Firebase Console checklist
- Create a Firebase project.
- Create a **Web app** and copy its config.
- Authentication
  - Enable **Google** provider.
  - Ensure `localhost` is an authorized domain.
  - If you see popup/redirect errors locally: confirm your browser isn't blocking popups for `http://127.0.0.1:5173`.
- Firestore
  - Create Firestore database (Production mode is fine for private app).
  - (STEP 1) No domain collections required yet.

### 4) Run
```bash
npm run dev
```

## Auth implementation notes
- Uses **popup flow** (`signInWithPopup`) for a simple, reliable local dev experience.
- Persistence is set to `browserLocalPersistence` so the session stays on refresh.

## STEP 1 routing rules (expected)
- Unauthenticated => `/login`
- Authenticated but not whitelisted => `/restricted`
- Authenticated and whitelisted => `/app`

## Notes
- STEP 1 focuses on: foundation + auth/security + visual system + shell. No business domain features yet.
