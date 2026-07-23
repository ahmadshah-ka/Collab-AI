import { dark } from "@clerk/ui/themes"

/**
 * Maps Clerk's `dark` theme onto the app's own CSS custom properties
 * (context/ui-context.md) instead of the theme's hardcoded hex values.
 */
export const clerkAppearance = {
  theme: dark,
  variables: {
    colorPrimary: "var(--accent-primary)",
    colorPrimaryForeground: "var(--bg-base)",
    colorBackground: "var(--bg-surface)",
    colorForeground: "var(--text-primary)",
    colorInput: "var(--bg-elevated)",
    colorInputForeground: "var(--text-primary)",
    colorNeutral: "var(--text-primary)",
    colorMuted: "var(--bg-subtle)",
    colorMutedForeground: "var(--text-muted)",
    colorBorder: "var(--border-default)",
    colorRing: "var(--accent-primary)",
    colorDanger: "var(--state-error)",
    colorSuccess: "var(--state-success)",
    colorWarning: "var(--state-warning)",
    colorShimmer: "var(--border-subtle)",
    fontFamily: "var(--font-geist-sans)",
    borderRadius: "calc(var(--radius) * 1.8)",
  },
}
