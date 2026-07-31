"use client"

import { Bot, Sparkles } from "lucide-react"
import { ClientSideSuspense, LiveblocksProvider, RoomProvider } from "@liveblocks/react/suspense"
import { ErrorBoundary } from "react-error-boundary"

import { Card } from "@/components/ui/card"
import { CollabCanvas } from "@/components/editor/collab-canvas"
import { useWorkspaceUiContext } from "@/components/editor/workspace-ui-context"
import { cn } from "@/lib/utils"

interface WorkspaceCanvasProps {
  roomId: string
}

export function WorkspaceCanvas({ roomId }: WorkspaceCanvasProps) {
  const { isAiSidebarOpen } = useWorkspaceUiContext()

  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider id={roomId} initialPresence={{ cursor: null, isThinking: false }}>
        <div className="relative h-full w-full bg-base">
          <ErrorBoundary
            fallback={
              <div className="flex h-full items-center justify-center text-sm text-copy-muted">
                Couldn&apos;t connect to the canvas.
              </div>
            }
          >
            <ClientSideSuspense
              fallback={
                <div className="flex h-full items-center justify-center text-sm text-copy-muted">
                  Loading canvas…
                </div>
              }
            >
              <CollabCanvas />
            </ClientSideSuspense>
          </ErrorBoundary>

          <aside
            inert={!isAiSidebarOpen}
            aria-hidden={!isAiSidebarOpen}
            className={cn(
              "fixed top-[4.5rem] bottom-4 right-4 z-40 hidden w-80 flex-col overflow-hidden rounded-3xl border border-surface-border bg-surface/95 shadow-2xl backdrop-blur-sm transition-transform duration-200 ease-in-out lg:flex",
              isAiSidebarOpen ? "translate-x-0" : "translate-x-[calc(100%+5rem)]"
            )}
          >
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
                  Prompt composer, run status, and architecture guidance
                  will attach to this sidebar.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </RoomProvider>
    </LiveblocksProvider>
  )
}
