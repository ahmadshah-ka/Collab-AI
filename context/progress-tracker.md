# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Feature 03: Auth (context/feature-specs/03-auth.md) — complete.

## Current Goal

- Auth is wired end to end (provider, auth pages, route protection, user menu). Next goal not yet defined — pick the next feature unit from context/project-overview.md scope (e.g. project creation/ownership, the next item in the Authentication and Projects feature group).

## Features

### Feature 01 — Design System

Spec: `context/feature-specs/01-design-system.md` — complete.

- **Completed**: shadcn/ui installed and configured (`components.json`, style `base-nova`, primitives library `@base-ui/react`); added Button, Card, Dialog, Input, Tabs, Textarea, Scroll Area to `components/ui/` (untouched post-generation); installed `lucide-react`; `lib/utils.ts` created with `cn()`.
- **Architecture decisions**:
  - shadcn's standard theme variables (`--background`, `--primary`, `--card`, `--border`, etc. in `app/globals.css`) are mapped to the dark palette from `context/ui-context.md` rather than left as shadcn's generated neutral/oklch defaults, so the unmodified `components/ui/*` files render in the project's theme. The `context/ui-context.md` palette is also defined as its own set of raw CSS variables (`--bg-base`, `--text-primary`, etc.) and exposed as the documented Tailwind utility names (`bg-base`, `text-copy-primary`, `border-surface-border`, `text-brand`, `bg-accent-dim`, etc.) via `@theme inline`, for app-level (non-shadcn) components to consume per `code-standards.md`.
  - App is dark-only: `.dark` class is applied permanently on `<html>` in `app/layout.tsx` (rather than toggled) so shadcn's `dark:`-prefixed variant utilities resolve; the `:root` block only holds the raw palette + `--radius`, no separate light color scheme.
  - Fixed `--font-sans`/`--font-heading` (which shadcn init wired to a non-existent `--font-sans` variable) to point at the project's actual `--font-geist-sans`/`--font-geist-mono` variables from `next/font`, per the Typography section of `context/ui-context.md`.
