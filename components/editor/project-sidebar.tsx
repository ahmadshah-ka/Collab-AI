"use client"

import { useEffect, useRef } from "react"
import { FolderOpen, MoreVertical, Pencil, Plus, Trash2, X } from "lucide-react"

import { SIDEBAR_TOGGLE_ID } from "@/components/editor/editor-navbar"
import { useProjectDialogsContext } from "@/components/editor/project-dialogs-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { Project } from "@/types/project"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
}

function EmptyProjectsState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <FolderOpen className="h-8 w-8 text-copy-faint" />
      <p className="text-sm text-copy-muted">No projects yet</p>
    </div>
  )
}

function ProjectListItem({
  project,
  showActions,
  onRename,
  onDelete,
}: {
  project: Project
  showActions: boolean
  onRename: (project: Project) => void
  onDelete: (project: Project) => void
}) {
  return (
    <div className="group flex items-center gap-1 rounded-xl px-2 py-1.5 hover:bg-subtle">
      <span className="flex-1 truncate text-sm text-copy-secondary">
        {project.name}
      </span>
      {showActions && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={`Actions for ${project.name}`}
                className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 aria-expanded:opacity-100"
              />
            }
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onRename(project)}>
              <Pencil className="h-4 w-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(project)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}

function ProjectList({
  projects,
  showActions,
  onRename,
  onDelete,
}: {
  projects: Project[]
  showActions: boolean
  onRename: (project: Project) => void
  onDelete: (project: Project) => void
}) {
  if (projects.length === 0) {
    return <EmptyProjectsState />
  }

  return (
    <div className="flex flex-col gap-0.5">
      {projects.map((project) => (
        <ProjectListItem
          key={project.id}
          project={project}
          showActions={showActions}
          onRename={onRename}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  const wasOpenRef = useRef(isOpen)
  const { projects, openCreateDialog, openRenameDialog, openDeleteDialog } =
    useProjectDialogsContext()

  const ownedProjects = projects.filter((p) => p.role === "owner")
  const sharedProjects = projects.filter((p) => p.role === "collaborator")

  useEffect(() => {
    if (wasOpenRef.current && !isOpen) {
      document.getElementById(SIDEBAR_TOGGLE_ID)?.focus()
    }
    wasOpenRef.current = isOpen
  }, [isOpen])

  return (
    <>
      {isOpen && (
        <div
          aria-hidden="true"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
        />
      )}
      <aside
        inert={!isOpen}
        aria-hidden={!isOpen}
        className={cn(
          "fixed top-[4.5rem] bottom-4 left-4 z-40 flex w-80 flex-col rounded-2xl border border-surface-border bg-surface/95 shadow-2xl backdrop-blur-sm transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-[calc(100%+1rem)]"
        )}
      >
        <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
          <h2 className="font-heading text-sm font-medium text-copy-primary">
            Projects
          </h2>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Close sidebar"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Tabs defaultValue="my-projects" className="flex-1 overflow-y-auto px-4 py-3">
          <TabsList className="w-full">
            <TabsTrigger value="my-projects">My Projects</TabsTrigger>
            <TabsTrigger value="shared">Shared</TabsTrigger>
          </TabsList>
          <TabsContent value="my-projects">
            <ProjectList
              projects={ownedProjects}
              showActions
              onRename={openRenameDialog}
              onDelete={openDeleteDialog}
            />
          </TabsContent>
          <TabsContent value="shared">
            <ProjectList
              projects={sharedProjects}
              showActions={false}
              onRename={openRenameDialog}
              onDelete={openDeleteDialog}
            />
          </TabsContent>
        </Tabs>

        <div className="border-t border-surface-border p-4">
          <Button className="w-full" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  )
}
