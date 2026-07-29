# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Feature 07: Wire Editor Home (context/feature-specs/07-wire-editor-home.md) — complete.

## Current Goal

- Feature 07 is done. Next: build the real collaborative canvas workspace at `/editor/[projectId]` (currently a placeholder stub) — Liveblocks + React Flow, per `Collaborative Canvas` in `context/project-overview.md`.

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
  - `package.json` — added `@clerk/nextjs` (runtime auth) and `@clerk/ui` (theme source).
- **Architecture decisions**:
  - Appearance theming is centralized once at the `ClerkProvider` level (`lib/clerk-appearance.ts`) rather than repeated per-component (`<SignIn appearance>`, `<UserButton appearance>`, etc.), so every Clerk component — including `UserButton` in the navbar — picks up the same CSS-variable-mapped dark theme automatically.
  - `@clerk/ui`'s optional `ui` prop (bundles Clerk's UI locally instead of loading it from Clerk's CDN) was deliberately **not** wired up — the spec only asked for the `dark` theme object from `@clerk/ui/themes`, and `ui` is an unrelated, separate opt-in (confirmed via `@clerk/react`'s `ClerkProviderProps` types: `ui` is optional, appearance/theme works identically without it).
  - Public-route matching in `proxy.ts` reads `NEXT_PUBLIC_CLERK_SIGN_IN_URL`/`NEXT_PUBLIC_CLERK_SIGN_UP_URL` at runtime instead of hardcoding `/sign-in`/`/sign-up`, so the route protection stays in sync with wherever those env vars point.
