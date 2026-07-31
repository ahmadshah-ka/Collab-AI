"use client"

import type { DragEvent } from "react"
import { Circle, Cylinder, Diamond, Hexagon, Pill, RectangleHorizontal } from "lucide-react"

import { NODE_SHAPES, SHAPE_DEFAULT_SIZES, SHAPE_DRAG_MIME_TYPE, type NodeShape, type ShapeDragPayload } from "@/types/canvas"

// Transparent 1x1 gif used to suppress the browser's default drag-ghost screenshot,
// since we render our own shape-accurate ghost preview instead.
const BLANK_DRAG_IMAGE_SRC =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="

let blankDragImage: HTMLImageElement | null = null

function getBlankDragImage() {
  if (!blankDragImage) {
    blankDragImage = new Image()
    blankDragImage.src = BLANK_DRAG_IMAGE_SRC
  }
  return blankDragImage
}

const SHAPE_ICONS: Record<NodeShape, typeof RectangleHorizontal> = {
  rectangle: RectangleHorizontal,
  diamond: Diamond,
  circle: Circle,
  pill: Pill,
  cylinder: Cylinder,
  hexagon: Hexagon,
}

const SHAPE_LABELS: Record<NodeShape, string> = {
  rectangle: "Rectangle",
  diamond: "Diamond",
  circle: "Circle",
  pill: "Pill",
  cylinder: "Cylinder",
  hexagon: "Hexagon",
}

interface ShapePanelProps {
  onShapeDragStart?: (shape: NodeShape, width: number, height: number, x: number, y: number) => void
  onShapeDragEnd?: () => void
}

export function ShapePanel({ onShapeDragStart, onShapeDragEnd }: ShapePanelProps) {
  const handleDragStart = (event: DragEvent<HTMLButtonElement>, shape: NodeShape) => {
    const { width, height } = SHAPE_DEFAULT_SIZES[shape]
    const payload: ShapeDragPayload = { shape, width, height }

    event.dataTransfer.setData(SHAPE_DRAG_MIME_TYPE, JSON.stringify(payload))
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setDragImage(getBlankDragImage(), 0, 0)

    onShapeDragStart?.(shape, width, height, event.clientX, event.clientY)
  }

  return (
    <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-surface-border bg-surface/95 p-2 shadow-lg backdrop-blur">
      {NODE_SHAPES.map((shape) => {
        const Icon = SHAPE_ICONS[shape]

        return (
          <button
            key={shape}
            type="button"
            draggable
            onDragStart={(event) => handleDragStart(event, shape)}
            onDragEnd={() => onShapeDragEnd?.()}
            title={SHAPE_LABELS[shape]}
            aria-label={SHAPE_LABELS[shape]}
            className="flex h-9 w-9 cursor-grab items-center justify-center rounded-full text-copy-secondary transition-colors hover:bg-accent-dim hover:text-brand active:cursor-grabbing"
          >
            <Icon className="h-4 w-4" />
          </button>
        )
      })}
    </div>
  )
}
