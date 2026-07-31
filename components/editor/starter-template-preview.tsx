import { NodeShapeVisual } from "@/components/editor/node-shape"
import type { CanvasTemplate } from "@/components/editor/starter-templates"
import { SHAPE_DEFAULT_SIZES, type CanvasNode } from "@/types/canvas"

// A virtual coordinate space matching the container's `aspect-[8/5]` class below.
// Positions/sizes are computed in these units, then expressed as percentages of
// this box — so the preview scales uniformly (no shape distortion) to whatever
// width its grid column actually renders at, without a resize observer.
const VIEW_WIDTH = 320
const VIEW_HEIGHT = 200
const VIEW_PADDING = 20

function getNodeSize(node: CanvasNode) {
  return {
    width: node.width ?? SHAPE_DEFAULT_SIZES[node.data.shape].width,
    height: node.height ?? SHAPE_DEFAULT_SIZES[node.data.shape].height,
  }
}

interface StarterTemplatePreviewProps {
  template: CanvasTemplate
}

export function StarterTemplatePreview({ template }: StarterTemplatePreviewProps) {
  const { nodes, edges } = template

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const node of nodes) {
    const { width, height } = getNodeSize(node)
    minX = Math.min(minX, node.position.x)
    minY = Math.min(minY, node.position.y)
    maxX = Math.max(maxX, node.position.x + width)
    maxY = Math.max(maxY, node.position.y + height)
  }

  const contentWidth = Math.max(maxX - minX, 1)
  const contentHeight = Math.max(maxY - minY, 1)
  const scale = Math.min(
    (VIEW_WIDTH - VIEW_PADDING * 2) / contentWidth,
    (VIEW_HEIGHT - VIEW_PADDING * 2) / contentHeight,
  )

  const offsetX = (VIEW_WIDTH - contentWidth * scale) / 2
  const offsetY = (VIEW_HEIGHT - contentHeight * scale) / 2

  const toViewX = (x: number) => (x - minX) * scale + offsetX
  const toViewY = (y: number) => (y - minY) * scale + offsetY
  const toPercentX = (x: number) => `${(x / VIEW_WIDTH) * 100}%`
  const toPercentY = (y: number) => `${(y / VIEW_HEIGHT) * 100}%`

  const nodeById = new Map(nodes.map((node) => [node.id, node]))

  return (
    <div className="relative aspect-[8/5] w-full overflow-hidden rounded-xl border border-surface-border bg-subtle">
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        {edges.map((edge) => {
          const source = nodeById.get(edge.source)
          const target = nodeById.get(edge.target)
          if (!source || !target) return null

          const sourceSize = getNodeSize(source)
          const targetSize = getNodeSize(target)

          return (
            <line
              key={edge.id}
              x1={toViewX(source.position.x + sourceSize.width / 2)}
              y1={toViewY(source.position.y + sourceSize.height / 2)}
              x2={toViewX(target.position.x + targetSize.width / 2)}
              y2={toViewY(target.position.y + targetSize.height / 2)}
              stroke="var(--border-subtle)"
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
            />
          )
        })}
      </svg>
      {nodes.map((node) => {
        const size = getNodeSize(node)
        const left = toViewX(node.position.x)
        const top = toViewY(node.position.y)

        return (
          <div
            key={node.id}
            className="absolute"
            style={{
              left: toPercentX(left),
              top: toPercentY(top),
              width: toPercentX(size.width * scale),
              height: toPercentY(size.height * scale),
            }}
          >
            <NodeShapeVisual shape={node.data.shape} color={node.data.color} />
          </div>
        )
      })}
    </div>
  )
}
