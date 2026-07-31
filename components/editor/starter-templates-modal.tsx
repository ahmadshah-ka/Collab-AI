"use client"

import { LayoutTemplate } from "lucide-react"

import { StarterTemplatePreview } from "@/components/editor/starter-template-preview"
import { CANVAS_TEMPLATES } from "@/components/editor/starter-templates"
import { useStarterTemplatesContext } from "@/components/editor/starter-templates-context"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function StarterTemplatesModal() {
  const { isTemplatesModalOpen, closeTemplatesModal, importTemplate } = useStarterTemplatesContext()

  return (
    <Dialog
      open={isTemplatesModalOpen}
      onOpenChange={(open) => {
        if (!open) closeTemplatesModal()
      }}
    >
      <DialogContent className="sm:max-w-3xl lg:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Starter templates</DialogTitle>
          <DialogDescription>
            Import a prebuilt system design. This replaces everything currently on the canvas.
          </DialogDescription>
        </DialogHeader>

        <div className="grid max-h-[32rem] grid-cols-1 gap-4 overflow-y-auto pr-1 sm:grid-cols-3">
          {CANVAS_TEMPLATES.map((template) => (
            <div
              key={template.id}
              className="flex flex-col gap-3 rounded-2xl border border-surface-border bg-surface p-3"
            >
              <StarterTemplatePreview template={template} />
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-medium text-copy-primary">{template.name}</h3>
                <p className="text-xs text-copy-muted">{template.description}</p>
              </div>
              <Button
                type="button"
                size="sm"
                className="mt-auto"
                onClick={() => importTemplate(template)}
              >
                <LayoutTemplate className="h-3.5 w-3.5" />
                Import
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
