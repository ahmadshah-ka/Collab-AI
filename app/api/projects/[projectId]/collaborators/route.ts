import { auth, currentUser } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

import { Prisma, type Project } from "@/app/generated/prisma/client"
import {
  enrichCollaborators,
  enrichProjectOwner,
  toAccessPeople,
} from "@/lib/collaborators"
import { prisma } from "@/lib/prisma"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const EDITOR_LAYOUT_PATH = "/editor"

interface ProjectMembership {
  project: Project
  isOwner: boolean
  isCollaborator: boolean
}

async function getProjectMembership(
  projectId: string,
  userId: string,
  email: string | null
): Promise<ProjectMembership | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      collaborators: { where: { email: email ?? "" }, take: 1 },
    },
  })

  if (!project) {
    return null
  }

  const isOwner = project.ownerId === userId
  const isCollaborator = project.collaborators.length > 0

  if (!isOwner && !isCollaborator) {
    return null
  }

  return { project, isOwner, isCollaborator }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await currentUser()
  const email = user?.primaryEmailAddress?.emailAddress.toLowerCase() ?? null
  const { projectId } = await params
  const membership = await getProjectMembership(projectId, userId, email)

  if (!membership) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  const collaborators = await prisma.projectCollaborator.findMany({
    where: { projectId: membership.project.id },
    orderBy: { createdAt: "asc" },
  })
  const [owner, enrichedCollaborators] = await Promise.all([
    enrichProjectOwner(membership.project),
    enrichCollaborators(collaborators),
  ])

  return NextResponse.json({
    canManage: membership.isOwner,
    peopleWithAccess: toAccessPeople(owner, enrichedCollaborators),
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId } = await params
  const project = await prisma.project.findUnique({ where: { id: projectId } })

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  if (project.ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""

  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json(
      { error: "A valid email address is required" },
      { status: 400 }
    )
  }

  const user = await currentUser()
  const ownerEmail = user?.primaryEmailAddress?.emailAddress.toLowerCase()

  if (ownerEmail === email) {
    return NextResponse.json(
      { error: "Owners already have access" },
      { status: 400 }
    )
  }

  try {
    const collaborator = await prisma.projectCollaborator.create({
      data: { projectId: project.id, email },
    })

    revalidatePath(EDITOR_LAYOUT_PATH, "layout")

    const [enrichedCollaborator] = await enrichCollaborators([collaborator])

    return NextResponse.json(
      {
        collaborator: {
          ...enrichedCollaborator,
          role: "collaborator" as const,
        },
      },
      { status: 201 }
    )
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Collaborator already has access" },
        { status: 409 }
      )
    }

    throw err
  }
}
