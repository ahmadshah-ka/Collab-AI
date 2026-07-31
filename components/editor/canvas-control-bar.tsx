"use client"

import { Maximize2, Redo2, Undo2, ZoomIn, ZoomOut } from "lucide-react"
import type { ReactFlowInstance } from "@xyflow/react"

const ZOOM_DURATION = 200

const BUTTON_CLASS =
  "flex h-9 w-9 items-center justify-center rounded-full text-copy-secondary transition-colors hover:bg-accent-dim hover:text-brand disabled:pointer-events-none disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-copy-secondary"

interface CanvasControlBarProps {
  reactFlowInstance: ReactFlowInstance
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
}

export function CanvasControlBar({ reactFlowInstance, canUndo, canRedo, onUndo, onRedo }: CanvasControlBarProps) {
  return (
    <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1 rounded-full border border-surface-border bg-surface/95 p-2 shadow-lg backdrop-blur">
      <button
        type="button"
        title="Zoom out"
        aria-label="Zoom out"
        className={BUTTON_CLASS}
        onClick={() => reactFlowInstance.zoomOut({ duration: ZOOM_DURATION })}
      >
        <ZoomOut className="h-4 w-4" />
      </button>
      <button
        type="button"
        title="Fit view"
        aria-label="Fit view"
        className={BUTTON_CLASS}
        onClick={() => reactFlowInstance.fitView({ duration: ZOOM_DURATION })}
      >
        <Maximize2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        title="Zoom in"
        aria-label="Zoom in"
        className={BUTTON_CLASS}
        onClick={() => reactFlowInstance.zoomIn({ duration: ZOOM_DURATION })}
      >
        <ZoomIn className="h-4 w-4" />
      </button>

      <div className="mx-1 h-5 w-px bg-subtle-border" />

      <button
        type="button"
        title="Undo"
        aria-label="Undo"
        disabled={!canUndo}
        className={BUTTON_CLASS}
        onClick={onUndo}
      >
        <Undo2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        title="Redo"
        aria-label="Redo"
        disabled={!canRedo}
        className={BUTTON_CLASS}
        onClick={onRedo}
      >
        <Redo2 className="h-4 w-4" />
      </button>
    </div>
  )
}
