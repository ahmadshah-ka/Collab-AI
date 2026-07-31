"use client"

import { NodeShapeVisual } from "@/components/editor/node-shape"
import { DEFAULT_NODE_COLOR, type NodeShape } from "@/types/canvas"

export interface ShapeDragPreviewState {
  shape: NodeShape
  width: number
  height: number
}

interface ShapeDragPreviewProps {
  preview: ShapeDragPreviewState
  x: number
  y: number
}

export function ShapeDragPreview({ preview, x, y }: ShapeDragPreviewProps) {
  return (
    <div
      className="pointer-events-none fixed z-50 opacity-60"
      style={{
        left: x,
        top: y,
        width: preview.width,
        height: preview.height,
        transform: "translate(-50%, -50%)",
      }}
    >
      <NodeShapeVisual shape={preview.shape} color={DEFAULT_NODE_COLOR} />
    </div>
  )
}
