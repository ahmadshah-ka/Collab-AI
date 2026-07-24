"use client"

import { useProjectDialogsContext } from "@/components/editor/project-dialogs-context"
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

export function ProjectDialogs() {
  const {
    dialog,
    name,
    setName,
    slug,
    error,
    clearError,
    isLoading,
    closeDialog,
    submitCreate,
    submitRename,
    submitDelete,
  } = useProjectDialogsContext()

  return (
    <>
      <Dialog
        open={dialog?.type === "create"}
        onOpenChange={(open) => {
          if (!open && !isLoading) {
            closeDialog()
          }
        }}
      >
        <DialogContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              submitCreate()
            }}
          >
            <DialogHeader>
              <DialogTitle>Create project</DialogTitle>
              <DialogDescription>
                Name your project. You can rename it later.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2 py-2">
              <Input
                autoFocus
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (error) clearError()
                }}
                placeholder="My project"
              />
              <p className="text-xs text-copy-muted">{slug || "your-project-slug"}</p>
              {error ? (
                <p className="text-xs text-destructive" role="alert">
                  {error}
                </p>
              ) : null}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={!name.trim() || isLoading}>
                Create project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={dialog?.type === "rename"}
        onOpenChange={(open) => {
          if (!open && !isLoading) {
            closeDialog()
          }
        }}
      >
        <DialogContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              submitRename()
            }}
          >
            <DialogHeader>
              <DialogTitle>Rename project</DialogTitle>
              <DialogDescription>
                {dialog?.type === "rename"
                  ? `Renaming "${dialog.project.name}"`
                  : null}
              </DialogDescription>
            </DialogHeader>
            <div className="py-2">
              <Input
                autoFocus
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (error) clearError()
                }}
              />
              {error ? (
                <p className="text-xs text-destructive" role="alert">
                  {error}
                </p>
              ) : null}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={!name.trim() || isLoading}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={dialog?.type === "delete"}
        onOpenChange={(open) => {
          if (!open && !isLoading) {
            closeDialog()
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete project</DialogTitle>
            <DialogDescription>
              {dialog?.type === "delete"
                ? `This will permanently delete "${dialog.project.name}". This action cannot be undone.`
                : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="destructive"
              disabled={isLoading}
              onClick={() => submitDelete()}
            >
              Delete project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
