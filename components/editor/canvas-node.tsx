"use client"

import { Handle, Position, type NodeProps } from "@xyflow/react"

import type { CanvasNode } from "@/types/canvas"

const HANDLE_CLASS =
  "!h-2.5 !w-2.5 !border !border-copy-primary !bg-copy-primary !opacity-0 transition-opacity group-hover:!opacity-100"

export function CanvasNodeRenderer({ data }: NodeProps<CanvasNode>) {
  return (
    <div
      className="group flex h-full w-full items-center justify-center rounded-md border border-surface-border px-2 text-center text-xs text-copy-primary"
      style={{ backgroundColor: data.color }}
    >
      <Handle type="source" position={Position.Top} id="top" className={HANDLE_CLASS} />
      <Handle type="source" position={Position.Right} id="right" className={HANDLE_CLASS} />
      <Handle type="source" position={Position.Bottom} id="bottom" className={HANDLE_CLASS} />
      <Handle type="source" position={Position.Left} id="left" className={HANDLE_CLASS} />
      {data.label}
    </div>
  )
}
