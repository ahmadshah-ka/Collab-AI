import { MarkerType } from "@xyflow/react"

import { NODE_COLORS, SHAPE_DEFAULT_SIZES, type CanvasEdge, type CanvasNode, type NodeShape } from "@/types/canvas"

export interface CanvasTemplate {
  id: string
  name: string
  description: string
  nodes: CanvasNode[]
  edges: CanvasEdge[]
}

interface TemplateNodeSpec {
  id: string
  shape: NodeShape
  label: string
  colorIndex: number
  x: number
  y: number
}

function createTemplateNode({ id, shape, label, colorIndex, x, y }: TemplateNodeSpec): CanvasNode {
  const { width, height } = SHAPE_DEFAULT_SIZES[shape]
  const { background, text } = NODE_COLORS[colorIndex]

  return {
    id,
    type: "canvasNode",
    position: { x, y },
    width,
    height,
    data: { label, color: background, textColor: text, shape },
  }
}

function createTemplateEdge(id: string, source: string, target: string, label?: string): CanvasEdge {
  return {
    id,
    type: "canvasEdge",
    source,
    target,
    markerEnd: { type: MarkerType.ArrowClosed, color: "#f8fafc" },
    data: { label },
  }
}

const MICROSERVICES_TEMPLATE: CanvasTemplate = {
  id: "microservices",
  name: "Microservices",
  description: "An API gateway routing to independent services, each backed by its own database.",
  nodes: [
    createTemplateNode({ id: "ms-gateway", shape: "hexagon", label: "API Gateway", colorIndex: 2, x: 260, y: 0 }),
    createTemplateNode({ id: "ms-auth", shape: "pill", label: "Auth Service", colorIndex: 1, x: 0, y: 180 }),
    createTemplateNode({ id: "ms-users", shape: "pill", label: "Users Service", colorIndex: 1, x: 220, y: 180 }),
    createTemplateNode({ id: "ms-orders", shape: "pill", label: "Orders Service", colorIndex: 1, x: 440, y: 180 }),
    createTemplateNode({ id: "ms-users-db", shape: "cylinder", label: "Users DB", colorIndex: 6, x: 220, y: 340 }),
    createTemplateNode({ id: "ms-orders-db", shape: "cylinder", label: "Orders DB", colorIndex: 6, x: 440, y: 340 }),
  ],
  edges: [
    createTemplateEdge("ms-e1", "ms-gateway", "ms-auth"),
    createTemplateEdge("ms-e2", "ms-gateway", "ms-users"),
    createTemplateEdge("ms-e3", "ms-gateway", "ms-orders"),
    createTemplateEdge("ms-e4", "ms-users", "ms-users-db"),
    createTemplateEdge("ms-e5", "ms-orders", "ms-orders-db"),
  ],
}

const CICD_TEMPLATE: CanvasTemplate = {
  id: "cicd-pipeline",
  name: "CI/CD Pipeline",
  description: "A linear pipeline from source push through build, test, and deploy to production.",
  nodes: [
    createTemplateNode({ id: "cicd-push", shape: "circle", label: "Git Push", colorIndex: 5, x: 0, y: 40 }),
    createTemplateNode({ id: "cicd-build", shape: "rectangle", label: "Build", colorIndex: 3, x: 200, y: 20 }),
    createTemplateNode({ id: "cicd-test", shape: "rectangle", label: "Test", colorIndex: 3, x: 420, y: 20 }),
    createTemplateNode({ id: "cicd-deploy", shape: "rectangle", label: "Deploy", colorIndex: 3, x: 640, y: 20 }),
    createTemplateNode({ id: "cicd-prod", shape: "hexagon", label: "Production", colorIndex: 2, x: 860, y: 0 }),
  ],
  edges: [
    createTemplateEdge("cicd-e1", "cicd-push", "cicd-build"),
    createTemplateEdge("cicd-e2", "cicd-build", "cicd-test"),
    createTemplateEdge("cicd-e3", "cicd-test", "cicd-deploy"),
    createTemplateEdge("cicd-e4", "cicd-deploy", "cicd-prod"),
  ],
}

const EVENT_DRIVEN_TEMPLATE: CanvasTemplate = {
  id: "event-driven",
  name: "Event-Driven System",
  description: "A producer publishes events through a broker to independent consumers.",
  nodes: [
    createTemplateNode({ id: "ed-producer", shape: "pill", label: "Producer Service", colorIndex: 1, x: 0, y: 120 }),
    createTemplateNode({ id: "ed-bus", shape: "hexagon", label: "Event Bus", colorIndex: 7, x: 220, y: 100 }),
    createTemplateNode({ id: "ed-consumer-a", shape: "pill", label: "Consumer A", colorIndex: 1, x: 460, y: 0 }),
    createTemplateNode({ id: "ed-consumer-b", shape: "pill", label: "Consumer B", colorIndex: 1, x: 460, y: 220 }),
    createTemplateNode({ id: "ed-notifications", shape: "pill", label: "Notification Service", colorIndex: 4, x: 700, y: 0 }),
    createTemplateNode({ id: "ed-analytics-db", shape: "cylinder", label: "Analytics DB", colorIndex: 6, x: 700, y: 220 }),
  ],
  edges: [
    createTemplateEdge("ed-e1", "ed-producer", "ed-bus"),
    createTemplateEdge("ed-e2", "ed-bus", "ed-consumer-a"),
    createTemplateEdge("ed-e3", "ed-bus", "ed-consumer-b"),
    createTemplateEdge("ed-e4", "ed-consumer-a", "ed-notifications"),
    createTemplateEdge("ed-e5", "ed-consumer-b", "ed-analytics-db"),
  ],
}

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  MICROSERVICES_TEMPLATE,
  CICD_TEMPLATE,
  EVENT_DRIVEN_TEMPLATE,
]