- **Session notes**:
  - Confirmed via `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md` that Next.js 16 only renamed the middleware *file*, not its runtime behavior — `proxy.ts` accepts the same default-export function signature `clerkMiddleware()` already produces.
  - Verified `tsc --noEmit`, `npm run lint`, and `next build` all pass; build output confirms `proxy.ts` is picked up as "Proxy (Middleware)" and `/sign-in`, `/sign-up` compile as dynamic catch-all routes.
  - Visually verified end to end with a temporary `puppeteer-core` script (installed with `--no-save`, removed after use — same approach as Feature 02): `/` redirects (307) to `/sign-in` when signed out; `/sign-in` renders the two-panel layout with the left panel hidden at a 500px mobile viewport; computed styles confirm the theme override actually applies the app's tokens through Clerk's internals (primary button `background-color: rgb(0, 200, 212)` = `--accent-primary`, feature-list text `rgb(128, 128, 144)` = `--text-muted`, tagline `rgb(192, 192, 204)` = `--text-secondary`); zero console errors.
  - **UI revision**: after the initial build, the user compared it against an external reference screenshot (a different product's sign-in page) and asked for an exact 50/50 split, a colored left panel, and a font check. Diagnosed first rather than assuming a bug: a `puppeteer-core` check of computed `font-family` on the body, heading, Clerk's card title, and form elements all already resolved to `Geist, "Geist Fallback"` — the font pipeline was correct, so "fix the fonts" meant applying the documented Geist Sans token more deliberately in the new heading/feature-list typography, not fixing a defect. The flat black left panel (identical to the page background) was the real gap; fixed by giving it a `bg-accent-dim` background — reusing the existing `--accent-primary-dim` token (already documented in `ui-context.md` for exactly this kind of subtle wash) rather than inventing a new color. Re-verified visually (screenshot) and confirmed zero console errors and a clean mobile collapse after the change.

### Feature 04 — Project Dialogs & Editor Home

Spec: `context/feature-specs/04-project-dialogs.md` — complete.

- **Completed**:
  - `types/project.ts` — `Project` interface (`id`, `name`, `slug`, `role: "owner" | "collaborator"`); `lib/mock-projects.ts` — seed mock data (2 owned, 1 shared).
  - `lib/utils.ts` — added `slugify()` used for the live slug preview and on create/rename.
  - `hooks/use-project-dialogs.ts` — single hook owning dialog state (`create` | `rename` | `delete` | `null`, with the target project attached for rename/delete), form state (`name`, derived `slug`), `isLoading`, and the mock `projects` list itself; create/rename/delete mutate that in-memory list (mock async delay, no API calls).
  - `components/editor/project-dialogs-context.tsx` — React context wrapping the hook so both the editor home content and the sidebar (siblings under `EditorShell`, not parent/child) can trigger the same dialogs and see the same project list.
  - `components/editor/project-dialogs.tsx` — `ProjectDialogs`, rendering the Create/Rename/Delete `Dialog`s (reused `components/ui/dialog.tsx`, untouched). Create has a name input with live slug preview; Rename prefills the name, autofocuses the input, and submits on Enter (wrapped in a `<form>`); Delete has no input, description names the project, confirm button uses the `destructive` Button variant.
  - `components/editor/editor-home.tsx` — client component for the `/editor` centered empty state (heading, description, `New Project` button wired to `openCreateDialog`); `app/editor/page.tsx` now just renders it (kept as a Server Component).
  - `components/editor/project-sidebar.tsx` — project rows for the "My Projects"/"Shared" tabs now come from the context, filtered by `role`; owned rows get a `DropdownMenu` (Rename/Delete) shown only on hover/focus or while open, shared rows get no actions; footer "New Project" button wired to `openCreateDialog`. Added a `lg:hidden` backdrop scrim (rendered only while open) that closes the sidebar on click, for mobile.
  - `components/editor/editor-shell.tsx` — wraps navbar/sidebar/canvas/dialogs in `ProjectDialogsProvider` and renders `<ProjectDialogs />` once.
  - `components/ui/dropdown-menu.tsx` — added via `npx shadcn add dropdown-menu` (untouched post-generation, per the protected-foundation-components rule); backed by `@base-ui/react/menu`, already a transitive dependency so no new package was added.
- **Architecture decisions**:
  - The mock project list itself lives inside `useProjectDialogs` (not a separate store) since nothing else needs it yet; when real persistence replaces the mock layer, the list/mutations move to API calls + Prisma but the dialog/form/loading state shape in the hook should stay the same.
  - Editor home (`app/editor/page.tsx`) and the sidebar are siblings, not nested, so dialog-triggering state couldn't be passed as props — a React context (`project-dialogs-context.tsx`) was used instead of lifting state further up, scoped to `EditorShell` only.
- **Session notes**:
  - Verified `tsc --noEmit`, `npm run lint`, and `next build` all pass.
  - Visually verified end to end with a temporary `puppeteer-core` script (installed with `--no-save`, removed after use, same approach as Features 02/03; `chromium-cli` unavailable in this environment): confirmed the editor home renders, the Create dialog's slug preview updates live while typing, the sidebar's owned-project dropdown shows Rename/Delete while the Shared tab shows zero action buttons, the Rename dialog prefills the name and autofocuses the input, the Delete dialog shows the destructive-styled confirm button, and the mobile viewport (400px) renders the backdrop scrim which closes the sidebar on click. Zero console errors.
  - `/editor` is auth-protected (`proxy.ts`), so visual verification required temporarily adding `/editor` to the proxy's public-route matcher for the duration of the puppeteer script; the change was reverted immediately after (confirmed via `git diff` — `grep -n "editor" proxy.ts` returns nothing) and `tsc`/`lint`/`build` were re-run against the reverted file to confirm the final state is clean.

### Feature 05 — Prisma Schema And Data Layer

Spec: `context/feature-specs/05-prisma.md` — complete.

- **Completed**:
  - `prisma/models/project.prisma` — `Project` (`ownerId` mapped to a Clerk user ID, `name`, optional `description`, `status: ProjectStatus` enum (`DRAFT`/`ARCHIVED`, default `DRAFT`), `canvasJsonPath` reserved for the future canvas blob URL reference, timestamps, indexes on `ownerId` and `createdAt`) and `ProjectCollaborator` (`projectId` relation with `onDelete: Cascade`, `email`, `createdAt`, unique on `[projectId, email]`, indexes on `email` and `[projectId, createdAt]`). `prisma.config.ts` already pointed `schema` at the `prisma/` folder, so the multi-file schema (`schema.prisma` + `models/project.prisma`) needed no config changes.
  - `lib/prisma.ts` — cached singleton exported as `prisma`. Branches on whether `DATABASE_URL` starts with `prisma+postgres://`: that path constructs `new PrismaClient({ accelerateUrl })`, otherwise `new PrismaClient({ adapter: new PrismaPg({ connectionString }) })` (Prisma 7's `PrismaClientOptions` is a discriminated union — `accelerateUrl` and `adapter` are mutually exclusive). Cached on `globalThis` outside production so Next.js dev hot-reloads reuse one client instance.
  - Ran `prisma migrate dev --name init` against the `DATABASE_URL` in `.env.local` (a pooled Prisma Postgres instance reached via the plain `postgres://` protocol, so it takes the `@prisma/adapter-pg` branch, not Accelerate) and `prisma generate`; client output goes to `app/generated/prisma` (already gitignored), generator `provider = "prisma-client"`.
- **Architecture decisions**:
  - `ownerId`/`email` are plain `String` fields, not foreign keys into a local `User` table — Clerk is the identity system of record (per `architecture-context.md`), so Prisma only stores the Clerk user ID/email, never user profile data.
- **Session notes**: Verified `prisma validate`, `prisma migrate dev` (applied cleanly, no drift), `tsc --noEmit`, and `npm run build` all pass.

### Feature 06 — Project APIs

Spec: `context/feature-specs/06-project-apis.md` — complete.

- **Completed**:
  - `app/api/projects/route.ts` — `GET` lists the authenticated user's own projects (`ownerId` match, newest first); `POST` creates a project owned by the authenticated user, defaulting a missing/blank `name` to `"Untitled Project"`, relying on the schema's `cuid()` default for `id`.
  - `app/api/projects/[projectId]/route.ts` — `PATCH` renames (400 if `name` is missing/blank after trim); `DELETE` removes the project. Both share a local `requireOwnedProject` helper: 404 if the project doesn't exist, 403 if the authenticated user isn't the owner.
  - `proxy.ts` — added an `isApiRoute` matcher (`/api/(.*)`) so `/api` requests short-circuit to a JSON `401` when signed out, instead of falling through to `auth.protect()`'s sign-in redirect (which is correct for page routes but wrong for an API consumer). Route handlers still re-check `userId` themselves as defense in depth.
- **Architecture decisions**:
  - Listing is owner-only (`ownerId` match), not collaborator-inclusive — the spec says "list current user's projects" and only defines owner-based rules; `ProjectCollaborator` is keyed by `email`, not Clerk user ID, so resolving "projects I collaborate on" would require mapping the authenticated user to their Clerk email, which isn't specified here. Left as a gap for whenever collaborator-facing routes are actually specced, rather than invented now.
  - No shared `lib/` module was added for the ownership check — it's two call sites in one file, factored into a local (non-exported) helper in `[projectId]/route.ts` rather than a new cross-file abstraction.
- **Session notes**: Verified `tsc --noEmit`, `npm run lint`, and `npm run build` all pass (routes compile as dynamic: `ƒ /api/projects`, `ƒ /api/projects/[projectId]`). End-to-end verified against the running dev server using two real Clerk test users created/cleaned up via the Backend API (test-mode instance, `pk_test_...`) and Bearer session tokens: unauthenticated requests to all four handlers return `401`; create defaults the name and stamps the caller as `ownerId`; list is isolated per owner; non-owner `PATCH`/`DELETE` return `403`; owner `PATCH` returns `200` with the updated record, owner `DELETE` returns `204`; empty-name rename returns `400`; renaming/deleting a nonexistent or already-deleted project returns `404`. No UI wiring was touched, per the spec.

### Feature 07 — Wire Editor Home

Spec: `context/feature-specs/07-wire-editor-home.md` — complete.

- **Completed**:
  - `lib/projects.ts` (new) — the "project data helper" the spec refers to: `getOwnedProjects(userId)` and `getSharedProjects(email)`, both thin `prisma.project.findMany` wrappers. `app/api/projects/route.ts` `GET` now calls `getOwnedProjects` instead of querying inline.
  - `app/editor/layout.tsx` — converted to an `async` Server Component: resolves `auth()` + `currentUser()`, calls both data-helper functions, and passes the two lists into `EditorShell` as `ownedProjects`/`sharedProjects` props. No client-side fetch anywhere in the initial load path.
  - `hooks/use-project-actions.ts` (renamed from `use-project-dialogs.ts`, exported hook renamed `useProjectActions`) — owns only dialog state, the name input, and the three real mutations; it no longer owns the project list itself (see architecture decision below). Create generates a suffix (`generateSuffix()` in `lib/utils.ts`) once when the dialog opens, derives `roomId = slugify(name) + "-" + suffix`, POSTs `{ id: roomId, name }` to `/api/projects`, then `router.push` to the new workspace. Rename PATCHes then `router.refresh()`s. Delete DELETEs then either `router.push("/editor")` (if `useParams().projectId` matches the deleted project, i.e. you deleted the workspace you're standing in) or `router.refresh()` otherwise.
  - `components/editor/project-dialogs-context.tsx` — `ProjectDialogsProvider` now takes `ownedProjects`/`sharedProjects` as props (from the layout) and merges them into the same context value as the `useProjectActions()` return, so the sidebar reads real data and the dialogs still trigger through one place.
  - `components/editor/editor-shell.tsx`, `components/editor/project-sidebar.tsx` — updated to thread/consume `ownedProjects`/`sharedProjects` directly (no more client-side `.filter(p => p.role === ...)`, since the two lists now arrive pre-split from the server).
  - `components/editor/project-dialogs.tsx` — Create dialog's live preview now shows the room ID (`roomId` from the hook) instead of a bare slug, per "create dialog shows room ID preview".
  - `app/api/projects/route.ts` `POST` — accepts an optional `id` in the request body (validated against `/^[a-z0-9-]+$/`, 400 if invalid) and uses it as the Prisma-created project's id instead of the auto `cuid()`, so the client-generated room ID and the project's real database id are the same value; returns 409 on a `P2002` unique-constraint collision.
  - `app/editor/[projectId]/page.tsx` (new) — minimal placeholder workspace route so "create navigates to workspace" is a real, working navigation target; Server Component, gates on owner or email-matched collaborator, `notFound()` otherwise.
  - `types/project.ts` — now just re-exports Prisma's generated `Project` type; the old hand-rolled `{ id, name, slug, role }` mock shape and `lib/mock-projects.ts` were deleted (Prisma's `Project` has no `slug`/`role` columns — "owner" vs "shared" is now expressed by which list a project is in, not a field on the project).
- **Architecture decisions**:
  - Data fetching happens in `app/editor/layout.tsx`, not `app/editor/page.tsx`. The spec says "the editor home page is a server component... fetch... and pass both lists to the sidebar," but the sidebar is rendered by `EditorShell` at the layout level (a sibling of the page content, per the Feature 04 decision), not a child of `page.tsx` — a page cannot hand props to an ancestor layout's descendants. Fetching in the layout is also correct going forward: the same sidebar will need this data on the new `/editor/[projectId]` workspace route too, not just the home route, and layout-level fetching avoids a client-side hydration/flash step to get data from page to sidebar.
  - `useProjectActions` deliberately does not hold the project list in state anymore (the old mock hook did). The list now lives entirely server-side and flows down as props/context; mutations call the API then `router.refresh()` (or `router.push`) to pull fresh server data, rather than hand-mutating a local copy. This matches the spec's explicit "refresh on success" / "redirect... otherwise refresh" wording and avoids a client/server state-sync class of bugs.
  - `POST /api/projects` accepting a caller-supplied `id` is new surface not in the original Feature 06 spec, added because Feature 07 explicitly requires "the project ID and Liveblocks room ID should stay aligned" — Liveblocks itself isn't wired up yet (no dependency installed), so this only future-proofs the id; the actual room creation will happen when the Collaborative Canvas feature is built.
- **Session notes**: Verified `tsc --noEmit`, `npm run lint`, and `npm run build` all pass (`/editor`, `/editor/[projectId]`, `/api/projects`, `/api/projects/[projectId]` all compile). Verified against the running dev server that unauthenticated requests to `/editor`, `/editor/[projectId]`, and `POST /api/projects` all correctly 307-redirect (pages) or 401 (API). End-to-end verified with a real Clerk test-mode user via an authenticated headless-browser session (sign-in token flow, not just Bearer API calls): empty-state sidebar renders correctly; Create dialog's room-id preview updates live and the create flow reaches the new workspace page; Rename updates the sidebar immediately; Delete-while-on-own-workspace redirects to `/editor`; invalid/duplicate `id` on `POST /api/projects` correctly returns 400/409. This surfaced one real bug: `submitCreate` only called `router.push()`, so the sidebar still showed the stale (empty) list immediately after create until a manual reload, since Next.js's client router cache didn't know to refetch the layout — fixed by also calling `router.refresh()` right after the push, matching the pattern already used in rename/delete. Re-ran `tsc`/`lint` clean after the fix. Test Clerk users and orphaned test `Project` rows were cleaned up after verification; no test-script artifacts left in the repo.

## Next Up

- Build the real `/editor/[projectId]` canvas workspace (Liveblocks + React Flow), replacing the current placeholder page.

## Open Questions

- Clicking an existing project row in the sidebar does not yet navigate to its workspace (`/editor/[projectId]`) — only "create" does. "Selecting a project" is part of the core user flow in `project-overview.md` but wasn't in this feature's "Check When Done" list, so it wasn't added here to avoid inventing unspecified behavior. Needs a spec before implementing.

## Architecture Decisions

- Cross-feature decisions not tied to a single feature go here. See each feature's own "Architecture decisions" above for feature-specific ones.
