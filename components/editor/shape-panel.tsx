"use client"

import type { DragEvent } from "react"
import { Circle, Cylinder, Diamond, Hexagon, Pill, RectangleHorizontal } from "lucide-react"

import { NODE_SHAPES, SHAPE_DEFAULT_SIZES, SHAPE_DRAG_MIME_TYPE, type NodeShape, type ShapeDragPayload } from "@/types/canvas"

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

export function ShapePanel() {
  const handleDragStart = (event: DragEvent<HTMLButtonElement>, shape: NodeShape) => {
    const { width, height } = SHAPE_DEFAULT_SIZES[shape]
    const payload: ShapeDragPayload = { shape, width, height }

    event.dataTransfer.setData(SHAPE_DRAG_MIME_TYPE, JSON.stringify(payload))
    event.dataTransfer.effectAllowed = "move"
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
