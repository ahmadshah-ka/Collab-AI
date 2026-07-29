import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

import { Prisma } from "@/app/generated/prisma/client"
import type { Project } from "@/app/generated/prisma/client"
import { prisma } from "@/lib/prisma"

function isRecordNotFoundError(err: unknown) {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025"
  )
}

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

  try {
    const project = await prisma.project.update({
      where: { id: projectId },
      data: { name },
    })

    return NextResponse.json({ project })
  } catch (err) {
    if (isRecordNotFoundError(err)) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }
    throw err
  }
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

  try {
    await prisma.project.delete({ where: { id: projectId } })

    return new NextResponse(null, { status: 204 })
  } catch (err) {
    if (isRecordNotFoundError(err)) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }
    throw err
  }
}
