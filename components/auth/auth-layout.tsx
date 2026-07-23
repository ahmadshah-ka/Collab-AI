import { FileText, Sparkles, Users } from "lucide-react"

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI architecture generation",
    description:
      "Describe your system in plain English — AI maps it to nodes and edges on a live canvas.",
  },
  {
    icon: Users,
    title: "Real-time collaboration",
    description:
      "Live cursors, presence indicators, and shared node editing across your team.",
  },
  {
    icon: FileText,
    title: "Instant spec generation",
    description:
      "Export a complete Markdown technical spec directly from the canvas graph.",
  },
]

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen bg-base font-sans lg:grid-cols-2">
      <div className="hidden flex-col justify-between gap-10 bg-accent-dim px-16 py-16 lg:flex">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-dim text-sm font-semibold text-brand">
            C
          </div>
          <span className="text-lg font-semibold text-copy-primary">
            Collab AI
          </span>
        </div>

        <div className="max-w-md space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold leading-tight text-copy-primary">
              Design systems at the speed of thought.
            </h1>
            <p className="text-copy-secondary">
              Describe a system in plain English. Collab AI maps it to a
              shared canvas your whole team can refine in real time.
            </p>
          </div>

          <ul className="space-y-5">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-elevated text-brand">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-copy-primary">
                    {title}
                  </p>
                  <p className="text-sm text-copy-muted">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-copy-faint">
          © {new Date().getFullYear()} Collab AI. All rights reserved.
        </p>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        {children}
      </div>
    </div>
  )
}
