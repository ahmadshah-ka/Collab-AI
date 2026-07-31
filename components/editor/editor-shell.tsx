"use client"

import { useState } from "react"

import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { ProjectDialogsProvider } from "@/components/editor/project-dialogs-context"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { ShareDialog } from "@/components/editor/share-dialog"
import { ShareDialogProvider } from "@/components/editor/share-dialog-context"
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal"
import { StarterTemplatesProvider } from "@/components/editor/starter-templates-context"
import { WorkspaceUiProvider } from "@/components/editor/workspace-ui-context"
import type { Project } from "@/types/project"

interface EditorShellProps {
  children: React.ReactNode
  ownedProjects: Project[]
  sharedProjects: Project[]
}

export function EditorShell({
  children,
  ownedProjects,
  sharedProjects,
}: EditorShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <ProjectDialogsProvider
      ownedProjects={ownedProjects}
      sharedProjects={sharedProjects}
    >
      <ShareDialogProvider>
        <StarterTemplatesProvider>
          <WorkspaceUiProvider>
            <div className="flex h-screen flex-col bg-base">
              <EditorNavbar
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
              />
              <div className="relative flex-1 overflow-hidden">
                <ProjectSidebar
                  isOpen={isSidebarOpen}
                  onClose={() => setIsSidebarOpen(false)}
                />
                <main className="h-full w-full">{children}</main>
              </div>
              <ProjectDialogs />
              <ShareDialog />
              <StarterTemplatesModal />
            </div>
          </WorkspaceUiProvider>
        </StarterTemplatesProvider>
      </ShareDialogProvider>
    </ProjectDialogsProvider>
  )
}
