import { cn } from "@/lib/utils"
import type { NodeShape } from "@/types/canvas"

interface NodeShapeVisualProps {
  shape: NodeShape
  color: string
  selected?: boolean
  className?: string
}

const CSS_SHAPE_RADIUS: Record<"rectangle" | "pill" | "circle", string> = {
  rectangle: "rounded-md",
  pill: "rounded-full",
  circle: "rounded-full",
}

export function NodeShapeVisual({ shape, color, selected, className }: NodeShapeVisualProps) {
  const borderColor = selected ? "var(--accent-primary)" : "var(--border-default)"
  const borderWidth = selected ? 1.5 : 1

  if (shape === "rectangle" || shape === "pill" || shape === "circle") {
    return (
      <div
        className={cn("h-full w-full", CSS_SHAPE_RADIUS[shape], className)}
        style={{ backgroundColor: color, border: `${borderWidth}px solid ${borderColor}` }}
      />
    )
  }

  if (shape === "diamond") {
    return (
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={cn("h-full w-full overflow-visible", className)}>
        <polygon
          points="50,4 96,50 50,96 4,50"
          fill={color}
          stroke={borderColor}
          strokeWidth={borderWidth}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    )
  }

  if (shape === "hexagon") {
    return (
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={cn("h-full w-full overflow-visible", className)}>
        <polygon
          points="27,4 73,4 98,50 73,96 27,96 2,50"
          fill={color}
          stroke={borderColor}
          strokeWidth={borderWidth}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" preserveAspectRatio="none" className={cn("h-full w-full overflow-visible", className)}>
      <path
        d="M3 5v14a9 3 0 0 0 18 0V5"
        fill={color}
        stroke={borderColor}
        strokeWidth={0.75}
        vectorEffect="non-scaling-stroke"
      />
      <ellipse cx="12" cy="5" rx="9" ry="3" fill={color} stroke={borderColor} strokeWidth={0.75} vectorEffect="non-scaling-stroke" />
      <path
        d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"
        fill="none"
        stroke={borderColor}
        strokeWidth={0.75}
        opacity={0.6}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
