"use client"

import { useCallback, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"

import { generateSuffix, slugify } from "@/lib/utils"
import type { Project } from "@/types/project"

type DialogState =
  | { type: "create" }
  | { type: "rename"; project: Project }
  | { type: "delete"; project: Project }
  | null

export function useProjectActions() {
  const router = useRouter()
  const params = useParams<{ projectId?: string }>()

  const [dialog, setDialog] = useState<DialogState>(null)
  const [name, setName] = useState("")
  const [suffix, setSuffix] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const openCreateDialog = useCallback(() => {
    setName("")
    setSuffix(generateSuffix())
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

  const roomId = useMemo(() => {
    const slug = slugify(name)
    return slug ? `${slug}-${suffix}` : ""
  }, [name, suffix])

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

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: `${slug}-${suffix}`, name: trimmed }),
      })

      if (!response.ok) {
        setError("Could not create project. Try again.")
        setIsLoading(false)
        return
      }

      const { project } = (await response.json()) as { project: Project }
      setIsLoading(false)
      closeDialog()
      router.push(`/editor/${project.id}`)
      router.refresh()
    } catch {
      setError("Could not create project. Try again.")
      setIsLoading(false)
    }
  }, [name, suffix, closeDialog, router])

  const submitRename = useCallback(async () => {
    if (dialog?.type !== "rename") return
    const trimmed = name.trim()
    if (!trimmed) return

    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch(`/api/projects/${dialog.project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      })

      if (!response.ok) {
        setError("Could not rename project. Try again.")
        setIsLoading(false)
        return
      }

      setIsLoading(false)
      closeDialog()
      router.refresh()
    } catch {
      setError("Could not rename project. Try again.")
      setIsLoading(false)
    }
  }, [dialog, name, closeDialog, router])

  const submitDelete = useCallback(async () => {
    if (dialog?.type !== "delete") return
    const { project } = dialog

    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        setError("Could not delete project. Try again.")
        setIsLoading(false)
        return
      }

      setIsLoading(false)
      closeDialog()

      if (params.projectId === project.id) {
        router.push("/editor")
      } else {
        router.refresh()
      }
    } catch {
      setError("Could not delete project. Try again.")
      setIsLoading(false)
    }
  }, [dialog, params.projectId, closeDialog, router])

  return {
    dialog,
    name,
    setName,
    roomId,
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

export type UseProjectActionsReturn = ReturnType<typeof useProjectActions>
