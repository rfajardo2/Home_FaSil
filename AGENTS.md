# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

---

# Home Hub — agent guide

This file is the single source of truth for any AI agent (Claude Code, ChatGPT/Codex, or
others) working on this repo. It documents what actually exists — not aspirations. If you
change architecture, conventions, or the database, update this file in the same change.

## What this project is

A household-management app (tasks, points/ranking, shared expenses) for families, built
with Expo (React Native) so the same code runs on web, iOS and Android. Backend is
Supabase (Postgres + Auth + RLS). All UI copy and code comments in this repo are Spanish
for the former, English for the latter — keep that split.

## Stack & versions (see `package.json` for exact pins)

- Expo SDK ~57, expo-router ~57 (file-based routing, typed routes enabled in `app.json`)
- React 19, React Native 0.86, react-native-web
- TypeScript ~6 (strict-ish; no `Database` generic on the Supabase client — see Database
  section)
- `@supabase/supabase-js` v2 — the *only* backend, no custom server/API layer
- `@react-native-async-storage/async-storage` for local persistence (session storage,
  remembering the active group)
- ESLint 9 + `eslint-config-expo` (`npx expo lint`)

## Running it

```bash
npm install
npx expo start          # then press w for web, or scan the QR with Expo Go
npx expo start --web    # web directly
npx tsc --noEmit        # type-check
npx expo lint           # lint
```

Env vars (`.env`, copy from `.env.example`, never commit): `EXPO_PUBLIC_SUPABASE_URL`,
`EXPO_PUBLIC_SUPABASE_ANON_KEY` — the anon/publishable key, safe to expose client-side.
**Never** put the `service_role` key anywhere in this app. Without `.env`, the app still
runs, unauthenticated, against `src/data/mock.ts` (see below) — this is intentional.

## Architecture

```
src/
  app/                    expo-router screens (one file = one route)
    _layout.tsx            Root: AuthProvider → AppDataProvider → Stack.Protected gate
    (tabs)/_layout.tsx      Bottom tab bar (Inicio, Tareas, Grupo, Gastos) — no gating here
    (tabs)/*.tsx             The 4 tab screens
    iniciar-sesion.tsx, crear-cuenta.tsx    Auth screens (unauthenticated-only)
    perfil.tsx               Account/profile screen (read-only for now)
    nuevo-grupo.tsx, grupos.tsx   Group create/join/switch/leave — always optional
    nueva-tarea.tsx, nuevo-gasto.tsx, categorias.tsx   Create forms (need an active group)
    estadisticas.tsx, notificaciones.tsx, factura/[id].tsx
  hooks/
    use-auth.tsx            AuthProvider/useAuth() — Supabase session, sign in/up/out,
                              username availability check, profile bootstrap (ensureProfile)
    use-app-data.tsx         AppDataProvider/useAppData() — THE data layer. Loads groups,
                              members, categories, tasks, shared accounts, expenses,
                              notifications, and `myProfile` (group-independent). Every
                              mutation (create/toggle/settle/...) lives here, not in screens.
    use-theme.ts, use-color-scheme(.web).ts
  lib/
    supabase.ts              Supabase client + `isSupabaseConfigured` flag
    database-types.ts        Hand-written row types mirroring `supabase/schema.sql`
                              (the client has NO generated `Database` generic — see below)
    format-money.ts, relative-time.ts, task-due-label.ts   small formatting helpers
  components/               Reusable UI (components/ui/*) + icons.tsx (hand-drawn SVG icons)
                              + category-style.ts (icon+color lookup for a category row)
  data/mock.ts               Example data — see "Mock fallback" below
  constants/theme.ts          Colors, fonts, spacing — the entire design system
supabase/
  schema.sql                  The database. See "Database & migrations" below.
```

### Data flow pattern

Screens never call `supabase` directly except the two providers above. A screen:
1. Reads state from `useAppData()` / `useAuth()`.
2. Calls a provider action (`createTask`, `toggleTask`, `signIn`, ...), which does the
   Supabase call(s), then refetches the affected slice of state.
3. Renders from the refetched state. There is no client-side cache library — `useAppData`
   is a simple `useState` + refetch-on-mutation store.

### Mock fallback (`src/data/mock.ts`)

When `EXPO_PUBLIC_SUPABASE_URL`/`ANON_KEY` are absent, `isSupabaseConfigured` is `false`
and `AppDataProvider`/`AuthProvider` serve data reshaped from `src/data/mock.ts` instead of
querying Supabase, and the auth gate is bypassed entirely. This lets the UI be reviewed
without a backend. **When you add a new table/field to `useAppData`, also extend the
matching `MOCK_*` constant** or the shim silently omits it and TypeScript won't catch it
(the mock arrays are the only place these types are checked structurally).

## Auth flow