- **Session notes**: Verified end to end: `tsc --noEmit` and `next build` pass; ran a temporary debug route rendering all 7 components together against the dev server, confirmed the compiled CSS resolves to the dark hex palette (not shadcn's default light oklch values) and that `font-sans` resolves to Geist Sans; debug route was deleted after verification. `components/ui/*` were not modified after generation, per the protected-foundation-components rule in `ai-workflow-rules.md`.

### Feature 02 — Editor Chrome

Spec: `context/feature-specs/02-editor.md` — complete.

- **Completed**:
  - `components/editor/editor-navbar.tsx` — fixed-height (`h-14`) top navbar with a 3-column left/center/right grid, sidebar toggle button in the left section swapping `PanelLeftOpen`/`PanelLeftClose` based on an `isSidebarOpen` prop, `bg-surface` with bottom border, right section left empty per spec.
  - `components/editor/project-sidebar.tsx` — floating rounded-2xl panel (fixed position, margin on all sides, `top` offset set to clear the navbar height) that does not affect page layout, slides in/out via a `translate-x` transition driven by an `isOpen` prop, header with "Projects" title + close button, shadcn `Tabs` with "My Projects"/"Shared" tabs each showing an empty placeholder state, full-width "New Project" button with `Plus` icon in the footer.
  - Dialog pattern requirement was already satisfied by the existing `components/ui/dialog.tsx` (title/description/footer support, themed via the mapped `globals.css` tokens) — no changes needed, left untouched per the protected-foundation-components rule.
  - `components/editor/editor-shell.tsx` — client component composing `EditorNavbar` + `ProjectSidebar`, owns the `isSidebarOpen` toggle state, renders `children` in a `<main>` canvas slot.
  - `app/editor/layout.tsx` + `app/editor/page.tsx` — visitable route (`/editor`) wiring `EditorShell` around a placeholder canvas page, so the composed chrome is viewable ahead of real project routing/auth.
- **Session notes**:
  - The navbar and sidebar were originally built as standalone shells with no shared layout; composing them into `EditorShell` surfaced that the sidebar's `top-4` offset visually overlapped the 56px navbar, so it was changed to `top-[4.5rem]` to sit below it instead.
  - Verified `tsc --noEmit`, `npm run lint`, and `next build` (including the new `/editor` route) all pass.
  - Visually verified in a headless Edge browser (via a temporary `puppeteer-core` script, removed after use — Playwright/`chromium-cli` were not available in this environment): navbar renders with the toggle icon, sidebar floats below the navbar without overlapping it, tabs/empty-state/New Project button render correctly, and toggling the sidebar slides it fully off-screen without shifting the canvas placeholder. No console errors.

### Feature 03 — Auth

Spec: `context/feature-specs/03-auth.md` — complete.

- **Completed**:
  - `lib/clerk-appearance.ts` — shared `clerkAppearance` object: Clerk's `dark` theme (`@clerk/ui/themes`) with every `variables` color/font/radius entry overridden to reference the app's own CSS custom properties (`var(--accent-primary)`, `var(--bg-surface)`, etc.) instead of the theme's hardcoded hex values; `borderRadius` set to the card/panel radius scale (`calc(var(--radius) * 1.8)`, matching `rounded-2xl`).
  - `app/layout.tsx` — root layout wrapped with `<ClerkProvider appearance={clerkAppearance}>` inside `<body>`.
  - `components/auth/auth-layout.tsx` + `app/(auth)/layout.tsx` — shared two-panel chrome for auth routes: exact 50/50 `lg:grid-cols-2` split; left panel tinted with `bg-accent-dim` (flat, no gradient) and holds a compact logo, a heading + supporting sentence, and an icon-prefixed feature list (lucide icon chip + title + description, no card borders/backgrounds); right panel centers the Clerk form on the plain base background; left panel hidden below `lg`. Revised after an initial text-only pass per user feedback against a reference screenshot — see Session notes.
  - `app/(auth)/sign-in/[[...sign-in]]/page.tsx` and `app/(auth)/sign-up/[[...sign-up]]/page.tsx` — Clerk `<SignIn />` / `<SignUp />` catch-all routes; the `(auth)` route group doesn't affect the URL, so paths remain `/sign-in` and `/sign-up`.
  - `proxy.ts` (project root) — Next.js 16 renamed the `middleware.ts` file convention to `proxy.ts`; the `clerkMiddleware()` helper itself is unchanged. Uses `createRouteMatcher` with a protected-first strategy: public routes are `${NEXT_PUBLIC_CLERK_SIGN_IN_URL}(.*)` and `${NEXT_PUBLIC_CLERK_SIGN_UP_URL}(.*)` (derived from env vars, not hardcoded), everything else calls `auth.protect()`.
  - `.env.local` — added `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in` and `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up` (Clerk's standard env var names — these drive both the proxy's public-route matcher and Clerk's own sign-in/sign-up linking; no new/renamed env vars invented).
  - `app/page.tsx` — now a Server Component; `await auth()` then redirects authenticated users to `/editor`, unauthenticated to `/sign-in` (the unauthenticated branch is effectively unreachable in practice since `proxy.ts` already redirects signed-out requests to `/` before the page runs, but it's kept explicit since the spec calls it out per-route).
  - `components/editor/editor-navbar.tsx` — added Clerk's built-in `<UserButton />` to the previously-empty right section.
  - `package.json` — added `@clerk/ui` (theme source only; `@clerk/nextjs` was already present).
- **Architecture decisions**:
  - Appearance theming is centralized once at the `ClerkProvider` level (`lib/clerk-appearance.ts`) rather than repeated per-component (`<SignIn appearance>`, `<UserButton appearance>`, etc.), so every Clerk component — including `UserButton` in the navbar — picks up the same CSS-variable-mapped dark theme automatically.
  - `@clerk/ui`'s optional `ui` prop (bundles Clerk's UI locally instead of loading it from Clerk's CDN) was deliberately **not** wired up — the spec only asked for the `dark` theme object from `@clerk/ui/themes`, and `ui` is an unrelated, separate opt-in (confirmed via `@clerk/react`'s `ClerkProviderProps` types: `ui` is optional, appearance/theme works identically without it).
  - Public-route matching in `proxy.ts` reads `NEXT_PUBLIC_CLERK_SIGN_IN_URL`/`NEXT_PUBLIC_CLERK_SIGN_UP_URL` at runtime instead of hardcoding `/sign-in`/`/sign-up`, so the route protection stays in sync with wherever those env vars point.
- **Session notes**:
  - Confirmed via `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md` that Next.js 16 only renamed the middleware *file*, not its runtime behavior — `proxy.ts` accepts the same default-export function signature `clerkMiddleware()` already produces.
  - Verified `tsc --noEmit`, `npm run lint`, and `next build` all pass; build output confirms `proxy.ts` is picked up as "Proxy (Middleware)" and `/sign-in`, `/sign-up` compile as dynamic catch-all routes.
  - Visually verified end to end with a temporary `puppeteer-core` script (installed with `--no-save`, removed after use — same approach as Feature 02): `/` redirects (307) to `/sign-in` when signed out; `/sign-in` renders the two-panel layout with the left panel hidden at a 500px mobile viewport; computed styles confirm the theme override actually applies the app's tokens through Clerk's internals (primary button `background-color: rgb(0, 200, 212)` = `--accent-primary`, feature-list text `rgb(128, 128, 144)` = `--text-muted`, tagline `rgb(192, 192, 204)` = `--text-secondary`); zero console errors.
  - **UI revision**: after the initial build, the user compared it against an external reference screenshot (a different product's sign-in page) and asked for an exact 50/50 split, a colored left panel, and a font check. Diagnosed first rather than assuming a bug: a `puppeteer-core` check of computed `font-family` on the body, heading, Clerk's card title, and form elements all already resolved to `Geist, "Geist Fallback"` — the font pipeline was correct, so "fix the fonts" meant applying the documented Geist Sans token more deliberately in the new heading/feature-list typography, not fixing a defect. The flat black left panel (identical to the page background) was the real gap; fixed by giving it a `bg-accent-dim` background — reusing the existing `--accent-primary-dim` token (already documented in `ui-context.md` for exactly this kind of subtle wash) rather than inventing a new color. Re-verified visually (screenshot) and confirmed zero console errors and a clean mobile collapse after the change.

## Next Up

- Project creation, ownership, and the project list/workspace navigation (`Authentication and Projects` feature group in `context/project-overview.md`) — the next natural unit now that auth and route protection exist.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Cross-feature decisions not tied to a single feature go here. See each feature's own "Architecture decisions" above for feature-specific ones.
