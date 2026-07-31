"use client"

import type { CSSProperties } from "react"
import { NodeToolbar, Position } from "@xyflow/react"

import { cn } from "@/lib/utils"
import { NODE_COLORS } from "@/types/canvas"

interface NodeColorToolbarProps {
  isVisible: boolean
  activeColor: string
  onSelect: (background: string, text: string) => void
}

export function NodeColorToolbar({ isVisible, activeColor, onSelect }: NodeColorToolbarProps) {
  return (
    <NodeToolbar
      isVisible={isVisible}
      position={Position.Top}
      offset={12}
      className="nodrag nopan flex items-center gap-1.5 rounded-full border border-surface-border bg-surface/95 p-1.5 shadow-lg backdrop-blur"
    >
      {NODE_COLORS.map((pair) => {
        const isActive = activeColor === pair.background

        return (
          <button
            key={pair.background}
            type="button"
            onClick={() => onSelect(pair.background, pair.text)}
            aria-label={`Set node color pair with ${pair.text} text`}
            aria-pressed={isActive}
            style={{ backgroundColor: pair.background, "--swatch-glow": pair.text } as CSSProperties}
            className={cn(
              "h-5 w-5 shrink-0 rounded-full border transition-[box-shadow,transform] duration-150 hover:scale-110 hover:shadow-[0_0_6px_var(--swatch-glow)]",
              isActive
                ? "border-copy-primary ring-2 ring-brand ring-offset-2 ring-offset-surface"
                : "border-surface-border",
            )}
          />
        )
      })}
    </NodeToolbar>
  )
}
