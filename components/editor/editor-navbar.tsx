"use client"

import { UserButton } from "@clerk/nextjs"
import { LayoutTemplate, PanelLeftClose, PanelLeftOpen, Share2, Sparkles } from "lucide-react"
import { useParams } from "next/navigation"

import { useProjectDialogsContext } from "@/components/editor/project-dialogs-context"
import { useShareDialogContext } from "@/components/editor/share-dialog-context"
import { useStarterTemplatesContext } from "@/components/editor/starter-templates-context"
import { useWorkspaceUiContext } from "@/components/editor/workspace-ui-context"
import { Button } from "@/components/ui/button"

export const SIDEBAR_TOGGLE_ID = "editor-sidebar-toggle"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
}

export function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
}: EditorNavbarProps) {
  const { roomId } = useParams<{ roomId?: string }>()
  const { ownedProjects, sharedProjects } = useProjectDialogsContext()
  const { openShareDialog } = useShareDialogContext()
  const { openTemplatesModal } = useStarterTemplatesContext()
  const { isAiSidebarOpen, toggleAiSidebar } = useWorkspaceUiContext()

  const ownedProject = roomId
    ? ownedProjects.find((p) => p.id === roomId)
    : undefined
  const sharedProject = roomId
    ? sharedProjects.find((p) => p.id === roomId)
    : undefined
  const project = ownedProject ?? sharedProject
  const canManageSharing = Boolean(ownedProject)

  return (
    <nav className="flex h-14 shrink-0 items-center gap-3 border-b border-surface-border bg-surface px-4">
      <Button
        id={SIDEBAR_TOGGLE_ID}
        variant="ghost"
        size="icon-sm"
        aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        onClick={onToggleSidebar}
      >
        {isSidebarOpen ? (
          <PanelLeftClose className="h-4 w-4" />
        ) : (
          <PanelLeftOpen className="h-4 w-4" />
        )}
      </Button>

      {project ? (
        <div className="flex min-w-0 flex-col justify-center leading-tight">
          <span className="truncate text-sm font-medium text-copy-primary">
            {project.name}
          </span>
          <span className="text-xs text-copy-muted">Workspace</span>
        </div>
      ) : null}

      <div className="flex flex-1 items-center justify-end gap-2">
        {project ? (
          <>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={openTemplatesModal}
            >
              <LayoutTemplate className="h-3.5 w-3.5" />
              Templates
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => openShareDialog(project.id, canManageSharing)}
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </Button>
            <Button
              variant={isAiSidebarOpen ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              aria-pressed={isAiSidebarOpen}
              aria-label={isAiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"}
              onClick={toggleAiSidebar}
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI
            </Button>
          </>
        ) : null}
        <UserButton />
      </div>
    </nav>
  )
}
