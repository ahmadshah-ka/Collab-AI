import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

import { Prisma, type Project } from "@/app/generated/prisma/client"
import { prisma } from "@/lib/prisma"

async function requireOwnedProject(
  projectId: string,
  userId: string
): Promise<Project | NextResponse> {
  const project = await prisma.project.findUnique({ where: { id: projectId } })

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  if (project.ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return project
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId } = await params
  const owned = await requireOwnedProject(projectId, userId)

  if (owned instanceof NextResponse) {
    return owned
  }

  const body = await request.json().catch(() => ({}))
  const name = typeof body?.name === "string" ? body.name.trim() : ""

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }

  const project = await prisma.project
    .update({
      where: { id: projectId, ownerId: userId },
      data: { name },
    })
    .catch((err) => {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        return null
      }

      throw err
    })

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  return NextResponse.json({ project })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId } = await params
  const owned = await requireOwnedProject(projectId, userId)

  if (owned instanceof NextResponse) {
    return owned
  }

  const { count } = await prisma.project.deleteMany({
    where: { id: projectId, ownerId: userId },
  })

  if (count === 0) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  return new NextResponse(null, { status: 204 })
}
