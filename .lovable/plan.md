# Glassmorphism Pass + Lockscreen with Biometric

## Part 1 — Where to apply Glassmorphism (selective, not everywhere)

Glass works best on **floating / overlay / hero** surfaces, not on dense list rows or forms (where it hurts readability). Recommended targets:

1. **Bottom Navigation** (`BottomNav.tsx`) — upgrade from current `bg-card/90 backdrop-blur` to a true frosted bar with inner highlight, subtle gradient, and ring. High visibility, always-on.
2. **Top App Headers / Greeting cards** on dashboards (`Index.tsx` designer hero, `ClientHome.tsx` greeting, `WorkerDashboard.tsx` welcome card) — frosted hero with soft gradient blob behind.
3. **Stat / KPI cards** on `Index.tsx` and `Analytics.tsx` (the horizontal scroll metric tiles only) — glass tiles over a soft ambient gradient.
4. **Floating Action Button** (the center `+` in BottomNav) — glass ring + glow.
5. **Modals / Sheets / Drawers** (shadcn `dialog`, `sheet`, `drawer`) — frosted backdrop + glass panel.
6. **Workshop Chat announcement / pinned message bubble** — frosted highlight to make it stand out.
7. **Theme Picker preview cards** — glass tiles to showcase palettes.
8. **Lockscreen** (new, see Part 2) — full glass over wallpaper.

Explicitly **NOT** glassed (keep solid for legibility):
- Long lists (Clients, Orders, Workers list rows)
- Forms (Auth, AddNew, Measurements inputs)
- Dense tables and chat message lists

### Implementation
Add reusable utility classes in `src/index.css`:

```text
.glass        → bg-card/40 backdrop-blur-xl border border-white/10
                shadow-[0_8px_32px_rgba(0,0,0,0.12)]
.glass-strong → bg-card/60 backdrop-blur-2xl + inner top highlight
.glass-nav    → bg-background/55 backdrop-blur-2xl border-t border-white/10
.glass-hero   → gradient + radial blob behind a glass panel
```

Then swap class names on the targeted components above. No structural changes — purely visual.

---

## Part 2 — Passcode Lockscreen (all 3 roles)

A single shared lockscreen that gates the app after launch / inactivity, with biometric (Face ID / Fingerprint) shortcut.

### UX flow
1. On first app load, if a passcode is set → show Lockscreen before any route renders.
2. After **2 minutes** of inactivity OR on tab re-focus after >30s → re-lock.
3. User can: enter 4-digit passcode, OR tap biometric button to unlock instantly (mocked WebAuthn / simulated success).
4. First-time setup: prompt to "Set a 4-digit passcode" after login (skippable).
5. Settings page already has a "Biometric Login" toggle — wire it to this system. Add a new "Change Passcode" entry.

### Visual design
- Full-screen glass panel over a soft animated gradient (role-tinted: ash for designer, warm for client, neutral for worker).
- Avatar + greeting ("Welcome back, Lola") at top.
- 4 dot indicators that fill as digits are entered, with shake animation on wrong code.
- Custom numeric keypad (0–9, biometric icon, backspace) — large tappable circles, glass style.
- Bottom: "Forgot passcode?" → toast (mock reset).

### Files to add
- `src/contexts/LockContext.tsx` — passcode (hashed in localStorage), biometric flag, `isLocked`, `unlock()`, `lock()`, inactivity timer, setPasscode().
- `src/components/Lockscreen.tsx` — the UI (keypad, dots, biometric button, shake animation).
- `src/components/LockGate.tsx` — wraps app; renders Lockscreen when locked, children when unlocked. Bypasses for `/auth` and `/onboarding`.
- `src/pages/SetPasscode.tsx` — onboarding flow to set/change a passcode (enter + confirm).

### Files to edit
- `src/App.tsx` — add `LockProvider` + wrap `AnimatedRoutes` in `<LockGate>`. Add `/set-passcode` route.
- `src/pages/Settings.tsx` — wire biometric toggle to `LockContext`; add "Change Passcode" item linking to `/set-passcode`; add "Lock Now" action.
- `src/pages/Auth.tsx` — after successful sign-in, if no passcode set, redirect to `/set-passcode` (skippable).
- `src/index.css` — add the glass utility classes.

### Biometric (mocked but real-feeling)
- Try `navigator.credentials.get()` (WebAuthn) when available; on failure or unsupported, fall back to a simulated 600ms success toast ("Authenticated with Face ID").
- Detect platform: show "Face ID" label on iOS/macOS, "Fingerprint" elsewhere via `navigator.userAgent`.

### Persistence
- Passcode stored as a SHA-256 hash in `localStorage` under `fashionos-passcode`.
- Biometric preference under `fashionos-biometric`.
- Last-active timestamp under `fashionos-last-active` for inactivity check.

---

## Out of scope
- Real WebAuthn server registration (mocked).
- Server-side session invalidation.
- Recovery via email/SMS (toast placeholder only).

After approval I'll implement Part 1 (glass utilities + targeted swaps) and Part 2 (LockContext, Lockscreen UI, SetPasscode page, wiring) in one pass.