- Supabase Auth (email + password), "Confirm email" **on**.
- Sign-up (`crear-cuenta.tsx`) collects first name, last name, username (auto-suggested
  from name, editable, checked live against `is_username_available` RPC — see Database),
  email, password. These go into `auth.users.user_metadata` via `signUp()`'s `options.data`.
- `AuthProvider`'s `ensureProfile()` (in `use-auth.tsx`) creates the one `profiles` row per
  user **the first time a session exists** (after email confirmation, or immediately if
  confirmation is later disabled) — not at sign-up time, because an unconfirmed sign-up has
  no session yet. It reads `first_name`/`last_name`/`username` back out of
  `user_metadata` and retries with a numeric suffix if the chosen username was taken in the
  meantime (best-effort check at sign-up time isn't a lock).
- Duplicate email: Supabase's anti-enumeration behavior returns **no error** and a
  `data.user` with an **empty `identities` array** when you sign up with an email that's
  already registered and confirmed. `signUp()` in `use-auth.tsx` detects this and reports it
  as `'User already registered'`, translated to Spanish in the calling screen. Don't assume
  a duplicate always comes back as an `error` — it usually doesn't.
- Back button: `Header`'s `showBack` calls `router.back()` only if
  `router.canGoBack()`; otherwise it uses the `fallbackHref` prop. Every screen with
  `showBack` should pass a sensible `fallbackHref` — a screen reached by direct link/deep
  link (or as the very first screen in the stack) has no history to pop, and silently doing
  nothing is a bug, not a fallback.
- `Stack.Protected` in `src/app/_layout.tsx` is the only auth gate: unauthenticated users
  can reach `iniciar-sesion`/`crear-cuenta` only; authenticated users reach everything else.
  **Belonging to a group is not part of this gate** — see next section.

## Group flow (optional, not required to use the app)

Groups are households; a user can belong to zero, one, or many. **Nothing forces a user
into `nuevo-grupo`** — that was removed deliberately (see `(tabs)/_layout.tsx`, which used
to `router.replace('/nuevo-grupo')` when `groups.length === 0` and no longer does). Screens
that need an active group (Tareas, Grupo, Gastos, Categorías, and the create-forms reached
from them) render `<NoGroupCard />` (`components/ui/NoGroupCard.tsx`) instead of their
normal content when `activeGroup` is `null`, with a button into `/nuevo-grupo`. Inicio,
Notificaciones and Perfil work with zero groups (Inicio shows the same prompt below the
greeting, which still uses `myProfile` — see below).

- `useAppData().activeGroup` is the current group; `setActiveGroupId` switches it and
  persists the choice to `AsyncStorage` (`home-hub:active-group:<user id>`), so it survives
  a full app reload — it does **not** default back to "first group" on every launch.
- `myProfile` (in `useAppData`) is the signed-in user's own `profiles` row, loaded
  independently of any group. Use this (not `members.find(m => m.id === session.user.id)`,
  which is empty with no group) for anything that must work without a group — greeting name,
  the Perfil screen, etc.
- `leaveGroup(groupId)` removes your own `group_members` row (RLS already allowed this;
  there was previously no UI for it — now in `grupos.tsx`).

## Database & migrations (`supabase/schema.sql`)

There's no migration tool (no `supabase/migrations/`, no CLI-managed history) — **the whole
schema lives in one file**, `supabase/schema.sql`, written to be safe to paste and re-run
in the Supabase SQL Editor (`create table if not exists`, `create or replace function`,
`create policy` guarded by a preceding `drop policy if exists` where it might already
exist). Read the comments at the top of that file before changing it.

**Known gotcha, already hit twice in this project**: the Supabase SQL Editor runs a pasted
script as one batch and stops at the **first** error — including a `create policy` that
already exists from a prior run. If you add new statements near the end of the file and
ask the user to "just re-run schema.sql", it will abort on an early duplicate-policy error
before reaching your new statements, and they'll wrongly conclude it worked. **Give the
user only the new/changed SQL as a standalone, idempotent snippet** (which is what every
past round of schema changes in this repo's history did), not "paste the whole file again"
— unless you're certain nothing earlier in the file will error, which on a live project it
usually will.

**Known gotcha**: `INSERT ... RETURNING` (i.e. `.insert(...).select()` in supabase-js) is
re-checked by Postgres against the target table's **SELECT** RLS policy, not just its
INSERT policy. This breaks when a row only becomes visible to the SELECT policy via a
trigger fired by that same INSERT (e.g. creating a `groups` row: the `trg_add_creator_as_admin`
trigger inserts the creator into `group_members`, which is what the groups SELECT policy
checks — but that isn't visible yet when Postgres re-checks SELECT for the RETURNING
clause) — it throws a spurious `new row violates row-level security policy`, even though
the INSERT itself was allowed. Fix: don't `.select()` on that insert; refetch separately
afterward. `AppDataProvider.createGroup` in `use-app-data.tsx` has the full explanation and
is the reference example. This is **not** an issue for inserts where the SELECT policy only
depends on state that already existed before the insert (e.g. `shared_accounts`, `expenses`
— the inserting user is already a group member) — `.select()` is fine there.

The client (`src/lib/supabase.ts`) is created **without** a generated `Database` type
parameter, so `supabase.from(...)` calls are not compile-time checked against the schema —
`src/lib/database-types.ts` is a hand-maintained set of row types used only where
`use-app-data.tsx` explicitly annotates a variable. Keep it in sync by hand when you change
`schema.sql`; TypeScript will not warn you if you don't.

RLS is on for every table; the general shape is "any authenticated user can insert their
own membership/content, and can only see rows in groups they belong to" via the
`is_group_member(group_id)` / `is_group_admin(group_id)` helper functions. Two
SECURITY DEFINER RPCs exist for cases RLS alone can't express: `join_group_by_invite_code`
(you can't SELECT a group you're not a member of yet, so joining needs a definer function)
and `is_username_available` (the sign-up screen runs unauthenticated/`anon`, so it can't
SELECT `profiles` directly — this function returns only a boolean, never row data).

## Conventions

- **Spanish for all user-facing copy and error messages**, English for code, comments and
  commit messages. Don't mix.
- Every screen is `SafeAreaView` → (`Header` if it's a pushed/back-able screen) → content
  wrapped in a `View` capped at `MaxContentWidth` (`constants/theme.ts`) and centered — this
  is what keeps the app readable on wide web viewports. Copy this shape for new screens.
- Colors/fonts/spacing always come from `constants/theme.ts` via `useTheme()` — never a
  hardcoded hex or font size that isn't already a token there, so light/dark and the design
  system stay centralized.
- Category "icon" values are string keys (e.g. `'utensils'`) that must exist in
  `CATEGORY_ICONS` (`components/icons.tsx`) — `components/category-style.ts` resolves a
  category row to `{ Icon, color, soft }` and falls back to a generic pin icon for unknown
  keys, so a typo'd icon key degrades gracefully instead of crashing.
- New provider actions that mutate data follow the existing shape: `async function
  doThing(...): Promise<{ error: string | null }>`, guard on `isSupabaseConfigured` /
  required ids first, translate Postgres errors to Spanish at the *screen* level (see
  `traducirError` in `crear-cuenta.tsx` / `iniciar-sesion.tsx`) not inside the provider.
- `git status` shows an untracked `home-hub-app.bundle` file at the repo root — it's a
  stray local git-bundle export, not part of the app. Leave it alone; it's not referenced
  by anything.

## Sensitive / don't touch casually

- `supabase/schema.sql` — RLS policies here are the *only* access control in this app
  (there's no server layer to fall back on). Changing a `using`/`with check` clause changes
  who can read or write what. Review the "Database & migrations" gotchas above before
  editing, and never weaken a policy just to make a bug go away without understanding why
  it was failing.
- `src/hooks/use-auth.tsx` and `src/hooks/use-app-data.tsx` — shared by every screen. A
  change here affects the whole app; grep for the exported name before changing a
  function's signature.
- `.env` (gitignored) / `.env.example` — never put a real key value in `.env.example` or in
  any file that gets committed. The anon key is safe to expose client-side by Supabase's own
  design; the `service_role` key must never appear in this codebase at all.
- `app.json` `experiments.typedRoutes` is on — adding a new screen file makes its route
  available to `router.push`/`Link` typing automatically; renaming/moving a screen file is a
  breaking change for every `router.push('/old-path')` call site.

## Validating a change before calling it done

```bash
npx tsc --noEmit     # must be clean
npx expo lint        # a handful of pre-existing react-hooks/set-state-in-effect warnings
                      # in use-app-data.tsx / use-color-scheme.web.ts are known false
                      # positives (legitimate data-fetching effects) — don't chase those,
                      # but don't add NEW categories of lint error either
```

There is no automated test suite in this repo (no `*.test.ts`, no test runner configured)
— manual verification is the only check beyond type/lint. If you have a browser tool
available, actually run the dev server (`npx expo start --web`) and click through the
change; don't report something as working from reading the code alone. Supabase-side
changes (new SQL, new RLS policy) need the user to run the SQL in their own project before
they're testable — say so explicitly and wait, rather than assuming a schema change is
live.

## Recommended workflow / skills for this repo

This project is developed with Claude Code. Two built-in skills are directly useful here
and cost nothing to invoke — use them when the situation calls for it rather than treating
this repo as needing anything installed beyond what's in `package.json`:
- `/code-review` — before considering a non-trivial change finished, especially anything
  touching `use-app-data.tsx`, `use-auth.tsx`, or `schema.sql`.
- `/security-review` — after any change to RLS policies, the auth flow, or anything that
  handles user-provided input server-side (RPC functions).

No other tooling, dependency, or plugin is required or recommended for working on this
repo; don't add one solely to make future AI sessions more convenient.
