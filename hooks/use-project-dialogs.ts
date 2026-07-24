"use client"

import { useCallback, useState } from "react"

import { MOCK_PROJECTS } from "@/lib/mock-projects"
import { slugify } from "@/lib/utils"
import type { Project } from "@/types/project"

type DialogState =
  | { type: "create" }
  | { type: "rename"; project: Project }
  | { type: "delete"; project: Project }
  | null

const MOCK_DELAY_MS = 400

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function useProjectDialogs() {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS)
  const [dialog, setDialog] = useState<DialogState>(null)
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const openCreateDialog = useCallback(() => {
    setName("")
    setDialog({ type: "create" })
    setError(null)
  }, [])

  const openRenameDialog = useCallback((project: Project) => {
    setName(project.name)
    setDialog({ type: "rename", project })
    setError(null)
  }, [])

  const openDeleteDialog = useCallback((project: Project) => {
    setDialog({ type: "delete", project })
    setError(null)
  }, [])

  const closeDialog = useCallback(() => {
    setDialog(null)
    setName("")
    setError(null)
  }, [])

  const submitCreate = useCallback(async () => {
    const trimmed = name.trim()
    if (!trimmed) return

    const slug = slugify(trimmed)
    if (!slug) {
      setError("Project name must include letters or numbers.")
      return
    }

    setError(null)
    setIsLoading(true)
    await wait(MOCK_DELAY_MS)
    setProjects((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: trimmed, slug, role: "owner" },
    ])
    setIsLoading(false)
    closeDialog()
  }, [name, closeDialog])

  const submitRename = useCallback(async () => {
    if (dialog?.type !== "rename") return
    const trimmed = name.trim()
    if (!trimmed) return

    const slug = slugify(trimmed)
    if (!slug) {
      setError("Project name must include letters or numbers.")
      return
    }

    const { project } = dialog
    setError(null)
    setIsLoading(true)
    await wait(MOCK_DELAY_MS)
    setProjects((prev) =>
      prev.map((p) =>
        p.id === project.id ? { ...p, name: trimmed, slug } : p
      )
    )
    setIsLoading(false)
    closeDialog()
  }, [dialog, name, closeDialog])

  const submitDelete = useCallback(async () => {
    if (dialog?.type !== "delete") return
    const { project } = dialog

    setIsLoading(true)
    await wait(MOCK_DELAY_MS)
    setProjects((prev) => prev.filter((p) => p.id !== project.id))
    setIsLoading(false)
    closeDialog()
  }, [dialog, closeDialog])

  return {
    projects,
    dialog,
    name,
    setName,
    slug: slugify(name),
    error,
    clearError,
    isLoading,
    openCreateDialog,
    openRenameDialog,
    openDeleteDialog,
    closeDialog,
    submitCreate,
    submitRename,
    submitDelete,
  }
}

export type UseProjectDialogsReturn = ReturnType<typeof useProjectDialogs>
