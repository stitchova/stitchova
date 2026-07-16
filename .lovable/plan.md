
## Diagnosis

Walking through the flows, three interacting bugs explain the "auth keeps looping" and "role pages not responding" symptoms:

1. **Lockscreen blocks home pages after sign-in.** `LockContext` initializes `isLocked = !!localStorage.getItem(PASSCODE_KEY)`. If a passcode was ever set in a prior session, `Auth.handleSubmit` sees `hasPasscode = true`, skips `/set-passcode`, and `navigate(home)` — but `LockGate` immediately overlays a full-screen `Lockscreen` on `/`, `/client-home`, and `/worker-dashboard`. The page renders behind it but appears "not responding" because every tap hits the lock overlay. The keypad works, but users read this as a frozen app.

2. **`/set-passcode` can loop back to `/auth`.** `SetPasscode.goNext()` falls back to `navigate(-1)` when no `next` state is provided (e.g. hard refresh, deep link, or when navigation state was dropped by `AnimatePresence` remount). Back = `/auth` → user picks role again → `/set-passcode` → back → `/auth`. Loop.

3. **Stale localStorage from prior real-auth / MCP experiment.** Old Supabase auth tokens (`sb-*-auth-token`), stale `fashionos-role`, and orphan passcode hashes from removed flows collide with the mockup guards. The Index page also unconditionally sends anyone without `fashionos-onboarded` to `/onboarding`, which combined with (1) and (2) traps the user.

Console shows only React Router v7 future-flag warnings — no runtime errors — consistent with a UX/gating loop rather than a crash.

## Fix Plan

### 1. LockContext — do not lock immediately after a successful sign-in
- Add a `markAuthenticated()` action that resets the inactivity timer AND sets `isLocked = false` for the current session (still requires unlock on next refocus / refresh, matching iOS behavior).
- Call `markAuthenticated()` from `Auth.handleSubmit` right after `setRole(...)` so the user lands on their role home fully unlocked in the same tab session.
- Keep the existing refocus / inactivity re-lock behavior untouched.

### 2. SetPasscode — deterministic navigation, never `navigate(-1)`
- Derive `home` from `useRole()` when `location.state.next` is missing: designer → `/`, client → `/client-home`, worker → `/worker-dashboard`.
- Always `navigate(home, { replace: true })` on finish / skip / remove.
- Remove the `navigate(-1)` fallback entirely so refresh on `/set-passcode` can never bounce back to `/auth`.

### 3. Auth — same deterministic home resolver
- Extract a small `resolveHome(role, nextParam)` helper (kept inline in `Auth.tsx`) shared by both branches so `/set-passcode` and direct navigation agree on the destination.
- Always pass `state: { next: home }` when routing to `/set-passcode`, even when `hasPasscode` is true and we're skipping it, so downstream refreshes stay deterministic.

### 4. Index — stop the onboarding bounce for returning users
- Guard the `/onboarding` redirect so it only fires when `fashionos-role` is also unset (i.e. truly first-time). A returning designer whose onboarding flag was cleared won't get kicked out mid-session.
- Use `replace: true` (already done) and gate the effect behind a `useRef` so it can't re-fire in a Strict-Mode double-invoke.

### 5. One-shot stale-state cleanup
- On app mount (in `App.tsx` or a tiny `useEffect` inside `RoleProvider`), run a versioned migration: if `stitchova-cleanup-v1` flag is missing in localStorage, remove any keys starting with `sb-` (leftover Supabase tokens) and set the flag. Pure client-side, idempotent, no data loss for the mockup keys (`fashionos-*`, `stitchova-*`).

### 6. LockGate — extend bypass list defensively
- Add `/` — no, we keep `/` lockable. Instead ensure bypass matching uses exact-prefix on segment boundaries (`/auth`, `/onboarding`, `/set-passcode`, `/.lovable/oauth/consent`) so nothing regresses.

### 7. Verification
- Reset localStorage, walk each role: Onboarding → Auth → SetPasscode (set + skip paths) → role home → refresh → lockscreen → unlock → home. Capture screenshots at each step with Playwright.
- Repeat with a pre-existing passcode to confirm no lock overlay hides the home immediately after sign-in.
- Confirm no console errors and that the FAB / bottom nav respond on all three role homes.

## Files to touch

```text
src/contexts/LockContext.tsx      # add markAuthenticated()
src/components/LockGate.tsx       # tighten bypass matching
src/pages/Auth.tsx                # call markAuthenticated, deterministic next
src/pages/SetPasscode.tsx         # role-based home fallback, no navigate(-1)
src/pages/Index.tsx               # onboarding guard + ref
src/App.tsx (or RoleContext)      # one-shot stale-state cleanup
```

No design/style changes — behavior fixes only.
