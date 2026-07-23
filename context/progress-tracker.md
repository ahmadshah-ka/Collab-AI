# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Feature: Design System (context/feature-specs/01-design-system.md) — complete.

## Current Goal

- Design system feature is done. Next goal not yet defined — pick the next feature unit from context/project-overview.md scope.

## Completed

- Design system (context/feature-specs/01-design-system.md): shadcn/ui installed and configured (`components.json`, style `base-nova`, primitives library `@base-ui/react`); added Button, Card, Dialog, Input, Tabs, Textarea, Scroll Area to `components/ui/` (untouched post-generation); installed `lucide-react`; `lib/utils.ts` created with `cn()`.

## In Progress

- None yet.

## Next Up

- Add the next planned feature unit here.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- shadcn's standard theme variables (`--background`, `--primary`, `--card`, `--border`, etc. in `app/globals.css`) are mapped to the dark palette from `context/ui-context.md` rather than left as shadcn's generated neutral/oklch defaults, so the unmodified `components/ui/*` files render in the project's theme. The `context/ui-context.md` palette is also defined as its own set of raw CSS variables (`--bg-base`, `--text-primary`, etc.) and exposed as the documented Tailwind utility names (`bg-base`, `text-copy-primary`, `border-surface-border`, `text-brand`, `bg-accent-dim`, etc.) via `@theme inline`, for app-level (non-shadcn) components to consume per `code-standards.md`.
- App is dark-only: `.dark` class is applied permanently on `<html>` in `app/layout.tsx` (rather than toggled) so shadcn's `dark:`-prefixed variant utilities resolve; the `:root` block only holds the raw palette + `--radius`, no separate light color scheme.
- Fixed `--font-sans`/`--font-heading` (which shadcn init wired to a non-existent `--font-sans` variable) to point at the project's actual `--font-geist-sans`/`--font-geist-mono` variables from `next/font`, per the Typography section of `context/ui-context.md`.

## Session Notes

- Verified end to end: `tsc --noEmit` and `next build` pass; ran a temporary debug route rendering all 7 components together against the dev server, confirmed the compiled CSS resolves to the dark hex palette (not shadcn's default light oklch values) and that `font-sans` resolves to Geist Sans; debug route was deleted after verification.
- `components/ui/*` were not modified after generation, per the protected-foundation-components rule in `ai-workflow-rules.md`.
