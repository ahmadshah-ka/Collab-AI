"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Check, Copy, Link2, ShieldCheck, Trash2, UserPlus } from "lucide-react"
import Image from "next/image"

import { useShareDialogContext } from "@/components/editor/share-dialog-context"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

const COPIED_FEEDBACK_MS = 2000
const LOAD_COLLABORATORS_DELAY_MS = 0
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface AccessPerson {
  id: string
  email: string
  displayName: string | null
  avatarImageUrl: string | null
  createdAt: string
  role: "owner" | "collaborator"
}

interface CollaboratorsResponse {
  canManage: boolean
  peopleWithAccess: AccessPerson[]
}

function getInitials(person: AccessPerson) {
  const name = getPersonLabel(person)
  return name.slice(0, 1).toUpperCase()
}

function getPersonLabel(person: AccessPerson) {
  return person.displayName ?? (person.email || "Project owner")
}

function AccessPersonAvatar({ person }: { person: AccessPerson }) {
  if (person.avatarImageUrl) {
    return (
      <Image
        src={person.avatarImageUrl}
        alt=""
        width={32}
        height={32}
        unoptimized
        className="h-8 w-8 rounded-full border border-surface-border object-cover"
      />
    )
  }

  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-surface-border bg-subtle text-xs font-medium text-copy-secondary">
      {getInitials(person)}
    </span>
  )
}

function AccessRoleBadge({ role }: { role: AccessPerson["role"] }) {
  const isOwner = role === "owner"

  return (
    <span
      className={
        isOwner
          ? "rounded-full border border-brand/40 bg-accent-dim px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-brand"
          : "rounded-full border border-surface-border bg-subtle px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-copy-muted"
      }
    >
      {isOwner ? "Owner" : "Collaborator"}
    </span>
  )
}

