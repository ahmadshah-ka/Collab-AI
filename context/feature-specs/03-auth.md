Clerk is already installed and connected. Wire it into the Next.js app: provider, auth pages, redirects, route protection, and user menu.

## Design

Use Clerk’s `dark` theme from `@clerk/ui/themes` as the base.

Override Clerk appearance variables using the app’s existing CSS variables. Do not hardcode colors.

Sign-in and sign-up pages:

- large screens: exact 50/50 two-panel layout (`lg:grid-cols-2`)
- left: solid color panel (`bg-accent-dim` over the base background — a flat tint, not a gradient) containing a compact logo, a short heading + supporting sentence, and an icon-prefixed feature list (icon chip + title + one-line description per item; no bordered/background "card" chrome around each item)
- right: centered Clerk form on the plain base background
- small screens: form only (left panel hidden below `lg`)
- no gradients
- no oversized hero sections (heading capped at `text-3xl`)
- no scroll-heavy layouts

Keep the layout minimal and professional. Typography uses the app's Geist Sans token (`font-sans`) throughout, including inside Clerk's rendered components (via the `fontFamily` appearance variable).

## Implementation

Wrap the root layout with `ClerkProvider` using Clerk’s `dark` theme.

Create sign-in and sign-up pages using Clerk components.

Use `proxy.ts` at the project root, not `middleware.ts`.

Define public routes using the existing sign-in and sign-up env vars. Protect everything else by default.

Update `/`:

- authenticated users redirect to `/editor`
- unauthenticated users redirect to `/sign-in`

Add Clerk’s built-in `UserButton` to the editor navbar right section for profile settings and logout.

Keep Clerk’s default user menu and profile flows intact. Do not rebuild or heavily customize Clerk internals.

Use existing Clerk env vars. Do not rename or invent new ones.

## Dependencies

install: @clerk/nextjs, @clerk/ui.

## Check When Done

- `proxy.ts` exists at the root
- all routes are protected except public auth paths
- auth pages use CSS variables with no hardcoded colors
- `ClerkProvider` wraps the root layout
- `npm run build` passes
