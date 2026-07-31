"use client"

import {
  useCallback,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react"
import { EdgeLabelRenderer, getSmoothStepPath, useReactFlow, type EdgeProps } from "@xyflow/react"

import type { CanvasEdge, CanvasNode } from "@/types/canvas"

const EDGE_STROKE_COLOR = "#f8fafc"
const EDGE_STROKE_WIDTH = 1.5
const EDGE_REST_OPACITY = 0.55
const EDGE_ACTIVE_OPACITY = 1
const EDGE_HIT_AREA_WIDTH = 24

export function CanvasEdgeRenderer({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  selected,
  data,
}: EdgeProps<CanvasEdge>) {
  const { updateEdgeData } = useReactFlow<CanvasNode, CanvasEdge>()
  const [isHovered, setIsHovered] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 0,
  })

  const isActive = isHovered || !!selected
  const label = data?.label ?? ""

  const startEditing = useCallback((event: ReactMouseEvent) => {
    event.stopPropagation()
    setIsEditing(true)
  }, [])

  const stopEditing = useCallback(() => setIsEditing(false), [])

  const handleLabelChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      updateEdgeData(id, { label: event.target.value })
    },
    [id, updateEdgeData],
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter" || event.key === "Escape") {
        event.stopPropagation()
        stopEditing()
      }
    },
    [stopEditing],
  )

  return (
    <>
      <path
        d={edgePath}
        fill="none"
        markerEnd={markerEnd}
        style={{
          stroke: style?.stroke ?? EDGE_STROKE_COLOR,
          strokeWidth: EDGE_STROKE_WIDTH,
          strokeLinecap: "round",
          opacity: isActive ? EDGE_ACTIVE_OPACITY : EDGE_REST_OPACITY,
          transition: "opacity 150ms ease",
          pointerEvents: "none",
        }}
      />
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={EDGE_HIT_AREA_WIDTH}
        className="cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDoubleClick={startEditing}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
          className="nodrag nopan pointer-events-auto"
        >
          {isEditing ? (
            <input
              autoFocus
              type="text"
              value={label}
              size={Math.max(label.length, 1)}
              placeholder="Label"
              onChange={handleLabelChange}
              onBlur={stopEditing}
              onKeyDown={handleKeyDown}
              onClick={(event) => event.stopPropagation()}
              className="min-w-[2ch] max-w-[16rem] rounded-full border border-brand bg-surface px-2 py-0.5 text-center text-[10px] text-copy-primary outline-none"
            />
          ) : label ? (
            <div
              onDoubleClick={startEditing}
              className="cursor-text whitespace-nowrap rounded-full border border-surface-border bg-surface/95 px-2 py-0.5 text-[10px] text-copy-secondary shadow-sm"
            >
              {label}
            </div>
          ) : isActive ? (
            <div
              onDoubleClick={startEditing}
              className="cursor-text whitespace-nowrap rounded-full border border-dashed border-subtle-border px-2 py-0.5 text-[10px] text-copy-faint"
            >
              Add label
            </div>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
