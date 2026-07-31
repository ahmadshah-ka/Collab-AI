# Starter Templates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a user replace the active canvas with a prebuilt starter system-design template (microservices, CI/CD pipeline, event-driven system) via a navbar-triggered modal.

**Architecture:** Static, in-repo template data (`CanvasTemplate[]`) typed against the existing shared canvas types (`CanvasNode`/`CanvasEdge`). A dialog-based modal (built on the existing `components/ui/dialog.tsx`) renders template cards with a lightweight hand-drawn (non-React-Flow) preview. Import is threaded from the navbar, through a new sibling-communication context (mirroring the existing `ShareDialogContext`/`WorkspaceUiContext` pattern), down into `CanvasFlow` (the component that actually owns `useLiveblocksFlow`'s `onNodesChange`/`onEdgesChange`), which clears the room's current nodes/edges and adds the template's nodes/edges through the same Liveblocks-backed change path every other canvas mutation already uses.

**Tech Stack:** Next.js 16 client components, `@xyflow/react` (`NodeChange`/`EdgeChange` "remove"/"add" primitives), `@liveblocks/react-flow`'s `useLiveblocksFlow`, `components/ui/dialog.tsx` (base-ui `Dialog`), Tailwind tokens from `context/ui-context.md`.

## Global Constraints

- No template saving, no custom user templates, no server persistence — spec's scope limits (`context/feature-specs/18-starter-templates.md`).
- Do not change node or edge rendering behavior (`CanvasNodeRenderer`/`CanvasEdgeRenderer` stay untouched; the preview must not require a React Flow instance).
- Use CSS custom property Tailwind tokens only — no raw hex/`zinc-*` classes (`context/code-standards.md`).
- Do not modify `components/ui/*` (protected foundation components) — compose around `dialog.tsx`/`button.tsx` as-is.
- `npm run build` must pass when done (spec's own "Check When Done").

---

### Task 1: Template data (`components/editor/starter-templates.ts`)

**Files:**
- Create: `components/editor/starter-templates.ts`

**Interfaces:**
- Produces: `CanvasTemplate` (`{ id: string; name: string; description: string; nodes: CanvasNode[]; edges: CanvasEdge[] }`) and `CANVAS_TEMPLATES: CanvasTemplate[]` (3 entries: `microservices`, `cicd-pipeline`, `event-driven`) — consumed by Task 2 (modal) and Task 3 (preview).
- Consumes: `CanvasNode`, `CanvasEdge`, `NodeShape`, `NODE_COLORS`, `SHAPE_DEFAULT_SIZES` from `@/types/canvas`.

- [ ] **Step 1: Write the file**

```ts
import { MarkerType } from "@xyflow/react"

import { NODE_COLORS, SHAPE_DEFAULT_SIZES, type CanvasEdge, type CanvasNode, type NodeShape } from "@/types/canvas"

export interface CanvasTemplate {
  id: string
  name: string
  description: string
  nodes: CanvasNode[]
  edges: CanvasEdge[]
}

interface TemplateNodeSpec {
  id: string
  shape: NodeShape
  label: string
  colorIndex: number
  x: number
  y: number
}

function createTemplateNode({ id, shape, label, colorIndex, x, y }: TemplateNodeSpec): CanvasNode {
  const { width, height } = SHAPE_DEFAULT_SIZES[shape]
  const { background, text } = NODE_COLORS[colorIndex]

  return {
    id,
    type: "canvasNode",
    position: { x, y },
    width,
    height,
    data: { label, color: background, textColor: text, shape },
  }
}

function createTemplateEdge(id: string, source: string, target: string, label?: string): CanvasEdge {
  return {
    id,
    type: "canvasEdge",
    source,
    target,
    markerEnd: { type: MarkerType.ArrowClosed, color: "#f8fafc" },
    data: { label },
  }
}

const MICROSERVICES_TEMPLATE: CanvasTemplate = {
  id: "microservices",
  name: "Microservices",
  description: "An API gateway routing to independent services, each backed by its own database.",
  nodes: [
    createTemplateNode({ id: "ms-gateway", shape: "hexagon", label: "API Gateway", colorIndex: 2, x: 260, y: 0 }),
    createTemplateNode({ id: "ms-auth", shape: "pill", label: "Auth Service", colorIndex: 1, x: 0, y: 180 }),
    createTemplateNode({ id: "ms-users", shape: "pill", label: "Users Service", colorIndex: 1, x: 220, y: 180 }),
    createTemplateNode({ id: "ms-orders", shape: "pill", label: "Orders Service", colorIndex: 1, x: 440, y: 180 }),
    createTemplateNode({ id: "ms-users-db", shape: "cylinder", label: "Users DB", colorIndex: 6, x: 220, y: 340 }),
    createTemplateNode({ id: "ms-orders-db", shape: "cylinder", label: "Orders DB", colorIndex: 6, x: 440, y: 340 }),
  ],
  edges: [
    createTemplateEdge("ms-e1", "ms-gateway", "ms-auth"),
    createTemplateEdge("ms-e2", "ms-gateway", "ms-users"),
    createTemplateEdge("ms-e3", "ms-gateway", "ms-orders"),
    createTemplateEdge("ms-e4", "ms-users", "ms-users-db"),
    createTemplateEdge("ms-e5", "ms-orders", "ms-orders-db"),
  ],
}

const CICD_TEMPLATE: CanvasTemplate = {
  id: "cicd-pipeline",
  name: "CI/CD Pipeline",
  description: "A linear pipeline from source push through build, test, and deploy to production.",
  nodes: [
    createTemplateNode({ id: "cicd-push", shape: "circle", label: "Git Push", colorIndex: 5, x: 0, y: 40 }),
    createTemplateNode({ id: "cicd-build", shape: "rectangle", label: "Build", colorIndex: 3, x: 200, y: 20 }),
    createTemplateNode({ id: "cicd-test", shape: "rectangle", label: "Test", colorIndex: 3, x: 420, y: 20 }),
    createTemplateNode({ id: "cicd-deploy", shape: "rectangle", label: "Deploy", colorIndex: 3, x: 640, y: 20 }),
    createTemplateNode({ id: "cicd-prod", shape: "hexagon", label: "Production", colorIndex: 2, x: 860, y: 0 }),
  ],
  edges: [
    createTemplateEdge("cicd-e1", "cicd-push", "cicd-build"),
    createTemplateEdge("cicd-e2", "cicd-build", "cicd-test"),
    createTemplateEdge("cicd-e3", "cicd-test", "cicd-deploy"),
    createTemplateEdge("cicd-e4", "cicd-deploy", "cicd-prod"),
  ],
}

const EVENT_DRIVEN_TEMPLATE: CanvasTemplate = {
  id: "event-driven",
  name: "Event-Driven System",
  description: "A producer publishes events through a broker to independent consumers.",
  nodes: [
    createTemplateNode({ id: "ed-producer", shape: "pill", label: "Producer Service", colorIndex: 1, x: 0, y: 120 }),
    createTemplateNode({ id: "ed-bus", shape: "hexagon", label: "Event Bus", colorIndex: 7, x: 220, y: 100 }),
    createTemplateNode({ id: "ed-consumer-a", shape: "pill", label: "Consumer A", colorIndex: 1, x: 460, y: 0 }),
    createTemplateNode({ id: "ed-consumer-b", shape: "pill", label: "Consumer B", colorIndex: 1, x: 460, y: 220 }),
    createTemplateNode({ id: "ed-notifications", shape: "pill", label: "Notification Service", colorIndex: 4, x: 700, y: 0 }),
    createTemplateNode({ id: "ed-analytics-db", shape: "cylinder", label: "Analytics DB", colorIndex: 6, x: 700, y: 220 }),
  ],
  edges: [
    createTemplateEdge("ed-e1", "ed-producer", "ed-bus"),
    createTemplateEdge("ed-e2", "ed-bus", "ed-consumer-a"),
    createTemplateEdge("ed-e3", "ed-bus", "ed-consumer-b"),
    createTemplateEdge("ed-e4", "ed-consumer-a", "ed-notifications"),
    createTemplateEdge("ed-e5", "ed-consumer-b", "ed-analytics-db"),
  ],
}

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  MICROSERVICES_TEMPLATE,
  CICD_TEMPLATE,
  EVENT_DRIVEN_TEMPLATE,
]
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `starter-templates.ts`.

- [ ] **Step 3: Commit**

```bash
git add components/editor/starter-templates.ts
git commit -m "feat: add starter canvas template data"
```

---

### Task 2: Lightweight preview (`components/editor/starter-template-preview.tsx`)

**Files:**
- Create: `components/editor/starter-template-preview.tsx`

**Interfaces:**
- Consumes: `CanvasTemplate` (Task 1), `NodeShapeVisual` (`components/editor/node-shape.tsx`, already presentational — no React Flow hooks, safe to reuse outside a `<ReactFlow>` tree), `SHAPE_DEFAULT_SIZES` from `@/types/canvas`.
- Produces: `StarterTemplatePreview({ template: CanvasTemplate })` — consumed by Task 3 (modal card).

- [ ] **Step 1: Write the file**

```tsx
import { NodeShapeVisual } from "@/components/editor/node-shape"
import type { CanvasTemplate } from "@/components/editor/starter-templates"
import { SHAPE_DEFAULT_SIZES, type CanvasNode } from "@/types/canvas"

const PREVIEW_WIDTH = 232
const PREVIEW_HEIGHT = 128
const PREVIEW_PADDING = 14

function getNodeSize(node: CanvasNode) {
  return {
    width: node.width ?? SHAPE_DEFAULT_SIZES[node.data.shape].width,
    height: node.height ?? SHAPE_DEFAULT_SIZES[node.data.shape].height,
  }
}

interface StarterTemplatePreviewProps {
  template: CanvasTemplate
}

export function StarterTemplatePreview({ template }: StarterTemplatePreviewProps) {
  const { nodes, edges } = template

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const node of nodes) {
    const { width, height } = getNodeSize(node)
    minX = Math.min(minX, node.position.x)
    minY = Math.min(minY, node.position.y)
    maxX = Math.max(maxX, node.position.x + width)
    maxY = Math.max(maxY, node.position.y + height)
  }

  const contentWidth = Math.max(maxX - minX, 1)
  const contentHeight = Math.max(maxY - minY, 1)
  const scale = Math.min(
    (PREVIEW_WIDTH - PREVIEW_PADDING * 2) / contentWidth,
    (PREVIEW_HEIGHT - PREVIEW_PADDING * 2) / contentHeight,
  )

  const offsetX = (PREVIEW_WIDTH - contentWidth * scale) / 2
  const offsetY = (PREVIEW_HEIGHT - contentHeight * scale) / 2

  const toPreviewX = (x: number) => (x - minX) * scale + offsetX
  const toPreviewY = (y: number) => (y - minY) * scale + offsetY

  const nodeById = new Map(nodes.map((node) => [node.id, node]))

  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-xl border border-surface-border bg-subtle"
      style={{ width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT }}
    >
      <svg width={PREVIEW_WIDTH} height={PREVIEW_HEIGHT} className="absolute inset-0">
        {edges.map((edge) => {
          const source = nodeById.get(edge.source)
          const target = nodeById.get(edge.target)
          if (!source || !target) return null

          const sourceSize = getNodeSize(source)
          const targetSize = getNodeSize(target)

          return (
            <line
              key={edge.id}
              x1={toPreviewX(source.position.x + sourceSize.width / 2)}
              y1={toPreviewY(source.position.y + sourceSize.height / 2)}
              x2={toPreviewX(target.position.x + targetSize.width / 2)}
              y2={toPreviewY(target.position.y + targetSize.height / 2)}
              stroke="var(--border-subtle)"
              strokeWidth={1}
            />
          )
        })}
      </svg>
      {nodes.map((node) => {
        const size = getNodeSize(node)

        return (
          <div
            key={node.id}
            className="absolute"
            style={{
              left: toPreviewX(node.position.x),
              top: toPreviewY(node.position.y),
              width: size.width * scale,
              height: size.height * scale,
            }}
          >
            <NodeShapeVisual shape={node.data.shape} color={node.data.color} />
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `starter-template-preview.tsx`.

- [ ] **Step 3: Commit**

```bash
git add components/editor/starter-template-preview.tsx
git commit -m "feat: add lightweight starter template preview"
```

---

### Task 3: Import context + modal

**Files:**
- Create: `components/editor/starter-templates-context.tsx`
- Create: `components/editor/starter-templates-modal.tsx`

**Interfaces:**
- Produces (context): `StarterTemplatesProvider`, `useStarterTemplatesContext()` returning `{ isTemplatesModalOpen, openTemplatesModal, closeTemplatesModal, registerImportHandler, importTemplate }`. `registerImportHandler(handler: ((template: CanvasTemplate) => void) | null)` — consumed by Task 4 (`CanvasFlow` registers the actual clear+import logic). `importTemplate(template)` — called by the modal's Import button; invokes the registered handler then closes the modal.
- Produces (modal): `StarterTemplatesModal()` (no props — reads everything from context) — consumed by Task 4 (mounted once in `EditorShell`).
- Consumes: `CANVAS_TEMPLATES`, `CanvasTemplate` (Task 1), `StarterTemplatePreview` (Task 2), `components/ui/dialog.tsx`, `components/ui/button.tsx`.

- [ ] **Step 1: Write the context**

```tsx
"use client"

import { createContext, useCallback, useContext, useRef, useState } from "react"

import type { CanvasTemplate } from "@/components/editor/starter-templates"

type ImportTemplateHandler = (template: CanvasTemplate) => void

interface StarterTemplatesContextValue {
  isTemplatesModalOpen: boolean
  openTemplatesModal: () => void
  closeTemplatesModal: () => void
  registerImportHandler: (handler: ImportTemplateHandler | null) => void
  importTemplate: (template: CanvasTemplate) => void
}

const StarterTemplatesContext = createContext<StarterTemplatesContextValue | null>(null)

export function StarterTemplatesProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false)
  const importHandlerRef = useRef<ImportTemplateHandler | null>(null)

  const openTemplatesModal = useCallback(() => setIsTemplatesModalOpen(true), [])
  const closeTemplatesModal = useCallback(() => setIsTemplatesModalOpen(false), [])

  const registerImportHandler = useCallback((handler: ImportTemplateHandler | null) => {
    importHandlerRef.current = handler
  }, [])

  const importTemplate = useCallback((template: CanvasTemplate) => {
    importHandlerRef.current?.(template)
    setIsTemplatesModalOpen(false)
  }, [])

  return (
    <StarterTemplatesContext.Provider
      value={{
        isTemplatesModalOpen,
        openTemplatesModal,
        closeTemplatesModal,
        registerImportHandler,
        importTemplate,
      }}
    >
      {children}
    </StarterTemplatesContext.Provider>
  )
}

export function useStarterTemplatesContext() {
  const context = useContext(StarterTemplatesContext)
  if (!context) {
    throw new Error(
      "useStarterTemplatesContext must be used within a StarterTemplatesProvider"
    )
  }
  return context
}
```

- [ ] **Step 2: Write the modal**

```tsx
"use client"

import { LayoutTemplate } from "lucide-react"

import { StarterTemplatePreview } from "@/components/editor/starter-template-preview"
import { useStarterTemplatesContext } from "@/components/editor/starter-templates-context"
import { CANVAS_TEMPLATES } from "@/components/editor/starter-templates"
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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Starter templates</DialogTitle>
          <DialogDescription>
            Import a prebuilt system design. This replaces everything currently on the canvas.
          </DialogDescription>
        </DialogHeader>

        <div className="grid max-h-[28rem] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
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
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing either new file.

- [ ] **Step 4: Commit**

```bash
git add components/editor/starter-templates-context.tsx components/editor/starter-templates-modal.tsx
git commit -m "feat: add starter templates modal and import context"
```

---

### Task 4: Wire into the editor (navbar entry point + canvas import)

**Files:**
- Modify: `components/editor/editor-shell.tsx`
- Modify: `components/editor/editor-navbar.tsx`
- Modify: `components/editor/collab-canvas.tsx`

**Interfaces:**
- Consumes: `StarterTemplatesProvider`, `useStarterTemplatesContext`, `StarterTemplatesModal` (Task 3).

- [ ] **Step 1: Mount the provider and modal in `editor-shell.tsx`**

Add the import and wrap the existing provider tree (same nesting level as `WorkspaceUiProvider`), and mount `<StarterTemplatesModal />` next to `<ShareDialog />`:

```tsx
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { ProjectDialogsProvider } from "@/components/editor/project-dialogs-context"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { ShareDialog } from "@/components/editor/share-dialog"
import { ShareDialogProvider } from "@/components/editor/share-dialog-context"
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal"
import { StarterTemplatesProvider } from "@/components/editor/starter-templates-context"
import { WorkspaceUiProvider } from "@/components/editor/workspace-ui-context"
```

```tsx
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
```

- [ ] **Step 2: Add the navbar entry point in `editor-navbar.tsx`**

Add the import:

```tsx
import { LayoutTemplate, PanelLeftClose, PanelLeftOpen, Share2, Sparkles } from "lucide-react"
```

```tsx
import { useStarterTemplatesContext } from "@/components/editor/starter-templates-context"
```

Inside the component, read the context:

```tsx
  const { openTemplatesModal } = useStarterTemplatesContext()
```

Add a button before the existing Share button (still inside the `project ? (...) : null` block, so it's only shown inside a workspace):

```tsx
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={openTemplatesModal}
            >
              <LayoutTemplate className="h-3.5 w-3.5" />
              Templates
            </Button>
```

- [ ] **Step 3: Import in `CanvasFlow` (`collab-canvas.tsx`)**

Add imports:

```tsx
import { useStarterTemplatesContext } from "@/components/editor/starter-templates-context"
import type { CanvasTemplate } from "@/components/editor/starter-templates"
```

Inside `CanvasFlow`, after the existing `nodes`/`edges`/`onNodesChange`/`onEdgesChange` destructure and after `reactFlowInstance` is defined, register the import handler:

```tsx
  const { registerImportHandler } = useStarterTemplatesContext()

  const handleImportTemplate = useCallback(
    (template: CanvasTemplate) => {
      onEdgesChange(edges.map((edge) => ({ type: "remove" as const, id: edge.id })))
      onNodesChange(nodes.map((node) => ({ type: "remove" as const, id: node.id })))
      onNodesChange(template.nodes.map((item) => ({ type: "add" as const, item })))
      onEdgesChange(template.edges.map((item) => ({ type: "add" as const, item })))
      requestAnimationFrame(() => reactFlowInstance.fitView({ duration: 200 }))
    },
    [nodes, edges, onNodesChange, onEdgesChange, reactFlowInstance],
  )

  useEffect(() => {
    registerImportHandler(handleImportTemplate)
    return () => registerImportHandler(null)
  }, [registerImportHandler, handleImportTemplate])
```

This mirrors the exact ordering the spec calls for — edges are cleared before their source/target nodes so nothing ever points at a removed node, nodes are cleared before the template's nodes are added, and the template's edges are added last (once their nodes already exist) — all through the same `onNodesChange`/`onEdgesChange` path `useLiveblocksFlow` already persists to Storage, so it stays inside the existing collaborative canvas state per the spec's wiring requirement.

- [ ] **Step 4: Typecheck, lint, build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: all three pass, no new errors/warnings.

- [ ] **Step 5: Manual verification**

Start the dev server (`npm run dev`), sign in, open a workspace, click "Templates" in the navbar, confirm the modal opens with 3 template cards each showing a small preview matching their node layout, click "Import" on one, and confirm the canvas clears and the template's nodes/edges appear and the view fits them. Repeat once to confirm importing a second template replaces the first rather than stacking on top of it.

- [ ] **Step 6: Commit**

```bash
git add components/editor/editor-shell.tsx components/editor/editor-navbar.tsx components/editor/collab-canvas.tsx
git commit -m "feat: wire starter templates into the editor navbar and canvas"
```

---

### Task 5: Update progress tracker

**Files:**
- Modify: `context/progress-tracker.md`

- [ ] **Step 1:** Add a "Feature 18 — Starter Templates" entry under `## Features`, mark it complete, and summarize what was built/decided/verified (same format as Features 01–17). Update `## Current Phase`, `## Current Goal`, and `## Next Up` to reflect that starter templates are now built (remove that line item from "Next Up").
