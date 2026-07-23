# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Feature 02: Editor Chrome (context/feature-specs/02-editor.md) — complete.

## Current Goal

- Editor chrome (navbar + sidebar + composed layout) is done. Next goal not yet defined — pick the next feature unit from context/project-overview.md scope.

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

## Next Up

- Add the next planned feature unit here.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Cross-feature decisions not tied to a single feature go here. See each feature's own "Architecture decisions" above for feature-specific ones.