export function ShareDialog() {
  const { shareDialog, closeShareDialog } = useShareDialogContext()
  const [peopleWithAccess, setPeopleWithAccess] = useState<AccessPerson[]>([])
  const [serverCanManage, setServerCanManage] = useState(false)
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)

  const projectId = shareDialog?.projectId
  const currentProjectIdRef = useRef<string | null>(null)
  const canManage = serverCanManage || Boolean(shareDialog?.canManage)

  const projectLink = useMemo(() => {
    if (!projectId || typeof window === "undefined") {
      return ""
    }

    return `${window.location.origin}/editor/${projectId}`
  }, [projectId])

  const loadCollaborators = useCallback(async (requestedProjectId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/projects/${requestedProjectId}/collaborators`
      )

      if (currentProjectIdRef.current !== requestedProjectId) {
        return
      }

      if (!response.ok) {
        setError("Could not load collaborators.")
        return
      }

      const data = (await response.json()) as CollaboratorsResponse
      if (currentProjectIdRef.current !== requestedProjectId) {
        return
      }

      setPeopleWithAccess(data.peopleWithAccess)
      setServerCanManage(data.canManage)
    } catch {
      if (currentProjectIdRef.current === requestedProjectId) {
        setError("Could not load collaborators.")
      }
    } finally {
      if (currentProjectIdRef.current === requestedProjectId) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    if (!shareDialog) {
      currentProjectIdRef.current = null
      return
    }

    const requestedProjectId = shareDialog.projectId
    currentProjectIdRef.current = requestedProjectId

    const timeout = window.setTimeout(() => {
      loadCollaborators(requestedProjectId)
    }, LOAD_COLLABORATORS_DELAY_MS)

    return () => window.clearTimeout(timeout)
  }, [shareDialog, loadCollaborators])

  const resetDialogState = useCallback(() => {
    setPeopleWithAccess([])
    setEmail("")
    setError(null)
    setCopied(false)
    setServerCanManage(false)
  }, [])

  useEffect(() => {
    if (!copied) {
      return
    }

    const timeout = window.setTimeout(() => {
      setCopied(false)
    }, COPIED_FEEDBACK_MS)

    return () => window.clearTimeout(timeout)
  }, [copied])

  const inviteCollaborator = useCallback(async () => {
    if (!projectId || isSubmitting) {
      return
    }

    const normalizedEmail = email.trim().toLowerCase()

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setError("Enter a valid email address.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      })

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          error?: string
        }
        setError(data.error ?? "Could not invite collaborator.")
        return
      }

      const data = (await response.json()) as { collaborator: AccessPerson }
      setPeopleWithAccess((current) => [...current, data.collaborator])
      setEmail("")
    } catch {
      setError("Could not invite collaborator.")
    } finally {
      setIsSubmitting(false)
    }
  }, [email, isSubmitting, projectId])

  const removeCollaborator = useCallback(
    async (collaboratorId: string) => {
      if (!projectId || isSubmitting) {
        return
      }

      setIsSubmitting(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/projects/${projectId}/collaborators/${collaboratorId}`,
          { method: "DELETE" }
        )

        if (!response.ok) {
          setError("Could not remove collaborator.")
          return
        }

        setPeopleWithAccess((current) =>
          current.filter((person) => person.id !== collaboratorId)
        )
      } catch {
        setError("Could not remove collaborator.")
      } finally {
        setIsSubmitting(false)
      }
    },
    [isSubmitting, projectId]
  )

  const copyProjectLink = useCallback(async () => {
    if (!projectLink) {
      return
    }

    try {
      await navigator.clipboard.writeText(projectLink)
      setCopied(true)
      setError(null)
    } catch {
      setError("Could not copy the project link.")
    }
  }, [projectLink])

  return (
    <Dialog
      open={Boolean(shareDialog)}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) {
          resetDialogState()
          closeShareDialog()
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share project</DialogTitle>
          <DialogDescription>
            Invite collaborators or copy the workspace link.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface p-2">
            <Link2 className="h-4 w-4 shrink-0 text-copy-muted" />
            <span className="min-w-0 flex-1 truncate text-xs text-copy-muted">
              {projectLink}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copyProjectLink}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>

          {canManage ? (
            <form
              className="flex items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault()
                inviteCollaborator()
              }}
            >
              <Input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  if (error) setError(null)
                }}
                placeholder="teammate@example.com"
              />
              <Button type="submit" disabled={isSubmitting}>
                <UserPlus className="h-3.5 w-3.5" />
                Invite
              </Button>
            </form>
          ) : null}

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-copy-faint">
                People with access
              </p>
              {isLoading ? (
                <p className="text-xs text-copy-muted">Loading...</p>
              ) : (
                <p className="text-xs text-copy-muted">
                  {peopleWithAccess.length} total
                </p>
              )}
            </div>

            <div className="max-h-64 overflow-y-auto rounded-xl border border-surface-border">
              {peopleWithAccess.length > 0 ? (
                peopleWithAccess.map((person) => (
                  <div
                    key={`${person.role}-${person.id}`}
                    className="flex items-center gap-3 border-b border-surface-border px-3 py-2 last:border-b-0"
                  >
                    <AccessPersonAvatar person={person} />
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-2">
                        <p className="truncate text-sm font-medium text-copy-primary">
                          {getPersonLabel(person)}
                        </p>
                        <AccessRoleBadge role={person.role} />
                      </div>
                      {person.displayName ? (
                        <p className="truncate text-xs text-copy-muted">
                          {person.email}
                        </p>
                      ) : null}
                    </div>
                    {canManage && person.role === "collaborator" ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Remove ${person.email}`}
                        disabled={isSubmitting}
                        onClick={() => removeCollaborator(person.id)}
                      >
                        <Trash2 className="h-4 w-4 text-error" />
                      </Button>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                  <ShieldCheck className="h-5 w-5 text-copy-faint" />
                  <p className="text-sm text-copy-muted">
                    {isLoading
                      ? "Loading people with access."
                      : error
                        ? "People with access could not be loaded."
                        : "No people with access yet."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {error ? (
            <p className="text-xs text-error" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  )
}
