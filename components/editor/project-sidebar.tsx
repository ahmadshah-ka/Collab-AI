"use client"

import { useEffect, useRef } from "react"
import { FolderOpen, Pencil, Plus, Trash2, X } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

import { SIDEBAR_TOGGLE_ID } from "@/components/editor/editor-navbar"
import { useProjectDialogsContext } from "@/components/editor/project-dialogs-context"
import { Button } from "@/components/ui/button"
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
  isActive,
  onRename,
  onDelete,
  onNavigate,
}: {
  project: Project
  showActions: boolean
  isActive: boolean
  onRename: (project: Project) => void
  onDelete: (project: Project) => void
  onNavigate: () => void
}) {
  return (
    <div
      className={cn(
        "group flex items-center gap-1 rounded-xl px-2 py-1.5 hover:bg-subtle",
        isActive && "bg-accent-dim"
      )}
    >
      <Link
        href={`/editor/${project.id}`}
        onClick={onNavigate}
        className="flex flex-1 items-center gap-2 truncate text-sm"
      >
        {isActive ? (
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
        ) : null}
        <span
          className={cn(
            "truncate",
            isActive ? "font-medium text-copy-primary" : "text-copy-secondary"
          )}
        >
          {project.name}
        </span>
      </Link>
      {showActions && (
        <div
          className={cn(
            "shrink-0 items-center gap-1",
            isActive ? "flex" : "hidden lg:flex"
          )}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={`Rename ${project.name}`}
            onClick={() => onRename(project)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={`Delete ${project.name}`}
            onClick={() => onDelete(project)}
          >
            <Trash2 className="h-3.5 w-3.5 text-error" />
          </Button>
        </div>
      )}
    </div>
  )
}

function ProjectList({
  projects,
  showActions,
  activeProjectId,
  onRename,
  onDelete,
  onNavigate,
}: {
  projects: Project[]
  showActions: boolean
  activeProjectId?: string
  onRename: (project: Project) => void
  onDelete: (project: Project) => void
  onNavigate: () => void
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
          isActive={project.id === activeProjectId}
          onRename={onRename}
          onDelete={onDelete}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  )
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  const { roomId } = useParams<{ roomId?: string }>()
  const wasOpenRef = useRef(isOpen)
  const {
    ownedProjects,
    sharedProjects,
    openCreateDialog,
    openRenameDialog,
    openDeleteDialog,
  } = useProjectDialogsContext()

  useEffect(() => {
    if (wasOpenRef.current && !isOpen) {
      document.getElementById(SIDEBAR_TOGGLE_ID)?.focus()
    }
    wasOpenRef.current = isOpen
  }, [isOpen])

  const handleNavigate = () => {
    if (window.matchMedia("(max-width: 1023px)").matches) {
      onClose()
    }
  }

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
          "fixed top-[4.5rem] bottom-4 left-4 z-40 flex w-80 flex-col overflow-hidden rounded-3xl border border-surface-border bg-surface/95 shadow-2xl backdrop-blur-sm transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-[calc(100%+5rem)]"
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
              activeProjectId={roomId}
              onRename={openRenameDialog}
              onDelete={openDeleteDialog}
              onNavigate={handleNavigate}
            />
          </TabsContent>
          <TabsContent value="shared">
            <ProjectList
              projects={sharedProjects}
              showActions={false}
              activeProjectId={roomId}
              onRename={openRenameDialog}
              onDelete={openDeleteDialog}
              onNavigate={handleNavigate}
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
