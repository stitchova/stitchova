## Bug
`src/index.css` has the Google Fonts `@import` on line 5, after the three `@tailwind` directives. Per CSS spec `@import` must come first, so Vite drops the import and logs `[vite:css] @import must precede all other statements` on every reload. Result: Inter font never loads and CSS compilation errors spam the dev server, making the app feel malfunctioning.

## Fix
Move the `@import url('https://fonts.googleapis.com/...Inter...')` line to the very top of `src/index.css`, above `@tailwind base/components/utilities`.

## Verify
- Reload preview, confirm no more `@import must precede` errors in the vite log.
- Confirm Inter font renders on Auth/Onboarding screens.
