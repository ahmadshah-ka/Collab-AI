"use client"

import { useCallback, useEffect, useRef, useState, type DragEvent } from "react"
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react"
import { Cursors, useLiveblocksFlow } from "@liveblocks/react-flow"
import { useCanRedo, useCanUndo, useRedo, useRoom, useUndo } from "@liveblocks/react"

import { CanvasControlBar } from "@/components/editor/canvas-control-bar"
import { CanvasEdgeRenderer } from "@/components/editor/canvas-edge"
import { CanvasNodeRenderer } from "@/components/editor/canvas-node"
import { ShapeDragPreview, type ShapeDragPreviewState } from "@/components/editor/shape-drag-preview"
import { ShapePanel } from "@/components/editor/shape-panel"
import type { CanvasTemplate } from "@/components/editor/starter-templates"
import { useStarterTemplatesContext } from "@/components/editor/starter-templates-context"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import {
  DEFAULT_NODE_COLOR,
  DEFAULT_NODE_TEXT_COLOR,
  SHAPE_DRAG_MIME_TYPE,
  type CanvasEdge,
  type CanvasNode,
  type NodeShape,
  type ShapeDragPayload,
} from "@/types/canvas"

import "@xyflow/react/dist/style.css"
import "@liveblocks/react-ui/styles.css"
import "@liveblocks/react-ui/styles/dark/attributes.css"
import "@liveblocks/react-flow/styles.css"

const DEFAULT_EDGE_OPTIONS = {
  type: "canvasEdge",
  markerEnd: { type: MarkerType.ArrowClosed, color: "#f8fafc" },
}

const NODE_TYPES = { canvasNode: CanvasNodeRenderer }
const EDGE_TYPES = { canvasEdge: CanvasEdgeRenderer }

function CanvasFlow() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    })
  const reactFlowInstance = useReactFlow()
  const { screenToFlowPosition } = reactFlowInstance
  const nodeCounter = useRef(0)
  const room = useRoom()

  const undo = useUndo()
  const redo = useRedo()
  const canUndo = useCanUndo()
  const canRedo = useCanRedo()

  useKeyboardShortcuts({ reactFlowInstance, undo, redo })

  const { registerImportHandler } = useStarterTemplatesContext()

  const handleImportTemplate = useCallback(
    (template: CanvasTemplate) => {
      room.batch(() => {
        onDelete({ nodes, edges })
        onNodesChange(template.nodes.map((item) => ({ type: "add" as const, item })))
        onEdgesChange(template.edges.map((item) => ({ type: "add" as const, item })))
      })
      requestAnimationFrame(() => reactFlowInstance.fitView({ duration: 200 }))
    },
    [nodes, edges, onDelete, onNodesChange, onEdgesChange, reactFlowInstance, room],
  )

  useEffect(() => {
    registerImportHandler(handleImportTemplate)
    return () => registerImportHandler(null)
  }, [registerImportHandler, handleImportTemplate])

  const [dragPreview, setDragPreview] = useState<ShapeDragPreviewState | null>(null)
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 })

  const handleShapeDragStart = useCallback(
    (shape: NodeShape, width: number, height: number, x: number, y: number) => {
      setDragPreview({ shape, width, height })
      setDragPosition({ x, y })
    },
    [],
  )

  const handleShapeDragEnd = useCallback(() => {
    setDragPreview(null)
  }, [])

  useEffect(() => {
    if (!dragPreview) return

    const handleWindowDragOver = (event: globalThis.DragEvent) => {
      setDragPosition({ x: event.clientX, y: event.clientY })
    }

    window.addEventListener("dragover", handleWindowDragOver)
    return () => window.removeEventListener("dragover", handleWindowDragOver)
  }, [dragPreview])

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
        data: { label: "", color: DEFAULT_NODE_COLOR, textColor: DEFAULT_NODE_TEXT_COLOR, shape: payload.shape },
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
        edgeTypes={EDGE_TYPES}
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
        <Cursors />
      </ReactFlow>
      <CanvasControlBar
        reactFlowInstance={reactFlowInstance}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
      />
      <ShapePanel onShapeDragStart={handleShapeDragStart} onShapeDragEnd={handleShapeDragEnd} />
      {dragPreview && <ShapeDragPreview preview={dragPreview} x={dragPosition.x} y={dragPosition.y} />}
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
