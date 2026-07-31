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
  textColor: string
  shape: NodeShape
}

export type CanvasNode = Node<CanvasNodeData, "canvasNode">

export interface CanvasEdgeData extends Record<string, unknown> {
  label?: string
}

export type CanvasEdge = Edge<CanvasEdgeData, "canvasEdge">

export interface NodeColorPair {
  background: string
  text: string
}

// Order matches the "Node Color Palette" table in ui-context.md.
export const NODE_COLORS: NodeColorPair[] = [
  { background: "#1F1F1F", text: "#EDEDED" },
  { background: "#10233D", text: "#52A8FF" },
  { background: "#2E1938", text: "#BF7AF0" },
  { background: "#331B00", text: "#FF990A" },
  { background: "#3C1618", text: "#FF6166" },
  { background: "#3A1726", text: "#F75F8F" },
  { background: "#0F2E18", text: "#62C073" },
  { background: "#062822", text: "#0AC7B4" },
]

export const NODE_SHAPES: NodeShape[] = [
  "rectangle",
  "diamond",
  "circle",
  "pill",
  "cylinder",
  "hexagon",
]

export const DEFAULT_NODE_COLOR = NODE_COLORS[0].background
export const DEFAULT_NODE_TEXT_COLOR = NODE_COLORS[0].text

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
