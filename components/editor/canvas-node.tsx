"use client"

import { useCallback, useState, type ChangeEvent, type KeyboardEvent, type MouseEvent } from "react"
import { Handle, NodeResizer, Position, useReactFlow, type NodeProps } from "@xyflow/react"

import { NodeColorToolbar } from "@/components/editor/node-color-toolbar"
import { NodeShapeVisual } from "@/components/editor/node-shape"
import { DEFAULT_NODE_TEXT_COLOR, type CanvasNode } from "@/types/canvas"

const HANDLE_CLASS =
  "!h-2.5 !w-2.5 !border !border-base !bg-copy-primary !opacity-0 transition-opacity group-hover:!opacity-100"

const RESIZE_HANDLE_CLASS = "!h-2.5 !w-2.5 !rounded-[2px] !border !border-brand !bg-surface"
const RESIZE_LINE_CLASS = "!border !border-surface-border"

const MIN_NODE_WIDTH = 56
const MIN_NODE_HEIGHT = 40

export function CanvasNodeRenderer({ id, data, selected }: NodeProps<CanvasNode>) {
  const { updateNodeData } = useReactFlow<CanvasNode>()
  const [isEditing, setIsEditing] = useState(false)
  const textColor = data.textColor ?? DEFAULT_NODE_TEXT_COLOR

  const startEditing = useCallback((event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
    setIsEditing(true)
  }, [])

  const stopEditing = useCallback(() => setIsEditing(false), [])

  const handleLabelChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      updateNodeData(id, { label: event.target.value })
    },
    [id, updateNodeData],
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Escape") {
        event.stopPropagation()
        stopEditing()
      }
    },
    [stopEditing],
  )

  const handleColorSelect = useCallback(
    (color: string, textColor: string) => {
      updateNodeData(id, { color, textColor })
    },
    [id, updateNodeData],
  )

  return (
    <div className="group relative h-full w-full">
      <NodeColorToolbar isVisible={!!selected} activeColor={data.color} onSelect={handleColorSelect} />
      <NodeResizer
        isVisible={selected}
        minWidth={MIN_NODE_WIDTH}
        minHeight={MIN_NODE_HEIGHT}
        handleClassName={RESIZE_HANDLE_CLASS}
        lineClassName={RESIZE_LINE_CLASS}
      />
      <NodeShapeVisual shape={data.shape} color={data.color} selected={selected} />
      {isEditing ? (
        <div className="absolute inset-0 flex items-center justify-center px-3">
          <textarea
            autoFocus
            rows={1}
            value={data.label}
            placeholder="Label"
            onChange={handleLabelChange}
            onBlur={stopEditing}
            onKeyDown={handleKeyDown}
            style={{ color: textColor }}
            className="nodrag nopan max-h-full w-full resize-none border-none bg-transparent text-center text-xs leading-snug outline-none placeholder:text-copy-faint"
          />
        </div>
      ) : (
        <div
          onDoubleClick={startEditing}
          style={{ color: textColor }}
          className="absolute inset-0 flex items-center justify-center px-3 text-center text-xs"
        >
          {data.label || <span className="text-copy-faint">Label</span>}
        </div>
      )}
      <Handle type="source" position={Position.Top} id="top" className={HANDLE_CLASS} />
      <Handle type="source" position={Position.Right} id="right" className={HANDLE_CLASS} />
      <Handle type="source" position={Position.Bottom} id="bottom" className={HANDLE_CLASS} />
      <Handle type="source" position={Position.Left} id="left" className={HANDLE_CLASS} />
    </div>
  )
}
