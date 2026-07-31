import type { Edge, Node } from "@xyflow/react"

export type NodeShape =
  | "rectangle"
  | "diamond"
  | "circle"
  | "pill"
  | "cylinder"
  | "hexagon"

export interface CanvasNodeData extends Record<string, unknown> {
  label: string
  color: string
  shape: NodeShape
}

export type CanvasNode = Node<CanvasNodeData, "canvasNode">
export type CanvasEdge = Edge<Record<string, unknown>, "canvasEdge">

export const NODE_SHAPES: NodeShape[] = [
  "rectangle",
  "diamond",
  "circle",
  "pill",
  "cylinder",
  "hexagon",
]

export const DEFAULT_NODE_COLOR = "#1F1F1F"

export const SHAPE_DEFAULT_SIZES: Record<NodeShape, { width: number; height: number }> = {
  rectangle: { width: 160, height: 88 },
  diamond: { width: 170, height: 170 },
  circle: { width: 100, height: 100 },
  pill: { width: 150, height: 56 },
  cylinder: { width: 110, height: 130 },
  hexagon: { width: 150, height: 100 },
}

export const SHAPE_DRAG_MIME_TYPE = "application/x-canvas-shape"

export interface ShapeDragPayload {
  shape: NodeShape
  width: number
  height: number
}
