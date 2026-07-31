"use client"

import { useCallback, useRef, type DragEvent } from "react"
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MarkerType,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react"
import { Cursors, useLiveblocksFlow } from "@liveblocks/react-flow"

import { CanvasNodeRenderer } from "@/components/editor/canvas-node"
import { ShapePanel } from "@/components/editor/shape-panel"
import { DEFAULT_NODE_COLOR, SHAPE_DRAG_MIME_TYPE, type CanvasEdge, type CanvasNode, type ShapeDragPayload } from "@/types/canvas"

import "@xyflow/react/dist/style.css"
import "@liveblocks/react-ui/styles.css"
import "@liveblocks/react-ui/styles/dark/attributes.css"
import "@liveblocks/react-flow/styles.css"

const DEFAULT_EDGE_OPTIONS = {
  type: "smoothstep",
  style: { stroke: "#f8fafc", strokeWidth: 1 },
  markerEnd: { type: MarkerType.ArrowClosed, color: "#f8fafc" },
}

const NODE_TYPES = { canvasNode: CanvasNodeRenderer }

function CanvasFlow() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    })
  const { screenToFlowPosition } = useReactFlow()
  const nodeCounter = useRef(0)

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()

      const raw = event.dataTransfer.getData(SHAPE_DRAG_MIME_TYPE)
      if (!raw) return

      const payload = JSON.parse(raw) as ShapeDragPayload
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY })

      nodeCounter.current += 1
      const id = `${payload.shape}-${Date.now()}-${nodeCounter.current}`

      const newNode: CanvasNode = {
        id,
        type: "canvasNode",
        position,
        width: payload.width,
        height: payload.height,
        data: { label: "", color: DEFAULT_NODE_COLOR, shape: payload.shape },
      }

      onNodesChange([{ type: "add", item: newNode }])
    },
    [onNodesChange, screenToFlowPosition],
  )

  return (
    <div className="relative h-full w-full" onDragOver={handleDragOver} onDrop={handleDrop}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
        connectionMode={ConnectionMode.Loose}
        colorMode="dark"
        fitView
      >
        <Background variant={BackgroundVariant.Dots} />
        <MiniMap
          pannable
          zoomable
          maskColor="rgba(8, 8, 9, 0.6)"
          nodeColor="var(--border-subtle)"
          className="!m-3 !rounded-xl !border !border-surface-border !bg-surface"
        />
        <Cursors />
      </ReactFlow>
      <ShapePanel />
    </div>
  )
}

export function CollabCanvas() {
  return (
    <ReactFlowProvider>
      <CanvasFlow />
    </ReactFlowProvider>
  )
}
