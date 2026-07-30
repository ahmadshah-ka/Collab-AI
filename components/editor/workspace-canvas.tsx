"use client"

import { Bot, Compass, Sparkles } from "lucide-react"

import { Card } from "@/components/ui/card"
import { useWorkspaceUiContext } from "@/components/editor/workspace-ui-context"

export function WorkspaceCanvas() {
  const { isAiSidebarOpen } = useWorkspaceUiContext()

  return (
    <div className="flex h-full gap-3">
      <div className="relative flex min-w-0 flex-1 items-center justify-center overflow-hidden rounded-3xl border border-surface-border bg-base px-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 45%, var(--accent-primary-dim), transparent 60%), linear-gradient(var(--border-default) 1px, transparent 1px), linear-gradient(90deg, var(--border-default) 1px, transparent 1px)",
            backgroundSize: "100% 100%, 32px 32px, 32px 32px",
          }}
        />
        <div className="relative flex max-w-md flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-brand/40 bg-accent-dim">
            <Compass className="h-6 w-6 text-brand" />
          </div>
          <p className="text-xs font-medium tracking-[0.2em] text-copy-faint uppercase">
            Workspace shell
          </p>
          <h2 className="text-2xl font-medium text-copy-primary">
            Canvas and collaboration tooling land here next.
          </h2>
          <p className="text-sm text-copy-muted">
            This room is ready for the shared architecture canvas, durable AI
            workflows, and real-time presence. For now, the shell is wired
            with project context and navigation only.
          </p>
        </div>
      </div>

      {isAiSidebarOpen ? (
        <aside className="hidden w-80 shrink-0 overflow-hidden rounded-3xl border border-surface-border bg-surface lg:block">
          <div className="flex h-full flex-col">
            <div className="flex items-start justify-between gap-2 border-b border-surface-border p-4">
              <div>
                <h3 className="font-heading text-sm font-medium text-copy-primary">
                  AI Copilot
                </h3>
                <p className="text-xs text-copy-muted">Placeholder panel</p>
              </div>
              <Sparkles className="h-4 w-4 shrink-0 text-ai-text" />
            </div>

            <div className="flex flex-1 flex-col gap-4 p-4">
              <Card size="sm" className="flex-row items-start gap-3 px-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ai/15 text-ai-text">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-copy-primary">
                    Chat surface pending
                  </p>
                  <p className="text-xs text-copy-muted">
                    The toggle is wired. Messaging and generation are
                    intentionally out of scope here.
                  </p>
                </div>
              </Card>

              <div className="mt-auto rounded-xl border border-dashed border-surface-border p-3">
                <p className="text-[11px] font-medium tracking-[0.15em] text-copy-faint uppercase">
                  Future hooks
                </p>
                <p className="mt-1 text-xs text-copy-muted">
                  Prompt composer, run status, and architecture guidance will
                  attach to this sidebar.
                </p>
              </div>
            </div>
          </div>
        </aside>
      ) : null}
    </div>
  )
}
